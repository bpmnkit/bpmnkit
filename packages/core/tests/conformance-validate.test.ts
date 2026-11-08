import { createHash } from "node:crypto"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import type { OptimizationFinding } from "../src/bpmn/optimize/types.js"
import {
	type ValidateDeployableOptions,
	isDeployable,
	validateDeployableXml,
} from "../src/bpmn/zeebe-validate/index.js"
import { resetIdCounter } from "../src/types/id-generator.js"

/**
 * conformance/validate/: one folder per case (`input.bpmn`, optional `case.json` with
 * `runs`), recorded from `validateDeployableXml`; and the agreement of the validator
 * with real Zeebe on every BPMN in conformance/ (`zeebe-verdicts.json`, from
 * `node scripts/zeebe-verdicts.mjs`). See conformance/README.md, "Validate".
 */

const RECORD = process.env.CONFORMANCE_RECORD === "1"
const repo = path.join(path.dirname(fileURLToPath(import.meta.url)), "../../..")
const root = path.join(repo, "conformance/validate")

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

interface RunOptions {
	camundaVersion?: string
	limits?: ValidateDeployableOptions["limits"]
	/** Ids of the other resources of the deployment; stands in for the resolver. */
	deployment?: {
		processes?: string[]
		decisions?: string[]
		forms?: string[]
		resources?: string[]
	}
}

function options(run: RunOptions): ValidateDeployableOptions {
	const { deployment, ...rest } = run
	if (deployment === undefined) return rest
	const has = (ids: string[] | undefined) => (id: string) => (ids ?? []).includes(id)
	return {
		...rest,
		resolver: {
			hasProcess: has(deployment.processes),
			hasDecision: has(deployment.decisions),
			hasForm: has(deployment.forms),
			hasResource: has(deployment.resources),
		},
	}
}

function plain(f: OptimizationFinding): Record<string, unknown> {
	const { applyFix, ...rest } = f
	return { ...rest, fixable: applyFix !== undefined }
}

function validate(xml: string, run: RunOptions): OptimizationFinding[] {
	resetIdCounter()
	return validateDeployableXml(xml, options(run))
}

const cases = fs
	.readdirSync(root, { withFileTypes: true })
	.filter((d) => d.isDirectory())
	.map((d) => d.name)
	.sort()

// Registered only when there are cases: vitest fails on a suite with no tests.
describe.runIf(cases.length > 0)("conformance/validate", () => {
	for (const name of cases) {
		const dir = path.join(root, name)
		const caseFile = path.join(dir, "case.json")
		const spec = fs.existsSync(caseFile)
			? (JSON.parse(fs.readFileSync(caseFile, "utf8")) as {
					input?: string
					runs?: Record<string, RunOptions>
				})
			: {}
		const input =
			spec.input === undefined ? path.join(dir, "input.bpmn") : path.join(repo, spec.input)
		const runs = spec.runs ?? { default: {} }
		if (RECORD) {
			fs.rmSync(path.join(dir, "expected"), { recursive: true, force: true })
			fs.mkdirSync(path.join(dir, "expected"), { recursive: true })
		}
		describe(name, () => {
			for (const [runName, run] of Object.entries(runs)) {
				it(runName, () => {
					const out = json({ findings: validate(fs.readFileSync(input, "utf8"), run).map(plain) })
					const target = path.join(dir, "expected", `${runName}.json`)
					if (RECORD) fs.writeFileSync(target, out)
					expect(out).toBe(fs.readFileSync(target, "utf8"))
				})
			}
		})
	}
})

interface Verdict {
	sha256: string
	ok: boolean
	errors: { element: string; message: string }[]
}

/** What zeebe-check runs with (tools/zeebe-check/src/ZCheck.java): Zeebe 8.9, 255-character limits. */
/**
 * While the rules are being written: the most disagreements and uncovered rules
 * allowed. Like conformance/pending.json, these may only go down, to 0.
 */
const MAX_DISAGREE = 280
const MAX_UNCOVERED = 172

