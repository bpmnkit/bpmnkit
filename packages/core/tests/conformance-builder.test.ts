import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it, vi } from "vitest"
import { ProcessBuilder } from "../src/bpmn/bpmn-builder.js"
import type { BpmnDefinitions } from "../src/bpmn/bpmn-model.js"
import { parseBpmn } from "../src/bpmn/bpmn-parser.js"
import { serializeBpmn } from "../src/bpmn/bpmn-serializer.js"
import { Bpmn, type ExportOptions } from "../src/bpmn/index.js"
import { serializeDmn } from "../src/dmn/dmn-serializer.js"
import { Dmn, drgId } from "../src/dmn/index.js"
import { resetIdCounter } from "../src/types/id-generator.js"

/**
 * Replays conformance/builder/<case>/ against this package: the case's script
 * drives the fluent builders (conformance/README.md, "Builder") and the
 * resulting definitions must equal expected/model.json and
 * expected/output.bpmn|dmn, or the thrown message must equal
 * expected/error.txt. `pnpm conformance:record` rewrites the files from this
 * implementation, which is the oracle.
 */

const RECORD = process.env.CONFORMANCE_RECORD === "1"
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "../../../conformance")
const builderRoot = path.join(root, "builder")

type Op = [string, ...unknown[]]

interface CaseFile {
	kind: "bpmn" | "dmn"
	input?: string
	script: Op[]
	/** BPMN only: write the result with `Bpmn.export(defs, export)` instead of `serializeBpmn`. */
	export?: ExportOptions
}

function sortKeys(v: unknown): unknown {
	if (Array.isArray(v)) return v.map(sortKeys)
	if (v !== null && typeof v === "object") {
		return Object.fromEntries(
			Object.keys(v)
				.sort()
				.map((k) => [k, sortKeys((v as Record<string, unknown>)[k])]),
		)
	}
	return v
}

type Vars = Map<string, unknown>

function resolveArg(arg: unknown, vars: Vars): unknown {
	if (Array.isArray(arg)) return arg.map((a) => resolveArg(a, vars))
	if (arg !== null && typeof arg === "object") {
		const obj = arg as Record<string, unknown>
		if ("$ops" in obj) {
			return (b: unknown) => replay(b, obj.$ops as Op[], vars)
		}
		if ("$ref" in obj) {
			const name = obj.$ref as string
			if (!vars.has(name)) throw new Error(`script bug: unknown $ref "${name}"`)
			return vars.get(name)
		}
		if ("$drgId" in obj) return drgId(obj.$drgId as string)
		return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, resolveArg(v, vars)]))
	}
	return arg
}

function call(recv: unknown, method: string, args: unknown[], vars: Vars): unknown {
	const fn = (recv as Record<string, unknown>)[method]
	if (typeof fn !== "function") throw new Error(`script bug: no method "${method}"`)
	return (fn as (...a: unknown[]) => unknown).apply(
		recv,
		args.map((a) => resolveArg(a, vars)),
	)
}

function replay(recv: unknown, ops: Op[], vars: Vars): unknown {
	let cur = recv
	for (const op of ops) {
		if (op[0] === "$let") {
			const [, name, method, ...args] = op as [string, string, string, ...unknown[]]
			vars.set(name, call(cur, method, args, vars))
		} else {
			const [method, ...args] = op
			cur = call(cur, method, args, vars)
		}
	}
	return cur
}

function isDefinitions(v: unknown): boolean {
	return v !== null && typeof v === "object" && "id" in v && ("processes" in v || "decisions" in v)
}

/** Output files, or `error.txt` when a builder throws. */
function run(dir: string, spec: CaseFile): Record<string, string> {
	resetIdCounter()
	const vars: Vars = new Map()
	let result: unknown
	try {
		let ops = spec.script
		let receiver: unknown = spec.kind === "bpmn" ? Bpmn : Dmn
		if (ops[0]?.[0] === "from") {
			const local = path.join(dir, spec.input ?? "")
			const file = fs.existsSync(local) ? local : path.join(root, spec.input ?? "")
			receiver = ProcessBuilder.from(parseBpmn(fs.readFileSync(file, "utf8")), ops[0][1] as string)
			ops = ops.slice(1)
		}
		result = replay(receiver, ops, vars)
	} catch (err) {
		return { "error.txt": `${(err as Error).message}\n` }
	}
	if (!isDefinitions(result)) throw new Error(`${dir}: the script did not end in definitions`)
	const warnings: string[] = []
	if (spec.export !== undefined) {
		const warn = vi.spyOn(console, "warn").mockImplementation((msg: string) => {
			warnings.push(msg)
		})
		try {
			Bpmn.export(result as BpmnDefinitions, spec.export)
		} catch (err) {
			return { "error.txt": `${(err as Error).message}\n` }
		} finally {
			warn.mockRestore()
		}
	}
	const model = `${JSON.stringify(sortKeys(result), null, 2)}\n`
	return spec.kind === "bpmn"
		? {
				"model.json": model,
				"output.bpmn": serializeBpmn(result as Parameters<typeof serializeBpmn>[0]),
				...(warnings.length > 0 ? { "warning.txt": `${warnings.join("\n")}\n` } : {}),
			}
		: {
				"model.json": model,
				"output.dmn": serializeDmn(result as Parameters<typeof serializeDmn>[0]),
			}
}

const cases = fs.existsSync(builderRoot)
	? fs
			.readdirSync(builderRoot, { withFileTypes: true })
			.filter((d) => d.isDirectory())
			.map((d) => d.name)
			.sort()
	: []

describe("conformance/builder", () => {
	it("has cases", () => {
		expect(cases.length).toBeGreaterThan(0)
	})
	for (const name of cases) {
		it(name, () => {
			const dir = path.join(builderRoot, name)
			const spec = JSON.parse(fs.readFileSync(path.join(dir, "case.json"), "utf8")) as CaseFile
			const expectedDir = path.join(dir, "expected")
			const out = run(dir, spec)
			if (RECORD) {
				fs.rmSync(expectedDir, { recursive: true, force: true })
				fs.mkdirSync(expectedDir, { recursive: true })
				for (const [file, text] of Object.entries(out)) {
					fs.writeFileSync(path.join(expectedDir, file), text)
				}
			}
			expect(fs.readdirSync(expectedDir).sort()).toEqual(Object.keys(out).sort())
			for (const [file, text] of Object.entries(out)) {
				expect(text).toBe(fs.readFileSync(path.join(expectedDir, file), "utf8"))
			}
		})
	}
})
