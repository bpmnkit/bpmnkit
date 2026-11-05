/**
 * WP8d message flows: a connection across pools becomes a message flow, its
 * edge follows the shapes it docks on, and it can be renamed. Every op runs
 * through the Flowable guard.
 */
import { Bpmn, type BpmnDefinitions, type BpmnWaypoint, primaryProcess } from "@bpmnkit/core"
import { describe, expect, it } from "vitest"
import { connectionKind, nameOf } from "../src/modeling.js"
import { type EditorOp, applyOp } from "../src/ops.js"
import { messageWaypoints, participantOf } from "../src/swimlanes.js"
import {
	expectFlowableKept,
	expectSwimlanesSound,
	fixture,
	flowableFixture,
	lockedPartnerXml,
	messageFlows,
} from "./swimlane-helpers.js"

const FIXTURE_08 = "08-flowable-lanes-pools.bpmn"

/** Applies `op` and holds it to the Flowable guard. */
function run(defs: BpmnDefinitions, op: EditorOp): BpmnDefinitions {
	const after = applyOp(defs, op).defs
	expectFlowableKept(defs, after)
	return after
}

/** `op` changes nothing: the very same document, and nothing created. */
function expectRefused(defs: BpmnDefinitions, op: EditorOp): void {
	const r = applyOp(defs, op)
	expect(r.defs).toBe(defs)
	expect(r.created).toEqual([])
}

const connect = (sourceId: string, targetId: string): EditorOp => ({
	kind: "createConnection",
	sourceId,
	targetId,
	// What the editor sends for a sequence flow; a message flow routes itself.
	waypoints: [
		{ x: 0, y: 0 },
		{ x: 1, y: 1 },
	],
	seed: "m",
})

/** The waypoints of the edge that draws `id`, on any diagram. */
function routeOf(defs: BpmnDefinitions, id: string): BpmnWaypoint[] | undefined {
	for (const diagram of defs.diagrams) {
		const edge = diagram.plane.edges.find((e) => e.bpmnElement === id)
		if (edge) return edge.waypoints
	}
	return undefined
}

const sequenceFlowCount = (defs: BpmnDefinitions) => primaryProcess(defs)?.sequenceFlows.length

/** The one message flow `after` has and `before` had not. */
function addedMessage(before: BpmnDefinitions, after: BpmnDefinitions) {
	const had = new Set(messageFlows(before).map((f) => f.id))
	const added = messageFlows(after).filter((f) => !had.has(f.id))
	expect(added).toHaveLength(1)
	const [flow] = added
	if (!flow) throw new Error("no message flow added")
	return flow
}

describe("participantOf", () => {
	it("names the pool whose process holds a node, or the pool itself", () => {
		const defs = flowableFixture()
		expect(participantOf(defs, "Task_review")?.id).toBe("Participant_own")
		expect(participantOf(defs, "Participant_bank")?.id).toBe("Participant_bank")
		expect(participantOf(defs, "Lane_finance")).toBeUndefined()
		expect(participantOf(defs, "nothing")).toBeUndefined()
		expect(participantOf(Bpmn.parse(lockedPartnerXml()), "Task_p")?.id).toBe("Participant_partner")
	})
})

