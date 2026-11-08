/**
 * Records the same-input comparison matrix (scenario × routes × runs) through the demo server,
 * one recording file per run holding one panel per route, in `apps/demo/recordings/`.
 *
 * REAL LLM CALLS: needs the `claude` CLI signed in and costs API money. Check the matrix first:
 *
 *   node scripts/record-compare.mjs --scenario quote-to-cash --dry-run
 *
 * The dry run validates scenario, routes and runs, builds every system prompt, prints the plan
 * and writes nothing (no server, no key). Minimal matrix (quote-to-cash × 4 routes × 3 runs = 12):
 *
 *   pnpm --filter @bpmnkit/demo dev:server   # separate terminal, needs `claude` on PATH
 *   node scripts/record-compare.mjs --scenario quote-to-cash --routes raw-xml,compact-json,builder-script,plan --runs 3
 *
 * Then `node scripts/build-compare-data.mjs` and commit the new recordings and generated data.
 * Recordings are ~1.4 MB per run: do not print them.
 */
import { readdirSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import {
	ROUTE_ENDPOINTS,
	ROUTE_PANELS,
	ROUTE_PROMPT_KEYS,
	buildPanel,
	createSseParser,
	nextRecordingName,
	parseArgs,
	validateMatrix,
} from "./lib/record-compare.mjs"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const recordingsDir = join(root, "apps/demo/recordings")
const SERVER = process.env.DEMO_SERVER ?? "http://localhost:3001"

// Node strips the types of these two dependency-free files; the server's own modules stay untouched.
const { SCENARIOS, getScenario } = await import("../apps/demo/server/scenarios.ts")
const prompts = await import("../apps/demo/server/system-prompt.ts")

/** The system prompts without a running server (what `GET /prompts` returns). */
function localPrompts() {
	return {
		withoutSdk: prompts.WITHOUT_SDK_SYSTEM_PROMPT,
		withSdk: prompts.buildSdkSystemPrompt(root),
		withSdkCompact: prompts.buildCompactSystemPrompt(root),
		compactJson: prompts.buildCompactJsonSystemPrompt(root),
		plan: prompts.buildPlanSystemPrompt(root),
	}
}

async function streamRoute(route, scenarioId, systemPrompt) {
	const res = await fetch(`${SERVER}${ROUTE_ENDPOINTS[route]}?scenario=${scenarioId}`)
	if (!res.ok || !res.body) throw new Error(`${route}: server answered ${res.status}`)
	const events = []
	const chunks = []
	const startedAt = Date.now()
	const feed = createSseParser((e) => {
		events.push(e)
		if (e.event === "chunk") chunks.push({ t: Date.now() - startedAt, text: e.data?.text ?? "" })
	})
	const decoder = new TextDecoder()
	for await (const part of res.body) feed(decoder.decode(part, { stream: true }))
	return buildPanel({ systemPrompt, chunks, durationMs: Date.now() - startedAt, events })
}

const args = parseArgs(process.argv.slice(2))
let calls
try {
	;({ calls } = validateMatrix(
		args,
		SCENARIOS.map((s) => s.id),
	))
} catch (e) {
	console.error(e.message)
	process.exit(1)
}
const scenario = getScenario(args.scenario)
const systemPrompts = localPrompts()

console.log(
	`${args.scenario}: ${args.routes.length} routes (${args.routes.join(", ")}) × ${args.runs} runs = ${calls} LLM calls`,
)
for (const r of args.routes) {
	const p = systemPrompts[ROUTE_PROMPT_KEYS[r]]
	if (!p) throw new Error(`route ${r}: empty system prompt`)
	console.log(
		`  ${r.padEnd(15)} panel=${ROUTE_PANELS[r].padEnd(16)} system prompt ${p.length} chars`,
	)
}
console.log(`  user prompt ${scenario.prompt.length} chars`)

if (args.dryRun) {
	console.log("dry run: nothing recorded, nothing written")
	process.exit(0)
}

const health = await fetch(`${SERVER}/health`).catch(() => null)
if (!health?.ok)
	throw new Error(`Demo server not reachable at ${SERVER}; start it first (see header)`)
// Use the server's prompts: they are what the model actually saw.
const livePrompts = await (await fetch(`${SERVER}/prompts`)).json()

const date = new Date().toISOString().slice(0, 10)
for (let run = 1; run <= args.runs; run++) {
	const panels = {}
	for (const route of args.routes) {
		console.log(`run ${run}/${args.runs}: ${route}`)
		panels[ROUTE_PANELS[route]] = await streamRoute(
			route,
			scenario.id,
			livePrompts[ROUTE_PROMPT_KEYS[route]] ?? "",
		)
	}
	const name = nextRecordingName(scenario.id, date, readdirSync(recordingsDir))
	const res = await fetch(`${SERVER}/recordings`, {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify({
			name,
			recordedAt: new Date().toISOString(),
			scenarioId: scenario.id,
			scenarioPrompt: scenario.prompt,
			panels,
		}),
	})
	if (!res.ok) throw new Error(`saving ${name}: server answered ${res.status}`)
	console.log(`saved ${name}`)
}
console.log("Next: node scripts/build-compare-data.mjs")
