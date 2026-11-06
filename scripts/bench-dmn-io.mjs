#!/usr/bin/env node
/**
 * bench-dmn-io — times TS DMN parse and serialize over conformance/dmn/<case>/input.dmn (the
 * cases that parse), the same files `cargo bench -p bpmnkit-dmn` reads, so the two numbers
 * compare directly.
 *
 * Usage: pnpm turbo build --filter @bpmnkit/core && node scripts/bench-dmn-io.mjs [iterations]
 */

import { readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { Dmn } from "../packages/core/dist/index.js"

const root = fileURLToPath(new URL("../conformance/dmn/", import.meta.url))
const iterations = Number(process.argv[2] ?? 300)
const inputs = readdirSync(root, { withFileTypes: true })
	.filter((d) => d.isDirectory())
	.map((d) => readFileSync(join(root, d.name, "input.dmn"), "utf8"))
	.filter((x) => {
		try {
			Dmn.parse(x)
			return true
		} catch {
			// Error cases have nothing to serialize; the Rust bench skips them the same way.
			return false
		}
	})
const bytes = inputs.reduce((n, x) => n + x.length, 0)
const models = inputs.map((x) => Dmn.parse(x))

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
	for (const x of inputs) Dmn.parse(x)
})
time("serialize", () => {
	for (const m of models) Dmn.export(m)
})
time("parse+serialize", () => {
	for (const x of inputs) Dmn.export(Dmn.parse(x))
})
