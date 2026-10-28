/**
 * WP8b structure: the first pool, black-box partners and new lanes, as ops,
 * and edits that copy only what they change. Every op runs through the
 * Flowable guard.
 */
import {
	Bpmn,
	type BpmnDefinitions,
	collaborationProblems,
	parseProcessDelta,
	primaryProcess,
	writeProcessText,
} from "@bpmnkit/core"
import { describe, expect, it } from "vitest"
import { createIdFactory } from "../src/id.js"
import { createEmptyDefinitions } from "../src/modeling.js"
import { type EditorOp, applyOp } from "../src/ops.js"
import { applyProcessDelta } from "../src/process-delta.js"
import {
	LANE_BAND_HEIGHT,
	POOL_HEADER,
	blackBoxBounds,
	canAddLane,
	canDivideLanes,
	newPoolBounds,
	primaryFirst,
} from "../src/swimlanes.js"
import {
	boundsOf,
	documentOrder,
	expectFlowableKept,
	expectSwimlanesSound,
	expectUnmoved,
	fixture,
	flowableFixture,
	inBand,
	laneNamed,
	lanesOf,
	lockedPartnerXml,
	participants,
	poolLessFlowable,
	poolLessWithOther,
	verticalPoolXml,
} from "./swimlane-helpers.js"

const FIXTURE_08 = "08-flowable-lanes-pools.bpmn"

/** Applies `op` and holds it to the Flowable guard. */
function run(defs: BpmnDefinitions, op: EditorOp) {
	const r = applyOp(defs, op)
	expectFlowableKept(defs, r.defs)
	return r
}

/** `op` changes nothing: the very same document, and nothing created. */
function expectRefused(defs: BpmnDefinitions, op: EditorOp): void {
	const r = applyOp(defs, op)
	expect(r.defs, JSON.stringify(op)).toBe(defs)
	expect(r.created).toEqual([])
}

/** The lane refs of every lane, by lane id. */
function refsOf(defs: BpmnDefinitions): Record<string, string[]> {
	return Object.fromEntries(lanesOf(defs).map((lane) => [lane.id, lane.flowNodeRefs]))
}

/** The top-level lane bands of the primary process tile `poolId` exactly, top to bottom. */
function expectTiled(file: BpmnDefinitions, poolId: string): void {
	const defs = primaryFirst(file)
	const pool = boundsOf(defs, poolId)
	const bands = (primaryProcess(defs)?.laneSet?.lanes ?? [])
		.map((lane) => boundsOf(defs, lane.id))
		.sort((a, b) => a.y - b.y)
	let y = pool.y
	for (const band of bands) {
		expect(band).toEqual({
			x: pool.x + POOL_HEADER,
			y,
			width: pool.width - POOL_HEADER,
			height: band.height,
		})
		y += band.height
	}
	expect(y).toBe(pool.y + pool.height)
}

const add = (bounds = { x: 0, y: 700, width: 640, height: 60 }, name?: string): EditorOp => ({
	kind: "addParticipant",
	bounds,
	...(name === undefined ? {} : { name }),
	seed: "pool",
})

