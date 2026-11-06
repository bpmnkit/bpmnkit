#!/usr/bin/env node
// Packs @bpmnkit/core, installs it into a temp project and reports what an agent that has
// only that package would find. No LLM calls. Needs a built core (pnpm turbo build --filter @bpmnkit/core).
// Usage: node scripts/eval-agent-onboarding/measure.mjs [--json]
// Real before/after run: scripts/eval-agent-onboarding/README.md

import { execFileSync } from "node:child_process"
import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	readdirSync,
	rmSync,
	writeFileSync,
} from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = fileURLToPath(new URL("../..", import.meta.url))
const json = process.argv.includes("--json")
const tokens = (text) => Math.ceil(text.length / 4) // the 4-chars-a-token estimate docspack uses

const work = mkdtempSync(join(tmpdir(), "agent-onboarding-"))
try {
	const coreDir = join(ROOT, "packages/core")
	const out = execFileSync("pnpm", ["pack", "--pack-destination", work], {
		cwd: coreDir,
		encoding: "utf8",
	})
	const tarball = out.trim().split("\n").pop()
	const project = join(work, "project")
	mkdirSync(project)
	writeFileSync(
		join(project, "package.json"),
		JSON.stringify({ name: "agent-project", private: true, type: "module" }),
	)
	// The tarball's own dependencies resolve from the registry; only core is local.
	execFileSync("npm", ["install", "--no-audit", "--no-fund", "--ignore-scripts", tarball], {
		cwd: project,
		stdio: "pipe",
	})

	const pkg = join(project, "node_modules/@bpmnkit/core")
	const read = (p) => (existsSync(join(pkg, p)) ? readFileSync(join(pkg, p), "utf8") : undefined)
	const readme = read("README.md") ?? ""
	const agents = read("AGENTS.md")
	const manifest = JSON.parse(read("package.json"))
	const dts = readdirSync(join(pkg, "dist"), { recursive: true }).filter((f) =>
		String(f).endsWith(".d.ts"),
	)
	const indexDts = read("dist/index.d.ts") ?? ""
	const bpmnDts = read("dist/bpmn/index.d.ts") ?? ""
	const dmnDts = read("dist/dmn/index.d.ts") ?? ""
	const formDts = read("dist/form/index.d.ts") ?? ""

	const checks = {
		"README first 2 KB points at the cards": /agent-cards\/</.test(readme.slice(0, 2048)),
		"README agent block precedes the logo":
			readme.indexOf("Agents:") !== -1 && readme.indexOf("Agents:") < readme.indexOf("<div"),
		"AGENTS.md present (<= 40 lines)": agents !== undefined && agents.split("\n").length <= 40,
		"package.json agents field": manifest.agents === "./AGENTS.md",
		"llms.txt present": read("llms.txt") !== undefined,
		"cards present": ["bpmn", "dmn", "form"].every(
			(k) => read(`agent-cards/${k}.md`) !== undefined,
		),
		"index.d.ts has @packageDocumentation -> AGENTS.md":
			/@packageDocumentation/.test(indexDts) && /AGENTS\.md/.test(indexDts),
		"Bpmn d.ts has @see card": /@see[^\n]*agent-cards\/bpmn\.md/.test(bpmnDts),
		"Dmn d.ts has @see card": /@see[^\n]*agent-cards\/dmn\.md/.test(dmnDts),
		"Form d.ts has @see card": /@see[^\n]*agent-cards\/form\.md/.test(formDts),
	}
	const sizes = {
		"README.md": readme.length,
		"AGENTS.md": agents?.length ?? 0,
		"agent-cards/bpmn.md": read("agent-cards/bpmn.md")?.length ?? 0,
		"agent-cards/dmn.md": read("agent-cards/dmn.md")?.length ?? 0,
		"agent-cards/form.md": read("agent-cards/form.md")?.length ?? 0,
		"dist/*.d.ts (all)": dts.reduce((n, f) => n + read(`dist/${f}`).length, 0),
	}
	const report = {
		checks,
		sizes: Object.fromEntries(
			Object.entries(sizes).map(([k, bytes]) => [k, { bytes, tokens: tokens({ length: bytes }) }]),
		),
		// What the eval's agents read per session before: the README. After: AGENTS.md + one card.
		beforeTokens: tokens(readme),
		afterTokens: tokens(agents ?? "") + tokens(read("agent-cards/bpmn.md") ?? ""),
	}
	if (json) console.log(JSON.stringify(report, null, 2))
	else {
		for (const [name, ok] of Object.entries(checks)) console.log(`${ok ? "PASS" : "FAIL"}  ${name}`)
		for (const [name, s] of Object.entries(report.sizes))
			console.log(`${name.padEnd(22)} ${String(s.bytes).padStart(7)} B  ~${s.tokens} tokens`)
		console.log(
			`README route ~${report.beforeTokens} tokens; AGENTS.md + bpmn card ~${report.afterTokens} tokens`,
		)
	}
	if (!Object.values(checks).every(Boolean)) process.exitCode = 1
} finally {
	rmSync(work, { recursive: true, force: true })
}
