import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const read = (p) => readFileSync(new URL(p, import.meta.url), "utf8")
const pkg = JSON.parse(read("../package.json"))

test("the bin forwards to the shared scaffolder", () => {
	assert.match(
		read("../bin/create-bpmnkit-plugin.js"),
		/import "@bpmnkit\/create-casen-plugin\/dist\/index\.js"/,
	)
})

test("the manifest exposes the new bin name and depends on the scaffolder", () => {
	assert.deepEqual(pkg.bin, { "create-bpmnkit-plugin": "./bin/create-bpmnkit-plugin.js" })
	assert.ok(pkg.dependencies["@bpmnkit/create-casen-plugin"])
})
