import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { beforeEach, describe, expect, it } from "vitest"
import { ProcessBuilder } from "../src/bpmn/bpmn-builder.js"
import type { BpmnDefinitions, BpmnDiShape, BpmnLane, BpmnProcess } from "../src/bpmn/bpmn-model.js"
import { Bpmn, allLanes, laneOf, laneProblems, resetIdCounter } from "../src/index.js"

/**
 * Lanes and pools in the fluent builder. A fresh build is strict (every flow
 * node in exactly one leaf lane, or the build throws); continuing a parsed
 * document is lenient, because the document is the user's and may already
 * break rules the builder would enforce on its own output.
 */

const CORPUS = join(dirname(fileURLToPath(import.meta.url)), "fixtures", "roundtrip")

function fixture(name: string): BpmnDefinitions {
	return Bpmn.parse(readFileSync(join(CORPUS, name), "utf-8"))
}

/** sha256 of the exported XML, minus the exporter version a release bumps. */
function xmlHash(defs: BpmnDefinitions): string {
	const xml = Bpmn.export(defs).replace(/exporterVersion="[^"]*"/, "")
	return createHash("sha256").update(xml).digest("hex")
}

function processOf(defs: BpmnDefinitions, id: string): BpmnProcess {
	const process = defs.processes.find((candidate) => candidate.id === id)
	if (process === undefined) throw new Error(`no process ${id}`)
	return process
}

function laneById(process: BpmnProcess, id: string): BpmnLane {
	const lane = allLanes(process.laneSet).find((candidate) => candidate.id === id)
	if (lane === undefined) throw new Error(`no lane ${id}`)
	return lane
}

beforeEach(() => resetIdCounter())

function plainChain(): ProcessBuilder {
	return Bpmn.createProcess("orders")
		.name("Orders")
		.startEvent("start", { name: "Order received" })
		.userTask("review", { name: "Review" })
		.boundaryEvent("late", "review", { timerDuration: "PT1H", cancelActivity: false })
		.endEvent("late_end")
		.element("review")
		.exclusiveGateway("ok", { name: "OK?" })
		.branch("yes", (b) => b.condition("= ok").serviceTask("ship", { taskType: "ship" }))
		.branch("no", (b) => b.defaultFlow().endEvent("rejected"))
		.element("ship")
		.endEvent("done")
		.annotate("review", "Four eyes")
}

/** Two leaf lanes covering every node of {@link plainChain} except the boundary event. */
function lanedChain(): ProcessBuilder {
	return plainChain()
		.lane("Lane_sales", { name: "Sales", flowNodes: ["start", "review", "ok", "rejected"] })
		.lane("Lane_ops", { name: "Operations", flowNodes: ["ship", "done", "late_end"] })
}

/**
 * Captured from the builder before lanes and pools existed: a chain that calls
 * neither `lane()` nor `participant()` must keep producing these exact bytes.
 */
describe("lane builder — no new calls, identical output", () => {
	const cases: Array<[string, () => BpmnDefinitions, string]> = [
		[
			"plain chain",
			() => plainChain().build(),
			"e258f894043a7744559437eeb274544a0656fa5018990c864ec55f157b2cecfe",
		],
		[
			"plain chain, auto-layout",
			() => plainChain().withAutoLayout().build(),
			"d237887d95630bcb80d3b023e8f263a330ac52a797599ee2b49f0661e6b6a95f",
		],
		[
			"diagram with two pools",
			() =>
				Bpmn.createDiagram("Order")
					.process("order", (p) =>
						p.startEvent("o_start").serviceTask("o_send", { taskType: "send" }).endEvent("o_end"),
					)
					.process("supply", (p) =>
						p.startEvent("s_start").serviceTask("s_recv", { taskType: "recv" }).endEvent("s_end"),
					)
					.participant("P_Buyer", { name: "Buyer", processId: "order" })
					.participant("P_Seller", { name: "Seller", processId: "supply" })
					.messageFlow("MF_1", { source: "o_send", target: "s_recv" })
					.build(),
			"e05c9d10bb78486eb3d9934ad2410fa3671a65c08a1037b38af84dea008b5d10",
		],
		[
			"continued lane-free document",
			() =>
				ProcessBuilder.from(fixture("05-zeebe-extensions.bpmn"), "Process_zeebe")
					.insertAfter("Task_service")
					.serviceTask("Task_extra", { taskType: "extra" })
					.build(),
			"175f939591eba95ef2eedf4b92553c6d000a6d52b9aa995284d841352b114106",
		],
	]
	for (const [name, build, expected] of cases) {
		it(name, () => {
			expect(xmlHash(build())).toBe(expected)
		})
	}

	it("keeps collaborations empty without lanes or a participant", () => {
		const defs = plainChain().build()
		expect(defs.collaborations).toEqual([])
		expect(defs.processes[0]?.laneSet).toBeUndefined()
	})
})

