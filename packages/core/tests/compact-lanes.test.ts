import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

import {
	Bpmn,
	allLanes,
	applyBpmnOperations,
	collaborationProblems,
	compactify,
	createCompactStream,
	expand,
	laneOf,
	laneProblems,
	reconcileCompact,
} from "../src/index.js"
import type {
	BpmnDefinitions,
	BpmnLaneSet,
	BpmnProcess,
	CompactDiagram,
	CompactLane,
} from "../src/index.js"

function fixture(name: string): BpmnDefinitions {
	const path = fileURLToPath(new URL(`./fixtures/roundtrip/${name}`, import.meta.url))
	return Bpmn.parse(readFileSync(path, "utf8"))
}

/** Lane tree as `id[name]` with children, so nesting and names compare in one value. */
function laneTree(laneSet: BpmnLaneSet | undefined): unknown[] {
	return (laneSet?.lanes ?? []).map((lane) => ({
		id: lane.id,
		name: lane.name,
		children: laneTree(lane.childLaneSet),
	}))
}

/** Every top-level flow node of `process` mapped to its deepest lane. */
function membership(process: BpmnProcess): Record<string, string | undefined> {
	return Object.fromEntries(
		process.flowElements.map((element) => [element.id, laneOf(process, element.id)?.id]),
	)
}

function processOf(defs: BpmnDefinitions, id: string): BpmnProcess {
	const process = defs.processes.find((candidate) => candidate.id === id)
	if (!process) throw new Error(`no process ${id}`)
	return process
}

/** One laned executable process plus a black-box partner. */
function lanedCompact(): CompactDiagram {
	return {
		id: "Definitions_laned",
		participants: [
			{ id: "Pool_main", name: "Company", processId: "main" },
			{ id: "Pool_bank", name: "Bank" },
		],
		messageFlows: [{ id: "Msg_pay", source: "pay", target: "Pool_bank", name: "Payment" }],
		processes: [
			{
				id: "main",
				name: "Main",
				lanes: [
					{ id: "Lane_sales", name: "Sales", members: ["start", "review"] },
					{ id: "Lane_finance", name: "Finance", members: ["pay", "end"] },
				],
				elements: [
					{ id: "start", type: "startEvent" },
					{ id: "review", type: "userTask", name: "Review" },
					{ id: "pay", type: "sendTask", name: "Pay" },
					{ id: "end", type: "endEvent" },
				],
				flows: [
					{ id: "f1", from: "start", to: "review" },
					{ id: "f2", from: "review", to: "pay" },
					{ id: "f3", from: "pay", to: "end" },
				],
			},
		],
	}
}

