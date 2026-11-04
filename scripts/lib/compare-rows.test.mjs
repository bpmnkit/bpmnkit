// Run with: node --test scripts/lib/compare-rows.test.mjs
import assert from "node:assert/strict"
import { test } from "node:test"
import { extractRows, medianBy, scenarioOf } from "./compare-rows.mjs"

const recording = {
	recordedAt: "2026-07-03T11:32:12.126Z",
	panels: {
		"with-sdk": {
			durationMs: 1000,
			usage: { inputTokens: 10, outputTokens: 20 },
			result: { type: "error", message: "tsx exited with code 1: /home/adam/x/y.ts:115\nstack" },
		},
		"without-sdk": { durationMs: 2000, result: { type: "bpmn", xml: "<x/>" } },
	},
}

test("scenario id comes from the file name when the recording has none", () => {
	assert.equal(scenarioOf("loan-approval-2026-07-01b.json"), "loan-approval")
	assert.equal(scenarioOf("quote-to-cash-2026-07-03.json"), "quote-to-cash")
})

test("one row per present panel; failures stay as rows with the first error line", () => {
	const rows = extractRows(recording, "kyc-2026-07-03.json")
	assert.deepEqual(rows.map((r) => r.route).sort(), ["builder-script", "raw-xml"])
	const failed = rows.find((r) => r.route === "builder-script")
	assert.equal(failed.xml, null)
	assert.equal(failed.error, "tsx exited with code 1")
	assert.equal(failed.outputTokens, 20)
	const ok = rows.find((r) => r.route === "raw-xml")
	assert.equal(ok.xml, "<x/>")
	assert.equal(ok.inputTokens, null)
	assert.equal(ok.scenario, "kyc")
	assert.equal(ok.runId, "kyc-2026-07-03")
})

test("median is the lower median, skips nulls and is stable on ties", () => {
	const items = [
		{ runId: "c", v: 3 },
		{ runId: "a", v: 1 },
		{ runId: "b", v: 2 },
		{ runId: "d", v: null },
	]
	assert.equal(medianBy(items, "v").runId, "b")
	assert.equal(
		medianBy(
			[
				{ runId: "a", v: 1 },
				{ runId: "b", v: 2 },
			],
			"v",
		).runId,
		"a",
	)
	assert.equal(medianBy([], "v"), null)
})
