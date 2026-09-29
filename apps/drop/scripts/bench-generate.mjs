#!/usr/bin/env node
/**
 * Benchmarks describe-to-diagram against Workers AI models.
 *
 * Runs the golden prompts in scripts/eval-generation/prompts through the same
 * system prompt, stream reader and parser the Worker uses, and records how fast
 * the first shape and the whole diagram arrive, how many tokens and neurons it
 * cost, and how good the diagram is. See doc/drop-ai-generate-analysis.md §7.
 *
 *   CLOUDFLARE_ACCOUNT_ID=… CLOUDFLARE_API_TOKEN=… pnpm --filter @bpmnkit/drop bench:generate
 *
 * Options:
 *   --models a,b      model ids (default: the candidates below)
 *   --runs N          runs per model and prompt (default 1)
 *   --only 02,13      prompt directory prefixes to run
 *   --all             include the prompts skipped by default
 *   --no-extra        send no model-specific options (reasoning effort, thinking toggle)
 *   --max-tokens N    output cap (default 2048)
 *   --out DIR         where to write results (default bench-results/<timestamp>)
 *
 * CLOUDFLARE_API_BASE overrides https://api.cloudflare.com/client/v4, e.g. for
 * an AI Gateway URL or a local mock.
 *
 * Requires @bpmnkit/core to be built. Runs sequentially so timings are not
 * skewed by concurrent requests.
 */
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { parseArgs } from "node:util"
import { Bpmn, createProcessTextStream, expand, optimize } from "@bpmnkit/core"
import { createSseReader, generateMessages, readAiEvent } from "../src/lib/generate.ts"

const here = dirname(fileURLToPath(import.meta.url))
const PROMPTS_DIR = resolve(here, "../../../scripts/eval-generation/prompts")

/**
 * Candidate models, with the options that keep reasoning short, and neuron
 * rates per million tokens (in, out) from the Workers AI pricing page as of
 * 2026-09. Edit freely; an unknown model simply reports no neuron estimate.
 */
const MODELS = {
	"@cf/openai/gpt-oss-120b": { extra: { reasoning: { effort: "low" } }, rates: [31818, 68182] },
	"@cf/openai/gpt-oss-20b": { extra: { reasoning: { effort: "low" } }, rates: [18182, 27273] },
	"@cf/google/gemma-4-26b-a4b-it": {
		extra: { chat_template_kwargs: { enable_thinking: false } },
		rates: [9091, 27273],
	},
	"@cf/zai-org/glm-4.7-flash": {
		extra: { chat_template_kwargs: { enable_thinking: false } },
		rates: [5500, 36400],
	},
	"@cf/qwen/qwen3-30b-a3b-fp8": { extra: {}, rates: [4625, 30475] },
	"@cf/ibm-granite/granite-4.0-h-micro": { extra: {}, rates: [1542, 10158] },
}

/**
 * Not what describe-to-diagram does: 03 needs an AI-agent sub-process, 04 edits
 * an existing file, 09 expects a clarifying question instead of a diagram.
 */
const SKIPPED = ["03", "04", "09"]

const { values: args } = parseArgs({
	options: {
		models: { type: "string" },
		runs: { type: "string", default: "1" },
		only: { type: "string" },
		all: { type: "boolean", default: false },
		"no-extra": { type: "boolean", default: false },
		"max-tokens": { type: "string", default: "2048" },
		out: { type: "string" },
	},
})

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
const token = process.env.CLOUDFLARE_API_TOKEN
if (!accountId || !token) {
	console.error("Set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN (Workers AI Read + Edit).")
	process.exit(1)
}

const apiBase = (process.env.CLOUDFLARE_API_BASE ?? "https://api.cloudflare.com/client/v4").replace(
	/\/$/,
	"",
)
const models = args.models ? args.models.split(",").map((m) => m.trim()) : Object.keys(MODELS)
const runs = Number.parseInt(args.runs, 10)
const maxTokens = Number.parseInt(args["max-tokens"], 10)
const only = args.only?.split(",").map((p) => p.trim())
const outDir = resolve(
	args.out ?? `bench-results/${new Date().toISOString().replace(/[:.]/g, "-")}`,
)

