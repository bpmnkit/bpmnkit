import type { BinaryOp, FeelNode } from "./ast.js"
import type { FeelNumber } from "./decimal.js"

export interface FormatOptions {
	indent?: string
	maxLineLength?: number
}

const DEFAULTS: Required<FormatOptions> = {
	indent: "  ",
	maxLineLength: 80,
}

export function formatFeel(node: FeelNode, opts?: FormatOptions): string {
	const o: Required<FormatOptions> = { ...DEFAULTS, ...opts }
	return fmt(node, o, 0).text
}

// Binding strengths, as in parser.ts. The parser drops grouping parentheses,
// so they are put back wherever the printed text would re-parse differently.
const PREC_COMPARE = 30
const PREC_ADD = 40
const PREC_UNARY = 70
const PREC_POSTFIX = 80
const PREC_ATOM = 100

const BINARY_PREC: Record<BinaryOp, number> = {
	or: 10,
	and: 20,
	"=": PREC_COMPARE,
	"!=": PREC_COMPARE,
	"<": PREC_COMPARE,
	"<=": PREC_COMPARE,
	">": PREC_COMPARE,
	">=": PREC_COMPARE,
	"+": PREC_ADD,
	"-": PREC_ADD,
	"*": 50,
	"/": 50,
	"**": 60,
}

interface Out {
	text: string
	prec: number
	/** Ends in an expression that would swallow a following infix operator
	 * (`if … else 2` before `+ 10`), so it needs parens unless it is last. */
	open: boolean
}

const atom = (text: string): Out => ({ text, prec: PREC_ATOM, open: false })
const openForm = (text: string): Out => ({ text, prec: PREC_ATOM, open: true })
const paren = (out: Out): string => `(${out.text})`
/** Text for a position something follows. */
const before = (out: Out, min: number): string =>
	out.open || out.prec < min ? paren(out) : out.text
/** Text for a trailing position, and whether the result stays open. */
const after = (out: Out, min: number): { text: string; open: boolean } =>
	out.prec < min ? { text: paren(out), open: false } : { text: out.text, open: out.open }

const STRING_ESCAPES: Record<string, string> = {
	"\\": "\\\\",
	'"': '\\"',
	"\n": "\\n",
	"\r": "\\r",
	"\t": "\\t",
}

/** Re-escapes a string literal's value, which the parser stores decoded. */
/** Plain notation, unless a far-off exponent would spell out hundreds of zeros: 1e400 stays short. */
function formatNumber(n: FeelNumber): string {
	const plain = n.toString()
	return plain.length <= 40 ? plain : `${n.coefficient}e${n.exponent}`
}