describe("8d.4 connecting across pools adds a message flow", () => {
	it("connects a task to fixture 08's black box over an empty process", () => {
		const before = fixture(FIXTURE_08)
		const r = applyOp(before, connect("review", "Participant_customer"))
		expectFlowableKept(before, r.defs)
		const flow = addedMessage(before, r.defs)
		expect(r.created).toEqual([flow.id])
		expect(flow).toMatchObject({ sourceRef: "review", targetRef: "Participant_customer" })
		expect(flow.messageRef).toBeUndefined()
		expect(r.defs.collaborations[0]?.messageFlows).toContain(flow)
		expect(sequenceFlowCount(r.defs)).toBe(sequenceFlowCount(before))
		// Down from review's bottom at its centre into the pool's top, not the op's waypoints.
		expect(routeOf(r.defs, flow.id)).toEqual([
			{ x: 230, y: 100 },
			{ x: 230, y: 400 },
		])
		expectSwimlanesSound(r.defs)
		expect(Bpmn.export(r.defs)).toContain('targetRef="Participant_customer"')
	})

	it("connects a task to a black box with no processRef, and the other way round", () => {
		const before = flowableFixture()
		const out = run(before, connect("Task_review", "Participant_bank"))
		expect(routeOf(out, addedMessage(before, out).id)).toEqual([
			{ x: 210, y: 100 },
			{ x: 210, y: 490 },
		])
		const back = run(before, connect("Participant_bank", "Task_review"))
		const flow = addedMessage(before, back)
		expect(flow).toMatchObject({ sourceRef: "Participant_bank", targetRef: "Task_review" })
		expect(routeOf(back, flow.id)).toEqual([
			{ x: 210, y: 490 },
			{ x: 210, y: 100 },
		])
		expectSwimlanesSound(back)
	})

	it("connects two black boxes (U8) with an orthogonal route between their borders (I16)", () => {
		const before = flowableFixture()
		const after = run(before, connect("Participant_partner", "Participant_bank"))
		expect(routeOf(after, addedMessage(before, after).id)).toEqual([
			{ x: 320, y: 460 },
			{ x: 320, y: 490 },
		])
		expectSwimlanesSound(after)
	})

	it("connects nodes of two pools, a partner's locked node included", () => {
		const before = Bpmn.parse(lockedPartnerXml())
		const after = run(before, connect("Task_review", "Task_p"))
		const flow = addedMessage(before, after)
		expect(flow).toMatchObject({ sourceRef: "Task_review", targetRef: "Task_p" })
		expect(routeOf(after, flow.id)).toEqual([
			{ x: 210, y: 100 },
			{ x: 210, y: 410 },
		])
		expect(after.processes.find((p) => p.id === "Process_partner")).toEqual(
			before.processes.find((p) => p.id === "Process_partner"),
		)
		expectSwimlanesSound(after)
	})

	it("connects an own node and a partner pool that draws a process, its process untouched", () => {
		const before = Bpmn.parse(lockedPartnerXml())
		const there = run(before, connect("Task_review", "Participant_partner"))
		const flow = addedMessage(before, there)
		expect(flow).toMatchObject({ sourceRef: "Task_review", targetRef: "Participant_partner" })
		expect(routeOf(there, flow.id)).toEqual([
			{ x: 210, y: 100 },
			{ x: 210, y: 400 },
		])
		const back = run(before, connect("Participant_partner", "Task_review"))
		expect(addedMessage(before, back)).toMatchObject({
			sourceRef: "Participant_partner",
			targetRef: "Task_review",
		})
		for (const after of [there, back]) {
			expect(after.processes.find((p) => p.id === "Process_partner")).toEqual(
				before.processes.find((p) => p.id === "Process_partner"),
			)
			expectSwimlanesSound(after)
		}
		// The same end rules as a black box (messageEndProblem), and nothing into its own nodes.
		expectRefused(before, connect("Gateway_ok", "Participant_partner"))
		expectRefused(before, connect("Participant_partner", "End_1"))
		expectRefused(before, connect("Participant_partner", "Task_p"))
	})

	it("adds the message to the collaboration that holds the own pool", () => {
		const before = flowableFixture()
		const own = before.collaborations[0]
		if (!own) throw new Error("no collaboration")
		const other = {
			...structuredClone(own),
			id: "Collaboration_0",
			participants: [],
			messageFlows: [],
		}
		const defs = { ...before, collaborations: [other, own] }
		const after = run(defs, connect("Task_review", "Participant_bank"))
		expect(after.collaborations[0]?.messageFlows).toEqual([])
		expect(after.collaborations[1]?.messageFlows).toHaveLength(2)
	})

	it("adds the message flow on the executable process's plane when it is listed second", () => {
		const before = flowableFixture("second-diagram")
		const after = run(before, connect("Task_review", "Participant_bank"))
		const flow = addedMessage(before, after)
		expect(after.diagrams[1]?.plane.edges.some((e) => e.bpmnElement === flow.id)).toBe(true)
		expect(after.diagrams[0]).toEqual(before.diagrams[0])
	})

	it("is the same edit on replay", () => {
		const before = flowableFixture()
		const op = connect("Task_review", "Participant_bank")
		expect(Bpmn.export(applyOp(before, op).defs)).toBe(Bpmn.export(applyOp(before, op).defs))
	})

	it("keeps a connection inside one pool a sequence flow", () => {
		const before = flowableFixture()
		const after = run(before, connect("Task_review", "Task_pay"))
		expect(messageFlows(after)).toEqual(messageFlows(before))
		expect(sequenceFlowCount(after)).toBe((sequenceFlowCount(before) ?? 0) + 1)
		expect(connectionKind(before, "Task_review", "Task_pay")).toBe("sequence")
		expect(connectionKind(before, "Task_review", "Participant_bank")).toBe("message")
	})
})

