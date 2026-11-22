import { describe, expect, it } from "vitest"
import type { BpmnBounds, BpmnFlowElement, BpmnProcess, Waypoint } from "../src/bpmn/bpmn-model.js"
import { Bpmn, makeRoom, placeNewShapes } from "../src/index.js"

/**
 * An edit inserts a checked step with a correction loop on a boundary event
 * into a hand-drawn row. The loop back and the exception drop must not share
 * a line, and the boundary event's name must stay clear of both.
 */
const BASE = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="D" targetNamespace="t">
  <bpmn:process id="P" isExecutable="true">
    <bpmn:startEvent id="S" name="Form arrived" />
    <bpmn:userTask id="T_Fill" name="Fill in form" />
    <bpmn:userTask id="T_Sign" name="Sign form" />
    <bpmn:endEvent id="E" name="Form done" />
    <bpmn:sequenceFlow id="F1" sourceRef="S" targetRef="T_Fill" />
    <bpmn:sequenceFlow id="F2" sourceRef="T_Fill" targetRef="T_Sign" />
    <bpmn:sequenceFlow id="F3" sourceRef="T_Sign" targetRef="E" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="Dg"><bpmndi:BPMNPlane id="Pl" bpmnElement="P">
    <bpmndi:BPMNShape id="S_di" bpmnElement="S"><dc:Bounds x="152" y="182" width="36" height="36" /><bpmndi:BPMNLabel><dc:Bounds x="135" y="225" width="70" height="14" /></bpmndi:BPMNLabel></bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="T_Fill_di" bpmnElement="T_Fill"><dc:Bounds x="240" y="160" width="100" height="80" /></bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="T_Sign_di" bpmnElement="T_Sign"><dc:Bounds x="400" y="160" width="100" height="80" /></bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="E_di" bpmnElement="E"><dc:Bounds x="562" y="182" width="36" height="36" /><bpmndi:BPMNLabel><dc:Bounds x="548" y="225" width="64" height="14" /></bpmndi:BPMNLabel></bpmndi:BPMNShape>
    <bpmndi:BPMNEdge id="F1_di" bpmnElement="F1"><di:waypoint x="188" y="200" /><di:waypoint x="240" y="200" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="F2_di" bpmnElement="F2"><di:waypoint x="340" y="200" /><di:waypoint x="400" y="200" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="F3_di" bpmnElement="F3"><di:waypoint x="500" y="200" /><di:waypoint x="562" y="200" /></bpmndi:BPMNEdge>
  </bpmndi:BPMNPlane></bpmndi:BPMNDiagram>
</bpmn:definitions>`

function el(type: string, id: string, name?: string, extra: object = {}): BpmnFlowElement {
	return {
		id,
		type,
		...(name ? { name } : {}),
		incoming: [],
		outgoing: [],
		extensionElements: [],
		unknownAttributes: {},
		...extra,
	} as unknown as BpmnFlowElement
}

function flow(id: string, sourceRef: string, targetRef: string) {
	return { id, sourceRef, targetRef, extensionElements: [], unknownAttributes: {} }
}

type Seg = [Waypoint, Waypoint]
const segs = (w: Waypoint[]): Seg[] => w.slice(1).map((q, i) => [w[i] as Waypoint, q])

/** Length two axis-parallel segments run along the same line. */
function shared([a, b]: Seg, [c, d]: Seg): number {
	if (a.x === b.x && c.x === d.x && a.x === c.x)
		return (
			Math.min(Math.max(a.y, b.y), Math.max(c.y, d.y)) -
			Math.max(Math.min(a.y, b.y), Math.min(c.y, d.y))
		)
	if (a.y === b.y && c.y === d.y && a.y === c.y)
		return (
			Math.min(Math.max(a.x, b.x), Math.max(c.x, d.x)) -
			Math.max(Math.min(a.x, b.x), Math.min(c.x, d.x))
		)
	return 0
}

function hits([p, q]: Seg, r: BpmnBounds): boolean {
	const x1 = Math.min(p.x, q.x)
	const x2 = Math.max(p.x, q.x)
	const y1 = Math.min(p.y, q.y)
	const y2 = Math.max(p.y, q.y)
	return x2 > r.x && x1 < r.x + r.width && y2 > r.y && y1 < r.y + r.height
}

describe("placeNewShapes: correction loop on a boundary event", () => {
	const defs = Bpmn.parse(BASE)
	const p = defs.processes[0] as BpmnProcess
	p.flowElements.push(
		el("exclusiveGateway", "G_Merge"),
		el("serviceTask", "T_Check", "Check form"),
		el("boundaryEvent", "B_Bad", "Form invalid", {
			attachedToRef: "T_Check",
			cancelActivity: true,
			eventDefinitions: [{ type: "error" }],
		}),
		el("userTask", "T_Fix", "Fix form"),
	)
	p.sequenceFlows = p.sequenceFlows.filter((f) => f.id !== "F2")
	const base = defs.diagrams[0]?.plane
	if (base) base.edges = base.edges.filter((e) => e.bpmnElement !== "F2")
	p.sequenceFlows.push(
		flow("N1", "T_Fill", "G_Merge"),
		flow("N2", "G_Merge", "T_Check"),
		flow("N3", "T_Check", "T_Sign"),
		flow("N4", "B_Bad", "T_Fix"),
		flow("N5", "T_Fix", "G_Merge"),
	)
	const placed = placeNewShapes(makeRoom(defs).definitions).definitions
	const plane = placed.diagrams[0]?.plane
	const edge = (id: string) => plane?.edges.find((e) => e.bpmnElement === id)?.waypoints ?? []
	const shape = (id: string) => plane?.shapes.find((s) => s.bpmnElement === id)

	it("keeps the loop back off the exception drop", () => {
		for (const a of segs(edge("N4")))
			for (const b of segs(edge("N5"))) expect(shared(a, b)).toBeLessThanOrEqual(0)
	})

	it("keeps the boundary event's name clear of every edge", () => {
		const label = shape("B_Bad")?.label?.bounds as BpmnBounds
		expect(label).toBeDefined()
		for (const e of plane?.edges ?? [])
			for (const s of segs(e.waypoints)) expect(hits(s, label), e.bpmnElement).toBe(false)
	})
})
