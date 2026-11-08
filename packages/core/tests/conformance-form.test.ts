import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import { ParseError } from "../src/errors.js"
import { parseForm } from "../src/form/form-parser.js"
import { exportForm } from "../src/form/form-serializer.js"

/**
 * Replays conformance/form/<case>/ against this package: parseForm(input.form)
 * must equal expected/model.json and exportForm of it must equal
 * expected/roundtrip.form. A form parseForm rejects has expected/error.txt (the
 * ParseError message) instead of the other two. The files are the contract the
 * Rust implementation is checked against (see conformance/README.md);
 * `pnpm conformance:record` rewrites them from this implementation, which is the
 * oracle.
 */

const RECORD = process.env.CONFORMANCE_RECORD === "1"
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "../../../conformance/form")

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

type Produced = { ok: { model: string; roundtrip: string } } | { error: string }

function produce(input: string): Produced {
	try {
		const form = parseForm(input)
		return {
			ok: {
				model: `${JSON.stringify(sortKeys(form), null, 2)}\n`,
				roundtrip: exportForm(form),
			},
		}
	} catch (e) {
		// Only ParseError is part of the contract; anything else is a bug to fix, not to record.
		if (e instanceof ParseError) return { error: `${e.message}\n` }
		throw e
	}
}

const cases = fs.existsSync(root)
	? fs
			.readdirSync(root, { withFileTypes: true })
			.filter((d) => d.isDirectory())
			.map((d) => d.name)
			.sort()
	: []

const read = (dir: string, file: string): string =>
	fs.readFileSync(path.join(dir, "expected", file), "utf8")

describe("conformance/form", () => {
	it("has cases", () => {
		expect(cases.length).toBeGreaterThan(0)
	})
	for (const name of cases) {
		const dir = path.join(root, name)
		const out = produce(fs.readFileSync(path.join(dir, "input.form"), "utf8"))
		if (RECORD) {
			fs.rmSync(path.join(dir, "expected"), { recursive: true, force: true })
			fs.mkdirSync(path.join(dir, "expected"), { recursive: true })
			if ("ok" in out) {
				fs.writeFileSync(path.join(dir, "expected/model.json"), out.ok.model)
				fs.writeFileSync(path.join(dir, "expected/roundtrip.form"), out.ok.roundtrip)
			} else {
				fs.writeFileSync(path.join(dir, "expected/error.txt"), out.error)
			}
		}
		describe(name, () => {
			if ("ok" in out) {
				const ok = out.ok
				it("parses to model.json", () => {
					expect(ok.model).toBe(read(dir, "model.json"))
				})
				it("exports to roundtrip.form", () => {
					expect(ok.roundtrip).toBe(read(dir, "roundtrip.form"))
				})
			} else {
				const error = out.error
				it("fails with error.txt", () => {
					expect(error).toBe(read(dir, "error.txt"))
				})
			}
		})
	}
})
