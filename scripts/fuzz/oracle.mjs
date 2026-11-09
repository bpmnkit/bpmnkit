#!/usr/bin/env node
// The TypeScript side of the differential fuzzer (crates/bpmnkit-fuzz). Reads one JSON request
// per line on stdin and writes one JSON answer per line on stdout, in the shape the Rust side
// produces (`bpmnkit_fuzz::run`). It encodes values as the conformance recorders do, so a
// mismatch here can be saved as a conformance case. Needs the built packages:
// `pnpm --filter @bpmnkit/feel --filter @bpmnkit/core --filter @bpmnkit/engine build`.
import { createInterface } from "node:readline"
import { parseBpmn } from "../../packages/core/dist/bpmn/bpmn-parser.js"
import { serializeBpmn } from "../../packages/core/dist/bpmn/bpmn-serializer.js"
import { compactify, expand } from "../../packages/core/dist/bpmn/compact.js"
import { parseProcessText } from "../../packages/core/dist/bpmn/process-text.js"
import { parseDmn } from "../../packages/core/dist/dmn/dmn-parser.js"
import { serializeDmn } from "../../packages/core/dist/dmn/dmn-serializer.js"
import { ParseError } from "../../packages/core/dist/errors.js"
import { parseForm } from "../../packages/core/dist/form/form-parser.js"
import { exportForm } from "../../packages/core/dist/form/form-serializer.js"
import { resetIdCounter } from "../../packages/core/dist/types/id-generator.js"
import { evaluateDecisionGraph } from "../../packages/engine/dist/dmn.js"
import { parseTemporal } from "../../packages/feel/dist/builtins.js"
import { evaluate } from "../../packages/feel/dist/evaluator.js"
import { parseExpression } from "../../packages/feel/dist/parser.js"

// FEEL value encoding: the same as packages/feel/tests/conformance.test.ts.
function numberToDecimal(n) {
	if (!Number.isFinite(n)) return null
	if (n === 0) return "0"
	const s = n.toLocaleString("en-US", { useGrouping: false, maximumFractionDigits: 20 })
	return s.includes(".") ? s.replace(/0+$/, "").replace(/\.$/, "") : s
}

function stringify(v) {
	const { ast } = parseExpression("string(x)")
	const out = ast ? evaluate(ast, { vars: { x: v } }) : null
	return typeof out === "string" ? out : ""
}

const TEMPORAL = new Set([
	"date",
	"time",
	"date-time",
	"days-time-duration",
	"years-months-duration",
])

function encode(v) {
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
	if (TEMPORAL.has(v.type)) return { t: v.type, v: stringify(v) }
	if (v.type === "range" || v.type === "function") return { t: "error" }
	const out = {}
	for (const k of Object.keys(v).sort()) {
		const e = encode(v[k])
		if (e.t === "error") return { t: "error" }
		Object.defineProperty(out, k, {
			value: e,
			enumerable: true,
			writable: true,
			configurable: true,
		})
	}
	return { t: "context", v: out }
}

function decode(v) {
	switch (v.t) {
		case "null":
		case "error":
			return null
		case "boolean":
		case "string":
			return v.v
		case "number":
			return Number(v.v)
		case "list":
			return v.v.map(decode)
		case "context":
			return Object.fromEntries(Object.entries(v.v).map(([k, x]) => [k, decode(x)]))
		default:
			return parseTemporal(`@"${v.v}"`)
	}
}

const vars = (context) =>
	Object.fromEntries(Object.entries(context ?? {}).map(([k, x]) => [k, decode(x)]))

/** The model as JSON.stringify sees it (undefined fields dropped), like the recorders. */
const plain = (v) => JSON.parse(JSON.stringify(v))

const message = (e) => (e instanceof Error ? e.message : String(e))

const handlers = {
	feel({ expr, context }) {
		try {
			const { ast, errors } = parseExpression(expr)
			if (!ast || (errors?.length ?? 0) > 0) return { value: { t: "error" } }
			return { value: encode(evaluate(ast, { vars: vars(context) })) }
		} catch {
			return { value: { t: "error" } }
		}
	},
	bpmn({ xml }) {
		let defs
		try {
			defs = parseBpmn(xml)
		} catch (e) {
			return { error: message(e) }
		}
		return { model: plain(defs), xml: serializeBpmn(defs) }
	},
	dmn({ xml }) {
		let defs
		try {
			defs = parseDmn(xml)
		} catch (e) {
			return { error: message(e) }
		}
		return { model: plain(defs), xml: serializeDmn(defs) }
	},
	"dmn-eval"({ xml, decision, context }) {
		let defs
		try {
			defs = parseDmn(xml)
		} catch (e) {
			return { error: message(e) }
		}
		try {
			const r = evaluateDecisionGraph(defs, decision, vars(context))
			return {
				result: encode(r.result),
				evaluated: r.evaluatedDecisions.map((d) => ({
					decision: d.decisionId,
					result: encode(d.result),
				})),
			}
		} catch (e) {
			return { error: message(e) }
		}
	},
	form({ json }) {
		let form
		try {
			form = parseForm(json)
		} catch (e) {
			// Only ParseError is part of the contract (conformance-form.test.ts).
			if (e instanceof ParseError) return { error: e.message }
			return { crash: message(e) }
		}
		return { model: plain(form), text: exportForm(form) }
	},
	text({ text }) {
		resetIdCounter()
		const result = parseProcessText(text)
		resetIdCounter()
		try {
			// Ungated, as in the Rust runner: the target is the expansion, not the deploy check.
			return {
				result: plain(result),
				xml: serializeBpmn(expand(result.diagram, { validate: false })),
			}
		} catch (e) {
			return { result: plain(result), expandError: message(e) }
		}
	},
	compact({ xml }) {
		resetIdCounter()
		let compact
		try {
			compact = compactify(parseBpmn(xml))
		} catch (e) {
			return { error: message(e) }
		}
		resetIdCounter()
		try {
			return {
				compact: plain(compact),
				expanded: serializeBpmn(expand(compact, { validate: false })),
			}
		} catch (e) {
			return { compact: plain(compact), expandError: message(e) }
		}
	},
}

const lines = createInterface({ input: process.stdin, crlfDelay: Number.POSITIVE_INFINITY })
for await (const line of lines) {
	if (!line.trim()) continue
	let answer
	try {
		const req = JSON.parse(line)
		const handler = handlers[req.target]
		answer = handler ? handler(req) : { crash: `unknown target ${req.target}` }
	} catch (e) {
		// A throw the handler did not expect is a TS bug the fuzzer should report.
		answer = { crash: message(e) }
	}
	process.stdout.write(`${JSON.stringify(answer)}\n`)
}
