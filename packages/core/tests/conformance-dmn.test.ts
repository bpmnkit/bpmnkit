import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import { parseDmn } from "../src/dmn/dmn-parser.js"
import { serializeDmn } from "../src/dmn/dmn-serializer.js"

/**
 * Replays conformance/dmn/<case>/ against this package. A case either
 *  - parses: parse(input.dmn) must equal expected/model.json and
 *    serialize(parse(input.dmn)) must equal expected/roundtrip.dmn, or
 *  - fails: parse(input.dmn) must throw, with the message in expected/error.txt
 *    (one line, trailing newline), and the case has no model.json/roundtrip.dmn.
 * The files are the contract the Rust implementation is checked against (see
 * conformance/README.md); `pnpm conformance:record` rewrites them from this
 * implementation, which is the oracle.
 */

const RECORD = process.env.CONFORMANCE_RECORD === "1"
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "../../../conformance/dmn")

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

type Produced = { error: string } | { model: string; roundtrip: string }

function produce(xml: string): Produced {
	try {
		const defs = parseDmn(xml)
		return {
			model: `${JSON.stringify(sortKeys(defs), null, 2)}\n`,
			roundtrip: serializeDmn(defs),
		}
	} catch (e) {
		return { error: `${(e as Error).message}\n` }
	}
}

const cases = fs.existsSync(root)
	? fs
			.readdirSync(root, { withFileTypes: true })
			.filter((d) => d.isDirectory())
			.map((d) => d.name)
			.sort()
	: []

describe("conformance/dmn", () => {
	it("has cases", () => {
		expect(cases.length).toBeGreaterThan(0)
	})
	for (const name of cases) {
		const dir = path.join(root, name)
		const expected = path.join(dir, "expected")
		const out = produce(fs.readFileSync(path.join(dir, "input.dmn"), "utf8"))
		if (RECORD) {
			fs.rmSync(expected, { recursive: true, force: true })
			fs.mkdirSync(expected, { recursive: true })
			if ("error" in out) {
				fs.writeFileSync(path.join(expected, "error.txt"), out.error)
			} else {
				fs.writeFileSync(path.join(expected, "model.json"), out.model)
				fs.writeFileSync(path.join(expected, "roundtrip.dmn"), out.roundtrip)
			}
		}
		describe(name, () => {
			if (fs.existsSync(path.join(expected, "error.txt"))) {
				it("fails to parse with error.txt", () => {
					expect("error" in out ? out.error : "parsed").toBe(
						fs.readFileSync(path.join(expected, "error.txt"), "utf8"),
					)
				})
				return
			}
			it("parses to model.json", () => {
				expect("model" in out ? out.model : out.error).toBe(
					fs.readFileSync(path.join(expected, "model.json"), "utf8"),
				)
			})
			it("serializes to roundtrip.dmn", () => {
				expect("roundtrip" in out ? out.roundtrip : out.error).toBe(
					fs.readFileSync(path.join(expected, "roundtrip.dmn"), "utf8"),
				)
			})
		})
	}
})
