import { describe, expect, it } from "vitest"
import {
	applyConnectorLines,
	applyTemplateToElement,
	applyTemplates,
	getTemplate,
} from "../../src/connectors/index.js"
import type { ElementTemplate } from "../../src/connectors/index.js"
import { Bpmn, type BpmnDefinitions, parseConnectorLine } from "../../src/index.js"

/** A task to apply templates to, next to an unrelated service task with no job type. */
const XML = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
  xmlns:zeebe="http://camunda.org/schema/zeebe/1.0" id="Definitions_1"
  targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="orders" isExecutable="true">
    <bpmn:startEvent id="start" />
    <bpmn:task id="call" name="Call the API" />
    <bpmn:serviceTask id="unfinished" name="Not configured yet" />
    <bpmn:endEvent id="end" />
    <bpmn:sequenceFlow id="f1" sourceRef="start" targetRef="call" />
    <bpmn:sequenceFlow id="f2" sourceRef="call" targetRef="unfinished" />
    <bpmn:sequenceFlow id="f3" sourceRef="unfinished" targetRef="end" />
  </bpmn:process>
</bpmn:definitions>`

const model = (): BpmnDefinitions => Bpmn.parse(XML)

const HTTP = "io.camunda.connectors.HttpJson.v2"
const HTTP_VALUES = { method: "GET", url: "https://example.com/orders" }

function http(): ElementTemplate {
	const found = getTemplate(HTTP)
	if (!found) throw new Error("bundled HTTP template is missing")
	return found
}

/** A custom template that sets no job type: Zeebe would refuse the service task. */
const NO_TYPE: ElementTemplate = {
	$schema: "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
	name: "No type",
	id: "acme.no-type",
	appliesTo: ["bpmn:Task"],
	elementType: { value: "bpmn:ServiceTask" },
	properties: [{ type: "Hidden", value: "x", binding: { type: "zeebe:input", name: "x" } }],
}

const NO_TYPE_ERROR =
	"Not deployable on Camunda 8.10: call: Must have exactly one 'zeebe:taskDefinition' extension element (zeebe/service-task-definition)"

describe("connector templates report what Zeebe would refuse", () => {
	it("a complete template leaves no deploy problem, and the rest of the model is not checked", () => {
		const { problems } = applyTemplateToElement(model(), "call", http(), HTTP_VALUES)
		expect(problems.filter((p) => p.kind === "not-deployable")).toEqual([])
	})

	it("applyTemplateToElement: one not-deployable problem per Zeebe error on the element", () => {
		const { definitions, problems } = applyTemplateToElement(model(), "call", NO_TYPE)
		expect(problems).toContainEqual({ kind: "not-deployable", message: NO_TYPE_ERROR })
		// Still applied, like any other problem.
		expect(definitions.processes[0]?.flowElements.find((e) => e.id === "call")?.type).toBe(
			"serviceTask",
		)
	})

	it("checks the version asked for, else the model's", () => {
		const asked = applyTemplateToElement(model(), "call", NO_TYPE, {}, { camundaVersion: "8.6" })
		expect(asked.problems).toContainEqual({
			kind: "not-deployable",
			message: NO_TYPE_ERROR.replace("8.10", "8.6"),
		})
		const pinned = model()
		pinned.unknownAttributes["modeler:executionPlatformVersion"] = "8.7.0"
		expect(applyTemplateToElement(pinned, "call", NO_TYPE).problems).toContainEqual({
			kind: "not-deployable",
			message: NO_TYPE_ERROR.replace("8.10", "8.7"),
		})
	})

	it("validate: false skips the check", () => {
		const { problems } = applyTemplateToElement(model(), "call", NO_TYPE, {}, { validate: false })
		expect(problems.some((p) => p.kind === "not-deployable")).toBe(false)
	})

	it("applyTemplates checks once, naming the element", () => {
		const { problems } = applyTemplates(model(), [
			{ elementId: "call", template: NO_TYPE, values: {} },
		])
		expect(problems).toEqual([{ elementId: "call", message: NO_TYPE_ERROR }])
		const fine = applyTemplates(model(), [
			{ elementId: "call", template: HTTP, values: HTTP_VALUES },
		])
		expect(fine.problems).toEqual([])
		expect(
			applyTemplates(model(), [{ elementId: "call", template: NO_TYPE, values: {} }], {
				validate: false,
			}).problems,
		).toEqual([])
	})

	it("applyConnectorLines checks only the elements its lines configured", () => {
		const parsed = parseConnectorLine("with call: http GET https://example.com/orders", 3, [])
		if (!parsed) throw new Error("not a with line")
		// "unfinished" has no job type, but no line touched it.
		const applied = applyConnectorLines(model(), [{ ...parsed, elementId: "call" }])
		expect(applied.problems).toEqual([])
	})
})
