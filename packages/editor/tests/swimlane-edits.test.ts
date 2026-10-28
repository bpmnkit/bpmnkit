/**
 * WP8a modeling fixes: what the existing ops do to the pools, lanes, message
 * flows and partner processes of a Flowable file. Every op runs through the
 * Flowable guard.
 */
import { Bpmn, type BpmnDefinitions, laneOf, primaryProcess } from "@bpmnkit/core"
import { describe, expect, it } from "vitest"
import { nameOf } from "../src/modeling.js"
import { type EditorOp, applyOp } from "../src/ops.js"
import { lockedIds, swimlaneIds } from "../src/swimlanes.js"
import {
	boundsOf,
	expectFlowableKept,
	expectSwimlanesSound,
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

/** Applies `op` and holds it to the Flowable guard. */
function run(defs: BpmnDefinitions, op: EditorOp): BpmnDefinitions {
	const after = applyOp(defs, op).defs
	expectFlowableKept(defs, after)
	return after
}

const FIXTURE_08 = "08-flowable-lanes-pools.bpmn"

/** {@link flowableXml} with a text annotation on the collaboration, linked to `Task_pay`. */
function withCollaborationNote(): BpmnDefinitions {
	const xml = flowableXml()
		.replace(
			"</collaboration>",
			`<textAnnotation id="Note_c"><text>Paid by the bank</text></textAnnotation>
    <association id="Assoc_c" sourceRef="Task_pay" targetRef="Note_c"/>
  </collaboration>`,
		)
		.replace(
			'<bpmndi:BPMNEdge id="Message_pay_di"',
			`<bpmndi:BPMNShape id="Note_c_di" bpmnElement="Note_c"><omgdc:Bounds x="520" y="130" width="100" height="40"/></bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Assoc_c_di" bpmnElement="Assoc_c"><omgdi:waypoint x="500" y="160"/><omgdi:waypoint x="520" y="150"/></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Message_pay_di"`,
		)
	const defs = Bpmn.parse(xml)
	if (defs.collaborations[0]?.textAnnotations.length !== 1) throw new Error("fixture: no note")
	return defs
}

/** {@link lockedPartnerXml}, parsed. */
const withLockedPartner = (): BpmnDefinitions => Bpmn.parse(lockedPartnerXml())

/** The waypoints of every edge of the first diagram, by element id. */
function routes(defs: BpmnDefinitions): Map<string, string> {
	const edges = defs.diagrams[0]?.plane.edges ?? []
	return new Map(edges.map((e) => [e.bpmnElement, JSON.stringify(e.waypoints)]))
}

describe("8a.3 renaming lanes, pools and collaboration annotations", () => {
	it("renames a top-level lane and a nested one", () => {
		const flat = run(flowableFixture(), { kind: "rename", id: "Lane_finance", name: "Billing" })
		expect(laneNamed(flat, "Lane_finance")?.name).toBe("Billing")
		expect(Bpmn.export(flat)).toContain('name="Billing"')

		const nested = run(fixture(FIXTURE_08), { kind: "rename", id: "Lane_desk", name: "Desk" })
		expect(laneNamed(nested, "Lane_desk")?.name).toBe("Desk")
		expect(laneNamed(nested, "Lane_sales")?.name).toBe("Sales")
	})

	it("renames a pool", () => {
		const after = run(flowableFixture(), { kind: "rename", id: "Participant_own", name: "Acme" })
		expect(participants(after).find((p) => p.id === "Participant_own")?.name).toBe("Acme")
		expect(Bpmn.export(after)).toContain('name="Acme"')
	})

	it("renames a lane of the executable process when it is listed second", () => {
		const before = flowableFixture("second")
		const after = run(before, { kind: "rename", id: "Lane_ops", name: "Shipping" })
		expect(laneNamed(after, "Lane_ops")?.name).toBe("Shipping")
		expect(after.processes.map((p) => p.id)).toEqual(before.processes.map((p) => p.id))
	})

	it("renames a text annotation of the collaboration", () => {
		const after = run(withCollaborationNote(), { kind: "rename", id: "Note_c", name: "Bank pays" })
		expect(after.collaborations[0]?.textAnnotations[0]?.text).toBe("Bank pays")
	})

	it("reads the names the label editor starts from", () => {
		const defs = withCollaborationNote()
		expect(nameOf(defs, "Lane_finance")).toBe("Finance")
		expect(nameOf(defs, "Participant_own")).toBe("Company")
		expect(nameOf(defs, "Note_c")).toBe("Paid by the bank")
		expect(nameOf(defs, "Task_review")).toBe("Review")
		expect(nameOf(defs, "nothing")).toBeUndefined()
	})
})

describe("8a.5 pools and lanes are not obstacles", () => {
	it("moving review in fixture 08 keeps the routes of edges that do not touch it", () => {
		const before = fixture(FIXTURE_08)
		const after = run(before, { kind: "move", moves: [{ id: "review", dx: 20, dy: 0 }] })
		const was = routes(before)
		for (const [id, route] of routes(after)) {
			if (id === "toReview" || id === "toDecide") continue
			expect(route, id).toBe(was.get(id))
		}
	})
})

describe("8a.6 no sequence flow to a pool or a lane", () => {
	const connect = (targetId: string): EditorOp => ({
		kind: "createConnection",
		sourceId: "Task_review",
		targetId,
		waypoints: [
			{ x: 260, y: 60 },
			{ x: 300, y: 60 },
		],
		seed: "s",
	})

	it("refuses a connection that ends on a lane or a pool", () => {
		const defs = flowableFixture()
		for (const target of ["Lane_finance", "Participant_bank", "Participant_own"]) {
			expect(run(defs, connect(target)), target).toBe(defs)
		}
	})

	it("refuses a quick-add from a lane", () => {
		const defs = flowableFixture()
		const op: EditorOp = {
			kind: "createConnected",
			sourceId: "Lane_sales",
			type: "task",
			bounds: { x: 300, y: 20, width: 100, height: 80 },
			waypoints: [],
			seed: "s",
		}
		expect(applyOp(defs, op)).toEqual({ defs, created: [] })
	})
})

describe("8a.7 delete cleans up lanes, message flows and associations", () => {
	it("deleting ship in fixture 08 drops its lane ref and its message flow with the edge", () => {
		const before = fixture(FIXTURE_08)
		const after = run(before, { kind: "delete", ids: ["ship"] })
		const process = primaryProcess(after)
		if (!process) throw new Error("no process")
		expect(laneOf(process, "ship")).toBeUndefined()
		expect(laneNamed(after, "Lane_ops")?.flowNodeRefs).toEqual(["rejected", "done"])
		expect(messageFlows(after).map((m) => m.id)).not.toContain("MessageFlow_confirm")
		expect(hasEdge(after, "MessageFlow_confirm")).toBe(false)
		// Targeted: lanes that never listed ship are the same objects.
		expect(laneNamed(after, "Lane_sales")).toBe(laneNamed(before, "Lane_sales"))
		expectSwimlanesSound(after)
	})

	it("drops a deleted node from a parent lane and its child lane alike", () => {
		const after = run(fixture(FIXTURE_08), { kind: "delete", ids: ["review"] })
		expect(laneNamed(after, "Lane_sales")?.flowNodeRefs).toEqual(["start", "decide"])
		expect(laneNamed(after, "Lane_inside")?.flowNodeRefs).toEqual(["start"])
	})

	it("drops a collaboration association to a deleted node, with its edge", () => {
		const after = run(withCollaborationNote(), { kind: "delete", ids: ["Task_pay"] })
		expect(after.collaborations[0]?.associations).toEqual([])
		expect(hasEdge(after, "Assoc_c")).toBe(false)
		expect(messageFlows(after)).toEqual([])
		expect(hasEdge(after, "Message_pay")).toBe(false)
	})

	it("deletes a collaboration annotation and its association", () => {
		const after = run(withCollaborationNote(), { kind: "delete", ids: ["Note_c"] })
		expect(after.collaborations[0]?.textAnnotations).toEqual([])
		expect(after.collaborations[0]?.associations).toEqual([])
		expect(hasShape(after, "Note_c")).toBe(false)
		expect(hasEdge(after, "Assoc_c")).toBe(false)
	})

	it("ignores lane and pool ids instead of deleting their shapes only", () => {
		const defs = flowableFixture()
		for (const id of ["Lane_sales", "Participant_own", "Participant_bank"]) {
			expect(run(defs, { kind: "delete", ids: [id] }), id).toBe(defs)
		}
		const mixed = run(defs, { kind: "delete", ids: ["Lane_ops", "End_1"] })
		expect(hasShape(mixed, "Lane_ops")).toBe(true)
		expect(hasShape(mixed, "End_1")).toBe(false)
	})
})

describe("8a.8 moves leave the own pool and its lanes where they are", () => {
	it("ignores a move of the own pool or of a lane", () => {
		const defs = flowableFixture()
		const moves = [
			{ id: "Participant_own", dx: 0, dy: 40 },
			{ id: "Lane_finance", dx: 0, dy: 40 },
		]
		expect(run(defs, { kind: "move", moves })).toBe(defs)
	})

	it("moves the nodes of a mixed selection and not the lane", () => {
		const defs = flowableFixture()
		const moves = [
			{ id: "Task_review", dx: 20, dy: 0 },
			{ id: "Lane_sales", dx: 20, dy: 0 },
		]
		const after = run(defs, { kind: "move", moves })
		expect(boundsOf(after, "Task_review").x).toBe(180)
		expect(boundsOf(after, "Lane_sales")).toEqual(boundsOf(defs, "Lane_sales"))
	})

	it("still moves a black box", () => {
		const defs = flowableFixture()
		const after = run(defs, { kind: "move", moves: [{ id: "Participant_bank", dx: 0, dy: 30 }] })
		expect(boundsOf(after, "Participant_bank").y).toBe(520)
	})

	it("names every pool and lane, of every process", () => {
		expect([...swimlaneIds(fixture(FIXTURE_08))].sort()).toEqual(
			[
				"Lane_desk",
				"Lane_inside",
				"Lane_ops",
				"Lane_sales",
				"Participant_company",
				"Participant_customer",
			].sort(),
		)
	})
})

describe("8a.9 the content of a partner process is read-only", () => {
	it("locks the nodes and flows of a non-primary process with content", () => {
		const locked = lockedIds(withLockedPartner())
		expect([...locked].sort()).toEqual(["Flow_p", "Start_p", "Task_p"])
		expect(lockedIds(flowableFixture()).size).toBe(0)
	})

	it("refuses move, delete, resize, connect and retype on a locked node", () => {
		const defs = withLockedPartner()
		const ops: EditorOp[] = [
			{ kind: "move", moves: [{ id: "Task_p", dx: 10, dy: 0 }] },
			{ kind: "delete", ids: ["Task_p"] },
			{ kind: "delete", ids: ["Flow_p"] },
			{ kind: "resize", id: "Task_p", bounds: { x: 160, y: 410, width: 140, height: 40 } },
			{
				kind: "createConnection",
				sourceId: "Task_review",
				targetId: "Task_p",
				waypoints: [],
				seed: "s",
			},
			{
				kind: "createConnected",
				sourceId: "Task_p",
				type: "task",
				bounds: { x: 300, y: 410, width: 100, height: 40 },
				waypoints: [],
				seed: "s",
			},
			{ kind: "changeType", id: "Task_p", type: "userTask" },
		]
		for (const op of ops) expect(run(defs, op), op.kind).toBe(defs)
	})

	it("moves the primary nodes of a mixed selection and leaves the locked one", () => {
		const defs = withLockedPartner()
		const moves = [
			{ id: "Task_review", dx: 20, dy: 0 },
			{ id: "Task_p", dx: 20, dy: 0 },
		]
		const after = run(defs, { kind: "move", moves })
		expect(boundsOf(after, "Task_review").x).toBe(180)
		expect(boundsOf(after, "Task_p")).toEqual(boundsOf(defs, "Task_p"))
	})
})

describe("8a.6 and 8a.9 dropping a container or a locked node on a flow", () => {
	const flowIds = (defs: BpmnDefinitions) =>
		(primaryProcess(defs)?.sequenceFlows ?? []).map((f) => f.id)
	const insert = (shapeId: string): EditorOp => ({
		kind: "move",
		moves: [{ id: shapeId, dx: 0, dy: 2 }],
		onEdge: { edgeId: "Flow_3", shapeId },
	})

	it("keeps the flow when the shape dropped on it is a lane or a pool", () => {
		const defs = flowableFixture()
		for (const shapeId of ["Lane_finance", "Participant_own", "Participant_bank"]) {
			expect(flowIds(run(defs, insert(shapeId))), shapeId).toEqual(flowIds(defs))
		}
	})

	it("still moves a black box dropped on a flow, without splitting it", () => {
		const defs = flowableFixture()
		const after = run(defs, insert("Participant_bank"))
		expect(boundsOf(after, "Participant_bank").y).toBe(boundsOf(defs, "Participant_bank").y + 2)
	})

	it("keeps the flow when the shape dropped on it is locked", () => {
		const defs = withLockedPartner()
		expect(run(defs, insert("Task_p"))).toBe(defs)
	})
})

describe("8a.9 no boundary event on a locked node or a container", () => {
	const attach = (hostId: string): EditorOp => ({
		kind: "createBoundaryEvent",
		hostId,
		eventDefType: "timer",
		bounds: { x: 200, y: 432, width: 36, height: 36 },
		seed: "s1",
	})

	it("refuses to attach to a node of another process", () => {
		const defs = withLockedPartner()
		expect(applyOp(defs, attach("Task_p"))).toEqual({ defs, created: [] })
	})

	it("refuses to attach to a lane or a pool", () => {
		const defs = flowableFixture()
		for (const hostId of ["Lane_finance", "Participant_own"]) {
			expect(applyOp(defs, attach(hostId)), hostId).toEqual({ defs, created: [] })
		}
	})

	it("still attaches to a primary activity", () => {
		const defs = withLockedPartner()
		const r = run(defs, attach("Task_review"))
		const host = primaryProcess(r)?.flowElements.find((el) => el.type === "boundaryEvent")
		expect(host && "attachedToRef" in host ? host.attachedToRef : undefined).toBe("Task_review")
	})
})
