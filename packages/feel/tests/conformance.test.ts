import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import { parseTemporal } from "../src/builtins.js"
import { evaluate } from "../src/evaluator.js"
import { parseExpression } from "../src/parser.js"
import type { FeelContext, FeelValue } from "../src/types.js"

/**
 * Replays conformance/feel/*.jsonl against this package. The files are the
 * contract the Rust implementation is checked against (see
 * conformance/README.md); `pnpm conformance:record` rewrites the expected
 * values from this implementation, which is the oracle.
 */

type Value =
	| { t: "null" }
	| { t: "boolean"; v: boolean }
	| { t: "number" | "string"; v: string }
	| { t: "date" | "time" | "date-time" | "days-time-duration" | "years-months-duration"; v: string }
	| { t: "list"; v: Value[] }
	| { t: "context"; v: Record<string, Value> }
	| { t: "error" }

interface Case {
	id: string
	expr: string
	context: Record<string, Value>
	expected: Value
}

const RECORD = process.env.CONFORMANCE_RECORD === "1"
const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "../../../conformance/feel")

function numberToDecimal(n: number): string | null {
	if (!Number.isFinite(n)) return null
	if (n === 0) return "0"
	const s = n.toLocaleString("en-US", { useGrouping: false, maximumFractionDigits: 20 })
	return s.includes(".") ? s.replace(/0+$/, "").replace(/\.$/, "") : s
}

function stringify(v: FeelValue): string {
	const { ast } = parseExpression("string(x)")
	const out = ast ? evaluate(ast, { vars: { x: v } }) : null
	return typeof out === "string" ? out : ""
}

function encode(v: FeelValue): Value {
	if (v === null) return { t: "null" }
	if (typeof v === "boolean") return { t: "boolean", v }
	if (typeof v === "string") return { t: "string", v }
	if (typeof v === "number") {
		const d = numberToDecimal(v)
		return d === null ? { t: "error" } : { t: "number", v: d }
	}
	if (Array.isArray(v)) {
		const items = v.map(encode)
		return items.some((i) => i.t === "error") ? { t: "error" } : { t: "list", v: items }
	}
	switch ((v as { type?: string }).type) {
		case "date":
		case "time":
		case "date-time":
		case "days-time-duration":
		case "years-months-duration":
			return { t: (v as { type: "date" }).type, v: stringify(v) }
		case "range":
		case "function":
			return { t: "error" }
	}
	const out: Record<string, Value> = {}
	for (const k of Object.keys(v).sort()) {
		const e = encode((v as FeelContext)[k] as FeelValue)
		if (e.t === "error") return { t: "error" }
		// defineProperty, so that a "__proto__" key is recorded as an entry, as FEEL has it.
		Object.defineProperty(out, k, {
			value: e,
			enumerable: true,
			writable: true,
			configurable: true,
		})
	}
	return { t: "context", v: out }
}

function decode(v: Value): FeelValue {
	switch (v.t) {
		case "null":
		case "error":
			return null
		case "boolean":
			return v.v
		case "number":
			return Number(v.v)
		case "string":
			return v.v
		case "list":
			return v.v.map(decode)
		case "context":
			return Object.fromEntries(Object.entries(v.v).map(([k, x]) => [k, decode(x)]))
		default:
			return parseTemporal(`@"${v.v}"`)
	}
}

function run(c: Case): Value {
	try {
		const { ast, errors } = parseExpression(c.expr)
		if (!ast || (errors?.length ?? 0) > 0) return { t: "error" }
		const vars = Object.fromEntries(Object.entries(c.context).map(([k, x]) => [k, decode(x)]))
		return encode(evaluate(ast, { vars }))
	} catch {
		return { t: "error" }
	}
}

const files = fs.existsSync(dir)
	? fs
			.readdirSync(dir)
			.filter((f) => f.endsWith(".jsonl"))
			.sort()
	: []

describe("conformance/feel", () => {
	it("has cases", () => {
		expect(files.length).toBeGreaterThan(0)
	})
	for (const f of files) {
		const file = path.join(dir, f)
		let cases = fs
			.readFileSync(file, "utf8")
			.split("\n")
			.filter(Boolean)
			.map((l) => JSON.parse(l) as Case)
		if (RECORD) {
			cases = cases.map((c) => ({ ...c, expected: run(c) }))
			fs.writeFileSync(file, `${cases.map((c) => JSON.stringify(c)).join("\n")}\n`)
		}
		describe(f, () => {
			for (const c of cases) {
				it(c.id, () => {
					expect(run(c)).toEqual(c.expected)
				})
			}
		})
	}
})
