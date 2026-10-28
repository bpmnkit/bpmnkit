/**
 * WP8d semantics: lane membership follows the drawing, nodes stay inside the
 * own pool, and lanes and partner pools can be deleted. Every op runs through
 * the Flowable guard.
 */
import {
	Bpmn,
	type BpmnDefinitions,
	laneOf,
	laneProblems,
	parseProcessDelta,
	primaryProcess,
	writeProcessText,
} from "@bpmnkit/core"
import { describe, expect, it } from "vitest"
import { copyElements } from "../src/modeling.js"
import { type EditorOp, applyOp } from "../src/ops.js"
import { applyProcessDelta } from "../src/process-delta.js"
import { canDeleteSwimlane, isBlackBox, primaryFirst, primaryPlane } from "../src/swimlanes.js"
import {
	boundsOf,
	documentOrder,
	expectFlowableKept,
	expectSwimlanesSound,
	expectUnmoved,
	fixture,
	flowableFixture,
	flowableXml,
	hasEdge,
	hasShape,
	laneNamed,
	lockedPartnerXml,
	messageFlows,
	participants,
} from "./swimlane-helpers.js"

const FIXTURE_08 = "08-flowable-lanes-pools.bpmn"

/** Applies `op` and holds it to the Flowable guard. */
function run(defs: BpmnDefinitions, op: EditorOp): BpmnDefinitions {
	const after = applyOp(defs, op).defs
	expectFlowableKept(defs, after)
	return after
}

/** The lane refs of the primary process: the leaf a node is in, by node id. */
function leafOf(defs: BpmnDefinitions, id: string): string | undefined {
	const process = primaryProcess(defs)
	return process ? laneOf(process, id)?.id : undefined
}

function expectLanesSound(defs: BpmnDefinitions): void {
	const process = primaryProcess(defs)
	if (!process) throw new Error("no process")
	expect(laneProblems(process)).toEqual([])
}

/** `op` changes nothing: the very same document, and nothing created. */
function expectRefused(defs: BpmnDefinitions, op: EditorOp): void {
	const r = applyOp(defs, op)
	expect(r.defs).toBe(defs)
	expect(r.created).toEqual([])
}

const move = (id: string, dx: number, dy: number): EditorOp => ({
	kind: "move",
	moves: [{ id, dx, dy }],
})

const task = (x: number, y: number, seed = "t"): EditorOp => ({
	kind: "createShape",
	type: "task",
	bounds: { x, y, width: 100, height: 80 },
	seed,
})

