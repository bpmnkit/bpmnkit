import { describe, expect, it } from "vitest"
import { lintForm } from "../src/index.js"

function form(components: unknown[], root: Record<string, unknown> = {}): string {
	return JSON.stringify({
		id: "order-form",
		type: "default",
		schemaVersion: 16,
		components,
		...root,
	})
}

function rules(json: string): string[] {
	return lintForm(json).map((f) => f.rule)
}

const field = (id: string, key: string, extra: Record<string, unknown> = {}) => ({
	id,
	type: "textfield",
	key,
	label: "x",
	...extra,
})

describe("lintForm", () => {
	it("reports nothing on a valid form", () => {
		const json = form([
			field("f1", "amount", { conditional: { hide: "=amount > 10" } }),
			{ id: "s1", type: "select", key: "tier", values: [{ label: "Gold", value: "gold" }] },
			{ id: "x1", type: "expression", key: "total", expression: "=amount * 2" },
			{ id: "b1", type: "button", action: "submit" },
			{ id: "t1", type: "text", text: "Hello {{name}}" },
		])
		expect(lintForm(json)).toEqual([])
	})

	it("form/invalid-json", () => {
		expect(rules("{ id: 1, }")).toEqual(["form/invalid-json"])
	})

	it("form/invalid-schema: not an object, wrong type, no components, bad schemaVersion, bad component", () => {
		expect(rules("[]")).toEqual(["form/invalid-schema"])
		expect(rules(form([], { type: "form" }))).toEqual(["form/invalid-schema"])
		expect(rules(JSON.stringify({ id: "a", type: "default" }))).toEqual(["form/invalid-schema"])
		const sv = lintForm(form([], { schemaVersion: "16" }))
		expect(sv.map((f) => [f.rule, f.severity])).toEqual([["form/invalid-schema", "warning"]])
		expect(rules(form([42]))).toEqual(["form/invalid-schema"])
		expect(rules(form([{ id: "a" }]))).toEqual(["form/invalid-schema"])
		expect(rules(form([{ id: "b1", type: "button", action: "send" }]))).toEqual([
			"form/invalid-schema",
		])
	})

	it("form/missing-id on the form and on a component", () => {
		expect(rules(form([], { id: undefined }))).toEqual(["form/missing-id"])
		expect(rules(form([{ type: "textfield", key: "a" }]))).toEqual(["form/missing-id"])
	})

	it("form/unknown-type is a warning", () => {
		const [f] = lintForm(form([{ id: "c", type: "slider" }]))
		expect([f?.rule, f?.severity, f?.elementId]).toEqual(["form/unknown-type", "warning", "c"])
	})

	it("form/duplicate-id, including nested components", () => {
		const json = form([
			field("f1", "a"),
			{ id: "g", type: "group", components: [field("f1", "b")] },
		])
		expect(rules(json)).toEqual(["form/duplicate-id"])
	})

	it("form/duplicate-key within a scope, not across a group path", () => {
		expect(rules(form([field("f1", "a"), field("f2", "a")]))).toEqual(["form/duplicate-key"])
		const scoped = form([
			field("f1", "a"),
			{ id: "g", type: "group", path: "nested", components: [field("f2", "a")] },
		])
		expect(rules(scoped)).toEqual([])
		const unscoped = form([
			field("f1", "a"),
			{ id: "g", type: "group", components: [field("f2", "a")] },
		])
		expect(rules(unscoped)).toEqual(["form/duplicate-key"])
	})

	it("form/missing-key on an input field, but not on an unbound expression field", () => {
		const [f] = lintForm(form([{ id: "f1", type: "number" }]))
		expect([f?.rule, f?.elementId]).toEqual(["form/missing-key", "f1"])
		expect(rules(form([{ id: "x", type: "expression", expression: "=1" }]))).toEqual([])
	})

	it("form/invalid-key", () => {
		expect(rules(form([field("f1", "1st-name")]))).toEqual(["form/invalid-key"])
		expect(rules(form([field("f1", "customer.name")]))).toEqual([])
	})

	it("form/missing-options", () => {
		expect(rules(form([{ id: "s", type: "radio", key: "r" }]))).toEqual(["form/missing-options"])
		expect(rules(form([{ id: "s", type: "radio", key: "r", valuesKey: "opts" }]))).toEqual([])
	})

	it("form/missing-expression", () => {
		expect(rules(form([{ id: "x", type: "expression", key: "t" }]))).toEqual([
			"form/missing-expression",
		])
	})

	it("form/conditional-not-feel", () => {
		const [f] = lintForm(form([field("f1", "a", { conditional: { hide: "a > 1" } })]))
		expect(f?.rule).toBe("form/conditional-not-feel")
		expect(f?.fix).toContain('"=a > 1"')
	})

	it("form/feel-syntax in conditions, expressions and nested properties", () => {
		expect(rules(form([field("f1", "a", { conditional: { hide: "=a * " } })]))).toEqual([
			"form/feel-syntax",
		])
		expect(rules(form([{ id: "x", type: "expression", key: "t", expression: "=1 +" }]))).toEqual([
			"form/feel-syntax",
		])
		expect(rules(form([field("f1", "a", { readonly: "=(a", label: '="ok"' })]))).toEqual([
			"form/feel-syntax",
		])
	})

	it("form/invalid-validation: bad pattern and impossible ranges", () => {
		expect(rules(form([field("f1", "a", { validate: { pattern: "([a-z" } })]))).toEqual([
			"form/invalid-validation",
		])
		expect(rules(form([field("f1", "a", { validate: { minLength: 5, maxLength: 2 } })]))).toEqual([
			"form/invalid-validation",
		])
		expect(
			rules(form([{ id: "n", type: "number", key: "n", validate: { min: 1, max: 10 } }])),
		).toEqual([])
	})
})
