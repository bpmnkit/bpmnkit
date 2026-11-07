#!/usr/bin/env node
/**
 * bench-builder — times the TS fluent builders over the scripts of conformance/builder/
 * that build, the same ones `cargo bench -p bpmnkit-builder` replays: BPMN without and
 * with auto layout, DMN tables and DRDs, and serializeBpmn / serializeDmn of the results.
 * `diagram-*` scripts are left out on both sides.
 *
 * Usage: pnpm turbo build --filter @bpmnkit/core && node scripts/bench-builder.mjs [iterations]
 */

import { existsSync, readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { ProcessBuilder } from "../packages/core/dist/bpmn/bpmn-builder.js"
import { parseBpmn } from "../packages/core/dist/bpmn/bpmn-parser.js"
import { serializeBpmn } from "../packages/core/dist/bpmn/bpmn-serializer.js"
import { Bpmn } from "../packages/core/dist/bpmn/index.js"
import { serializeDmn } from "../packages/core/dist/dmn/dmn-serializer.js"
import { Dmn, drgId } from "../packages/core/dist/dmn/index.js"
import { resetIdCounter } from "../packages/core/dist/types/id-generator.js"

const root = fileURLToPath(new URL("../conformance/", import.meta.url))
const builderRoot = join(root, "builder")
const iterations = Number(process.argv[2] ?? 30)

function resolveArg(arg, vars) {
	if (Array.isArray(arg)) return arg.map((a) => resolveArg(a, vars))
	if (arg !== null && typeof arg === "object") {
		if ("$ops" in arg) return (b) => replay(b, arg.$ops, vars)
		if ("$ref" in arg) return vars.get(arg.$ref)
		if ("$drgId" in arg) return drgId(arg.$drgId)
		return Object.fromEntries(Object.entries(arg).map(([k, v]) => [k, resolveArg(v, vars)]))
	}
	return arg
}

function call(recv, method, args, vars) {
	return recv[method](...args.map((a) => resolveArg(a, vars)))
}

function replay(recv, ops, vars) {
	let cur = recv
	for (const op of ops) {
		if (op[0] === "$let") {
			const [, name, method, ...args] = op
			vars.set(name, call(cur, method, args, vars))
		} else {
			const [method, ...args] = op
			cur = call(cur, method, args, vars)
		}
	}
	return cur
}

/** The ops for a mode: `withAutoLayout` only takes effect (and always runs last) with layout. */
function scriptFor(script, layout) {
	const ops = script.filter((op) => op[0] !== "withAutoLayout")
	if (layout) ops.splice(ops.length - 1, 0, ["withAutoLayout"])
	return ops
}

function run(c, layout) {
	resetIdCounter()
	let ops = c.kind === "bpmn" ? scriptFor(c.script, layout) : c.script
	let receiver = c.kind === "bpmn" ? Bpmn : Dmn
	if (ops[0]?.[0] === "from") {
		receiver = ProcessBuilder.from(c.input, ops[0][1])
		ops = ops.slice(1)
	}
	return replay(receiver, ops, new Map())
}

function succeeds(c, layout) {
	try {
		run(c, layout)
		return true
	} catch {
		return false
	}
}

const bpmn = []
const dmn = []
for (const d of readdirSync(builderRoot, { withFileTypes: true })
	.filter((d) => d.isDirectory() && !d.name.startsWith("diagram-"))
	.sort((a, b) => (a.name < b.name ? -1 : 1))) {
	const dir = join(builderRoot, d.name)
	if (existsSync(join(dir, "expected/error.txt"))) continue
	const spec = JSON.parse(readFileSync(join(dir, "case.json"), "utf8"))
	if (spec.script[0]?.[0] === "from") {
		const local = join(dir, spec.input ?? "input.bpmn")
		const file = existsSync(local) ? local : join(root, spec.input ?? "")
		spec.input = parseBpmn(readFileSync(file, "utf8"))
		// ProcessBuilder.from may keep the document, so each pass gets its own copy.
		spec.source = spec.input
		Object.defineProperty(spec, "input", { get: () => structuredClone(spec.source) })
	}
	;(spec.kind === "bpmn" ? bpmn : dmn).push(spec)
}

const plain = bpmn.filter((c) => succeeds(c, false))
const laid = bpmn.filter((c) => succeeds(c, true))
const dmnOk = dmn.filter((c) => succeeds(c, false))
const plainOut = plain.map((c) => run(c, false))
const laidOut = laid.map((c) => run(c, true))
const dmnOut = dmnOk.map((c) => run(c, false))

function time(label, fn) {
	// Warm up so the JIT has compiled the hot paths before timing.
	for (let i = 0; i < Math.max(10, iterations / 10); i++) fn()
	const start = process.hrtime.bigint()
	for (let i = 0; i < iterations; i++) fn()
	const ms = Number(process.hrtime.bigint() - start) / 1e6 / iterations
	console.log(`${label.padEnd(18)} ${ms.toFixed(3).padStart(9)} ms per pass`)
}

console.log(
	`${plain.length} BPMN scripts (${laid.length} with layout), ${dmnOk.length} DMN scripts, ${iterations} passes`,
)
time("build", () => {
	for (const c of plain) run(c, false)
})
time("build layout", () => {
	for (const c of laid) run(c, true)
})
time("build dmn", () => {
	for (const c of dmnOk) run(c, false)
})
time("serialize", () => {
	for (const d of plainOut) serializeBpmn(d)
})
time("serialize layout", () => {
	for (const d of laidOut) serializeBpmn(d)
})
time("serialize dmn", () => {
	for (const d of dmnOut) serializeDmn(d)
})
