import { describe, expect, it } from "vitest"
import type { BpmnFlowElement } from "../src/bpmn/bpmn-model.js"
import { compactify, expand } from "../src/bpmn/compact.js"
import type { CompactDiagram } from "../src/bpmn/compact.js"
import { toFeelCondition } from "../src/bpmn/feel-condition.js"
import { Bpmn } from "../src/bpmn/index.js"

/**
 * Regressions for making generated BPMN deployable on Zeebe: each case pins one
 * thing Zeebe (or BPMN20.xsd) rejects that the builder/serializer used to emit.
 */

function find(defs: ReturnType<typeof Bpmn.parse>, id: string): BpmnFlowElement | undefined {
	return defs.processes.flatMap((p) => p.flowElements).find((e) => e.id === id)
}

describe("serializer declares xmlns:xsi when a condition appears", () => {
	const NO_XSI = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" id="d" targetNamespace="urn:t">
  <bpmn:process id="P" isExecutable="true">
    <bpmn:startEvent id="s" />
    <bpmn:exclusiveGateway id="g" />
    <bpmn:endEvent id="e" />
    <bpmn:sequenceFlow id="f0" sourceRef="s" targetRef="g" />
    <bpmn:sequenceFlow id="f1" sourceRef="g" targetRef="e" />
  </bpmn:process>
</bpmn:definitions>`

	it("continueProcess adding a condition to a doc without xsi declares it", () => {
		const defs = Bpmn.continueProcess(Bpmn.parse(NO_XSI), "P")
			.insertAfter("g")
			.exclusiveGateway("g2")
			.branch("b", (b) => b.condition("x > 1").endEvent("e2"))
			.branch("c", (b) => b.defaultFlow().endEvent("e3"))
			.build()
		const xml = Bpmn.export(defs)
		expect(xml).toContain("xsi:type=")
		expect(xml).toContain('xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"')
	})
})

describe("data input association targets a placeholder property", () => {
	it("sets targetRef to Property_<activityId> and serialises bpmn:property", () => {
		const defs = Bpmn.createProcess("p")
			.startEvent("s")
			.serviceTask("t", { name: "T", taskType: "work" })
			.endEvent("e")
			.dataObject("do1")
			.dataObjectReference("dor1", "do1")
			.dataAssociation("t", "dor1", "input")
			.build()
		const t = find(defs, "t")
		expect(t?.dataInputAssociations?.[0]?.targetRef).toBe("Property_t")
		expect(t?.properties).toEqual([
			expect.objectContaining({ id: "Property_t", name: "__targetRef_placeholder" }),
		])
		const xml = Bpmn.export(defs)
		expect(xml).toContain("<bpmn:property ")
		expect(xml).toContain("<bpmn:targetRef>Property_t</bpmn:targetRef>")
	})

	it("reuses one placeholder for several input associations", () => {
		const defs = Bpmn.createProcess("p")
			.startEvent("s")
			.serviceTask("t", { name: "T", taskType: "work" })
			.endEvent("e")
			.dataObject("do1")
			.dataObjectReference("a", "do1")
			.dataObjectReference("b", "do1")
			.dataAssociation("t", "a", "input")
			.dataAssociation("t", "b", "input")
			.build()
		expect(find(defs, "t")?.properties).toHaveLength(1)
		expect(find(defs, "t")?.dataInputAssociations?.map((a) => a.targetRef)).toEqual([
			"Property_t",
			"Property_t",
		])
	})
})

describe("isCollection lives on the data object", () => {
	it("moves to the referenced dataObject and is not written on the reference", () => {
		const defs = Bpmn.createProcess("p")
			.startEvent("s")
			.endEvent("e")
			.dataObject("do1")
			.dataObjectReference("dor1", "do1", { isCollection: true })
			.build()
		expect(find(defs, "do1")).toMatchObject({ isCollection: true })
		expect(find(defs, "dor1")).not.toHaveProperty("isCollection")
		const xml = Bpmn.export(defs)
		expect(xml).toMatch(/<bpmn:dataObject [^>]*isCollection="true"/)
		expect(xml).not.toMatch(/<bpmn:dataObjectReference [^>]*isCollection/)
	})

	it("still sets it directly on a dataObject", () => {
		const defs = Bpmn.createProcess("p")
			.startEvent("s")
			.endEvent("e")
			.dataObject("do1", { isCollection: true })
			.build()
		expect(find(defs, "do1")).toMatchObject({ isCollection: true })
	})
})

describe("compact round-trips a link event name", () => {
	it("keeps linkName through expand → compactify → expand", () => {
		const compact: CompactDiagram = {
			id: "d",
			processes: [
				{
					id: "P",
					elements: [
						{ id: "s", type: "startEvent" },
						{ id: "thr", type: "intermediateThrowEvent", eventType: "link", linkName: "jump" },
						{ id: "cat", type: "intermediateCatchEvent", eventType: "link", linkName: "jump" },
						{ id: "e", type: "endEvent" },
					],
					flows: [
						{ id: "f1", from: "s", to: "thr" },
						{ id: "f2", from: "cat", to: "e" },
					],
				},
			],
		}
		const defs = expand(compact)
		const link = (id: string) => {
			const el = find(defs, id)
			return el && "eventDefinitions" in el ? el.eventDefinitions[0] : undefined
		}
		expect(link("thr")).toMatchObject({ type: "link", name: "jump" })
		const back = compactify(defs).processes[0]?.elements
		expect(back?.find((e) => e.id === "thr")?.linkName).toBe("jump")
		expect(back?.find((e) => e.id === "cat")?.linkName).toBe("jump")
		expect(link("cat")).toMatchObject({ type: "link", name: "jump" })
	})
})

describe("builder refuses uncorrelated caught messages", () => {
	it("receiveTask with messageName and no correlationKey throws", () => {
		expect(() =>
			Bpmn.createProcess("p").startEvent("s").receiveTask("r", { messageName: "m" }),
		).toThrow(/receiveTask\(\).*correlationKey/)
	})

	it("intermediateCatchEvent with messageName and no correlationKey throws", () => {
		expect(() =>
			Bpmn.createProcess("p").startEvent("s").intermediateCatchEvent("c", { messageName: "m" }),
		).toThrow(/intermediateCatchEvent\(\).*correlationKey/)
	})

	it("boundaryEvent with messageName and no correlationKey throws", () => {
		expect(() =>
			Bpmn.createProcess("p")
				.startEvent("s")
				.serviceTask("t", { taskType: "x" })
				.boundaryEvent("b", { attachedTo: "t", messageName: "m" }),
		).toThrow(/boundaryEvent\(\).*correlationKey/)
	})

	it("eventSubProcess whose message start has no correlationKey throws", () => {
		expect(() =>
			Bpmn.createProcess("p")
				.startEvent("s")
				.endEvent("e")
				.eventSubProcess("esp", (ev) => ev.startEvent("evs", { messageName: "m" }).endEvent("eve")),
		).toThrow(/eventSubProcess\(\).*evs.*correlationKey/)
	})

	it("a correlated eventSubProcess message start emits zeebe:subscription on the message", () => {
		const defs = Bpmn.createProcess("p")
			.startEvent("s")
			.endEvent("e")
			.eventSubProcess("esp", (ev) =>
				ev.startEvent("evs", { messageName: "m", correlationKey: "=k" }).endEvent("eve"),
			)
			.build()
		const xml = Bpmn.export(defs)
		expect(xml).toMatch(
			/<bpmn:message id="Message_m" name="m">\s*<bpmn:extensionElements>\s*<zeebe:subscription correlationKey="=k"\/>/,
		)
	})

	it("a process's own message start needs no correlationKey", () => {
		expect(() =>
			Bpmn.createProcess("p").startEvent("s", { messageName: "m" }).endEvent("e").build(),
		).not.toThrow()
	})
})

describe("toFeelCondition", () => {
	it.each([
		["x > 1", "=x > 1"],
		["=a", "=a"],
		["= a > 1", "= a > 1"],
		["", ""],
		["${a && b}", "=a and b"],
	])("%j -> %j", (input, expected) => {
		expect(toFeelCondition(input)).toBe(expected)
	})

	it("leaves untranslatable JUEL as written", () => {
		const juel = "${execution.getVariable('x').foo(bar)}"
		expect(toFeelCondition(juel)).toBe(juel)
	})

	it("is applied to builder branch conditions", () => {
		const defs = Bpmn.createProcess("p")
			.startEvent("s")
			.exclusiveGateway("g")
			.branch("y", (b) => b.condition("x > 1").endEvent("e1"))
			.branch("n", (b) => b.defaultFlow().endEvent("e2"))
			.build()
		const flow = defs.processes[0]?.sequenceFlows.find((f) => f.targetRef === "e1")
		expect(flow?.conditionExpression?.text).toBe("=x > 1")
	})

	it("is applied to multi-instance completionCondition in the builder", () => {
		const defs = Bpmn.createProcess("p")
			.startEvent("s")
			.serviceTask("t", {
				taskType: "x",
				multiInstance: { inputCollection: "=xs", completionCondition: "done > 1" },
			})
			.endEvent("e")
			.build()
		const t = find(defs, "t")
		expect(
			t && "loopCharacteristics" in t && t.loopCharacteristics?.completionCondition?.text,
		).toBe("=done > 1")
	})

	it("is applied to compact flow conditions and multi-instance completion on expand", () => {
		const defs = expand({
			id: "d",
			processes: [
				{
					id: "P",
					elements: [
						{ id: "s", type: "startEvent" },
						{ id: "g", type: "exclusiveGateway" },
						{ id: "e", type: "endEvent" },
						{
							id: "t",
							type: "serviceTask",
							multiInstance: { collection: "=xs", completionCondition: "done > 1" },
						},
					],
					flows: [
						{ id: "f1", from: "s", to: "g" },
						{ id: "f2", from: "g", to: "e", condition: "${a && b}" },
						{ id: "f3", from: "g", to: "t" },
						{ id: "f4", from: "t", to: "e" },
					],
				},
			],
		})
		expect(
			defs.processes[0]?.sequenceFlows.find((f) => f.id === "f2")?.conditionExpression?.text,
		).toBe("=a and b")
		const t = find(defs, "t")
		expect(
			t && "loopCharacteristics" in t && t.loopCharacteristics?.completionCondition?.text,
		).toBe("=done > 1")
	})
})
