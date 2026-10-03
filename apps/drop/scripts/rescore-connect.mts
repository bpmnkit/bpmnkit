/**
 * Re-scores the connect pass of a `bench:generate --connect` run without a model:
 * each recorded answer (the raw one where the run kept it) is applied again with
 * the current line filter, card selection,
 * resolver and node matching, and scored on every assertion of its prompt, as
 * bench:generate scores it. What changes is what the code changed, not the model.
 *
 *   pnpm --filter @bpmnkit/drop bench:rescore bench-results/<run>/results.json
 *
 * Requires @bpmnkit/core to be built.
 */
import { readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { Bpmn, expand, parseProcessText, writeProcessText } from "@bpmnkit/core"
import { connectorLineFor, selectConnectors } from "@bpmnkit/core/connectors"
import {
	connectApis,
	connectTasks,
	createConnectLineFilter,
	finishConnect,
} from "../src/lib/connect.ts"

interface Result {
	prompt: string
	run?: number
	text: string
	failed: string[]
	connect?: { skipped?: boolean; lines?: string; raw?: string }
}

const file = process.argv[2]
if (!file) {
	console.error("Usage: bench:rescore <results.json>")
	process.exit(1)
}
const PROMPTS = resolve(
	dirname(fileURLToPath(import.meta.url)),
	"../../../scripts/eval-generation/prompts",
)
const raw = JSON.parse(readFileSync(resolve(file), "utf8")) as Result[] | { results: Result[] }
const results = Array.isArray(raw) ? raw : raw.results

let before = 0
let after = 0
for (const result of results) {
	const passed = result.failed.length === 0
	before += passed ? 1 : 0
	if (!result.connect || result.connect.skipped) {
		after += passed ? 1 : 0
		continue
	}
	const request = readFileSync(resolve(PROMPTS, result.prompt, "prompt.md"), "utf8")
	const expected = JSON.parse(
		readFileSync(resolve(PROMPTS, result.prompt, "expected.json"), "utf8"),
	)
	const assertions = (expected.assertions ?? {}) as {
		minElements?: number
		mustContainElementTypes?: string[]
		mustContainAnyOf?: string[][]
		mustContainTaskTypes?: string[]
		mustCallUrls?: string[]
	}
	const defs = expand(parseProcessText(result.text).diagram)
	const { aliases } = writeProcessText(defs, { connectorLine: connectorLineFor })
	const tasks = connectTasks(defs, aliases)
	const apis = await connectApis(request, tasks)
	const selection = selectConnectors({ text: request, tasks }, { apis })
	// The raw answer, where the run kept it, goes through today's line filter too
	let lines = result.connect.lines ?? ""
	if (result.connect.raw !== undefined) {
		const filter = createConnectLineFilter()
		lines = filter.push(result.connect.raw) + filter.end()
	}
	const done = finishConnect(defs, aliases, lines, apis, selection)
	const elements = Bpmn.parse(done.xml).processes.flatMap((p) => p.flowElements)
	const elementTypes = new Set<string>(elements.map((e) => e.type))
	const ext = elements.flatMap((e) => e.extensionElements)
	const types = new Set(
		ext.filter((x) => x.name === "zeebe:taskDefinition").map((x) => x.attributes.type),
	)
	const urls = ext
		.filter((x) => x.name === "zeebe:ioMapping")
		.flatMap((x) => x.children)
		.filter((c) => c.attributes.target === "url")
		.map((c) => c.attributes.source ?? "")
	// Every assertion bench:generate scores, so a pass here is a pass there
	const failed = [
		...(assertions.minElements !== undefined && elements.length < assertions.minElements
			? [`${elements.length} < ${assertions.minElements} elements`]
			: []),
		...(assertions.mustContainElementTypes ?? [])
			.filter((t) => !elementTypes.has(t))
			.map((t) => `no ${t}`),
		...(assertions.mustContainAnyOf ?? [])
			.filter((any) => !any.some((t) => elementTypes.has(t)))
			.map((any) => `no ${any.join(" or ")}`),
		...(assertions.mustContainTaskTypes ?? []).filter((t) => !types.has(t)).map((t) => `no ${t}`),
		...(assertions.mustCallUrls ?? [])
			.filter((u) => !urls.some((url) => url.includes(u)))
			.map((u) => `no call to ${u}`),
	]
	after += failed.length === 0 ? 1 : 0
	if (!passed || failed.length > 0) {
		console.log(
			`${result.prompt} run ${result.run ?? "?"}: ${passed ? "pass" : "fail"} → ${failed.length === 0 ? "pass" : `fail (${failed.join(", ")})`}`,
		)
	}
}
console.log(`\nrecorded answers passing: ${before}/${results.length} → ${after}/${results.length}`)