describe("compactify: lanes, pools and executability", () => {
	it("emits nested lanes, participants, message flows and executable for the Flowable fixture", () => {
		const compact = compactify(fixture("08-flowable-lanes-pools.bpmn"))
		const order = compact.processes.find((p) => p.id === "order")
		const customer = compact.processes.find((p) => p.id === "customer")

		expect(order?.lanes).toEqual([
			{
				id: "Lane_sales",
				name: "Sales",
				lanes: [
					{ id: "Lane_inside", name: "Inside sales", members: ["start", "review"] },
					{ id: "Lane_desk", name: "Sales desk", members: ["decide"] },
				],
			},
			{ id: "Lane_ops", name: "Operations", members: ["ship", "rejected", "done"] },
		])
		expect(order).not.toHaveProperty("executable")
		expect(customer?.executable).toBe(false)
		expect(customer).not.toHaveProperty("lanes")
		expect(compact.participants).toEqual([
			{ id: "Participant_company", name: "Company", processId: "order" },
			{ id: "Participant_customer", name: "Customer", processId: "customer" },
		])
		expect(compact.messageFlows).toEqual([
			{
				id: "MessageFlow_confirm",
				source: "ship",
				target: "Participant_customer",
				name: "Confirmation",
			},
		])
	})

	it("emits a black-box participant without processId and participant-to-participant message flows", () => {
		const compact = compactify(fixture("02-collaboration.bpmn"))

		expect(compact.participants).toContainEqual({ id: "Participant_carrier", name: "Carrier" })
		expect(compact.messageFlows).toEqual([
			{
				id: "MessageFlow_order",
				source: "Participant_buyer",
				target: "Participant_seller",
				name: "Order",
			},
			{
				id: "MessageFlow_ack",
				source: "Participant_seller",
				target: "Participant_buyer",
				name: "Acknowledgement",
			},
		])
		expect(compact.processes.find((p) => p.id === "Process_buyer")?.lanes).toEqual([
			{ id: "Lane_ordering", name: "Ordering", members: ["Start_buyer", "Task_place_order"] },
			{ id: "Lane_receiving", name: "Receiving", members: ["End_buyer"] },
		])
		expect(compact.processes.find((p) => p.id === "Process_seller")?.executable).toBe(false)
	})

	it("keeps lane-free output byte-identical to the output captured before lanes were added, but for executable: false", () => {
		const baseline = JSON.parse(
			readFileSync(
				fileURLToPath(new URL("./fixtures/compact-lanes/lane-free-baseline.json", import.meta.url)),
				"utf8",
			),
		) as Record<string, { compact: string; xml: string | null }>

		for (const [name, captured] of Object.entries(baseline)) {
			const before = JSON.parse(captured.compact) as CompactDiagram
			if (captured.xml !== null) expect(Bpmn.export(expand(before)), name).toBe(captured.xml)
			if (!name.endsWith(".bpmn")) continue

			// The one new key a lane-free file can produce: a process that says it is
			// not executable now says so in compact form too.
			const defs = fixture(name)
			const now = compactify(defs)
			for (const process of now.processes) {
				const source = processOf(defs, process.id)
				expect(process.executable, `${name} ${process.id}`).toBe(
					source.isExecutable === false ? false : undefined,
				)
				process.executable = undefined
			}
			expect(JSON.stringify(now), name).toBe(captured.compact)
		}
	})
})

describe("expand(compactify(x)) round trip", () => {
	for (const name of ["08-flowable-lanes-pools.bpmn", "02-collaboration.bpmn"]) {
		it(`preserves lanes, participants, message flows and isExecutable of ${name}`, () => {
			const original = fixture(name)
			const restored = expand(compactify(original))

			for (const process of original.processes) {
				const back = processOf(restored, process.id)
				expect(laneTree(back.laneSet), process.id).toEqual(laneTree(process.laneSet))
				expect(membership(back), process.id).toEqual(membership(process))
				expect(back.isExecutable ?? true, process.id).toBe(process.isExecutable ?? true)
			}
			const participants = (defs: BpmnDefinitions) =>
				defs.collaborations[0]?.participants.map(({ id, name, processRef }) => ({
					id,
					name,
					processRef,
				}))
			expect(participants(restored)).toEqual(participants(original))
			const flows = (defs: BpmnDefinitions) =>
				defs.collaborations[0]?.messageFlows.map(({ id, name, sourceRef, targetRef }) => ({
					id,
					name,
					sourceRef,
					targetRef,
				}))
			expect(flows(restored)).toEqual(flows(original))
		})

		it(`gives ${name} a valid model with DI for every lane, pool and message flow`, () => {
			const restored = expand(compactify(fixture(name)))
			const plane = restored.diagrams[0]?.plane
			const shaped = new Set(plane?.shapes.map((shape) => shape.bpmnElement))
			const edged = new Set(plane?.edges.map((edge) => edge.bpmnElement))
			const collaboration = restored.collaborations[0]

			for (const process of restored.processes) expect(laneProblems(process)).toEqual([])
			expect(collaborationProblems(restored)).toEqual([])
			expect(plane?.bpmnElement).toBe(collaboration?.id)
			for (const process of restored.processes) {
				for (const lane of allLanes(process.laneSet)) expect(shaped, lane.id).toContain(lane.id)
			}
			for (const participant of collaboration?.participants ?? []) {
				expect(shaped, participant.id).toContain(participant.id)
			}
			for (const flow of collaboration?.messageFlows ?? [])
				expect(edged, flow.id).toContain(flow.id)
		})
	}

	it('writes isExecutable="false" on the partner process and survives export and parse', () => {
		const xml = Bpmn.export(expand(compactify(fixture("08-flowable-lanes-pools.bpmn"))))
		const reparsed = Bpmn.parse(xml)
		expect(processOf(reparsed, "customer").isExecutable).toBe(false)
		expect(processOf(reparsed, "order").isExecutable).toBe(true)
		expect(xml).toContain("childLaneSet")
	})
})

