import { Bpmn, type BpmnDefinitions } from "@bpmnkit/core"
import { describe, expect, it } from "vitest"
import { createIdFactory, genId, newIdSeed } from "../src/id.js"
import {
	copyElements,
	createConnection,
	createEmptyDefinitions,
	createShape,
} from "../src/modeling.js"
import { type EditorOp, applyOp } from "../src/ops.js"
import { primaryFirst } from "../src/swimlanes.js"
import {
	type FlowableOrder,
	documentOrder,
	expectFlowableKept,
	flowableFixture,
} from "./swimlane-helpers.js"

/** A document with one task and one gateway to hang edits off. */
function seeded() {
	const a = createShape(createEmptyDefinitions(), "task", {
		x: 100,
		y: 100,
		width: 100,
		height: 80,
	})
	const b = createShape(a.defs, "exclusiveGateway", { x: 300, y: 115, width: 50, height: 50 })
	return { defs: b.defs, taskId: a.id, gatewayId: b.id }
}

/** A document with a task, a gateway and the flow between them. */
function seededWithFlow() {
	const { defs, taskId, gatewayId } = seeded()
	const flow = createConnection(defs, taskId, gatewayId, [
		{ x: 200, y: 140 },
		{ x: 300, y: 140 },
	])
	return { defs: flow.defs, taskId, gatewayId, flowId: flow.id, laneId: "" }
}

/** What {@link everyOp} edits: a document and three of its elements. */
interface OpTarget {
	defs: BpmnDefinitions
	taskId: string
	gatewayId: string
	flowId: string
	/** A lane to add a lane beside; none on a document without lanes. */
	laneId: string
}

/** The laned Flowable fixture in `order`, as an {@link OpTarget}. */
function seededLaned(order: FlowableOrder = "first"): OpTarget {
	return {
		defs: flowableFixture(order),
		taskId: "Task_review",
		gatewayId: "Gateway_ok",
		flowId: "Flow_3",
		laneId: "Lane_finance",
	}
}

/**
 * Every op kind. Adding a kind to `EditorOp` without listing it here does not
 * compile (`tsconfig.test.json`), and the coverage test below fails when
 * {@link everyOp} leaves a listed kind out.
 */
const EVERY_KIND: Record<EditorOp["kind"], true> = {
	createShape: true,
	createBoundaryEvent: true,
	createAnnotation: true,
	createAnnotationFor: true,
	createConnection: true,
	createConnected: true,
	paste: true,
	move: true,
	resize: true,
	delete: true,
	rename: true,
	labelPosition: true,
	color: true,
	changeType: true,
	reconnect: true,
	insertWaypoint: true,
	moveWaypoint: true,
	moveSegment: true,
	autoLayout: true,
	snapshot: true,
	addParticipant: true,
	addLane: true,
	space: true,
}

