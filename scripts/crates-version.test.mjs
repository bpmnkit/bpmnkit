import assert from "node:assert/strict"
import { test } from "node:test"
import { singleVersion, syncCargo } from "./crates-version.mjs"

test("syncCargo rewrites the workspace version and internal path dependencies", () => {
	const input = [
		"[workspace.package]",
		'version = "0.1.0"',
		'edition = "2021"',
		"",
		"[workspace.dependencies]",
		'serde = { version = "1", features = ["derive"] }',
		'bpmnkit-xml = { path = "crates/bpmnkit-xml", version = "0.1.0" }',
		'bpmnkit-render = { path = "crates/bpmnkit-render", version = "0.1.0", default-features = false }',
	].join("\n")
	const out = syncCargo(input, "0.3.0")
	assert.match(out, /^version = "0.3.0"$/m)
	assert.match(out, /bpmnkit-xml = \{ path = "crates\/bpmnkit-xml", version = "0.3.0" \}/)
	assert.match(out, /version = "0.3.0", default-features = false/)
	assert.match(out, /serde = \{ version = "1"/)
	assert.match(out, /edition = "2021"/)
})

test("syncCargo handles the inline feel dependency and skips path-only and other versions", () => {
	const input = [
		"[package]",
		'version = "9.9.9"',
		"[dependencies]",
		'bpmnkit-feel = { path = "../bpmnkit-feel", version = "0.1.0", default-features = false }',
		'bpmnkit-conformance = { path = "../bpmnkit-conformance" }',
		'quick-xml = "0.36"',
	].join("\n")
	const out = syncCargo(input, "0.2.0")
	assert.match(out, /^version = "9.9.9"$/m)
	assert.match(out, /version = "0.2.0", default-features = false/)
	assert.match(out, /bpmnkit-conformance = \{ path = "..\/bpmnkit-conformance" \}/)
})

test("singleVersion rejects a mix", () => {
	assert.equal(singleVersion(["0.2.0", "0.2.0"]), "0.2.0")
	assert.throws(() => singleVersion(["0.2.0", "0.3.0"]), /one version/)
})
