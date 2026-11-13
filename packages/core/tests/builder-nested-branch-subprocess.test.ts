import { describe, expect, it } from "vitest"
import type { BpmnFlowElement } from "../src/bpmn/bpmn-model.js"
import { Bpmn, type BranchBuilder } from "../src/index.js"

// Regression: a branch nested two levels deep inside a sub-process body was dropped
// (its callback never ran), and surfaced later as an unrelated message-flow error.
function nested(b: BranchBuilder, p: string): void {
	b.condition("= x")
		.userTask(`${p}ua`, { name: "UA", formId: "f" })
		.exclusiveGateway(`${p}g2`)
		.branch("a1", (c) => c.condition("= y").endEvent(`${p}e1`))
		.branch("a2", (c) =>
			c
				.defaultFlow()
				.userTask(`${p}ub`, { name: "UB", formId: "f" })
				.exclusiveGateway(`${p}g3`)
				.branch("b1", (d) => d.condition("= z").endEvent(`${p}e4`))
				.branch("b2", (d) => d.defaultFlow().endEvent(`${p}e2`)),
		)
}

function ids(el: BpmnFlowElement | undefined): string[] {
	return el && "flowElements" in el ? el.flowElements.map((e) => e.id) : []
}

const EXPECTED = ["ua", "g2", "e1", "ub", "g3", "e4", "e2"]

describe("nested branch() inside a sub-process", () => {
	it("keeps every element in subProcess", () => {
		const d = Bpmn.createProcess("t")
			.startEvent("s")
			.subProcess(
				"sp",
				(s) =>
					s
						.startEvent("ss")
						.exclusiveGateway("g1")
						.branch("a", (b) => nested(b, ""))
						.branch("b", (b) => b.defaultFlow().endEvent("e3")),
				{ name: "SP" },
			)
			.endEvent("end")
			.build({ validate: false })
		const sp = d.processes[0]?.flowElements.find((e) => e.id === "sp")
		expect(ids(sp)).toEqual(expect.arrayContaining(EXPECTED))
	})

	it("keeps every element in adHocSubProcess", () => {
		const d = Bpmn.createProcess("t")
			.startEvent("s")
			.adHocSubProcess("ah", (s) => s.exclusiveGateway("g1").branch("a", (b) => nested(b, "")))
			.endEvent("end")
			.build({ validate: false })
		const ah = d.processes[0]?.flowElements.find((e) => e.id === "ah")
		expect(ids(ah)).toEqual(expect.arrayContaining(EXPECTED))
	})

	it("keeps every element in an event sub-process", () => {
		const d = Bpmn.createProcess("t")
			.startEvent("s")
			.endEvent("end")
			.eventSubProcess("esp", (s) =>
				s
					.startEvent("es", { timerDuration: "PT1H" })
					.exclusiveGateway("g1")
					.branch("a", (b) => nested(b, ""))
					.branch("b", (b) => b.defaultFlow().endEvent("e3")),
			)
			.build({ validate: false })
		const esp = d.processes[0]?.flowElements.find((e) => e.id === "esp")
		expect(ids(esp)).toEqual(expect.arrayContaining(EXPECTED))
	})

	it("keeps every element when the process uses lanes", () => {
		const d = Bpmn.createProcess("t")
			.inLane("ops", { name: "Ops" })
			.startEvent("s")
			.subProcess("sp", (s) =>
				s
					.startEvent("ss")
					.exclusiveGateway("g1")
					.branch("a", (b) => nested(b, ""))
					.branch("b", (b) => b.defaultFlow().endEvent("e3")),
			)
			.endEvent("end")
			.build({ validate: false })
		const sp = d.processes[0]?.flowElements.find((e) => e.id === "sp")
		expect(ids(sp)).toEqual(expect.arrayContaining(EXPECTED))
	})

	it("throws when a branch callback adds no elements", () => {
		expect(() =>
			Bpmn.createProcess("t")
				.startEvent("s")
				.subProcess("sp", (s) =>
					s
						.startEvent("ss")
						.exclusiveGateway("g1")
						.branch("a", (b) => b.condition("= x").endEvent("e1"))
						.branch("b", (b) => {
							b.defaultFlow()
						}),
				)
				.endEvent("end")
				.build({ validate: false }),
		).toThrow(/branch\("b"\).*no elements/)
	})
})

describe("message flow endpoint not found", () => {
	it("lists close existing ids", () => {
		expect(() =>
			Bpmn.createDiagram()
				.process("p1", (p) =>
					p.startEvent("s1").serviceTask("send_quote", { taskType: "x" }).endEvent("e1"),
				)
				.process("p2", (p) => p.startEvent("s2").endEvent("e2"))
				.participant("a", { processId: "p1" })
				.participant("b", { processId: "p2" })
				.messageFlow("mf", { source: "send_qoute", target: "b" })
				.build({ validate: false }),
		).toThrow(/send_qoute.*did you mean.*send_quote/s)
	})
})
