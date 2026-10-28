/**
 * Shared fixtures and assertions for the pool and lane tests: the round-trip
 * fixtures of core, an inline Flowable file in three orderings, and the guards
 * that every edit must pass on a Flowable document.
 */
import { readFileSync } from "node:fs"
import { join } from "node:path"
import {
	Bpmn,
	type BpmnBounds,
	type BpmnDefinitions,
	allLanes,
	applyAutoLayout,
	collaborationProblems,
	laneProblems,
	primaryProcess,
} from "@bpmnkit/core"
import { expect } from "vitest"

const ROUNDTRIP = join(import.meta.dirname, "..", "..", "core", "tests", "fixtures", "roundtrip")

/** A round-trip fixture of core, drawn by auto-layout when the file has no diagram. */
export function fixture(file: string): BpmnDefinitions {
	const defs = Bpmn.parse(readFileSync(join(ROUNDTRIP, file), "utf8"))
	// 02-collaboration has no diagram; drawn once, it stands in for one a person laid out.
	return defs.diagrams.length > 0 ? defs : Bpmn.parse(Bpmn.export(applyAutoLayout(defs)))
}

/** The bounds of `id` on the first diagram; throws when it has no shape there. */
export function boundsOf(defs: BpmnDefinitions, id: string): BpmnBounds {
	const shape = defs.diagrams[0]?.plane.shapes.find((s) => s.bpmnElement === id)
	if (!shape) throw new Error(`no shape for ${id}`)
	return shape.bounds
}

/** Whether the first diagram draws a shape for `id`. */
export const hasShape = (defs: BpmnDefinitions, id: string) =>
	defs.diagrams[0]?.plane.shapes.some((s) => s.bpmnElement === id) ?? false

/** Whether the first diagram draws an edge for `id`. */
export const hasEdge = (defs: BpmnDefinitions, id: string) =>
	defs.diagrams[0]?.plane.edges.some((e) => e.bpmnElement === id) ?? false

/** Every lane of the primary process, at any depth. */
export function lanesOf(defs: BpmnDefinitions) {
	return allLanes(primaryProcess(defs)?.laneSet)
}

/** The lane `id` of the primary process, if it has one. */
export function laneNamed(defs: BpmnDefinitions, id: string) {
	return lanesOf(defs).find((lane) => lane.id === id)
}

/** Every message flow of every collaboration. */
export function messageFlows(defs: BpmnDefinitions) {
	return defs.collaborations.flatMap((c) => c.messageFlows)
}

/** Every participant of every collaboration. */
export function participants(defs: BpmnDefinitions) {
	return defs.collaborations.flatMap((c) => c.participants)
}

/** The centre of `inner` lies within the vertical extent of `band`. */
export function inBand(inner: BpmnBounds, band: BpmnBounds): boolean {
	const cy = inner.y + inner.height / 2
	return cy >= band.y && cy <= band.y + band.height
}

/** Lanes, pools and messages stay well formed, and the document exports and parses back. */
export function expectSwimlanesSound(defs: BpmnDefinitions): void {
	const process = primaryProcess(defs)
	if (process) expect(laneProblems(process)).toEqual([])
	expect(collaborationProblems(defs)).toEqual([])
	for (const flow of messageFlows(defs)) expect(hasEdge(defs, flow.id), flow.id).toBe(true)
	for (const lane of lanesOf(defs)) expect(hasShape(defs, lane.id), lane.id).toBe(true)
	expect(() => Bpmn.parse(Bpmn.export(defs))).not.toThrow()
}

/** Every shape whose element is not in `except` has the bounds it had in `before`. */
export function expectUnmoved(
	before: BpmnDefinitions,
	after: BpmnDefinitions,
	except: string[],
): void {
	for (const s of before.diagrams[0]?.plane.shapes ?? []) {
		if (except.includes(s.bpmnElement)) continue
		expect(boundsOf(after, s.bpmnElement), s.bpmnElement).toEqual(s.bounds)
	}
}

// ── An inline Flowable file ──────────────────────────────────────────────────

/**
 * Where the executable process sits: `first` in document order; `second`, after
 * an empty partner process; `second-diagram`, second and also drawn on the
 * second diagram, after one that draws the partner process alone.
 */
export type FlowableOrder = "first" | "second" | "second-diagram"

