#!/usr/bin/env -S pnpm exec tsx
/**
 * Renders every corpus case (default fixtures/layout-corpus) to <out>/<case>.png for before/after comparison.
 * Usage: pnpm exec tsx scripts/layout-aesthetics/render-corpus.mjs <out-dir> [--dir folder] [--engine X]
 * Needs a built `packages/core` and Playwright's Chromium.
 */
import { mkdirSync } from "node:fs"
import { createRequire } from "node:module"
import { join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { compileTextSpec, keyThrownMessages } from "../../apps/cli/src/commands/build-spec.ts"
import { dropRewiredEdges } from "../../apps/cli/src/commands/build.ts"
import { exportSvg } from "../../packages/core/dist/index.js"
import { corpusDir, discover, layoutCase } from "./score-lib.mjs"

const args = process.argv.slice(2)
const flag = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined)
const out = resolve(
	args.find((a, i) => !a.startsWith("--") && !args[i - 1]?.startsWith("--")) ?? "layout-corpus-out",
)
const dir = flag("--dir") ? resolve(flag("--dir")) : fileURLToPath(corpusDir)
mkdirSync(out, { recursive: true })

const { chromium } = createRequire(import.meta.url)("playwright")
const browser = await chromium.launch()
const page = await browser.newPage({ deviceScaleFactor: 1 })
const deps = { compileTextSpec, keyThrownMessages, dropRewiredEdges }
for (const c of discover(dir)) {
	const svg = exportSvg(await layoutCase(c, deps, flag("--engine") ?? "semantic"), { padding: 30 })
	await page.setContent(`<html><body style="margin:0;background:#fff">${svg}</body></html>`)
	await (await page.$("svg")).screenshot({ path: join(out, `${c.name}.png`) })
}
await browser.close()
console.log(`rendered to ${out}`)
