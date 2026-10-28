import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"
import type {
	BpmnCollaboration,
	BpmnDefinitions,
	BpmnFlowElement,
	BpmnLane,
	BpmnProcess,
	BpmnSequenceFlow,
} from "../src/bpmn/bpmn-model.js"
import {
	type LaneSpec,
	allLanes,
	assignLane,
	buildLaneSet,
	collaborationProblems,
	laneForNewNode,
	laneOf,
	laneProblems,
	leafLanes,
	messageEndProblem,
	poolLanedProcesses,
	primaryProcess,
	pruneLaneRefs,
} from "../src/bpmn/swimlanes.js"
import { Bpmn } from "../src/index.js"

const fixture = (name: string): BpmnDefinitions =>
	Bpmn.parse(readFileSync(join(import.meta.dirname, "fixtures/roundtrip", name), "utf8"))

/** Flowable Modeler export: nested lanes whose parent lists the union of its children. */
const flowable = (): BpmnDefinitions => fixture("08-flowable-lanes-pools.bpmn")
/** Camunda Modeler export: two content pools, a black box, flat lanes. */
const camunda = (): BpmnDefinitions => fixture("02-collaboration.bpmn")

function orderProcess(): BpmnProcess {
	const process = flowable().processes[0]
	if (process === undefined) throw new Error("fixture has no process")
	return process
}

function node(id: string, type = "userTask", extra: object = {}): BpmnFlowElement {
	return {
		id,
		type,
		incoming: [],
		outgoing: [],
		extensionElements: [],
		unknownAttributes: {},
		...extra,
	} as BpmnFlowElement
}

function boundary(id: string, host: string): BpmnFlowElement {
	return node(id, "boundaryEvent", { attachedToRef: host, eventDefinitions: [] })
}

function flow(id: string, sourceRef: string, targetRef: string): BpmnSequenceFlow {
	return { id, sourceRef, targetRef, extensionElements: [], unknownAttributes: {} }
}

function lane(id: string, flowNodeRefs: string[], children?: BpmnLane[]): BpmnLane {
	const result: BpmnLane = { id, flowNodeRefs, unknownAttributes: {} }
	if (children !== undefined) result.childLaneSet = { id: `LaneSet_${id}`, lanes: children }
	return result
}

function process(
	id: string,
	flowElements: BpmnFlowElement[],
	lanes?: BpmnLane[],
	sequenceFlows: BpmnSequenceFlow[] = [],
	extra: Partial<BpmnProcess> = {},
): BpmnProcess {
	const result: BpmnProcess = {
		id,
		extensionElements: [],
		flowElements,
		sequenceFlows,
		textAnnotations: [],
		associations: [],
		groups: [],
		unknownAttributes: {},
		...extra,
	}
	if (lanes !== undefined) result.laneSet = { id: `LaneSet_${id}`, lanes, unknownAttributes: {} }
	return result
}

function defsOf(
	processes: BpmnProcess[],
	collaborations: BpmnCollaboration[] = [],
): BpmnDefinitions {
	return { ...camunda(), messages: [], collaborations, processes, diagrams: [] }
}

function collaboration(
	participants: Array<[id: string, processRef?: string]>,
	messageFlows: Array<[id: string, source: string, target: string]> = [],
): BpmnCollaboration {
	return {
		id: "Collaboration_1",
		participants: participants.map(([id, processRef]) =>
			processRef === undefined
				? { id, unknownAttributes: {} }
				: { id, processRef, unknownAttributes: {} },
		),
		messageFlows: messageFlows.map(([id, sourceRef, targetRef]) => ({
			id,
			sourceRef,
			targetRef,
			unknownAttributes: {},
		})),
		textAnnotations: [],
		associations: [],
		groups: [],
		extensionElements: [],
		unknownAttributes: {},
	}
}

function refsOf(process: BpmnProcess): Record<string, string[]> {
	return Object.fromEntries(allLanes(process.laneSet).map((l) => [l.id, l.flowNodeRefs]))
}

