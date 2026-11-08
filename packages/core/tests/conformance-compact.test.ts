import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import { parseBpmn } from "../src/bpmn/bpmn-parser.js"
import { serializeBpmn } from "../src/bpmn/bpmn-serializer.js"
import { createCompactStream } from "../src/bpmn/compact-stream.js"
import { type CompactDiagram, type ExpandOptions, compactify, expand } from "../src/bpmn/compact.js"
import { type CompactDmn, compactifyDmn, expandDmn } from "../src/dmn/compact.js"
import { parseDmn } from "../src/dmn/dmn-parser.js"
import { serializeDmn } from "../src/dmn/dmn-serializer.js"
import { resetIdCounter } from "../src/types/id-generator.js"

/**
 * Replays conformance/compact/<case>/ against this package. Five kinds of
 * case, told apart by their files (conformance/README.md, "Compact"):
 *
 * - `input.bpmn`: compactify -> `compact.json`; serializeBpmn(expand(compact)) -> `expanded.bpmn`
 * - `input.json` (a CompactDiagram): expand -> `model.json`, `output.bpmn`, or `error.txt`
 * - `input.dmn`: compactifyDmn -> `compact.json`; serializeDmn(expandDmn(compact)) -> `expanded.dmn`
 * - `input.dmn.json` (a CompactDmn): expandDmn -> `model.json`, `output.dmn`, or `error.txt`
 * - `case.json` with `chunks`: createCompactStream -> `frames.json`, `frame-<i>.bpmn`
 *
 * `case.json` `expand` holds the options a BPMN diagram is expanded with
 * (`validate`, `placeholders`, `camundaVersion`).
 *
 * Any `input.*` may instead be named by `case.json` `input`, a path relative to
 * the case folder or to conformance/. `pnpm conformance:record` rewrites the
 * expected files from this implementation, which is the oracle.
 */

const RECORD = process.env.CONFORMANCE_RECORD === "1"
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "../../../conformance")
const compactRoot = path.join(root, "compact")

interface CaseFile {
	input?: string
	chunks?: string[]
	base?: CompactDiagram | null
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
const errorFile = (err: unknown): Record<string, string> => ({
	"error.txt": `${(err as Error).message}\n`,
})

function bpmnCompact(xml: string, options: ExpandOptions | undefined): Record<string, string> {
	let compact: CompactDiagram
	try {
		resetIdCounter()
		compact = compactify(parseBpmn(xml))
	} catch (err) {
		return errorFile(err)
	}
	const files: Record<string, string> = { "compact.json": json(compact) }
	try {
		resetIdCounter()
		files["expanded.bpmn"] = serializeBpmn(expand(compact, options))
	} catch (err) {
		files["expanded.error.txt"] = `${(err as Error).message}\n`
	}
	return files
}

function bpmnExpand(
	compact: CompactDiagram,
	options: ExpandOptions | undefined,
): Record<string, string> {
	try {
		resetIdCounter()
		const defs = expand(compact, options)
		return { "model.json": json(defs), "output.bpmn": serializeBpmn(defs) }
	} catch (err) {
		return errorFile(err)
	}
}

function dmnCompact(xml: string): Record<string, string> {
	let compact: CompactDmn
	try {
		resetIdCounter()
		compact = compactifyDmn(parseDmn(xml))
	} catch (err) {
		return errorFile(err)
	}
	const files: Record<string, string> = { "compact.json": json(compact) }
	try {
		resetIdCounter()
		files["expanded.dmn"] = serializeDmn(expandDmn(compact))
	} catch (err) {
		files["expanded.error.txt"] = `${(err as Error).message}\n`
	}
	return files
}

function dmnExpand(compact: CompactDmn): Record<string, string> {
	try {
		resetIdCounter()
		const defs = expandDmn(compact)
		return { "model.json": json(defs), "output.dmn": serializeDmn(defs) }
	} catch (err) {
		return errorFile(err)
	}
}

function streamCase(spec: CaseFile): Record<string, string> {
	resetIdCounter()
	const stream = createCompactStream(spec.base === undefined ? undefined : { base: spec.base })
	const frames: (string | null)[] = []
	const files: Record<string, string> = {}
	;(spec.chunks ?? []).forEach((chunk, i) => {
		const frame = stream.push(chunk)
		if (frame === null) {
			frames.push(null)
		} else {
			frames.push(`frame-${i}.bpmn`)
			files[`frame-${i}.bpmn`] = serializeBpmn(frame)
		}
	})
	return { "frames.json": json(frames), ...files }
}

function run(dir: string): Record<string, string> {
	const caseFile = path.join(dir, "case.json")
	const spec: CaseFile = fs.existsSync(caseFile)
		? (JSON.parse(fs.readFileSync(caseFile, "utf8")) as CaseFile)
		: {}
	if (spec.chunks !== undefined) return streamCase(spec)
	let file: string
	if (spec.input !== undefined) {
		const local = path.join(dir, spec.input)
		file = fs.existsSync(local) ? local : path.join(root, spec.input)
	} else {
		const name = fs.readdirSync(dir).find((f) => /^input\.(bpmn|dmn|dmn\.json|json)$/.test(f))
		if (name === undefined) throw new Error(`${dir}: no input`)
		file = path.join(dir, name)
	}
	const text = fs.readFileSync(file, "utf8")
	if (file.endsWith(".dmn.json")) return dmnExpand(JSON.parse(text) as CompactDmn)
	if (file.endsWith(".json")) return bpmnExpand(JSON.parse(text) as CompactDiagram, spec.expand)
	if (file.endsWith(".dmn")) return dmnCompact(text)
	return bpmnCompact(text, spec.expand)
}

const cases = fs.existsSync(compactRoot)
	? fs
			.readdirSync(compactRoot, { withFileTypes: true })
			.filter((d) => d.isDirectory())
			.map((d) => d.name)
			.sort()
	: []

describe("conformance/compact", () => {
	it("has cases", () => {
		expect(cases.length).toBeGreaterThan(0)
	})
	for (const name of cases) {
		it(name, () => {
			const dir = path.join(compactRoot, name)
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
