#!/usr/bin/env node
// Rewrites the standalone command word `casen` to `bpmnkit` in tracked source and docs, outside
// the allowlist in scripts/lib/casen-rules.mjs. Generated files (docspack chunks, READMEs) are
// not touched: rebuild them afterwards with
//   pnpm --filter @bpmnkit/docspack build && node scripts/generate-readmes.mjs
//
//   node scripts/rename-casen.mjs            rewrite in place
//   node scripts/rename-casen.mjs --dry-run  list what would change
//
// A whole quoted literal in code (`"casen"`) is a name or path the code relies on, so it is
// reported for a human instead of rewritten.
import { execFileSync } from "node:child_process"
import { readFileSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { CASEN, isAllowedPath, isCode, isScannable, quotedAt } from "./lib/casen-rules.mjs"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const dry = process.argv.includes("--dry-run")

/** @returns {{ text: string, count: number, manual: string[] }} */
export function rewrite(path, text) {
	const code = isCode(path)
	const manual = []
	let count = 0
	const lines = text.split("\n").map((line, i) => {
		return line.replace(CASEN, (m, offset) => {
			const quoted = code && quotedAt(line, offset)
			if (quoted) {
				manual.push(`${path}:${i + 1}: ${line.trim()}`)
				return m
			}
			count++
			return "bpmnkit"
		})
	})
	return { text: lines.join("\n"), count, manual }
}

if (import.meta.url === `file://${process.argv[1]}`) {
	const files = execFileSync("git", ["ls-files"], {
		cwd: ROOT,
		encoding: "utf8",
		maxBuffer: 256 * 1024 * 1024,
	})
		.split("\n")
		.filter(Boolean)
		.filter((p) => isScannable(p) && !isAllowedPath(p))
	let total = 0
	let changed = 0
	const manual = []
	for (const path of files) {
		let text
		try {
			text = readFileSync(join(ROOT, path), "utf8")
		} catch {
			continue
		}
		const r = rewrite(path, text)
		manual.push(...r.manual)
		if (r.count === 0) continue
		total += r.count
		changed++
		if (dry) console.log(`${path}: ${r.count}`)
		else writeFileSync(join(ROOT, path), r.text)
	}
	console.log(`${dry ? "would rewrite" : "rewrote"} ${total} occurrences in ${changed} files`)
	if (manual.length > 0) {
		console.log(`\n${manual.length} quoted literals left for review:`)
		for (const m of manual) console.log(`  ${m}`)
	}
}
