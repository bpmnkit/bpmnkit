import { describe, expect, it } from "vitest"
import { compactify, expand } from "../src/bpmn/compact.js"
import { Bpmn } from "../src/index.js"

const MI = {
	collection: "=items",
	elementVariable: "item",
	outputCollection: "results",
	outputElement: "=result",
	completionCondition: "=count(results) > 2",
	isSequential: true,
}

type Add = (b: ReturnType<typeof Bpmn.createProcess>) => ReturnType<typeof Bpmn.createProcess>

const CASES: Array<[string, Add]> = [
	["serviceTask", (b) => b.serviceTask("t", { name: "T", taskType: "w", multiInstance: MI })],
	["userTask", (b) => b.userTask("t", { name: "T", multiInstance: MI })],
	[
		"scriptTask",
		(b) => b.scriptTask("t", { expression: "=1", resultVariable: "r", multiInstance: MI }),
	],
	["sendTask", (b) => b.sendTask("t", { name: "T", multiInstance: MI })],
	["receiveTask", (b) => b.receiveTask("t", { name: "T", multiInstance: MI })],
	["businessRuleTask", (b) => b.businessRuleTask("t", { decisionId: "d", multiInstance: MI })],
	["callActivity", (b) => b.callActivity("t", { processId: "child", multiInstance: MI })],
]

describe("multi-instance on every activity", () => {
	it.each(CASES)("%s survives builder, export and parse", (type, add) => {
		const xml = Bpmn.export(add(Bpmn.createProcess("p").startEvent("s")).endEvent("e").build())
		expect(xml).toContain('outputCollection="results"')
		expect(xml).toContain('outputElement="=result"')
		const el = Bpmn.parse(xml).processes[0]?.flowElements.find((e) => e.id === "t")
		expect(el?.type).toBe(type)
		const loop = el && "loopCharacteristics" in el ? el.loopCharacteristics : undefined
		expect(loop?.isSequential).toBe(true)
		expect(loop?.completionCondition?.text).toBe("=count(results) > 2")
		const z = loop?.extensionElements.find((x) => x.name === "zeebe:loopCharacteristics")
		expect(z?.attributes).toEqual({
			inputCollection: "=items",
			inputElement: "item",
			outputCollection: "results",
			outputElement: "=result",
		})
	})

	it("keeps multi-instance on send/receive tasks in branches and sub-processes", () => {
		const xml = Bpmn.export(
			Bpmn.createProcess("p")
				.startEvent("s")
				.exclusiveGateway("g")
				.branch("a", (b) => b.sendTask("snd", { multiInstance: MI }).endEvent("e1"))
				.branch("b", (b) =>
					b
						.subProcess("sub", (i) =>
							i.startEvent("is").receiveTask("rcv", { multiInstance: MI }).endEvent("ie"),
						)
						.endEvent("e2"),
				)
				.build(),
		)
		expect(xml.match(/outputCollection="results"/g)?.length).toBe(2)
	})

	it("compactify and expand keep outputCollection and completionCondition", () => {
		const defs = Bpmn.createProcess("p")
			.startEvent("s")
			.serviceTask("t", { name: "T", taskType: "w", multiInstance: MI })
			.endEvent("e")
			.build()
		const compact = compactify(defs)
		const el = compact.processes[0]?.elements.find((e) => e.id === "t")
		expect(el?.multiInstance).toEqual({
			collection: "=items",
			element: "item",
			sequential: true,
			outputCollection: "results",
			outputElement: "=result",
			completionCondition: "=count(results) > 2",
		})
		const xml = Bpmn.export(expand(compact))
		expect(xml).toContain('outputCollection="results"')
		expect(xml).toContain("=count(results) &gt; 2")
	})
})