describe("8b.1 the first pool wraps the process", () => {
	it("wraps a lane-free Flowable process: collaboration, participant, rebound plane", () => {
		const defs = poolLessFlowable(false)
		const r = run(defs, add({ x: 900, y: 900, width: 100, height: 60 }))
		const [poolId, collaborationId] = r.created
		const collaboration = r.defs.collaborations[0]
		expect(collaboration?.id).toBe(collaborationId)
		expect(collaboration?.participants).toEqual([
			{ id: poolId, processRef: "Process_exec", unknownAttributes: {} },
		])
		expect(r.defs.diagrams[0]?.plane.bpmnElement).toBe(collaborationId)
		// Drawn around the content, not where the op asked: the nodes are not moved.
		const pool = boundsOf(r.defs, poolId ?? "")
		for (const id of ["Start_1", "Task_review", "Gateway_ok", "Task_pay", "End_1"]) {
			const b = boundsOf(r.defs, id)
			expect(b.x > pool.x + POOL_HEADER && b.x + b.width < pool.x + pool.width, id).toBe(true)
			expect(b.y > pool.y && b.y + b.height < pool.y + pool.height, id).toBe(true)
		}
		expect(r.defs.diagrams[0]?.plane.shapes[0]?.bpmnElement).toBe(poolId)
		expectUnmoved(defs, r.defs, [])
		expect(r.defs.processes[0]).toBe(defs.processes[0])
		expectSwimlanesSound(r.defs)
		const xml = Bpmn.export(r.defs)
		expect(xml).toContain('processRef="Process_exec"')
		expect(xml).toContain('isExecutable="true"')
		expect(xml).toContain('flowable:candidateStarterGroups="sales"')
		const back = Bpmn.parse(xml)
		expect(participants(back).map((p) => p.id)).toEqual([poolId])
	})

	it("frames the lane bands of a laned process with no pool exactly", () => {
		const defs = poolLessFlowable(true)
		const r = run(defs, add(undefined, "Company"))
		const poolId = r.created[0] ?? ""
		expect(participants(r.defs)[0]?.name).toBe("Company")
		expectTiled(r.defs, poolId)
		expectUnmoved(defs, r.defs, [])
		expect(refsOf(r.defs)).toEqual(refsOf(defs))
		expectSwimlanesSound(r.defs)
	})

	// The change scripts share poolPrimary: before WP8b their pool was poolAround the
	// nodes, so the auto-layout's bands stuck out of it and a new band went in off them.
	it.each([
		["lane billing[Billing]:", "billing"],
		["pool bank[Bank]", "bank"],
	])("frames the lane bands of a laned process with no pool in a script: %s", (script, made) => {
		const defs = poolLessFlowable(true)
		const { aliases } = writeProcessText(defs)
		const r = applyProcessDelta(defs, parseProcessDelta(script), {
			aliases,
			ids: createIdFactory("script"),
		})
		expect(r.problems).toEqual([])
		expectFlowableKept(defs, r.definitions)
		const own = participants(r.definitions).find((p) => p.processRef === "Process_exec")
		expectTiled(r.definitions, own?.id ?? "")
		expectUnmoved(defs, r.definitions, [])
		const ids = [...participants(r.definitions), ...lanesOf(r.definitions)].map((el) => el.id)
		expect(ids).toContain(made)
		expectSwimlanesSound(r.definitions)
	})

	// Final review: poolPrimary pools only the primary (pooling another process would
	// decide its isExecutable), and once a collaboration exists a process with
	// content and no pool is invalid, so the first pool waits until there is none.
	it("refuses the first pool while another process with content has no pool", () => {
		const defs = poolLessWithOther()
		expect(collaborationProblems(defs)).toEqual([])
		expectRefused(defs, add({ x: 0, y: 0, width: 600, height: 250 }))
		expect(newPoolBounds(defs, { x: 300, y: 300 })).toBeUndefined()
		expect(canAddLane(defs, "Process_exec")).toBe(false)
	})

	it.each(["pool bank[Bank]", "lane billing[Billing]:"])(
		"refuses the first pool in a script while another process has no pool: %s",
		(script) => {
			const defs = poolLessWithOther()
			const { aliases } = writeProcessText(defs)
			const r = applyProcessDelta(defs, parseProcessDelta(script), {
				aliases,
				ids: createIdFactory("script"),
			})
			expect(r.problems.map((p) => p.message)).toEqual([expect.stringContaining('"Other"')])
			expect(r.definitions.collaborations).toEqual([])
			expect(collaborationProblems(r.definitions)).toEqual([])
		},
	)

	it("puts the pool of an empty process where the op asks", () => {
		const defs = createEmptyDefinitions()
		const bounds = { x: 100, y: 100, width: 600, height: 250 }
		const r = applyOp(defs, add(bounds))
		expect(boundsOf(r.defs, r.created[0] ?? "")).toEqual(bounds)
	})

	it("makes the next pool a black box in the collaboration the first one made", () => {
		const defs = poolLessFlowable(false)
		const withPool = applyOp(defs, add()).defs
		// A second add is a black box, in the same collaboration.
		const r = run(withPool, add({ x: 0, y: 900, width: 640, height: 60 }, "Bank"))
		expect(r.defs.collaborations).toHaveLength(1)
		expect(r.created).toHaveLength(1)
	})
})

