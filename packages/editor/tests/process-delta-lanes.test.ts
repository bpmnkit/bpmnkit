import {
	Bpmn,
	type BpmnBounds,
	type BpmnDefinitions,
	expand,
	laneProblems,
	parseProcessDelta,
	parseProcessText,
	primaryProcess,
	writeProcessText,
} from "@bpmnkit/core"
import { describe, expect, it } from "vitest"
import { createIdFactory } from "../src/id.js"
import { applyProcessDelta } from "../src/process-delta.js"
import {
	boundsOf,
	expectSwimlanesSound,
	expectUnmoved,
	fixture,
	hasEdge,
	hasShape,
	inBand,
	laneNamed,
	lanesOf,
	messageFlows,
	participants,
} from "./swimlane-helpers.js"

const LOAN = `# Loan
start[start Application received] > check[xor Amount over 10k?]
check >(Yes: amount > 10000) review[user Review application] > pay[service Pay out | job=payout] > done[end Paid]
check >(No: default) auto[service Approve automatically | job=approve] > pay`

function apply(defs: BpmnDefinitions, script: string) {
	const { aliases } = writeProcessText(defs)
	return applyProcessDelta(defs, parseProcessDelta(script), {
		aliases,
		ids: createIdFactory("lanes"),
	})
}

