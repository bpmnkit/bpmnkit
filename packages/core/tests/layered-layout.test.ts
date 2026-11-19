import { describe, expect, it } from "vitest"
import type {
	BpmnBoundaryEvent,
	BpmnFlowElement,
	BpmnLane,
	BpmnLaneSet,
	BpmnProcess,
	BpmnSequenceFlow,
	BpmnSubProcess,
} from "../src/bpmn/bpmn-model.js"
import { layoutProcess } from "../src/layout/layout-engine.js"
import type { Bounds, LayoutNode, LayoutResult } from "../src/layout/types.js"

function node(id: string, type: BpmnFlowElement["type"] = "serviceTask"): BpmnFlowElement {
	const base = {
		id,
		incoming: [] as string[],
		outgoing: [] as string[],
		extensionElements: [],
		unknownAttributes: {},
	}
	switch (type) {
		case "startEvent":
			return { ...base, type: "startEvent", eventDefinitions: [] }
		case "endEvent":
			return { ...base, type: "endEvent", eventDefinitions: [] }
		case "exclusiveGateway":
			return { ...base, type: "exclusiveGateway" }
		case "subProcess":
			return {
				...base,
				type: "subProcess",
				flowElements: [],
				sequenceFlows: [],
				textAnnotations: [],
				associations: [],
			}
		default:
			return { ...base, type: "serviceTask" }
	}
}

function boundary(id: string, host: string, kind?: "error" | "escalation"): BpmnBoundaryEvent {
	return {
		id,
		type: "boundaryEvent",
		attachedToRef: host,
		incoming: [],
		outgoing: [],
		extensionElements: [],
		unknownAttributes: {},
		eventDefinitions: kind ? [{ type: kind }] : [],
	}
}

function flow(id: string, source: string, target: string): BpmnSequenceFlow {
	return { id, sourceRef: source, targetRef: target, extensionElements: [], unknownAttributes: {} }
}

function lane(id: string, flowNodeRefs: string[], childLaneSet?: BpmnLaneSet): BpmnLane {
	return { id, flowNodeRefs, unknownAttributes: {}, ...(childLaneSet ? { childLaneSet } : {}) }
}

function proc(
	flowElements: BpmnFlowElement[],
	sequenceFlows: BpmnSequenceFlow[],
	laneSet?: BpmnLaneSet,
): BpmnProcess {
	return {
		id: "p",
		flowElements,
		sequenceFlows,
		extensionElements: [],
		textAnnotations: [],
		associations: [],
		unknownAttributes: {},
		...(laneSet ? { laneSet } : {}),
	}
}

function byId(result: LayoutResult): Map<string, LayoutNode> {
	return new Map(result.nodes.map((n) => [n.id, n]))
}

const cy = (b: Bounds): number => b.y + b.height / 2
const cx = (b: Bounds): number => b.x + b.width / 2

function overlap(a: Bounds, b: Bounds): boolean {
	return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
}

/** No edge segment runs through a shape other than its ends (and a boundary source's host). */
function throughShapes(result: LayoutResult, hosts: Record<string, string> = {}): string[] {
	const out: string[] = []
	for (const e of result.edges) {
		const ends = new Set([e.sourceRef, e.targetRef, hosts[e.sourceRef] ?? ""])
		for (const n of result.nodes) {
			if (ends.has(n.id) || n.type === "boundaryEvent") continue
			const b = n.bounds
			for (let i = 0; i + 1 < e.waypoints.length; i++) {
				const p = e.waypoints[i] as { x: number; y: number }
				const q = e.waypoints[i + 1] as { x: number; y: number }
				if (
					Math.max(p.x, q.x) > b.x + 1 &&
					Math.min(p.x, q.x) < b.x + b.width - 1 &&
					Math.max(p.y, q.y) > b.y + 1 &&
					Math.min(p.y, q.y) < b.y + b.height - 1
				)
					out.push(`${e.id}→${n.id}`)
			}
		}
	}
	return out
}

/** split → (a | b → c | d) → join: two branches whose naive order crosses. */
function crossingBranches(): BpmnProcess {
	return proc(
		[
			node("s", "startEvent"),
			node("g", "exclusiveGateway"),
			node("a"),
			node("b"),
			node("c"),
			node("d"),
			node("j", "exclusiveGateway"),
			node("e", "endEvent"),
		],
		[
			flow("f1", "s", "g"),
			flow("f2", "g", "a"),
			flow("f3", "g", "b"),
			flow("f4", "a", "d"),
			flow("f5", "b", "c"),
			flow("f6", "c", "j"),
			flow("f7", "d", "j"),
			flow("f8", "j", "e"),
		],
	)
}