const SHAPES = `
      <bpmndi:BPMNShape id="Participant_own_di" bpmnElement="Participant_own" isHorizontal="true"><omgdc:Bounds x="0" y="0" width="640" height="360"/></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Lane_sales_di" bpmnElement="Lane_sales" isHorizontal="true"><omgdc:Bounds x="30" y="0" width="610" height="120"/></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Lane_finance_di" bpmnElement="Lane_finance" isHorizontal="true"><omgdc:Bounds x="30" y="120" width="610" height="120"/></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Lane_ops_di" bpmnElement="Lane_ops" isHorizontal="true"><omgdc:Bounds x="30" y="240" width="610" height="120"/></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Start_1_di" bpmnElement="Start_1"><omgdc:Bounds x="80" y="42" width="36" height="36"/></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_review_di" bpmnElement="Task_review"><omgdc:Bounds x="160" y="20" width="100" height="80"/></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_ok_di" bpmnElement="Gateway_ok" isMarkerVisible="true"><omgdc:Bounds x="300" y="155" width="50" height="50"/></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_pay_di" bpmnElement="Task_pay"><omgdc:Bounds x="400" y="140" width="100" height="80"/></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="End_1_di" bpmnElement="End_1"><omgdc:Bounds x="532" y="282" width="36" height="36"/></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Participant_partner_di" bpmnElement="Participant_partner" isHorizontal="true"><omgdc:Bounds x="0" y="400" width="640" height="60"/></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Participant_bank_di" bpmnElement="Participant_bank" isHorizontal="true"><omgdc:Bounds x="0" y="490" width="640" height="60"/></bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Flow_1_di" bpmnElement="Flow_1"><omgdi:waypoint x="116" y="60"/><omgdi:waypoint x="160" y="60"/></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_2_di" bpmnElement="Flow_2"><omgdi:waypoint x="260" y="60"/><omgdi:waypoint x="325" y="60"/><omgdi:waypoint x="325" y="155"/></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_3_di" bpmnElement="Flow_3"><omgdi:waypoint x="350" y="180"/><omgdi:waypoint x="400" y="180"/></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_4_di" bpmnElement="Flow_4"><omgdi:waypoint x="500" y="180"/><omgdi:waypoint x="550" y="180"/><omgdi:waypoint x="550" y="282"/></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Message_pay_di" bpmnElement="Message_pay"><omgdi:waypoint x="450" y="220"/><omgdi:waypoint x="450" y="490"/></bpmndi:BPMNEdge>`

const EXECUTABLE = `
  <process id="Process_exec" name="Order" isExecutable="true" flowable:candidateStarterGroups="sales">
    <extensionElements>
      <flowable:executionListener event="start" class="com.acme.StartListener"/>
    </extensionElements>
    <laneSet id="LaneSet_1">
      <lane id="Lane_sales" name="Sales"><flowNodeRef>Start_1</flowNodeRef><flowNodeRef>Task_review</flowNodeRef></lane>
      <lane id="Lane_finance" name="Finance"><flowNodeRef>Gateway_ok</flowNodeRef><flowNodeRef>Task_pay</flowNodeRef></lane>
      <lane id="Lane_ops" name="Operations"><flowNodeRef>End_1</flowNodeRef></lane>
    </laneSet>
    <startEvent id="Start_1" name="Order received" flowable:formKey="orderForm"/>
    <userTask id="Task_review" name="Review" flowable:assignee="\${initiator}" flowable:candidateGroups="sales">
      <extensionElements>
        <flowable:taskListener event="create" delegateExpression="\${reviewListener}"/>
      </extensionElements>
    </userTask>
    <exclusiveGateway id="Gateway_ok" name="Approved?"/>
    <serviceTask id="Task_pay" name="Pay" flowable:async="true" flowable:class="com.acme.Pay">
      <extensionElements>
        <flowable:field name="channel"><flowable:string>sepa</flowable:string></flowable:field>
      </extensionElements>
    </serviceTask>
    <endEvent id="End_1" name="Done"/>
    <sequenceFlow id="Flow_1" sourceRef="Start_1" targetRef="Task_review"/>
    <sequenceFlow id="Flow_2" sourceRef="Task_review" targetRef="Gateway_ok"/>
    <sequenceFlow id="Flow_3" sourceRef="Gateway_ok" targetRef="Task_pay"/>
    <sequenceFlow id="Flow_4" sourceRef="Task_pay" targetRef="End_1"/>
  </process>`

const PARTNER = `
  <process id="Process_partner" name="Partner" isExecutable="false"/>`

