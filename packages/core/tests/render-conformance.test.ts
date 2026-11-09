import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import { parseBpmn } from "../src/bpmn/bpmn-parser.js"
import { exportSvg } from "../src/bpmn/svg.js"
import { parseDmn } from "../src/dmn/dmn-parser.js"
import { exportDecisionTableSvg, exportDrdSvg } from "../src/dmn/svg.js"

/**
 * Replays conformance/render/<case>/ against this package: the SVG for
 * input.bpmn|input.dmn with case.json's `options` must equal expected/out.svg.
 * A `.dmn` input renders as a DRD, or as a decision table when case.json has
 * `"decision": "<id>"`. The files are the contract the Rust renderer is checked
 * against (conformance/README.md, "Render"); `pnpm conformance:record` rewrites
 * them from this implementation, which is the oracle.
 */

const RECORD = process.env.CONFORMANCE_RECORD === "1"
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "../../../conformance/render")

interface CaseFile {
	options?: Record<string, unknown>
	/** Decision whose table to render (`.dmn` inputs only). */
	decision?: string
}

function render(dir: string): string {
	const spec = JSON.parse(fs.readFileSync(path.join(dir, "case.json"), "utf8")) as CaseFile
	const options = spec.options ?? {}
	const bpmn = path.join(dir, "input.bpmn")
	if (fs.existsSync(bpmn)) {
		return exportSvg(parseBpmn(fs.readFileSync(bpmn, "utf8")), options)
	}
	const defs = parseDmn(fs.readFileSync(path.join(dir, "input.dmn"), "utf8"))
	if (spec.decision === undefined) return exportDrdSvg(defs, options)
	const table = defs.decisions.find((d) => d.id === spec.decision)?.decisionTable
	if (!table) throw new Error(`no decision table for ${spec.decision}`)
	return exportDecisionTableSvg(table, options)
}

const cases = fs.existsSync(root)
	? fs
			.readdirSync(root, { withFileTypes: true })
			.filter((d) => d.isDirectory())
			.map((d) => d.name)
			.sort()
	: []

describe("render conformance", () => {
	it("has cases", () => {
		expect(cases.length).toBeGreaterThan(0)
	})

	for (const name of cases) {
		const dir = path.join(root, name)
		it(`${name} renders to out.svg`, () => {
			const svg = `${render(dir)}\n`
			const file = path.join(dir, "expected/out.svg")
			if (RECORD) {
				fs.mkdirSync(path.dirname(file), { recursive: true })
				fs.writeFileSync(file, svg)
			}
			expect(svg).toBe(fs.readFileSync(file, "utf8"))
		})
	}
})