describe("expand: lanes, pools and executability", () => {
	it("builds a pooled, laned model from a hand-written compact", () => {
		const defs = expand(lanedCompact())
		const main = processOf(defs, "main")

		expect(membership(main)).toEqual({
			start: "Lane_sales",
			review: "Lane_sales",
			pay: "Lane_finance",
			end: "Lane_finance",
		})
		expect(defs.collaborations[0]?.participants.map((p) => [p.id, p.processRef])).toEqual([
			["Pool_main", "main"],
			["Pool_bank", undefined],
		])
		expect(defs.collaborations[0]?.messageFlows[0]).toMatchObject({
			id: "Msg_pay",
			sourceRef: "pay",
			targetRef: "Pool_bank",
			name: "Payment",
		})
		expect(main.isExecutable).toBe(true)
	})

	it("synthesizes a pool for a laned process that no participant names", () => {
		const compact = lanedCompact()
		compact.participants = undefined
		compact.messageFlows = undefined
		const defs = expand(compact)
		expect(defs.collaborations[0]?.participants.map((p) => p.processRef)).toEqual(["main"])
		expect(defs.diagrams[0]?.plane.bpmnElement).toBe(defs.collaborations[0]?.id)
	})

	it("maps executable: false both ways and leaves an absent key executable", () => {
		const compact: CompactDiagram = {
			id: "D",
			processes: [
				{
					id: "p",
					executable: false,
					elements: [{ id: "s", type: "startEvent" }],
					flows: [],
				},
			],
		}
		const defs = expand(compact)
		expect(processOf(defs, "p").isExecutable).toBe(false)
		expect(compactify(defs).processes[0]?.executable).toBe(false)

		const [only] = compact.processes
		if (only) only.executable = undefined
		expect(processOf(expand(compact), "p").isExecutable).toBe(true)
	})

	it("makes a partner process without the key non-executable once pools exist", () => {
		const compact = lanedCompact()
		compact.processes.push({
			id: "partner",
			elements: [{ id: "ps", type: "startEvent" }],
			flows: [],
		})
		compact.participants?.push({ id: "Pool_partner", processId: "partner" })
		const defs = expand(compact)
		expect(processOf(defs, "main").isExecutable).toBe(true)
		expect(processOf(defs, "partner").isExecutable).toBe(false)
	})

	it("puts a node no lane lists in its predecessor's lane", () => {
		const compact = lanedCompact()
		const main = compact.processes[0]
		if (!main?.lanes) throw new Error("fixture")
		main.lanes = [
			{ id: "Lane_sales", members: ["start", "review"] },
			{ id: "Lane_finance", members: ["end"] },
		]
		const defs = expand(compact)
		expect(laneOf(processOf(defs, "main"), "pay")?.id).toBe("Lane_sales")
		expect(laneProblems(processOf(defs, "main"))).toEqual([])
	})
})

