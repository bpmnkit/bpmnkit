#!/usr/bin/env node
/**
 * bench-layout — times TS applyAutoLayout (both engines) over conformance/bpmn/<case>/input.bpmn
 * and layoutDmn over conformance/dmn/<case>/input.dmn, the files
 * `cargo bench -p bpmnkit-layout` reads.
 *
 * Usage: pnpm turbo build --filter @bpmnkit/core && node scripts/bench-layout.mjs [iterations]
 */

import { existsSync, readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { parseDmn } from "../packages/core/dist/dmn/dmn-parser.js"
import { Bpmn, applyAutoLayout, layoutDmn } from "../packages/core/dist/index.js"

const root = fileURLToPath(new URL("../conformance/", import.meta.url))
const iterations = Number(process.argv[2] ?? 50)

function inputs(kind, file) {
	return readdirSync(join(root, kind), { withFileTypes: true })
		.filter((d) => d.isDirectory() && existsSync(join(root, kind, d.name, file)))
		.map((d) => d.name)
		.sort()
		.map((name) => readFileSync(join(root, kind, name, file), "utf8"))
}

const bpmn = inputs("bpmn", "input.bpmn").map((xml) => Bpmn.parse(xml))
const dmn = inputs("dmn", "input.dmn").flatMap((xml) => {
	try {
		return [parseDmn(xml)]
	} catch {
		return []
	}
})

function time(label, run) {
	// Warm up so the JIT has compiled the hot paths before timing.
	for (let i = 0; i < Math.max(10, iterations / 10); i++) run()
	const start = process.hrtime.bigint()
	for (let i = 0; i < iterations; i++) run()
	const us = Number(process.hrtime.bigint() - start) / 1e3 / iterations
	console.log(`${label.padEnd(18)} ${us.toFixed(1).padStart(9)} µs per pass`)
}

console.log(`${bpmn.length} BPMN models, ${dmn.length} DMN models, ${iterations} passes`)
time("layout semantic", () => {
	for (const m of bpmn) applyAutoLayout(m, "semantic")
})
time("layout grid", () => {
	for (const m of bpmn) applyAutoLayout(m, "grid")
})
time("layout dmn", () => {
	for (const m of dmn) layoutDmn(m)
})
