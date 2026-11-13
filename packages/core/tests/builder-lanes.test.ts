import { describe, expect, it } from "vitest"
import type { BpmnBounds, BpmnDefinitions } from "../src/bpmn/bpmn-model.js"
import { Bpmn, ProcessBuilder, lintDiagram } from "../src/index.js"

function lanesOf(defs: BpmnDefinitions, processIndex = 0): Record<string, string[]> {
	const set = defs.processes[processIndex]?.laneSet
	return Object.fromEntries((set?.lanes ?? []).map((l) => [l.id, l.flowNodeRefs]))
}

function laidOut() {
	return Bpmn.createProcess("p")
		.withAutoLayout()
		.inLane("sales", { name: "Sales" })
		.startEvent("s")
		.userTask("review", { name: "Review" })
		.exclusiveGateway("gw")
		.branch("ok", (b) =>
			b.condition("= ok").inLane("ops").serviceTask("ship", { taskType: "ship" }),
		)
		.branch("no", (b) => b.defaultFlow().serviceTask("bounce", { taskType: "bounce" }))
		.inLane("ops")
		.endEvent("e")
		.build({ validate: false })
}

describe("builder lanes", () => {
	it("assigns following nodes to the current lane, in first-use order", () => {
		const defs = Bpmn.createProcess("p")
			.inLane("sales", { name: "Sales" })
			.startEvent("s")
			.serviceTask("a", { taskType: "a" })
			.inLane("ops")
			.serviceTask("b", { taskType: "b" })
			.inLane("sales")
			.endEvent("e")
			.build()
		expect(lanesOf(defs)).toEqual({ sales: ["s", "a", "e"], ops: ["b"] })
		const lanes = defs.processes[0]?.laneSet?.lanes ?? []
		expect(lanes.map((l) => l.name)).toEqual(["Sales", "ops"])
		expect(defs.processes[0]?.laneSet?.id).toBe("p_laneSet")
	})

	it("lets a later inLane name a lane declared without a name", () => {
		const defs = Bpmn.createProcess("p")
			.inLane("x")
			.startEvent("s")
			.inLane("x", { name: "X" })
			.endEvent("e")
			.build()
		expect(defs.processes[0]?.laneSet?.lanes[0]?.name).toBe("X")
	})

	it("scopes inLane inside a branch and restores the outer lane after it", () => {
		const defs = laidOut()
		expect(lanesOf(defs)).toEqual({
			sales: ["s", "review", "gw", "bounce", "gw_join"],
			ops: ["ship", "e"],
		})
	})

	it("restores the lane when a nested branch switches", () => {
		const defs = Bpmn.createProcess("p")
			.inLane("a")
			.startEvent("s")
			.exclusiveGateway("g1")
			.branch("x", (b) =>
				b
					.exclusiveGateway("g2")
					.branch("y", (c) => c.inLane("b").serviceTask("in_b", { taskType: "t" }).connectTo("end"))
					.branch("z", (c) =>
						c.defaultFlow().serviceTask("in_a", { taskType: "t" }).connectTo("end"),
					),
			)
			.branch("w", (b) => b.defaultFlow().connectTo("end"))
			.endEvent("end")
			.build({ validate: false })
		expect(lanesOf(defs)).toEqual({ a: ["s", "g1", "g2", "in_a", "end", "g2_join", "end_merge"], b: ["in_b"] })
	})

	it("lets the lane option override one node and auto-declares an unknown lane", () => {
		const defs = Bpmn.createProcess("p")
			.inLane("a")
			.startEvent("s")
			.serviceTask("t", { taskType: "t", lane: "legal" })
			.endEvent("e")
			.build()
		expect(lanesOf(defs)).toEqual({ a: ["s", "e"], legal: ["t"] })
		expect(defs.processes[0]?.laneSet?.lanes[1]?.name).toBe("legal")
	})

	it("works with only per-node lane options", () => {
		const defs = Bpmn.createProcess("p")
			.startEvent("s", { lane: "a" })
			.endEvent("e", { lane: "b" })
			.build()
		expect(lanesOf(defs)).toEqual({ a: ["s"], b: ["e"] })
	})

	it("puts boundary events and inferred joins on their host's lane", () => {
		const defs = Bpmn.createProcess("p")
			.inLane("a")
			.startEvent("s")
			.parallelGateway("fork")
			.branch("l", (b) => b.inLane("b").serviceTask("t1", { taskType: "x" }))
			.branch("r", (b) => b.serviceTask("t2", { taskType: "y" }))
			.endEvent("e")
			.build({ validate: false })
		expect(lanesOf(defs).b).toContain("t1")
		const all = Object.values(lanesOf(defs)).flat()
		expect(all).toContain("fork_join")
		expect(new Set(all).size).toBe(all.length)

		const withBoundary = Bpmn.createProcess("q")
			.inLane("a")
			.startEvent("s")
			.serviceTask("t", { taskType: "x", lane: "b" })
			.boundaryEvent("bd", "t", { timer: { duration: "PT1H" } })
			.endEvent("e")
			.build({ validate: false })
		expect(lanesOf(withBoundary).b).toEqual(["t", "bd"])
	})

	it("keeps sub-process contents out of lanes but the sub-process in one", () => {
		const defs = Bpmn.createProcess("p")
			.inLane("a")
			.startEvent("s")
			.subProcess("sub", (sp) =>
				sp.startEvent("ss").serviceTask("st", { taskType: "x" }).endEvent("se"),
			)
			.endEvent("e")
			.build({ validate: false })
		expect(lanesOf(defs)).toEqual({ a: ["s", "sub", "e"] })
	})

	it("refuses a laneless node once a lane is used, naming it", () => {
		const b = Bpmn.createProcess("p").startEvent("s").inLane("a").endEvent("e")
		expect(() => b.build()).toThrow(/no lane for: s\b.*agent-cards\/bpmn\.md#traps/s)
	})

	it("emits no lane set when no lane is used", () => {
		expect(
			Bpmn.createProcess("p").startEvent("s").endEvent("e").build().processes[0]?.laneSet,
		).toBeUndefined()
	})

	it("auto-layout draws lane bands with every node inside its lane and no overlap", () => {
		const defs = laidOut()
		const shapes = new Map(defs.diagrams[0]?.plane.shapes.map((s) => [s.bpmnElement, s.bounds]))
		const get = (id: string) => shapes.get(id) as BpmnBounds
		for (const [lane, refs] of Object.entries(lanesOf(defs))) {
			const band = get(lane)
			expect(band, lane).toBeDefined()
			for (const ref of refs) {
				const n = get(ref)
				expect(n.y, ref).toBeGreaterThanOrEqual(band.y)
				expect(n.y + n.height, ref).toBeLessThanOrEqual(band.y + band.height)
			}
		}
		const salesBand = get("sales")
		const opsBand = get("ops")
		expect(salesBand.y + salesBand.height).toBeLessThanOrEqual(opsBand.y)
		const ids = ["s", "review", "gw", "ship", "bounce", "e"]
		for (const a of ids) {
			for (const b of ids) {
				if (a >= b) continue
				const p = get(a)
				const q = get(b)
				const apart =
					p.x + p.width <= q.x ||
					q.x + q.width <= p.x ||
					p.y + p.height <= q.y ||
					q.y + q.height <= p.y
				expect(apart, `${a} overlaps ${b}`).toBe(true)
			}
		}
	})

	it("builds a pool with lanes and a message flow into another pool", () => {
		const defs = Bpmn.createDiagram("d")
			.process("order", (p) =>
				p
					.inLane("sales")
					.startEvent("o_start")
					.inLane("ops")
					.serviceTask("o_send", { taskType: "send" })
					.endEvent("o_end"),
			)
			.process("supply", (p) =>
				p.startEvent("s_start").serviceTask("s_recv", { taskType: "recv" }).endEvent("s_end"),
			)
			.participant("P_Buyer", { name: "Buyer", processId: "order" })
			.participant("P_Seller", { name: "Seller", processId: "supply" })
			.message("Msg", { name: "order placed", correlationKey: "= orderId" })
			.messageFlow("MF", { source: "o_send", target: "s_recv", messageRef: "Msg" })
			.build()
		expect(lanesOf(defs, 0)).toEqual({ sales: ["o_start"], ops: ["o_send", "o_end"] })
		expect(defs.processes[1]?.laneSet).toBeUndefined()
		expect(Bpmn.export(defs)).toContain("<bpmn:laneSet")
	})

	it("survives export and parse", () => {
		const built = laidOut()
		const reparsed = Bpmn.parse(Bpmn.export(built))
		expect(lanesOf(reparsed)).toEqual(lanesOf(built))
		expect(reparsed.processes[0]?.laneSet?.lanes.map((l) => l.name)).toEqual(["Sales", "ops"])
	})

	it("passes lint and the Zeebe gate with no errors", () => {
		const defs = Bpmn.createProcess("p")
			.withAutoLayout()
			.inLane("sales", { name: "Sales" })
			.startEvent("s", { name: "Start" })
			.userTask("review", { name: "Review", zeebeUserTask: true })
			.inLane("ops", { name: "Ops" })
			.serviceTask("ship", { name: "Ship", taskType: "ship" })
			.endEvent("e", { name: "Done" })
			.build()
		expect(lintDiagram(defs).counts.error).toBe(0)
	})

	it("refuses lanes when continuing a parsed document", () => {
		const base = Bpmn.createProcess("p").startEvent("s").endEvent("e").build()
		expect(() => ProcessBuilder.from(base, "p").inLane("a").build({ validate: false })).toThrow(
			/from\(\)/,
		)
	})
})
