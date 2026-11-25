import { describe, expect, it } from "vitest"
import { FeelNumber, evaluate, fromJs, isFeelNumber, parseExpression, toJs } from "../src/index.js"
import type { FeelValue } from "../src/index.js"

/**
 * Issue #320: FEEL numbers are DMN Decimal128 (34 significant digits, HALF_EVEN), as Camunda 8
 * evaluates them with feel-scala's BigDecimal. Each row of the issue's comparison against
 * Camunda 8.10.10 is pinned here, along with the conversion of plain JS numbers at the API edge.
 */

function ev(src: string, vars: Record<string, unknown> = {}): FeelValue {
	const { ast, errors } = parseExpression(src, { names: Object.keys(vars) })
	if (!ast || errors.length > 0) throw new Error(`cannot parse ${src}: ${errors[0]?.message}`)
	return evaluate(ast, { vars })
}

function text(v: FeelValue): string {
	if (!isFeelNumber(v)) throw new Error(`not a number: ${String(v)}`)
	return v.toString()
}

describe("Decimal128 semantics (issue #320, compared with Camunda 8.10.10)", () => {
	it("0.1 + 0.2 is 0.3", () => {
		expect(text(ev("0.1 + 0.2"))).toBe("0.3")
	})

	it("0.1 + 0.2 = 0.3 is true", () => {
		expect(ev("0.1 + 0.2 = 0.3")).toBe(true)
	})

	it("0.1 + 0.2 <= 0.3 is true", () => {
		expect(ev("0.1 + 0.2 <= 0.3")).toBe(true)
	})

	it("0.7 + 0.1 >= 0.8 is true", () => {
		expect(ev("0.7 + 0.1 >= 0.8")).toBe(true)
	})

	it("sum([0.1, 0.2, 0.3]) = 0.6 is true", () => {
		expect(ev("sum([0.1, 0.2, 0.3]) = 0.6")).toBe(true)
	})

	it("amount * 1.1 with amount = 100 is 110.0, and not above 110", () => {
		expect(text(ev("amount * 1.1", { amount: 100 }))).toBe("110.0")
		expect(ev("string(amount * 1.1)", { amount: 100 })).toBe("110.0")
		expect(ev("amount * 1.1 <= 110", { amount: 100 })).toBe(true)
	})

	it("floor(0.29 * 100) is 29", () => {
		expect(text(ev("floor(0.29 * 100)"))).toBe("29")
	})

	it("ceiling(0.1 * 3 * 10) is 3", () => {
		expect(text(ev("ceiling(0.1 * 3 * 10)"))).toBe("3")
	})

	it("1 / 3 has 34 significant digits", () => {
		expect(ev("string(1 / 3)")).toBe(`0.${"3".repeat(34)}`)
	})

	it("10 / 3 * 3 = 10 is false, as the quotient is rounded to 34 digits", () => {
		expect(ev("10 / 3 * 3 = 10")).toBe(false)
		expect(ev("string(10 / 3 * 3)")).toBe(`9.${"9".repeat(33)}`)
	})

	it("9007199254740993 + 1 is 9007199254740994 (integers past 2^53 stay exact)", () => {
		expect(text(ev("9007199254740993 + 1"))).toBe("9007199254740994")
		expect(text(ev("9007199254740993"))).toBe("9007199254740993")
	})

	it("2 ** 0.5 and sqrt(2) are 1.4142135623730951", () => {
		expect(text(ev("2 ** 0.5"))).toBe("1.4142135623730951")
		expect(text(ev("sqrt(2)"))).toBe("1.4142135623730951")
	})
})

describe("exact built-ins", () => {
	it("rounds with Java's setScale, keeping the scale", () => {
		expect(ev("string(decimal(1/3, 2))")).toBe("0.33")
		expect(ev("string(decimal(1, 2))")).toBe("1.00")
		expect(ev("string(round half up(1234.5, -2))")).toBe("1200")
		expect(ev("string(floor(-0.5))")).toBe("-1")
	})

	it("averages and aggregates in decimal", () => {
		expect(ev("mean([0.1, 0.2]) = 0.15")).toBe(true)
		expect(ev("median([0.1, 0.2]) = 0.15")).toBe(true)
		expect(ev("product([0.1, 0.1]) = 0.01")).toBe(true)
		expect(ev("modulo(1000000, -0.1) = 0")).toBe(true)
	})

	it("compares list members by value, whatever their scale", () => {
		expect(ev("list contains([1.0, 2], 1)")).toBe(true)
		expect(toJs(ev("index of([1, 2, 1.0], 1)"))).toEqual([1, 3])
		expect(toJs(ev("distinct values([1, 1.0, 2])"))).toEqual([1, 2])
		expect(toJs(ev("duplicate values([1, 1.0, 2])"))).toEqual([1])
		expect(toJs(ev("mode([1, 1.0, 2])"))).toEqual([1])
	})

	it("keeps every digit through JSON", () => {
		expect(ev("to json({a: 1/4, b: 100 * 1.1})")).toBe('{"a":0.25,"b":110.0}')
		expect(ev('from json("9007199254740993") + 1 = 9007199254740994')).toBe(true)
	})

	it("returns counts, lengths, positions and date fields as FEEL numbers", () => {
		for (const src of [
			"count([1, 2])",
			'string length("abc")',
			'@"2024-03-05".month',
			'day of year(@"2024-03-05")',
			'week of year(@"2024-03-05")',
			'@"P1Y" / @"P1M"',
		]) {
			expect(isFeelNumber(ev(src)), src).toBe(true)
		}
	})
})

describe("JS values at the API edge", () => {
	it("converts plain JS numbers in variables, nested in lists and contexts", () => {
		const vars = { a: 0.1, list: [0.2, [0.3]], ctx: { x: { y: 0.4 } } }
		expect(ev("a + list[1] + list[2][1] + ctx.x.y = 1", vars)).toBe(true)
		expect(ev("a instance of number", vars)).toBe(true)
	})

	it("converts bigint variables exactly", () => {
		expect(text(ev("n + 1", { n: 9007199254740993n }))).toBe("9007199254740994")
	})

	it("treats non-finite numbers and undefined as null", () => {
		expect(ev("x = null", { x: Number.NaN })).toBe(true)
		expect(ev("x = null", { x: undefined })).toBe(true)
	})

	it("fromJs leaves FEEL values as they are", () => {
		const date = { type: "date", year: 2024, month: 1, day: 2 } as const
		expect(fromJs(date)).toBe(date)
		const n = FeelNumber.from("1.50")
		expect(fromJs(n)).toBe(n)
		expect(fromJs({ a: [1, "x", true, null] })).toEqual({
			a: [FeelNumber.from(1), "x", true, null],
		})
	})

	it("toJs turns FEEL numbers back into JS numbers, deeply", () => {
		const value = ev('{a: 0.1 + 0.2, b: [1, 2.5, {c: 1/4}], d: @"2024-01-02", s: "x"}')
		expect(toJs(value)).toEqual({
			a: 0.3,
			b: [1, 2.5, { c: 0.25 }],
			d: { type: "date", year: 2024, month: 1, day: 2 },
			s: "x",
		})
		expect(toJs(ev("[1..3]"))).toEqual({
			type: "range",
			start: 1,
			startIncluded: true,
			end: 3,
			endIncluded: true,
		})
		expect(toJs(null)).toBe(null)
	})

	it("serialises a FEEL number to JSON as a number", () => {
		expect(JSON.stringify(ev("{a: 1/4}"))).toBe('{"a":0.25}')
	})
})
