import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import { parseBpmn } from "../src/bpmn/bpmn-parser.js"
import { serializeBpmn } from "../src/bpmn/bpmn-serializer.js"

/**
 * Replays conformance/bpmn/<case>/ against this package: parse(input.bpmn)
 * must equal expected/model.json and serialize(parse(input.bpmn)) must equal
 * expected/roundtrip.bpmn. The files are the contract the Rust implementation
 * is checked against (see conformance/README.md); `pnpm conformance:record`
 * rewrites them from this implementation, which is the oracle.
 */

const RECORD = process.env.CONFORMANCE_RECORD === "1"
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "../../../conformance/bpmn")

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

function produce(xml: string): { model: string; roundtrip: string } {
	const defs = parseBpmn(xml)
	return {
		model: `${JSON.stringify(sortKeys(defs), null, 2)}\n`,
		roundtrip: serializeBpmn(defs),
	}
}

const cases = fs.existsSync(root)
	? fs
			.readdirSync(root, { withFileTypes: true })
			.filter((d) => d.isDirectory())
			.map((d) => d.name)
			.sort()
	: []

describe("conformance/bpmn", () => {
	it("has cases", () => {
		expect(cases.length).toBeGreaterThan(0)
	})
	for (const name of cases) {
		const dir = path.join(root, name)
		const out = produce(fs.readFileSync(path.join(dir, "input.bpmn"), "utf8"))
		if (RECORD) {
			fs.mkdirSync(path.join(dir, "expected"), { recursive: true })
			fs.writeFileSync(path.join(dir, "expected/model.json"), out.model)
			fs.writeFileSync(path.join(dir, "expected/roundtrip.bpmn"), out.roundtrip)
		}
		describe(name, () => {
			it("parses to model.json", () => {
				expect(out.model).toBe(fs.readFileSync(path.join(dir, "expected/model.json"), "utf8"))
			})
			it("serializes to roundtrip.bpmn", () => {
				expect(out.roundtrip).toBe(
					fs.readFileSync(path.join(dir, "expected/roundtrip.bpmn"), "utf8"),
				)
			})
		})
	}
})
