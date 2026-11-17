import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import type { FeelNode } from "../src/ast.js"
import { evaluate } from "../src/evaluator.js"
import { formatFeel } from "../src/formatter.js"
import { parseExpression, parseUnaryTests } from "../src/parser.js"

function fmt(input: string): string {
	const { ast } = parseExpression(input)
	if (!ast) return ""
	return formatFeel(ast)
}

describe("formatFeel", () => {
	it("formats number literals", () => {
		expect(fmt("42")).toBe("42")
		expect(fmt("3.14")).toBe("3.14")
	})

	it("formats string literals", () => {
		expect(fmt('"hello"')).toBe('"hello"')
	})

	it("formats boolean literals", () => {
		expect(fmt("true")).toBe("true")
		expect(fmt("false")).toBe("false")
	})

	it("formats null", () => {
		expect(fmt("null")).toBe("null")
	})

	it("formats temporal", () => {
		expect(fmt('@"2021-01-01"')).toBe('@"2021-01-01"')
	})

	it("formats name", () => {
		expect(fmt("myVar")).toBe("myVar")
	})

	it("formats binary expressions", () => {
		expect(fmt("1 + 2")).toBe("1 + 2")
		expect(fmt("a and b")).toBe("a and b")
	})

	it("formats unary minus", () => {
		expect(fmt("-5")).toBe("-5")
	})

	it("formats list", () => {
		expect(fmt("[1, 2, 3]")).toBe("[1, 2, 3]")
	})

	it("formats context", () => {
		expect(fmt("{a: 1}")).toBe("{a: 1}")
	})

	it("formats function call", () => {
		expect(fmt('string length("hi")')).toBe('string length("hi")')
	})

	it("formats if-then-else", () => {
		expect(fmt("if x > 0 then x else 0")).toBe("if x > 0 then x else 0")
	})

	it("formats range", () => {
		expect(fmt("[1..5]")).toBe("[1..5]")
		expect(fmt("(1..5)")).toBe("(1..5)")
	})

	it("formats path access", () => {
		expect(fmt("a.b")).toBe("a.b")
	})

	it("formats between", () => {
		expect(fmt("x between 1 and 10")).toBe("x between 1 and 10")
	})

	it("formats instance of", () => {
		expect(fmt("x instance of number")).toBe("x instance of number")
	})

	it("formats for expression", () => {
		expect(fmt("for x in [1, 2] return x * 2")).toBe("for x in [1, 2] return x * 2")
	})

	it("formats function definition", () => {
		expect(fmt("function(x) x + 1")).toBe("function(x) x + 1")
	})

	it("round-trips simple expressions", () => {
		const cases = ["42", '"hello"', "true", "null", "1 + 2", "a and b", "[1, 2, 3]", "{a: 1}"]
		for (const c of cases) {
			const formatted = fmt(c)
			const { ast: ast2 } = parseExpression(formatted)
			if (!ast2) throw new Error(`Failed to re-parse: ${formatted}`)
			expect(formatFeel(ast2)).toBe(formatted)
		}
	})

	it("formats any-input", () => {
		// any-input is only produced by parseUnaryTests
		const { ast: utAst } = parseUnaryTests("-")
		if (!utAst) return
		expect(formatFeel(utAst)).toBe("-")
	})
})

// The parser drops grouping parentheses, so the formatter must put back the
// ones the printed text needs (issue #291).
const SCOPE = { a: true, b: false, c: false, x: 2, f: 1, g: 2, item: 0 }

/** The tree without source offsets, which formatting moves. */
function shape(node: unknown): string {
	return JSON.stringify(node, (k, v) => (k === "start" || k === "end" ? undefined : v))
}

function roundTrip(input: string): string {
	const first = parseExpression(input)
	expect(first.errors).toEqual([])
	if (!first.ast) throw new Error(`no ast for ${input}`)
	const out = formatFeel(first.ast)
	const second = parseExpression(out)
	expect(second.errors, `${input} => ${out}`).toEqual([])
	if (!second.ast) throw new Error(`no ast for ${out}`)
	expect(shape(second.ast), `${input} => ${out}`).toBe(shape(first.ast))
	expect(evaluate(second.ast, { vars: { ...SCOPE } })).toEqual(
		evaluate(first.ast, { vars: { ...SCOPE } }),
	)
	return out
}

describe("formatFeel parentheses (#291)", () => {
	const issue: Array<[string, string, unknown]> = [
		["(1 + 2) * 3", "(1 + 2) * 3", 9],
		["1 - (2 - 3)", "1 - (2 - 3)", 2],
		["2 ** (3 ** 2)", "2 ** (3 ** 2)", 512],
		["-(2 ** 2)", "-(2 ** 2)", -4],
		["(a or b) and c", "(a or b) and c", false],
		["(if true then 1 else 2) + 10", "(if true then 1 else 2) + 10", 11],
		["(for i in [1, 2] return i) = [1, 2]", "(for i in [1, 2] return i) = [1, 2]", true],
		["x in (1, 2)", "x in (1, 2)", true],
		["5 between (1 + 1) and 10", "5 between (1 + 1) and 10", true],
	]
	for (const [input, expected, value] of issue) {
		it(`keeps ${input}`, () => {
			expect(roundTrip(input)).toBe(expected)
			const { ast } = parseExpression(expected)
			if (!ast) throw new Error("no ast")
			expect(evaluate(ast, { vars: { ...SCOPE } })).toEqual(value)
		})
	}

	it("drops parentheses that are not needed", () => {
		expect(fmt("((1)) + (2 * 3)")).toBe("1 + 2 * 3")
		expect(fmt("(1 - 2) - 3")).toBe("1 - 2 - 3")
		expect(fmt("a or (b and c)")).toBe("a or b and c")
		expect(fmt("10 + (if true then 1 else 2)")).toBe("10 + if true then 1 else 2")
	})

	it("round-trips tricky expressions", () => {
		for (const input of [
			"1 - (2 - (3 - 4))",
			"2 * (3 / 4)",
			"(2 ** 3) ** 2",
			"(-2) ** 2",
			"-(-x)",
			"-(1 + 2)",
			"(a = b) = c",
			"(5 between 1 and 10) and true",
			"1 + 2 between (3 - 1) and 10",
			"(1 + 1 between 0 and 5) = true",
			"x in [1..5]",
			"(x in (1, 2)) or b",
			"(1 + 2) instance of number",
			"(a and b) instance of boolean",
			"(1 + 2).x",
			"(a + b)[1]",
			"{k: (1 + 2) * x}.k",
			"(if a then f else g)(1)",
			"(function(n) n + 1)(2)",
			"(some i in [1] satisfies i > 0) and b",
			"[1, 2, 3][item > 1]",
			"? < 10",
		]) {
			roundTrip(input)
		}
	})

	it("round-trips unary tests", () => {
		for (const input of ["< 10", ">= 1, < 5", "[1..5], not(3)", "-"]) {
			const first = parseUnaryTests(input)
			if (!first.ast) throw new Error(input)
			const out = formatFeel(first.ast)
			const second = parseUnaryTests(out)
			expect(second.errors, out).toEqual([])
			expect(shape(second.ast)).toBe(shape(first.ast))
		}
	})

	it("matches the shared fixture with the Rust formatter", () => {
		const cases = JSON.parse(
			readFileSync(new URL("../../../conformance/feel-format/cases.json", import.meta.url), "utf8"),
		) as Array<{ input: string; output: string }>
		expect(cases.length).toBeGreaterThan(0)
		for (const c of cases) {
			expect(fmt(c.input), c.input).toBe(c.output)
			roundTrip(c.input)
		}
	})
})
