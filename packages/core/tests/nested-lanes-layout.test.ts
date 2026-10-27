import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"
import { applyAutoLayout } from "../src/bpmn/auto-layout.js"
import type {
	BpmnBounds,
	BpmnDefinitions,
	BpmnDiShape,
	BpmnLane,
	BpmnLaneSet,
} from "../src/bpmn/bpmn-model.js"
import { parseBpmn } from "../src/bpmn/bpmn-parser.js"
import { serializeBpmn } from "../src/bpmn/bpmn-serializer.js"
import { semanticHash } from "../src/bpmn/semantic-hash.js"
import { sha256Hex } from "../src/bpmn/sha256.js"

const FIXTURES = join(import.meta.dirname, "fixtures", "roundtrip")
const LANE_HEADER = 30

function fixture(name: string): BpmnDefinitions {
	return parseBpmn(readFileSync(join(FIXTURES, name), "utf8"))
}

/** 08 is a Flowable Modeler file: pool Company with Sales (Inside sales, Sales desk) and Operations. */
function flowable(): BpmnDefinitions {
	return fixture("08-flowable-lanes-pools.bpmn")
}

function shapes(defs: BpmnDefinitions): BpmnDiShape[] {
	return defs.diagrams[0]?.plane.shapes ?? []
}

function boundsOf(defs: BpmnDefinitions, id: string): BpmnBounds {
	const shape = shapes(defs).find((s) => s.bpmnElement === id)
	if (!shape) throw new Error(`no shape for ${id}`)
	return shape.bounds
}

function inside(inner: BpmnBounds, outer: BpmnBounds): boolean {
	return (
		inner.x >= outer.x &&
		inner.y >= outer.y &&
		inner.x + inner.width <= outer.x + outer.width &&
		inner.y + inner.height <= outer.y + outer.height
	)
}

function overlaps(a: BpmnBounds, b: BpmnBounds): boolean {
	return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
}

/** Every lane of a lane set with its parent lane, outermost first. */
function lanesWithParent(
	laneSet: BpmnLaneSet | undefined,
	parent?: BpmnLane,
): Array<{ lane: BpmnLane; parent?: BpmnLane }> {
	const out: Array<{ lane: BpmnLane; parent?: BpmnLane }> = []
	for (const lane of laneSet?.lanes ?? []) {
		out.push(parent ? { lane, parent } : { lane })
		out.push(...lanesWithParent(lane.childLaneSet, lane))
	}
	return out
}

function expectTiles(children: BpmnBounds[], parent: BpmnBounds): void {
	const sorted = [...children].sort((a, b) => a.y - b.y)
	expect(sorted[0]?.y).toBe(parent.y)
	for (let i = 1; i < sorted.length; i++) {
		const above = sorted[i - 1] as BpmnBounds
		expect(sorted[i]?.y).toBe(above.y + above.height)
	}
	const last = sorted[sorted.length - 1] as BpmnBounds
	expect(last.y + last.height).toBe(parent.y + parent.height)
}