describe("lane builder — fresh build", () => {
	it("writes the refs verbatim, in the order given", () => {
		const process = processOf(lanedChain().build(), "orders")
		expect(process.laneSet?.id).toBe("LaneSet_orders")
		expect(laneById(process, "Lane_sales")).toMatchObject({
			name: "Sales",
			flowNodeRefs: ["start", "review", "late", "ok", "rejected"],
		})
		// The join gateway the builder inferred, which the caller could not list,
		// follows the lane of its first predecessor.
		expect(laneById(process, "Lane_ops").flowNodeRefs).toEqual([
			"ship",
			"done",
			"late_end",
			"ok_join",
		])
	})

	it("puts a boundary event in its host's lane", () => {
		const process = processOf(lanedChain().build(), "orders")
		expect(laneOf(process, "late")?.id).toBe("Lane_sales")
		expect(laneProblems(process)).toEqual([])
	})

	it("nests child lanes and writes the ancestor union", () => {
		const process = processOf(
			plainChain()
				.lane("Lane_sales", { name: "Sales" })
				.lane("Lane_inside", { parent: "Lane_sales", flowNodes: ["start", "review"] })
				.lane("Lane_desk", { parent: "Lane_sales", flowNodes: ["ok", "rejected"] })
				.lane("Lane_ops", { flowNodes: ["ship", "done", "late_end"] })
				.build(),
			"orders",
		)
		expect(process.laneSet?.lanes.map((lane) => lane.id)).toEqual(["Lane_sales", "Lane_ops"])
		const sales = laneById(process, "Lane_sales")
		expect(sales.childLaneSet?.id).toBe("LaneSet_Lane_sales")
		expect(sales.childLaneSet?.lanes.map((lane) => lane.id)).toEqual(["Lane_inside", "Lane_desk"])
		expect(sales.flowNodeRefs).toEqual(["start", "review", "late", "ok", "rejected"])
		expect(laneOf(process, "review")?.id).toBe("Lane_inside")
		expect(laneProblems(process)).toEqual([])
	})

	it("creates a pool named after the process when lanes exist", () => {
		const defs = lanedChain().build()
		expect(defs.collaborations).toHaveLength(1)
		expect(defs.collaborations[0]?.participants).toEqual([
			{ id: "Participant_orders", name: "Orders", processRef: "orders", unknownAttributes: {} },
		])
		expect(defs.processes[0]?.isExecutable).toBe(true)
	})

	it("uses the pool participant() names, with or without lanes", () => {
		const laned = lanedChain().participant("Pool_shop", { name: "Shop" }).build()
		expect(laned.collaborations[0]?.participants).toEqual([
			{ id: "Pool_shop", name: "Shop", processRef: "orders", unknownAttributes: {} },
		])

		const plain = plainChain().participant("Pool_shop").build()
		expect(plain.collaborations[0]?.participants).toEqual([
			{ id: "Pool_shop", name: "Orders", processRef: "orders", unknownAttributes: {} },
		])
		expect(plain.processes[0]?.laneSet).toBeUndefined()
	})

	it("reports every refusal at once", () => {
		const build = () =>
			Bpmn.createProcess("p")
				.startEvent("s")
				.subProcess("sub", (b) => b.startEvent("inner_s").endEvent("inner_e"))
				.serviceTask("t", { taskType: "t" })
				.endEvent("e")
				.endEvent("orphan_end")
				.lane("L_a", { flowNodes: ["s", "ghost", "inner_s", "t"] })
				.lane("L_b", { flowNodes: ["t", "sub"] })
				.lane("L_parent", { flowNodes: ["e"] })
				.lane("L_child", { parent: "L_parent" })
				.lane("L_x", { parent: "L_y" })
				.lane("L_y", { parent: "L_x" })
				.lane("L_lost", { parent: "L_nowhere" })
				.lane("t", {})
				.lane("L_a", {})
				.build()
		let message = ""
		try {
			build()
		} catch (error) {
			message = (error as Error).message
		}
		expect(message.startsWith("Invalid lanes:\n  ")).toBe(true)
		for (const expected of [
			/Lane "L_a" lists "ghost", which is not a flow node of process "p"/,
			/Lane "L_a" lists "inner_s", which sits inside a sub-process/,
			/Flow node "t" is listed in lanes "L_a" and "L_b"/,
			/Lane "L_parent" has child lanes; its flow nodes .*"e"/,
			/Lane "L_x" has a parent chain that loops back on itself/,
			/Lane "L_lost" names parent "L_nowhere", which is not declared/,
			/Lane id "t" is already used/,
			/Lane id "L_a" is already used/,
			/Flow node "orphan_end" is in no lane of process "p"/,
		]) {
			expect(message).toMatch(expected)
		}
	})

	it("refuses a participant id that is already used", () => {
		expect(() => plainChain().participant("review").build()).toThrow(
			/Participant id "review" is already used/,
		)
	})

	it("survives export and parse unchanged", () => {
		const defs = plainChain()
			.lane("Lane_sales", { name: "Sales" })
			.lane("Lane_inside", { parent: "Lane_sales", flowNodes: ["start", "review"] })
			.lane("Lane_desk", { parent: "Lane_sales", flowNodes: ["ok", "rejected"] })
			.lane("Lane_ops", { flowNodes: ["ship", "done", "late_end"] })
			.build()
		const reparsed = Bpmn.parse(Bpmn.export(defs))
		expect(reparsed.processes[0]?.laneSet).toEqual(defs.processes[0]?.laneSet)
		expect(reparsed.collaborations).toEqual(defs.collaborations)
	})
})