describe("applyProcessDelta lanes and pools: 08-flowable-lanes-pools.bpmn", () => {
	const file = "08-flowable-lanes-pools.bpmn"

	it("moves a node to another lane, into that lane's band, keeping x", () => {
		const defs = fixture(file)
		const result = apply(defs, "lane operations: review")
		expect(result.problems).toEqual([])
		const next = result.definitions
		expect(laneNamed(next, "Lane_ops")?.flowNodeRefs).toContain("review")
		expect(laneNamed(next, "Lane_inside")?.flowNodeRefs).not.toContain("review")
		expect(laneNamed(next, "Lane_sales")?.flowNodeRefs).not.toContain("review")
		expect(inBand(boundsOf(next, "review"), boundsOf(next, "Lane_ops"))).toBe(true)
		expect(boundsOf(next, "review").x).toBe(boundsOf(defs, "review").x)
		expect(result.changed).toContain("review")
		expectUnmoved(defs, next, ["review"])
		expectSwimlanesSound(next)
	})

	it("leaves a node already in the lane alone", () => {
		const defs = fixture(file)
		const result = apply(defs, "lane operations: ship, done")
		expect(result.definitions).toEqual(defs)
		expect(result.changed).toEqual([])
	})

	it("renames a lane, name only", () => {
		const defs = fixture(file)
		const result = apply(defs, "lane operations[Ops team]:")
		expect(result.problems).toEqual([])
		expect(laneNamed(result.definitions, "Lane_ops")?.name).toBe("Ops team")
		expect(laneNamed(result.definitions, "Lane_ops")?.flowNodeRefs).toEqual(
			laneNamed(defs, "Lane_ops")?.flowNodeRefs,
		)
		expect(result.changed).toContain("Lane_ops")
		expectUnmoved(defs, result.definitions, [])
	})

	it("refuses a lane line naming a parent lane, and changes nothing for it", () => {
		const defs = fixture(file)
		const result = apply(defs, "lane Lane_sales[Renamed]: ship")
		expect(result.problems.map((p) => p.message).join()).toMatch(/Lane_sales/)
		expect(result.definitions).toEqual(defs)
	})

	it("adds a lane at the bottom of the pool, moving everything below down", () => {
		const defs = fixture(file)
		const result = apply(defs, "lane billing[Billing]: ship")
		expect(result.problems).toEqual([])
		const next = result.definitions
		expect(result.created).toContain("billing")
		const billing = laneNamed(next, "billing")
		expect(billing?.name).toBe("Billing")
		expect(billing?.flowNodeRefs).toEqual(["ship"])
		expect(primaryProcess(next)?.laneSet?.lanes.map((l) => l.id)).toEqual([
			"Lane_sales",
			"Lane_ops",
			"billing",
		])
		const pool = boundsOf(defs, "Participant_company")
		const band = boundsOf(next, "billing")
		expect(boundsOf(next, "Participant_company").height).toBe(pool.height + band.height)
		expect(band).toEqual({ x: 30, y: pool.y + pool.height, width: 690, height: band.height })
		expect(inBand(boundsOf(next, "ship"), band)).toBe(true)
		// The partner pool below moved down by the band, and the message still reaches it.
		const customer = boundsOf(next, "Participant_customer")
		expect(customer.y).toBe(boundsOf(defs, "Participant_customer").y + band.height)
		const edge = next.diagrams[0]?.plane.edges.find((e) => e.bpmnElement === "MessageFlow_confirm")
		expect(edge?.waypoints.at(-1)?.y).toBe(customer.y)
		expect(edge?.waypoints[0]?.y).toBe(boundsOf(next, "ship").y + boundsOf(next, "ship").height)
		expectUnmoved(defs, next, ["ship", "Participant_company", "Participant_customer"])
		expectSwimlanesSound(next)
	})

	it("removes a lane: the lane above absorbs its band and its nodes", () => {
		const defs = fixture(file)
		const result = apply(defs, "- operations")
		expect(result.problems).toEqual([])
		const next = result.definitions
		expect(laneNamed(next, "Lane_ops")).toBeUndefined()
		expect(hasShape(next, "Lane_ops")).toBe(false)
		// The lane above is a parent: it and its bottom leaf take the band.
		const removed = boundsOf(defs, "Lane_ops").height
		expect(boundsOf(next, "Lane_sales").height).toBe(boundsOf(defs, "Lane_sales").height + removed)
		expect(boundsOf(next, "Lane_desk").height).toBe(boundsOf(defs, "Lane_desk").height + removed)
		expect(laneNamed(next, "Lane_desk")?.flowNodeRefs).toEqual(
			expect.arrayContaining(["ship", "rejected", "done"]),
		)
		expectUnmoved(defs, next, ["Lane_sales", "Lane_desk", "Lane_ops"])
		expectSwimlanesSound(next)
	})

	it("adds a partner pool and a message to it, then removes the message, then the pool", () => {
		const defs = fixture(file)
		const added = apply(defs, "pool bank[Bank]\nmsg ship >(Invoice) bank")
		expect(added.problems).toEqual([])
		const next = added.definitions
		const bank = participants(next).find((p) => p.id === "bank")
		expect(bank).toEqual({ id: "bank", name: "Bank", unknownAttributes: {} })
		const own = boundsOf(next, "Participant_company")
		const lowest = boundsOf(defs, "Participant_customer")
		expect(boundsOf(next, "bank")).toEqual({
			x: own.x,
			y: lowest.y + lowest.height + 30,
			width: own.width,
			height: 60,
		})
		const flow = messageFlows(next).find((f) => f.targetRef === "bank")
		expect(flow).toMatchObject({ sourceRef: "ship", name: "Invoice" })
		expect(added.created).toEqual(expect.arrayContaining(["bank", flow?.id]))
		const edge = next.diagrams[0]?.plane.edges.find((e) => e.bpmnElement === flow?.id)
		const ship = boundsOf(next, "ship")
		expect(edge?.waypoints).toEqual([
			{ x: ship.x + ship.width / 2, y: ship.y + ship.height },
			{ x: ship.x + ship.width / 2, y: boundsOf(next, "bank").y },
		])
		expectUnmoved(defs, next, [])
		expectSwimlanesSound(next)

		const unsent = apply(next, "- msg ship > bank")
		expect(unsent.problems).toEqual([])
		expect(messageFlows(unsent.definitions).some((f) => f.id === flow?.id)).toBe(false)
		expect(hasEdge(unsent.definitions, flow?.id ?? "")).toBe(false)

		const gone = apply(unsent.definitions, "- bank")
		expect(gone.problems).toEqual([])
		expect(participants(gone.definitions).some((p) => p.id === "bank")).toBe(false)
		expect(hasShape(gone.definitions, "bank")).toBe(false)
		expectSwimlanesSound(gone.definitions)
	})

	it("removes a message the diagram had, and reports one it does not have", () => {
		const defs = fixture(file)
		const result = apply(defs, "- msg ship > customer\n- msg done > customer")
		expect(result.problems.map((p) => p.line)).toEqual([2])
		expect(messageFlows(result.definitions)).toEqual([])
		expect(hasEdge(result.definitions, "MessageFlow_confirm")).toBe(false)
	})

	it("removing a pool removes its messages too", () => {
		const defs = fixture(file)
		const step = apply(defs, "pool bank[Bank]\nmsg bank > review")
		expect(step.problems).toEqual([])
		const result = apply(step.definitions, "- bank")
		expect(result.problems).toEqual([])
		expect(messageFlows(result.definitions).map((f) => f.id)).toEqual(["MessageFlow_confirm"])
		expectSwimlanesSound(result.definitions)
	})

	it("refuses to remove the own pool or a pool that draws a process", () => {
		const defs = fixture(file)
		const result = apply(defs, "- customer\n- Participant_company")
		expect(result.problems.map((p) => p.line)).toEqual([1, 2])
		expect(result.definitions).toEqual(defs)
	})

	it("renames a pool, and a pool line restating one changes nothing", () => {
		const defs = fixture(file)
		expect(apply(defs, "pool customer").definitions).toEqual(defs)
		const result = apply(defs, "pool customer[Client]")
		expect(
			participants(result.definitions).find((p) => p.id === "Participant_customer")?.name,
		).toBe("Client")
	})

	it("refuses messages the event rules forbid, and restating one changes nothing", () => {
		const defs = fixture(file)
		const script = [
			"msg start > customer",
			"msg decide > customer",
			"msg customer > done",
			"msg ship > review",
			"msg nowhere > customer",
			"msg ship >(Confirmation) customer",
		].join("\n")
		const result = apply(defs, script)
		expect(result.problems.map((p) => p.line)).toEqual([1, 2, 3, 4, 5])
		expect(result.definitions).toEqual(defs)
	})

	it("hands the nodes of a parent's last child lane to the parent", () => {
		const defs = fixture(file)
		const result = apply(defs, "- sales_desk\n- inside_sales")
		expect(result.problems).toEqual([])
		const sales = laneNamed(result.definitions, "Lane_sales")
		expect(sales?.childLaneSet).toBeUndefined()
		expect(sales?.flowNodeRefs).toEqual(expect.arrayContaining(["start", "review", "decide"]))
		expect(hasShape(result.definitions, "Lane_inside")).toBe(false)
		expect(boundsOf(result.definitions, "Lane_sales")).toEqual(boundsOf(defs, "Lane_sales"))
		expectSwimlanesSound(result.definitions)
	})

	it("relabels a message the diagram has", () => {
		const defs = fixture(file)
		const result = apply(defs, "msg ship >(Shipping notice) customer")
		expect(result.problems).toEqual([])
		expect(messageFlows(result.definitions)[0]?.name).toBe("Shipping notice")
		expect(result.changed).toEqual(["ship"])
	})

	it("reports lane lines it cannot follow, and does the rest", () => {
		const defs = fixture(file)
		const script = [
			"lane customer: ship",
			"pool operations[Ops]",
			"lane operations: nowhere, review",
		].join("\n")
		const result = apply(defs, script)
		expect(result.problems.map((p) => p.line)).toEqual([1, 2, 3])
		expect(laneNamed(result.definitions, "Lane_ops")?.name).toBe("Operations")
		expect(laneNamed(result.definitions, "Lane_ops")?.flowNodeRefs).toContain("review")
	})

	it("drops a message flow, and its edge, whose node the script removed", () => {
		const defs = fixture(file)
		const result = apply(defs, "- ship")
		expect(messageFlows(result.definitions)).toEqual([])
		expect(hasEdge(result.definitions, "MessageFlow_confirm")).toBe(false)
		expectSwimlanesSound(result.definitions)
	})

	it("puts a new node with no lane under its shape in its predecessor's lane", () => {
		const defs = fixture(file)
		// The insert lands right of review, inside Inside sales; the side branch below everything.
		const result = apply(defs, "done > after[task After] > late[end Late]")
		expect(result.problems).toEqual([])
		const process = primaryProcess(result.definitions)
		if (!process) throw new Error("no process")
		expect(laneProblems(process)).toEqual([])
		expect(laneNamed(result.definitions, "Lane_ops")?.flowNodeRefs).toEqual(
			expect.arrayContaining(["after", "late"]),
		)
	})
})