/** Nested lanes the editor writes: only leaves carry refs. */
function leafOnly(): BpmnProcess {
	return process(
		"p",
		[node("a"), node("b"), node("c")],
		[lane("sales", [], [lane("inside", ["a"]), lane("desk", ["b"])]), lane("ops", ["c"])],
	)
}

describe("allLanes / leafLanes", () => {
	it("walks nested lanes depth first", () => {
		const laneSet = orderProcess().laneSet
		expect(allLanes(laneSet).map((l) => l.id)).toEqual([
			"Lane_sales",
			"Lane_inside",
			"Lane_desk",
			"Lane_ops",
		])
		expect(leafLanes(laneSet).map((l) => l.id)).toEqual(["Lane_inside", "Lane_desk", "Lane_ops"])
	})

	it("returns nothing without a lane set", () => {
		expect(allLanes(undefined)).toEqual([])
		expect(leafLanes(undefined)).toEqual([])
	})

	it("fails explicitly on a lane tree that loops back on itself", () => {
		const loop = lane("loop", [])
		loop.childLaneSet = { lanes: [loop] }
		expect(() => allLanes({ lanes: [loop] })).toThrow(/"loop".*twice/)
	})
})

describe("laneOf", () => {
	it("answers the deepest lane, not the ancestor that also lists the node", () => {
		expect(laneOf(orderProcess(), "review")?.id).toBe("Lane_inside")
		expect(laneOf(orderProcess(), "ship")?.id).toBe("Lane_ops")
	})

	it("answers undefined for a node in no lane", () => {
		expect(laneOf(orderProcess(), "nowhere")).toBeUndefined()
	})
})

describe("assignLane", () => {
	it("moves a node into a leaf and keeps a union-convention ancestor consistent", () => {
		const moved = refsOf(assignLane(orderProcess(), "ship", "Lane_desk"))
		expect(moved.Lane_desk).toEqual(["decide", "ship"])
		expect(moved.Lane_sales).toEqual(["start", "review", "decide", "ship"])
		expect(moved.Lane_ops).toEqual(["rejected", "done"])
	})

	it("removes a node from the ancestor it leaves", () => {
		const moved = refsOf(assignLane(orderProcess(), "review", "Lane_ops"))
		expect(moved.Lane_sales).toEqual(["start", "decide"])
		expect(moved.Lane_inside).toEqual(["start"])
		expect(moved.Lane_ops).toEqual(["ship", "rejected", "done", "review"])
	})

	it("writes only the leaf when ancestors list nothing", () => {
		const moved = refsOf(assignLane(leafOnly(), "c", "desk"))
		expect(moved).toEqual({ sales: [], inside: ["a"], desk: ["b", "c"], ops: [] })
	})

	it("carries the node's boundary events along", () => {
		const p = process(
			"p",
			[node("a"), boundary("timer", "a")],
			[lane("x", ["a", "timer"]), lane("y", [])],
		)
		expect(refsOf(assignLane(p, "a", "y"))).toEqual({ x: [], y: ["a", "timer"] })
	})

	it("refuses an unknown lane", () => {
		expect(() => assignLane(leafOnly(), "a", "ghost")).toThrow(/Lane "ghost" is not declared/)
	})

	it("refuses a lane that has child lanes", () => {
		expect(() => assignLane(leafOnly(), "a", "sales")).toThrow(/Lane "sales" has child lanes/)
	})

	it("does not mutate its input", () => {
		const input = orderProcess()
		const before = structuredClone(input)
		assignLane(input, "ship", "Lane_desk")
		expect(input).toEqual(before)
	})
})

describe("pruneLaneRefs", () => {
	it("drops refs that are not top-level flow nodes of the process", () => {
		const p = process(
			"p",
			[
				node("a"),
				node("store", "dataStoreReference"),
				node("sub", "subProcess", { flowElements: [node("inner")], sequenceFlows: [] }),
			],
			[lane("x", ["a", "ghost", "store", "inner", "sub"])],
		)
		expect(refsOf(pruneLaneRefs(p))).toEqual({ x: ["a", "sub"] })
	})

	it("removes a lane set that holds no lanes", () => {
		const pruned = pruneLaneRefs(process("p", [node("a")], []))
		expect("laneSet" in pruned).toBe(false)
	})
})

