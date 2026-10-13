// Run with: node --test scripts/docspack-nudge.test.mjs
import assert from "node:assert/strict"
import { test } from "node:test"
import { classify } from "./docspack-nudge.mjs"

const bash = (command) => classify("Bash", { command })?.[0] ?? null

test("sweeps over the code are nudged toward repo-code", () => {
	assert.equal(bash('grep -rE "render|mount" packages'), "code")
	assert.equal(bash('grep -rn "a\\|b" apps/web/src'), "code")
	assert.equal(bash('rg "foo|bar" .'), "code")
	assert.equal(bash('grep -rE "job|worker" plugins-cli'), "code")
	assert.equal(classify("Grep", { pattern: "hypot|sqrt", path: "packages" })?.[0], "code")
	assert.equal(classify("Grep", { pattern: "a|b" })?.[0], "code")
	assert.equal(classify("Glob", { pattern: "**/*.ts" })?.[0], "code")
})

test("sweeps over the docs are nudged toward repo-docs", () => {
	assert.equal(bash('grep -rE "deploy|release" docs'), "docs")
	assert.equal(classify("Grep", { pattern: "a|b", path: "doc" })?.[0], "docs")
})

test("targeted lookups stay silent", () => {
	assert.equal(bash("grep -rn createStore apps/web/src"), null)
	assert.equal(bash('grep -n "a|b" packages/ui/src/button.ts'), null)
	assert.equal(bash('ls packages | grep -iE "ui|core"'), null)
	assert.equal(classify("Grep", { pattern: "createStore", path: "packages" }), null)
	assert.equal(classify("Glob", { pattern: "packages/ui/src/*.tsx" }), null)
	assert.equal(classify("Read", { file_path: "README.md" }), null)
})

test("recall and ask calls are logged as used, with no message", () => {
	assert.deepEqual(classify("Bash", { command: 'npx docspack recall --name repo-code "a|b"' }), [
		"used",
		null,
	])
})
