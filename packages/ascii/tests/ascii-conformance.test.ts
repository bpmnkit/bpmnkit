import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import {
	type RenderOptions,
	renderBpmnAscii,
	renderDmnAscii,
	renderFormAscii,
} from "../src/index.js"

/**
 * Replays conformance/ascii/<case>/ against this package: the text for the case's
 * input with case.json's `options` must equal expected/out.txt. The files are the
 * contract the Rust crate bpmnkit-ascii is checked against (conformance/README.md,
 * "ASCII"); `pnpm conformance:record` rewrites them from this implementation, which
 * is the oracle.
 */

const RECORD = process.env.CONFORMANCE_RECORD === "1"
const conformance = path.join(path.dirname(fileURLToPath(import.meta.url)), "../../../conformance")
const root = path.join(conformance, "ascii")

interface CaseFile {
	/** Input path relative to conformance/; defaults to the case's own input.{bpmn,dmn,form}. */
	input?: string
	options?: RenderOptions
}

function render(dir: string): string {
	const spec = JSON.parse(fs.readFileSync(path.join(dir, "case.json"), "utf8")) as CaseFile
	const input =
		spec.input !== undefined
			? path.join(conformance, spec.input)
			: ["input.bpmn", "input.dmn", "input.form"]
					.map((f) => path.join(dir, f))
					.find((f) => fs.existsSync(f))
	if (!input) throw new Error(`${dir}: no input`)
	const text = fs.readFileSync(input, "utf8")
	if (input.endsWith(".dmn")) return renderDmnAscii(text, spec.options)
	if (input.endsWith(".form")) return renderFormAscii(text, spec.options)
	return renderBpmnAscii(text, spec.options)
}

const cases = fs.existsSync(root)
	? fs
			.readdirSync(root, { withFileTypes: true })
			.filter((d) => d.isDirectory())
			.map((d) => d.name)
			.sort()
	: []

describe("ascii conformance", () => {
	it("has cases", () => {
		expect(cases.length).toBeGreaterThan(0)
	})

	for (const name of cases) {
		const dir = path.join(root, name)
		it(`${name} renders to out.txt`, () => {
			// Truncation can cut a surrogate pair; as UTF-8 the lone half is U+FFFD.
			const text = Buffer.from(`${render(dir)}\n`, "utf8").toString("utf8")
			const file = path.join(dir, "expected/out.txt")
			if (RECORD) {
				fs.mkdirSync(path.dirname(file), { recursive: true })
				fs.writeFileSync(file, text)
			}
			expect(text).toBe(fs.readFileSync(file, "utf8"))
		})
	}
})
