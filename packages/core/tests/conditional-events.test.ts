import { describe, expect, it } from "vitest"
import { Bpmn, analyzeCamundaCompat, compactify, expand } from "../src/index.js"
import type { BpmnConditionalEventDefinition } from "../src/index.js"

const conditionalDef = (defs: ReturnType<typeof Bpmn.parse>, id: string) => {
	const el = defs.processes[0]?.flowElements.find((e) => e.id === id)
	const def = el && "eventDefinitions" in el ? el.eventDefinitions[0] : undefined
	return def as BpmnConditionalEventDefinition
}

describe("conditional event definition extensionElements", () => {
	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:zeebe="http://camunda.org/schema/zeebe/1.0" id="d" targetNamespace="x">
  <bpmn:process id="p" isExecutable="true">
    <bpmn:intermediateCatchEvent id="c">
      <bpmn:conditionalEventDefinition id="cd">
        <bpmn:extensionElements><zeebe:conditionalFilter variableEvents="create,update" /></bpmn:extensionElements>
        <bpmn:condition xsi:type="bpmn:tFormalExpression">= x &gt; 1</bpmn:condition>
      </bpmn:conditionalEventDefinition>
    </bpmn:intermediateCatchEvent>
  </bpmn:process>
</bpmn:definitions>`

	it("parses and re-serializes the extension elements", () => {
		const defs = Bpmn.parse(xml)
		expect(conditionalDef(defs, "c").extensionElements?.[0]?.name).toBe("zeebe:conditionalFilter")
		const again = Bpmn.export(defs)
		expect(again).toContain('<zeebe:conditionalFilter variableEvents="create,update"')
		expect(again.indexOf("extensionElements")).toBeLessThan(again.indexOf("<bpmn:condition "))
		expect(conditionalDef(Bpmn.parse(again), "c").extensionElements).toEqual(
			conditionalDef(defs, "c").extensionElements,
		)
	})
})

describe("builder conditional events", () => {
	const build = () =>
		Bpmn.createProcess("p")
			.startEvent("s", { condition: "= a > 1", conditionVariableEvents: ["create"] })
			.task("t")
			.intermediateCatchEvent("c", {
				condition: "= b",
				conditionVariableEvents: ["create", "update"],
			})
			.endEvent("e")
			.boundaryEvent("b", { attachedTo: "t", condition: "= c" })
			.build()

	it("writes start, catch and boundary conditions with the filter", () => {
		const defs = Bpmn.parse(Bpmn.export(build()))
		expect(conditionalDef(defs, "s").condition).toBe("= a > 1")
		expect(conditionalDef(defs, "c").condition).toBe("= b")
		expect(conditionalDef(defs, "b").condition).toBe("= c")
		const xml = Bpmn.export(build())
		expect(xml).toContain('variableEvents="create"')
		expect(xml).toContain('variableEvents="create,update"')
		expect(xml).toContain('xsi:type="bpmn:tFormalExpression"')
	})

	it("is gated at Camunda 8.9", () => {
		const count = (v: "8.8" | "8.9") => analyzeCamundaCompat(build(), v).length
		expect(count("8.8")).toBeGreaterThan(count("8.9"))
	})
})

describe("compact conditional events", () => {
	it("keeps the condition through expand and compactify", () => {
		const defs = expand({
			id: "d",
			processes: [
				{
					id: "p",
					name: "P",
					elements: [
						{ id: "s", type: "startEvent", name: "S" },
						{
							id: "c",
							type: "intermediateCatchEvent",
							eventType: "conditional",
							condition: "= x > 1",
						},
						{ id: "e", type: "endEvent", name: "E" },
					],
					flows: [
						{ id: "f1", from: "s", to: "c" },
						{ id: "f2", from: "c", to: "e" },
					],
				},
			],
		})
		expect(conditionalDef(defs, "c")).toMatchObject({ type: "conditional", condition: "= x > 1" })
		const back = compactify(defs).processes[0]?.elements.find((e) => e.id === "c")
		expect(back?.condition).toBe("= x > 1")
	})
})