describe("layered engine", () => {
	it("keeps a linear process on one straight line", () => {
		const p = proc(
			[node("s", "startEvent"), node("a"), node("b"), node("e", "endEvent")],
			[flow("f1", "s", "a"), flow("f2", "a", "b"), flow("f3", "b", "e")],
		)
		const r = layoutProcess(p, "layered")
		const ys = r.nodes.map((n) => cy(n.bounds))
		expect(new Set(ys).size).toBe(1)
		for (const e of r.edges) expect(e.waypoints).toHaveLength(2)
	})

	it("routes crossing-prone branches without crossings, overlaps or edges through shapes", () => {
		const r = layoutProcess(crossingBranches(), "layered")
		const nodes = r.nodes
		for (let i = 0; i < nodes.length; i++)
			for (let j = i + 1; j < nodes.length; j++)
				expect(overlap((nodes[i] as LayoutNode).bounds, (nodes[j] as LayoutNode).bounds)).toBe(
					false,
				)
		expect(throughShapes(r)).toEqual([])
		const m = byId(r)
		// Each branch stays on its own row: a above b means d above c.
		const aAbove = cy(m.get("a")?.bounds as Bounds) < cy(m.get("b")?.bounds as Bounds)
		expect(cy(m.get("d")?.bounds as Bounds) < cy(m.get("c")?.bounds as Bounds)).toBe(aAbove)
		for (const id of ["a", "b", "c", "d"])
			expect(r.edges.find((e) => e.sourceRef === id)).toBeTruthy()
	})

	it("does not depend on which branch is declared first for its crossing count", () => {
		const base = crossingBranches()
		const swapped = { ...base, sequenceFlows: [...base.sequenceFlows].reverse() }
		for (const p of [base, swapped]) {
			const m = byId(layoutProcess(p, "layered"))
			const aAbove = cy(m.get("a")?.bounds as Bounds) < cy(m.get("b")?.bounds as Bounds)
			expect(cy(m.get("d")?.bounds as Bounds) < cy(m.get("c")?.bounds as Bounds)).toBe(aAbove)
		}
	})

	it("stacks a one-node detour under the split's other target and flows up into it", () => {
		const p = proc(
			[
				node("s", "startEvent"),
				node("g", "exclusiveGateway"),
				node("detour"),
				node("j", "exclusiveGateway"),
				node("e", "endEvent"),
			],
			[
				flow("f1", "s", "g"),
				flow("skip", "g", "j"),
				flow("in", "g", "detour"),
				flow("up", "detour", "j"),
				flow("f5", "j", "e"),
			],
		)
		const r = layoutProcess(p, "layered")
		const m = byId(r)
		const detour = m.get("detour")?.bounds as Bounds
		const join = m.get("j")?.bounds as Bounds
		expect(cx(detour)).toBe(cx(join))
		expect(detour.y).toBeGreaterThan(join.y + join.height)
		const up = r.edges.find((e) => e.id === "up")
		expect(up?.waypoints).toEqual([
			{ x: cx(join), y: detour.y },
			{ x: cx(join), y: join.y + join.height },
		])
		expect(r.edges.find((e) => e.id === "skip")?.waypoints).toHaveLength(2)
	})

	it("drops a boundary handler straight down from its event", () => {
		const p = proc(
			[
				node("s", "startEvent"),
				node("t"),
				boundary("b", "t", "error"),
				node("h"),
				node("e", "endEvent"),
				node("he", "endEvent"),
			],
			[flow("f1", "s", "t"), flow("f2", "t", "e"), flow("fb", "b", "h"), flow("fh", "h", "he")],
		)
		const r = layoutProcess(p, "layered")
		const m = byId(r)
		const event = m.get("b")?.bounds as Bounds
		const handler = m.get("h")?.bounds as Bounds
		expect(cx(event)).toBe(cx(handler))
		const drop = r.edges.find((e) => e.id === "fb")?.waypoints ?? []
		expect(drop).toHaveLength(2)
		expect(drop[0]?.y).toBe(event.y + event.height)
		expect(drop[1]?.y).toBe(handler.y)
		expect(throughShapes(r, { b: "t" })).toEqual([])
	})

	it("routes a loop back in a corridor past both ends", () => {
		const p = proc(
			[
				node("s", "startEvent"),
				node("m", "exclusiveGateway"),
				node("a"),
				node("g", "exclusiveGateway"),
				node("e", "endEvent"),
			],
			[
				flow("f1", "s", "m"),
				flow("f2", "m", "a"),
				flow("f3", "a", "g"),
				flow("back", "g", "m"),
				flow("f4", "g", "e"),
			],
		)
		const r = layoutProcess(p, "layered")
		const m = byId(r)
		const back = r.edges.find((e) => e.id === "back")?.waypoints ?? []
		expect(back).toHaveLength(4)
		const gw = m.get("g")?.bounds as Bounds
		const merge = m.get("m")?.bounds as Bounds
		expect(back[0]?.x).toBe(cx(gw))
		expect(back[3]?.x).toBe(cx(merge))
		expect(back[1]?.y).toBe(back[2]?.y)
		expect(throughShapes(r)).toEqual([])
	})

	it("pulls a second start event next to the node it feeds", () => {
		const p = proc(
			[node("s", "startEvent"), node("a"), node("b"), node("c"), node("s2", "startEvent")],
			[flow("f1", "s", "a"), flow("f2", "a", "b"), flow("f3", "b", "c"), flow("f4", "s2", "c")],
		)
		const m = byId(layoutProcess(p, "layered"))
		expect(m.get("s2")?.layer).toBe((m.get("c")?.layer ?? 0) - 1)
	})

	it("leaves a scope with lanes to the semantic placement", () => {
		const p = proc(
			[node("s", "startEvent"), node("a"), node("e", "endEvent")],
			[flow("f1", "s", "a"), flow("f2", "a", "e")],
			{ id: "ls", lanes: [lane("l1", ["s", "a"]), lane("l2", ["e"])], unknownAttributes: {} },
		)
		expect(layoutProcess(p, "layered")).toEqual(layoutProcess(p, "semantic"))
	})
})
