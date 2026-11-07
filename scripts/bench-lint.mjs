#!/usr/bin/env node
/**
 * bench-lint — times TS lint, optimize and the Camunda compatibility check over
 * conformance/bpmn/<case>/input.bpmn, the same files `cargo bench -p bpmnkit-lint` reads.
 *
 * Usage: pnpm turbo build --filter @bpmnkit/core && node scripts/bench-lint.mjs [iterations]
 */

import { readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { Bpmn, analyzeCamundaCompat, lintDiagram, optimize } from "../packages/core/dist/index.js"

const root = fileURLToPath(new URL("../conformance/bpmn/", import.meta.url))
const iterations = Number(process.argv[2] ?? 100)
const models = readdirSync(root, { withFileTypes: true })
	.filter((d) => d.isDirectory())
	.map((d) => Bpmn.parse(readFileSync(join(root, d.name, "input.bpmn"), "utf8")))

function time(label, run) {
	// Warm up so the JIT has compiled the hot paths before timing.
	for (let i = 0; i < Math.max(10, iterations / 10); i++) run()
	const start = process.hrtime.bigint()
	for (let i = 0; i < iterations; i++) run()
	const us = Number(process.hrtime.bigint() - start) / 1e3 / iterations
	console.log(`${label.padEnd(18)} ${us.toFixed(1).padStart(9)} µs per pass`)
}

console.log(`${models.length} models, ${iterations} passes`)
time("lint (forced)", () => {
	for (const m of models) lintDiagram(m, { forceEngineRules: true })
})
time("optimize", () => {
	for (const m of models) optimize(m)
})
time("compat 8.6", () => {
	for (const m of models) analyzeCamundaCompat(m, "8.6")
})