/** Every op kind, against `target`, each with a fixed seed. */
function everyOp({ defs, taskId, gatewayId, flowId, laneId }: OpTarget): EditorOp[] {
	const bounds = { x: 400, y: 200, width: 100, height: 80 }
	const waypoints = [
		{ x: 200, y: 140 },
		{ x: 300, y: 140 },
	]
	// What the editor copies: the primary process, wherever the file lists it.
	const clipboard = copyElements(primaryFirst(defs), [taskId, gatewayId])
	return [
		{ kind: "createShape", type: "userTask", bounds, seed: "s1" },
		{ kind: "createBoundaryEvent", hostId: taskId, eventDefType: "timer", bounds, seed: "s2" },
		{ kind: "createAnnotation", bounds, text: "note", seed: "s3" },
		{
			kind: "createAnnotationFor",
			sourceId: taskId,
			bounds,
			sourceBounds: { x: 100, y: 100, width: 100, height: 80 },
			seed: "s4",
		},
		{ kind: "createConnection", sourceId: taskId, targetId: gatewayId, waypoints, seed: "s5" },
		{
			kind: "createConnected",
			sourceId: taskId,
			type: "serviceTask",
			name: "Charge",
			bounds,
			waypoints,
			seed: "s6",
		},
		{ kind: "paste", clipboard, offsetX: 20, offsetY: 20, seed: "s7" },
		{ kind: "move", moves: [{ id: taskId, dx: 20, dy: -10 }] },
		{ kind: "resize", id: taskId, bounds: { x: 100, y: 100, width: 160, height: 90 } },
		{ kind: "rename", id: taskId, name: "Renamed" },
		{ kind: "labelPosition", id: gatewayId, bounds: { x: 290, y: 170, width: 70, height: 14 } },
		{ kind: "color", id: taskId, color: { fill: "#ffe0b2", stroke: "#e65100" } },
		{ kind: "reconnect", edgeId: flowId, isStart: false, port: "top" },
		{ kind: "insertWaypoint", edgeId: flowId, segIdx: 0, point: { x: 250, y: 160 } },
		{ kind: "moveWaypoint", edgeId: flowId, wpIdx: 0, point: { x: 205, y: 150 } },
		{ kind: "moveSegment", edgeId: flowId, segIdx: 0, isHoriz: true, delta: 10 },
		{ kind: "changeType", id: gatewayId, type: "parallelGateway" },
		// Below the laned file's pools; on a pool-less document it is the first pool.
		{ kind: "addParticipant", bounds: { x: 0, y: 700, width: 640, height: 60 }, seed: "s8" },
		// A lane's bottom edge 40 down, the lane below giving up as much (8c.1).
		{ kind: "resize", id: laneId, bounds: { x: 30, y: 120, width: 610, height: 160 } },
		{ kind: "addLane", refId: laneId, where: "above", seed: "s9" },
		// Room right of the task: the gateway moves, the pools and lanes the line crosses widen (8c.3).
		{ kind: "space", origin: 250, axis: "h", delta: 60 },
		{ kind: "snapshot", defs: structuredClone(defs) },
		{ kind: "autoLayout" },
		// Last, so a replayed session still has the gateway the ops before it name.
		{ kind: "delete", ids: [gatewayId] },
	]
}

describe("applyOp determinism", () => {
	it("yields byte-identical XML when the same op is replayed", () => {
		const target = seededWithFlow()
		const { defs } = target
		for (const op of everyOp(target)) {
			const first = Bpmn.export(applyOp(defs, op).defs)
			const second = Bpmn.export(applyOp(defs, op).defs)
			expect(second, `op ${op.kind} is not reproducible`).toBe(first)
		}
	})

	it("replays a whole session of ops to the same document", () => {
		const target = seededWithFlow()
		const { defs } = target
		const ops = everyOp(target)
		const run = () => ops.reduce((d, op) => applyOp(d, op).defs, defs)
		expect(Bpmn.export(run())).toBe(Bpmn.export(run()))
	})

	it("keeps paste reproducible, ids and all", () => {
		const { defs, taskId, gatewayId } = seeded()
		const clipboard = copyElements(defs, [taskId, gatewayId])
		const op: EditorOp = { kind: "paste", clipboard, offsetX: 20, offsetY: 20, seed: "paste-seed" }
		const a = applyOp(defs, op)
		const b = applyOp(defs, op)
		expect(a.created).toEqual(b.created)
		expect(Bpmn.export(b.defs)).toBe(Bpmn.export(a.defs))
	})

	it("mints different ids for different seeds", () => {
		const { defs } = seeded()
		const bounds = { x: 400, y: 200, width: 100, height: 80 }
		const one = applyOp(defs, { kind: "createShape", type: "task", bounds, seed: "a" })
		const two = applyOp(defs, { kind: "createShape", type: "task", bounds, seed: "b" })
		expect(one.created[0]).not.toBe(two.created[0])
	})

	it("reports what it created, in the order it was made", () => {
		const { defs, taskId } = seeded()
		const r = applyOp(defs, {
			kind: "createConnected",
			sourceId: taskId,
			type: "task",
			bounds: { x: 400, y: 200, width: 100, height: 80 },
			waypoints: [
				{ x: 200, y: 140 },
				{ x: 400, y: 240 },
			],
			seed: "s",
		})
		expect(r.created).toHaveLength(2)
		const process = r.defs.processes[0]
		expect(process?.flowElements.some((e) => e.id === r.created[0])).toBe(true)
		expect(process?.sequenceFlows.some((f) => f.id === r.created[1])).toBe(true)
	})

	it("reports the pool, the collaboration and the lanes it created", () => {
		const { defs } = seeded()
		const bounds = { x: 0, y: 700, width: 640, height: 60 }
		const pooled = applyOp(defs, { kind: "addParticipant", bounds, seed: "p" })
		const [poolId, collaborationId] = pooled.created
		expect(pooled.created).toHaveLength(2)
		expect(pooled.defs.collaborations[0]?.id).toBe(collaborationId)
		expect(pooled.defs.collaborations[0]?.participants[0]?.id).toBe(poolId)
		const box = applyOp(pooled.defs, { kind: "addParticipant", bounds, seed: "b" })
		expect(box.created).toHaveLength(1)
		expect(box.defs.collaborations[0]?.participants[1]?.id).toBe(box.created[0])
		const laned = applyOp(pooled.defs, {
			kind: "addLane",
			refId: poolId ?? "",
			where: "below",
			seed: "l",
		})
		const [added, existing, setId] = laned.created
		const laneSet = laned.defs.processes[0]?.laneSet
		expect(laneSet?.id).toBe(setId)
		expect(laneSet?.lanes.map((l) => l.id)).toEqual([existing, added])
		const more = applyOp(laned.defs, {
			kind: "addLane",
			refId: added ?? "",
			where: "below",
			seed: "m",
		})
		expect(more.created).toHaveLength(1)
		expect(more.defs.processes[0]?.laneSet?.lanes.at(-1)?.id).toBe(more.created[0])
	})

	it("splices a shape onto a flow when the op says so", () => {
		const { defs, taskId, gatewayId } = seeded()
		const connected = applyOp(defs, {
			kind: "createConnection",
			sourceId: taskId,
			targetId: gatewayId,
			waypoints: [
				{ x: 200, y: 140 },
				{ x: 300, y: 140 },
			],
			seed: "flow",
		})
		const flowId = connected.created[0] ?? ""
		const spliced = applyOp(connected.defs, {
			kind: "createShape",
			type: "task",
			bounds: { x: 220, y: 100, width: 60, height: 80 },
			onEdge: flowId,
			seed: "mid",
		})
		// The original flow now stops at the new shape, and a second flow continues.
		expect(spliced.defs.processes[0]?.sequenceFlows).toHaveLength(2)
	})

	it("passes a snapshot straight through", () => {
		const { defs } = seeded()
		const other = createEmptyDefinitions()
		expect(applyOp(defs, { kind: "snapshot", defs: other }).defs).toBe(other)
	})
})