describe("8b.1 more pools are black boxes", () => {
	it("adds a pool without a processRef where the op draws it", () => {
		const defs = flowableFixture()
		const bounds = { x: 0, y: 600, width: 640, height: 60 }
		const r = run(defs, add(bounds, "Supplier"))
		const [id] = r.created
		expect(r.created).toHaveLength(1)
		expect(participants(r.defs).find((p) => p.id === id)).toEqual({
			id,
			name: "Supplier",
			unknownAttributes: {},
		})
		expect(boundsOf(r.defs, id ?? "")).toEqual(bounds)
		expect(r.defs.diagrams[0]?.plane.shapes.find((s) => s.bpmnElement === id)?.isHorizontal).toBe(
			true,
		)
		expectUnmoved(defs, r.defs, [])
		expect(r.defs.processes).toEqual(defs.processes)
		expectSwimlanesSound(r.defs)
	})

	it("refuses a pool drawn over the own pool", () => {
		const defs = flowableFixture()
		expectRefused(defs, add({ x: 100, y: 300, width: 640, height: 60 }))
	})

	for (const order of ["second", "second-diagram"] as const) {
		it(`adds the black box beside the executable process listed ${order}, order kept`, () => {
			const defs = flowableFixture(order)
			const r = run(defs, add())
			expect(participants(r.defs).map((p) => p.id)).toContain(r.created[0])
			expect(documentOrder(r.defs)).toEqual(documentOrder(defs))
			expect(r.defs.processes.map((p) => p.id)).toEqual(defs.processes.map((p) => p.id))
		})
	}

	it("offers the own pool's x and width, 60 high, as a new pool's size", () => {
		const defs = flowableFixture()
		expect(blackBoxBounds(defs, { x: 300, y: 630 })).toEqual({
			x: 0,
			y: 600,
			width: 640,
			height: 60,
		})
		expect(blackBoxBounds(poolLessFlowable(false), { x: 300, y: 630 })).toBeUndefined()
	})
})

const lane = (refId: string, where: "above" | "below"): EditorOp => ({
	kind: "addLane",
	refId,
	where,
	seed: "lane",
})

