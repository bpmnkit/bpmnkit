#!/usr/bin/env node
/**
 * PreToolUse hook: nudge broad repository sweeps toward `docspack recall`.
 *
 * Never blocks. Prints `additionalContext` for the model when a tool call
 * looks like a sweep the index answers more cheaply: an alternation or
 * recursive grep over the repo, `packages/`, `apps/` or the docs, or a
 * whole-tree glob. Grepping a name you already know stays silent, as
 * CLAUDE.md says grep is as good there.
 *
 * Every nudge and every `docspack recall|ask` call is appended to
 * `.docspack/nudge.log` so a later session can count whether recall was used.
 *
 *   echo '{"tool_name":"Grep","tool_input":{"pattern":"a|b","path":"packages"}}' | node scripts/docspack-nudge.mjs
 */
import { appendFileSync, mkdirSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const LOG = join(ROOT, ".docspack", "nudge.log")

const CODE =
	'Before sweeping the repo, ask the index: `npx docspack recall --name repo-code "<what the code does>"` ' +
	"answers with file:line and signature; then read only that range. Phrase the query the way the code " +
	"names it (it matches words more than meaning). Grep is fine for a name you already know."
const DOCS =
	'Ask the docs index first: `npx docspack recall --name repo-docs "<question>"` points at the section; ' +
	"then read only that range."

const CODE_DIR = /(^|[\s'"/])(packages|apps|src|plugins-cli|plugins-claude)(\/|\s|$|['"])/
const DOCS_DIR = /(^|[\s'"/])(docs?)(\/|\s|$|['"])/

/** Returns [kind, message] for a call worth nudging, or null. */
export function classify(tool, input) {
	if (!input) return null
	if (tool === "Grep") {
		const path = String(input.path ?? "")
		if (!/\|/.test(String(input.pattern ?? ""))) return null
		if (DOCS_DIR.test(path)) return ["docs", DOCS]
		if (path === "" || path === "." || path === ROOT || CODE_DIR.test(path)) return ["code", CODE]
		return null
	}
	if (tool === "Glob") {
		const pattern = String(input.pattern ?? "")
		if (/^(\*\*|packages|apps)\/(\*\*?\/)?\*?\*?\.?\w*$|^\*\*\/\*\.\w+$/.test(pattern)) {
			return ["code", CODE]
		}
		return null
	}
	if (tool === "Bash") {
		const rawCmd = String(input.command ?? "")
		if (/docspack\s+(recall|ask)/.test(rawCmd)) return ["used", null]
		// Mask quoted arguments so a `|` inside a pattern is not read as a pipe.
		const cmd = rawCmd.replace(/"[^"]*"|'[^']*'/g, (q) => (q.includes("|") ? " ALT " : " Q "))
		for (const s of cmd.match(/\b(grep|rg)\b[^|;&]*/g) ?? []) {
			const recursive = /\s-[a-zA-Z]*[rRl]/.test(s) || /^rg\b/.test(s)
			const sweep = /\\\||\sALT\s|\s-[a-zA-Z]*E/.test(s)
			if (!recursive || !sweep) continue
			if (DOCS_DIR.test(s)) return ["docs", DOCS]
			if (CODE_DIR.test(s) || /\s\.(\s|$)/.test(s)) return ["code", CODE]
		}
		return null
	}
	return null
}

function log(line) {
	try {
		mkdirSync(dirname(LOG), { recursive: true })
		appendFileSync(LOG, `${new Date().toISOString()} ${line}\n`)
	} catch {
		// Logging is best effort; a nudge must never fail the tool call.
	}
}

async function main() {
	let raw = ""
	for await (const chunk of process.stdin) raw += chunk
	let payload
	try {
		payload = JSON.parse(raw)
	} catch {
		return
	}
	const hit = classify(payload.tool_name, payload.tool_input)
	if (!hit) return
	const [kind, message] = hit
	log(`${kind} ${payload.tool_name} ${payload.agent_id ?? payload.session_id ?? "-"}`)
	if (!message) return
	process.stdout.write(
		JSON.stringify({
			hookSpecificOutput: { hookEventName: "PreToolUse", additionalContext: message },
		}),
	)
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	main()
}