/** Asserts that the shapes of `lanes` tile the box `parent` exactly, one 30px header in. */
function expectTiling(shapes: Map<string, BpmnDiShape>, parent: string, lanes: BpmnLane[]): void {
	const outer = shapes.get(parent)?.bounds
	if (outer === undefined) throw new Error(`no shape for ${parent}`)
	const bands = lanes.map((lane) => {
		const bounds = shapes.get(lane.id)?.bounds
		if (bounds === undefined) throw new Error(`no shape for ${lane.id}`)
		return bounds
	})
	let y = outer.y
	for (const band of bands) {
		expect(band.x).toBe(outer.x + 30)
		expect(band.width).toBe(outer.width - 30)
		expect(band.y).toBe(y)
		y += band.height
	}
	expect(y).toBe(outer.y + outer.height)
}

function expectNodesInsideTheirLanes(
	process: BpmnProcess,
	shapes: Map<string, BpmnDiShape>,
	nodeIds: readonly string[],
): void {
	for (const nodeId of nodeIds) {
		const node = shapes.get(nodeId)?.bounds
		const lane = laneOf(process, nodeId)
		const band = lane === undefined ? undefined : shapes.get(lane.id)?.bounds
		if (node === undefined || band === undefined) throw new Error(`no shape for ${nodeId}`)
		const cy = node.y + node.height / 2
		expect(cy, nodeId).toBeGreaterThan(band.y)
		expect(cy, nodeId).toBeLessThan(band.y + band.height)
		expect(node.x, nodeId).toBeGreaterThanOrEqual(band.x)
	}
}

describe("lane builder — withAutoLayout", () => {
	it("draws nodes inside their lanes, lanes tiling the pool, on the collaboration plane", () => {
		const defs = plainChain()
			.lane("Lane_sales", { name: "Sales" })
			.lane("Lane_inside", { parent: "Lane_sales", flowNodes: ["start", "review"] })
			.lane("Lane_desk", { parent: "Lane_sales", flowNodes: ["ok", "rejected"] })
			.lane("Lane_ops", { flowNodes: ["ship", "done", "late_end"] })
			.withAutoLayout()
			.build()
		const process = processOf(defs, "orders")
		expect(defs.diagrams).toHaveLength(1)
		const plane = defs.diagrams[0]?.plane
		expect(plane?.bpmnElement).toBe("Collaboration_1")
		const shapes = new Map((plane?.shapes ?? []).map((shape) => [shape.bpmnElement, shape]))

		expectTiling(shapes, "Participant_orders", process.laneSet?.lanes ?? [])
		expectTiling(shapes, "Lane_sales", laneById(process, "Lane_sales").childLaneSet?.lanes ?? [])
		expectNodesInsideTheirLanes(
			process,
			shapes,
			process.flowElements.map((element) => element.id),
		)
	})
})