describe("applyProcessDelta lanes and pools: 02-collaboration.bpmn", () => {
	const file = "02-collaboration.bpmn"

	it("is left exactly as it was by its own restatement", () => {
		const defs = fixture(file)
		const result = apply(defs, writeProcessText(defs).text)
		expect(result.problems).toEqual([])
		expect(result.definitions).toEqual(defs)
	})

	it("moves a node to another lane", () => {
		const defs = fixture(file)
		const result = apply(defs, "lane receiving: place_order")
		expect(result.problems).toEqual([])
		const next = result.definitions
		expect(laneNamed(next, "Lane_receiving")?.flowNodeRefs).toContain("Task_place_order")
		expect(inBand(boundsOf(next, "Task_place_order"), boundsOf(next, "Lane_receiving"))).toBe(true)
		expectUnmoved(defs, next, ["Task_place_order"])
		expectSwimlanesSound(next)
	})

	it("adds a lane, moving the pools below down by its band", () => {
		const defs = fixture(file)
		const result = apply(defs, "lane shipping: ordered")
		expect(result.problems).toEqual([])
		const next = result.definitions
		expect(laneNamed(next, "shipping")?.name).toBe("Shipping")
		const band = boundsOf(next, "shipping").height
		for (const id of ["Participant_seller", "Start_seller", "End_seller", "Participant_carrier"]) {
			expect(boundsOf(next, id).y, id).toBe(boundsOf(defs, id).y + band)
		}
		expectSwimlanesSound(next)
	})

	it("renames a lane", () => {
		const result = apply(fixture(file), "lane receiving[Goods in]:")
		expect(laneNamed(result.definitions, "Lane_receiving")?.name).toBe("Goods in")
	})

	it("removes the first lane: the lane below absorbs it", () => {
		const defs = fixture(file)
		const result = apply(defs, "- ordering")
		expect(result.problems).toEqual([])
		const next = result.definitions
		const kept = boundsOf(next, "Lane_receiving")
		const removed = boundsOf(defs, "Lane_ordering")
		expect(kept.y).toBe(removed.y)
		expect(kept.height).toBe(removed.height + boundsOf(defs, "Lane_receiving").height)
		expect(laneNamed(next, "Lane_receiving")?.flowNodeRefs).toEqual(
			expect.arrayContaining(["Start_buyer", "Task_place_order", "End_buyer"]),
		)
		expectSwimlanesSound(next)
	})

	it("removes the last lane, its lane set and its shape, and keeps the pool", () => {
		const defs = fixture(file)
		const result = apply(defs, "- ordering\n- receiving")
		expect(result.problems).toEqual([])
		const next = result.definitions
		expect(primaryProcess(next)?.laneSet).toBeUndefined()
		expect(hasShape(next, "Lane_receiving")).toBe(false)
		expect(hasShape(next, "Participant_buyer")).toBe(true)
		expectSwimlanesSound(next)
	})

	it("adds a pool and a message, removes the message, removes the pool", () => {
		const defs = fixture(file)
		const added = apply(defs, "pool bank[Bank]\nmsg place_order >(Pay) bank")
		expect(added.problems).toEqual([])
		expectSwimlanesSound(added.definitions)
		const flow = messageFlows(added.definitions).find((f) => f.targetRef === "bank")
		expect(flow?.sourceRef).toBe("Task_place_order")
		const unsent = apply(added.definitions, "- msg place_order > bank")
		expect(messageFlows(unsent.definitions).some((f) => f.id === flow?.id)).toBe(false)
		const gone = apply(unsent.definitions, "- bank")
		expect(gone.problems).toEqual([])
		expect(participants(gone.definitions).map((p) => p.id)).toEqual(
			participants(defs).map((p) => p.id),
		)
	})

	it("removes a black-box pool, and refuses one that draws a process", () => {
		const defs = fixture(file)
		const result = apply(defs, "- carrier\n- seller")
		expect(result.problems.map((p) => p.line)).toEqual([2])
		expect(participants(result.definitions).map((p) => p.id)).toEqual([
			"Participant_buyer",
			"Participant_seller",
		])
		expect(hasShape(result.definitions, "Participant_carrier")).toBe(false)
	})
})

