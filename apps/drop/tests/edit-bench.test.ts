import { readFileSync } from "node:fs"
import { parseProcessText } from "@bpmnkit/core"
import { describe, expect, it } from "vitest"
import { type EditCase, scoreEdit } from "../src/lib/edit-bench.js"
import { MAX_CHANGE_CHARS, MAX_DIAGRAM_CHARS, MIN_CHANGE_CHARS } from "../src/lib/generate.js"

const cases = JSON.parse(
	readFileSync(new URL("../scripts/edit-cases.json", import.meta.url), "utf8"),
) as EditCase[]

describe("edit benchmark cases", () => {
	it("are what the route accepts", () => {
		expect(cases.length).toBeGreaterThanOrEqual(10)
		for (const c of cases) {
			expect(c.change.length, c.id).toBeGreaterThanOrEqual(MIN_CHANGE_CHARS)
			expect(c.change.length, c.id).toBeLessThanOrEqual(MAX_CHANGE_CHARS)
			expect(c.diagram.length, c.id).toBeLessThanOrEqual(MAX_DIAGRAM_CHARS)
		}
	})

	it.each(cases.map((c) => [c.id, c] as const))(
		"%s: the draft fails, the reference passes and keeps what it must",
		(_id, c) => {
			const draft = parseProcessText(c.diagram)
			const reference = parseProcessText(c.reference)
			expect(draft.problems).toEqual([])
			expect(reference.problems).toEqual([])
			// A case the unchanged draft already passes measures nothing.
			expect(scoreEdit(draft.diagram, draft.diagram, c.assertions).failed).not.toEqual([])
			expect(scoreEdit(draft.diagram, reference.diagram, c.assertions).failed).toEqual([])
		},
	)
})

describe("scoreEdit", () => {
	const draft = parseProcessText(
		"s[start Go] > a[task Check order] > b[user Ship order] > e[end Done]",
	).diagram

	it("counts what a change kept, added and removed", () => {
		const answer = parseProcessText(
			"s[start Go] > a[task Check order] > c[service Bill customer] > e[end Done]",
		).diagram
		expect(scoreEdit(draft, answer, {})).toEqual({ failed: [], kept: 0.75, added: 1, removed: 1 })
	})

	it("counts an element whose type changed as removed", () => {
		const answer = parseProcessText(
			"s[start Go] > a[task Check order] > b[service Ship order] > e[end Done]",
		).diagram
		const score = scoreEdit(draft, answer, { keepIds: ["b"] })
		expect(score.failed).toEqual(["lost b"])
		expect(score.removed).toBe(1)
	})
})
