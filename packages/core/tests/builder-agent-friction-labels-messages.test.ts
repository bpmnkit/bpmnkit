import { describe, expect, it } from "vitest"
import { Bpmn } from "../src/index.js"

type Built = ReturnType<ReturnType<typeof Bpmn.createProcess>["build"]>

const flowNames = (defs: Built) => defs.processes[0]?.sequenceFlows.map((f) => f.name)
const subs = (m: { extensionElements?: { name: string }[] } | undefined) =>
	m?.extensionElements?.filter((x) => x.name === "zeebe:subscription").length

describe("branch flow labels", () => {
	it("names flows leaving exclusive gateways", () => {
		const d = Bpmn.createProcess("p")
			.startEvent("s")
			.exclusiveGateway("g")
			.branch("yes", (b) => b.condition("= a").endEvent("e1"))
			.branch("no", (b) => b.defaultFlow().endEvent("e2"))
			.build()
		expect(flowNames(d)).toContain("yes")
		expect(flowNames(d)).toContain("no")
	})

	it("does not name flows leaving parallel or event-based gateways", () => {
		const par = Bpmn.createProcess("p")
			.startEvent("s")
			.parallelGateway("g")
			.branch("a", (b) => b.serviceTask("t1", { taskType: "x" }).endEvent("e1"))
			.branch("b", (b) => b.serviceTask("t2", { taskType: "x" }).endEvent("e2"))
			.build()
		expect(flowNames(par)?.filter((n) => n === "a" || n === "b")).toEqual([])
		const evt = Bpmn.createProcess("p")
			.startEvent("s")
			.eventBasedGateway("w")
			.branch("paid", (b) =>
				b
					.intermediateCatchEvent("m", { messageName: "paid", correlationKey: "=id" })
					.endEvent("e1"),
			)
			.branch("timeout", (b) =>
				b.intermediateCatchEvent("t", { timerDuration: "PT1H" }).endEvent("e2"),
			)
			.build()
		expect(flowNames(evt)?.filter((n) => n)).toEqual([])
	})

	it("keeps an explicit label() on a parallel branch", () => {
		const d = Bpmn.createProcess("p")
			.startEvent("s")
			.parallelGateway("g")
			.branch("a", (b) => b.label("Left").serviceTask("t1", { taskType: "x" }).endEvent("e1"))
			.branch("b", (b) => b.serviceTask("t2", { taskType: "x" }).endEvent("e2"))
			.build()
		expect(flowNames(d)).toContain("Left")
		expect(flowNames(d)).not.toContain("b")
	})

	it("covers nested branches and sub-process branches", () => {
		const d = Bpmn.createProcess("p")
			.startEvent("s")
			.subProcess("sub", {}, (sp) =>
				sp
					.startEvent("ss")
					.parallelGateway("pg")
					.branch("left", (b) =>
						b
							.serviceTask("t1", { taskType: "x" })
							.exclusiveGateway("xg")
							.branch("inner", (c) => c.condition("= a").endEvent("ie1"))
							.branch("other", (c) => c.defaultFlow().endEvent("ie2")),
					)
					.branch("right", (b) => b.serviceTask("t2", { taskType: "x" }).endEvent("e2")),
			)
			.endEvent("e")
			.build()
		const sub = d.processes[0]?.flowElements.find((e) => e.id === "sub")
		const names =
			sub && "sequenceFlows" in sub
				? (sub.sequenceFlows as { name?: string }[]).map((f) => f.name)
				: []
		expect(names).toContain("inner")
		expect(names).toContain("other")
		expect(names).not.toContain("left")
		expect(names).not.toContain("right")
	})
})

describe("message throw subscriptions", () => {
	it("puts the correlationKey of an end event onto the message", () => {
		const d = Bpmn.createProcess("p")
			.startEvent("s")
			.endEvent("e", { messageName: "info-sent", taskType: "send", correlationKey: "=orderId" })
			.build()
		expect(d.messages).toHaveLength(1)
		expect(subs(d.messages[0])).toBe(1)
	})

	it("puts the correlationKey of an intermediate throw onto the message", () => {
		const d = Bpmn.createProcess("p")
			.startEvent("s")
			.intermediateThrowEvent("t", { messageName: "m1", taskType: "send", correlationKey: "=k" })
			.endEvent("e")
			.build()
		expect(subs(d.messages[0])).toBe(1)
	})

	it("DiagramBuilder.message merges into the process-created message", () => {
		const d = Bpmn.createDiagram("d")
			.process("p", (b) =>
				b.startEvent("s").endEvent("e", { messageName: "info-sent", taskType: "send" }),
			)
			.message("Message_info_sent", { name: "info-sent", correlationKey: "=orderId" })
			.build()
		expect(d.messages).toHaveLength(1)
		expect(subs(d.messages[0])).toBe(1)
	})

	it("merges by name when the declared id differs", () => {
		const d = Bpmn.createDiagram("d")
			.process("p", (b) =>
				b.startEvent("s").endEvent("e", { messageName: "info-sent", taskType: "send" }),
			)
			.message("Custom", { name: "info-sent", correlationKey: "=orderId" })
			.build()
		expect(d.messages).toHaveLength(1)
		expect(d.messages[0]?.id).toBe("Custom")
		const end = d.processes[0]?.flowElements.find((e) => e.id === "e")
		expect(end && "eventDefinitions" in end ? end.eventDefinitions[0] : undefined).toMatchObject({
			messageRef: "Custom",
		})
		expect(subs(d.messages[0])).toBe(1)
	})

	it("message() before process() leaves one message and keeps the subscription", () => {
		const d = Bpmn.createDiagram("d")
			.message("Custom", { name: "info-sent", correlationKey: "=orderId" })
			.process("p", (b) =>
				b.startEvent("s").endEvent("e", { messageName: "info-sent", taskType: "send" }),
			)
			.build()
		expect(d.messages).toHaveLength(1)
		expect(d.messages[0]?.id).toBe("Custom")
		expect(subs(d.messages[0])).toBe(1)
		const end = d.processes[0]?.flowElements.find((e) => e.id === "e")
		expect(end && "eventDefinitions" in end ? end.eventDefinitions[0] : undefined).toMatchObject({
			messageRef: "Custom",
		})
	})
})
