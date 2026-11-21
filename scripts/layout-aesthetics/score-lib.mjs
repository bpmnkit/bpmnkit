/**
 * Corpus scoring for the layout engine: lays out every case and measures it with metrics.mjs.
 * Compiler functions are injected so the CLI script (tsx) and the vitest ratchet share one code path.
 *
 * Case kinds in a folder:
 *   NAME.txt          `bpmnkit build` text spec, laid out with applyAutoLayout
 *   NAME.edit.mjs     paired with NAME.txt: the base is laid out, then the edit is applied the way `bpmnkit build --edit` does
 *   NAME.bpmn         existing model; any DI is discarded, then laid out
 */
import { existsSync, readFileSync, readdirSync } from "node:fs"
import { basename, join, resolve } from "node:path"
import { pathToFileURL } from "node:url"
import * as core from "../../packages/core/dist/index.js"
import { COUNTS, HIGHER_IS_BETTER, NEUTRAL, measure } from "./metrics.mjs"

const { Bpmn, applyAutoLayout, makeRoom, placeNewShapes } = core

export function discover(dir) {
	const root = resolve(dir)
	const names = readdirSync(root).sort()
	const cases = []
	for (const f of names) {
		if (f.endsWith(".txt")) {
			const stem = basename(f, ".txt")
			const edit = `${stem}.edit.mjs`
			cases.push({
				name: stem,
				kind: names.includes(edit) ? "edit" : "text",
				file: join(root, f),
				edit: names.includes(edit) ? join(root, edit) : undefined,
			})
		} else if (f.endsWith(".bpmn")) {
			cases.push({ name: basename(f, ".bpmn"), kind: "bpmn", file: join(root, f) })
		}
	}
	return cases
}

function stripDi(defs) {
	defs.diagrams = []
	return defs
}

/** @param deps {{ compileTextSpec, keyThrownMessages, dropRewiredEdges }} from apps/cli build */
export async function layoutCase(c, deps, engine = "semantic") {
	const lay = (defs) => applyAutoLayout(defs, engine)
	if (c.kind === "bpmn") return lay(stripDi(Bpmn.parse(readFileSync(c.file, "utf8"))))
	const built = deps.compileTextSpec(readFileSync(c.file, "utf8"))
	if (built.problems.length > 0) throw new Error(`spec problems: ${built.problems.join("; ")}`)
	deps.keyThrownMessages(built.definitions)
	const base = lay(stripDi(built.definitions))
	if (c.kind === "text") return base
	const xml = Bpmn.export(base, { validate: false })
	const before = Bpmn.parse(xml)
	const mod = await import(`${pathToFileURL(c.edit).href}?t=${Date.now()}`)
	let value = mod.default
	if (typeof value === "function") value = await value(core, Bpmn.parse(xml))
	if (value && typeof value.build === "function") value = value.build()
	deps.dropRewiredEdges(value, before)
	return placeNewShapes(makeRoom(value).definitions).definitions
}

export async function scoreDir(dir, deps, { engine = "semantic" } = {}) {
	const cases = {}
	const errors = {}
	for (const c of discover(dir)) {
		try {
			cases[c.name] = measure(await layoutCase(c, deps, engine))
		} catch (err) {
			errors[c.name] = err instanceof Error ? err.message : String(err)
		}
	}
	return { cases, errors, aggregate: aggregate(cases) }
}

export function aggregate(cases) {
	const rows = Object.values(cases)
	const out = {}
	if (rows.length === 0) return out
	for (const k of Object.keys(rows[0])) {
		const sum = rows.reduce((a, r) => a + r[k], 0)
		out[k] = +(sum / rows.length).toFixed(2)
	}
	return out
}

/** Is `now` worse than `was` for metric `k`? Counts allow no slack; everything else 1 %. */
export function isWorse(k, was, now) {
	if (NEUTRAL.has(k)) return false
	const slack = COUNTS.has(k) ? 0 : Math.abs(was) * 0.01
	return HIGHER_IS_BETTER.has(k) ? now < was - slack : now > was + slack
}

/** Every (case, metric) that got worse than the baseline, plus cases the baseline does not know. */
export function regressions(baseline, current) {
	const worse = []
	const missing = []
	for (const [name, row] of Object.entries(current)) {
		const base = baseline.cases[name]
		if (!base) {
			missing.push(name)
			continue
		}
		for (const k of Object.keys(row))
			if (k in base && isWorse(k, base[k], row[k]))
				worse.push({ name, metric: k, was: base[k], now: row[k] })
	}
	return { worse, missing }
}

export const baselinePath = new URL("../../doc/layout-aesthetics/baseline.json", import.meta.url)
/** Each engine ratchets against its own baseline; `semantic` keeps the original file. */
export const baselineFor = (engine = "semantic") =>
	engine === "semantic"
		? baselinePath
		: new URL(`../../doc/layout-aesthetics/baseline-${engine}.json`, import.meta.url)
export const corpusDir = new URL("../../fixtures/layout-corpus/", import.meta.url)
export const baselineExists = (engine = "semantic") => existsSync(baselineFor(engine))
