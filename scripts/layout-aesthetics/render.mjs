#!/usr/bin/env node
/**
 * Lays out every scenario with `applyAutoLayout` and renders it to SVG and PNG.
 * Usage: node scripts/layout-aesthetics/render.mjs <out-dir> [--only S04]
 * Needs a built `packages/core` and Playwright's Chromium (preinstalled in cloud sessions).
 */
import { mkdirSync, writeFileSync } from "node:fs"
import { createRequire } from "node:module"
import { join, resolve } from "node:path"
import { Bpmn, applyAutoLayout, exportSvg } from "../../packages/core/dist/index.js"
import { SCENARIOS } from "./scenarios.mjs"

const args = process.argv.slice(2)
const out = resolve(args.find((a) => !a.startsWith("--")) ?? "layout-aesthetics-out")
const only = args.includes("--only") ? args[args.indexOf("--only") + 1] : undefined
mkdirSync(out, { recursive: true })

const { chromium } = createRequire(import.meta.url)("playwright")
const browser = await chromium.launch()
const page = await browser.newPage({ deviceScaleFactor: 1 })
for (const [name, xml] of Object.entries(SCENARIOS)) {
	if (only && !name.startsWith(only)) continue
	const defs = applyAutoLayout(Bpmn.parse(xml))
	writeFileSync(join(out, `${name}.bpmn`), Bpmn.export(defs))
	const svg = exportSvg(defs, { padding: 30 })
	writeFileSync(join(out, `${name}.svg`), svg)
	await page.setContent(`<html><body style="margin:0;background:#fff">${svg}</body></html>`)
	const el = await page.$("svg")
	await el.screenshot({ path: join(out, `${name}.png`) })
}
await browser.close()
console.log(`rendered to ${out}`)
