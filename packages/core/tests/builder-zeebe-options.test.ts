import { describe, expect, it } from "vitest"
import { getZeebeExtensions } from "../src/bpmn/utils.js"
import { Bpmn, analyzeCamundaCompat } from "../src/index.js"

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

	it("keeps a multi-instance completion condition", () => {
		const process = Bpmn.parse(
			Bpmn.export(
				Bpmn.createProcess("p")
					.startEvent("s")
					.subProcess("sub", (inner) => inner.startEvent("is").endEvent("ie"), {
						multiInstance: {
							collection: "=items",
							elementVariable: "item",
							completionCondition: "=approved",
						},
					})
					.endEvent("e")
					.build(),
			),
		).processes[0]
		const sub = process?.flowElements.find((element) => element.id === "sub")
		const loop = sub && "loopCharacteristics" in sub ? sub.loopCharacteristics : undefined
		expect(loop?.completionCondition?.text).toBe("=approved")
	})
	describe("call activity options", () => {
		function callActivity(options: Record<string, unknown>, version = "8.7.0") {
			const xml = Bpmn.export(
				Bpmn.createProcess("p")
					.startEvent("s")
					.callActivity("c", { processId: "child", ...options } as never)
					.endEvent("e")
					.build(),
			).replace(
				"<bpmn:definitions ",
				`<bpmn:definitions xmlns:modeler="http://camunda.org/schema/modeler/1.0" modeler:executionPlatform="Camunda Cloud" modeler:executionPlatformVersion="${version}" `,
			)
			const defs = Bpmn.parse(xml)
			const el = defs.processes[0]?.flowElements.find((e) => e.id === "c")
			const ext = getZeebeExtensions(el?.extensionElements)
			return { xml, defs, ext }
		}
		const ids = (defs: ReturnType<typeof Bpmn.parse>, version: string) =>
			analyzeCamundaCompat(defs, version).map((f) => f.id)

		it("writes ioMapping", () => {
			const { xml, ext } = callActivity({
				ioMapping: {
					inputs: [{ source: "=a", target: "b" }],
					outputs: [{ source: "=c", target: "d" }],
				},
			})
			expect(xml).toContain("<zeebe:input")
			expect(xml).toContain("<zeebe:output")
			expect(ext.ioMapping?.inputs).toEqual([{ source: "=a", target: "b" }])
			expect(ext.ioMapping?.outputs).toEqual([{ source: "=c", target: "d" }])
		})

		it("never emits taskHeaders, which the schema forbids on a call activity", () => {
			const { xml } = callActivity({ taskHeaders: { k: "v" } })
			expect(xml).not.toContain("zeebe:taskHeaders")
		})

		it("writes zeebeProperties", () => {
			const { xml, ext } = callActivity({ zeebeProperties: [{ name: "n", value: "v" }] })
			expect(xml).toContain("<zeebe:property")
			expect(ext.properties?.properties).toEqual([{ name: "n", value: "v" }])
		})

		it("writes propagateAllParentVariables and keeps propagateAllChildVariables", () => {
			const { xml, ext, defs } = callActivity({
				propagateAllParentVariables: false,
				propagateAllChildVariables: false,
			})
			expect(xml).toContain('propagateAllParentVariables="false"')
			expect(xml).toContain('propagateAllChildVariables="false"')
			expect(ext.calledElement?.propagateAllParentVariables).toBe(false)
			expect(ext.calledElement?.propagateAllChildVariables).toBe(false)
			expect(ids(defs, "8.7")).not.toContain("compat/no-propagate-all-parent-variables")
			expect(ids(defs, "8.1")).toContain("compat/no-propagate-all-parent-variables")
		})

		it("writes bindingType", () => {
			const { xml, ext, defs } = callActivity({ bindingType: "deployment" })
			expect(xml).toContain('bindingType="deployment"')
			expect(ext.calledElement?.bindingType).toBe("deployment")
			expect(ids(defs, "8.5")).toContain("compat/no-binding-type")
			expect(ids(defs, "8.7")).not.toContain("compat/no-binding-type")
		})

		it("writes versionTag", () => {
			const { xml, ext } = callActivity({ bindingType: "versionTag", versionTag: "v1" })
			expect(xml).toContain('versionTag="v1"')
			expect(ext.calledElement?.versionTag).toBe("v1")
		})
	})
})