describe("applyProcessDelta lanes and pools: a diagram without them", () => {
	const drawn = () => Bpmn.parse(Bpmn.export(expand(parseProcessText(LOAN).diagram)))

	it("draws a pool around the process and puts every node in the first lane", () => {
		const defs = drawn()
		expect(defs.collaborations).toEqual([])
		const result = apply(defs, "lane a[A]: review")
		expect(result.problems).toEqual([])
		const next = result.definitions
		const collaboration = next.collaborations[0]
		const pool = collaboration?.participants[0]
		expect(pool?.processRef).toBe(primaryProcess(next)?.id)
		expect(next.diagrams[0]?.plane.bpmnElement).toBe(collaboration?.id)
		const nodes = primaryProcess(next)?.flowElements.map((el) => el.id) ?? []
		expect(laneNamed(next, "a")?.flowNodeRefs.sort()).toEqual([...nodes].sort())
		expect(result.created).toContain("a")
		expect(result.fixes).toContain('put "start", which no lane named, in lane a')
		expect(result.fixes.join()).not.toMatch(/"review"/)
		const outer = boundsOf(next, pool?.id ?? "")
		const lane = boundsOf(next, "a")
		expect(lane).toEqual({
			x: outer.x + 30,
			y: outer.y,
			width: outer.width - 30,
			height: outer.height,
		})
		for (const id of nodes) {
			const b = boundsOf(next, id)
			expect(b.x >= lane.x && b.x + b.width <= lane.x + lane.width, id).toBe(true)
			expect(b.y >= lane.y && b.y + b.height <= lane.y + lane.height, id).toBe(true)
		}
		expectUnmoved(defs, next, [])
		expectSwimlanesSound(next)
		expect(Bpmn.parse(Bpmn.export(next)).collaborations[0]?.participants).toHaveLength(1)
	})

	it("adds a band for each later lane of the same script", () => {
		const defs = drawn()
		const result = apply(defs, "lane a[A]: review\nlane b[B]: pay")
		expect(result.problems).toEqual([])
		const next = result.definitions
		expect(laneNamed(next, "b")?.flowNodeRefs).toEqual(["pay"])
		expect(laneNamed(next, "a")?.flowNodeRefs).not.toContain("pay")
		expect(inBand(boundsOf(next, "pay"), boundsOf(next, "b"))).toBe(true)
		expect(result.fixes.join()).not.toMatch(/"pay"/)
		expectSwimlanesSound(next)
	})

	it("adds a partner pool below the process, with the pool of its own drawn first", () => {
		const defs = drawn()
		const result = apply(defs, "pool bank\nmsg pay > bank")
		expect(result.problems).toEqual([])
		const next = result.definitions
		expect(participants(next).map((p) => p.name)).toEqual(["Loan", "Bank"])
		expect(messageFlows(next)).toHaveLength(1)
		expectSwimlanesSound(next)
	})

	it("never nests a new lane", () => {
		const result = apply(drawn(), "lane a: review\nlane b: auto")
		const lanes = primaryProcess(result.definitions)?.laneSet?.lanes ?? []
		expect(lanes.map((l) => [l.id, l.childLaneSet])).toEqual([
			["a", undefined],
			["b", undefined],
		])
	})
})