describe("expand: invalid lanes and pools are reported", () => {
	const withLanes = (lanes: CompactLane[]): CompactDiagram => {
		const compact = lanedCompact()
		const main = compact.processes[0]
		if (main) main.lanes = lanes
		return compact
	}

	it("rejects a lane id that is already taken", () => {
		expect(() => expand(withLanes([{ id: "review", members: ["start"] }]))).toThrow(
			/duplicate id "review" \(lane\)/,
		)
	})

	it("rejects a member that is not a node of the process", () => {
		expect(() => expand(withLanes([{ id: "L", members: ["ghost"] }]))).toThrow(
			/lane "L" lists "ghost", which is not a top-level flow node of process "main"/,
		)
	})

	it("rejects a member nested inside a sub-process", () => {
		const compact = withLanes([{ id: "L", members: ["inner"] }])
		compact.processes[0]?.elements.push({
			id: "sub",
			type: "subProcess",
			children: { elements: [{ id: "inner", type: "task" }], flows: [] },
		})
		expect(() => expand(compact)).toThrow(/lane "L" lists "inner", which is not a top-level/)
	})

	it("rejects a data reference as a member", () => {
		const compact = withLanes([{ id: "L", members: ["data"] }])
		compact.processes[0]?.elements.push({ id: "data", type: "dataObjectReference" })
		expect(() => expand(compact)).toThrow(/lane "L" lists "data", a dataObjectReference/)
	})

	it("rejects a node listed in two lanes", () => {
		expect(() =>
			expand(
				withLanes([
					{ id: "A", members: ["start"] },
					{ id: "B", members: ["start"] },
				]),
			),
		).toThrow(/"start" is in lanes "A" and "B"/)
	})

	it("rejects members on a lane that has child lanes", () => {
		expect(() =>
			expand(withLanes([{ id: "P", members: ["start"], lanes: [{ id: "C", members: ["end"] }] }])),
		).toThrow(/lane "P" has child lanes and members/)
	})

	it("rejects a duplicate participant or message flow id", () => {
		const compact = lanedCompact()
		compact.participants?.push({ id: "Msg_pay", name: "Clash" })
		expect(() => expand(compact)).toThrow(/duplicate id "Msg_pay"/)
	})

	it("rejects a participant naming a missing process", () => {
		const compact = lanedCompact()
		compact.participants?.push({ id: "Pool_x", processId: "nowhere" })
		expect(() => expand(compact)).toThrow(/Participant "Pool_x" references process "nowhere"/)
	})

	it("rejects a message flow end that is neither a participant nor a node in one", () => {
		const compact = lanedCompact()
		compact.messageFlows?.push({ id: "Msg_bad", source: "Pool_bank", target: "ghost" })
		expect(() => expand(compact)).toThrow(/Message flow "Msg_bad" names target "ghost"/)
	})

	it("rejects a message flow that stays inside one pool", () => {
		const compact = lanedCompact()
		compact.messageFlows?.push({ id: "Msg_in", source: "review", target: "pay" })
		expect(() => expand(compact)).toThrow(/Message flow "Msg_in" starts and ends in participant/)
	})
})

describe("createCompactStream with lanes and pools", () => {
	it("never reads a lane, participant or message-flow literal as an element or a flow", () => {
		const compact = lanedCompact()
		const text = JSON.stringify({ diagram: compact })
		const stream = createCompactStream()
		const elementIds = new Set(compact.processes[0]?.elements.map((e) => e.id))
		const flowIds = new Set(compact.processes[0]?.flows.map((f) => f.id))
		let frames = 0
		for (const ch of text) {
			const frame = stream.push(ch)
			if (!frame) continue
			frames++
			const process = frame.processes[0]
			for (const element of process?.flowElements ?? []) expect(elementIds).toContain(element.id)
			for (const flow of process?.sequenceFlows ?? []) expect(flowIds).toContain(flow.id)
		}
		expect(frames).toBeGreaterThan(0)
	})
})