describe("buildLaneSet", () => {
	const specs: LaneSpec[] = [
		{ id: "sales", name: "Sales", lanes: [{ id: "inside" }, { id: "desk", name: "Desk" }] },
		{ id: "ops" },
	]

	it("builds nested lanes, puts boundary events in their host's lane and writes the union", () => {
		const p = process("order", [node("a"), node("b"), boundary("b_timer", "b"), node("c")])
		const leafOf = new Map([
			["a", "inside"],
			["b", "desk"],
			["c", "ops"],
		])
		expect(buildLaneSet(p, specs, leafOf)).toEqual({
			id: "LaneSet_order",
			lanes: [
				{
					id: "sales",
					name: "Sales",
					flowNodeRefs: ["a", "b", "b_timer"],
					unknownAttributes: {},
					childLaneSet: {
						id: "LaneSet_sales",
						lanes: [
							{ id: "inside", flowNodeRefs: ["a"], unknownAttributes: {} },
							{ id: "desk", name: "Desk", flowNodeRefs: ["b", "b_timer"], unknownAttributes: {} },
						],
						unknownAttributes: {},
					},
				},
				{ id: "ops", flowNodeRefs: ["c"], unknownAttributes: {} },
			],
			unknownAttributes: {},
		})
	})

	it("refuses every membership naming an unknown or a parent lane, at once", () => {
		const p = process("order", [node("a"), node("b")])
		const leafOf = new Map([
			["a", "ghost"],
			["b", "sales"],
		])
		expect(() => buildLaneSet(p, specs, leafOf)).toThrow(
			/Lane "ghost" is not declared[\s\S]*Lane "sales" has child lanes/,
		)
	})

	it("fails explicitly on a spec tree that loops back on itself", () => {
		const loop: LaneSpec = { id: "loop" }
		loop.lanes = [loop]
		expect(() => buildLaneSet(process("p", []), [loop], new Map())).toThrow(/"loop".*twice/)
	})
})

describe("buildLaneSet ids", () => {
	it("gives the lane set an id no lane or node already has", () => {
		const p = process("order", [node("t")])
		const set = buildLaneSet(
			p,
			[{ id: "LaneSet_order", lanes: [{ id: "a" }, { id: "LaneSet_a" }] }],
			new Map([["t", "a"]]),
		)
		const ids = [set.id, set.lanes[0]?.id, set.lanes[0]?.childLaneSet?.id, "t", "order"]
		expect(new Set(ids).size).toBe(ids.length)
	})
})

describe("laneForNewNode", () => {
	const laned = (flows: BpmnSequenceFlow[], extra: BpmnFlowElement[] = []): BpmnProcess =>
		process(
			"p",
			[node("s"), node("a"), node("n"), ...extra],
			[lane("first", ["s"]), lane("second", ["a"])],
			flows,
		)

	it("follows the first predecessor that has a lane", () => {
		const p = laned([flow("f1", "s", "a"), flow("f2", "a", "n")])
		expect(laneForNewNode(p, "n")?.id).toBe("second")
	})

	it("falls back to the first successor", () => {
		expect(laneForNewNode(laned([flow("f1", "n", "a")]), "n")?.id).toBe("second")
	})

	it("falls back to the first leaf lane", () => {
		expect(laneForNewNode(laned([]), "n")?.id).toBe("first")
	})

	it("puts a boundary event in its host's lane", () => {
		expect(laneForNewNode(laned([], [boundary("err", "a")]), "err")?.id).toBe("second")
	})

	it("answers undefined when the process has no lanes", () => {
		expect(laneForNewNode(process("p", [node("n")]), "n")).toBeUndefined()
	})
})