describe("8b.3 add lane", () => {
	const BELOW_SALES = [
		"Lane_finance",
		"Lane_ops",
		"Gateway_ok",
		"Task_pay",
		"End_1",
		"Participant_partner",
		"Participant_bank",
	]

	it("adds a band below a lane: the pool grows, what is below moves down by the band", () => {
		const defs = flowableFixture()
		const r = run(defs, lane("Lane_sales", "below"))
		const [id] = r.created
		expect(r.created).toHaveLength(1)
		const added = laneNamed(r.defs, id ?? "")
		expect(added).toEqual({ id, flowNodeRefs: [], unknownAttributes: {} })
		expect(primaryProcess(r.defs)?.laneSet?.lanes.map((l) => l.id)).toEqual([
			"Lane_sales",
			id,
			"Lane_finance",
			"Lane_ops",
		])
		expect(boundsOf(r.defs, id ?? "")).toEqual({
			x: 30,
			y: 120,
			width: 610,
			height: LANE_BAND_HEIGHT,
		})
		expect(boundsOf(r.defs, "Participant_own").height).toBe(360 + LANE_BAND_HEIGHT)
		for (const moved of BELOW_SALES) {
			expect(boundsOf(r.defs, moved).y, moved).toBe(boundsOf(defs, moved).y + LANE_BAND_HEIGHT)
		}
		expectUnmoved(defs, r.defs, [...BELOW_SALES, "Participant_own"])
		const message = r.defs.diagrams[0]?.plane.edges.find((e) => e.bpmnElement === "Message_pay")
		expect(message?.waypoints).toEqual([
			{ x: 450, y: 220 + LANE_BAND_HEIGHT },
			{ x: 450, y: 490 + LANE_BAND_HEIGHT },
		])
		// Lane DI stays before the nodes, right after the pool.
		const shapes = r.defs.diagrams[0]?.plane.shapes.map((s) => s.bpmnElement) ?? []
		expect(shapes.indexOf(id ?? "")).toBe(shapes.indexOf("Participant_own") + 1)
		expect(refsOf(r.defs)).toEqual({ ...refsOf(defs), [id ?? ""]: [] })
		expectTiled(r.defs, "Participant_own")
		expectSwimlanesSound(r.defs)
	})

	it("adds a band above a lane, moving that lane down", () => {
		const defs = flowableFixture()
		const r = run(defs, lane("Lane_finance", "above"))
		const id = r.created[0] ?? ""
		expect(boundsOf(r.defs, id).y).toBe(120)
		expect(boundsOf(r.defs, "Lane_finance").y).toBe(120 + LANE_BAND_HEIGHT)
		expect(primaryProcess(r.defs)?.laneSet?.lanes.map((l) => l.id)).toEqual([
			"Lane_sales",
			id,
			"Lane_finance",
			"Lane_ops",
		])
		expectUnmoved(defs, r.defs, [...BELOW_SALES, "Participant_own"])
		expectTiled(r.defs, "Participant_own")
	})

	it("adds a band at the top or the bottom of a laned pool", () => {
		const defs = flowableFixture()
		const top = run(defs, lane("Participant_own", "above"))
		expect(boundsOf(top.defs, top.created[0] ?? "").y).toBe(0)
		expect(boundsOf(top.defs, "Start_1").y).toBe(42 + LANE_BAND_HEIGHT)
		expect(boundsOf(top.defs, "Participant_own").y).toBe(0)
		expectTiled(top.defs, "Participant_own")
		const bottom = run(defs, lane("Participant_own", "below"))
		expect(boundsOf(bottom.defs, bottom.created[0] ?? "").y).toBe(360)
		expect(primaryProcess(bottom.defs)?.laneSet?.lanes.at(-1)?.id).toBe(bottom.created[0])
		expectUnmoved(defs, bottom.defs, ["Participant_own", "Participant_partner", "Participant_bank"])
		expectTiled(bottom.defs, "Participant_own")
	})

	for (const where of ["above", "below"] as const) {
		it(`makes two lanes on a pool without lanes (${where}), every node in the old side`, () => {
			const pooled = applyOp(poolLessFlowable(false), add())
			const poolId = pooled.created[0] ?? ""
			const defs = pooled.defs
			const r = run(defs, lane(poolId, where))
			const [added, existing, setId] = r.created
			expect(r.created).toHaveLength(3)
			const process = primaryProcess(r.defs)
			expect(process?.laneSet?.id).toBe(setId)
			expect(laneNamed(r.defs, added ?? "")?.flowNodeRefs).toEqual([])
			expect(laneNamed(r.defs, existing ?? "")?.flowNodeRefs).toEqual(
				process?.flowElements.map((el) => el.id),
			)
			expect(process?.laneSet?.lanes.map((l) => l.id)).toEqual(
				where === "above" ? [added, existing] : [existing, added],
			)
			const pool = boundsOf(defs, poolId)
			expect(boundsOf(r.defs, existing ?? "").height).toBe(pool.height)
			expect(boundsOf(r.defs, poolId).height).toBe(pool.height + LANE_BAND_HEIGHT)
			for (const node of ["Start_1", "Task_pay"]) {
				const dy = where === "above" ? LANE_BAND_HEIGHT : 0
				expect(boundsOf(r.defs, node).y, node).toBe(boundsOf(defs, node).y + dy)
				expect(inBand(boundsOf(r.defs, node), boundsOf(r.defs, existing ?? ""))).toBe(true)
			}
			expectTiled(r.defs, poolId)
			expectSwimlanesSound(r.defs)
		})
	}

	it("moves a node straddling the edge by its centre, and its boundary event with it", () => {
		const nudged = applyOp(flowableFixture(), {
			kind: "move",
			moves: [{ id: "Task_pay", dx: 0, dy: -30 }],
		}).defs
		// On the host's top edge: the event's centre is above the line, the host's below it.
		const withEvent = applyOp(nudged, {
			kind: "createBoundaryEvent",
			hostId: "Task_pay",
			eventDefType: "timer",
			bounds: { x: 432, y: 92, width: 36, height: 36 },
			seed: "timer",
		})
		const eventId = withEvent.created[0] ?? ""
		const defs = withEvent.defs
		const r = run(defs, lane("Lane_sales", "below"))
		expect(boundsOf(r.defs, "Task_pay").y).toBe(110 + LANE_BAND_HEIGHT)
		expect(boundsOf(r.defs, eventId).y).toBe(92 + LANE_BAND_HEIGHT)
		expect(refsOf(r.defs).Lane_finance).toEqual(refsOf(defs).Lane_finance)
	})

	it("moves an expanded sub-process straddling the edge whole: children, inner flows, events", () => {
		let defs = flowableFixture()
		const make = (op: EditorOp) => {
			const r = applyOp(defs, op)
			defs = r.defs
			return r.created[0] ?? ""
		}
		// Centre at y=140, below Lane_sales's bottom edge at 120; its children sit above it.
		const sub = make({
			kind: "createShape",
			type: "subProcess",
			bounds: { x: 460, y: 60, width: 160, height: 160 },
			seed: "sub",
		})
		const first = make({
			kind: "createShape",
			type: "serviceTask",
			bounds: { x: 480, y: 70, width: 100, height: 40 },
			seed: "first",
		})
		const second = make({
			kind: "createShape",
			type: "serviceTask",
			bounds: { x: 480, y: 160, width: 100, height: 40 },
			seed: "second",
		})
		const flow = make({
			kind: "createConnection",
			sourceId: first,
			targetId: second,
			waypoints: [
				{ x: 530, y: 110 },
				{ x: 530, y: 160 },
			],
			seed: "flow",
		})
		const timer = make({
			kind: "createBoundaryEvent",
			hostId: first,
			eventDefType: "timer",
			bounds: { x: 512, y: 52, width: 36, height: 36 },
			seed: "timer",
		})
		// The editor files a connection between children at process level; an imported
		// file holds it in the sub-process, as BPMN requires, so put it there.
		defs = structuredClone(defs)
		const process = primaryProcess(defs)
		const subProcess = process?.flowElements.find((el) => el.id === sub)
		if (!process || subProcess?.type !== "subProcess") throw new Error("no sub-process")
		expect(subProcess.flowElements.map((el) => el.id)).toEqual([first, second])
		subProcess.sequenceFlows.push(...process.sequenceFlows.filter((f) => f.id === flow))
		process.sequenceFlows = process.sequenceFlows.filter((f) => f.id !== flow)

		const r = run(defs, lane("Lane_sales", "below"))
		for (const id of [sub, first, second, timer]) {
			expect(boundsOf(r.defs, id).y, id).toBe(boundsOf(defs, id).y + LANE_BAND_HEIGHT)
		}
		const edge = (d: BpmnDefinitions) =>
			d.diagrams[0]?.plane.edges.find((e) => e.bpmnElement === flow)?.waypoints
		expect(edge(r.defs)).toEqual(edge(defs)?.map((p) => ({ ...p, y: p.y + LANE_BAND_HEIGHT })))
		expectSwimlanesSound(r.defs)
	})

	/** The waypoints of edge `id` on the first diagram. */
	const waypointsOf = (defs: BpmnDefinitions, id: string) =>
		defs.diagrams[0]?.plane.edges.find((e) => e.bpmnElement === id)?.waypoints

	// Final review: a waypoint on the line used to move with what is below it even
	// when it is the end of an edge docked on a shape that stays above.
	it("leaves a message end on a black box flush above the pool where the box stays", () => {
		const defs = structuredClone(flowableFixture())
		const collaboration = defs.collaborations[0]
		const plane = defs.diagrams[0]?.plane
		if (!collaboration || !plane) throw new Error("no collaboration")
		const box = { x: 0, y: -60, width: 640, height: 60 }
		collaboration.participants.push({ id: "Participant_top", unknownAttributes: {} })
		collaboration.messageFlows.push({
			id: "Message_top",
			sourceRef: "Task_review",
			targetRef: "Participant_top",
			unknownAttributes: {},
		})
		plane.shapes.push({
			id: "Participant_top_di",
			bpmnElement: "Participant_top",
			isHorizontal: true,
			bounds: box,
			unknownAttributes: {},
		})
		plane.edges.push({
			id: "Message_top_di",
			bpmnElement: "Message_top",
			waypoints: [
				{ x: 210, y: 20 },
				{ x: 210, y: 0 },
			],
			unknownAttributes: {},
		})
		for (const ref of ["Participant_own", "Lane_sales"]) {
			const r = run(defs, lane(ref, "above"))
			expect(boundsOf(r.defs, "Participant_top"), ref).toEqual(box)
			expect(waypointsOf(r.defs, "Message_top"), ref).toEqual([
				{ x: 210, y: 20 + LANE_BAND_HEIGHT },
				{ x: 210, y: 0 },
			])
		}
	})

	it("leaves a flow's start on a node whose bottom edge is the line where the node stays", () => {
		const defs = structuredClone(flowableFixture())
		const plane = defs.diagrams[0]?.plane
		const review = plane?.shapes.find((s) => s.bpmnElement === "Task_review")
		const flow = plane?.edges.find((e) => e.bpmnElement === "Flow_2")
		if (!review || !flow) throw new Error("no Task_review")
		review.bounds = { ...review.bounds, y: 40 }
		flow.waypoints = [
			{ x: 210, y: 120 },
			{ x: 210, y: 180 },
			{ x: 300, y: 180 },
		]
		const r = run(defs, lane("Lane_finance", "above"))
		expect(boundsOf(r.defs, "Task_review")).toEqual(review.bounds)
		expect(waypointsOf(r.defs, "Flow_2")).toEqual([
			{ x: 210, y: 120 },
			{ x: 210, y: 180 + LANE_BAND_HEIGHT },
			{ x: 300, y: 180 + LANE_BAND_HEIGHT },
		])
	})

	// Final review: the bands are horizontal only; on a vertical pool a band
	// appended below the lane columns grew the pool downwards.
	it("refuses a pool drawn vertically and its lanes, with lanes or without", () => {
		const laned = Bpmn.parse(verticalPoolXml(true))
		for (const id of ["P", "LA", "LB"]) {
			for (const where of ["above", "below"] as const) expectRefused(laned, lane(id, where))
			expect(canAddLane(laned, id), id).toBe(false)
		}
		const unlaned = Bpmn.parse(verticalPoolXml(false))
		expectRefused(unlaned, lane("P", "below"))
		expect(canAddLane(unlaned, "P")).toBe(false)
		expect(canDivideLanes(unlaned, "P")).toBe(false)
	})

	it("refuses child lanes, parent lanes, black boxes, locked pools and unknown ids (I8)", () => {
		const nested = fixture(FIXTURE_08)
		expectRefused(nested, lane("Lane_inside", "above"))
		expectRefused(nested, lane("Lane_desk", "below"))
		expectRefused(nested, lane("Lane_sales", "below"))
		expectRefused(nested, lane("Participant_customer", "below"))
		const flowable = flowableFixture()
		expectRefused(flowable, lane("Participant_bank", "above"))
		expectRefused(flowable, lane("Participant_partner", "above"))
		expectRefused(flowable, lane("Task_pay", "above"))
		expectRefused(flowable, lane("nothing", "above"))
		expectRefused(Bpmn.parse(lockedPartnerXml()), lane("Participant_partner", "below"))
		expectRefused(poolLessFlowable(true), lane("Lane_sales", "below"))
	})

	it("adds a band in fixture 08 at a top-level edge, nested lanes moved whole", () => {
		const defs = fixture(FIXTURE_08)
		const r = run(defs, lane("Lane_ops", "above"))
		const id = r.created[0] ?? ""
		expect(boundsOf(r.defs, id)).toEqual({ x: 30, y: 240, width: 690, height: LANE_BAND_HEIGHT })
		expect(boundsOf(r.defs, "Lane_ops").y).toBe(240 + LANE_BAND_HEIGHT)
		for (const kept of ["Lane_sales", "Lane_inside", "Lane_desk"]) {
			expect(boundsOf(r.defs, kept), kept).toEqual(boundsOf(defs, kept))
		}
		expect(refsOf(r.defs)).toEqual({ ...refsOf(defs), [id]: [] })
		expectTiled(r.defs, "Participant_company")
		expectSwimlanesSound(r.defs)
	})

	for (const order of ["second", "second-diagram"] as const) {
		it(`adds a lane to the executable process listed ${order}, order kept`, () => {
			const defs = flowableFixture(order)
			const r = run(defs, lane("Lane_ops", "below"))
			expect(laneNamed(r.defs, r.created[0] ?? "")).toBeDefined()
			expect(documentOrder(r.defs)).toEqual(documentOrder(defs))
			expectTiled(r.defs, "Participant_own")
		})
	}
})

