import assert from "node:assert/strict"
import { test } from "node:test"
import { needsOtp, parseTrustList, planPackage } from "./npm-trust.mjs"

const gh = (id, file, extra = {}) => ({
	id,
	type: "github",
	file,
	repository: "bpmnkit/bpmnkit",
	...extra,
})

test("parses the blank-line separated objects of `npm trust list --json`", () => {
	const out = `{\n  "id": "a",\n  "type": "github"\n}\n\n{\n  "id": "b",\n  "type": "github"\n}\n`
	assert.deepEqual(
		parseTrustList(out).map((c) => c.id),
		["a", "b"],
	)
	assert.deepEqual(parseTrustList(""), [])
})

test("creates when nothing is configured", () => {
	assert.deepEqual(planPackage([], "release.yml"), { revoke: [], create: true, foreign: [] })
})

test("skips a package that already trusts the workflow", () => {
	const p = planPackage([gh("a", "release-cli.yml")], "release-cli.yml")
	assert.equal(p.create, false)
	assert.deepEqual(p.revoke, [])
})

test("revokes this repo's other workflow before creating (@bpmnkit/cli moves)", () => {
	const p = planPackage([gh("old", "release.yml")], "release-cli.yml")
	assert.deepEqual(p.revoke, ["old"])
	assert.equal(p.create, true)
})

test("treats a config with an environment as not matching", () => {
	const p = planPackage([gh("e", "release.yml", { environment: "npm" })], "release.yml")
	assert.deepEqual(p.revoke, ["e"])
})

test("leaves other repositories alone", () => {
	const other = gh("x", "release.yml", { repository: "someone/else" })
	const p = planPackage([other], "release.yml")
	assert.deepEqual(p.revoke, [])
	assert.deepEqual(p.foreign, [other])
	assert.equal(p.create, true)
})

test("detects npm's one-time-password refusal", () => {
	assert.equal(
		needsOtp("npm error code EOTP\nnpm error This operation requires a one-time password."),
		true,
	)
	assert.equal(needsOtp("npm error code E404"), false)
})