describe("lane builder — continuing a document", () => {
	it("puts an inserted node in its predecessor's lane and leaves Flowable content alone", () => {
		const before = fixture("08-flowable-lanes-pools.bpmn")
		const after = ProcessBuilder.from(before, "order")
			.insertAfter("review")
			.userTask("check", { name: "Double-check" })
			.build()
		const was = processOf(before, "order")
		const now = processOf(after, "order")

		expect(laneOf(now, "check")?.id).toBe("Lane_inside")
		// The file writes the union, so the parent lane gets the new node too.
		expect(laneById(now, "Lane_sales").flowNodeRefs).toContain("check")
		expect(laneProblems(now)).toEqual([])

		expect(now.extensionElements).toEqual(was.extensionElements)
		expect(now.unknownAttributes).toEqual(was.unknownAttributes)
		for (const element of was.flowElements) {
			const kept = now.flowElements.find((candidate) => candidate.id === element.id)
			expect(kept?.extensionElements, element.id).toEqual(element.extensionElements)
			expect(kept?.unknownAttributes, element.id).toEqual(element.unknownAttributes)
		}
		expect(after.collaborations).toEqual(before.collaborations)
		expect(processOf(after, "customer")).toEqual(processOf(before, "customer"))
		const xml = Bpmn.export(after)
		expect(xml).toContain('flowable:candidateStarterGroups="sales"')
		expect(xml).toContain('flowable:class="com.acme.ShipDelegate"')
	})

	it("puts an inserted node in its predecessor's lane in a Camunda collaboration", () => {
		const after = ProcessBuilder.from(fixture("02-collaboration.bpmn"), "Process_buyer")
			.insertAfter("Task_place_order")
			.serviceTask("Task_notify", { name: "Notify", taskType: "notify" })
			.build()
		const now = processOf(after, "Process_buyer")
		expect(laneById(now, "Lane_ordering").flowNodeRefs).toEqual([
			"Start_buyer",
			"Task_place_order",
			"Task_notify",
		])
		expect(laneProblems(now)).toEqual([])
	})

	it("keeps every existing ref when no node is added", () => {
		const before = fixture("08-flowable-lanes-pools.bpmn")
		const after = ProcessBuilder.from(before, "order").withAutoLayout().build()
		expect(processOf(after, "order").laneSet).toEqual(processOf(before, "order").laneSet)
	})

	it("moves nodes into an existing lane and renames it", () => {
		const after = ProcessBuilder.from(fixture("08-flowable-lanes-pools.bpmn"), "order")
			.lane("Lane_desk", { name: "Approval desk", flowNodes: ["ship"] })
			.build()
		const now = processOf(after, "order")
		expect(laneOf(now, "ship")?.id).toBe("Lane_desk")
		expect(laneById(now, "Lane_ops").flowNodeRefs).not.toContain("ship")
		expect(laneById(now, "Lane_desk").name).toBe("Approval desk")
		expect(laneProblems(now)).toEqual([])
	})

	it("refuses a lane the document does not have, or a parent lane", () => {
		const builder = () => ProcessBuilder.from(fixture("08-flowable-lanes-pools.bpmn"), "order")
		expect(() =>
			builder()
				.lane("Lane_new", { flowNodes: ["ship"] })
				.build(),
		).toThrow(/Lane "Lane_new" is not declared in process "order"/)
		expect(() =>
			builder()
				.lane("Lane_sales", { flowNodes: ["ship"] })
				.build(),
		).toThrow(/Lane "Lane_sales" has child lanes/)
	})

	it("renames the existing pool", () => {
		const after = ProcessBuilder.from(fixture("08-flowable-lanes-pools.bpmn"), "order")
			.participant("Participant_company", { name: "ACME" })
			.build()
		expect(after.collaborations[0]?.participants[0]).toMatchObject({
			id: "Participant_company",
			name: "ACME",
		})
		expect(() =>
			ProcessBuilder.from(fixture("08-flowable-lanes-pools.bpmn"), "order")
				.participant("Other")
				.build(),
		).toThrow(/pool "Participant_company"/)
	})
})

