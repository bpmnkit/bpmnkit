import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import { parseBpmn } from "../src/bpmn/bpmn-parser.js"
import { serializeBpmn } from "../src/bpmn/bpmn-serializer.js"
import { optimize } from "../src/bpmn/optimize/index.js"
import type { OptimizeOptions } from "../src/bpmn/optimize/types.js"
import { isDeployable, validateDeployableXml } from "../src/bpmn/zeebe-validate/index.js"
import { resetIdCounter } from "../src/types/id-generator.js"

/**
 * An auto-fix must never turn a model Zeebe accepts into one it rejects: for every
 * fixable finding of the conformance/optimize corpus whose input deploys, the fixed
 * model (and any model the fix generates, such as an extracted process) deploys too.
 */
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "../../../conformance")
const optimizeRoot = path.join(root, "optimize")

const errorsOf = (xml: string): string[] =>
	validateDeployableXml(xml)
		.filter((f) => f.severity === "error")
		.map((f) => `${f.elementIds[0] ?? ""}: ${f.message} (${f.id})`)

interface Run {
	name: string
	input: string
	options: OptimizeOptions
}

function runs(): Run[] {
	const out: Run[] = []
	for (const name of fs.readdirSync(optimizeRoot).sort()) {
		const dir = path.join(optimizeRoot, name)
		if (!fs.statSync(dir).isDirectory()) continue
		const caseFile = path.join(dir, "case.json")
		const spec = fs.existsSync(caseFile)
			? (JSON.parse(fs.readFileSync(caseFile, "utf8")) as {
					input?: string
					runs?: Record<string, Record<string, unknown>>
				})
			: {}
		const input = fs.readFileSync(
			spec.input === undefined ? path.join(dir, "input.bpmn") : path.join(root, spec.input),
			"utf8",
		)
		for (const [run, raw] of Object.entries(spec.runs ?? { default: {} })) {
			// The resolver tables stand in for functions; no fix depends on them.
			const { connectorRequirements: _c, bpmnlintrc: _b, ...options } = raw
			out.push({ name: `${name}/${run}`, input, options: options as OptimizeOptions })
		}
	}
	return out
}

describe("optimize auto-fixes keep a deployable model deployable", () => {
	const deployable = runs().filter((r) => isDeployable(validateDeployableXml(r.input)))
	const fixed = new Set<string>()

	for (const run of deployable) {
		it(run.name, () => {
			resetIdCounter()
			const report = optimize(parseBpmn(run.input), run.options)
			report.findings.forEach((finding, index) => {
				if (finding.applyFix === undefined) return
				fixed.add(finding.id)
				resetIdCounter()
				const fresh = parseBpmn(run.input)
				const again = optimize(fresh, run.options).findings[index]
				const result = again?.applyFix?.(fresh)
				expect(result, `${finding.id} #${index}`).toBeDefined()
				expect(errorsOf(serializeBpmn(fresh)), `${finding.id} #${index}`).toEqual([])
				if (result?.generated !== undefined) {
					expect(
						errorsOf(serializeBpmn(result.generated)),
						`${finding.id} #${index} generated`,
					).toEqual([])
				}
			})
		})
	}

	it("covers every kind of fix", () => {
		expect([...fixed].sort()).toEqual([
			"feel/missing-default-flow",
			"flow/dead-end",
			"flow/multi-incoming-task",
			"flow/redundant-gateway",
			"task/reusable-group",
		])
	})
})
