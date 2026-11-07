import assert from "node:assert/strict"
import { spawnSync } from "node:child_process"
import { test } from "node:test"
import { validate } from "./spec-gen.mjs"
import { tsJson } from "./spec-gen/util.mjs"

const schema = {
	type: "object",
	required: ["items"],
	additionalProperties: false,
	properties: {
		items: { type: "array", minItems: 1, uniqueItems: true, items: { $ref: "#/$defs/item" } },
	},
	$defs: {
		item: { type: "object", required: ["name"], properties: { name: { enum: ["a", "b"] } } },
	},
}

test("validate accepts matching data", () => {
	assert.deepEqual(validate({ items: [{ name: "a" }, { name: "b" }] }, schema), [])
})

test("validate reports each problem with its path", () => {
	assert.deepEqual(validate({ items: [{ name: "c" }, {}], extra: 1 }, schema), [
		'$.items[0].name: "c" is not one of ["a","b"]',
		"$.items[1]: missing name",
		"$: unexpected property extra",
	])
	assert.deepEqual(validate({ items: [] }, schema), ["$.items: too few items"])
	assert.deepEqual(validate({ items: "x" }, schema), ["$.items: expected array, got string"])
})

test("tsJson keeps short values on one line", () => {
	assert.equal(tsJson({ a: [1, 2], b: "x" }), '{"a": [1, 2], "b": "x"}')
	assert.equal(
		tsJson(["x".repeat(60), "y".repeat(60)]),
		`[\n\t"${"x".repeat(60)}",\n\t"${"y".repeat(60)}",\n]`,
	)
})

test("committed generated files are up to date", () => {
	const r = spawnSync(process.execPath, ["scripts/spec-gen.mjs", "--check"], { encoding: "utf8" })
	assert.equal(r.status, 0, r.stderr)
})