const ORACLE: RunOptions = {
	camundaVersion: "8.9",
	limits: { maxIdLength: 255, maxNameLength: 255, maxWorkerTypeLength: 255 },
}

describe("validator agrees with Zeebe on the corpus", () => {
	const verdicts = JSON.parse(fs.readFileSync(path.join(root, "zeebe-verdicts.json"), "utf8")) as {
		zeebeVersion: string
		files: Record<string, Verdict>
	}
	const undecidable = JSON.parse(fs.readFileSync(path.join(root, "undecidable.json"), "utf8")) as {
		files: Record<string, string>
	}
	it("matches every verdict except the documented ones", () => {
		let compared = 0
		let stale = 0
		let zeebeErrors = 0
		let matchedErrors = 0
		const disagree: string[] = []
		for (const [file, verdict] of Object.entries(verdicts.files)) {
			const abs = path.join(repo, file)
			if (!fs.existsSync(abs)) continue
			const xml = fs.readFileSync(abs)
			if (createHash("sha256").update(xml).digest("hex") !== verdict.sha256) {
				stale += 1
				continue
			}
			compared += 1
			const findings = validate(xml.toString("utf8"), ORACLE)
			const ours = isDeployable(findings)
			const messages = findings.map((f) => f.message)
			for (const e of verdict.errors) {
				zeebeErrors += 1
				if (
					messages.some(
						(m) => m === e.message || e.message.startsWith(m) || m.startsWith(e.message),
					)
				)
					matchedErrors += 1
			}
			if (ours !== verdict.ok && undecidable.files[file] === undefined) {
				const zeebe = verdict.errors.map((e) => `${e.element}: ${e.message}`).join(" | ")
				const mine = findings
					.filter((f) => f.severity === "error")
					.map((f) => `${f.elementIds[0]}: ${f.message}`)
					.join(" | ")
				disagree.push(
					`${file}\n    zeebe: ${verdict.ok ? "OK" : zeebe}\n    ours:  ${ours ? "OK" : mine}`,
				)
			}
		}
		const rate = compared === 0 ? 1 : (compared - disagree.length) / compared
		console.log(
			`zeebe agreement: ${compared - disagree.length}/${compared} files (${(rate * 100).toFixed(1)}%), ` +
				`${matchedErrors}/${zeebeErrors} Zeebe errors matched by message, ${stale} stale verdicts`,
		)
		if (process.env.ZEEBE_AGREEMENT_REPORT !== undefined)
			fs.writeFileSync(process.env.ZEEBE_AGREEMENT_REPORT, disagree.join("\n"))
		expect(disagree.length).toBeLessThanOrEqual(MAX_DISAGREE)
	})
})

describe("every decidable rule has a negative and a positive case", () => {
	const spec = JSON.parse(fs.readFileSync(path.join(repo, "spec/zeebe-rules.json"), "utf8")) as {
		rules: { id: string; name: string; check: string; coveredBy?: string[] }[]
	}
	// Read in the test, not at collection: recording rewrites the expected folders first.
	it("covers the spec", () => {
		const missing: string[] = []
		for (const rule of spec.rules) {
			if (rule.check === "none" || rule.coveredBy !== undefined) continue
			const prefix = rule.id.toLowerCase()
			const bad = cases.filter((c) => c.startsWith(`${prefix}-bad`))
			const ok = cases.filter((c) => c.startsWith(`${prefix}-ok`))
			const reported = bad.some((c) =>
				fs
					.readdirSync(path.join(root, c, "expected"))
					.some((f) =>
						fs
							.readFileSync(path.join(root, c, "expected", f), "utf8")
							.includes(`"zeebe/${rule.name}"`),
					),
			)
			if (!reported) missing.push(`${rule.id} ${rule.name}: no ${prefix}-bad* case reporting it`)
			if (ok.length === 0) missing.push(`${rule.id} ${rule.name}: no ${prefix}-ok* case`)
		}
		expect(missing.length).toBeLessThanOrEqual(MAX_UNCOVERED)
	})
})