describe("8d.1 lane refs follow a moved node", () => {
	it("moves a node's ref to the lane its centre lands in", () => {
		const after = run(flowableFixture(), move("Task_review", 0, 120))
		expect(leafOf(after, "Task_review")).toBe("Lane_finance")
		expect(laneNamed(after, "Lane_sales")?.flowNodeRefs).toEqual(["Start_1"])
		expectLanesSound(after)
	})

	it("leaves the lane refs byte-identical for a move within the lane", () => {
		const defs = flowableFixture()
		const after = run(defs, move("Task_review", 20, 0))
		expect(primaryProcess(after)?.laneSet).toBe(primaryProcess(defs)?.laneSet)
	})

	it("keeps the lane of a node dropped outside every lane", () => {
		const defs = flowableFixture()
		// Centre x 15: inside the pool, in its header strip, in no lane.
		const after = run(defs, move("Task_review", -195, 0))
		expect(boundsOf(after, "Task_review").x).toBe(-35)
		expect(primaryProcess(after)?.laneSet).toBe(primaryProcess(defs)?.laneSet)
	})

	it("carries a boundary event with its host, and leaves it out when moved alone", () => {
		const attached = run(flowableFixture(), {
			kind: "createBoundaryEvent",
			hostId: "Task_pay",
			eventDefType: "timer",
			bounds: { x: 432, y: 202, width: 36, height: 36 },
			seed: "b",
		})
		const boundary = primaryProcess(attached)?.flowElements.find(
			(el) => el.type === "boundaryEvent",
		)
		if (!boundary) throw new Error("no boundary event")
		const after = run(attached, move("Task_pay", 0, 120))
		expect(leafOf(after, "Task_pay")).toBe("Lane_ops")
		expect(leafOf(after, boundary.id)).toBe("Lane_ops")
		expectLanesSound(after)
		const alone = run(attached, move(boundary.id, 0, 60))
		expect(leafOf(alone, boundary.id)).toBe("Lane_finance")
	})

	it("never lists a data reference in a lane", () => {
		const xml = flowableXml()
			.replace(
				'<endEvent id="End_1"',
				'<dataObjectReference id="Data_1"/>\n    <endEvent id="End_1"',
			)
			.replace(
				'<bpmndi:BPMNEdge id="Flow_1_di"',
				`<bpmndi:BPMNShape id="Data_1_di" bpmnElement="Data_1"><omgdc:Bounds x="200" y="150" width="36" height="50"/></bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Flow_1_di"`,
			)
		const defs = Bpmn.parse(xml)
		const after = run(defs, move("Data_1", 0, 120))
		expect(boundsOf(after, "Data_1").y).toBe(270)
		expect(primaryProcess(after)?.laneSet).toBe(primaryProcess(defs)?.laneSet)
	})

	it("keeps the ancestor-union convention of nested lanes (fixture 08)", () => {
		const defs = fixture(FIXTURE_08)
		const up = run(defs, move("ship", 0, -140))
		expect(leafOf(up, "ship")).toBe("Lane_desk")
		expect(laneNamed(up, "Lane_sales")?.flowNodeRefs).toContain("ship")
		expect(laneNamed(up, "Lane_ops")?.flowNodeRefs).toEqual(["rejected", "done"])
		expectLanesSound(up)

		const across = run(defs, move("review", 0, 120))
		expect(laneNamed(across, "Lane_inside")?.flowNodeRefs).toEqual(["start"])
		expect(laneNamed(across, "Lane_desk")?.flowNodeRefs).toEqual(["decide", "review"])
		expect(laneNamed(across, "Lane_sales")?.flowNodeRefs).toContain("review")
		expectLanesSound(across)

		const within = run(defs, move("review", 10, 0))
		expect(primaryProcess(within)?.laneSet).toBe(primaryProcess(defs)?.laneSet)
	})

	it("reassigns the lane refs on the executable process when it is listed second", () => {
		const defs = flowableFixture("second")
		const after = run(defs, move("Task_review", 0, 240))
		expect(leafOf(after, "Task_review")).toBe("Lane_ops")
		expect(documentOrder(after)).toEqual(documentOrder(defs))
	})
})

describe("8d.1 lane refs of new nodes", () => {
	it("puts a new node in the lane its centre is in", () => {
		const r = applyOp(flowableFixture(), task(300, 260))
		const [id] = r.created
		expect(leafOf(r.defs, id ?? "")).toBe("Lane_ops")
		expectLanesSound(r.defs)
		expectFlowableKept(flowableFixture(), r.defs)
	})

	it("puts a new node drawn outside every lane in the lane of what it follows", () => {
		const defs = flowableFixture()
		const r = applyOp(defs, {
			kind: "createConnected",
			sourceId: "Task_pay",
			type: "task",
			// Centre (15, 300): in the pool's header strip.
			bounds: { x: -35, y: 260, width: 100, height: 80 },
			waypoints: [],
			seed: "c",
		})
		const [id] = r.created
		expect(leafOf(r.defs, id ?? "")).toBe("Lane_finance")
		expectLanesSound(r.defs)
		expectFlowableKept(defs, r.defs)
	})

	it("puts a new boundary event in its host's lane", () => {
		const defs = flowableFixture()
		const r = applyOp(defs, {
			kind: "createBoundaryEvent",
			hostId: "Task_pay",
			eventDefType: null,
			// Its centre lies in the lane below; the host decides.
			bounds: { x: 432, y: 202, width: 36, height: 36 },
			seed: "b",
		})
		expect(leafOf(r.defs, r.created[0] ?? "")).toBe("Lane_finance")
		expectLanesSound(r.defs)
		expectFlowableKept(defs, r.defs)
	})

	it("puts pasted nodes in the lane they land in, their boundary events with them", () => {
		const attached = run(flowableFixture(), {
			kind: "createBoundaryEvent",
			hostId: "Task_review",
			eventDefType: null,
			bounds: { x: 192, y: 82, width: 36, height: 36 },
			seed: "b",
		})
		const clipboard = copyElements(primaryFirst(attached), ["Task_review"])
		const r = applyOp(attached, { kind: "paste", clipboard, offsetX: 0, offsetY: 240, seed: "p" })
		expect(r.created).toHaveLength(2)
		for (const id of r.created) expect(leafOf(r.defs, id), id).toBe("Lane_ops")
		expectLanesSound(r.defs)
		expectFlowableKept(attached, r.defs)
	})

	it("puts a node created in fixture 08's nested lanes in the leaf only, as the file does there", () => {
		const defs = fixture(FIXTURE_08)
		const r = applyOp(defs, task(400, 140))
		const [id] = r.created
		expect(leafOf(r.defs, id ?? "")).toBe("Lane_desk")
		expect(laneNamed(r.defs, "Lane_sales")?.flowNodeRefs).toContain(id)
		expectLanesSound(r.defs)
		expectFlowableKept(defs, r.defs)
	})
})

