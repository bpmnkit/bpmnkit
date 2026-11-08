import { readFileSync } from "node:fs"
import { Bpmn, expand, parseProcessText } from "@bpmnkit/core"
import { dryRun } from "@bpmnkit/engine/testing"
import { describe, expect, it } from "vitest"
import { dryRunVerdict } from "../src/lib/dry-run-verdict.js"

const expected = () =>
	Bpmn.parse(
		readFileSync(
			new URL("../../../packages/core/tests/fixtures/bakeoff/expected.bpmn", import.meta.url),
			"utf8",
		),
	)

describe("dryRunVerdict", () => {
	it("reports the bake-off loop as waiting for a person, not as a failure", async () => {
		const defs = expected()
		const verdict = dryRunVerdict(await dryRun(defs), defs)
		expect(verdict.kind).toBe("waits")
		expect(verdict.text).toMatch(/until a person answers/)
		expect(verdict.text).not.toMatch(/Infinite|✗/)
	})

	it("still calls a loop with no person in it a failure", () => {
		const defs = expand(parseProcessText("# P\ns[start Go] > a[task Work] > e[end Done]").diagram)
		const verdict = dryRunVerdict(
			{
				reachedEnd: false,
				path: ["s", "a"],
				stoppedAt: ["a"],
				connectors: [],
				error: "Infinite loop detected at element a (activated 101 times)",
			},
			defs,
		)
		expect(verdict.kind).toBe("bad")
		expect(verdict.text).toMatch(/^✗ stops at “Work”: Infinite loop/)
	})

	it("passes a run that reaches an end", async () => {
		const defs = expand(parseProcessText("# P\ns[start Go] > e[end Done]").diagram)
		const verdict = dryRunVerdict(await dryRun(defs), defs)
		expect(verdict).toEqual({ kind: "ok", text: "✓ runs to “Done”" })
	})
})