describe("8b.6 edits copy only what they change", () => {
	it("shares the partner process and its diagram when a lane is added or deleted", () => {
		const defs = flowableFixture("second-diagram")
		const partner = defs.processes[0]
		const partnerDiagram = defs.diagrams[0]
		for (const op of [
			lane("Lane_ops", "below"),
			{ kind: "delete", ids: ["Lane_ops"] } as EditorOp,
		]) {
			const next = run(defs, op).defs
			expect(next, op.kind).not.toBe(defs)
			expect(next.processes[0], op.kind).toBe(partner)
			expect(next.diagrams[0], op.kind).toBe(partnerDiagram)
		}
	})

	it("shares every process when a pool is added or a black box deleted", () => {
		const defs = flowableFixture("second-diagram")
		for (const op of [add(), { kind: "delete", ids: ["Participant_bank"] } as EditorOp]) {
			const next = run(defs, op).defs
			expect(next, op.kind).not.toBe(defs)
			next.processes.forEach((p, k) => expect(p, op.kind).toBe(defs.processes[k]))
			expect(next.diagrams[0], op.kind).toBe(defs.diagrams[0])
		}
	})

	it("shares the partner process and its diagram when the pool grows", () => {
		const defs = flowableFixture("second-diagram")
		const next = run(defs, {
			kind: "move",
			moves: [{ id: "End_1", dx: 200, dy: 0 }],
			grow: true,
		}).defs
		expect(boundsOf(primaryFirst(next), "Participant_own").width).toBeGreaterThan(640)
		expect(next.processes[0]).toBe(defs.processes[0])
		expect(next.diagrams[0]).toBe(defs.diagrams[0])
	})
})

