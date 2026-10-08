import { beforeEach, describe, expect, it } from "vitest"
import { applyBpmnlintConfig } from "../src/bpmn/bpmnlint.js"
import { Bpmn, resetIdCounter } from "../src/index.js"
import type { BpmnDefinitions, BpmnFlowElement, BpmnSequenceFlow } from "../src/index.js"

function flowsOf(defs: BpmnDefinitions): BpmnSequenceFlow[] {
	return defs.processes[0]?.sequenceFlows ?? []
}

function element(elements: BpmnFlowElement[], id: string): BpmnFlowElement {
	const el = elements.find((e) => e.id === id)
	expect(el, id).toBeDefined()
	return el as BpmnFlowElement
}

function linkEventFindings(defs: BpmnDefinitions) {
	return applyBpmnlintConfig(defs, [], {
		rules: { "link-event": { severity: "error" } },
		unresolvedExtends: [],
	}).findings
}

describe("link events (linkName)", () => {
	beforeEach(() => resetIdCounter())

	it("emits a linkEventDefinition for throw and catch events", () => {
		const xml = Bpmn.export(
			Bpmn.createProcess("p")
				.startEvent("s")
				.intermediateThrowEvent("t", { linkName: "L" })
				.intermediateCatchEvent("c", { linkName: "L" })
				.endEvent("e")
				.build(),
		)
		expect(xml.match(/<bpmn:linkEventDefinition [^>]*name="L"/g)).toHaveLength(2)
	})

	it("does not chain from a link throw or into a link catch", () => {
		const defs = Bpmn.createProcess("p")
			.startEvent("s")
			.serviceTask("a", { name: "A", taskType: "a" })
			.intermediateThrowEvent("t", { linkName: "L" })
			.intermediateCatchEvent("c", { linkName: "L" })
			.serviceTask("b", { name: "B", taskType: "b" })
			.endEvent("e")
			.build()
		const edges = flowsOf(defs).map((f) => `${f.sourceRef}->${f.targetRef}`)
		expect(edges).toEqual(["s->a", "a->t", "c->b", "b->e"])
		expect(linkEventFindings(defs)).toEqual([])
	})

	it("a link throw ending a branch leaves no open end to join", () => {
		const defs = Bpmn.createProcess("p")
			.startEvent("s")
			.exclusiveGateway("gw")
			.branch("yes", (b) =>
				b
					.condition("= ok")
					.serviceTask("y", { name: "Y", taskType: "y" })
					.intermediateThrowEvent("t", { linkName: "Retry" }),
			)
			.branch("no", (b) => b.defaultFlow().endEvent("done"))
			.intermediateCatchEvent("c", { linkName: "Retry" })
			.serviceTask("r", { name: "R", taskType: "r" })
			.endEvent("e")
			.build()

		const flows = flowsOf(defs)
		expect(flows.filter((f) => f.sourceRef === "t")).toEqual([])
		expect(flows.filter((f) => f.targetRef === "c")).toEqual([])
		expect(flows.map((f) => `${f.sourceRef}->${f.targetRef}`)).toContain("c->r")
		expect(linkEventFindings(defs)).toEqual([])
	})

	it("works in a branch and in sub-process content", () => {
		const defs = Bpmn.createProcess("p")
			.startEvent("s")
			.subProcess("sub", (c) => {
				c.startEvent("ss")
					.intermediateThrowEvent("st", { linkName: "Inner" })
					.intermediateCatchEvent("sc", { linkName: "Inner" })
					.endEvent("se")
			})
			.parallelGateway("fork")
			.branch("a", (b) => b.intermediateThrowEvent("bt", { linkName: "Branch" }))
			.branch("b", (b) => b.intermediateCatchEvent("bc", { linkName: "Branch" }).endEvent("be"))
			.build()

		const process = defs.processes[0]
		expect(process).toBeDefined()
		if (!process) return
		const sub = element(process.flowElements, "sub")
		expect(sub.type).toBe("subProcess")
		if (sub.type !== "subProcess") return
		expect(element(sub.flowElements, "st").type).toBe("intermediateThrowEvent")
		expect(sub.sequenceFlows.map((f) => `${f.sourceRef}->${f.targetRef}`)).toEqual([
			"ss->st",
			"sc->se",
		])
		for (const id of ["bt", "bc"]) {
			const ev = element(process.flowElements, id)
			expect("eventDefinitions" in ev ? ev.eventDefinitions : [], id).toEqual([
				{ type: "link", name: "Branch" },
			])
		}
		// The branch's own catch event is not wired to the fork: it has no incoming flow.
		expect(process.sequenceFlows.filter((f) => f.targetRef === "bc")).toEqual([])
		expect(process.sequenceFlows.filter((f) => f.sourceRef === "bt")).toEqual([])
		expect(linkEventFindings(defs)).toEqual([])
	})

	it("round-trips through export and parse", () => {
		const defs = Bpmn.createProcess("p")
			.startEvent("s")
			.intermediateThrowEvent("t", { linkName: "L" })
			.intermediateCatchEvent("c", { linkName: "L" })
			.endEvent("e")
			.build()
		const reparsed = Bpmn.parse(Bpmn.export(defs))
		const process = reparsed.processes[0]
		expect(process).toBeDefined()
		if (!process) return
		for (const id of ["t", "c"]) {
			const ev = element(process.flowElements, id)
			expect("eventDefinitions" in ev ? ev.eventDefinitions : []).toEqual([
				{ type: "link", name: "L" },
			])
		}
		expect(Bpmn.export(reparsed)).toBe(Bpmn.export(defs))
	})
})