describe("primaryProcess", () => {
	const exec = (id: string, isExecutable?: boolean): BpmnProcess =>
		process("x", [], undefined, [], isExecutable === undefined ? { id } : { id, isExecutable })

	it("picks the first executable process in participant order", () => {
		const defs = defsOf(
			[exec("a", true), exec("b", true)],
			[
				collaboration([
					["P_b", "b"],
					["P_a", "a"],
				]),
			],
		)
		expect(primaryProcess(defs)?.id).toBe("b")
	})

	it("picks the first executable process when no participant names one", () => {
		expect(primaryProcess(defsOf([exec("a"), exec("b", true)]))?.id).toBe("b")
	})

	it("falls back to the first process", () => {
		expect(primaryProcess(defsOf([exec("a"), exec("b", false)]))?.id).toBe("a")
		expect(primaryProcess(defsOf([]))).toBeUndefined()
	})

	it("prefers an empty process Flowable reads as executable over one marked non-executable", () => {
		// Emptying the content process must not hand the edits to the partner's.
		expect(primaryProcess(defsOf([exec("a", false), exec("b")]))?.id).toBe("b")
	})

	describe("once every process is empty", () => {
		const pool = (id: string, height: number, y: number) => ({
			id: `S_${id}`,
			bpmnElement: id,
			bounds: { x: 0, y, width: 600, height },
			unknownAttributes: {},
		})
		/** A partner band drawn first and small, the user's pool below and large. */
		const drawn = (isExecutable?: boolean): BpmnDefinitions => ({
			...defsOf(
				[exec("a", isExecutable), exec("b", isExecutable)],
				[
					collaboration([
						["P_a", "a"],
						["P_b", "b"],
					]),
				],
			),
			diagrams: [
				{
					id: "D",
					plane: {
						id: "Plane",
						bpmnElement: "Collaboration_1",
						shapes: [pool("P_a", 60, 0), pool("P_b", 250, 100)],
						edges: [],
					},
				},
			],
		})

		// The emptied pool is still the one drawn as a working pool, not a band.
		it("picks the largest pool when no process says whether it is executable", () => {
			expect(primaryProcess(drawn())?.id).toBe("b")
		})

		it("picks the largest pool when every process is marked non-executable", () => {
			expect(primaryProcess(drawn(false))?.id).toBe("b")
		})

		it("lets isExecutable win over the pool size", () => {
			const defs = drawn()
			const marked = {
				...defs,
				processes: defs.processes.map((p) => (p.id === "b" ? { ...p, isExecutable: false } : p)),
			}
			expect(primaryProcess(marked)?.id).toBe("a")
		})
	})

	it("prefers a process with content over an empty one when none says it is executable", () => {
		const laned = process("b", [node("t")], [lane("L", ["t"])])
		expect(primaryProcess(defsOf([exec("a"), laned]))?.id).toBe("b")
	})

	it("never marks the only process with content non-executable", () => {
		const laned = process("b", [node("t")], [lane("L", ["t"])])
		const pooled = poolLanedProcesses(defsOf([exec("a"), laned]))
		expect(pooled.processes.find((p) => p.id === "b")?.isExecutable).toBeUndefined()
	})

	it("finds the executable pool of a Flowable export", () => {
		expect(primaryProcess(flowable())?.id).toBe("order")
	})
})