describe("8d.4 refused ends", () => {
	it("creates nothing for ends a message flow cannot have", () => {
		const defs = flowableFixture()
		expectRefused(defs, connect("Gateway_ok", "Participant_bank"))
		expectRefused(defs, connect("Participant_bank", "End_1"))
		expectRefused(defs, connect("Participant_bank", "Lane_finance"))
		expect(connectionKind(defs, "Gateway_ok", "Participant_bank")).toBeUndefined()
	})

	it("creates nothing inside one pool for a lane, the own pool or a partner's locked nodes", () => {
		const defs = flowableFixture()
		expectRefused(defs, connect("Task_review", "Lane_finance"))
		expectRefused(defs, connect("Task_review", "Participant_own"))
		const locked = Bpmn.parse(lockedPartnerXml())
		expectRefused(locked, connect("Task_p", "Start_p"))
		expect(connectionKind(locked, "Task_p", "Start_p")).toBeUndefined()
	})
})

describe("8d.5 message edges follow the shapes they dock on", () => {
	const message = (defs: BpmnDefinitions) => routeOf(defs, "Message_pay")

	it("re-docks a message flow whose node moved", () => {
		const after = run(flowableFixture(), {
			kind: "move",
			moves: [{ id: "Task_pay", dx: 20, dy: 0 }],
		})
		expect(message(after)).toEqual(messageWaypoints(boundsIn(after, "Task_pay"), bank(after), true))
		expect(message(after)).toEqual([
			{ x: 470, y: 220 },
			{ x: 470, y: 490 },
		])
	})

	it("re-docks a message flow whose black box moved", () => {
		const after = run(flowableFixture(), {
			kind: "move",
			moves: [{ id: "Participant_bank", dx: 0, dy: 10 }],
		})
		expect(message(after)).toEqual([
			{ x: 450, y: 220 },
			{ x: 450, y: 500 },
		])
	})

	it("translates the route, bends and label, when both ends moved by as much", () => {
		const before = flowableFixture()
		const edge = before.diagrams[0]?.plane.edges.find((e) => e.bpmnElement === "Message_pay")
		if (!edge) throw new Error("no edge")
		edge.waypoints = [
			{ x: 450, y: 220 },
			{ x: 450, y: 470 },
			{ x: 300, y: 470 },
			{ x: 300, y: 490 },
		]
		edge.label = { bounds: { x: 310, y: 440, width: 90, height: 20 } }
		const after = run(before, {
			kind: "move",
			moves: [
				{ id: "Task_pay", dx: 0, dy: 10 },
				{ id: "Participant_bank", dx: 0, dy: 10 },
			],
		})
		const moved = after.diagrams[0]?.plane.edges.find((e) => e.bpmnElement === "Message_pay")
		expect(moved?.waypoints).toEqual(edge.waypoints.map((p) => ({ x: p.x, y: p.y + 10 })))
		expect(moved?.label?.bounds).toEqual({ x: 310, y: 450, width: 90, height: 20 })
	})

	it("leaves message edges that touch no moved shape byte-identical", () => {
		const before = fixture(FIXTURE_08)
		const after = run(before, { kind: "move", moves: [{ id: "review", dx: 20, dy: 0 }] })
		expect(JSON.stringify(routeOf(after, "MessageFlow_confirm"))).toBe(
			JSON.stringify(routeOf(before, "MessageFlow_confirm")),
		)
	})

	it("re-docks a message flow whose node is resized, and leaves the others alone", () => {
		const before = flowableFixture()
		const resized = run(before, {
			kind: "resize",
			id: "Task_pay",
			bounds: { x: 400, y: 140, width: 140, height: 80 },
		})
		expect(message(resized)).toEqual([
			{ x: 470, y: 220 },
			{ x: 470, y: 490 },
		])
		const other = run(before, {
			kind: "resize",
			id: "Task_review",
			bounds: { x: 160, y: 20, width: 120, height: 80 },
		})
		expect(JSON.stringify(message(other))).toBe(JSON.stringify(message(before)))
	})
})

