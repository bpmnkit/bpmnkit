import { describe, expect, it } from "vitest"
import { ParseError } from "../../src/errors.js"
import { parseForm } from "../../src/form/form-parser.js"
import { exportForm } from "../../src/form/form-serializer.js"

const form = (...components: unknown[]): string =>
	JSON.stringify({ id: "f", type: "default", components })

const roundTrip = (json: string): { components: Record<string, unknown>[] } =>
	JSON.parse(exportForm(parseForm(json)))

describe("form export is lossless", () => {
	it("keeps valuesExpression on radio and checklist", () => {
		const out = roundTrip(
			form(
				{ type: "radio", id: "r", label: "R", key: "r", valuesExpression: "=opts" },
				{ type: "checklist", id: "c", label: "C", key: "c", valuesExpression: "=opts" },
			),
		)
		expect(out.components.map((c) => c.valuesExpression)).toEqual(["=opts", "=opts"])
	})

	it("models the form-js validate keys and keeps the rest", () => {
		const validate = {
			required: true,
			min: 1,
			max: 9,
			pattern: "^a",
			validationType: "email",
			custom: { a: 1 },
			minLength: "3",
		}
		const json = form({ type: "number", id: "n", label: "N", key: "n", validate })
		expect(parseForm(json).components[0]).toMatchObject({
			validate: {
				required: true,
				min: 1,
				max: 9,
				pattern: "^a",
				validationType: "email",
				extraProps: { custom: { a: 1 }, minLength: "3" },
			},
		})
		expect(roundTrip(json).components[0]?.validate).toEqual(validate)
	})

	it("parses validate of datetime and taglist into the model", () => {
		const parsed = parseForm(
			form(
				{ type: "datetime", id: "d", key: "d", validate: { required: true } },
				{ type: "taglist", id: "t", label: "T", key: "t", validate: { required: true } },
			),
		)
		for (const c of parsed.components) {
			expect(c).toMatchObject({ validate: { required: true } })
			expect(c.extraProps).toBeUndefined()
		}
		expect(() => parseForm(form({ type: "datetime", id: "d", key: "d", validate: 3 }))).toThrow(
			"components[0].validate: must be an object",
		)
	})

	it("keeps extra keys on values items and layout", () => {
		const out = roundTrip(
			form({
				type: "select",
				id: "s",
				label: "S",
				key: "s",
				values: [{ label: "A", value: "a", disabled: true }],
				layout: { row: "r1", columns: 4, hint: "x" },
			}),
		)
		expect(out.components[0]?.values).toEqual([{ label: "A", value: "a", disabled: true }])
		expect(out.components[0]?.layout).toEqual({ row: "r1", columns: 4, hint: "x" })
	})
})

describe("form robustness", () => {
	it("round-trips an unknown component with layout: null", () => {
		const out = roundTrip(form({ type: "plugin", id: "p", layout: null }))
		expect(out.components[0]).toEqual({ type: "plugin", id: "p", layout: null })
	})

	it("does not spread a raw extraProps key of an unknown component", () => {
		const out = roundTrip(form({ type: "plugin", id: "p", extraProps: "abc" }))
		expect(out.components[0]).toEqual({ type: "plugin", id: "p", extraProps: "abc" })
	})

	it("rejects a null table column with a ParseError", () => {
		const bad = form({ type: "table", id: "t", columns: [null] })
		expect(() => parseForm(bad)).toThrow(ParseError)
		expect(() => parseForm(bad)).toThrow("components[0].columns[0]: must be an object")
	})
})
