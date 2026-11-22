import { describe, expect, it } from "vitest"
import type {
	BpmnBoundaryEvent,
	BpmnFlowElement,
	BpmnProcess,
	BpmnSequenceFlow,
} from "../src/bpmn/bpmn-model.js"
import { layoutProcess } from "../src/layout/layout-engine.js"
import type { Waypoint } from "../src/layout/types.js"

function node(id: string, type = "serviceTask"): BpmnFlowElement {
	const base = {
		id,
		type,
		incoming: [],
		outgoing: [],
		extensionElements: [],
		unknownAttributes: {},
	}
	return (type.endsWith("Event") ? { ...base, eventDefinitions: [] } : base) as BpmnFlowElement
}

function boundary(id: string, host: string): BpmnBoundaryEvent {
	return {
		id,
		type: "boundaryEvent",
		attachedToRef: host,
		incoming: [],
		outgoing: [],
		extensionElements: [],
		unknownAttributes: {},
		eventDefinitions: [{ type: "error" }],
	}
}

function flow(id: string, source: string, target: string): BpmnSequenceFlow {
	return { id, sourceRef: source, targetRef: target, extensionElements: [], unknownAttributes: {} }
}

function crossings(paths: Waypoint[][]): number {
	const segs = paths.map((w) => w.slice(1).map((q, i) => [w[i] as Waypoint, q] as const))
	let n = 0
	for (let i = 0; i < segs.length; i++)
		for (let j = i + 1; j < segs.length; j++)
			for (const [a, b] of segs[i] ?? [])
				for (const [c, d] of segs[j] ?? []) {
					const h1 = a.y === b.y
					const h2 = c.y === d.y
					if (h1 === h2) continue
					const [h, v] = h1
						? [
								[a, b],
								[c, d],
							]
						: [
								[c, d],
								[a, b],
							]
					const [p, q] = h as [Waypoint, Waypoint]
					const [r, s] = v as [Waypoint, Waypoint]
					if (
						r.x > Math.min(p.x, q.x) &&
						r.x < Math.max(p.x, q.x) &&
						p.y > Math.min(r.y, s.y) &&
						p.y < Math.max(r.y, s.y)
					)
						n++
				}
	return n
}

describe("semantic layout: branch side next to exception handlers", () => {
	// Error handlers hang below the spine; a plain alternative of a gateway
	// between them would have to drop through their row.
	const process: BpmnProcess = {
		id: "p",
		flowElements: [
			node("s", "startEvent"),
			node("a"),
			boundary("ba", "a"),
			node("na"),
			node("ea", "endEvent"),
			node("g", "eventBasedGateway"),
			node("m", "intermediateCatchEvent"),
			node("t", "intermediateCatchEvent"),
			node("tc"),
			node("et", "endEvent"),
			node("c"),
			boundary("bc", "c"),
			node("nc"),
			node("ec", "endEvent"),
			node("e", "endEvent"),
		],
		sequenceFlows: [
			flow("f1", "s", "a"),
			flow("f2", "a", "g"),
			flow("f3", "g", "m"),
			flow("f4", "m", "c"),
			flow("f5", "c", "e"),
			flow("f6", "g", "t"),
			flow("f7", "t", "tc"),
			flow("f8", "tc", "et"),
			flow("f9", "ba", "na"),
			flow("f10", "na", "ea"),
			flow("f11", "bc", "nc"),
			flow("f12", "nc", "ec"),
		],
		extensionElements: [],
		textAnnotations: [],
		associations: [],
		unknownAttributes: {},
	}
	const result = layoutProcess(process)
	const cy = (id: string) => {
		const b = result.nodes.find((n) => n.id === id)?.bounds
		return b ? b.y + b.height / 2 : Number.NaN
	}

	it("sends the gateway's alternative above the spine, away from the handlers", () => {
		expect(cy("na")).toBeGreaterThan(cy("a"))
		expect(cy("t")).toBeLessThan(cy("g"))
	})

	it("draws the flows without crossings", () => {
		expect(crossings(result.edges.map((e) => e.waypoints))).toBe(0)
	})
})

describe("semantic layout: exception row under neighbouring hosts", () => {
	// Three activities in a row, each with an error handler ending at once: the
	// first handler's end event would sit in the second host's column.
	const ids = ["a", "b", "c"]
	const process: BpmnProcess = {
		id: "p",
		flowElements: [
			node("s", "startEvent"),
			...ids.flatMap((id) => [
				node(id),
				boundary(`b${id}`, id),
				node(`h${id}`),
				node(`e${id}`, "endEvent"),
			]),
			node("e", "endEvent"),
		],
		sequenceFlows: [
			flow("f0", "s", "a"),
			flow("f1", "a", "b"),
			flow("f2", "b", "c"),
			flow("f3", "c", "e"),
			...ids.flatMap((id) => [
				flow(`x${id}`, `b${id}`, `h${id}`),
				flow(`y${id}`, `h${id}`, `e${id}`),
			]),
		],
		extensionElements: [],
		textAnnotations: [],
		associations: [],
		unknownAttributes: {},
	}
	const result = layoutProcess(process)
	const box = (id: string) => result.nodes.find((n) => n.id === id)?.bounds
	const cx = (id: string) => {
		const b = box(id)
		return b ? b.x + b.width / 2 : Number.NaN
	}

	it("puts every handler straight under its host, on one row", () => {
		for (const id of ids) expect(cx(`h${id}`)).toBe(cx(id))
		expect(new Set(ids.map((id) => box(`h${id}`)?.y)).size).toBe(1)
	})

	it("drops each exception flow without a bend or a crossing", () => {
		for (const id of ids)
			expect(result.edges.find((e) => e.id === `x${id}`)?.waypoints.length).toBe(2)
		expect(crossings(result.edges.map((e) => e.waypoints))).toBe(0)
	})
})
