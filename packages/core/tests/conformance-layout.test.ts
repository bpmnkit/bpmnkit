import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import { applyAutoLayout } from "../src/bpmn/auto-layout.js"
import { parseBpmn } from "../src/bpmn/bpmn-parser.js"
import { serializeBpmn } from "../src/bpmn/bpmn-serializer.js"
import { layoutDmn } from "../src/dmn/dmn-layout.js"
import { parseDmn } from "../src/dmn/dmn-parser.js"
import { serializeDmn } from "../src/dmn/dmn-serializer.js"
import type { AnnotationSide } from "../src/layout/annotations.js"
import type { LayoutEngine } from "../src/layout/layout-engine.js"
import type { GridHint, LayoutHints } from "../src/layout/types.js"
import { resetIdCounter } from "../src/types/id-generator.js"

/**
 * Replays conformance/layout/<case>/ against this package: for every run,
 * serialize(applyAutoLayout(parse(input), engine, hints)) (or the DMN twin)
 * must equal expected/<run>.bpmn|.dmn, or the run's error message must equal
 * expected/<run>.error.txt. The files are the contract the Rust layout is
 * checked against (conformance/README.md, "Layout"); `pnpm conformance:record`
 * rewrites them from this implementation, which is the oracle.
 */

const RECORD = process.env.CONFORMANCE_RECORD === "1"
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "../../../conformance")
const layoutRoot = path.join(root, "layout")

interface RunOptions {
	engine?: LayoutEngine
	hints?: {
		grids?: Record<string, GridHint>
		annotationSides?: Record<string, AnnotationSide>
	}
}

interface CaseFile {
	input?: string
	runs?: Record<string, RunOptions>
}

const DEFAULT_BPMN_RUNS: Record<string, RunOptions> = { semantic: {}, grid: { engine: "grid" } }
const DEFAULT_DMN_RUNS: Record<string, RunOptions> = { default: {} }

function layoutHints(h: RunOptions["hints"]): LayoutHints | undefined {
	if (h === undefined) return undefined
	return {
		...(h.grids !== undefined ? { grids: new Map(Object.entries(h.grids)) } : {}),
		...(h.annotationSides !== undefined
			? { annotationSides: new Map(Object.entries(h.annotationSides)) }
			: {}),
	}
}

/** Output text and file extension (`error.txt` when the layout throws). */
function run(ext: string, input: string, opts: RunOptions): { text: string; file: string } {
	const out = ext === ".dmn" ? "dmn" : "bpmn"
	try {
		resetIdCounter()
		if (ext === ".dmn") {
			return { text: serializeDmn(layoutDmn(parseDmn(input))), file: out }
		}
		const defs = parseBpmn(input)
		const laid = applyAutoLayout(defs, opts.engine ?? "semantic", layoutHints(opts.hints))
		return { text: serializeBpmn(laid), file: out }
	} catch (err) {
		return { text: `${(err as Error).message}\n`, file: "error.txt" }
	}
}

function inputFile(dir: string, spec: CaseFile): { file: string; ext: string } {
	if (spec.input !== undefined) {
		const file = path.join(root, spec.input)
		return { file, ext: path.extname(file) }
	}
	const name = fs.readdirSync(dir).find((f) => /^input\.(bpmn|dmn)$/.test(f))
	if (name === undefined) throw new Error(`${dir}: no input`)
	return { file: path.join(dir, name), ext: path.extname(name) }
}

const cases = fs.existsSync(layoutRoot)
	? fs
			.readdirSync(layoutRoot, { withFileTypes: true })
			.filter((d) => d.isDirectory())
			.map((d) => d.name)
			.sort()
	: []

describe("conformance/layout", () => {
	it("has cases", () => {
		expect(cases.length).toBeGreaterThan(0)
	})
	for (const name of cases) {
		const dir = path.join(layoutRoot, name)
		const caseFile = path.join(dir, "case.json")
		const spec: CaseFile = fs.existsSync(caseFile)
			? (JSON.parse(fs.readFileSync(caseFile, "utf8")) as CaseFile)
			: {}
		const { file, ext } = inputFile(dir, spec)
		const runs = spec.runs ?? (ext === ".dmn" ? DEFAULT_DMN_RUNS : DEFAULT_BPMN_RUNS)
		const expectedDir = path.join(dir, "expected")
		if (RECORD) {
			fs.rmSync(expectedDir, { recursive: true, force: true })
			fs.mkdirSync(expectedDir, { recursive: true })
		}
		describe(name, () => {
			for (const [runName, opts] of Object.entries(runs)) {
				it(runName, () => {
					const { text, file: kind } = run(ext, fs.readFileSync(file, "utf8"), opts)
					const target = path.join(expectedDir, `${runName}.${kind}`)
					if (RECORD) fs.writeFileSync(target, text)
					expect(text).toBe(fs.readFileSync(target, "utf8"))
				})
			}
		})
	}
})
