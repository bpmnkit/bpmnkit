#!/usr/bin/env -S pnpm exec tsx
/**
 * Scores the layout engine on a corpus: per-case and aggregate metrics.
 *
 * Usage: pnpm layout:score [--dir <folder>] [--engine semantic|grid|…] [--json out.json] [--update-baseline]
 *   --dir   an arbitrary folder of *.txt specs (+ NAME.edit.mjs) and *.bpmn files; default fixtures/layout-corpus
 *   --update-baseline  rewrites the engine's baseline from the default corpus (explicit improvements only):
 *                      doc/layout-aesthetics/baseline.json for semantic, baseline-<engine>.json otherwise
 * Needs a built `packages/core`.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { compileTextSpec, keyThrownMessages } from "../apps/cli/src/commands/build-spec.ts"
import { dropRewiredEdges } from "../apps/cli/src/commands/build.ts"
import {
	baselineExists,
	baselineFor,
	corpusDir,
	regressions,
	scoreDir,
} from "./layout-aesthetics/score-lib.mjs"

const args = process.argv.slice(2)
const flag = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined)
const dir = flag("--dir") ? resolve(flag("--dir")) : fileURLToPath(corpusDir)
const engine = flag("--engine") ?? "semantic"
const deps = { compileTextSpec, keyThrownMessages, dropRewiredEdges }

const result = await scoreDir(dir, deps, { engine })
const keys = Object.keys(Object.values(result.cases)[0] ?? {})
const rows = { ...result.cases, MEAN: result.aggregate }
console.log(["case", ...keys].join("\t"))
for (const [name, r] of Object.entries(rows))
	console.log([name, ...keys.map((k) => r[k])].join("\t"))
for (const [name, msg] of Object.entries(result.errors)) console.error(`✖ ${name}: ${msg}`)

if (flag("--json")) writeFileSync(flag("--json"), `${JSON.stringify(result, null, 2)}\n`)

if (args.includes("--update-baseline")) {
	if (flag("--dir")) throw new Error("--update-baseline uses the committed corpus; drop --dir")
	if (Object.keys(result.errors).length > 0) throw new Error("fix the failing cases first")
	const out = fileURLToPath(baselineFor(engine))
	mkdirSync(dirname(out), { recursive: true })
	writeFileSync(
		out,
		`${JSON.stringify({ cases: result.cases, aggregate: result.aggregate }, null, "\t")}\n`,
	)
	console.log(`baseline written: ${out}`)
} else if (!flag("--dir") && baselineExists(engine)) {
	const { worse, missing } = regressions(
		JSON.parse(readFileSync(baselineFor(engine), "utf8")),
		result.cases,
	)
	for (const w of worse) console.log(`✗ ${w.name} ${w.metric}: ${w.was} → ${w.now}`)
	for (const m of missing) console.log(`? ${m}: not in baseline`)
	console.log(
		worse.length === 0 ? "ratchet: no regressions" : `ratchet: ${worse.length} regression(s)`,
	)
	if (worse.length > 0) process.exitCode = 1
}
if (Object.keys(result.errors).length > 0) process.exitCode = 1
