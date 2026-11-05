import { describe, expect, it } from "vitest"
import { parseBpmn } from "../src/bpmn/bpmn-parser.js"
import { serializeBpmn } from "../src/bpmn/bpmn-serializer.js"
import { stripCamunda8 } from "../src/index.js"

const C8 = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:zeebe="http://camunda.org/schema/zeebe/1.0" xmlns:modeler="http://camunda.org/schema/modeler/1.0" xmlns:camunda="http://camunda.org/schema/1.0/bpmn" id="Defs" targetNamespace="http://bpmn.io/schema/bpmn" modeler:executionPlatform="Camunda Cloud" modeler:executionPlatformVersion="8.6.0">
  <bpmn:process id="P" isExecutable="true">
    <bpmn:startEvent id="S"/>
    <bpmn:serviceTask id="T" camunda:asyncBefore="true">
      <bpmn:extensionElements><zeebe:taskDefinition type="work"/></bpmn:extensionElements>
    </bpmn:serviceTask>
    <bpmn:sequenceFlow id="F" sourceRef="S" targetRef="T"/>
  </bpmn:process>
</bpmn:definitions>`

const C7 = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:camunda="http://camunda.org/schema/1.0/bpmn" id="Defs" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="P" isExecutable="true" camunda:historyTimeToLive="P1D">
    <bpmn:startEvent id="S" camunda:formKey="k"/>
    <bpmn:serviceTask id="T" camunda:delegateExpression="\${d}" camunda:asyncBefore="true"/>
    <bpmn:sequenceFlow id="F" sourceRef="S" targetRef="T"/>
  </bpmn:process>
</bpmn:definitions>`

describe("stripCamunda8", () => {
	it("drops zeebe/modeler content, reports it, keeps camunda:*, does not mutate", () => {
		const defs = parseBpmn(C8)
		const { definitions, dropped } = stripCamunda8(defs)
		const xml = serializeBpmn(definitions)
		expect(xml).not.toMatch(/zeebe|modeler/)
		expect(xml).toContain('camunda:asyncBefore="true"')
		expect(dropped).toContainEqual({
			elementId: "T",
			kind: "extensionElement",
			name: "zeebe:taskDefinition",
		})
		expect(dropped).toContainEqual({
			elementId: "Defs",
			kind: "attribute",
			name: "modeler:executionPlatform",
		})
		expect(dropped).toContainEqual({
			elementId: "definitions",
			kind: "namespace",
			name: "xmlns:zeebe",
		})
		expect(serializeBpmn(defs)).toContain("zeebe:taskDefinition")
	})

	it("reports nothing for a vendor-neutral file", () => {
		expect(stripCamunda8(parseBpmn(C7)).dropped).toEqual([])
	})
})

describe("Camunda 7 round trip", () => {
	it("keeps camunda:* and adds no zeebe/modeler namespace", () => {
		const xml = serializeBpmn(parseBpmn(C7))
		for (const a of [
			'camunda:historyTimeToLive="P1D"',
			'camunda:formKey="k"',
			'camunda:asyncBefore="true"',
		])
			expect(xml).toContain(a)
		expect(xml).not.toMatch(/zeebe|modeler/)
	})
})