/** The shape of `id` on whichever diagram draws it, and how many shapes it has in all. */
function shapesOf(defs: BpmnDefinitions, id: string) {
	return defs.diagrams.flatMap((d) => d.plane.shapes.filter((s) => s.bpmnElement === id))
}

function drawnBounds(defs: BpmnDefinitions, id: string): BpmnBounds {
	const shape = shapesOf(defs, id)[0]
	if (!shape) throw new Error(`no shape for ${id}`)
	return shape.bounds
}

/**
 * The top-level lanes of the primary process tile its pool from top to bottom,
 * with no gap or overlap past the few pixels some test files are already off by.
 */
function expectLanesTile(defs: BpmnDefinitions, poolId: string): void {
	const near = (actual: number, expected: number) =>
		expect(Math.abs(actual - expected), `${actual} near ${expected}`).toBeLessThanOrEqual(3)
	const pool = drawnBounds(defs, poolId)
	const bands = (primaryProcess(defs)?.laneSet?.lanes ?? [])
		.map((lane) => drawnBounds(defs, lane.id))
		.sort((a, b) => a.y - b.y)
	let y = pool.y
	for (const band of bands) {
		near(band.y, y)
		y = band.y + band.height
	}
	near(y, pool.y + pool.height)
}

/** Every node a leaf lane lists is drawn with its centre in that lane's band. */
function expectNodesInTheirLanes(defs: BpmnDefinitions): void {
	for (const lane of lanesOf(defs).filter((l) => !l.childLaneSet?.lanes.length)) {
		const band = drawnBounds(defs, lane.id)
		for (const ref of lane.flowNodeRefs) {
			if (shapesOf(defs, ref).length === 0) continue
			expect(inBand(drawnBounds(defs, ref), band), `${ref} in ${lane.id}`).toBe(true)
		}
	}
}