async function loadPrompts() {
	const dirs = (await readdir(PROMPTS_DIR)).sort()
	const prompts = []
	for (const dir of dirs) {
		const prefix = dir.slice(0, 2)
		if (only ? !only.includes(prefix) : !args.all && SKIPPED.includes(prefix)) continue
		const text = (await readFile(join(PROMPTS_DIR, dir, "prompt.md"), "utf8")).trim()
		const expected = JSON.parse(await readFile(join(PROMPTS_DIR, dir, "expected.json"), "utf8"))
		prompts.push({ id: dir, text, assertions: expected.assertions ?? {} })
	}
	return prompts
}

/** Checks the assertions this feature can meet; connector job types are out of scope for v1. */
function score(defs, assertions) {
	const elements = defs.processes.flatMap((p) => p.flowElements)
	const types = new Set(elements.map((e) => e.type))
	const failed = []
	if (assertions.minElements !== undefined && elements.length < assertions.minElements) {
		failed.push(`${elements.length} < ${assertions.minElements} elements`)
	}
	for (const type of assertions.mustContainElementTypes ?? []) {
		if (!types.has(type)) failed.push(`no ${type}`)
	}
	return { elements: elements.length, failed }
}

async function runOne(model, prompt) {
	const config = MODELS[model] ?? { extra: {}, rates: undefined }
	const body = {
		messages: generateMessages(prompt.text),
		stream: true,
		max_tokens: maxTokens,
		...(args["no-extra"] ? {} : config.extra),
	}
	const url = `${apiBase}/accounts/${accountId}/ai/run/${model}`
	const t0 = performance.now()
	const since = () => Math.round(performance.now() - t0)
	const result = { model, prompt: prompt.id }

	let response
	try {
		response = await fetch(url, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
				// Same instance across a model's runs, so the fixed system prompt can hit the prefix cache.
				"x-session-affinity": `bench-generate-${model}`,
			},
			body: JSON.stringify(body),
			signal: AbortSignal.timeout(180_000),
		})
	} catch (error) {
		return { ...result, error: String(error) }
	}
	if (!response.ok || !response.body) {
		return { ...result, error: `HTTP ${response.status}: ${(await response.text()).slice(0, 500)}` }
	}

	const sse = createSseReader()
	const stream = createProcessTextStream()
	const decoder = new TextDecoder()
	let text = ""
	let reasoningChars = 0
	let usage
	for await (const bytes of response.body) {
		result.firstByteMs ??= since()
		for (const data of sse.push(decoder.decode(bytes, { stream: true }))) {
			const delta = readAiEvent(data)
			if (!delta) continue
			if (delta.reasoning) {
				result.firstReasoningMs ??= since()
				reasoningChars += delta.reasoning.length
			}
			if (delta.content) {
				result.firstContentMs ??= since()
				text += delta.content
				if (stream.push(delta.content)) result.firstShapeMs ??= since()
			}
			if (delta.usage) usage = delta.usage
		}
	}
	result.totalMs = since()
	result.text = text
	result.reasoningChars = reasoningChars
	result.usage = usage
	if (usage && config.rates) {
		const [inRate, outRate] = config.rates
		result.neurons = Math.round(
			(usage.promptTokens * inRate + usage.completionTokens * outRate) / 1_000_000,
		)
	}

	const parsed = stream.end()
	result.problems = parsed.problems
	result.fixes = parsed.fixes
	try {
		const defs = expand(parsed.diagram)
		result.xml = Bpmn.export(defs)
		const findings = optimize(defs).findings
		result.lintErrors = findings.filter((f) => f.severity === "error").map((f) => f.message)
		result.lintWarnings = findings.filter((f) => f.severity === "warning").length
		Object.assign(result, score(defs, prompt.assertions))
	} catch (error) {
		result.error = `expand: ${error.message}`
	}
	return result
}

