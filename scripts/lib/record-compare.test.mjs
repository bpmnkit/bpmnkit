import assert from "node:assert/strict"
import { test } from "node:test"
import {
	ROUTE_PANELS,
	buildPanel,
	createSseParser,
	nextRecordingName,
	parseArgs,
	validateMatrix,
} from "./record-compare.mjs"

const SCENARIOS = ["kyc", "loan-approval", "quote-to-cash"]

test("parseArgs reads flags and applies defaults", () => {
	const a = parseArgs(["--scenario", "quote-to-cash", "--dry-run"])
	assert.deepEqual(a, {
		scenario: "quote-to-cash",
		routes: ["raw-xml", "compact-json", "builder-script", "plan"],
		runs: 3,
		dryRun: true,
	})
	const b = parseArgs(["--scenario=kyc", "--routes=plan,raw-xml", "--runs=2"])
	assert.deepEqual(b.routes, ["plan", "raw-xml"])
	assert.equal(b.runs, 2)
	assert.equal(b.dryRun, false)
})

test("parseArgs rejects unknown flags", () => {
	assert.throws(() => parseArgs(["--scenario", "kyc", "--bogus"]), /Unknown argument/)
})

test("validateMatrix accepts the minimal matrix and counts runs", () => {
	const m = validateMatrix(parseArgs(["--scenario", "quote-to-cash"]), SCENARIOS)
	assert.equal(m.calls, 12)
})

test("validateMatrix names every problem", () => {
	const bad = { scenario: "nope", routes: ["plan", "plan", "xml"], runs: 0, dryRun: true }
	assert.throws(
		() => validateMatrix(bad, SCENARIOS),
		(e) =>
			/unknown scenario/i.test(e.message) &&
			/unknown route "xml"/i.test(e.message) &&
			/duplicate route "plan"/i.test(e.message) &&
			/--runs/.test(e.message),
	)
	assert.throws(() => validateMatrix({ ...bad, scenario: undefined }, SCENARIOS), /--scenario/)
})

test("every route maps to a distinct recording panel", () => {
	assert.equal(new Set(Object.values(ROUTE_PANELS)).size, Object.keys(ROUTE_PANELS).length)
	assert.equal(ROUTE_PANELS.plan, "plan")
	assert.equal(ROUTE_PANELS["compact-json"], "compact-json")
})

test("createSseParser handles events split across chunks", () => {
	const seen = []
	const feed = createSseParser((e) => seen.push(e))
	feed('event: chunk\ndata: {"text":"a')
	feed('b"}\n\nevent: done\ndata: {}\n\n')
	assert.deepEqual(seen, [
		{ event: "chunk", data: { text: "ab" } },
		{ event: "done", data: {} },
	])
})

test("buildPanel keeps the model id and the in/out split on success", () => {
	const panel = buildPanel({
		systemPrompt: "sys",
		chunks: [{ t: 1, text: "x" }],
		durationMs: 50,
		events: [
			{
				event: "bpmn",
				data: { xml: "<x/>", model: "m", usage: { inputTokens: 5, outputTokens: 2 } },
			},
		],
	})
	assert.deepEqual(panel.result, { type: "bpmn", xml: "<x/>" })
	assert.equal(panel.model, "m")
	assert.deepEqual(panel.usage, { inputTokens: 5, outputTokens: 2 })
})

test("buildPanel keeps a failed run as an error panel", () => {
	const panel = buildPanel({
		systemPrompt: "s",
		chunks: [],
		durationMs: 9,
		events: [{ event: "error", data: { message: "boom", model: "m", usage: null } }],
	})
	assert.deepEqual(panel.result, { type: "error", message: "boom" })
	assert.equal(panel.usage, null)
})

test("buildPanel records a stream that ended without a result as an error", () => {
	const panel = buildPanel({ systemPrompt: "s", chunks: [], durationMs: 1, events: [] })
	assert.equal(panel.result.type, "error")
})

test("nextRecordingName picks the first free suffix", () => {
	const taken = ["quote-to-cash-2026-11-06.json", "quote-to-cash-2026-11-06b.json"]
	assert.equal(nextRecordingName("quote-to-cash", "2026-11-06", []), "quote-to-cash-2026-11-06")
	assert.equal(nextRecordingName("quote-to-cash", "2026-11-06", taken), "quote-to-cash-2026-11-06c")
})
