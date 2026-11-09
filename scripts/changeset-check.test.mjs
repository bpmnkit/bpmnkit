import assert from "node:assert/strict"
import { test } from "node:test"
import { missingChangesets } from "./changeset-check.mjs"

const pkgs = [
	{ dir: "packages/connectors", name: "@bpmnkit/connectors" },
	{ dir: "packages/core", name: "@bpmnkit/core" },
]

test("flags a changed package without a changeset", () => {
	const r = missingChangesets(
		["packages/connectors/src/a.ts"],
		['---\n"@bpmnkit/core": minor\n---'],
		pkgs,
	)
	assert.deepEqual(
		r.map((p) => p.name),
		["@bpmnkit/connectors"],
	)
})
test("passes when a changeset names it", () => {
	assert.equal(
		missingChangesets(["packages/core/src/a.ts"], ['"@bpmnkit/core": patch'], pkgs).length,
		0,
	)
})
test("ignores tests, docs and non-src files", () => {
	const files = [
		"packages/core/src/a.test.ts",
		"packages/core/src/README.md",
		"packages/core/package.json",
	]
	assert.equal(missingChangesets(files, [], pkgs).length, 0)
})