function escapeString(value: string): string {
	return value.replace(/[\\"\n\r\t]/g, (c) => STRING_ESCAPES[c] ?? c)
}

function fmt(node: FeelNode, o: Required<FormatOptions>, depth: number): Out {
	const ind = o.indent.repeat(depth)
	const ind1 = o.indent.repeat(depth + 1)
	const f = (n: FeelNode): Out => fmt(n, o, depth)
	const t = (n: FeelNode, d = depth): string => fmt(n, o, d).text
	const join = (items: FeelNode[]): string => items.map((i) => t(i)).join(", ")
	const fits = (text: string): boolean => text.length <= o.maxLineLength - depth * o.indent.length

	switch (node.kind) {
		case "null":
			return atom("null")
		case "boolean":
			return atom(String(node.value))
		case "number":
			return atom(formatNumber(node.value))
		case "string":
			return atom(`"${escapeString(node.value)}"`)
		case "temporal":
			return atom(node.raw)
		case "name":
			return atom(node.name)

		case "unary-minus": {
			// The operand is parsed above `**`: -2 ** 2 is (-2) ** 2.
			const r = after(f(node.operand), PREC_UNARY + 1)
			return { text: `-${r.text}`, prec: PREC_UNARY, open: r.open }
		}

		case "binary": {
			const prec = BINARY_PREC[node.op]
			// Every infix operator is left-associative, `**` included.
			const l = before(f(node.left), prec)
			const r = after(f(node.right), prec + 1)
			return { text: `${l} ${node.op} ${r.text}`, prec, open: r.open }
		}

		case "path":
			return {
				text: `${before(f(node.base), PREC_POSTFIX)}.${node.key}`,
				prec: PREC_POSTFIX,
				open: false,
			}

		case "filter":
			return {
				text: `${before(f(node.base), PREC_POSTFIX)}[${t(node.condition)}]`,
				prec: PREC_POSTFIX,
				open: false,
			}

		case "range": {
			const open = node.startIncluded ? "[" : "("
			const close = node.endIncluded ? "]" : ")"
			return atom(`${open}${t(node.low)}..${t(node.high)}${close}`)
		}

		case "list": {
			if (node.items.length === 0) return atom("[]")
			const inline = `[${join(node.items)}]`
			if (fits(inline)) return atom(inline)
			const items = node.items.map((i) => `${ind1}${t(i, depth + 1)}`).join(",\n")
			return atom(`[\n${items}\n${ind}]`)
		}

		case "context": {
			if (node.entries.length === 0) return atom("{}")
			const inline = `{${node.entries.map((e) => `${e.key}: ${t(e.value)}`).join(", ")}}`
			if (fits(inline)) return atom(inline)
			const entries = node.entries
				.map((e) => `${ind1}${e.key}: ${t(e.value, depth + 1)}`)
				.join(",\n")
			return atom(`{\n${entries}\n${ind}}`)
		}

		case "call":
			return atom(`${node.callee}(${join(node.args)})`)

		case "call-expr":
			return {
				text: `${before(f(node.target), PREC_POSTFIX)}(${join(node.args)})`,
				prec: PREC_POSTFIX,
				open: false,
			}

		case "call-named":
			return atom(`${node.callee}(${node.args.map((a) => `${a.name}: ${t(a.value)}`).join(", ")})`)

		case "if": {
			const cond = t(node.condition)
			const thn = t(node.then)
			const els = t(node.else)
			const inline = `if ${cond} then ${thn} else ${els}`
			if (fits(inline)) return openForm(inline)
			return openForm(`if ${cond}\n${ind1}then ${thn}\n${ind1}else ${els}`)
		}

		case "for": {
			const bindings = node.bindings.map((b) => `${b.name} in ${t(b.domain)}`).join(", ")
			const body = t(node.body)
			const inline = `for ${bindings} return ${body}`
			if (fits(inline)) return openForm(inline)
			return openForm(`for ${bindings}\n${ind1}return ${body}`)
		}

		case "some":
		case "every": {
			const bindings = node.bindings.map((b) => `${b.name} in ${t(b.domain)}`).join(", ")
			const sat = t(node.satisfies)
			const inline = `${node.kind} ${bindings} satisfies ${sat}`
			if (fits(inline)) return openForm(inline)
			return openForm(`${node.kind} ${bindings}\n${ind1}satisfies ${sat}`)
		}

		case "between": {
			const v = before(f(node.value), PREC_COMPARE)
			// Bounds are parsed above + and -.
			const lo = before(f(node.low), PREC_ADD + 1)
			const hi = after(f(node.high), PREC_ADD + 1)
			return { text: `${v} between ${lo} and ${hi.text}`, prec: PREC_COMPARE, open: hi.open }
		}

		case "in-test": {
			const v = before(f(node.value), PREC_COMPARE)
			// A list of tests needs its parentheses; a single test is parsed as a
			// whole expression, so the `in` swallows whatever follows it.
			const test =
				node.test.kind === "unary-test-list" ? `(${join(node.test.tests)})` : t(node.test)
			return { text: `${v} in ${test}`, prec: PREC_COMPARE, open: true }
		}

		case "instance-of":
			return {
				text: `${before(f(node.value), PREC_COMPARE)} instance of ${node.typeName}`,
				prec: PREC_COMPARE,
				open: false,
			}

		case "function-def":
			return openForm(`function(${node.params.join(", ")}) ${t(node.body)}`)

		case "unary-test-list":
			return { text: join(node.tests), prec: 0, open: true }

		case "unary-not":
			return atom(`not(${join(node.tests)})`)

		case "any-input":
			return atom("-")
	}
}