describe("8b.5 what the context bar offers agrees with the ops", () => {
	/** Every pool and lane of `defs`, and a node, as candidate ids. */
	const candidates = (defs: BpmnDefinitions) => [
		...participants(defs).map((p) => p.id),
		...defs.processes.flatMap((p) => lanesOfProcess(p.laneSet)),
		"Task_review",
		"nothing",
	]
	const lanesOfProcess = (set: BpmnDefinitions["processes"][number]["laneSet"]): string[] =>
		(set?.lanes ?? []).flatMap((l) => [l.id, ...lanesOfProcess(l.childLaneSet)])
	const unlaned = () => applyOp(poolLessFlowable(false), add()).defs
	const docs: Record<string, () => BpmnDefinitions> = {
		flowable: () => flowableFixture(),
		second: () => flowableFixture("second-diagram"),
		nested: () => fixture(FIXTURE_08),
		locked: () => Bpmn.parse(lockedPartnerXml()),
		poolLess: () => poolLessFlowable(true),
		unlaned,
		other: poolLessWithOther,
		vertical: () => Bpmn.parse(verticalPoolXml(true)),
	}

	for (const [name, make] of Object.entries(docs)) {
		it(`offers Add lane exactly where the op takes it (${name})`, () => {
			const defs = make()
			for (const id of candidates(defs)) {
				for (const where of ["above", "below"] as const) {
					const taken = applyOp(defs, lane(id, where)).defs !== defs
					expect(canAddLane(defs, id), `${id} ${where}`).toBe(taken)
				}
			}
		})
	}

	it("offers Divide only on an own pool without lanes (U6)", () => {
		const defs = unlaned()
		const poolId = participants(defs)[0]?.id ?? ""
		expect(canDivideLanes(defs, poolId)).toBe(true)
		expect(canDivideLanes(flowableFixture(), "Participant_own")).toBe(false)
		expect(canDivideLanes(flowableFixture(), "Participant_bank")).toBe(false)
		expect(canDivideLanes(fixture(FIXTURE_08), "Participant_company")).toBe(false)
		expect(canDivideLanes(poolLessFlowable(false), "Process_exec")).toBe(false)
	})
})

