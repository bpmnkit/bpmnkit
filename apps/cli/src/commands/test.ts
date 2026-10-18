import { access, readFile, readdir } from "node:fs/promises"
import { basename, dirname, extname, join } from "node:path"
import { isCptFile, runCptTestCases } from "@bpmnkit/engine/cpt"
import { runScenarioWasm } from "@bpmnkit/engine/wasm-runner"
import type { ScenarioLike } from "@bpmnkit/engine/wasm-runner"
import { flagAll } from "../args.js"
import type { Command, CommandGroup } from "../types.js"

const exists = (path: string): Promise<boolean> =>
	access(path).then(
		() => true,
		() => false,
	)

/**
 * The scenarios file for a BPMN: the flag, else `<file>.bpmn.tests.json`, else
 * `<name>.test.json` (the Camunda process-test convention). Falls back to the first
 * so the "Cannot read scenarios file" message names the long-standing path.
 */
export async function resolveScenariosPath(bpmnPath: string, flag?: string): Promise<string> {
	if (flag !== undefined) return flag
	const sidecar = `${bpmnPath}.tests.json`
	if (await exists(sidecar)) return sidecar
	const cpt = join(dirname(bpmnPath), `${basename(bpmnPath, ".bpmn")}.test.json`)
	return (await exists(cpt)) ? cpt : sidecar
}

const testCmd: Command = {
	name: "test",
	description: "Run scenario tests for a BPMN process file",
	args: [
		{
			name: "file",
			description: "Path to the .bpmn file",
			required: true,
		},
	],
	flags: [
		{
			name: "scenarios",
			short: "s",
			description:
				"Scenarios file: .bpmn.tests.json or Camunda process-test JSON (default: <file>.tests.json, else <name>.test.json)",
			type: "string",
		},
		{
			name: "case",
			description: "Run only the CPT test case with this name (repeatable)",
			type: "string",
		},
	],
	async run(ctx) {
		const bpmnPath = ctx.positional[0]
		if (bpmnPath === undefined) throw new Error("Missing required argument: <file>")

		const scenariosPath = await resolveScenariosPath(
			bpmnPath,
			typeof ctx.flags.scenarios === "string" ? ctx.flags.scenarios : undefined,
		)

		const bpmnXml = await readFile(bpmnPath, "utf8").catch(() => {
			throw new Error(`Cannot read BPMN file: ${bpmnPath}`)
		})

		const scenariosRaw = await readFile(scenariosPath, "utf8").catch(() => {
			throw new Error(`Cannot read scenarios file: ${scenariosPath}`)
		})

		let parsed: unknown
		try {
			parsed = JSON.parse(scenariosRaw)
		} catch {
			throw new Error(`Invalid JSON in scenarios file: ${scenariosPath}`)
		}

		if (isCptFile(parsed)) {
			const select = flagAll(ctx.flags, ctx.repeated, "case")
			const report = await runCptTestCases({
				bpmn: bpmnXml,
				cases: parsed,
				...(select.length > 0 ? { select } : {}),
			})
			let failedCases = 0
			for (const c of report.cases) {
				if (c.passed) {
					ctx.output.ok(`PASS  ${c.name}`)
					continue
				}
				failedCases++
				ctx.output.info(`FAIL  ${c.name}`)
				const f = c.failure
				if (f === undefined) continue
				// Index -1 means no instruction ran (bad file, unknown --case, deploy failure).
				ctx.output.info(
					f.index < 0
						? `       ${f.message}`
						: `       instruction ${f.index} (${f.type}): ${f.message}`,
				)
			}
			ctx.output.info(`\n${report.cases.length - failedCases}/${report.cases.length} passed`)
			if (failedCases > 0) throw new Error(`${failedCases} test case(s) failed`)
			return
		}

		const scenarios = parsed as ScenarioLike[]

		if (!Array.isArray(scenarios) || scenarios.length === 0) {
			ctx.output.info("No scenarios found.")
			return
		}

		// Build a decision-ID → DMN XML map from all *.dmn files in the BPMN's directory.
		const bpmnDir = dirname(bpmnPath)
		const dirFiles = await readdir(bpmnDir).catch(() => [] as string[])
		const decisionMap = new Map<string, string>()
		for (const file of dirFiles) {
			if (extname(file).toLowerCase() !== ".dmn") continue
			const dmnXml = await readFile(join(bpmnDir, file), "utf8").catch(() => null)
			if (dmnXml === null) continue
			for (const [, id] of dmnXml.matchAll(/<decision[^>]+\bid="([^"]+)"/g)) {
				if (id) decisionMap.set(id, dmnXml)
			}
		}

		const getDecisionDmn =
			decisionMap.size > 0 ? (id: string) => decisionMap.get(id) ?? null : undefined

		let passed = 0
		let failed = 0

		for (const scenario of scenarios) {
			const result = await runScenarioWasm(bpmnXml, scenario, getDecisionDmn)
			if (result.passed) {
				passed++
				ctx.output.ok(`PASS  ${scenario.name}  (${result.durationMs}ms)`)
			} else {
				failed++
				ctx.output.info(`FAIL  ${scenario.name}  (${result.durationMs}ms)`)
				for (const f of result.failures) {
					ctx.output.info(
						`       ${f.field}: expected ${JSON.stringify(f.expected)}, got ${JSON.stringify(f.actual)}`,
					)
				}
				for (const e of result.errors) {
					ctx.output.info(
						`       error${e.elementId !== undefined ? ` (${e.elementId})` : ""}: ${e.message}`,
					)
				}
			}
		}

		const total = passed + failed
		ctx.output.info(`\n${passed}/${total} passed`)
		if (failed > 0) {
			throw new Error(`${failed} scenario(s) failed`)
		}
	},
}

export const testGroup: CommandGroup = {
	name: "test",
	description: "Run scenario-based tests for BPMN processes",
	commands: [testCmd],
}
