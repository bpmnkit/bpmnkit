#!/usr/bin/env node
/**
 * bench-text — times parseProcessText over conformance/text/parse-* inputs, writeProcessText
 * over the write-* documents, compactify / expand over conformance/compact/bpmn-* inputs and
 * compactifyDmn / expandDmn over the dmn-* ones that start from a .dmn: the files
 * `cargo bench -p bpmnkit-text` reads. Inputs are parsed before the clock starts.
 *
 * Usage: pnpm turbo build --filter @bpmnkit/core && node scripts/bench-text.mjs [iterations]
 */

import { existsSync, readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { parseBpmn } from "../packages/core/dist/bpmn/bpmn-parser.js"
import { compactify, expand } from "../packages/core/dist/bpmn/compact.js"
import { writeProcessText } from "../packages/core/dist/bpmn/process-text-writer.js"
import { parseProcessText } from "../packages/core/dist/bpmn/process-text.js"
import { compactifyDmn, expandDmn } from "../packages/core/dist/dmn/compact.js"
import { parseDmn } from "../packages/core/dist/dmn/dmn-parser.js"
import { resetIdCounter } from "../packages/core/dist/types/id-generator.js"

const root = fileURLToPath(new URL("../conformance/", import.meta.url))
const iterations = Number(process.argv[2] ?? 30)

function cases(kind, prefix) {
	return readdirSync(join(root, kind), { withFileTypes: true })
		.filter((d) => d.isDirectory() && d.name.startsWith(prefix))
		.map((d) => join(root, kind, d.name))
		.sort()
}

/** `input.<ext>`, else case.json's `input`, relative to the case folder or to conformance/. */
function inputText(dir, file) {
	const direct = join(dir, file)
	if (existsSync(direct)) return readFileSync(direct, "utf8")
	const caseFile = join(dir, "case.json")
	if (!existsSync(caseFile)) return undefined
	const rel = JSON.parse(readFileSync(caseFile, "utf8")).input
	if (typeof rel !== "string") return undefined
	const local = join(dir, rel)
	const path = existsSync(local) ? local : join(root, rel)
	return existsSync(path) ? readFileSync(path, "utf8") : undefined
}

function ok(fn) {
	try {
		fn()
		return true
	} catch {
		return false
	}
}

const texts = cases("text", "parse-")
	.filter((d) => existsSync(join(d, "input.txt")))
	.map((d) => readFileSync(join(d, "input.txt"), "utf8"))
const written = cases("text", "write-")
	.filter((d) => !existsSync(join(d, "expected/error.txt")))
	.map((d) => inputText(d, "input.bpmn"))
	.filter((x) => x !== undefined)
	.map((x) => parseBpmn(x))
const bpmn = cases("compact", "bpmn-")
	.map((d) => inputText(d, "input.bpmn"))
	.filter((x) => x !== undefined)
	.map((x) => parseBpmn(x))
// Ungated, as in the Rust bench: the corpus round trips are mostly not Camunda 8 models, and
// the bench times the expansion, not the deploy check.
const ungated = { validate: false }
const diagrams = bpmn.map((m) => compactify(m)).filter((d) => ok(() => expand(d, ungated)))
const dmn = cases("compact", "dmn-")
	.map((d) => inputText(d, "input.dmn"))
	.filter((x) => x !== undefined)
	.flatMap((x) => {
		try {
			return [parseDmn(x)]
		} catch {
			return []
		}
	})
const compactDmn = dmn.map((m) => compactifyDmn(m)).filter((d) => ok(() => expandDmn(d)))

function time(label, run) {
	// Warm up so the JIT has compiled the hot paths before timing.
	for (let i = 0; i < Math.max(10, iterations / 10); i++) run()
	const start = process.hrtime.bigint()
	for (let i = 0; i < iterations; i++) run()
	const ms = Number(process.hrtime.bigint() - start) / 1e6 / iterations
	console.log(`${label.padEnd(18)} ${ms.toFixed(3).padStart(9)} ms per pass`)
}

console.log(
	`${texts.length} parse, ${written.length} write, ${bpmn.length} BPMN compact (${diagrams.length} expand), ${dmn.length} DMN compact (${compactDmn.length} expand), ${iterations} passes`,
)
time("parse text", () => {
	resetIdCounter()
	for (const t of texts) parseProcessText(t)
})
time("write text", () => {
	for (const m of written) writeProcessText(m)
})
time("compactify", () => {
	for (const m of bpmn) compactify(m)
})
time("expand", () => {
	resetIdCounter()
	for (const d of diagrams) {
		try {
			expand(d, ungated)
		} catch {}
	}
})
time("compactify dmn", () => {
	for (const m of dmn) compactifyDmn(m)
})
time("expand dmn", () => {
	resetIdCounter()
	for (const d of compactDmn) {
		try {
			expandDmn(d)
		} catch {}
	}
})
