/**
 * Builds the data behind `apps/landing/src/pages/compare/same-input.astro`: scores every run in
 * `apps/demo/recordings/*.json` and the hand-authored reference (`scripts/compare/references/`)
 * with `scripts/lib/closeness.mjs`, and writes one JSON per scenario plus a static SVG per route
 * (median-closeness run) and for the reference to `apps/landing/src/generated/compare/`.
 * Outputs are committed so CI never needs a recording or an LLM. No XML or recording is copied.
 *
 * Requires a core build: `pnpm --filter @bpmnkit/core build`.
 * Run: `node scripts/build-compare-data.mjs`
 */
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"
import { Bpmn, checkDiCompleteness, exportSvg, lintDiagram } from "../packages/core/dist/index.js"
import { scoreCloseness } from "./lib/closeness.mjs"
import { ROUTES, extractRows, medianBy } from "./lib/compare-rows.mjs"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const recordingsDir = join(root, "apps/demo/recordings")
const outDir = join(root, "apps/landing/src/generated/compare")

// The recording server (apps/demo/server/index.ts) passes this model to `claude -p`; the
// recordings themselves do not store it, so it is the server's setting, not a per-file fact.
const MODEL = "claude-opus-4-8"

const round1 = (n) => Math.round(n * 10) / 10

function metrics(xml, referenceXml) {
	let defs
	try {
		defs = Bpmn.parse(xml)
	} catch {
		return { parses: false, diComplete: null, lintErrors: null, closeness: null, defs: null }
	}
	const di = checkDiCompleteness(defs)
	const lint = lintDiagram(defs)
	let closeness = null
	try {
		closeness = scoreCloseness(xml, referenceXml).total
	} catch {
		// Parses but cannot be scored (e.g. no process): leave closeness empty rather than 0.
	}
	return {
		parses: true,
		diComplete: di.missingShapes.length === 0 && di.missingEdges.length === 0,
		lintErrors: lint.counts.error ?? 0,
		closeness,
		defs,
	}
}

function median(nums) {
	const s = nums.filter((n) => n != null).sort((a, b) => a - b)
	return s.length ? s[Math.floor((s.length - 1) / 2)] : null
}

export async function build() {
	const rows = []
	const prompts = {}
	for (const f of readdirSync(recordingsDir).filter((n) => n.endsWith(".json"))) {
		const rec = JSON.parse(readFileSync(join(recordingsDir, f), "utf8"))
		for (const row of extractRows(rec, f)) {
			rows.push(row)
			prompts[row.scenario] ??= rec.scenarioPrompt
		}
	}
	rmSync(outDir, { recursive: true, force: true })

	for (const scenario of Object.keys(prompts).sort()) {
		const refModule = await import(
			pathToFileURL(join(root, "scripts/compare/references", `${scenario}.mjs`)).href
		)
		const t0 = performance.now()
		const referenceXml = refModule.default()
		const referenceMs = Math.round(performance.now() - t0)
		const ref = metrics(referenceXml, referenceXml)

		const scoped = rows
			.filter((r) => r.scenario === scenario)
			.map((r) => {
				const m = r.xml
					? metrics(r.xml, referenceXml)
					: { parses: false, diComplete: null, lintErrors: null, closeness: null, defs: null }
				const { xml, ...rest } = r
				return { ...rest, ...m, svgSource: m.defs, defs: undefined }
			})
		const dir = join(outDir, scenario)
		mkdirSync(dir, { recursive: true })
		writeFileSync(join(dir, "reference.svg"), exportSvg(ref.defs))

		const routes = {}
		for (const route of Object.values(ROUTES)) {
			const runs = scoped.filter((r) => r.route === route)
			if (!runs.length) continue
			const featured = medianBy(runs, "closeness")
			if (featured) writeFileSync(join(dir, `${route}.svg`), exportSvg(featured.svgSource))
			const closeness = runs.map((r) => r.closeness).filter((c) => c != null)
			routes[route] = {
				runs: runs.length,
				parsed: runs.filter((r) => r.parses).length,
				diComplete: runs.filter((r) => r.diComplete).length,
				zeroLintErrors: runs.filter((r) => r.parses && r.lintErrors === 0).length,
				featuredRunId: featured?.runId ?? null,
				closenessMedian: median(closeness),
				closenessBest: closeness.length ? Math.max(...closeness) : null,
				closenessWorst: closeness.length ? Math.min(...closeness) : null,
				durationMsMedian: median(runs.map((r) => r.durationMs)),
				inputTokensMedian: median(runs.map((r) => r.inputTokens)),
				outputTokensMedian: median(runs.map((r) => r.outputTokens)),
			}
		}
		const out = {
			scenario,
			prompt: prompts[scenario],
			model: MODEL,
			reference: {
				durationMs: referenceMs,
				parses: ref.parses,
				diComplete: ref.diComplete,
				lintErrors: ref.lintErrors,
				closeness: ref.closeness,
			},
			routes,
			runs: scoped
				.map(({ svgSource, defs, ...r }) => ({
					...r,
					closeness: r.closeness == null ? null : round1(r.closeness),
				}))
				.sort((a, b) => a.route.localeCompare(b.route) || a.runId.localeCompare(b.runId)),
		}
		writeFileSync(join(outDir, `${scenario}.json`), `${JSON.stringify(out, null, "\t")}\n`)
		console.log(
			scenario,
			JSON.stringify(
				Object.fromEntries(Object.entries(routes).map(([k, v]) => [k, v.closenessMedian])),
			),
		)
	}
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) await build()
