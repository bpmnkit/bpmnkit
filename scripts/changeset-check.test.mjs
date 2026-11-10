import assert from "node:assert/strict"
import { test } from "node:test"
import { crateRuntime, missingChangesets } from "./changeset-check.mjs"

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

const crates = [{ dir: "crates/bpmnkit-xml", name: "@crates/bpmnkit-xml", runtime: crateRuntime }]
test("crates need a changeset for src, build.rs and Cargo.toml", () => {
	for (const f of ["src/lib.rs", "src/a/b.rs", "build.rs", "Cargo.toml"]) {
		assert.equal(missingChangesets([`crates/bpmnkit-xml/${f}`], [], crates).length, 1, f)
	}
})
test("crates ignore tests, benches, examples, scripts and docs", () => {
	const files = ["tests/a.rs", "benches/b.rs", "examples/c.rs", "scripts/d.sh", "README.md"]
	const changed = files.map((f) => `crates/bpmnkit-xml/${f}`)
	assert.equal(missingChangesets(changed, [], crates).length, 0)
})
test("a changeset naming the crate satisfies it", () => {
	const changed = ["crates/bpmnkit-xml/src/lib.rs"]
	assert.equal(missingChangesets(changed, ['"@crates/bpmnkit-xml": minor'], crates).length, 0)
})
