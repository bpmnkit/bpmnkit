// `test` script of the five @bpmnkit/cli-<platform> packages: each manifest must be selected by
// exactly its own os/cpu and be pinned by the launcher, or npm installs the wrong binary.
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { PLATFORMS } from "../lib/launch.js"

const read = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), "utf8"))
const launcher = read("../package.json")
const own = JSON.parse(readFileSync("package.json", "utf8"))
const key = own.name.replace("@bpmnkit/cli-", "")
const [os, cpu] = key.split("-")

assert.ok(key in PLATFORMS, `${key} is not a launcher platform`)
assert.deepEqual(own.os, [os])
assert.deepEqual(own.cpu, [cpu])
assert.ok(
	own.name in launcher.optionalDependencies,
	`${own.name} missing from launcher optionalDependencies`,
)
assert.equal(own.version, launcher.version, "platform package and launcher versions move together")
assert.equal(
	Object.keys(launcher.optionalDependencies).length,
	Object.keys(PLATFORMS).length,
	"one optional dependency per platform",
)
console.log(`ok ${own.name}`)