describe("8b.2 where the pool tool puts a pool", () => {
	it("is a black box beside the own pool, centred on the pointer", () => {
		const defs = flowableFixture()
		expect(newPoolBounds(defs, { x: 300, y: 630 })).toEqual(
			blackBoxBounds(defs, { x: 300, y: 630 }),
		)
	})

	it("is the pool the first add draws around the process, wherever the pointer is", () => {
		for (const defs of [poolLessFlowable(false), poolLessFlowable(true)]) {
			const bounds = newPoolBounds(defs, { x: 900, y: 900 })
			const r = applyOp(defs, add(bounds))
			expect(boundsOf(r.defs, r.created[0] ?? "")).toEqual(bounds)
		}
	})

	it("is a 600 by 250 pool centred on the pointer for an empty process", () => {
		const defs = applyOp(createEmptyDefinitions(), {
			kind: "createShape",
			type: "task",
			bounds: { x: 0, y: 0, width: 100, height: 80 },
			seed: "t",
		}).defs
		const empty = applyOp(defs, {
			kind: "delete",
			ids: [primaryProcess(defs)?.flowElements[0]?.id ?? ""],
		}).defs
		const bounds = newPoolBounds(empty, { x: 400, y: 300 })
		expect(bounds).toEqual({ x: 100, y: 175, width: 600, height: 250 })
		const r = applyOp(empty, add(bounds))
		expect(boundsOf(r.defs, r.created[0] ?? "")).toEqual(bounds)
	})
})
