import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import { resolveBpmnlintConfig } from "../src/bpmn/bpmnlint.js"
import { NATIVE_BPMNLINT_RULES } from "../src/bpmn/optimize/bpmnlint-rules.js"

// spec/lint-rules.json is the single source for bpmnlint rule metadata (pnpm spec:gen).
const spec = JSON.parse(
	fs.readFileSync(
		path.join(path.dirname(fileURLToPath(import.meta.url)), "../../../spec/lint-rules.json"),
		"utf8",
	),
) as {
	rules: { name: string; category?: string }[]
	nativeOrder: string[]
	presets: Record<string, Record<string, string>>
}

describe("spec/lint-rules.json", () => {
	it("lists exactly the natively implemented rules, in check order", () => {
		expect([...NATIVE_BPMNLINT_RULES]).toEqual(spec.nativeOrder)
		const categorised = spec.rules.filter((r) => r.category !== undefined).map((r) => r.name)
		expect([...categorised].sort()).toEqual([...NATIVE_BPMNLINT_RULES].sort())
	})

	it("drives the presets, with `all` derived from every rule", () => {
		const names = spec.rules.map((r) => r.name)
		expect(Object.keys(spec.presets.recommended).every((n) => names.includes(n))).toBe(true)
		for (const preset of ["correctness", "recommended"]) {
			const { rules } = resolveBpmnlintConfig({ extends: `bpmnlint:${preset}` })
			expect(Object.entries(rules).map(([n, s]) => [n, s.severity])).toEqual(
				Object.entries(spec.presets[preset] ?? {}),
			)
		}
		const all = resolveBpmnlintConfig({ extends: "bpmnlint:all" }).rules
		expect(Object.keys(all)).toEqual(names)
		expect(new Set(Object.values(all).map((s) => s.severity))).toEqual(new Set(["error"]))
	})
})