const MAIN_DIAGRAM = `
  <bpmndi:BPMNDiagram id="BPMNDiagram_order">
    <bpmndi:BPMNPlane id="BPMNPlane_order" bpmnElement="Collaboration_1">${SHAPES}
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>`

const PARTNER_DIAGRAM = `
  <bpmndi:BPMNDiagram id="BPMNDiagram_partner">
    <bpmndi:BPMNPlane id="BPMNPlane_partner" bpmnElement="Process_partner"/>
  </bpmndi:BPMNDiagram>`

/**
 * The XML of a Flowable Modeler style file: pool Company over the executable
 * process `Process_exec` (a `flowable:*` attribute and extension elements on
 * the process and on its tasks, three flat lanes Sales, Finance and
 * Operations), the partner pool `Participant_partner` over the empty,
 * non-executable `Process_partner`, the black box `Participant_bank` with no
 * `processRef`, and the message flow `Message_pay` from `Task_pay` to the bank.
 */
export function flowableXml(order: FlowableOrder = "first"): string {
	const processes = order === "first" ? EXECUTABLE + PARTNER : PARTNER + EXECUTABLE
	const diagrams = order === "second-diagram" ? PARTNER_DIAGRAM + MAIN_DIAGRAM : MAIN_DIAGRAM
	return `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:flowable="http://flowable.org/bpmn" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:omgdc="http://www.omg.org/spec/DD/20100524/DC" xmlns:omgdi="http://www.omg.org/spec/DD/20100524/DI" targetNamespace="http://www.flowable.org/processdef">
  <collaboration id="Collaboration_1">
    <participant id="Participant_own" name="Company" processRef="Process_exec"/>
    <participant id="Participant_partner" name="Partner" processRef="Process_partner"/>
    <participant id="Participant_bank" name="Bank"/>
    <messageFlow id="Message_pay" name="Payment" sourceRef="Task_pay" targetRef="Participant_bank"/>
  </collaboration>${processes}${diagrams}
</definitions>`
}

/** {@link flowableXml}, parsed. */
export function flowableFixture(order: FlowableOrder = "first"): BpmnDefinitions {
	return Bpmn.parse(flowableXml(order))
}

/**
 * The executable process of {@link flowableXml} on its own, with no
 * collaboration, laid out by auto-layout: with its three lanes (drawn as bands
 * without a pool) when `laned`, else without a lane set.
 */
export function poolLessFlowable(laned: boolean): BpmnDefinitions {
	const process = laned ? EXECUTABLE : EXECUTABLE.replace(/<laneSet[\s\S]*<\/laneSet>/, "")
	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:flowable="http://flowable.org/bpmn" targetNamespace="http://www.flowable.org/processdef">${process}
</definitions>`
	return Bpmn.parse(Bpmn.export(applyAutoLayout(Bpmn.parse(xml))))
}

/**
 * {@link poolLessFlowable} (no lanes) plus a second process, `Other`, with a
 * start event and no pool, laid out by auto-layout: no collaboration yet, so
 * nothing is wrong with it until one exists.
 */
export function poolLessWithOther(): BpmnDefinitions {
	const xml = Bpmn.export(poolLessFlowable(false)).replace(
		"</definitions>",
		'<process id="Other" isExecutable="false"><startEvent id="o1"/></process></definitions>',
	)
	return Bpmn.parse(Bpmn.export(applyAutoLayout(Bpmn.parse(xml))))
}

/**
 * A pool `P` drawn vertically (`isHorizontal="false"`, 400 by 600) over the
 * executable process `Proc`: with two column lanes `LA` and `LB` when `laned`,
 * else without a lane set.
 */
export function verticalPoolXml(laned: boolean): string {
	const laneSet = laned
		? '<laneSet id="LS"><lane id="LA"><flowNodeRef>s</flowNodeRef></lane><lane id="LB"/></laneSet>'
		: ""
	const laneShapes = laned
		? `<bpmndi:BPMNShape id="LA_di" bpmnElement="LA" isHorizontal="false"><omgdc:Bounds x="0" y="30" width="200" height="570"/></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="LB_di" bpmnElement="LB" isHorizontal="false"><omgdc:Bounds x="200" y="30" width="200" height="570"/></bpmndi:BPMNShape>`
		: ""
	return `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:omgdc="http://www.omg.org/spec/DD/20100524/DC" targetNamespace="t">
  <collaboration id="C"><participant id="P" name="Vertical" processRef="Proc"/></collaboration>
  <process id="Proc" isExecutable="true">${laneSet}<startEvent id="s"/></process>
  <bpmndi:BPMNDiagram id="D">
    <bpmndi:BPMNPlane id="PL" bpmnElement="C">
      <bpmndi:BPMNShape id="P_di" bpmnElement="P" isHorizontal="false"><omgdc:Bounds x="0" y="0" width="400" height="600"/></bpmndi:BPMNShape>
      ${laneShapes}
      <bpmndi:BPMNShape id="s_di" bpmnElement="s"><omgdc:Bounds x="82" y="100" width="36" height="36"/></bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</definitions>`
}

/** {@link flowableXml} whose partner process has content: a start event, a task and a flow. */
export function lockedPartnerXml(): string {
	return flowableXml()
		.replace(
			'<process id="Process_partner" name="Partner" isExecutable="false"/>',
			`<process id="Process_partner" name="Partner" isExecutable="false">
    <startEvent id="Start_p"/>
    <task id="Task_p" name="Answer"/>
    <sequenceFlow id="Flow_p" sourceRef="Start_p" targetRef="Task_p"/>
  </process>`,
		)
		.replace(
			'<bpmndi:BPMNEdge id="Message_pay_di"',
			`<bpmndi:BPMNShape id="Start_p_di" bpmnElement="Start_p"><omgdc:Bounds x="80" y="412" width="36" height="36"/></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_p_di" bpmnElement="Task_p"><omgdc:Bounds x="160" y="410" width="100" height="40"/></bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Flow_p_di" bpmnElement="Flow_p"><omgdi:waypoint x="116" y="430"/><omgdi:waypoint x="160" y="430"/></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Message_pay_di"`,
		)
}

