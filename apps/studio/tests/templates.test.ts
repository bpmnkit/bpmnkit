import { Bpmn, assertDeployable } from "@bpmnkit/core"
import { describe, expect, it } from "vitest"
import { PROCESS_TEMPLATES } from "../src/templates/index.js"

// The gallery's hand-written XML is opened and run as is, so each one must deploy.
describe("studio process templates deploy on Camunda 8", () => {
	it("has templates", () => {
		expect(PROCESS_TEMPLATES.length).toBeGreaterThan(0)
	})
	for (const template of PROCESS_TEMPLATES) {
		it(template.id, () => {
			expect(() => assertDeployable(Bpmn.parse(template.bpmn))).not.toThrow()
		})
	}
})