describe("I4 nodes stay inside the own pool", () => {
	it("refuses a move into a black box, between pools or with one node of several there", () => {
		const defs = flowableFixture()
		expect(run(defs, move("Task_review", 0, 460))).toBe(defs)
		expect(run(defs, move("Task_review", 0, 410))).toBe(defs)
		expect(run(defs, move("Task_review", 0, 320))).toBe(defs)
		const mixed: EditorOp = {
			kind: "move",
			moves: [
				{ id: "Task_review", dx: 0, dy: 460 },
				{ id: "Task_pay", dx: 20, dy: 0 },
			],
		}
		expect(run(defs, mixed)).toBe(defs)
	})

	it("refuses to create or paste a node in a black box or outside every pool", () => {
		const defs = flowableFixture()
		expectRefused(defs, task(200, 390))
		expectRefused(defs, task(200, 480))
		expectRefused(defs, task(700, 100))
		const clipboard = copyElements(primaryFirst(defs), ["Task_review"])
		const paste: EditorOp = { kind: "paste", clipboard, offsetX: 0, offsetY: 460, seed: "p" }
		expectRefused(defs, paste)
	})

	it("refuses a node in a partner pool that draws a process with content", () => {
		const defs = Bpmn.parse(lockedPartnerXml())
		expect(run(defs, move("Task_review", 0, 400))).toBe(defs)
	})

	it("lets a process with no pool place nodes anywhere", () => {
		const defs = run(flowableFixture(), { kind: "delete", ids: [] })
		const poolless = Bpmn.parse(
			Bpmn.export({
				...defs,
				collaborations: [],
				processes: defs.processes.map((p) => ({ ...p, laneSet: undefined })),
				diagrams: [],
			}),
		)
		const r = applyOp(poolless, task(2000, 2000))
		expect(r.created).toHaveLength(1)
	})

	it("widens the pool and every lane on its right edge for a node that crosses it", () => {
		const defs = flowableFixture()
		// End_1 spans 612 to 648, its centre inside the pool; the pool reaches 30 past it.
		const after = run(defs, move("End_1", 80, 0))
		expect(boundsOf(after, "Participant_own")).toEqual({ x: 0, y: 0, width: 678, height: 360 })
		for (const lane of ["Lane_sales", "Lane_finance", "Lane_ops"]) {
			expect(boundsOf(after, lane).x + boundsOf(after, lane).width, lane).toBe(678)
		}
		expectUnmoved(defs, after, [
			"End_1",
			"Participant_own",
			"Lane_sales",
			"Lane_finance",
			"Lane_ops",
		])
		expectSwimlanesSound(after)
	})

	it("deepens the pool and its bottom lane, and moves what is below down by as much", () => {
		const defs = flowableFixture()
		// End_1 spans 342 to 378: its centre is on the pool's bottom edge, 360.
		const after = run(defs, move("End_1", 0, 60))
		expect(boundsOf(after, "Participant_own").height).toBe(408)
		expect(boundsOf(after, "Lane_ops")).toEqual({ x: 30, y: 240, width: 610, height: 168 })
		expect(boundsOf(after, "Lane_finance")).toEqual(boundsOf(defs, "Lane_finance"))
		expect(boundsOf(after, "Participant_partner").y).toBe(448)
		expect(boundsOf(after, "Participant_bank").y).toBe(538)
		const edge = after.diagrams[0]?.plane.edges.find((e) => e.bpmnElement === "Message_pay")
		expect(edge?.waypoints).toEqual([
			{ x: 450, y: 220 },
			{ x: 450, y: 538 },
		])
		expectSwimlanesSound(after)
	})

	it("widens the pool for a quick-added node past its right edge, and refuses one off its corner", () => {
		const defs = flowableFixture()
		const quickAdd = (y: number): EditorOp => ({
			kind: "createConnected",
			sourceId: "Task_pay",
			type: "task",
			bounds: { x: 620, y, width: 100, height: 80 },
			waypoints: [],
			seed: "q",
		})
		const r = applyOp(defs, quickAdd(140))
		expect(r.created).toHaveLength(2)
		expect(boundsOf(r.defs, "Participant_own").width).toBe(750)
		expect(boundsOf(r.defs, "Lane_finance").x + boundsOf(r.defs, "Lane_finance").width).toBe(750)
		expect(leafOf(r.defs, r.created[0] ?? "")).toBe("Lane_finance")
		expectSwimlanesSound(r.defs)
		expectFlowableKept(defs, r.defs)
		expectRefused(defs, quickAdd(480))
	})

	it("widens the nested lanes of fixture 08 along with their parent", () => {
		const defs = fixture(FIXTURE_08)
		const after = run(defs, move("rejected", 100, 0))
		const edge = 600 + 100 + 28 + 30
		for (const id of [
			"Participant_company",
			"Lane_sales",
			"Lane_inside",
			"Lane_desk",
			"Lane_ops",
		]) {
			expect(boundsOf(after, id).x + boundsOf(after, id).width, id).toBe(edge)
		}
		expect(boundsOf(after, "Participant_customer")).toEqual(boundsOf(defs, "Participant_customer"))
		expectSwimlanesSound(after)
	})
})

