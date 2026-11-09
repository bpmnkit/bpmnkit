import { beforeEach, describe, expect, it } from "vitest"
import type { BpmnDefinitions, BpmnFlowElement } from "../src/bpmn/bpmn-model.js"
import { Bpmn, DeployabilityError, resetIdCounter } from "../src/index.js"

/**
 * The builder's deploy gate: `build()` applies the Camunda 8 builder rules and
 * then `assertDeployable`. Every rule message is pinned by a `conformance/builder`
 * error case; this file covers the options and how the gate is reached.
 */

beforeEach(() => resetIdCounter())

function el(defs: BpmnDefinitions, id: string): BpmnFlowElement | undefined {
	return defs.processes[0]?.flowElements.find((e) => e.id === id)
}

const unconditioned = () =>
	Bpmn.createProcess("p")
		.startEvent("s")
		.exclusiveGateway("g")
		.branch("a", (b) => b.condition("=a").endEvent("e1"))
		.branch("b", (b) => b.endEvent("e2"))

describe("ProcessBuilder.build() gate", () => {
	it("refuses with a builder rule before the deploy check", () => {
		let thrown: unknown
		try {
			unconditioned().build()
		} catch (err) {
			thrown = err
		}
		expect(thrown).toBeInstanceOf(Error)
		expect(thrown).not.toBeInstanceOf(DeployabilityError)
		expect((thrown as Error).message).toMatch(/^Flow "Flow_g_e2" leaves exclusive gateway "g"/)
	})

	it("throws DeployabilityError for what only the deploy check finds", () => {
		const b = Bpmn.createProcess("p").startEvent("s").intermediateCatchEvent("c").endEvent("e")
		expect(() => b.build()).toThrow(DeployabilityError)
		expect(() => b.build()).toThrow(
			"Not deployable on Camunda 8.10: 1 error(s)\n- c: Must have exactly one event definition (zeebe/intermediate-catch-definitions)",
		)
	})

	it("checks the version given, else the model's executionPlatformVersion", () => {
		const b = Bpmn.createProcess("p")
			.executionPlatformVersion("8.6.0")
			.startEvent("s")
			.intermediateCatchEvent("c")
			.endEvent("e")
		expect(() => b.build()).toThrow(/^Not deployable on Camunda 8\.6:/)
		expect(() => b.build({ camundaVersion: "8.7" })).toThrow(/^Not deployable on Camunda 8\.7:/)
	})

	it("skips the Camunda 8 rules and the check with validate: false", () => {
		const defs = unconditioned().build({ validate: false })
		const flow = defs.processes[0]?.sequenceFlows.find((f) => f.id === "Flow_g_e2")
		expect(flow).toBeDefined()
		expect(flow?.conditionExpression).toBeUndefined()
	})

	it("refuses chaining after an end event at the call, whatever validate says", () => {
		expect(() => Bpmn.createProcess("p").startEvent("s").endEvent("e1").task("t")).toThrow(
			'Cannot chain "t" after end event "e1"',
		)
	})

	it("returns the filled model with placeholders, leaving the gaps they fill to the gate", () => {
		const defs = Bpmn.createProcess("p")
			.startEvent("s")
			.sendTask("send", { messageName: "m" })
			.exclusiveGateway("g")
			.branch("a", (b) => b.condition("=a").endEvent("e1"))
			.branch("b", (b) => b.endEvent("e2"))
			.build({ placeholders: true })
		const send = el(defs, "send")
		expect(
			send?.extensionElements.find((x) => x.name === "zeebe:taskDefinition")?.attributes,
		).toEqual({ type: "placeholder-send" })
		const flow = defs.processes[0]?.sequenceFlows.find((f) => f.id === "Flow_g_e2")
		expect(flow?.conditionExpression?.text).toBe("=false")
	})

	it("does not gate a continued document that does not target Camunda 8", () => {
		const source = Bpmn.createProcess("p").startEvent("s").task("a").build({ validate: false })
		source.unknownAttributes["modeler:executionPlatform"] = "Camunda Platform"
		const defs = Bpmn.continueProcess(source, "p").intermediateCatchEvent("c").build()
		expect(el(defs, "c")?.type).toBe("intermediateCatchEvent")
	})

	it("gates a continued Camunda 8 document", () => {
		const source = Bpmn.createProcess("p").startEvent("s").task("a").build()
		expect(() => Bpmn.continueProcess(source, "p").intermediateCatchEvent("c").build()).toThrow(
			DeployabilityError,
		)
	})

	it("writes taskType as the job of a send task and message throw and end events", () => {
		const defs = Bpmn.createProcess("p")
			.startEvent("s")
			.sendTask("send", { messageName: "a", taskType: "send-a" })
			.intermediateThrowEvent("throw", { messageName: "b", taskType: "send-b" })
			.endEvent("end", { messageName: "c", taskType: "send-c" })
			.build()
		for (const [id, type] of [
			["send", "send-a"],
			["throw", "send-b"],
			["end", "send-c"],
		]) {
			const def = el(defs, id as string)?.extensionElements.find(
				(x) => x.name === "zeebe:taskDefinition",
			)
			expect(def?.attributes.type, id).toBe(type)
		}
	})
})

describe("DiagramBuilder.build() gate", () => {
	const diagram = () =>
		Bpmn.createDiagram("D").process("a", (p) =>
			p.startEvent("s").sendTask("send", { messageName: "m" }).endEvent("e"),
		)

	it("gates the document, not each pool", () => {
		expect(() => diagram().build()).toThrow('Send task "send" needs a taskType')
		expect(diagram().build({ validate: false }).processes).toHaveLength(1)
	})

	it("keeps the correlation key of a message two pools share", () => {
		const defs = Bpmn.createDiagram("D")
			.process("a", (p) => p.startEvent("s", { messageName: "m" }).endEvent("e"))
			.process("b", (p) =>
				p
					.startEvent("s2")
					.intermediateCatchEvent("c", { messageName: "m", correlationKey: "=k" })
					.endEvent("e2"),
			)
			.build()
		expect(defs.messages).toHaveLength(1)
		const sub = defs.messages[0]?.extensionElements?.find((x) => x.name === "zeebe:subscription")
		expect(sub?.attributes.correlationKey).toBe("=k")
	})
})
