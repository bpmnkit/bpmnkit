import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import { Bpmn, expand, parseProcessText } from "../src/index.js"

// guides/process-text-reference.md: every example is a ```bpmnkit-text block, rendered to a
// diagram when the site is built, followed by the ```typescript BPMN Kit Fluent code for it.
const PAGE = readFileSync(
	new URL(
		"../../../apps/landing/src/content/docs/guides/process-text-reference.md",
		import.meta.url,
	),
	"utf8",
)

function fences(lang: string): string[] {
	return [...PAGE.matchAll(new RegExp(`^\`\`\`${lang}\\n([\\s\\S]*?)^\`\`\``, "gm"))].map(
		(m) => m[1] as string,
	)
}

const TEXT = fences("bpmnkit-text")
const FLUENT = fences("typescript")

describe("BPMN Kit Text element reference page", () => {
	it("has an example for every element", () => {
		expect(TEXT.length).toBeGreaterThan(20)
		expect(FLUENT.length).toBe(TEXT.length)
	})

	it.each(TEXT.map((code, i) => [i, code.split("\n")[0], code] as const))(
		"text example %i (%s) parses with no problems and expands",
		(_i, _title, code) => {
			const { diagram, problems } = parseProcessText(code)
			expect(problems).toEqual([])
			expect(() => expand(diagram, { validate: false })).not.toThrow()
		},
	)

	it.each(FLUENT.map((code, i) => [i, code] as const))(
		"Fluent example %i builds and exports",
		(_i, code) => {
			// The snippets are plain JavaScript on purpose: they run as written.
			const build = new Function("Bpmn", `${code}\nreturn defs`) as (b: typeof Bpmn) => never
			expect(() => Bpmn.export(build(Bpmn))).not.toThrow()
		},
	)

	it("pairs each text example with a Fluent example of the same process", () => {
		FLUENT.forEach((code, i) => {
			const title = (TEXT[i] as string).split("\n")[0]?.replace(/^#\s*/, "")
			expect(code).toContain(`.name("${title}")`)
		})
	})
})