/** Whether `point` lies on `b` or within `slack` of it. */
function touches(b: BpmnBounds, point: { x: number; y: number }, slack = 2): boolean {
	return (
		point.x >= b.x - slack &&
		point.x <= b.x + b.width + slack &&
		point.y >= b.y - slack &&
		point.y <= b.y + b.height + slack
	)
}

/** Every message edge that starts or ends on one of `ids` still starts or ends on its shape. */
function expectMessagesAttached(defs: BpmnDefinitions, ids: string[]): void {
	const edges = defs.diagrams.flatMap((d) => d.plane.edges)
	for (const flow of messageFlows(defs)) {
		const edge = edges.find((e) => e.bpmnElement === flow.id)
		if (!edge) continue
		const first = edge.waypoints[0]
		const last = edge.waypoints.at(-1)
		if (ids.includes(flow.sourceRef) && first) {
			expect(touches(drawnBounds(defs, flow.sourceRef), first), `${flow.id} from`).toBe(true)
		}
		if (ids.includes(flow.targetRef) && last) {
			expect(touches(drawnBounds(defs, flow.targetRef), last), `${flow.id} to`).toBe(true)
		}
	}
}

describe("applyProcessDelta lanes and pools: review findings", () => {
	it("restates a lane that lists a boundary event without a problem", () => {
		const text = `${LOAN}\nreview > late[boundary:timer Two days | on=review] > esc[end Escalated]`
		const drawn = Bpmn.parse(Bpmn.export(expand(parseProcessText(text).diagram)))
		const laned = apply(drawn, "lane a[A]: start\nlane b[B]: review").definitions
		expect(laneNamed(laned, "b")?.flowNodeRefs).toContain("late")
		const result = apply(laned, writeProcessText(laned).text)
		expect(result.problems).toEqual([])
		expect(result.definitions).toEqual(laned)
	})

	it("lets a lane line list a boundary event before its host", () => {
		const text = `${LOAN}\nreview > late[boundary:timer Two days | on=review] > esc[end Escalated]`
		const drawn = Bpmn.parse(Bpmn.export(expand(parseProcessText(text).diagram)))
		const laned = apply(drawn, "lane a[A]: start\nlane b[B]: review").definitions
		const result = apply(laned, "lane a: late, review")
		expect(result.problems).toEqual([])
		expect(laneNamed(result.definitions, "a")?.flowNodeRefs).toEqual(
			expect.arrayContaining(["review", "late"]),
		)
	})

	it.each(["approver", "team_assistant", "accountant"])(
		"miwg-C.1.0: removing lane %s hands its band to the lane drawn next to it",
		(lane) => {
			const defs = fixture("miwg-C.1.0.bpmn")
			const result = apply(defs, `- ${lane}`)
			expect(result.problems).toEqual([])
			expectLanesTile(result.definitions, "Process_Engine_1")
			expectNodesInTheirLanes(result.definitions)
		},
	)

	it("miwg-C.10.0: removing a lane hands its band to the lane drawn next to it", () => {
		const defs = fixture("miwg-C.10.0.bpmn")
		const result = apply(defs, "- employee")
		expect(result.problems).toEqual([])
		expectLanesTile(result.definitions, "_7")
		expectNodesInTheirLanes(result.definitions)
	})

	it("miwg-C.1.0: a node moved to another lane keeps its messages to another pool's nodes", () => {
		const defs = fixture("miwg-C.1.0.bpmn")
		const result = apply(defs, "lane approver: assign_approver")
		expect(result.problems).toEqual([])
		expectNodesInTheirLanes(result.definitions)
		expectMessagesAttached(result.definitions, ["assignApprover"])
	})

	it("miwg-A.4.1: a node moved into a new lane keeps its messages", () => {
		const defs = fixture("miwg-A.4.1.bpmn")
		const { aliases } = writeProcessText(defs)
		const result = apply(defs, "lane x: task_1")
		expect(result.problems).toEqual([])
		expectMessagesAttached(result.definitions, [aliases.task_1 ?? "task_1"])
	})

	/** Every segment of the message edges touching `ids` is horizontal or vertical. */
	function expectMessagesOrthogonal(defs: BpmnDefinitions, ids: string[]): void {
		const edges = defs.diagrams.flatMap((d) => d.plane.edges)
		const touching = messageFlows(defs).filter(
			(f) => ids.includes(f.sourceRef) || ids.includes(f.targetRef),
		)
		expect(touching.length).toBeGreaterThan(0)
		for (const flow of touching) {
			const points = edges.find((e) => e.bpmnElement === flow.id)?.waypoints ?? []
			for (let k = 1; k < points.length; k++) {
				const [a, b] = [points[k - 1], points[k]]
				expect(a?.x === b?.x || a?.y === b?.y, `${flow.id} segment ${k}`).toBe(true)
			}
		}
	}

	it.each([
		["02-collaboration.bpmn", "place_order", "seller"],
		["miwg-A.4.1.bpmn", "task_1", "pool_2"],
		["miwg-C.10.0.bpmn", "record_meeting_details", "client"],
		["miwg-C.2.0.bpmn", "take_payment", "carrier"],
	])(
		"%s: a new message to a pool that does not span the node stays on both",
		(file, node, pool) => {
			const defs = fixture(file)
			const { aliases } = writeProcessText(defs)
			const result = apply(defs, `msg ${node} > ${pool}`)
			expect(result.problems).toEqual([])
			const nodeId = aliases[node] ?? node
			const poolId = aliases[pool] ?? pool
			const flow = messageFlows(result.definitions).find(
				(f) => f.sourceRef === nodeId && f.targetRef === poolId,
			)
			const points =
				result.definitions.diagrams
					.flatMap((d) => d.plane.edges)
					.find((e) => e.bpmnElement === flow?.id)?.waypoints ?? []
			const [first, last] = [points[0], points.at(-1)]
			expect(first && touches(drawnBounds(result.definitions, nodeId), first, 0.5)).toBe(true)
			expect(last && touches(drawnBounds(result.definitions, poolId), last, 0.5)).toBe(true)
			expectMessagesOrthogonal(result.definitions, [nodeId])
		},
	)

	it("miwg-A.4.1: a horizontal message keeps its right angles when its node changes lane", () => {
		const defs = fixture("miwg-A.4.1.bpmn")
		const { aliases } = writeProcessText(defs)
		const result = apply(defs, "lane zzl: task_1")
		expect(result.problems).toEqual([])
		expectMessagesOrthogonal(result.definitions, [aliases.task_1 ?? "task_1"])
	})

	it("08: a boundary event that moves with its host keeps its message", () => {
		const defs = fixture("08-flowable-lanes-pools.bpmn")
		const step = apply(defs, "b1[boundary:message | on=review]\nmsg customer > b1")
		expect(step.problems).toEqual([])
		const result = apply(step.definitions, "lane operations: review")
		expect(result.problems).toEqual([])
		expectMessagesAttached(result.definitions, ["b1"])
	})

	it.each([
		["miwg-C.5.0.bpmn", "lane x: interview_customer"],
		["miwg-C.5.0.bpmn", "pool bank"],
		["miwg-B.1.0.bpmn", "lane a: x"],
	])("%s: `%s` leaves the other processes and their pools alone", (file, script) => {
		const defs = fixture(file)
		const next = apply(defs, script).definitions
		const own = primaryProcess(defs)?.id
		for (const process of defs.processes.filter((p) => p.id !== own)) {
			expect(next.processes.find((p) => p.id === process.id)).toEqual(process)
		}
		const before = new Set(participants(defs).map((p) => p.id))
		for (const p of participants(next).filter((candidate) => !before.has(candidate.id))) {
			expect(p.processRef === undefined || p.processRef === own, p.id).toBe(true)
			expect(shapesOf(next, p.id), p.id).toHaveLength(1)
		}
	})

	describe("miwg-C.10.0, whose process is drawn on its second diagram", () => {
		const file = "miwg-C.10.0.bpmn"

		it("adds a lane to the pool that is drawn, not a second one", () => {
			const defs = fixture(file)
			const result = apply(defs, "lane x: check_client_request")
			expect(result.problems).toEqual([])
			const next = result.definitions
			expect(next.diagrams.map((d) => d.plane.bpmnElement)).toEqual(
				defs.diagrams.map((d) => d.plane.bpmnElement),
			)
			expect(shapesOf(next, "_7")).toHaveLength(1)
			expectLanesTile(next, "_7")
			expectNodesInTheirLanes(next)
		})

		it("adds a pool and a message with an edge", () => {
			const defs = fixture(file)
			const result = apply(defs, "pool bank\nmsg plan_trip > bank")
			expect(result.problems).toEqual([])
			const next = result.definitions
			expect(next.diagrams.map((d) => d.plane.bpmnElement)).toEqual(
				defs.diagrams.map((d) => d.plane.bpmnElement),
			)
			const flow = messageFlows(next).find((f) => f.targetRef === "bank")
			const edges = next.diagrams.flatMap((d) => d.plane.edges)
			expect(edges.some((e) => e.bpmnElement === flow?.id)).toBe(true)
		})

		it("moves a node's shape into the lane it is moved to", () => {
			const defs = fixture(file)
			const result = apply(defs, "lane employee: check_client_request")
			expect(result.problems).toEqual([])
			expectNodesInTheirLanes(result.definitions)
		})
	})
})
