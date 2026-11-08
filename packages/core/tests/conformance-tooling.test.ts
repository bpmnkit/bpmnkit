import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import type { BpmnDefinitions } from "../src/bpmn/bpmn-model.js"
import { parseBpmn } from "../src/bpmn/bpmn-parser.js"
import { serializeBpmn } from "../src/bpmn/bpmn-serializer.js"
import { parseBpmnlintConfig, resolveBpmnlintConfig } from "../src/bpmn/bpmnlint.js"
import { analyzeCamundaCompat } from "../src/bpmn/camunda-compat.js"
import { convertCamunda8To7 } from "../src/bpmn/camunda7/export.js"
import { translateJuelToFeel } from "../src/bpmn/camunda7/juel.js"
import { type Camunda7ConvertOptions, convertCamunda7 } from "../src/bpmn/camunda7/migrate.js"
import { type LintOptions, lintDiagram } from "../src/bpmn/lint.js"
import { optimize } from "../src/bpmn/optimize/index.js"
import type { OptimizationFinding, OptimizeOptions } from "../src/bpmn/optimize/types.js"
import { lintDmn } from "../src/dmn/lint.js"
import { lintForm } from "../src/form/lint.js"
import { resetIdCounter } from "../src/types/id-generator.js"

/**
 * Replays conformance/{lint,optimize,compat,migrate}/<case>/ against this
 * package, and conformance/migrate/juel.jsonl. The expected files are the
 * contract the Rust implementation is checked against (see
 * conformance/README.md, "Tooling"); `pnpm conformance:record` rewrites them
 * from this implementation, which is the oracle.
 */

const RECORD = process.env.CONFORMANCE_RECORD === "1"
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "../../../conformance")

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

type Opts = Record<string, unknown>

interface CaseFile {
	input?: string
	runs?: Record<string, Opts>
}

/** Findings are plain data: `applyFix` becomes `fixable`. */
function plain(f: OptimizationFinding): Record<string, unknown> {
	const { applyFix, ...rest } = f
	return { ...rest, fixable: applyFix !== undefined }
}

/**
 * `connectorRequirements` stands in for the resolver function: a table of
 * connector template id -> required value keys; the resolver returns those
 * not bound.
 */
function optimizeOptions(opts: Opts): OptimizeOptions {
	const { connectorRequirements, bpmnlintrc, ...rest } = opts
	const out = { ...rest } as OptimizeOptions
	if (connectorRequirements !== undefined) {
		const table = connectorRequirements as Record<string, string[]>
		out.resolveConnectorRequirements = (id, bound) =>
			(table[id] ?? []).filter((k) => !bound.includes(k))
	}
	return out
}

function parse(xml: string): BpmnDefinitions {
	resetIdCounter()
	return parseBpmn(xml)
}

type Kind = "lint" | "optimize" | "compat" | "migrate"

function run(kind: Kind, ext: string, input: string, opts: Opts): string {
	try {
		return json(runUnsafe(kind, ext, input, opts))
	} catch (err) {
		return json({ error: (err as Error).message })
	}
}

function runUnsafe(kind: Kind, ext: string, input: string, opts: Opts): unknown {
	if (ext === ".dmn") return { findings: lintDmn(input) }
	if (ext === ".form") return { findings: lintForm(input) }
	const defs = parse(input)
	switch (kind) {
		case "lint": {
			const options: LintOptions = optimizeOptions(opts)
			if (opts.bpmnlintrc !== undefined) {
				options.bpmnlint = resolveBpmnlintConfig(
					parseBpmnlintConfig(JSON.stringify(opts.bpmnlintrc)),
				)
			}
			resetIdCounter()
			const report = lintDiagram(defs, options)
			return report
		}
		case "optimize": {
			const options = optimizeOptions(opts)
			resetIdCounter()
			const report = optimize(defs, options)
			const fixes: unknown[] = []
			report.findings.forEach((finding, index) => {
				if (finding.applyFix === undefined) return
				const fresh = parse(input)
				const again = optimize(fresh, options).findings[index]
				if (again?.applyFix === undefined) throw new Error(`finding ${index} is not reproducible`)
				const result = again.applyFix(fresh)
				fixes.push({
					index,
					id: finding.id,
					description: result.description,
					xml: serializeBpmn(fresh),
					...(result.generated !== undefined ? { generated: serializeBpmn(result.generated) } : {}),
				})
			})
			return { findings: report.findings.map(plain), summary: report.summary, fixes }
		}
		case "compat": {
			resetIdCounter()
			const version = opts.version as string | undefined
			return { findings: analyzeCamundaCompat(defs, version).map(plain) }
		}
		case "migrate": {
			resetIdCounter()
			if (opts.direction === "8to7") {
				const result = convertCamunda8To7(defs)
				return {
					report: { findings: result.findings },
					xml: serializeBpmn(result.definitions),
				}
			}
			const result = convertCamunda7(defs, opts.options as Camunda7ConvertOptions | undefined)
			return { report: result.report, xml: serializeBpmn(result.definitions) }
		}
	}
}

