import { readFileSync } from "node:fs"
import { Bpmn, expand, parseProcessText } from "@bpmnkit/core"
import { describe, expect, it } from "vitest"
import {
	scoreGolden,
	scoreSpecAssertions,
	specFailures,
	splitKnownGaps,
} from "../../../scripts/eval-generation/assertions.mjs"
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

describe("known plan gaps", () => {
	const shape = draft("# P\nstart[start Go] > f[end Done]")
	const failures = specFailures(shape, { mustContainFormIds: ["a", "b"] })

	it("separates listed misses from unlisted ones and names stale entries", () => {
		const gaps = [
			{ assertion: "mustContainFormIds", value: "a" },
			{ assertion: "mustContainFormIds", value: "zzz" },
		]
		const { known, unexpected, stale } = splitKnownGaps(failures, gaps)
		expect(known.map((f) => f.message)).toEqual(["no form a"])
		expect(unexpected.map((f) => f.message)).toEqual(["no form b"])
		expect(stale).toEqual([{ assertion: "mustContainFormIds", value: "zzz" }])
	})

	it("leaves prompt 28's list matching exactly what a plan-shaped diagram misses", () => {
		// A wrong form id in expected.json is not covered by the list, so it would fail the run
		const broken = { ...golden.assertions, mustContainFormIds: ["ai-agent-chat-user-feedbak"] }
		const { unexpected } = splitKnownGaps(
			specFailures(bakeoff, broken, readiness),
			golden.knownPlanGaps,
		)
		expect(unexpected.map((f) => f.message)).toEqual(["no form ai-agent-chat-user-feedbak"])
		expect(
			splitKnownGaps(specFailures(bakeoff, golden.assertions, readiness), golden.knownPlanGaps)
				.stale,
		).toHaveLength(4)
	})
})

describe("the bench's score", () => {
	it("scores the spec assertions, not only the old ones", () => {
		const shape = draft("# P\nstart[start Go] > a[service Do it] > f[end Done]")
		const { failed } = scoreGolden(shape, golden.assertions, readiness)
		expect(failed).toContain("no form ai-agent-chat-initial-request")
		expect(failed).toContain("no flow named Yes")
		expect(scoreGolden(bakeoff, golden.assertions, readiness).failed).toEqual([])
	})

	it("is what bench-generate.mjs calls", () => {
		expect(read("../scripts/bench-generate.mjs")).toMatch(
			/scoreGolden\(defs, assertions, readiness\)/,
		)
	})
})

describe("drop benchmark skip list", () => {
	it("runs 03 and 28 by default and still skips 04 and 09", () => {
		const source = read("../scripts/bench-generate.mjs")
		expect(source).toMatch(/const SKIPPED = \["04", "09"\]/)
	})
})