describe("8d.2 black boxes", () => {
	const pool = (defs: BpmnDefinitions, id: string) => {
		const found = participants(defs).find((p) => p.id === id)
		if (!found) throw new Error(`no pool ${id}`)
		return found
	}

	it("is a pool without a process, or over an empty partner process that is not executable", () => {
		const defs = flowableFixture()
		expect(isBlackBox(defs, pool(defs, "Participant_bank"))).toBe(true)
		expect(isBlackBox(defs, pool(defs, "Participant_partner"))).toBe(true)
		expect(isBlackBox(defs, pool(defs, "Participant_own"))).toBe(false)
		const locked = Bpmn.parse(lockedPartnerXml())
		expect(isBlackBox(locked, pool(locked, "Participant_partner"))).toBe(false)
	})

	it("is not a pool over an empty process that says it is executable", () => {
		const defs = Bpmn.parse(
			flowableXml().replace(
				'id="Process_partner" name="Partner" isExecutable="false"',
				'id="Process_partner" name="Partner" isExecutable="true"',
			),
		)
		// The process that comes first in participant order and says so is primary; force the partner second.
		expect(primaryProcess(defs)?.id).toBe("Process_exec")
		expect(isBlackBox(defs, pool(defs, "Participant_partner"))).toBe(false)
	})

	it("lets a delete take a leaf lane or a black box, and not a parent lane or the own pool", () => {
		const defs = fixture(FIXTURE_08)
		expect(canDeleteSwimlane(defs, "Lane_desk")).toBe(true)
		expect(canDeleteSwimlane(defs, "Lane_ops")).toBe(true)
		expect(canDeleteSwimlane(defs, "Participant_customer")).toBe(true)
		expect(canDeleteSwimlane(defs, "Lane_sales")).toBe(false)
		expect(canDeleteSwimlane(defs, "Participant_company")).toBe(false)
		expect(canDeleteSwimlane(defs, "review")).toBe(false)
	})

	it("lets a change script remove fixture 08's partner pool, its message and its empty process", () => {
		const defs = fixture(FIXTURE_08)
		const { aliases } = writeProcessText(defs)
		const result = applyProcessDelta(defs, parseProcessDelta("- customer"), { aliases })
		expect(result.problems).toEqual([])
		const next = result.definitions
		expect(participants(next).map((p) => p.id)).toEqual(["Participant_company"])
		expect(hasShape(next, "Participant_customer")).toBe(false)
		expect(messageFlows(next)).toEqual([])
		expect(hasEdge(next, "MessageFlow_confirm")).toBe(false)
		expect(next.processes.map((p) => p.id)).toEqual(["order"])
		expectSwimlanesSound(next)
		expectFlowableKept(defs, next)
	})
})

