import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import { parseBpmn } from "../src/bpmn/bpmn-parser.js"
import { serializeBpmn } from "../src/bpmn/bpmn-serializer.js"
import { type ExpandOptions, expand } from "../src/bpmn/compact.js"
import { writeProcessText } from "../src/bpmn/process-text-writer.js"
import { createProcessTextStream, parseProcessText } from "../src/bpmn/process-text.js"
import { resetIdCounter } from "../src/types/id-generator.js"

/**
 * Replays conformance/text/<case>/ against this package. Three kinds of case,
 * told apart by their files (conformance/README.md, "Process text"):
 *
 * - `input.txt`: parseProcessText -> `result.json`, serializeBpmn(expand(diagram)) -> `output.bpmn`
 * - `case.json` with `chunks`: createProcessTextStream -> `frames.json`, `frame-<i>.bpmn`,
 *   then the same `result.json` / `output.bpmn` for `end()`
 * - `input.bpmn` (or `case.json` `input`): writeProcessText -> `text.txt`, `written.json`
 *
 * `case.json` `expand` holds the options the diagram is expanded with
 * (`validate`, `placeholders`, `camundaVersion`), for every kind that expands.
 *
 * `pnpm conformance:record` rewrites the expected files from this
 * implementation, which is the oracle.
 */

const RECORD = process.env.CONFORMANCE_RECORD === "1"
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "../../../conformance")
const textRoot = path.join(root, "text")

interface CaseFile {
	input?: string
	chunks?: string[]
	expand?: ExpandOptions
}

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

const json = (v: unknown): string => `${JSON.stringify(sortKeys(v), null, 2)}\n`

type Result = ReturnType<typeof parseProcessText>

/** `result.json` plus the expanded `output.bpmn` (or `error.txt` when expand throws). */
function resultFiles(result: Result, options: ExpandOptions | undefined): Record<string, string> {
	const files: Record<string, string> = { "result.json": json(result) }
	try {
		resetIdCounter()
		files["output.bpmn"] = serializeBpmn(expand(result.diagram, options))
	} catch (err) {
		files["error.txt"] = `${(err as Error).message}\n`
	}
	return files
}

function parseCase(text: string, options: ExpandOptions | undefined): Record<string, string> {
	resetIdCounter()
	return resultFiles(parseProcessText(text), options)
}

function streamCase(chunks: string[], options: ExpandOptions | undefined): Record<string, string> {
	resetIdCounter()
	const stream = createProcessTextStream()
	const frames: (string | null)[] = []
	const files: Record<string, string> = {}
	chunks.forEach((chunk, i) => {
		const frame = stream.push(chunk)
		if (frame === null) {
			frames.push(null)
		} else {
			frames.push(`frame-${i}.bpmn`)
			files[`frame-${i}.bpmn`] = serializeBpmn(frame)
		}
	})
	const result = stream.end()
	return { "frames.json": json(frames), ...files, ...resultFiles(result, options) }
}

function writeCase(xml: string): Record<string, string> {
	try {
		resetIdCounter()
		const written = writeProcessText(parseBpmn(xml))
		return { "text.txt": written.text, "written.json": json({ aliases: written.aliases }) }
	} catch (err) {
		return { "error.txt": `${(err as Error).message}\n` }
	}
}

function inputPath(dir: string, spec: CaseFile): string {
	if (spec.input === undefined) return path.join(dir, "input.bpmn")
	const local = path.join(dir, spec.input)
	return fs.existsSync(local) ? local : path.join(root, spec.input)
}

function run(dir: string): Record<string, string> {
	const caseFile = path.join(dir, "case.json")
	const spec: CaseFile = fs.existsSync(caseFile)
		? (JSON.parse(fs.readFileSync(caseFile, "utf8")) as CaseFile)
		: {}
	if (fs.existsSync(path.join(dir, "input.txt"))) {
		return parseCase(fs.readFileSync(path.join(dir, "input.txt"), "utf8"), spec.expand)
	}
	if (spec.chunks !== undefined) return streamCase(spec.chunks, spec.expand)
	return writeCase(fs.readFileSync(inputPath(dir, spec), "utf8"))
}

const rank = (name: string): number => (name.startsWith("write-") ? 2 : 0)
// Writers read some parse cases' `expected/output.bpmn`, so they record after them.
const cases = fs.existsSync(textRoot)
	? fs
			.readdirSync(textRoot, { withFileTypes: true })
			.filter((d) => d.isDirectory())
			.map((d) => d.name)
			.sort((a, b) => rank(a) - rank(b) || (a < b ? -1 : 1))
	: []

describe("conformance/text", () => {
	it("has cases", () => {
		expect(cases.length).toBeGreaterThan(0)
	})
	for (const name of cases) {
		it(name, () => {
			const dir = path.join(textRoot, name)
			const expectedDir = path.join(dir, "expected")
			const out = run(dir)
			if (RECORD) {
				fs.rmSync(expectedDir, { recursive: true, force: true })
				fs.mkdirSync(expectedDir, { recursive: true })
				for (const [file, text] of Object.entries(out)) {
					fs.writeFileSync(path.join(expectedDir, file), text)
				}
			}
			expect(fs.readdirSync(expectedDir).sort()).toEqual(Object.keys(out).sort())
			for (const [file, text] of Object.entries(out)) {
				expect(text).toBe(fs.readFileSync(path.join(expectedDir, file), "utf8"))
			}
		})
	}
})
