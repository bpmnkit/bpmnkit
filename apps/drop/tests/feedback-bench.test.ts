import { readFileSync } from "node:fs"
import { Bpmn } from "@bpmnkit/core"
import { describe, expect, it } from "vitest"
import { type FeedbackCase, prepareFeedbackCase, scoreFeedback } from "../src/lib/feedback-bench.js"
import {
	FEEDBACK_SYSTEM_PROMPT,
	MAX_FEEDBACK_DIAGRAM_CHARS,
	MAX_FEEDBACK_ITEMS,
	createChangeLineFilter,
	feedbackMessages,
} from "../src/lib/feedback.js"
import { MAX_COMMENT_CHARS } from "../src/shared/comments.js"

const cases = JSON.parse(
	readFileSync(new URL("../scripts/feedback-cases.json", import.meta.url), "utf8"),
) as FeedbackCase[]

function load(c: FeedbackCase) {
	const defs = Bpmn.parse(readFileSync(new URL(`../../../${c.file}`, import.meta.url), "utf8"))
	return { defs, ...prepareFeedbackCase(c, defs) }
}

describe("feedback benchmark cases", () => {
	it("are what the route will accept", () => {
		expect(cases.length).toBeGreaterThanOrEqual(10)
		expect(new Set(cases.map((c) => c.id)).size).toBe(cases.length)
		for (const c of cases) {
			const { defs, text } = load(c)
			// Drawn in full, as a drop someone shared is: the applier needs the layout.
			const shapes = new Set(defs.diagrams[0]?.plane.shapes.map((s) => s.bpmnElement))
			for (const el of defs.processes[0]?.flowElements ?? []) {
				if (el.type !== "dataObject") expect(shapes.has(el.id), `${c.id} ${el.id}`).toBe(true)
			}
			expect(c.items.length, c.id).toBeLessThanOrEqual(MAX_FEEDBACK_ITEMS)
			expect(text.length, c.id).toBeLessThanOrEqual(MAX_FEEDBACK_DIAGRAM_CHARS)
			for (const item of c.items) expect(item.body.length).toBeLessThanOrEqual(MAX_COMMENT_CHARS)
		}
	})

	it.each(cases.map((c) => [c.id, c] as const))(
		"%s: the reference passes cleanly, and an answer that misses fails",
		(_id, c) => {
			const { defs, aliases } = load(c)
			const reference = scoreFeedback(c, defs, aliases, c.reference)
			expect(reference.failed).toEqual([])
			expect(reference.problems).toEqual([])
			expect(reference.newLintErrors).toEqual([])
			// A case nothing fails measures nothing. For one that asks for no change,
			// the answer that misses is one that changes something anyway.
			const miss = c.assertions.noChange ? "- start" : ""
			expect(scoreFeedback(c, defs, aliases, miss).failed, c.id).not.toEqual([])
		},
	)
})

describe("scoreFeedback", () => {
	const c = cases.find((x) => x.id === "03-remove-step") as FeedbackCase

	it("counts a change to an element no feedback is about as collateral", () => {
		const { defs, aliases } = load(c)
		const score = scoreFeedback(c, defs, aliases, "- notify\nreject[Decline order]\n@1")
		expect(score.collateral).toEqual(["reject"])
		expect(score.failed).toEqual(["collateral: reject"])
	})

	it("reports ids the answer made up", () => {
		const { defs, aliases } = load(c)
		const score = scoreFeedback(c, defs, aliases, "- notification_step\n@1")
		expect(score.problems).toEqual(['1: there is no "notification_step" to remove'])
		expect(score.failed).toContain('still "notification"')
	})
})

describe("feedbackMessages", () => {
	it("puts the diagram and numbered threads after the fixed prompt", () => {
		const messages = feedbackMessages(
			"a[start Go] > b[user Review] > c[end Done]",
			[
				{
					on: "b",
					label: "Review",
					author: "Anna",
					body: "Needs a\nsecond look",
					replies: [{ author: "Ben", body: "Agreed" }],
				},
				{ author: "Carla", body: "Fine otherwise" },
			],
			"keep it short",
		)
		expect(messages[0]).toEqual({ role: "system", content: FEEDBACK_SYSTEM_PROMPT })
		expect(messages[1]?.content).toBe(
			[
				"Diagram:\na[start Go] > b[user Review] > c[end Done]",
				'Feedback:\n1. On b ("Review") — Anna: Needs a second look\n   Reply from Ben: Agreed\n2. On the whole diagram — Carla: Fine otherwise',
				"Also: keep it short",
			].join("\n\n"),
		)
	})
})

describe("createChangeLineFilter", () => {
	it("passes paths, declarations, removals and @ lines, and nothing else", () => {
		const filter = createChangeLineFilter()
		const answer = [
			"Here is the change:",
			"review > second[user Second approval] > pay",
			"- notify",
			"- a > b",
			"@1 second",
			"```",
			"I removed the notification step.",
			"@2",
		].join("\n")
		const kept = filter.push(answer.slice(0, 40)) + filter.push(answer.slice(40)) + filter.end()
		expect(kept).toBe(
			"review > second[user Second approval] > pay\n- notify\n- a > b\n@1 second\n@2",
		)
	})
})
