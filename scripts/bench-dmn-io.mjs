#!/usr/bin/env node
/**
 * bench-dmn-io — times TS DMN parse and serialize over conformance/dmn/<case>/input.dmn (the
 * cases that parse), the same files `cargo bench -p bpmnkit-dmn` reads, so the two numbers
 * compare directly. Then evaluation (`evaluateDecisionGraph`) of every evaluate.json entry whose
 * context is plain JSON (no temporal values), on parsed models.
 *
 * Usage: build @bpmnkit/core and @bpmnkit/engine, then node scripts/bench-dmn-io.mjs [iterations]
 */

import { readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { Dmn } from "../packages/core/dist/index.js"
import { evaluateDecisionGraph } from "../packages/engine/dist/index.js"

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

/** A case-file value, or undefined for temporal values (which the Rust bench skips too). */
function decode(v) {
	switch (v.t) {
		case "null":
			return null
		case "boolean":
		case "string":
			return v.v
		case "number":
			return Number(v.v)
		case "list": {
			const items = v.v.map(decode)
			return items.includes(undefined) ? undefined : items
		}
		case "context": {
			const entries = Object.entries(v.v).map(([k, x]) => [k, decode(x)])
			return entries.some(([, x]) => x === undefined) ? undefined : Object.fromEntries(entries)
		}
		default:
			return undefined
	}
}

const evals = []
for (const d of readdirSync(root, { withFileTypes: true })) {
	if (!d.isDirectory()) continue
	let entries
	try {
		entries = JSON.parse(readFileSync(join(root, d.name, "evaluate.json"), "utf8"))
	} catch {
		continue
	}
	const model = Dmn.parse(readFileSync(join(root, d.name, "input.dmn"), "utf8"))
	for (const e of entries) {
		const vars = decode({ t: "context", v: e.context })
		if (vars !== undefined) evals.push([model, e.decision, vars])
	}
}
console.log(`${evals.length} evaluations`)
time("evaluate", () => {
	for (const [m, id, vars] of evals) {
		try {
			evaluateDecisionGraph(m, id, vars)
		} catch {
			// Error cases are part of the workload, as in Rust.
		}
	}
})
