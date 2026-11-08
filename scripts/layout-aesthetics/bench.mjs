#!/usr/bin/env node
/**
 * Layout aesthetics benchmark: lays out every scenario (and, with a folder
 * argument, every .bpmn in it, DI discarded) and prints the metrics.
 *
 * Usage: node scripts/layout-aesthetics/bench.mjs [folder] [--json out.json] [--compare base.json]
 * Needs a built `packages/core`.
 */
import { readFileSync, readdirSync, writeFileSync } from "node:fs"
import { basename, join, resolve } from "node:path"
import { Bpmn, applyAutoLayout } from "../../packages/core/dist/index.js"
import { HIGHER_IS_BETTER, measure } from "./metrics.mjs"
import { SCENARIOS } from "./scenarios.mjs"

const args = process.argv.slice(2)
const flag = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined)
const folder = args.find((a, i) => !a.startsWith("--") && !args[i - 1]?.startsWith("--"))
const inputs = Object.entries(SCENARIOS)
if (folder) {
	for (const f of readdirSync(resolve(folder))
		.filter((f) => f.endsWith(".bpmn"))
		.sort())
		inputs.push([basename(f, ".bpmn"), readFileSync(join(resolve(folder), f), "utf8")])
}

const results = {}
for (const [name, xml] of inputs) {
	try {
		results[name] = measure(applyAutoLayout(Bpmn.parse(xml)))
	} catch (err) {
		console.error(`${name}: ${err.message}`)
	}
}
const keys = Object.keys(Object.values(results)[0])
const avg = {}
for (const k of keys) {
	const vals = Object.values(results).map((r) => r[k])
	avg[k] = +(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2)
}
results.MEAN = avg

const base = flag("--compare") ? JSON.parse(readFileSync(flag("--compare"), "utf8")) : undefined
const cols = ["name", ...keys]
console.log(cols.join("\t"))
for (const [name, r] of Object.entries(results)) {
	console.log([name, ...keys.map((k) => r[k])].join("\t"))
}
if (base?.MEAN) {
	console.log("\nMEAN delta (base → now):")
	for (const k of keys) {
		const was = base.MEAN[k]
		const now = avg[k]
		if (was === now) continue
		const better = HIGHER_IS_BETTER.has(k) ? now > was : now < was
		console.log(`  ${k}: ${was} → ${now} ${better ? "✓" : "✗"}`)
	}
}
if (flag("--json")) writeFileSync(flag("--json"), `${JSON.stringify(results, null, 2)}\n`)