describe("auto-layout with nested lanes", () => {
	it("insets every nested lane by one lane header", () => {
		const defs = flowable()
		const laid = applyAutoLayout(defs)
		const pool = boundsOf(laid, "Participant_company")
		for (const { lane, parent } of lanesWithParent(defs.processes[0]?.laneSet)) {
			const own = boundsOf(laid, lane.id)
			const outer = parent ? boundsOf(laid, parent.id) : undefined
			const x = outer ? outer.x : pool.x
			const width = outer ? outer.width : pool.width
			expect(own.x).toBe(x + LANE_HEADER)
			// The pool width is not rounded; lane widths are.
			expect(Math.abs(own.width - (width - LANE_HEADER))).toBeLessThanOrEqual(0.5)
		}
	})

	it("tiles every parent lane with its children and the pool with its top-level lanes", () => {
		const defs = flowable()
		const laid = applyAutoLayout(defs)
		const top = (defs.processes[0]?.laneSet?.lanes ?? []).map((l) => boundsOf(laid, l.id))
		expectTiles(top, boundsOf(laid, "Participant_company"))
		const sales = boundsOf(laid, "Lane_sales")
		expectTiles([boundsOf(laid, "Lane_inside"), boundsOf(laid, "Lane_desk")], sales)
	})

	it("keeps every node inside its deepest lane and clear of every lane header", () => {
		const defs = flowable()
		const laid = applyAutoLayout(defs)
		const deepest = new Map<string, string>()
		for (const { lane } of lanesWithParent(defs.processes[0]?.laneSet)) {
			for (const ref of lane.flowNodeRefs) deepest.set(ref, lane.id)
		}
		const headers = lanesWithParent(defs.processes[0]?.laneSet).map(({ lane }) => {
			const b = boundsOf(laid, lane.id)
			return { x: b.x, y: b.y, width: LANE_HEADER, height: b.height }
		})
		expect(deepest.size).toBe(6)
		for (const [node, lane] of deepest) {
			const shape = shapes(laid).find((s) => s.bpmnElement === node)
			if (!shape) throw new Error(`no shape for ${node}`)
			expect(inside(shape.bounds, boundsOf(laid, lane)), node).toBe(true)
			for (const header of headers) {
				expect(overlaps(shape.bounds, header), node).toBe(false)
				if (shape.label) expect(overlaps(shape.label.bounds, header), node).toBe(false)
			}
		}
	})

	it("routes a message flow out of a nested lane past the nested lanes below it", () => {
		const defs = flowable()
		const order = defs.processes[0]
		const desk = order?.laneSet?.lanes[0]?.childLaneSet?.lanes[1]
		if (!order || !desk) throw new Error("fixture changed")
		// A second branch out of the start event puts an event in the column right
		// under review. The router can step past it within review's width, unless
		// it counts the nested Sales desk lane as an obstacle: no column clears a
		// lane, so the flow would run into the event and need repairing.
		order.flowElements.push({
			id: "blocker",
			type: "endEvent",
			eventDefinitions: [],
			incoming: ["toBlocker"],
			outgoing: [],
			extensionElements: [],
			unknownAttributes: {},
		})
		order.sequenceFlows.push({
			id: "toBlocker",
			sourceRef: "start",
			targetRef: "blocker",
			extensionElements: [],
			unknownAttributes: {},
		})
		order.flowElements.find((e) => e.id === "start")?.outgoing.push("toBlocker")
		desk.flowNodeRefs.push("blocker")
		order.laneSet?.lanes[0]?.flowNodeRefs.push("blocker")
		defs.collaborations[0]?.messageFlows.push({
			id: "MessageFlow_ask",
			sourceRef: "review",
			targetRef: "Participant_customer",
			unknownAttributes: {},
		})
		const laid = applyAutoLayout(defs)
		const blocker = boundsOf(laid, "blocker")
		const review = boundsOf(laid, "review")
		const edge = laid.diagrams[0]?.plane.edges.find((e) => e.bpmnElement === "MessageFlow_ask")
		const points = edge?.waypoints ?? []
		const x = points[0]?.x ?? Number.NaN
		expect(points.every((p) => p.x === x)).toBe(true)
		expect(x > review.x && x < review.x + review.width).toBe(true)
		expect(x < blocker.x || x > blocker.x + blocker.width).toBe(true)
	})

	it("keeps a node that is in no lane inside its pool", () => {
		const defs = flowable()
		defs.processes[0]?.flowElements.push({
			id: "orphan",
			type: "serviceTask",
			incoming: [],
			outgoing: [],
			extensionElements: [],
			unknownAttributes: {},
		})
		const laid = applyAutoLayout(defs)
		expect(inside(boundsOf(laid, "orphan"), boundsOf(laid, "Participant_company"))).toBe(true)
		const customer = boundsOf(laid, "Participant_customer")
		expect(overlaps(boundsOf(laid, "Participant_company"), customer)).toBe(false)
	})

	it("does not grow a pool for data elements, which no lane can hold", () => {
		const laid = applyAutoLayout(fixture("miwg-C.5.0.bpmn"))
		const plane = shapes(laid)
		const lanes = (laid.processes.flatMap((p) => p.laneSet?.lanes ?? []) as BpmnLane[]).map(
			(lane) => lane.id,
		)
		for (const participant of laid.collaborations[0]?.participants ?? []) {
			const own = laid.processes.find((p) => p.id === participant.processRef)
			const top = (own?.laneSet?.lanes ?? []).filter((lane) => lanes.includes(lane.id))
			if (top.length === 0) continue
			const bands = top.reduce((sum, lane) => sum + boundsOf(laid, lane.id).height, 0)
			const pool = plane.find((s) => s.bpmnElement === participant.id)
			expect(pool?.bounds.height, participant.id).toBe(bands)
		}
	})

	it("draws lane bands for a laned process with no flow nodes", () => {
		const defs = flowable()
		const customer = defs.processes.find((p) => p.id === "customer")
		if (!customer) throw new Error("no customer process")
		customer.laneSet = {
			id: "LaneSet_customer",
			lanes: [
				{
					id: "Lane_buyer",
					flowNodeRefs: [],
					unknownAttributes: {},
					childLaneSet: {
						lanes: [
							{ id: "Lane_clerk", flowNodeRefs: [], unknownAttributes: {} },
							{ id: "Lane_boss", flowNodeRefs: [], unknownAttributes: {} },
						],
					},
				},
				{ id: "Lane_payer", flowNodeRefs: [], unknownAttributes: {} },
			],
			unknownAttributes: {},
		}
		const laid = applyAutoLayout(defs)
		const pool = boundsOf(laid, "Participant_customer")
		const buyer = boundsOf(laid, "Lane_buyer")
		expectTiles([buyer, boundsOf(laid, "Lane_payer")], pool)
		expectTiles([boundsOf(laid, "Lane_clerk"), boundsOf(laid, "Lane_boss")], buyer)
		expect(buyer.x).toBe(pool.x + LANE_HEADER)
		expect(boundsOf(laid, "Lane_clerk").x).toBe(buyer.x + LANE_HEADER)
		expect(boundsOf(laid, "Lane_clerk").height).toBeGreaterThan(0)
	})

	it("writes the pool first, then its lanes outermost first", () => {
		const defs = flowable()
		const ops = defs.processes[0]?.laneSet?.lanes[1]
		if (!ops) throw new Error("fixture changed")
		// A lane with a single child has the child's exact bounds, so only depth
		// can put the parent first.
		ops.childLaneSet = {
			lanes: [{ id: "Lane_shipping", flowNodeRefs: [...ops.flowNodeRefs], unknownAttributes: {} }],
		}
		const laid = applyAutoLayout(defs)
		const depth = new Map([
			["Lane_sales", 0],
			["Lane_ops", 0],
			["Lane_inside", 1],
			["Lane_desk", 1],
			["Lane_shipping", 1],
		])
		const order = shapes(laid).map((s) => s.bpmnElement)
		const poolAt = order.indexOf("Participant_company")
		const lanes = order.filter((id) => depth.has(id))
		expect(lanes).toHaveLength(5)
		for (const id of lanes) expect(order.indexOf(id)).toBeGreaterThan(poolAt)
		const depths = lanes.map((id) => depth.get(id) ?? -1)
		expect(depths).toEqual([...depths].sort((a, b) => a - b))
	})

	it("refuses a lane set that contains itself instead of looping", () => {
		const defs = flowable()
		const sales = defs.processes[0]?.laneSet?.lanes[0]
		if (!sales?.childLaneSet) throw new Error("fixture changed")
		sales.childLaneSet.lanes.push(sales)
		expect(() => applyAutoLayout(defs)).toThrow(/Lane_sales/)
	})

	it("leaves the semantic hash alone", () => {
		const defs = flowable()
		expect(semanticHash(applyAutoLayout(defs))).toBe(semanticHash(defs))
	})
})

describe("auto-layout without nested lanes", () => {
	// Serialized layouts captured before nested-lane support; any drift here is
	// a layout change for diagrams the feature must not touch.
	it.each([
		["02-collaboration.bpmn", "ad05977e9ae0d6cbeba9dfab462a20d4e4ea977c18f04fbf1e8dc901b0d4ed07"],
		["miwg-A.4.0.bpmn", "23eff3452d72d5b9fb3f74b76bdbf5d30eff23c35b53388d4d00d55e7cd0e015"],
	])("lays out %s byte for byte as before", (name, hash) => {
		expect(sha256Hex(serializeBpmn(applyAutoLayout(fixture(name))))).toBe(hash)
	})
})
