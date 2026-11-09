import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import { diffBpmn } from "../src/bpmn/bpmn-diff.js"
import { parseBpmn } from "../src/bpmn/bpmn-parser.js"

/**
 * Replays conformance/diff/<case>/ : `diffBpmn(parse(before.bpmn), parse(after.bpmn))`
 * must equal `expected/diff.json` (keys sorted, 2-space indent). The hashes are part
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
			const diff = diffBpmn(parseBpmn(read("before.bpmn")), parseBpmn(read("after.bpmn")))
			const text = `${JSON.stringify(sortKeys(diff), null, 2)}\n`
			const file = path.join(dir, "expected/diff.json")
			if (RECORD) {
				fs.mkdirSync(path.dirname(file), { recursive: true })
				fs.writeFileSync(file, text)
			}
			expect(text).toBe(fs.readFileSync(file, "utf8"))
		})
	}
})
