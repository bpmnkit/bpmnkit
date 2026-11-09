import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import { parseBpmn } from "../src/bpmn/bpmn-parser.js"
import { serializeBpmn } from "../src/bpmn/bpmn-serializer.js"
import { type AssertDeployableOptions, assertDeployable } from "../src/bpmn/zeebe-validate/gate.js"
import { DeployabilityError } from "../src/errors.js"
import { resetIdCounter } from "../src/types/id-generator.js"

/**
 * conformance/gate/: one folder per case (`input.bpmn` or `case.json` `"input"`, `case.json`
 * `runs`), recorded from `assertDeployable(parseBpmn(input), run)`. See conformance/README.md, "Gate".
 */

const RECORD = process.env.CONFORMANCE_RECORD === "1"
const repo = path.join(path.dirname(fileURLToPath(import.meta.url)), "../../..")
const root = path.join(repo, "conformance/gate")

const json = (v: unknown): string => `${JSON.stringify(v, null, 2)}\n`

/** `expected/<run>.json`, plus `expected/<run>.bpmn` when placeholders were filled. */
function run(xml: string, options: AssertDeployableOptions): { json: string; bpmn?: string } {
	resetIdCounter()
	try {
		const result = assertDeployable(parseBpmn(xml), options)
		return {
			json: json({
				placeholders: result.placeholders,
				warnings: result.warnings.map((f) => `${f.id} ${f.elementIds.join(",")}`),
			}),
			bpmn: result.placeholders.length > 0 ? serializeBpmn(result.definitions) : undefined,
		}
	} catch (err) {
		if (!(err instanceof DeployabilityError)) throw err
		return {
			json: json({
				error: err.message,
				camundaVersion: err.camundaVersion,
				findings: err.findings.map((f) => `${f.id} ${f.elementIds.join(",")}`),
			}),
		}
	}
}

const cases = fs.existsSync(root)
	? fs
			.readdirSync(root, { withFileTypes: true })
			.filter((d) => d.isDirectory())
			.map((d) => d.name)
			.sort()
	: []

describe.runIf(cases.length > 0)("conformance/gate", () => {
	for (const name of cases) {
		const dir = path.join(root, name)
		const spec = JSON.parse(fs.readFileSync(path.join(dir, "case.json"), "utf8")) as {
			input?: string
			runs: Record<string, AssertDeployableOptions>
		}
		const input =
			spec.input === undefined
				? path.join(dir, "input.bpmn")
				: path.join(repo, "conformance", spec.input)
		if (RECORD) {
			fs.rmSync(path.join(dir, "expected"), { recursive: true, force: true })
			fs.mkdirSync(path.join(dir, "expected"), { recursive: true })
		}
		describe(name, () => {
			for (const [runName, options] of Object.entries(spec.runs)) {
				it(runName, () => {
					const out = run(fs.readFileSync(input, "utf8"), options)
					const target = path.join(dir, "expected", runName)
					if (RECORD) {
						fs.writeFileSync(`${target}.json`, out.json)
						if (out.bpmn !== undefined) fs.writeFileSync(`${target}.bpmn`, out.bpmn)
					}
					expect(out.json).toBe(fs.readFileSync(`${target}.json`, "utf8"))
					expect(fs.existsSync(`${target}.bpmn`)).toBe(out.bpmn !== undefined)
					if (out.bpmn !== undefined)
						expect(out.bpmn).toBe(fs.readFileSync(`${target}.bpmn`, "utf8"))
				})
			}
		})
	}
})
