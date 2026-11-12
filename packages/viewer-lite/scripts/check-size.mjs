#!/usr/bin/env node
/**
 * Fails when dist/viewer-lite.min.js, gzipped at level 9, is over the 8 KB
 * budget: the viewer is inlined into every exported HTML file. Runs after
 * `scripts/build.mjs` in the package's build.
 */

import { readFileSync } from "node:fs"
import { gzipSync } from "node:zlib"

export const BUDGET = 8_000
const JS = new URL("../dist/viewer-lite.min.js", import.meta.url)

const size = gzipSync(readFileSync(JS), { level: 9 }).length
const kb = (n) => `${(n / 1000).toFixed(1)} KB`
if (size > BUDGET) {
	console.error(`viewer-lite is ${kb(size)} gzip, over its ${kb(BUDGET)} budget.`)
	process.exit(1)
}
console.log(`viewer-lite is ${kb(size)} gzip (budget ${kb(BUDGET)}).`)
