import { readFileSync } from "node:fs"
import { Bpmn, expand, parseProcessText } from "@bpmnkit/core"
import { describe, expect, it } from "vitest"
import { scoreSpecAssertions } from "../../../scripts/eval-generation/assertions.mjs"
import { readiness } from "../src/lib/readiness.js"

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8")
const golden = JSON.parse(
	read("../../../scripts/eval-generation/prompts/28-ai-agent-chat-with-tools/expected.json"),
)
const bakeoff = Bpmn.parse(read("../../../packages/core/tests/fixtures/bakeoff/expected.bpmn"))
const draft = (text: string) => expand(parseProcessText(text).diagram)

describe("golden prompt 28 assertions", () => {
	it("hold for the bake-off reference file", () => {
		expect(scoreSpecAssertions(bakeoff, golden.assertions, readiness)).toEqual([])
	})

	it("name each thing a plain shape lacks", () => {
		const shape = draft("# P\nstart[start Go] > a[service Do it] > f[end Done]")
		const failed = scoreSpecAssertions(shape, golden.assertions, readiness)
		expect(failed).toEqual(
			expect.arrayContaining([
				"no element AI_Agent",
				"no form ai-agent-chat-initial-request",
				"no form ai-agent-chat-user-feedback",
				"no input target responseText",
				"no flow named Yes",
				"no flow named No",
				"0 < 3 annotations",
				"not ready: 1 steps need configuration",
			]),
		)
	})

	it("ignores keys it does not know and runs nothing for an empty set", () => {
		expect(scoreSpecAssertions(bakeoff, { minElements: 99 })).toEqual([])
	})

	it("matches annotations by text when given a list", () => {
		expect(
			scoreSpecAssertions(bakeoff, { mustContainAnnotations: ["your agent running"] }),
		).toEqual([])
		expect(scoreSpecAssertions(bakeoff, { mustContainAnnotations: ["nope"] })).toEqual([
			'no annotation "nope"',
		])
	})

	it("needs readiness() for mustBeReady", () => {
		expect(() => scoreSpecAssertions(bakeoff, { mustBeReady: true })).toThrow(/readiness/)
	})
})

describe("drop benchmark skip list", () => {
	it("runs 03 and 28 by default and still skips 04 and 09", () => {
		const source = read("../scripts/bench-generate.mjs")
		expect(source).toMatch(/const SKIPPED = \["04", "09"\]/)
	})
})
