#!/usr/bin/env node
/**
 * Fails when apps/reebe-wasm/reebe_wasm_bg.wasm, gzipped at level 9, is over
 * the budget. CI runs it after building reebe-wasm.
 *
 * The goal is 500 KB; the budget is the size reached on 2026-11-08 plus ~3%,
 * so growth is caught while the gap stays open (see doc/progress.md).
 */

import { readFileSync } from "node:fs"
import { gzipSync } from "node:zlib"

const BUDGET = 640_000
const WASM = new URL("../apps/reebe-wasm/reebe_wasm_bg.wasm", import.meta.url)

const size = gzipSync(readFileSync(WASM), { level: 9 }).length
const kb = (n) => `${(n / 1000).toFixed(1)} KB`
if (size > BUDGET) {
	console.error(`reebe-wasm is ${kb(size)} gzip, over its ${kb(BUDGET)} budget.`)
	process.exit(1)
}
console.log(`reebe-wasm is ${kb(size)} gzip (budget ${kb(BUDGET)}).`)
