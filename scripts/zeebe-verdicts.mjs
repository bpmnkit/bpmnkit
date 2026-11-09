#!/usr/bin/env node
// Records real Zeebe's deploy verdict on every BPMN under conformance/ and doc/deployability/repro
// into conformance/validate/zeebe-verdicts.json, keyed by path, with each file's sha256 so a
// changed file is known to be stale. The validator's agreement tests (TS and Rust) read it, so
// they run without Java. Needs tools/zeebe-check built (see its README).
//
//   node scripts/zeebe-verdicts.mjs           rewrite the verdicts
//   node scripts/zeebe-verdicts.mjs --check   fail if any verdict is missing or stale (no Java needed)
import { spawnSync } from "node:child_process"
import { createHash } from "node:crypto"
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs"
import { join, relative } from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = join(fileURLToPath(import.meta.url), "../..")
const OUT = join(ROOT, "conformance/validate/zeebe-verdicts.json")
const ZCHECK = join(ROOT, "tools/zeebe-check")

function bpmnFiles(dir) {
	const out = []
	for (const name of readdirSync(dir)) {
		const abs = join(dir, name)
		if (statSync(abs).isDirectory()) out.push(...bpmnFiles(abs))
		else if (name.endsWith(".bpmn")) out.push(relative(ROOT, abs))
	}
	return out
}

const sha = (path) =>
	createHash("sha256")
		.update(readFileSync(join(ROOT, path)))
		.digest("hex")
const files = [
	...bpmnFiles(join(ROOT, "conformance")),
	...bpmnFiles(join(ROOT, "doc/deployability/repro")),
].sort()

if (process.argv.includes("--check")) {
	const recorded = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")).files : {}
	const stale = files.filter((f) => recorded[f]?.sha256 !== sha(f))
	if (stale.length > 0) {
		console.error(
			`Stale Zeebe verdicts (run \`node scripts/zeebe-verdicts.mjs\`):\n  ${stale.join("\n  ")}`,
		)
		process.exit(1)
	}
	console.log(`zeebe-verdicts: ${files.length} files up to date`)
	process.exit(0)
}

if (!existsSync(join(ZCHECK, "out/ZCheck.class"))) {
	console.error("tools/zeebe-check is not built; see tools/zeebe-check/README.md")
	process.exit(1)
}
const pom = readFileSync(join(ZCHECK, "pom.xml"), "utf8")
const zeebeVersion = /<artifactId>zeebe-workflow-engine<\/artifactId>\s*<version>([^<]+)</.exec(
	pom,
)?.[1]
const result = spawnSync(
	"java",
	["-cp", `${join(ZCHECK, "out")}:${join(ZCHECK, "lib/*")}`, "ZCheck", ...files],
	{
		cwd: ROOT,
		encoding: "utf8",
		maxBuffer: 256 * 1024 * 1024,
	},
)
const verdicts = {}
let current
let element = ""
for (const line of result.stdout.split("\n")) {
	const head = /^(OK|FAIL) +(.+)$/.exec(line)
	if (head) {
		current = { sha256: sha(head[2]), ok: head[1] === "OK", errors: [] }
		element = ""
		verdicts[head[2]] = current
		continue
	}
	if (current === undefined) continue
	const el = /^ {2}- Element: (.*)$/.exec(line)
	if (el) {
		element = el[1]
		continue
	}
	const error = /^ +- ERROR: (.*)$/.exec(line)
	if (error) current.errors.push({ element, message: error[1] })
	const parse = /^ {2}PARSE: (.*)$/.exec(line)
	if (parse) current.errors.push({ element: "", message: `PARSE: ${parse[1]}` })
}
const missing = files.filter((f) => verdicts[f] === undefined)
if (missing.length > 0) {
	console.error(`zeebe-check gave no verdict for:\n  ${missing.join("\n  ")}\n${result.stderr}`)
	process.exit(1)
}
writeFileSync(OUT, `${JSON.stringify({ zeebeVersion, files: verdicts }, null, "\t")}\n`)
const rejected = Object.values(verdicts).filter((v) => !v.ok).length
console.log(`zeebe-verdicts: ${files.length} files, ${rejected} rejected by Zeebe ${zeebeVersion}`)