// ── The Flowable guard ───────────────────────────────────────────────────────

/** Deep enough for any model the parser builds; a deeper walk means a cycle. */
const MAX_DEPTH = 64

/**
 * The `flowable:*` attributes and extension elements of every model element
 * with an id, by id. Diagram interchange is skipped: Flowable keeps nothing
 * there.
 */
function flowableFacts(defs: BpmnDefinitions): Map<string, string> {
	const facts = new Map<string, string>()
	const walk = (node: unknown, depth: number): void => {
		if (depth > MAX_DEPTH) throw new Error("model nested too deep, or cyclic")
		if (Array.isArray(node)) {
			for (const item of node) walk(item, depth + 1)
			return
		}
		if (node === null || typeof node !== "object") return
		const record = node as Record<string, unknown>
		if (typeof record.id === "string") {
			const attributes = Object.entries((record.unknownAttributes ?? {}) as Record<string, string>)
				.filter(([key]) => key.startsWith("flowable:"))
				.sort(([a], [b]) => a.localeCompare(b))
			facts.set(record.id, JSON.stringify([attributes, record.extensionElements ?? []]))
		}
		for (const [key, value] of Object.entries(record)) {
			// Extension elements are opaque XML, compared whole above.
			if (key !== "extensionElements") walk(value, depth + 1)
		}
	}
	walk({ ...defs, diagrams: [] }, 0)
	return facts
}

/**
 * The Flowable guard (critique I15): every element that survives the edit has
 * the `flowable:*` attributes and extension elements it had, every process
 * keeps its `isExecutable`, and no new process leaves `isExecutable` unset,
 * which Flowable would read as executable.
 */
export function expectFlowableKept(before: BpmnDefinitions, after: BpmnDefinitions): void {
	const was = flowableFacts(before)
	for (const [id, facts] of flowableFacts(after)) {
		const old = was.get(id)
		if (old !== undefined) expect(facts, `flowable facts of ${id}`).toBe(old)
	}
	const executable = new Map(before.processes.map((p) => [p.id, p.isExecutable]))
	for (const process of after.processes) {
		if (executable.has(process.id)) {
			expect(process.isExecutable, `isExecutable of ${process.id}`).toBe(executable.get(process.id))
		} else {
			expect(process.isExecutable, `isExecutable of new ${process.id}`).not.toBeUndefined()
		}
	}
}

/** The process ids, and the diagram ids, in document order. */
export function documentOrder(defs: BpmnDefinitions): { processes: string[]; diagrams: string[] } {
	return { processes: defs.processes.map((p) => p.id), diagrams: defs.diagrams.map((d) => d.id) }
}
