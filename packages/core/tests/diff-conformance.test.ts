import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import { diffBpmn } from "../src/bpmn/bpmn-diff.js"
import { parseBpmn } from "../src/bpmn/bpmn-parser.js"
import { diffToSvg, renderDiffHtml } from "../src/bpmn/diff-html.js"

/**
 * Replays conformance/diff/<case>/ : `diffBpmn(parse(before.bpmn), parse(after.bpmn))`
 * must equal `expected/diff.json` (keys sorted, 2-space indent), and `renderDiffHtml` of it
 * `expected/diff.html` byte for byte, `diffToSvg` `expected/diff.svg` (the Rust twins read
 * the same files). The hashes are part
 * of the file, so `semanticHash` parity with the Rust crate is pinned by it too.
 * `pnpm conformance:record` rewrites the expected files from this implementation.
 */

const RECORD = process.env.CONFORMANCE_RECORD === "1"
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "../../../conformance/diff")

function sortKeys(v: unknown): unknown {
	if (Array.isArray(v)) return v.map(sortKeys)
	if (v !== null && typeof v === "object") {
		return Object.fromEntries(
			Object.keys(v)
				.sort()
				.map((k) => [k, sortKeys((v as Record<string, unknown>)[k])]),
		)
	}
	return v
}

const cases = fs.existsSync(root)
	? fs
			.readdirSync(root, { withFileTypes: true })
			.filter((d) => d.isDirectory())
			.map((d) => d.name)
			.sort()
	: []

describe("conformance/diff", () => {
	it("has cases", () => {
		expect(cases.length).toBeGreaterThan(0)
	})
	for (const name of cases) {
		it(name, () => {
			const dir = path.join(root, name)
			const read = (f: string): string => fs.readFileSync(path.join(dir, f), "utf8")
			const before = parseBpmn(read("before.bpmn"))
			const after = parseBpmn(read("after.bpmn"))
			const diff = diffBpmn(before, after)
			const outputs = {
				"expected/diff.json": `${JSON.stringify(sortKeys(diff), null, 2)}\n`,
				"expected/diff.html": renderDiffHtml(before, after, diff, { title: name }),
				"expected/diff.svg": diffToSvg(after, diff),
			}
			for (const [rel, text] of Object.entries(outputs)) {
				const file = path.join(dir, rel)
				if (RECORD) {
					fs.mkdirSync(path.dirname(file), { recursive: true })
					fs.writeFileSync(file, text)
				}
				expect(text).toBe(fs.readFileSync(file, "utf8"))
			}
		})
	}
})
