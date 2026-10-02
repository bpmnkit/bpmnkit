import { Bpmn } from "@bpmnkit/core"
import { describe, expect, it } from "vitest"
import { getTemplate } from "../src/index.js"

/**
 * `Bpmn.restConnector()` in core stamps the HTTP connector template without
 * being able to import this package. An editor matches the stamp by id and
 * version, so the two must agree with the bundled template.
 */
describe("core restConnector() stamp", () => {
	it("names the bundled HTTP connector template and its version", () => {
		const task = Bpmn.createProcess("p")
			.startEvent("s")
			.restConnector("call", { method: "GET", url: "https://example.com" })
			.endEvent("e")
			.build()
			.processes[0]?.flowElements.find((e) => e.id === "call")
		const id = task?.unknownAttributes["zeebe:modelerTemplate"] ?? ""
		const template = getTemplate(id)

		expect(template).toBeDefined()
		expect(task?.unknownAttributes["zeebe:modelerTemplateVersion"]).toBe(String(template?.version))
	})
})