describe("lane builder — DiagramBuilder", () => {
	it("adopts the pool of a laned process, and the pool a process names", () => {
		const defs = Bpmn.createDiagram("d")
			.process("shop", (p) =>
				p
					.name("Shop")
					.startEvent("s")
					.serviceTask("t", { taskType: "t" })
					.endEvent("e")
					.lane("L_front", { flowNodes: ["s", "t"] })
					.lane("L_back", { flowNodes: ["e"] }),
			)
			.process("billing", (p) =>
				p.participant("P_billing", { name: "Billing" }).startEvent("bs").endEvent("be"),
			)
			.build()
		expect(defs.collaborations[0]?.participants.map((p) => [p.id, p.processRef])).toEqual([
			["Participant_shop", "shop"],
			["P_billing", "billing"],
		])
		expect(processOf(defs, "shop").laneSet?.lanes).toHaveLength(2)
	})

	it("lets a participant declared on the diagram replace the process's own pool", () => {
		const defs = Bpmn.createDiagram("d")
			.process("shop", (p) =>
				p
					.startEvent("s")
					.endEvent("e")
					.lane("L", { flowNodes: ["s", "e"] }),
			)
			.participant("P_shop", { name: "Shop", processId: "shop" })
			.build()
		expect(defs.collaborations[0]?.participants.map((p) => p.id)).toEqual(["P_shop"])
	})

	it("writes isExecutable false for an empty partner process unless told otherwise", () => {
		const defs = Bpmn.createDiagram("d")
			.process("order", (p) =>
				p
					.startEvent("s")
					.sendTask("notify")
					.endEvent("e")
					.lane("L", {
						flowNodes: ["s", "notify", "e"],
					}),
			)
			.process("customer", () => {})
			.process("bank", (p) => p.executable(true))
			.participant("P_customer", { name: "Customer", processId: "customer" })
			.participant("P_bank", { name: "Bank", processId: "bank" })
			.messageFlow("MF_1", { source: "notify", target: "P_customer" })
			.build()
		expect(processOf(defs, "order").isExecutable).toBe(true)
		expect(processOf(defs, "customer").isExecutable).toBe(false)
		expect(processOf(defs, "bank").isExecutable).toBe(true)
		expect(Bpmn.export(defs)).toContain('<bpmn:process id="customer" isExecutable="false"')
	})

	it("lays out the whole diagram with withAutoLayout()", () => {
		const defs = Bpmn.createDiagram("d")
			.process("order", (p) =>
				p
					.startEvent("s")
					.sendTask("notify")
					.endEvent("e")
					.annotate("notify", "Mail", { side: "above" })
					.lane("L_a", { flowNodes: ["s", "notify"] })
					.lane("L_b", { flowNodes: ["e"] }),
			)
			.participant("P_customer", { name: "Customer" })
			.messageFlow("MF_1", { source: "notify", target: "P_customer" })
			.withAutoLayout()
			.build()
		const plane = defs.diagrams[0]?.plane
		expect(plane?.bpmnElement).toBe("Collaboration_1")
		const drawn = new Set([
			...(plane?.shapes ?? []).map((shape) => shape.bpmnElement),
			...(plane?.edges ?? []).map((edge) => edge.bpmnElement),
		])
		const order = processOf(defs, "order")
		for (const id of [
			"Participant_order",
			"P_customer",
			"L_a",
			"L_b",
			"MF_1",
			...order.flowElements.map((element) => element.id),
			...order.sequenceFlows.map((flow) => flow.id),
			...order.textAnnotations.map((annotation) => annotation.id),
		]) {
			expect(drawn.has(id), id).toBe(true)
		}
		const shapes = new Map((plane?.shapes ?? []).map((shape) => [shape.bpmnElement, shape]))
		expectTiling(shapes, "Participant_order", order.laneSet?.lanes ?? [])
		// The annotation-side hint of the child builder reaches the diagram's layout.
		const note = shapes.get("TextAnnotation_notify_1")?.bounds
		const task = shapes.get("notify")?.bounds
		expect(note && task && note.y < task.y).toBe(true)
	})
})
