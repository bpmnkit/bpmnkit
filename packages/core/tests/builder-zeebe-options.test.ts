import { describe, expect, it } from "vitest"
import { Bpmn } from "../src/bpmn/index.js"

describe("builder zeebe options", () => {
	it("emits zeebe:formDefinition on a top-level start event", () => {
		const xml = Bpmn.export(
			Bpmn.createProcess("p")
				.startEvent("s", { name: "S", formId: "ai-agent-chat-initial-request" })
				.endEvent("e")
				.build(),
		)
		expect(xml).toContain('<zeebe:formDefinition formId="ai-agent-chat-initial-request"')
	})

	it("emits the form on a start event inside an event sub-process", () => {
		const xml = Bpmn.export(
			Bpmn.createProcess("p")
				.startEvent("s")
				.endEvent("e")
				.eventSubProcess("es", (sub) =>
					sub.startEvent("es-s", { formId: "sub-form", isInterrupting: false }).endEvent("es-e"),
				)
				.build(),
		)
		expect(xml).toContain('<zeebe:formDefinition formId="sub-form"')
	})

	it("maps user-task inputs alongside zeebe:userTask and the form", () => {
		const xml = Bpmn.export(
			Bpmn.createProcess("p")
				.startEvent("s")
				.userTask("u", {
					name: "User Feedback",
					formId: "ai-agent-chat-user-feedback",
					zeebeUserTask: true,
					ioMapping: { inputs: [{ source: "=agent.responseText", target: "responseText" }] },
				})
				.endEvent("e")
				.build(),
		)
		// The serializer owns child order (ioMapping first); the task must carry all three.
		expect(xml).toMatch(/<zeebe:userTask\s*\/>/)
		expect(xml).toContain('<zeebe:formDefinition formId="ai-agent-chat-user-feedback"')
		expect(xml).toMatch(
			/<zeebe:ioMapping>\s*<zeebe:input source="=agent.responseText" target="responseText"\s*\/>\s*<\/zeebe:ioMapping>/,
		)
	})

	it("emits user-task headers, properties and template attributes", () => {
		const xml = Bpmn.export(
			Bpmn.createProcess("p")
				.startEvent("s")
				.userTask("u", {
					name: "U",
					taskHeaders: { k: "v" },
					zeebeProperties: [{ name: "pn", value: "pv" }],
					modelerTemplate: "tpl.id",
					modelerTemplateVersion: "2",
					modelerTemplateIcon: "data:x",
				})
				.endEvent("e")
				.build(),
		)
		expect(xml).toContain('<zeebe:header key="k" value="v"')
		expect(xml).toContain('<zeebe:property name="pn" value="pv"')
		expect(xml).toContain('zeebe:modelerTemplate="tpl.id"')
		expect(xml).toContain('zeebe:modelerTemplateVersion="2"')
		expect(xml).toContain('zeebe:modelerTemplateIcon="data:x"')
	})

	it("keeps a start event's modelerTemplate and properties inside a branch", () => {
		const xml = Bpmn.export(
			Bpmn.createProcess("p")
				.startEvent("s")
				.exclusiveGateway("g")
				.branch("A", (b) =>
					b
						.startEvent("bs", {
							modelerTemplate: "tpl.start",
							modelerTemplateVersion: "3",
							zeebeProperties: [{ name: "pn", value: "pv" }],
							formId: "branch-form",
						})
						.endEvent("be"),
				)
				.branch("B", (b) => b.endEvent("e2"))
				.build(),
		)
		expect(xml).toContain('zeebe:modelerTemplate="tpl.start"')
		expect(xml).toContain('zeebe:modelerTemplateVersion="3"')
		expect(xml).toContain('<zeebe:property name="pn" value="pv"')
		expect(xml).toContain('<zeebe:formDefinition formId="branch-form"')
	})

	it("keeps a start event's modelerTemplate and properties inside an event sub-process", () => {
		const xml = Bpmn.export(
			Bpmn.createProcess("p")
				.startEvent("s")
				.endEvent("e")
				.eventSubProcess("es", (sub) =>
					sub
						.startEvent("es-s", {
							modelerTemplate: "tpl.sub",
							zeebeProperties: [{ name: "pn", value: "pv" }],
						})
						.endEvent("es-e"),
				)
				.build(),
		)
		expect(xml).toContain('zeebe:modelerTemplate="tpl.sub"')
		expect(xml).toContain('<zeebe:property name="pn" value="pv"')
	})
})
