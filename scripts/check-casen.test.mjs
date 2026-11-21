import assert from "node:assert/strict"
import test from "node:test"
import { CASEN, findCasen, isAllowedPath } from "./lib/casen-rules.mjs"
import { rewrite } from "./rename-casen.mjs"

const hits = (s) => [...s.matchAll(CASEN)].length

test("standalone command word matches", () => {
	assert.equal(hits("run casen dev"), 1)
	assert.equal(hits("`casen` and casen."), 2)
	assert.equal(hits("casen"), 1)
})

test("longer names, paths, files and env prefixes stay", () => {
	for (const s of [
		"casen-report",
		"create-casen-plugin",
		"CasenPlugin",
		"~/.casen/plugins",
		"$XDG_CONFIG_HOME/casen/config.json",
		"/docs/cli/casen",
		"casen.md",
		"casen/plugins",
		"CASEN_PROFILE",
		"@acme/casen-deploy",
		"casenumber",
	])
		assert.equal(hits(s), 0, s)
})

test("the alias being documented stays", () => {
	assert.equal(hits("bpmnkit (alias casen)"), 0)
	assert.equal(hits("alias `casen`"), 0)
	assert.equal(hits("alias: casen"), 0)
	assert.equal(hits("the casen alias"), 1)
})

test("quoted literals in code are deliberate; in prose they are not", () => {
	assert.deepEqual(findCasen('const BINARY = "casen"', true), [])
	assert.equal(findCasen('say "casen" here', false).length, 1)
})

test("rewrite renames prose and reports quoted code literals", () => {
	const r = rewrite("a.ts", 'run casen dev\nconst n = "casen"\nsee casen-report')
	assert.equal(r.text, 'run bpmnkit dev\nconst n = "casen"\nsee casen-report')
	assert.equal(r.count, 1)
	assert.equal(r.manual.length, 1)
})

test("history and migration code are allowlisted", () => {
	assert.ok(isAllowedPath("apps/cli/CHANGELOG.md"))
	assert.ok(isAllowedPath("doc/progress.md"))
	assert.ok(isAllowedPath("packages/profiles/src/index.ts"))
	assert.ok(!isAllowedPath("apps/landing/src/content/docs/cli/dev.md"))
})
