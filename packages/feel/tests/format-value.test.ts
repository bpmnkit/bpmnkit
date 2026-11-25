import { describe, expect, it } from "vitest"
import { evaluate, formatFeelValue, parseExpression } from "../src/index.js"

function show(src: string): string {
	const { ast, errors } = parseExpression(src)
	if (!ast || errors.length > 0) throw new Error(`parse failed: ${src}`)
	return formatFeelValue(evaluate(ast, { vars: {} }))
}

// #320: nested numbers must keep the digits and scale that a JS number would lose.
describe("formatFeelValue", () => {
	it("writes scalars as the playgrounds do", () => {
		expect(show("null")).toBe("null")
		expect(show('"a"')).toBe('"a"')
		expect(show("true")).toBe("true")
		expect(show("100 * 1.10")).toBe("110.00")
	})

	it("keeps nested numbers exact", () => {
		expect(show("[1 / 3]")).toBe("[\n  0.3333333333333333333333333333333333\n]")
		expect(show("{a: 100 * 1.1, b: [9007199254740993 + 1]}")).toBe(
			'{\n  "a": 110.0,\n  "b": [\n    9007199254740994\n  ]\n}',
		)
	})

	it("writes empty composites and non-number leaves as JSON", () => {
		expect(show("[]")).toBe("[]")
		expect(show("{}")).toBe("{}")
		expect(show('[true, "x", null]')).toBe('[\n  true,\n  "x",\n  null\n]')
	})

	it("writes ranges with exact bounds", () => {
		expect(show("[0.1 + 0.2..1]")).toBe(
			'{\n  "type": "range",\n  "start": 0.3,\n  "startIncluded": true,\n  "end": 1,\n  "endIncluded": true\n}',
		)
	})
})
