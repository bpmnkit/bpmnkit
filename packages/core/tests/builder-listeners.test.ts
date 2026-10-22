import { describe, expect, it } from "vitest"
import { applyBpmnOperations } from "../src/bpmn/full-operations.js"
import { getZeebeExtensions } from "../src/bpmn/utils.js"
import { Bpmn, analyzeCamundaCompat } from "../src/index.js"

const EXEC = [
	{ eventType: "start", type: "audit-start" },
	{ eventType: "end", type: "audit-end", retries: "5" },
]

function ext(xml: string, id: string) {
	const el = Bpmn.parse(xml).processes[0]?.flowElements.find((e) => e.id === id)
	return getZeebeExtensions(el?.extensionElements ?? [])
}

describe("builder listeners", () => {
	it("writes executionListeners on activities, events and gateways and reads them back", () => {
		const xml = Bpmn.export(
			Bpmn.createProcess("p")
				.startEvent("s", { executionListeners: EXEC })
				.serviceTask("svc", { name: "S", taskType: "w", executionListeners: EXEC })
				.exclusiveGateway("g", { executionListeners: EXEC })
				.endEvent("e", { executionListeners: EXEC })
				.build(),
		)
		expect(xml).toContain('<zeebe:executionListener eventType="start" type="audit-start"')
		expect(xml).toContain('retries="5"')
		for (const id of ["s", "svc", "g", "e"]) expect(ext(xml, id).executionListeners).toEqual(EXEC)
	})

	it("keeps the task definition next to the listeners on a service task", () => {
		const xml = Bpmn.export(
			Bpmn.createProcess("p")
				.startEvent("s")
				.serviceTask("svc", { name: "S", taskType: "w", executionListeners: EXEC })
				.endEvent("e")
				.build(),
		)
		expect(ext(xml, "svc").taskDefinition?.type).toBe("w")
	})

	it("writes taskListeners on a user task", () => {
		const xml = Bpmn.export(
			Bpmn.createProcess("p")
				.startEvent("s")
				.userTask("u", {
					zeebeUserTask: true,
					taskListeners: [{ eventType: "completing", type: "validate" }],
				})
				.endEvent("e")
				.build(),
		)
		expect(xml).toContain('<zeebe:taskListener eventType="completing" type="validate"')
		expect(ext(xml, "u").taskListeners).toEqual([{ eventType: "completing", type: "validate" }])
	})

	it("refuses taskListeners on a service task", () => {
		expect(() =>
			Bpmn.createProcess("p")
				.serviceTask("svc", { name: "S", taskType: "w", taskListeners: EXEC } as never)
				.build(),
		).toThrow(/zeebe:taskListeners/)
	})

	it("refuses a taskListeners patch on a service task", () => {
		const defs = Bpmn.createProcess("p")
			.startEvent("s")
			.serviceTask("svc", { name: "S", taskType: "w" })
			.endEvent("e")
			.build()
		expect(() =>
			applyBpmnOperations(defs, [{ op: "update", id: "svc", patch: { taskListeners: EXEC } }], {
				strict: true,
			}),
		).toThrow(/zeebe:taskListeners/)
	})

	it("replaces executionListeners wholesale through a patch", () => {
		const defs = Bpmn.createProcess("p")
			.startEvent("s")
			.serviceTask("svc", { name: "S", taskType: "w", executionListeners: EXEC })
			.endEvent("e")
			.build()
		const { definitions } = applyBpmnOperations(defs, [
			{ op: "update", id: "svc", patch: { executionListeners: [EXEC[0] as never] } },
		])
		const xml = Bpmn.export(definitions)
		expect(ext(xml, "svc").executionListeners).toEqual([EXEC[0]])
	})

	it("lets the camunda-compat listener rules fire on a builder-made diagram", () => {
		const xml = Bpmn.export(
			Bpmn.createProcess("p")
				.startEvent("s")
				.serviceTask("svc", {
					name: "S",
					taskType: "w",
					executionListeners: [
						{ eventType: "start", type: "same" },
						{ eventType: "start", type: "same" },
					],
				})
				.endEvent("e")
				.build(),
		)
		const findings = analyzeCamundaCompat(Bpmn.parse(xml), "8.7.0")
		expect(findings.map((f) => f.id)).toContain("compat/duplicate-execution-listeners")
	})
})
