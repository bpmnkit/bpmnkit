/**
 * Runs a Camunda process-test (CPT) file against a BPMN on reebe-wasm — what `casen test` does for
 * a `<name>.test.json` — for the comparison page's "tests" column.
 *
 * Needs `packages/engine` built and reebe-wasm built (`pnpm build:wasm`). Without them the result
 * is `unavailable`: the data script never turns a missing engine into a pass.
 */

/** @returns {{status: "pass"|"fail"|"unavailable", passed: number, total: number, failure: string|null}} */
export function summarizeReport(report) {
	const cases = report?.cases ?? []
	if (cases.length === 0)
		return { status: "unavailable", passed: 0, total: 0, failure: "no test cases ran" }
	const passed = cases.filter((c) => c.passed).length
	const bad = cases.find((c) => !c.passed)
	const f = bad?.failure
	const failure = f
		? f.index < 0
			? String(f.message).split("\n")[0]
			: `instruction ${f.index} (${f.type}): ${String(f.message).split("\n")[0]}`
		: null
	return { status: passed === cases.length ? "pass" : "fail", passed, total: cases.length, failure }
}

let engine
async function loadEngine() {
	engine ??= import("../../packages/engine/dist/cpt/index.js").catch((e) => ({ error: e }))
	return engine
}

export async function runCompareTests(bpmnXml, cases) {
	const mod = await loadEngine()
	if (mod.error) {
		return { status: "unavailable", passed: 0, total: 0, failure: "engine not built" }
	}
	try {
		return summarizeReport(await mod.runCptTestCases({ bpmn: bpmnXml, cases }))
	} catch (e) {
		const message = String(e instanceof Error ? e.message : e).split("\n")[0]
		// A missing wasm build is "unavailable"; a BPMN the engine rejects is a failed run.
		return /reebe-wasm/.test(message)
			? { status: "unavailable", passed: 0, total: 0, failure: "reebe-wasm not built" }
			: { status: "fail", passed: 0, total: 1, failure: message }
	}
}
