import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import { lintForm } from "../src/index.js"

// spec/elements/form.json is the single source for form-js component types (pnpm spec:gen).
const spec = JSON.parse(
	fs.readFileSync(
		path.join(path.dirname(fileURLToPath(import.meta.url)), "../../../spec/elements/form.json"),
		"utf8",
	),
) as { elements: { name: string; traits?: string[] }[] }

const withTrait = (t: string) =>
	spec.elements.filter((e) => e.traits?.includes(t)).map((e) => e.name)

const lint = (component: Record<string, unknown>) =>
	lintForm(JSON.stringify({ id: "f", type: "default", schemaVersion: 16, components: [component] }))
		.filter((f) => f.elementId === "c")
		.map((f) => f.rule)

describe("spec/elements/form.json", () => {
	it("lists 22 component types, and lintForm accepts each", () => {
		expect(spec.elements).toHaveLength(22)
		for (const { name } of spec.elements) {
			expect(
				lint({ id: "c", type: name, key: "k", values: [{ label: "a", value: "a" }] }),
			).not.toContain("form/unknown-type")
		}
	})

	it("flags a type that is not in the spec", () => {
		expect(lint({ id: "c", type: "fancy" })).toContain("form/unknown-type")
	})

	it("flags a keyed type without a key, and only those", () => {
		const keyed = withTrait("keyed")
		expect(keyed).toContain("textfield")
		for (const { name } of spec.elements) {
			const extra = withTrait("options").includes(name)
				? { values: [{ label: "a", value: "a" }] }
				: {}
			const rules = lint({ id: "c", type: name, ...extra })
			expect(rules.includes("form/missing-key"), name).toBe(
				// An expression field may compute a value without binding it, so it needs no key.
				keyed.includes(name) && name !== "expression",
			)
		}
	})

	it("flags an options type without options, and only those", () => {
		const options = withTrait("options")
		expect(options).toEqual(["select", "radio", "checklist", "taglist"])
		for (const { name } of spec.elements) {
			const rules = lint({ id: "c", type: name, key: "k" })
			expect(rules.includes("form/missing-options"), name).toBe(options.includes(name))
		}
	})

	it("scope containers are group and dynamiclist", () => {
		expect(withTrait("scope")).toEqual(["group", "dynamiclist"])
	})
})