describe("8d.3 deleting lanes", () => {
	it("hands a deleted lane's band and nodes to the lane above", () => {
		const defs = flowableFixture()
		const after = run(defs, { kind: "delete", ids: ["Lane_finance"] })
		expect(laneNamed(after, "Lane_finance")).toBeUndefined()
		expect(hasShape(after, "Lane_finance")).toBe(false)
		expect(boundsOf(after, "Lane_sales").height).toBe(240)
		expect(laneNamed(after, "Lane_sales")?.flowNodeRefs).toEqual([
			"Start_1",
			"Task_review",
			"Gateway_ok",
			"Task_pay",
		])
		expectUnmoved(defs, after, ["Lane_sales", "Lane_finance"])
		expectSwimlanesSound(after)
	})

	it("hands the top lane's band and nodes to the lane below", () => {
		const after = run(flowableFixture(), { kind: "delete", ids: ["Lane_sales"] })
		expect(boundsOf(after, "Lane_finance")).toEqual({ x: 30, y: 0, width: 610, height: 240 })
		expect(leafOf(after, "Task_review")).toBe("Lane_finance")
		expectSwimlanesSound(after)
	})

	it("deletes the last lane with its lane set and keeps the pool", () => {
		const defs = flowableFixture()
		const after = run(defs, { kind: "delete", ids: ["Lane_sales", "Lane_finance", "Lane_ops"] })
		expect(primaryProcess(after)?.laneSet).toBeUndefined()
		expect(boundsOf(after, "Participant_own")).toEqual(boundsOf(defs, "Participant_own"))
		expectSwimlanesSound(after)
	})

	it("refuses a lane with child lanes, and deletes fixture 08's bottom lane into them", () => {
		const defs = fixture(FIXTURE_08)
		expect(run(defs, { kind: "delete", ids: ["Lane_sales"] })).toBe(defs)
		const after = run(defs, { kind: "delete", ids: ["Lane_ops"] })
		expect(boundsOf(after, "Lane_sales").height).toBe(360)
		expect(boundsOf(after, "Lane_desk").height).toBe(240)
		expect(laneNamed(after, "Lane_desk")?.flowNodeRefs).toEqual(
			expect.arrayContaining(["ship", "rejected", "done"]),
		)
		expectSwimlanesSound(after)
	})

	it("deletes a parent lane selected with all its child lanes", () => {
		const defs = fixture(FIXTURE_08)
		const after = run(defs, { kind: "delete", ids: ["Lane_sales", "Lane_inside", "Lane_desk"] })
		expect(laneNamed(after, "Lane_sales")).toBeUndefined()
		expect(laneNamed(after, "Lane_ops")?.flowNodeRefs).toEqual(
			expect.arrayContaining(["start", "review", "decide", "ship"]),
		)
		expect(boundsOf(after, "Lane_ops")).toEqual({ x: 30, y: 0, width: 690, height: 360 })
		expectSwimlanesSound(after)
	})
})

describe("8d.3 deleting pools", () => {
	it("deletes a black box with its shape and its messages", () => {
		const defs = flowableFixture()
		const after = run(defs, { kind: "delete", ids: ["Participant_bank"] })
		expect(participants(after).map((p) => p.id)).toEqual(["Participant_own", "Participant_partner"])
		expect(hasShape(after, "Participant_bank")).toBe(false)
		expect(messageFlows(after)).toEqual([])
		expect(hasEdge(after, "Message_pay")).toBe(false)
		expect(after.processes.map((p) => p.id)).toEqual(defs.processes.map((p) => p.id))
		expectSwimlanesSound(after)
	})

	it("deletes a partner pool with its empty process", () => {
		const after = run(flowableFixture(), { kind: "delete", ids: ["Participant_partner"] })
		expect(after.processes.map((p) => p.id)).toEqual(["Process_exec"])
		expect(hasShape(after, "Participant_partner")).toBe(false)
		expectSwimlanesSound(after)
	})

	it("keeps the executable process on its plane when the partner listed before it goes (I1)", () => {
		for (const order of ["second", "second-diagram"] as const) {
			const defs = flowableFixture(order)
			const after = run(defs, { kind: "delete", ids: ["Participant_partner"] })
			expect(
				after.processes.map((p) => p.id),
				order,
			).toEqual(["Process_exec"])
			// The partner's own plane drew nothing but the process that is gone.
			expect(
				after.diagrams.map((d) => d.id),
				order,
			).toEqual(["BPMNDiagram_order"])
			expect(primaryPlane(after)?.shapes.some((s) => s.bpmnElement === "Task_review")).toBe(true)
			const next = applyOp(after, task(300, 260))
			expect(primaryProcess(next.defs)?.flowElements.map((el) => el.id)).toContain(next.created[0])
		}
	})

	it("keeps a partner's process that another pool still draws", () => {
		const defs = Bpmn.parse(
			flowableXml().replace(
				'<participant id="Participant_bank" name="Bank"/>',
				'<participant id="Participant_bank" name="Bank"/>\n    <participant id="Participant_twin" processRef="Process_partner"/>',
			),
		)
		const after = run(defs, { kind: "delete", ids: ["Participant_partner"] })
		expect(after.processes.map((p) => p.id)).toEqual(["Process_exec", "Process_partner"])
	})

	it("refuses the own pool and a pool that draws a process with content", () => {
		const defs = flowableFixture()
		expect(run(defs, { kind: "delete", ids: ["Participant_own"] })).toBe(defs)
		const locked = Bpmn.parse(lockedPartnerXml())
		expect(run(locked, { kind: "delete", ids: ["Participant_partner"] })).toBe(locked)
	})

	it("deletes what it can of a mixed selection", () => {
		const defs = flowableFixture()
		const after = run(defs, {
			kind: "delete",
			ids: ["Participant_own", "Lane_ops", "End_1", "Participant_bank"],
		})
		expect(hasShape(after, "Participant_own")).toBe(true)
		expect(hasShape(after, "Lane_ops")).toBe(false)
		expect(hasShape(after, "End_1")).toBe(false)
		expect(hasShape(after, "Participant_bank")).toBe(false)
		expectSwimlanesSound(after)
	})
})

