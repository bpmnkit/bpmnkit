#!/usr/bin/env node
// CI guard: fails when a standalone `casen` appears in tracked files outside the allowlist in
// scripts/lib/casen-rules.mjs. `casen` is the alias; docs, help and code say `bpmnkit`.
//
//   node scripts/check-casen.mjs
import { execFileSync } from "node:child_process"
import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { findCasen, isAllowedPath, isCode, isScannable } from "./lib/casen-rules.mjs"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")

const files = execFileSync("git", ["ls-files"], {
	cwd: ROOT,
	encoding: "utf8",
	maxBuffer: 256 * 1024 * 1024,
})
	.split("\n")
	.filter((p) => p && isScannable(p) && !isAllowedPath(p))

const hits = []
for (const path of files) {
	let text
	try {
		text = readFileSync(join(ROOT, path), "utf8")
	} catch {
		continue
	}
	for (const h of findCasen(text, isCode(path)))
		hits.push(`${path}:${h.line}:${h.col}: ${h.text.trim().slice(0, 120)}`)
}

if (hits.length > 0) {
	console.error(`check-casen: ${hits.length} standalone \`casen\` outside the allowlist:`)
	for (const h of hits.slice(0, 50)) console.error(`  ${h}`)
	if (hits.length > 50) console.error(`  … and ${hits.length - 50} more`)
	console.error(
		"\nSay `bpmnkit`. If the word must stay (alias docs, migration code), add the path to scripts/lib/casen-rules.mjs.",
	)
	process.exit(1)
}
console.log(`check-casen: ok (${files.length} files)`)