describe("every op", () => {
	it("is listed in everyOp", () => {
		const kinds = new Set(everyOp(seededWithFlow()).map((op) => op.kind))
		expect([...kinds].sort()).toEqual(Object.keys(EVERY_KIND).sort())
	})

	for (const order of ["first", "second", "second-diagram"] as const) {
		it(`keeps flowable:* attributes, extensions and isExecutable on the laned Flowable file (${order})`, () => {
			const target = seededLaned(order)
			for (const op of everyOp(target)) {
				const next = applyOp(target.defs, op).defs
				expectFlowableKept(target.defs, next)
				expect(documentOrder(next).processes, op.kind).toEqual(documentOrder(target.defs).processes)
			}
		})

		it(`replays a whole session to the same document on the laned Flowable file (${order})`, () => {
			const target = seededLaned(order)
			const run = () => everyOp(target).reduce((d, op) => applyOp(d, op).defs, target.defs)
			const once = run()
			expect(Bpmn.export(run())).toBe(Bpmn.export(once))
			expectFlowableKept(target.defs, once)
		})
	}

	it("keeps the diagram order for every op but autoLayout, which drops the partner's diagram", () => {
		const target = seededLaned("second-diagram")
		for (const op of everyOp(target)) {
			const next = applyOp(target.defs, op).defs
			const expected =
				op.kind === "autoLayout" ? ["BPMNDiagram_order"] : documentOrder(target.defs).diagrams
			expect(documentOrder(next).diagrams, op.kind).toEqual(expected)
		}
	})
})

describe("id factories", () => {
	it("gives the same sequence for the same seed", () => {
		const seed = newIdSeed()
		const a = createIdFactory(seed)
		const b = createIdFactory(seed)
		const fromA = [a("Task"), a("Task"), a("Flow")]
		expect([b("Task"), b("Task"), b("Flow")]).toEqual(fromA)
	})

	it("keeps the prefix, and is shaped like a random id", () => {
		const id = createIdFactory("seed")("Gateway")
		expect(id).toMatch(/^Gateway_[0-9a-z]{7}$/)
		expect(genId("Gateway")).toMatch(/^Gateway_[0-9a-z]{1,7}$/)
	})

	it("gives a different sequence for a different seed", () => {
		expect(createIdFactory("one")("Task")).not.toBe(createIdFactory("two")("Task"))
	})
})