describe("WP8a leftovers", () => {
	it("adds nothing for a paste of an empty clipboard", () => {
		const defs = flowableFixture()
		const clipboard = copyElements(primaryFirst(defs), ["Lane_ops", "Participant_bank"])
		expectRefused(defs, { kind: "paste", clipboard, offsetX: 20, offsetY: 20, seed: "p" })
	})

	it("draws a plane on the first edit of a file with no diagram and nothing to draw", () => {
		const defs = Bpmn.parse(
			'<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL" targetNamespace="t"><process id="p" isExecutable="true"/></definitions>',
		)
		expect(applyOp(defs, { kind: "rename", id: "nothing", name: "x" }).defs).toBe(defs)
		const r = applyOp(defs, task(100, 100))
		expect(r.created).toHaveLength(1)
		expect(r.defs.diagrams[0]?.plane.bpmnElement).toBe("p")
		expect(hasShape(r.defs, r.created[0] ?? "")).toBe(true)
	})

	it("keeps editing the process Flowable reads as executable once it is emptied", () => {
		const xml = flowableXml("second")
			.replace(' isExecutable="true"', "")
			.replace(/<laneSet[\s\S]*?<\/laneSet>/, "")
		const defs = Bpmn.parse(xml)
		expect(primaryProcess(defs)?.id).toBe("Process_exec")
		const nodes = primaryProcess(defs)?.flowElements.map((el) => el.id) ?? []
		const emptied = run(defs, { kind: "delete", ids: nodes })
		expect(primaryProcess(emptied)?.id).toBe("Process_exec")
		const r = applyOp(emptied, task(100, 140))
		expect(primaryProcess(r.defs)?.flowElements.map((el) => el.id)).toEqual(r.created)
	})

	// Nothing in the semantics tells the two empty processes apart, so the drawing does.
	for (const [label, attr] of [
		["no process says whether it is executable", ""],
		["every process is marked non-executable", ' isExecutable="false"'],
	] as const) {
		it(`keeps editing the emptied own pool when ${label}`, () => {
			const defs =
				Bpmn.parse(`<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" targetNamespace="t">
  <collaboration id="C">
    <participant id="PA" processRef="A"/>
    <participant id="PB" processRef="B"/>
  </collaboration>
  <process id="A"${attr}/>
  <process id="B"${attr}><task id="T"/></process>
  <bpmndi:BPMNDiagram id="D"><bpmndi:BPMNPlane id="Plane" bpmnElement="C">
    <bpmndi:BPMNShape id="S_PA" bpmnElement="PA" isHorizontal="true"><dc:Bounds x="0" y="0" width="600" height="60"/></bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="S_PB" bpmnElement="PB" isHorizontal="true"><dc:Bounds x="0" y="100" width="600" height="250"/></bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="S_T" bpmnElement="T"><dc:Bounds x="100" y="150" width="100" height="80"/></bpmndi:BPMNShape>
  </bpmndi:BPMNPlane></bpmndi:BPMNDiagram>
</definitions>`)
			expect(primaryProcess(defs)?.id).toBe("B")
			const emptied = run(defs, { kind: "delete", ids: ["T"] })
			expect(primaryProcess(emptied)?.id).toBe("B")
			const pb = emptied.collaborations[0]?.participants.find((p) => p.id === "PB")
			expect(pb && isBlackBox(emptied, pb)).toBe(false)
			const r = applyOp(emptied, task(100, 150))
			expect(r.created).toHaveLength(1)
			expect(emptied.processes.find((p) => p.id === "B")?.flowElements).toEqual([])
			expect(r.defs.processes.find((p) => p.id === "B")?.flowElements.map((el) => el.id)).toEqual(
				r.created,
			)
		})
	}
})