describe("poolLanedProcesses", () => {
	it("is a no-op without lanes and without a collaboration", () => {
		const defs = defsOf([process("p", [node("a")])])
		expect(poolLanedProcesses(defs)).toBe(defs)
	})

	it("gives a laned process a pool named after it, leaving its executability alone", () => {
		const defs = defsOf([process("p", [node("a")], [lane("x", ["a"])], [], { name: "Order" })])
		const pooled = poolLanedProcesses(defs)
		expect(pooled.collaborations).toHaveLength(1)
		expect(pooled.collaborations[0]).toMatchObject({
			id: "Collaboration_1",
			participants: [{ id: "Participant_p", name: "Order", processRef: "p" }],
			messageFlows: [],
		})
		expect(pooled.processes[0]?.isExecutable).toBeUndefined()
		expect(collaborationProblems(pooled)).toEqual([])
	})

	it("names the pool after the process id when the process has no name", () => {
		const pooled = poolLanedProcesses(defsOf([process("p", [node("a")], [lane("x", ["a"])])]))
		expect(pooled.collaborations[0]?.participants[0]?.name).toBe("p")
	})

	it("does not reuse an id the document already holds", () => {
		const defs = defsOf([process("p", [node("a")], [lane("Collaboration_1", ["a"])])])
		expect(poolLanedProcesses(defs).collaborations[0]?.id).toBe("Collaboration_2")
	})

	it("pools every process with content and marks the partner non-executable for Flowable", () => {
		const defs = defsOf([
			process("main", [node("a")], undefined, [], { isExecutable: true }),
			process("partner", [node("b")], [lane("x", ["b"])]),
			process("empty", []),
		])
		const pooled = poolLanedProcesses(defs)
		expect(pooled.collaborations[0]?.participants.map((p) => p.processRef)).toEqual([
			"main",
			"partner",
		])
		expect(pooled.processes.map((p) => p.isExecutable)).toEqual([true, false, undefined])
	})

	it("adds the missing pool to an existing collaboration", () => {
		const defs = camunda()
		const extra = process("Process_extra", [node("x")])
		const pooled = poolLanedProcesses({ ...defs, processes: [...defs.processes, extra] })
		expect(pooled.collaborations[0]?.participants.map((p) => p.id)).toEqual([
			"Participant_buyer",
			"Participant_seller",
			"Participant_carrier",
			"Participant_Process_extra",
		])
		expect(pooled.processes[2]?.isExecutable).toBe(false)
		expect(defs.collaborations[0]?.participants).toHaveLength(3)
	})
})

describe("laneProblems", () => {
	it("accepts the union convention of a Flowable export", () => {
		expect(laneProblems(orderProcess())).toEqual([])
	})

	it("accepts editor-style refs on leaves only", () => {
		expect(laneProblems(leafOnly())).toEqual([])
	})

	it("accepts a flat Camunda export", () => {
		const buyer = camunda().processes[0]
		expect(buyer && laneProblems(buyer)).toEqual([])
	})

	it("reports nothing for a process without lanes", () => {
		expect(laneProblems(process("p", [node("a")]))).toEqual([])
	})

	it("does not ask data elements, or boundary events on an assigned host, for a lane", () => {
		const p = process(
			"p",
			[node("a"), boundary("t", "a"), node("d", "dataObjectReference"), node("o", "dataObject")],
			[lane("x", ["a"])],
		)
		expect(laneProblems(p)).toEqual([])
	})

	const cases: Array<[string, BpmnProcess, RegExp]> = [
		[
			"a dangling ref",
			process("p", [node("a")], [lane("x", ["a", "ghost"])]),
			/Lane "x" lists "ghost", which is not a flow node of process "p"/,
		],
		[
			"a ref into a sub-process",
			process(
				"p",
				[node("sub", "subProcess", { flowElements: [node("inner")], sequenceFlows: [] })],
				[lane("x", ["sub", "inner"])],
			),
			/Lane "x" lists "inner", which sits inside a sub-process/,
		],
		[
			"a ref to a data element",
			process("p", [node("a"), node("d", "dataStoreReference")], [lane("x", ["a", "d"])]),
			/Lane "x" lists "d", a data object or data store reference/,
		],
		[
			"a node in two leaf lanes",
			process("p", [node("a")], [lane("x", ["a"]), lane("y", ["a"])]),
			/Flow node "a" is in lanes "x" and "y"/,
		],
		[
			"a duplicate lane id",
			process("p", [node("a"), node("b")], [lane("x", ["a"]), lane("x", ["b"])]),
			/Duplicate lane ID "x"/,
		],
		[
			"an unassigned node",
			process("p", [node("a"), node("b")], [lane("x", ["a"])]),
			/Flow node "b" is in no lane of process "p"/,
		],
	]

	for (const [kind, input, message] of cases) {
		it(`reports ${kind} once`, () => {
			const problems = laneProblems(input)
			expect(problems).toHaveLength(1)
			expect(problems[0]).toMatch(message)
		})
	}
})

