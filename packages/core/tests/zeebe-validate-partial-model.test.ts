import { describe, expect, it } from "vitest"
import type { BpmnDefinitions } from "../src/bpmn/bpmn-model.js"
import { validateDeployable } from "../src/bpmn/zeebe-validate/index.js"

describe("validateDeployable on a partial model", () => {
	// The lint plugin hands over models without the root-element lists; the validator
	// used to throw "defs.messages is not iterable" on them.
	it("treats missing root-element lists as empty", () => {
		const partial = {
			diagrams: [],
			processes: [],
			unknownAttributes: {},
		} as unknown as BpmnDefinitions
		expect(() => validateDeployable(partial)).not.toThrow()
	})
})
