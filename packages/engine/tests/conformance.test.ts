import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { Dmn } from "@bpmnkit/core"
import { evaluate, parseExpression } from "@bpmnkit/feel"
import type { FeelValue } from "@bpmnkit/feel"
import { describe, expect, it } from "vitest"
import { evaluateDecisionGraph } from "../src/dmn.js"

/**
 * Replays the evaluation cases of conformance/dmn/<case>/evaluate.json against
 * `evaluateDecisionGraph`: each entry names a decision and its input context, and
 * expected/evaluate.json holds, per entry, the result and the decisions evaluated (or the
 * error message). Values use the FEEL case encoding (conformance/README.md). The files are
 * the contract the Rust implementation (bpmnkit-dmn) is checked against;
 * `pnpm conformance:record` rewrites the expected file from this implementation.
 */

type Value =
	| { t: "null" }
	| { t: "boolean"; v: boolean }
	| { t: "number" | "string"; v: string }
	| { t: "date" | "time" | "date-time" | "days-time-duration" | "years-months-duration"; v: string }
	| { t: "list"; v: Value[] }
	| { t: "context"; v: Record<string, Value> }
	| { t: "error" }

interface Input {
	decision: string
	context: Record<string, Value>
}

type Outcome =
	| { result: Value; evaluated: { decision: string; result: Value }[] }
	| { error: string }

const RECORD = process.env.CONFORMANCE_RECORD === "1"
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "../../../conformance/dmn")

function feel(expr: string, vars: Record<string, FeelValue> = {}): FeelValue {
	const { ast } = parseExpression(expr, { names: Object.keys(vars) })
	return ast ? evaluate(ast, { vars }) : null
}

function numberToDecimal(n: number): string | null {
	if (!Number.isFinite(n)) return null
	if (n === 0) return "0"
	const s = n.toLocaleString("en-US", { useGrouping: false, maximumFractionDigits: 20 })
	return s.includes(".") ? s.replace(/0+$/, "").replace(/\.$/, "") : s
}

function encode(v: unknown): Value {
	if (v === null || v === undefined) return { t: "null" }
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
		case "years-months-duration": {
			const s = feel("string(x)", { x: v as FeelValue })
			return { t: (v as { type: "date" }).type, v: typeof s === "string" ? s : "" }
		}
		case "range":
		case "function":
			return { t: "error" }
	}
	const out: Record<string, Value> = {}
	for (const k of Object.keys(v as object).sort()) {
		const e = encode((v as Record<string, unknown>)[k])
		if (e.t === "error") return { t: "error" }
		out[k] = e
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
			return feel(`@"${v.v}"`)
	}
}

function run(xml: string, input: Input): Outcome {
	try {
		const vars = Object.fromEntries(Object.entries(input.context).map(([k, x]) => [k, decode(x)]))
		const r = evaluateDecisionGraph(Dmn.parse(xml), input.decision, vars)
		return {
			result: encode(r.result),
			evaluated: r.evaluatedDecisions.map((d) => ({
				decision: d.decisionId,
				result: encode(d.result),
			})),
		}
	} catch (e) {
		return { error: e instanceof Error ? e.message : String(e) }
	}
}

const cases = fs.existsSync(root)
	? fs
			.readdirSync(root, { withFileTypes: true })
			.filter((d) => d.isDirectory() && fs.existsSync(path.join(root, d.name, "evaluate.json")))
			.map((d) => d.name)
			.sort()
	: []

describe("conformance/dmn evaluation", () => {
	it("has cases", () => {
		expect(cases.length).toBeGreaterThan(0)
	})
	for (const name of cases) {
		const dir = path.join(root, name)
		const xml = fs.readFileSync(path.join(dir, "input.dmn"), "utf8")
		const inputs = JSON.parse(fs.readFileSync(path.join(dir, "evaluate.json"), "utf8")) as Input[]
		const out = `${JSON.stringify(
			inputs.map((i) => run(xml, i)),
			null,
			2,
		)}\n`
		if (RECORD) {
			fs.mkdirSync(path.join(dir, "expected"), { recursive: true })
			fs.writeFileSync(path.join(dir, "expected/evaluate.json"), out)
		}
		it(name, () => {
			expect(out).toBe(fs.readFileSync(path.join(dir, "expected/evaluate.json"), "utf8"))
		})
	}
})
