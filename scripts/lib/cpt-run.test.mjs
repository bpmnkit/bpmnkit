import assert from "node:assert/strict"
import { existsSync, readFileSync } from "node:fs"
import { test } from "node:test"
import { runCompareTests, summarizeReport } from "./cpt-run.mjs"

test("summarizeReport counts passes and keeps the first failure's first line", () => {
	const s = summarizeReport({
		cases: [
			{ name: "a", passed: true },
			{
				name: "b",
				passed: false,
				failure: { index: 2, type: "COMPLETE_JOB", message: "no job\nmore" },
			},
		],
	})
	assert.deepEqual(s, {
		status: "fail",
		passed: 1,
		total: 2,
		failure: "instruction 2 (COMPLETE_JOB): no job",
	})
	assert.equal(summarizeReport({ cases: [{ name: "a", passed: true }] }).status, "pass")
})

test("an empty report is not a pass", () => {
	assert.equal(summarizeReport({ cases: [] }).status, "unavailable")
})

const root = new URL("../../", import.meta.url)
const engine = new URL("packages/engine/dist/cpt/index.js", root)
const wasm = new URL("apps/reebe-wasm/reebe_wasm_bg.wasm", root)
const ready =
	existsSync(engine) && existsSync(wasm) && existsSync(new URL("packages/core/dist/index.js", root))

// Needs a built engine and reebe-wasm (`pnpm build:wasm`); skipped, not faked, without them.
for (const scenario of ["kyc", "loan-approval", "quote-to-cash"]) {
	test(`reference ${scenario} passes its own committed test file`, { skip: !ready }, async () => {
		const ref = await import(new URL(`../compare/references/${scenario}.mjs`, import.meta.url).href)
		const cases = JSON.parse(
			readFileSync(new URL(`../compare/references/${scenario}.test.json`, import.meta.url), "utf8"),
		)
		const result = await runCompareTests(ref.default(), cases)
		assert.equal(result.status, "pass", result.failure)
	})
}

test("a broken diagram fails instead of passing", { skip: !ready }, async () => {
	const cases = JSON.parse(
		readFileSync(new URL("../compare/references/kyc.test.json", import.meta.url), "utf8"),
	)
	const result = await runCompareTests("<not-bpmn/>", cases)
	assert.notEqual(result.status, "pass")
})