describe("final review: what a growing pool and a deleted swimlane leave behind", () => {
	const wps = (defs: BpmnDefinitions, id: string) =>
		defs.diagrams.flatMap((d) => d.plane.edges).find((e) => e.bpmnElement === id)?.waypoints ?? []
	const bottomOf = (defs: BpmnDefinitions, id: string) =>
		boundsOf(defs, id).y + boundsOf(defs, id).height

	it("keeps a message docked on a node moved across the pool's bottom edge", () => {
		for (const order of ["first", "second", "second-diagram"] as const) {
			const after = run(flowableFixture(order), move("Task_pay", 0, 180))
			const view = primaryFirst(after)
			const [start, end] = [wps(after, "Message_pay")[0], wps(after, "Message_pay").at(-1)]
			expect(start?.y, order).toBe(bottomOf(view, "Task_pay"))
			expect(end?.y, order).toBe(boundsOf(view, "Participant_bank").y)
			expectSwimlanesSound(view)
		}
		const after = run(fixture(FIXTURE_08), move("ship", 0, 30))
		expect(wps(after, "MessageFlow_confirm")).toEqual([
			{ x: 470, y: 370 },
			{ x: 470, y: 440 },
		])
	})

	it("moves a black box moved along with a node across the bottom edge by the move only", () => {
		const defs = flowableFixture()
		const after = run(defs, {
			kind: "move",
			moves: [
				{ id: "End_1", dx: 0, dy: 60 },
				{ id: "Participant_bank", dx: 0, dy: 60 },
			],
		})
		expect(boundsOf(after, "Participant_own").height).toBe(408)
		expect(boundsOf(after, "Participant_bank").y).toBe(550)
		expect(boundsOf(after, "Participant_partner").y).toBe(448)
		expect(wps(after, "Message_pay")).toEqual([
			{ x: 450, y: 220 },
			{ x: 450, y: 550 },
		])
	})

	it("moves what the space tool moves by the space tool's offset only", () => {
		const defs = flowableFixture()
		const after = run(defs, {
			kind: "move",
			moves: ["End_1", "Participant_partner", "Participant_bank"].map((id) => ({
				id,
				dx: 0,
				dy: 60,
			})),
			grow: true,
		})
		expect(boundsOf(after, "Participant_partner").y).toBe(460)
		expect(boundsOf(after, "Participant_bank").y).toBe(550)
		expectSwimlanesSound(after)
	})

	it("grows the pool for a space-tool move past its right or bottom edge, not for a drag", () => {
		const defs = flowableFixture()
		const space = (dx: number, dy: number, ids: string[]): EditorOp => ({
			kind: "move",
			moves: ids.map((id) => ({ id, dx, dy })),
			grow: true,
		})
		const wider = run(defs, space(200, 0, ["Task_pay", "End_1"]))
		expect(boundsOf(wider, "Task_pay").x).toBe(600)
		expect(boundsOf(wider, "Participant_own").width).toBe(798)
		expectSwimlanesSound(wider)
		const deeper = run(defs, space(0, 200, ["End_1", "Participant_partner", "Participant_bank"]))
		expect(boundsOf(deeper, "End_1").y).toBe(482)
		expect(bottomOf(deeper, "Participant_own")).toBe(548)
		expect(boundsOf(deeper, "Participant_partner").y).toBe(600)
		expectSwimlanesSound(deeper)
		// A plain drag still may not leave the pool.
		expect(run(defs, move("Task_pay", 200, 0))).toBe(defs)
		// Nor may a space-tool move put a node in a partner pool.
		expect(run(defs, space(0, 390, ["Task_review"]))).toBe(defs)
	})

	it("refuses to move a black box over the own pool", () => {
		const defs = flowableFixture()
		expect(run(defs, move("Participant_bank", 0, -200))).toBe(defs)
		expect(run(defs, move("Participant_partner", 300, -60))).toBe(defs)
		const lower = run(defs, move("Participant_bank", 0, 40))
		expect(boundsOf(lower, "Participant_bank").y).toBe(530)
		const f08 = fixture(FIXTURE_08)
		expect(run(f08, move("Participant_customer", 0, -150))).toBe(f08)
	})

	const ANNOTATED = flowableXml()
		.replace(
			'<messageFlow id="Message_pay"',
			`<textAnnotation id="Note_bank"><text>Bank</text></textAnnotation>
    <association id="Assoc_bank" sourceRef="Note_bank" targetRef="Participant_bank"/>
    <messageFlow id="Message_pay"`,
		)
		.replace(
			'<endEvent id="End_1" name="Done"/>',
			`<endEvent id="End_1" name="Done"/>
    <textAnnotation id="Note_lane"><text>Finance</text></textAnnotation>
    <association id="Assoc_lane" sourceRef="Note_lane" targetRef="Lane_finance"/>`,
		)
		.replace(
			'<bpmndi:BPMNEdge id="Message_pay_di"',
			`<bpmndi:BPMNShape id="Note_bank_di" bpmnElement="Note_bank"><omgdc:Bounds x="660" y="560" width="100" height="30"/></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Note_lane_di" bpmnElement="Note_lane"><omgdc:Bounds x="660" y="160" width="100" height="30"/></bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Assoc_bank_di" bpmnElement="Assoc_bank"><omgdi:waypoint x="660" y="575"/><omgdi:waypoint x="640" y="520"/></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Assoc_lane_di" bpmnElement="Assoc_lane"><omgdi:waypoint x="660" y="175"/><omgdi:waypoint x="640" y="180"/></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Message_pay_di"`,
		)

	/** Every association of every process and collaboration ends at an element that is still there. */
	function expectNoDanglingAssociation(defs: BpmnDefinitions): void {
		const xml = Bpmn.export(defs)
		const refs = [...xml.matchAll(/<(?:bpmn:)?association [^>]*/g)].flatMap((m) =>
			[...m[0].matchAll(/(?:sourceRef|targetRef)="([^"]+)"/g)].map((r) => r[1]),
		)
		for (const ref of refs) expect(xml, ref).toContain(`id="${ref}"`)
	}

	it("drops the associations to a deleted black box or lane, and their edges", () => {
		const defs = Bpmn.parse(ANNOTATED)
		expect(defs.collaborations[0]?.associations.map((a) => a.id)).toEqual(["Assoc_bank"])
		const noBank = run(defs, { kind: "delete", ids: ["Participant_bank"] })
		expect(noBank.collaborations[0]?.associations).toEqual([])
		expect(hasEdge(noBank, "Assoc_bank")).toBe(false)
		expect(hasShape(noBank, "Note_bank")).toBe(true)
		expectNoDanglingAssociation(noBank)
		const noLane = run(defs, { kind: "delete", ids: ["Lane_finance"] })
		expect(primaryProcess(noLane)?.associations).toEqual([])
		expect(hasEdge(noLane, "Assoc_lane")).toBe(false)
		expect(hasShape(noLane, "Note_lane")).toBe(true)
		expectNoDanglingAssociation(noLane)
		const both = run(defs, { kind: "delete", ids: ["Participant_bank", "Lane_finance"] })
		expectNoDanglingAssociation(both)
		expectSwimlanesSound(both)
	})

	it("drops them for a change script that removes the pool or the lane too", () => {
		const defs = Bpmn.parse(ANNOTATED)
		const { aliases } = writeProcessText(defs)
		for (const [line, gone] of [
			["- bank", "Assoc_bank"],
			["- finance", "Assoc_lane"],
		] as const) {
			const result = applyProcessDelta(defs, parseProcessDelta(line), { aliases })
			expect(result.problems, line).toEqual([])
			expect(hasEdge(result.definitions, gone), line).toBe(false)
			expectNoDanglingAssociation(result.definitions)
		}
	})
})