function inputFile(dir: string): { file: string; ext: string } {
	const caseFile = path.join(dir, "case.json")
	if (fs.existsSync(caseFile)) {
		const c = JSON.parse(fs.readFileSync(caseFile, "utf8")) as CaseFile
		if (c.input !== undefined) {
			const file = path.join(root, c.input)
			return { file, ext: path.extname(file) }
		}
	}
	const name = fs.readdirSync(dir).find((f) => /^input\.(bpmn|dmn|form)$/.test(f))
	if (name === undefined) throw new Error(`${dir}: no input`)
	return { file: path.join(dir, name), ext: path.extname(name) }
}

for (const kind of ["lint", "optimize", "compat", "migrate"] as const) {
	const kindRoot = path.join(root, kind)
	const cases = fs.existsSync(kindRoot)
		? fs
				.readdirSync(kindRoot, { withFileTypes: true })
				.filter((d) => d.isDirectory())
				.map((d) => d.name)
				.sort()
		: []
	describe(`conformance/${kind}`, () => {
		it("has cases", () => {
			expect(cases.length).toBeGreaterThan(0)
		})
		for (const name of cases) {
			const dir = path.join(kindRoot, name)
			const caseFile = path.join(dir, "case.json")
			const spec: CaseFile = fs.existsSync(caseFile)
				? (JSON.parse(fs.readFileSync(caseFile, "utf8")) as CaseFile)
				: {}
			const runs = spec.runs ?? { default: {} }
			const { file, ext } = inputFile(dir)
			if (RECORD) {
				const expectedDir = path.join(dir, "expected")
				fs.rmSync(expectedDir, { recursive: true, force: true })
				fs.mkdirSync(expectedDir, { recursive: true })
			}
			describe(name, () => {
				for (const [runName, opts] of Object.entries(runs)) {
					it(runName, () => {
						let out = run(kind, ext, fs.readFileSync(file, "utf8"), opts)
						const target = path.join(dir, "expected", `${runName}.json`)
						if (kind === "migrate") {
							// The converted model is a file of its own, so zeebe-check can deploy it.
							const { xml, ...rest } = JSON.parse(out) as { xml?: string }
							out = json(rest)
							const bpmn = path.join(dir, "expected", `${runName}.bpmn`)
							if (xml !== undefined) {
								if (RECORD) fs.writeFileSync(bpmn, xml)
								expect(xml).toBe(fs.readFileSync(bpmn, "utf8"))
							} else {
								expect(fs.existsSync(bpmn)).toBe(false)
							}
						}
						if (RECORD) fs.writeFileSync(target, out)
						expect(out).toBe(fs.readFileSync(target, "utf8"))
					})
				}
			})
		}
	})
}

describe("conformance/migrate/juel.jsonl", () => {
	const file = path.join(root, "migrate/juel.jsonl")
	let lines = fs.existsSync(file)
		? fs
				.readFileSync(file, "utf8")
				.split("\n")
				.filter((l) => l.trim() !== "")
				.map((l) => JSON.parse(l) as Record<string, unknown>)
		: []
	const compute = (c: Record<string, unknown>): Record<string, unknown> => ({
		id: c.id,
		juel: c.juel,
		...(c.options !== undefined ? { options: c.options } : {}),
		expected: sortKeys(
			translateJuelToFeel(c.juel as string, c.options as { multiInstance?: boolean } | undefined),
		),
	})
	if (RECORD && lines.length > 0) {
		lines = lines.map(compute)
		fs.writeFileSync(file, `${lines.map((c) => JSON.stringify(c)).join("\n")}\n`)
	}
	it("has cases", () => {
		expect(lines.length).toBeGreaterThan(0)
	})
	for (const c of lines) {
		it(String(c.id), () => {
			expect(c.expected).toEqual(compute(c).expected)
		})
	}
})