describe("8d.6 renaming a message flow", () => {
	it("renames it and gives its edge a label beside its longest segment", () => {
		const before = flowableFixture()
		expect(nameOf(before, "Message_pay")).toBe("Payment")
		const after = run(before, { kind: "rename", id: "Message_pay", name: "Wire" })
		expect(messageFlows(after).find((f) => f.id === "Message_pay")?.name).toBe("Wire")
		const edge = after.diagrams[0]?.plane.edges.find((e) => e.bpmnElement === "Message_pay")
		// Right of the vertical line at its middle (450, 355).
		expect(edge?.label?.bounds).toEqual({ x: 455, y: 345, width: 90, height: 20 })
		expect(Bpmn.export(after)).toContain('name="Wire"')
	})

	it("keeps a label the file placed, and adds none for an empty name", () => {
		const before = flowableFixture()
		const edge = before.diagrams[0]?.plane.edges.find((e) => e.bpmnElement === "Message_pay")
		if (!edge) throw new Error("no edge")
		const placed = { x: 10, y: 10, width: 50, height: 14 }
		edge.label = { bounds: placed }
		const renamed = run(before, { kind: "rename", id: "Message_pay", name: "Wire" })
		expect(routeLabel(renamed)).toEqual(placed)
		edge.label = undefined
		const emptied = run(before, { kind: "rename", id: "Message_pay", name: "" })
		expect(routeLabel(emptied)).toBeUndefined()
	})
})

describe("WP8a leftovers on locked nodes", () => {
	it("reads the name of a partner's locked node", () => {
		expect(nameOf(Bpmn.parse(lockedPartnerXml()), "Task_p")).toBe("Answer")
	})

	it("refuses an annotation linked to a partner's locked node", () => {
		const defs = Bpmn.parse(lockedPartnerXml())
		expectRefused(defs, {
			kind: "createAnnotationFor",
			sourceId: "Task_p",
			bounds: { x: 300, y: 380, width: 100, height: 50 },
			sourceBounds: { x: 160, y: 410, width: 100, height: 40 },
			seed: "a",
		})
	})
})

function boundsIn(defs: BpmnDefinitions, id: string) {
	const shape = defs.diagrams[0]?.plane.shapes.find((s) => s.bpmnElement === id)
	if (!shape) throw new Error(`no shape for ${id}`)
	return shape.bounds
}

const bank = (defs: BpmnDefinitions) => boundsIn(defs, "Participant_bank")

const routeLabel = (defs: BpmnDefinitions) =>
	defs.diagrams[0]?.plane.edges.find((e) => e.bpmnElement === "Message_pay")?.label?.bounds

describe("WP8d leftover: a re-routed message edge keeps its label beside the route", () => {
	it("moves the label with the route when one end moves, as a translate does", () => {
		const defs = structuredClone(flowableFixture())
		const edge = defs.diagrams[0]?.plane.edges.find((e) => e.bpmnElement === "Message_pay")
		if (!edge) throw new Error("no message edge")
		const label = { x: 455, y: 345, width: 90, height: 20 }
		edge.label = { bounds: label }
		const after = run(defs, { kind: "move", moves: [{ id: "Task_pay", dx: 40, dy: 0 }] })
		const moved = after.diagrams[0]?.plane.edges.find((e) => e.bpmnElement === "Message_pay")
		expect(moved?.waypoints.map((p) => p.x)).toEqual([490, 490])
		expect(moved?.label?.bounds).toEqual({ ...label, x: label.x + 40 })
	})
})
