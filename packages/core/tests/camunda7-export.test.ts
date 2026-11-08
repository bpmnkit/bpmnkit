import { describe, expect, it } from "vitest"
import {
	Bpmn,
	type Camunda8ExportFinding,
	convertCamunda7,
	convertCamunda8To7,
	semanticHash,
} from "../src/index.js"

// Exports here check what the serializer writes, not whether Zeebe would deploy the
// model (a fragment, a round trip), so they pass `validate: false` to skip the gate.

const c8 = (body: string, root = ""): string => `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:zeebe="http://camunda.org/schema/zeebe/1.0" xmlns:modeler="http://camunda.org/schema/modeler/1.0" id="d" targetNamespace="http://bpmn.io/schema/bpmn" modeler:executionPlatform="Camunda Cloud" modeler:executionPlatformVersion="8.8.0">
  ${root}
  <bpmn:process id="p" isExecutable="true">${body}</bpmn:process>
</bpmn:definitions>`

function run(xml: string): { out: string; findings: Camunda8ExportFinding[] } {
	const { definitions, findings } = convertCamunda8To7(Bpmn.parse(xml))
	return { out: Bpmn.export(definitions), findings }
}

describe("convertCamunda8To7", () => {
	it("maps a service task job type to an external topic", () => {
		const { out } = run(
			c8(
				'<bpmn:serviceTask id="t"><bpmn:extensionElements><zeebe:taskDefinition type="charge" retries="3"/></bpmn:extensionElements></bpmn:serviceTask>',
			),
		)
		expect(out).toContain('camunda:type="external"')
		expect(out).toContain('camunda:topic="charge"')
		expect(out).toContain("xmlns:camunda=")
		expect(out).not.toMatch(/zeebe|modeler/)
	})

	it("maps user task assignment and form key", () => {
		const { out } = run(
			c8(
				'<bpmn:userTask id="u"><bpmn:extensionElements><zeebe:assignmentDefinition assignee="bob" candidateGroups="ops" candidateUsers="a,b"/><zeebe:formDefinition formKey="k1"/></bpmn:extensionElements></bpmn:userTask>',
			),
		)
		expect(out).toContain('camunda:assignee="bob"')
		expect(out).toContain('camunda:candidateGroups="ops"')
		expect(out).toContain('camunda:candidateUsers="a,b"')
		expect(out).toContain('camunda:formKey="k1"')
		expect(out).not.toMatch(/zeebe|modeler/)
	})

	it("reports a message correlation key and drops it", () => {
		const { out, findings } = run(
			c8(
				'<bpmn:intermediateCatchEvent id="e"><bpmn:messageEventDefinition messageRef="m"/></bpmn:intermediateCatchEvent>',
				'<bpmn:message id="m" name="go"><bpmn:extensionElements><zeebe:subscription correlationKey="=orderId"/></bpmn:extensionElements></bpmn:message>',
			),
		)
		expect(findings.some((f) => f.construct === "zeebe:subscription" && f.elementId === "m")).toBe(
			true,
		)
		expect(out).not.toMatch(/zeebe|modeler|correlationKey/)
	})

	it("maps a call activity and variable propagation", () => {
		const { out } = run(
			c8(
				'<bpmn:callActivity id="c"><bpmn:extensionElements><zeebe:calledElement processId="child" propagateAllChildVariables="true" propagateAllParentVariables="false"/></bpmn:extensionElements></bpmn:callActivity>',
			),
		)
		expect(out).toContain('calledElement="child"')
		expect(out).toMatch(/<camunda:out variables="all"/)
		expect(out).not.toContain("camunda:in ")
		expect(out).not.toMatch(/zeebe|modeler/)
	})

	it("maps io mapping and flags FEEL", () => {
		const { out, findings } = run(
			c8(
				'<bpmn:serviceTask id="t"><bpmn:extensionElements><zeebe:taskDefinition type="x"/><zeebe:ioMapping><zeebe:input source="=a" target="in1"/><zeebe:output source="=b" target="out1"/></zeebe:ioMapping></bpmn:extensionElements></bpmn:serviceTask>',
			),
		)
		expect(out).toContain('<camunda:inputParameter name="in1">=a</camunda:inputParameter>')
		expect(out).toContain('<camunda:outputParameter name="out1">=b</camunda:outputParameter>')
		expect(findings.filter((f) => f.message.includes("FEEL")).length).toBe(2)
	})

	it("flags connectors and drops zeebe-only features", () => {
		const { out, findings } = run(
			c8(
				'<bpmn:serviceTask id="t"><bpmn:extensionElements><zeebe:taskDefinition type="io.camunda:http-json:1"/><zeebe:taskHeaders><zeebe:header key="k" value="v"/></zeebe:taskHeaders></bpmn:extensionElements></bpmn:serviceTask>',
			),
		)
		expect(findings.some((f) => f.construct === "connector" && f.severity === "unsupported")).toBe(
			true,
		)
		expect(findings.some((f) => f.construct === "zeebe:taskHeaders")).toBe(true)
		expect(out).not.toMatch(/zeebe|modeler/)
	})

	it("converts a multi-instance loop that has an id", () => {
		const { out } = run(
			c8(
				'<bpmn:task id="t"><bpmn:multiInstanceLoopCharacteristics id="m" isSequential="false"/></bpmn:task>',
			),
		)
		expect(out).toContain('id="m"')
		expect(out).not.toMatch(/zeebe|modeler/)
	})

	it("does not mutate the input", () => {
		const defs = Bpmn.parse(
			c8(
				'<bpmn:serviceTask id="t"><bpmn:extensionElements><zeebe:taskDefinition type="x"/></bpmn:extensionElements></bpmn:serviceTask>',
			),
		)
		const before = semanticHash(defs)
		convertCamunda8To7(defs)
		expect(semanticHash(defs)).toBe(before)
	})

	it("round-trips task types and io mapping through convertCamunda7", () => {
		const { definitions } = convertCamunda8To7(
			Bpmn.parse(
				c8(
					'<bpmn:serviceTask id="t"><bpmn:extensionElements><zeebe:taskDefinition type="charge"/><zeebe:ioMapping><zeebe:input source="=a" target="in1"/></zeebe:ioMapping></bpmn:extensionElements></bpmn:serviceTask>',
				),
			),
		)
		const back = Bpmn.export(
			convertCamunda7(Bpmn.parse(Bpmn.export(definitions, { validate: false })), {
				// A one-task fragment: it pins the round trip, not deployability.
				validate: false,
			}).definitions,
			{ validate: false },
		)
		expect(back).toContain('type="charge"')
		expect(back).toContain('target="in1"')
	})
})
