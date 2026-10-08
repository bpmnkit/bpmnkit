import { readFile, writeFile } from "node:fs/promises"
import { resolve } from "node:path"
import { applyConnectorTemplate } from "@bpmnkit/connectors"
import { Bpmn, compilePlan, listSecrets, mergePlan, slugify, uniqueId } from "@bpmnkit/core"
import type { DiagramSecret, PlanScenario, ProcessPlan } from "@bpmnkit/core"
import { type DryRunResult, dryRun } from "@bpmnkit/engine/testing"
import type { Command, CommandGroup } from "../types.js"

async function readPlan(path: string): Promise<ProcessPlan> {
	const text = await readFile(resolve(path), "utf-8")
	return JSON.parse(text) as ProcessPlan
}

/** Convert plan-embedded test scenarios to the `.bpmn.tests.json` shape consumed by `casen test`. */
export function toScenarioSidecar(tests: PlanScenario[]): unknown[] {
	const taken = new Set<string>()
	return tests.map((t) => {
		const id = uniqueId(slugify(t.name), taken)

		const mocks = Object.fromEntries(
			Object.entries(t.mocks ?? {}).map(([jobType, mock]) => [
				jobType,
				"error" in mock
					? {
							error: mock.error.message
								? `${mock.error.code}: ${mock.error.message}`
								: mock.error.code,
						}
					: { outputs: mock.outputs },
			]),
		)

		return { id, name: t.name, inputs: t.inputs, mocks, expect: t.expect }
	})
}

/** What `--check` found: a dry run of each process, and the secrets to create. */
export interface DiagramCheck {
	runs: DryRunResult[]
	secrets: DiagramSecret[]
}

/**
 * Runs each process of a diagram once with every connector and job mocked
 * (`dryRun` from `@bpmnkit/engine/testing`), and lists the secrets it reads.
 */
export async function checkDiagram(xml: string): Promise<DiagramCheck> {
	const defs = Bpmn.parse(xml)
	const runs: DryRunResult[] = []
	for (const process of defs.processes) {
		if (process.isExecutable === false) continue
		runs.push(await dryRun(defs, { processId: process.id }))
	}
	return { runs, secrets: listSecrets(defs) }
}

/** `--check`'s findings as lines, element ids shown by name. */
export function formatCheck(check: DiagramCheck, xml: string): string[] {
	const defs = Bpmn.parse(xml)
	const names = new Map<string, string>()
	const walk = (elements: readonly { id: string; name?: string; flowElements?: unknown }[]) => {
		for (const el of elements) {
			if (el.name) names.set(el.id, el.name)
			if (Array.isArray(el.flowElements)) walk(el.flowElements)
		}
	}
	for (const p of defs.processes) walk(p.flowElements)
	const label = (id: string) => (names.has(id) ? `"${names.get(id)}"` : id)
	const lines: string[] = []
	for (const run of check.runs) {
		const mocked = `${run.connectors.length} connector(s) mocked`
		if (run.reachedEnd) {
			const end = run.path.at(-1)
			lines.push(
				`✓ Dry run of ${run.processId} reaches ${end ? label(end) : "its end"} · ${mocked}`,
			)
		} else {
			const at = run.stoppedAt[0] ?? run.path.at(-1)
			lines.push(
				`✖ Dry run of ${run.processId} stops${at ? ` at ${label(at)}` : ""}${run.error ? `: ${run.error}` : ""}`,
			)
		}
	}
	if (check.secrets.length > 0) {
		lines.push("Secrets to create in the cluster before deploying:")
		for (const s of check.secrets) {
			lines.push(`  ${s.name} — ${s.elementIds.map(label).join(", ")}`)
		}
	}
	return lines
}

const synthCmd: Command = {
	name: "synth",
	description: "Compile a ProcessPlan JSON file into deployable, laid-out BPMN XML",
	args: [{ name: "plan", description: "Path to the ProcessPlan JSON file", required: true }],
	flags: [
		{
			name: "output",
			short: "o",
			description: "Output .bpmn file path (default: <plan>.bpmn)",
			type: "string",
		},
		{
			name: "merge",
			description: "Merge into an existing .bpmn file instead of creating a new one",
			type: "string",
		},
		{
			name: "json",
			description: "Print the result (problems + xml) as JSON instead of writing a file",
			type: "boolean",
		},
		{
			name: "check",
			description:
				"Dry-run each process with every connector mocked, and list the secrets it needs; a run that cannot reach its end fails",
			type: "boolean",
		},
	],
	examples: [
		{ description: "Compile a plan to BPMN", command: "casen synth order-process.plan.json" },
		{
			description: "Extend an existing process",
			command: "casen synth delta.plan.json --merge order-process.bpmn",
		},
		{
			description: "Prove the result runs, and list the secrets to create",
			command: "casen synth order-process.plan.json --check",
		},
	],
	async run(ctx) {
		const planPath = ctx.positional[0]
		if (!planPath) throw new Error("Missing required argument: <plan>")

		const plan = await readPlan(planPath)
		const mergeTarget = typeof ctx.flags.merge === "string" ? ctx.flags.merge : undefined

		const result = mergeTarget
			? mergePlan(Bpmn.parse(await readFile(resolve(mergeTarget), "utf-8")), plan, {
					resolveConnector: applyConnectorTemplate,
				})
			: compilePlan(plan, { resolveConnector: applyConnectorTemplate })

		const check =
			ctx.flags.check === true && result.xml ? await checkDiagram(result.xml) : undefined
		const ran = check === undefined || check.runs.every((r) => r.reachedEnd)

		if (ctx.flags.json) {
			ctx.output.print(check ? { ...result, check } : result)
			if (!result.xml || !ran) process.exitCode = 1
			return
		}

		if (result.problems.length > 0) {
			for (const p of result.problems) ctx.output.info(`✖ [${p.path}] ${p.message}`)
		}
		if (!result.xml) {
			throw new Error(`Compilation failed with ${result.problems.length} problem(s) — see above`)
		}

		const outputPath = resolve(
			typeof ctx.flags.output === "string"
				? ctx.flags.output
				: (mergeTarget ?? planPath.replace(/\.json$/, ".bpmn")),
		)
		await writeFile(outputPath, result.xml, "utf-8")

		if (plan.tests && plan.tests.length > 0) {
			const sidecarPath = `${outputPath}.tests.json`
			await writeFile(sidecarPath, JSON.stringify(toScenarioSidecar(plan.tests), null, 2), "utf-8")
			ctx.output.info(
				`Wrote ${sidecarPath} (${plan.tests.length} scenario(s) — run: casen test ${outputPath})`,
			)
		}

		if (result.problems.length > 0) {
			ctx.output.info(`\nWrote ${outputPath} with ${result.problems.length} problem(s) above.`)
			process.exitCode = 1
		} else {
			ctx.output.ok(`Wrote ${outputPath}`)
		}
		if (check) {
			for (const line of formatCheck(check, result.xml)) ctx.output.info(line)
			if (!ran) process.exitCode = 1
		}
	},
}

export const synthGroup: CommandGroup = {
	name: "synth",
	description:
		"Compile a ProcessPlan into deployable BPMN — the deterministic AI-generation pipeline",
	commands: [synthCmd],
}