const median = (xs) => {
	const s = xs.filter((x) => typeof x === "number").sort((a, b) => a - b)
	if (s.length === 0) return "–"
	const mid = Math.floor(s.length / 2)
	return s.length % 2 ? s[mid] : Math.round((s[mid - 1] + s[mid]) / 2)
}
const mean = (xs) => {
	const s = xs.filter((x) => typeof x === "number")
	return s.length ? (s.reduce((a, b) => a + b, 0) / s.length).toFixed(1) : "–"
}
const slug = (s) => s.replace(/[^\w.-]+/g, "_")

const prompts = await loadPrompts()
await mkdir(outDir, { recursive: true })
console.log(
	`${models.length} model(s) × ${prompts.length} prompt(s) × ${runs} run(s) → ${outDir}\n`,
)

const results = []
for (const model of models) {
	for (const prompt of prompts) {
		for (let run = 1; run <= runs; run++) {
			const r = { ...(await runOne(model, prompt)), run }
			results.push(r)
			const dir = join(outDir, slug(model))
			await mkdir(dir, { recursive: true })
			const base = join(dir, `${prompt.id}-${run}`)
			if (r.text !== undefined) await writeFile(`${base}.txt`, r.text)
			if (r.xml !== undefined) await writeFile(`${base}.bpmn`, r.xml)
			const verdict = r.error
				? `ERROR ${r.error.slice(0, 120)}`
				: `shape ${r.firstShapeMs ?? "–"}ms  total ${r.totalMs}ms  out ${r.usage?.completionTokens ?? "?"}tok  problems ${r.problems.length}  fixes ${r.fixes.length}  lint-errors ${r.lintErrors.length}${r.failed.length ? `  FAIL ${r.failed.join(", ")}` : ""}`
			console.log(`${model}  ${prompt.id}#${run}  ${verdict}`)
		}
	}
}

await writeFile(
	join(outDir, "results.json"),
	JSON.stringify(
		results.map(({ xml: _x, ...r }) => r),
		null,
		2,
	),
)

const rows = models.map((model) => {
	const rs = results.filter((r) => r.model === model)
	const ok = rs.filter((r) => !r.error)
	return [
		model,
		`${ok.length}/${rs.length}`,
		median(ok.map((r) => r.firstByteMs)),
		median(ok.map((r) => r.firstShapeMs)),
		median(ok.map((r) => r.totalMs)),
		median(ok.map((r) => r.usage?.promptTokens)),
		median(ok.map((r) => r.usage?.completionTokens)),
		median(
			ok.map(
				(r) =>
					r.usage?.reasoningTokens ?? (r.reasoningChars ? Math.round(r.reasoningChars / 4) : 0),
			),
		),
		mean(ok.map((r) => r.neurons)),
		`${ok.filter((r) => r.failed.length === 0).length}/${ok.length}`,
		mean(ok.map((r) => r.problems.length)),
		mean(ok.map((r) => r.fixes.length)),
		mean(ok.map((r) => r.lintErrors.length)),
	]
})
const header = [
	"model",
	"ok",
	"TTFB ms",
	"first shape ms",
	"total ms",
	"in tok",
	"out tok",
	"reasoning tok",
	"neurons",
	"assertions",
	"problems",
	"fixes",
	"lint errors",
]
const table = [
	`| ${header.join(" | ")} |`,
	`|${header.map(() => "---").join("|")}|`,
	...rows.map((r) => `| ${r.join(" | ")} |`),
].join("\n")
await writeFile(
	join(outDir, "summary.md"),
	`${table}\n\nMedians except neurons, problems, fixes and lint errors (means).\nReasoning tokens are estimated from characters when the model does not report them.\n`,
)
console.log(`\n${table}\n\nWrote ${join(outDir, "summary.md")} and results.json`)
