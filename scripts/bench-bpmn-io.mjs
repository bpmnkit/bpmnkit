#!/usr/bin/env node
/**
 * bench-bpmn-io — times TS BPMN parse and serialize over conformance/bpmn/<case>/input.bpmn,
 * the same files `cargo bench -p bpmnkit-bpmn` reads, so the two numbers compare directly.
 *
 * Usage: pnpm turbo build --filter @bpmnkit/core && node scripts/bench-bpmn-io.mjs [iterations]
 */

import { readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { Bpmn } from "../packages/core/dist/index.js"

const root = fileURLToPath(new URL("../conformance/bpmn/", import.meta.url))
const iterations = Number(process.argv[2] ?? 300)
const inputs = readdirSync(root, { withFileTypes: true })
	.filter((d) => d.isDirectory())
	.map((d) => readFileSync(join(root, d.name, "input.bpmn"), "utf8"))
const bytes = inputs.reduce((n, x) => n + x.length, 0)
const models = inputs.map((x) => Bpmn.parse(x))

function time(label, run) {
	// Warm up so the JIT has compiled the hot paths before timing.
	for (let i = 0; i < Math.max(10, iterations / 10); i++) run()
	const start = process.hrtime.bigint()
	for (let i = 0; i < iterations; i++) run()
	const us = Number(process.hrtime.bigint() - start) / 1e3 / iterations
	console.log(`${label.padEnd(18)} ${us.toFixed(1).padStart(9)} µs per pass`)
}

console.log(`${inputs.length} files, ${bytes} bytes, ${iterations} passes`)
time("parse", () => {
	for (const x of inputs) Bpmn.parse(x)
})
time("serialize", () => {
	// Benchmarks the serializer alone, on corpus files Zeebe may reject.
	for (const m of models) Bpmn.export(m, { validate: false })
})
time("parse+serialize", () => {
	// Benchmarks the serializer alone, on corpus files Zeebe may reject.
	for (const x of inputs) Bpmn.export(Bpmn.parse(x), { validate: false })
})
