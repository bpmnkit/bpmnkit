import { readFileSync, readdirSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import type {
	BpmnBounds,
	BpmnDefinitions,
	BpmnDiShape,
	BpmnFlowElement,
	BpmnProcess,
} from "../src/bpmn/bpmn-model.js"
import {
	Bpmn,
	applyAutoLayout,
	checkDiCompleteness,
	exportPreserving,
	placeNewShapes,
} from "../src/index.js"

/**
 * An edit adds a few elements to a diagram someone laid out. These tests are
 * about what the layout keeps: no existing shape moves, and what is new lands
 * in the right pool, lane or sub-process without covering anything.
 */

const RECRUITING = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Defs" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:collaboration id="Collab">
    <bpmn:participant id="P_Applicant" name="Bewerber" />
    <bpmn:participant id="P_Company" name="Unternehmen" processRef="Recruiting" />
    <bpmn:messageFlow id="MF_Docs" sourceRef="P_Applicant" targetRef="C_Docs" />
  </bpmn:collaboration>
  <bpmn:process id="Recruiting" isExecutable="true">
    <bpmn:laneSet id="LS">
      <bpmn:lane id="L_HR" name="Sachbearbeiter Personal">
        <bpmn:flowNodeRef>S_Start</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>T_Request</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>C_Docs</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>T_Check</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>G_Answer</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>T_Confirm</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>T_NewDate</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>E_Done</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>E_Rescheduled</bpmn:flowNodeRef>
      </bpmn:lane>
      <bpmn:lane id="L_Dept" name="Fachabteilung">
        <bpmn:flowNodeRef>Sub_Review</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>E_Reviewed</bpmn:flowNodeRef>
      </bpmn:lane>
    </bpmn:laneSet>
    <bpmn:startEvent id="S_Start" name="Bewerbung eingegangen" />
    <bpmn:userTask id="T_Request" name="Unterlagen anfordern" />
    <bpmn:intermediateCatchEvent id="C_Docs" name="Unterlagen erhalten"><bpmn:messageEventDefinition id="MED_Docs" /></bpmn:intermediateCatchEvent>
    <bpmn:userTask id="T_Check" name="Antwort auswerten" />
    <bpmn:exclusiveGateway id="G_Answer" name="Antwort?" />
    <bpmn:userTask id="T_Confirm" name="Termin bestaetigen" />
    <bpmn:userTask id="T_NewDate" name="Neuen Termin suchen" />
    <bpmn:endEvent id="E_Done" name="Termin steht" />
    <bpmn:endEvent id="E_Rescheduled" name="Neuer Termin" />
    <bpmn:subProcess id="Sub_Review" name="Fachliche Pruefung">
      <bpmn:startEvent id="Sub_Start" />
      <bpmn:userTask id="Sub_Task" name="Profil pruefen" />
      <bpmn:endEvent id="Sub_End" />
      <bpmn:sequenceFlow id="SF_s1" sourceRef="Sub_Start" targetRef="Sub_Task" />
      <bpmn:sequenceFlow id="SF_s2" sourceRef="Sub_Task" targetRef="Sub_End" />
    </bpmn:subProcess>
    <bpmn:endEvent id="E_Reviewed" name="Geprueft" />
    <bpmn:sequenceFlow id="SF_1" sourceRef="S_Start" targetRef="T_Request" />
    <bpmn:sequenceFlow id="SF_2" sourceRef="T_Request" targetRef="C_Docs" />
    <bpmn:sequenceFlow id="SF_3" sourceRef="C_Docs" targetRef="T_Check" />
    <bpmn:sequenceFlow id="SF_4" sourceRef="T_Check" targetRef="G_Answer" />
    <bpmn:sequenceFlow id="SF_Yes" name="Bestaetigung" sourceRef="G_Answer" targetRef="T_Confirm" />
    <bpmn:sequenceFlow id="SF_No" name="Neuer Termin" sourceRef="G_Answer" targetRef="T_NewDate" />
    <bpmn:sequenceFlow id="SF_5" sourceRef="T_Confirm" targetRef="Sub_Review" />
    <bpmn:sequenceFlow id="SF_6" sourceRef="T_NewDate" targetRef="E_Rescheduled" />
    <bpmn:sequenceFlow id="SF_7" sourceRef="Sub_Review" targetRef="E_Reviewed" />
    <bpmn:sequenceFlow id="SF_8" sourceRef="E_Reviewed" targetRef="E_Done" />
  </bpmn:process>
</bpmn:definitions>`

/** The recruiting collaboration with a layout, standing in for a file someone drew. */
function drawn(): BpmnDefinitions {
	// E_Reviewed → E_Done is not valid BPMN, but it keeps both lanes busy; drop it.
	const defs = Bpmn.parse(RECRUITING)
	const process = defs.processes[0] as BpmnProcess
	process.sequenceFlows = process.sequenceFlows.filter((f) => f.id !== "SF_8")
	return applyAutoLayout(defs)
}

function shapeMap(defs: BpmnDefinitions): Map<string, BpmnDiShape> {
	const out = new Map<string, BpmnDiShape>()
	for (const d of defs.diagrams) for (const s of d.plane.shapes) out.set(s.bpmnElement, s)
	return out
}

function process(defs: BpmnDefinitions): BpmnProcess {
	return defs.processes[0] as BpmnProcess
}

function node(
	type: BpmnFlowElement["type"],
	id: string,
	name?: string,
	extra: object = {},
): BpmnFlowElement {
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

function flow(id: string, sourceRef: string, targetRef: string, name?: string) {
	return {
		id,
		sourceRef,
		targetRef,
		...(name ? { name } : {}),
		extensionElements: [],
		unknownAttributes: {},
	}
}

function overlaps(a: BpmnBounds, b: BpmnBounds): boolean {
	return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
}

function inside(outer: BpmnBounds, inner: BpmnBounds): boolean {
	return (
		inner.x >= outer.x &&
		inner.y >= outer.y &&
		inner.x + inner.width <= outer.x + outer.width &&
		inner.y + inner.height <= outer.y + outer.height
	)
}

/** Distance from a point to a rectangle's outline area (0 inside or on it). */
function gap(p: { x: number; y: number }, r: BpmnBounds): number {
	const dx = Math.max(r.x - p.x, 0, p.x - (r.x + r.width))
	const dy = Math.max(r.y - p.y, 0, p.y - (r.y + r.height))
	return Math.hypot(dx, dy)
}

const FRAMES = new Set(["P_Applicant", "P_Company", "L_HR", "L_Dept", "Sub_Review", "Sub_Events"])

/** Every shape the diagram had keeps its place; frames may only grow. */
function expectKept(before: BpmnDefinitions, after: BpmnDefinitions): void {
	const now = shapeMap(after)
	for (const [id, old] of shapeMap(before)) {
		const next = now.get(id)
		expect(next, id).toBeDefined()
		if (!next) continue
		expect(next.bounds.x, id).toBe(old.bounds.x)
		expect(next.bounds.y, id).toBe(old.bounds.y)
		if (FRAMES.has(id)) {
			expect(next.bounds.width, id).toBeGreaterThanOrEqual(old.bounds.width)
			expect(next.bounds.height, id).toBeGreaterThanOrEqual(old.bounds.height)
		} else {
			expect(next.bounds, id).toEqual(old.bounds)
		}
	}
}

/** New shapes cover no other flow node, event or annotation. */
function expectClear(after: BpmnDefinitions, added: string[]): void {
	const shapes = shapeMap(after)
	for (const id of added) {
		const a = shapes.get(id)
		expect(a, id).toBeDefined()
		if (!a) continue
		for (const [other, b] of shapes) {
			if (other === id || FRAMES.has(other) || FRAMES.has(id)) continue
			const boundaryOfOther = id.startsWith("B_") || other.startsWith("B_") // boundary events sit on their host
			if (boundaryOfOther) continue
			expect(overlaps(a.bounds, b.bounds), `${id} covers ${other}`).toBe(false)
		}
	}
}

function expectDocked(after: BpmnDefinitions, flowIds: string[]): void {
	const shapes = shapeMap(after)
	const edges = new Map(after.diagrams.flatMap((d) => d.plane.edges.map((e) => [e.bpmnElement, e])))
	const refs = new Map<string, { sourceRef: string; targetRef: string }>()
	for (const p of after.processes) {
		const walk = (
			els: BpmnFlowElement[],
			flows: Array<{ id: string; sourceRef: string; targetRef: string }>,
		) => {
			for (const f of flows) refs.set(f.id, f)
			for (const el of els) {
				const sub = el as unknown as {
					flowElements?: BpmnFlowElement[]
					sequenceFlows?: typeof flows
				}
				if (sub.flowElements) walk(sub.flowElements, sub.sequenceFlows ?? [])
			}
		}
		walk(p.flowElements, p.sequenceFlows)
	}
	for (const c of after.collaborations) for (const m of c.messageFlows) refs.set(m.id, m)
	for (const id of flowIds) {
		const edge = edges.get(id)
		const ref = refs.get(id)
		expect(edge, id).toBeDefined()
		if (!edge || !ref) continue
		const first = edge.waypoints[0]
		const last = edge.waypoints[edge.waypoints.length - 1]
		const s = shapes.get(ref.sourceRef)?.bounds
		const t = shapes.get(ref.targetRef)?.bounds
		if (!first || !last || !s || !t) throw new Error(`${id}: missing geometry`)
		expect(gap(first, s), `${id} leaves its source`).toBeLessThanOrEqual(1)
		expect(gap(last, t), `${id} reaches its target`).toBeLessThanOrEqual(1)
		for (let i = 1; i < edge.waypoints.length; i++) {
			const p = edge.waypoints[i - 1]
			const q = edge.waypoints[i]
			if (p && q && edge.waypoints.length > 2) {
				expect(p.x === q.x || p.y === q.y, `${id} segment ${i} is orthogonal`).toBe(true)
			}
		}
	}
}

describe("placeNewShapes — S20-style edits", () => {
	it("adds a third gateway branch inside the lane without moving anything", () => {
		const before = drawn()
		const edited = structuredClone(before)
		const p = process(edited)
		p.flowElements.push(
			node("userTask", "T_Withdrawn", "Bewerbung als zurueckgezogen markieren"),
			node("endEvent", "E_Withdrawn", "Bewerbung zurueckgezogen"),
		)
		p.sequenceFlows.push(
			flow("SF_Cancel", "G_Answer", "T_Withdrawn", "Absage"),
			flow("SF_Cancel2", "T_Withdrawn", "E_Withdrawn"),
		)

		const result = placeNewShapes(edited)
		const after = result.definitions

		expect(result.placed).toEqual(["T_Withdrawn", "E_Withdrawn"])
		expect(result.routed.sort()).toEqual(["SF_Cancel", "SF_Cancel2"])
		expect(result.unplaced).toEqual([])
		expectKept(before, after)
		expectClear(after, ["T_Withdrawn", "E_Withdrawn"])
		expectDocked(after, ["SF_Cancel", "SF_Cancel2"])

		// Both land in the lane of the gateway and are listed in it.
		const shapes = shapeMap(after)
		const lane = shapes.get("L_HR")?.bounds as BpmnBounds
		expect(inside(lane, shapes.get("T_Withdrawn")?.bounds as BpmnBounds)).toBe(true)
		expect(inside(lane, shapes.get("E_Withdrawn")?.bounds as BpmnBounds)).toBe(true)
		expect(result.laneAssigned).toEqual(["T_Withdrawn", "E_Withdrawn"])
		expect(process(after).laneSet?.lanes[0]?.flowNodeRefs).toContain("T_Withdrawn")

		// The new end event follows its task to the right, and carries its name below it.
		const task = shapes.get("T_Withdrawn")?.bounds as BpmnBounds
		const end = shapes.get("E_Withdrawn") as BpmnDiShape
		expect(end.bounds.x).toBeGreaterThan(task.x + task.width)
		expect(end.label?.bounds?.y).toBeGreaterThan(end.bounds.y + end.bounds.height)
		// The branch label is drawn.
		const edge = after.diagrams[0]?.plane.edges.find((e) => e.bpmnElement === "SF_Cancel")
		expect(edge?.label?.bounds).toBeDefined()

		expect(checkDiCompleteness(after)).toEqual({ missingShapes: [], missingEdges: [] })
		// The input is untouched.
		expect(shapeMap(edited).has("T_Withdrawn")).toBe(false)
	})

	it("adds a withdrawal branch on the wait as a boundary event, with a message flow from the applicant pool", () => {
		const before = drawn()
		const edited = structuredClone(before)
		const p = process(edited)
		// Turn the wait into a receive task with an interrupting boundary event: a
		// common way to give a wait a second exit.
		p.flowElements.push(
			node("receiveTask", "R_Wait", "Auf Unterlagen warten"),
			node("boundaryEvent", "B_Withdraw", "Rueckzug der Bewerbung erhalten", {
				attachedToRef: "T_Check",
				eventDefinitions: [{ type: "message", id: "MED_W" }],
			}),
			node("userTask", "T_Mark", "Bewerbung als zurueckgezogen markieren"),
			node("endEvent", "E_Gone", "Bewerbung zurueckgezogen"),
		)
		p.sequenceFlows.push(flow("SF_W1", "B_Withdraw", "T_Mark"), flow("SF_W2", "T_Mark", "E_Gone"))
		edited.collaborations[0]?.messageFlows.push({
			id: "MF_Withdraw",
			sourceRef: "P_Applicant",
			targetRef: "B_Withdraw",
			unknownAttributes: {},
		})
		// R_Wait is unconnected on purpose: it must still get a place.

		const result = placeNewShapes(edited)
		const after = result.definitions
		expect(result.unplaced).toEqual([])
		expectKept(before, after)
		expectClear(after, ["R_Wait", "T_Mark", "E_Gone"])
		expectDocked(after, ["SF_W1", "SF_W2", "MF_Withdraw"])

		const shapes = shapeMap(after)
		const host = shapes.get("T_Check")?.bounds as BpmnBounds
		const boundary = shapes.get("B_Withdraw")?.bounds as BpmnBounds
		// Centred on the host's bottom border.
		expect(boundary.y + boundary.height / 2).toBe(host.y + host.height)
		expect(boundary.x).toBeGreaterThanOrEqual(host.x)
		expect(boundary.x + boundary.width).toBeLessThanOrEqual(host.x + host.width)
		// The task after the boundary event sits below the host.
		expect(shapes.get("T_Mark")?.bounds.y).toBeGreaterThan(host.y + host.height)

		// The message flow from the black-box pool is one vertical line.
		const mf = after.diagrams[0]?.plane.edges.find((e) => e.bpmnElement === "MF_Withdraw")
		expect(mf?.waypoints).toHaveLength(2)
		expect(mf?.waypoints[0]?.x).toBe(mf?.waypoints[1]?.x)
	})

	it("re-routes a flow the edit re-pointed at a new element", () => {
		const before = drawn()
		const edited = structuredClone(before)
		const p = process(edited)
		p.flowElements.push(node("eventBasedGateway", "G_Wait", "Was kommt zuerst?"))
		const sf2 = p.sequenceFlows.find((f) => f.id === "SF_2")
		if (!sf2) throw new Error("SF_2")
		sf2.targetRef = "G_Wait"
		p.sequenceFlows.push(flow("SF_G1", "G_Wait", "C_Docs"))

		const result = placeNewShapes(edited)
		expect(result.placed).toEqual(["G_Wait"])
		expect(result.rerouted).toEqual(["SF_2"])
		expect(result.routed).toEqual(["SF_G1"])
		expectKept(before, result.definitions)
		expectClear(result.definitions, ["G_Wait"])
		expectDocked(result.definitions, ["SF_2", "SF_G1"])

		const off = placeNewShapes(edited, { rerouteStale: false })
		expect(off.rerouted).toEqual([])
	})

	it("places a new node inside an existing expanded sub-process, growing it when full", () => {
		const before = drawn()
		const edited = structuredClone(before)
		const sub = process(edited).flowElements.find((e) => e.id === "Sub_Review") as unknown as {
			flowElements: BpmnFlowElement[]
			sequenceFlows: ReturnType<typeof flow>[]
		}
		sub.flowElements.push(node("userTask", "Sub_Extra", "Referenzen pruefen"))
		const toEnd = sub.sequenceFlows.find((f) => f.id === "SF_s2")
		if (!toEnd) throw new Error("SF_s2")
		toEnd.targetRef = "Sub_Extra"
		sub.sequenceFlows.push(flow("SF_s3", "Sub_Extra", "Sub_End"))

		const result = placeNewShapes(edited)
		const after = result.definitions
		expect(result.unplaced).toEqual([])
		expectKept(before, after)
		const shapes = shapeMap(after)
		const subShape = shapes.get("Sub_Review")?.bounds as BpmnBounds
		expect(inside(subShape, shapes.get("Sub_Extra")?.bounds as BpmnBounds)).toBe(true)
		// The lane and pool still hold the sub-process.
		expect(inside(shapes.get("L_Dept")?.bounds as BpmnBounds, subShape)).toBe(true)
		expect(inside(shapes.get("P_Company")?.bounds as BpmnBounds, subShape)).toBe(true)
		expectDocked(after, ["SF_s2", "SF_s3"])
	})

	it("lays out a new event sub-process with its content as one block", () => {
		const before = drawn()
		const edited = structuredClone(before)
		const start = node("startEvent", "Ev_Start", "Rueckzug erhalten", {
			eventDefinitions: [{ type: "message", id: "MED_Ev" }],
		})
		const task = node("userTask", "Ev_Task", "Als zurueckgezogen markieren")
		const end = node("endEvent", "Ev_End", "Zurueckgezogen")
		process(edited).flowElements.push(
			node("eventSubProcess", "Sub_Events", "Rueckzug", {
				triggeredByEvent: true,
				flowElements: [start, task, end],
				sequenceFlows: [flow("Ev_1", "Ev_Start", "Ev_Task"), flow("Ev_2", "Ev_Task", "Ev_End")],
				textAnnotations: [],
				associations: [],
				groups: [],
			}),
		)
		process(edited).laneSet?.lanes[1]?.flowNodeRefs.push("Sub_Events")

		const result = placeNewShapes(edited)
		const after = result.definitions
		expect(result.unplaced).toEqual([])
		expect(result.placed).toEqual(
			expect.arrayContaining(["Sub_Events", "Ev_Start", "Ev_Task", "Ev_End"]),
		)
		expectKept(before, after)
		const shapes = shapeMap(after)
		const block = shapes.get("Sub_Events") as BpmnDiShape
		expect(block.isExpanded).toBe(true)
		for (const id of ["Ev_Start", "Ev_Task", "Ev_End"]) {
			expect(inside(block.bounds, shapes.get(id)?.bounds as BpmnBounds), id).toBe(true)
		}
		expect(inside(shapes.get("L_Dept")?.bounds as BpmnBounds, block.bounds)).toBe(true)
		expectDocked(after, ["Ev_1", "Ev_2"])
	})

	it("adds a black-box pool below the others", () => {
		const before = drawn()
		const edited = structuredClone(before)
		edited.collaborations[0]?.participants.push({
			id: "P_Agency",
			name: "Agentur",
			unknownAttributes: {},
		})
		const result = placeNewShapes(edited)
		const shapes = shapeMap(result.definitions)
		const agency = shapes.get("P_Agency")?.bounds as BpmnBounds
		const lowest = Math.max(
			...["P_Applicant", "P_Company"].map((id) => {
				const b = shapes.get(id)?.bounds as BpmnBounds
				return b.y + b.height
			}),
		)
		expect(agency.y).toBeGreaterThan(lowest)
		expectKept(before, result.definitions)
	})

	it("reports a new lane instead of moving the lanes below", () => {
		const edited = structuredClone(drawn())
		process(edited).laneSet?.lanes.push({
			id: "L_New",
			name: "Neu",
			flowNodeRefs: [],
			unknownAttributes: {},
		})
		const result = placeNewShapes(edited)
		expect(result.unplaced.map((u) => u.id)).toEqual(["L_New"])
	})

	it("reports a document without a diagram", () => {
		const result = placeNewShapes(Bpmn.parse(RECRUITING))
		expect(result.placed).toEqual([])
		expect(result.unplaced[0]?.reason).toContain("applyAutoLayout")
	})

	it("survives exportPreserving: the original shapes keep their bounds in the written file", () => {
		const before = drawn()
		const original = Bpmn.export(before)
		const edited = Bpmn.parse(original)
		const p = process(edited)
		p.flowElements.push(node("userTask", "T_Withdrawn", "Zurueckgezogen markieren"))
		p.sequenceFlows.push(flow("SF_Cancel", "G_Answer", "T_Withdrawn", "Absage"))
		const xml = exportPreserving(original, placeNewShapes(edited).definitions)
		const reread = Bpmn.parse(xml)
		expectKept(Bpmn.parse(original), reread)
		expect(shapeMap(reread).has("T_Withdrawn")).toBe(true)
		expect(checkDiCompleteness(reread).missingEdges).toEqual([])
	})
})

const CORPUS = join(dirname(fileURLToPath(import.meta.url)), "fixtures", "roundtrip")

describe("placeNewShapes — reference diagrams", () => {
	/**
	 * Diagrams drawn by other tools, with their own spacing: append a task after
	 * the first drawn activity or event of every process and check that nothing
	 * moved and nothing is covered.
	 */
	const files = readdirSync(CORPUS).filter((f) => f.startsWith("miwg-") && f.endsWith(".bpmn"))
	for (const file of files) {
		it(`appends a task in ${file}`, () => {
			const before = Bpmn.parse(readFileSync(join(CORPUS, file), "utf-8"))
			const edited = structuredClone(before)
			const drawnIds = shapeMap(before)
			const added: string[] = []
			for (const p of edited.processes) {
				const anchor = p.flowElements.find(
					(e) => drawnIds.has(e.id) && e.type !== "boundaryEvent" && !e.type.startsWith("data"),
				)
				if (!anchor) continue
				const id = `New_${p.id}`
				p.flowElements.push(node("task", id, "Added"))
				p.sequenceFlows.push(flow(`NewFlow_${p.id}`, anchor.id, id))
				added.push(id)
			}
			const result = placeNewShapes(edited)
			for (const id of added) expect(result.placed, `${file}: ${id}`).toContain(id)
			const after = shapeMap(result.definitions)
			const frames = new Set(
				[
					...result.definitions.collaborations.flatMap((c) => c.participants.map((p) => p.id)),
					...result.definitions.processes.flatMap((p) => (p.laneSet?.lanes ?? []).map((l) => l.id)),
				].concat(result.resized),
			)
			for (const [id, old] of drawnIds) {
				const next = after.get(id)
				expect(next?.bounds.x, `${file}: ${id}`).toBe(old.bounds.x)
				expect(next?.bounds.y, `${file}: ${id}`).toBe(old.bounds.y)
				if (!frames.has(id)) expect(next?.bounds, `${file}: ${id}`).toEqual(old.bounds)
			}
			// Pools can sit on diagrams of their own, so compare within one plane.
			for (const diagram of result.definitions.diagrams) {
				const plane = diagram.plane.shapes
				for (const id of added) {
					const mine = plane.find((s) => s.bpmnElement === id)
					if (!mine) continue
					for (const shape of plane) {
						const other = shape.bpmnElement
						if (other === id || frames.has(other)) continue
						const el = result.definitions.processes
							.flatMap((p) => p.flowElements)
							.find((e) => e.id === other)
						if (
							el &&
							["subProcess", "adHocSubProcess", "eventSubProcess", "transaction"].includes(el.type)
						) {
							continue
						}
						expect(overlaps(mine.bounds, shape.bounds), `${file}: ${id} covers ${other}`).toBe(
							false,
						)
					}
				}
			}
		})
	}
})