describe("collaborationProblems", () => {
	it("finds nothing wrong with a clean two-pool model", () => {
		expect(collaborationProblems(camunda())).toEqual([])
		expect(collaborationProblems(flowable())).toEqual([])
	})

	it("finds nothing to say without a collaboration", () => {
		expect(collaborationProblems(defsOf([process("p", [node("a")])]))).toEqual([])
	})

	const two = [process("p", [node("a")]), process("q", [node("b")])]
	const cases: Array<[string, BpmnDefinitions, RegExp]> = [
		[
			"a participant naming a missing process",
			defsOf(two, [
				collaboration([
					["P", "p"],
					["Q", "q"],
					["R", "nope"],
				]),
			]),
			/Participant "R" references process "nope"/,
		],
		[
			"two pools claiming one process",
			defsOf(two, [
				collaboration([
					["P", "p"],
					["Q", "q"],
					["R", "q"],
				]),
			]),
			/Participants "Q" and "R" both reference process "q"/,
		],
		[
			"a duplicate id",
			defsOf(two, [collaboration([["P", "p"], ["Q", "q"], ["P"]])]),
			/Duplicate element ID "P"/,
		],
		[
			"a message flow to nothing",
			defsOf(two, [
				collaboration(
					[
						["P", "p"],
						["Q", "q"],
					],
					[["MF", "a", "ghost"]],
				),
			]),
			/Message flow "MF" names target "ghost"/,
		],
		[
			"a message flow inside one pool",
			defsOf(two, [
				collaboration(
					[
						["P", "p"],
						["Q", "q"],
					],
					[["MF", "P", "a"]],
				),
			]),
			/Message flow "MF" starts and ends in participant "P"/,
		],
		[
			"a process with content and no pool",
			defsOf(two, [collaboration([["P", "p"]])]),
			/Process "q" has content but no participant/,
		],
	]

	for (const [kind, input, message] of cases) {
		it(`reports ${kind} once`, () => {
			const problems = collaborationProblems(input)
			expect(problems).toHaveLength(1)
			expect(problems[0]).toMatch(message)
		})
	}

	it("reports a message flow naming an undeclared message once", () => {
		const defs = camunda()
		const [first] = defs.collaborations
		if (first === undefined) throw new Error("fixture has no collaboration")
		const flows = first.messageFlows.map((f) => ({ ...f, messageRef: "Msg_Ghost" }))
		const problems = collaborationProblems({
			...defs,
			collaborations: [{ ...first, messageFlows: flows.slice(0, 1) }],
		})
		expect(problems).toEqual([
			'Message flow "MessageFlow_order" references message "Msg_Ghost", which this diagram does not declare',
		])
	})
})

describe("messageEndProblem", () => {
	it("lets activities, pools and plain or message events be the ends they can be", () => {
		expect(messageEndProblem("serviceTask", undefined, "source")).toBeUndefined()
		expect(messageEndProblem("receiveTask", undefined, "target")).toBeUndefined()
		expect(messageEndProblem("participant", undefined, "target")).toBeUndefined()
		expect(messageEndProblem("endEvent", "message", "source")).toBeUndefined()
		expect(messageEndProblem("startEvent", undefined, "target")).toBeUndefined()
		expect(messageEndProblem("boundaryEvent", "message", "target")).toBeUndefined()
	})

	it("refuses gateways, data and events that point the wrong way or wait for something else", () => {
		expect(messageEndProblem("exclusiveGateway", undefined, "source")).toMatch(/gateway/)
		expect(messageEndProblem("complexGateway", undefined, "target")).toMatch(/gateway/)
		expect(messageEndProblem("dataObjectReference", undefined, "source")).toMatch(/data/)
		expect(messageEndProblem("dataStoreReference", undefined, "target")).toMatch(/data/)
		expect(messageEndProblem("startEvent", undefined, "source")).toMatch(/start event/)
		expect(messageEndProblem("intermediateCatchEvent", "message", "source")).toMatch(/catch/)
		expect(messageEndProblem("endEvent", undefined, "target")).toMatch(/end event/)
		expect(messageEndProblem("intermediateThrowEvent", undefined, "target")).toMatch(/throw/)
		expect(messageEndProblem("startEvent", "timer", "target")).toBe(
			"a timer event cannot receive a message",
		)
	})
})