describe("reconcileCompact and full operations keep lanes consistent", () => {
	const flowable = () => fixture("08-flowable-lanes-pools.bpmn")

	it("rebuilds lane membership when the compact carries lanes", () => {
		const defs = flowable()
		const compact = compactify(defs)
		const order = compact.processes.find((p) => p.id === "order")
		if (!order?.lanes) throw new Error("fixture")
		order.lanes = [
			{ id: "Lane_sales", name: "Sales", members: ["start", "review", "decide"] },
			{ id: "Lane_ops", name: "Operations", members: ["ship", "rejected", "done"] },
		]
		const result = reconcileCompact(defs, compact)
		const process = processOf(result.definitions, "order")

		expect(laneOf(process, "decide")?.id).toBe("Lane_sales")
		expect(allLanes(process.laneSet).map((lane) => lane.id)).toEqual(["Lane_sales", "Lane_ops"])
		expect(laneProblems(process)).toEqual([])
		// The lanes moved; the Flowable configuration of the nodes did not.
		expect(process.flowElements).toEqual(processOf(defs, "order").flowElements)
		expect(process.unknownAttributes).toEqual(processOf(defs, "order").unknownAttributes)
	})

	it("leaves the lane set alone when the compact has no lanes key", () => {
		const defs = flowable()
		const compact = compactify(defs)
		for (const process of compact.processes) process.lanes = undefined
		compact.participants = undefined
		compact.messageFlows = undefined
		const result = reconcileCompact(defs, compact)
		expect(processOf(result.definitions, "order").laneSet).toEqual(processOf(defs, "order").laneSet)
		expect(result.definitions.collaborations).toEqual(defs.collaborations)
	})

	it("drops a deleted node from its lanes", () => {
		const defs = flowable()
		const compact = compactify(defs)
		const order = compact.processes.find((p) => p.id === "order")
		if (!order) throw new Error("fixture")
		for (const process of compact.processes) process.lanes = undefined
		order.elements = order.elements.filter((e) => e.id !== "rejected")
		order.flows = order.flows.filter((f) => f.to !== "rejected")
		const process = processOf(reconcileCompact(defs, compact).definitions, "order")
		expect(allLanes(process.laneSet).some((lane) => lane.flowNodeRefs.includes("rejected"))).toBe(
			false,
		)
		expect(laneProblems(process)).toEqual([])
	})

	it("puts an inserted node in its predecessor's lane", () => {
		const defs = flowable()
		const compact = compactify(defs)
		const order = compact.processes.find((p) => p.id === "order")
		if (!order) throw new Error("fixture")
		for (const process of compact.processes) process.lanes = undefined
		order.elements.push({ id: "notify", type: "serviceTask", name: "Notify" })
		order.flows = order.flows.filter((f) => f.id !== "toDone")
		order.flows.push(
			{ id: "toNotify", from: "ship", to: "notify" },
			{ id: "toDone2", from: "notify", to: "done" },
		)
		const process = processOf(reconcileCompact(defs, compact).definitions, "order")
		expect(laneOf(process, "notify")?.id).toBe("Lane_ops")
		expect(laneProblems(process)).toEqual([])
	})

	it("reconciles participants, message flows and executable when the compact carries them", () => {
		const defs = flowable()
		const compact = compactify(defs)
		compact.messageFlows?.push({ id: "Msg_ask", source: "Participant_customer", target: "start" })
		const customer = compact.processes.find((p) => p.id === "customer")
		if (customer) customer.executable = true
		const result = reconcileCompact(defs, compact)
		const collaboration = result.definitions.collaborations[0]

		expect(collaboration?.messageFlows.map((f) => f.id)).toEqual(["MessageFlow_confirm", "Msg_ask"])
		expect(collaboration?.id).toBe("Collaboration_order")
		expect(processOf(result.definitions, "customer").isExecutable).toBe(true)
		expect(collaborationProblems(result.definitions)).toEqual([])
	})

	it("a partner process the compact adds and pools is not executable, as expand makes it", () => {
		const base = expand({
			id: "D",
			processes: [
				{
					id: "P",
					elements: [{ id: "s", type: "startEvent" }],
					flows: [],
					lanes: [{ id: "Lane_a", members: ["s"] }],
				},
			],
		})
		const compact = compactify(base)
		compact.processes.push({
			id: "Partner",
			elements: [{ id: "ps", type: "startEvent" }],
			flows: [],
		})
		compact.participants = [
			...(compact.participants ?? []),
			{ id: "Pool_partner", processId: "Partner" },
		]
		const executable = (defs: BpmnDefinitions) =>
			defs.processes.map((p) => [p.id, p.isExecutable !== false])

		expect(executable(reconcileCompact(base, compact).definitions)).toEqual(
			executable(expand(compact)),
		)
		expect(processOf(reconcileCompact(base, compact).definitions, "Partner").isExecutable).toBe(
			false,
		)
	})

	it("applyBpmnOperations: delete prunes lane refs and dangling message flows", () => {
		const { definitions } = applyBpmnOperations(flowable(), [{ op: "delete", id: "ship" }])
		const process = processOf(definitions, "order")
		expect(laneOf(process, "ship")).toBeUndefined()
		expect(definitions.collaborations[0]?.messageFlows).toEqual([])
	})

	it("applyBpmnOperations: insert then add_flow puts the node in the predecessor's lane", () => {
		const { definitions } = applyBpmnOperations(flowable(), [
			{ op: "insert", element: { id: "audit", type: "task" }, parent: "order" },
			{ op: "add_flow", id: "toAudit", from: "review", to: "audit", parent: "order" },
		])
		expect(laneOf(processOf(definitions, "order"), "audit")?.id).toBe("Lane_inside")
	})
})
