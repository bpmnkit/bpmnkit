import { Bpmn, type CompactDiagram, assertDeployable, expand } from "@bpmnkit/core"
import { describe, expect, it } from "vitest"
import { ALL_PATTERNS } from "../src/index.js"
import { ALL_TEMPLATES, templateFiles } from "../src/templates/index.js"

describe("every template deploys on Camunda 8", () => {
	for (const template of ALL_TEMPLATES) {
		it(template.id, () => {
			// What `casen template use` writes, read back: the file a user deploys.
			const bpmn = templateFiles(template).find((f) => f.path === `${template.id}.bpmn`)
			expect(bpmn).toBeDefined()
			expect(() => assertDeployable(Bpmn.parse(bpmn?.content ?? ""))).not.toThrow()
		})
	}
})

describe("every pattern's compact template expands through the deploy gate", () => {
	for (const pattern of ALL_PATTERNS) {
		it(pattern.id, () => {
			// `PatternTemplate` is a subset of `CompactDiagram`; `expand` gates by default.
			expect(() => expand(pattern.template as CompactDiagram)).not.toThrow()
		})
	}
})
