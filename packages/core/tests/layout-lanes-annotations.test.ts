import { describe, expect, it } from "vitest"
import { applyAutoLayout } from "../src/bpmn/auto-layout.js"
import type { BpmnBounds, BpmnDefinitions, BpmnDiEdge } from "../src/bpmn/bpmn-model.js"
import { Bpmn } from "../src/bpmn/index.js"

const NS = `xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" id="D" targetNamespace="t"`

const LANES = `<bpmn:definitions ${NS}>
<bpmn:process id="P"><bpmn:laneSet id="LS">
<bpmn:lane id="L1"><bpmn:flowNodeRef>s</bpmn:flowNodeRef><bpmn:flowNodeRef>a</bpmn:flowNodeRef></bpmn:lane>
<bpmn:lane id="L2"><bpmn:flowNodeRef>b</bpmn:flowNodeRef><bpmn:flowNodeRef>e</bpmn:flowNodeRef></bpmn:lane>
</bpmn:laneSet>
<bpmn:startEvent id="s" /><bpmn:task id="a" /><bpmn:task id="b" /><bpmn:endEvent id="e" />
<bpmn:sequenceFlow id="f1" sourceRef="s" targetRef="a" /><bpmn:sequenceFlow id="f2" sourceRef="a" targetRef="b" /><bpmn:sequenceFlow id="f3" sourceRef="b" targetRef="e" />
</bpmn:process></bpmn:definitions>`

function shapesOf(defs: BpmnDefinitions, diagram = 0): Map<string, BpmnBounds> {
	return new Map(defs.diagrams[diagram]?.plane.shapes.map((s) => [s.bpmnElement, s.bounds]) ?? [])
}

function edgeOf(defs: BpmnDefinitions, id: string): BpmnDiEdge | undefined {
	return defs.diagrams[0]?.plane.edges.find((e) => e.bpmnElement === id)
}

function inside(inner: BpmnBounds, outer: BpmnBounds): boolean {
	return (
		inner.x >= outer.x &&
		inner.y >= outer.y &&
		inner.x + inner.width <= outer.x + outer.width &&
		inner.y + inner.height <= outer.y + outer.height
	)
}

describe("layout — lanes of a process outside any pool", () => {
	// Regression: the semantic engine placed nodes in lane bands, but no lane
	// shapes were written, so the bands were invisible.
	it("draws the semantic engine's lane bands around their nodes, header clear", () => {
		const shapes = shapesOf(applyAutoLayout(Bpmn.parse(LANES)))
		const l1 = shapes.get("L1")
		const l2 = shapes.get("L2")
		if (!l1 || !l2) throw new Error("a lane has no shape")
		expect(l1.x).toBe(0)
		expect(l2.y).toBe(l1.y + l1.height)
		for (const [id, lane] of [
			["s", l1],
			["a", l1],
			["b", l2],
			["e", l2],
		] as const) {
			const node = shapes.get(id)
			if (!node) throw new Error(`${id} has no shape`)
			expect(inside(node, lane)).toBe(true)
			expect(node.x).toBeGreaterThanOrEqual(lane.x + 30)
		}
	})

	it("tiles lanes over the content with the grid engine", () => {
		const shapes = shapesOf(applyAutoLayout(Bpmn.parse(LANES), "grid"))
		const l1 = shapes.get("L1")
		const l2 = shapes.get("L2")
		if (!l1 || !l2) throw new Error("a lane has no shape")
		const top = Math.min(l1.y, l2.y)
		const bottom = Math.max(l1.y + l1.height, l2.y + l2.height)
		for (const id of ["s", "a", "b", "e"]) {
			const node = shapes.get(id)
			if (!node) throw new Error(`${id} has no shape`)
			expect(node.y).toBeGreaterThanOrEqual(top)
			expect(node.y + node.height).toBeLessThanOrEqual(bottom)
			expect(node.x).toBeGreaterThanOrEqual(30)
		}
	})

	it("draws the lanes of a second root process on that process's own plane", () => {
		const laid = applyAutoLayout(
			Bpmn.parse(
				LANES.replace(
					"<bpmn:process id=",
					`<bpmn:process id="Q"><bpmn:startEvent id="q" /></bpmn:process><bpmn:process id=`,
				),
			),
		)
		expect(shapesOf(laid, 0).has("L1")).toBe(false)
		const plane = laid.diagrams.find((d) => d.plane.bpmnElement === "P")
		expect(plane?.plane.shapes.map((s) => s.bpmnElement)).toEqual(
			expect.arrayContaining(["L1", "L2"]),
		)
	})
})

describe("layout — associations between two text annotations", () => {
	// Regression: only an annotation linked to a flow node got its association drawn.
	it("draws them and packs the linked annotation beside its partner", () => {
		const laid = applyAutoLayout(
			Bpmn.parse(`<bpmn:definitions ${NS}>
<bpmn:process id="P"><bpmn:startEvent id="s" /><bpmn:task id="t" /><bpmn:sequenceFlow id="f" sourceRef="s" targetRef="t" />
<bpmn:textAnnotation id="N1"><bpmn:text>On t</bpmn:text></bpmn:textAnnotation>
<bpmn:textAnnotation id="N2"><bpmn:text>On N1</bpmn:text></bpmn:textAnnotation>
<bpmn:association id="a1" sourceRef="t" targetRef="N1" /><bpmn:association id="a2" sourceRef="N2" targetRef="N1" />
</bpmn:process></bpmn:definitions>`),
		)
		const shapes = shapesOf(laid)
		const n1 = shapes.get("N1")
		const n2 = shapes.get("N2")
		if (!n1 || !n2) throw new Error("an annotation has no shape")
		const edge = edgeOf(laid, "a2")
		expect(edge?.waypoints).toHaveLength(2)
		const [from, to] = edge?.waypoints ?? []
		// Source end on N2's outline, target end on N1's.
		expect(from && inside({ ...from, width: 0, height: 0 }, n2)).toBe(true)
		expect(to && inside({ ...to, width: 0, height: 0 }, n1)).toBe(true)
		// Packed next to N1 rather than at the fallback origin.
		expect(Math.abs(n2.x - n1.x)).toBeLessThanOrEqual(n1.width)
		expect(Math.abs(n2.y - n1.y)).toBeLessThanOrEqual(n1.height + 40)
	})

	it("draws them inside a pool that holds only annotations", () => {
		const laid = applyAutoLayout(
			Bpmn.parse(`<bpmn:definitions ${NS}>
<bpmn:collaboration id="C"><bpmn:participant id="PA" processRef="Pn" /><bpmn:participant id="PB" processRef="Pw" /></bpmn:collaboration>
<bpmn:process id="Pn"><bpmn:textAnnotation id="A1"><bpmn:text>Note</bpmn:text></bpmn:textAnnotation><bpmn:textAnnotation id="A2"><bpmn:text>Another</bpmn:text></bpmn:textAnnotation><bpmn:association id="a" sourceRef="A1" targetRef="A2" /></bpmn:process>
<bpmn:process id="Pw"><bpmn:startEvent id="s" /><bpmn:endEvent id="e" /><bpmn:sequenceFlow id="f" sourceRef="s" targetRef="e" /></bpmn:process>
</bpmn:definitions>`),
		)
		const pool = shapesOf(laid).get("PA")
		const edge = edgeOf(laid, "a")
		if (!pool || !edge) throw new Error("pool or association missing")
		for (const wp of edge.waypoints) expect(inside({ ...wp, width: 0, height: 0 }, pool)).toBe(true)
	})
})
