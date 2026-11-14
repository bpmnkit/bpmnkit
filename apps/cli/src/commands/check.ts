import { readFile } from "node:fs/promises"
import { extname } from "node:path"
import {
	Bpmn,
	type BpmnDefinitions,
	type BpmnFlowElement,
	type CheckFinding,
	type CheckSeverity,
	lintDmn,
	lintForm,
	parseXml,
	validateDeployableXml,
} from "@bpmnkit/core"
import type { Command, CommandGroup, ParsedFlags } from "../types.js"
import { bpmnlintrcSuffix, lintBpmn } from "./lint.js"

export type CheckKind = "bpmn" | "dmn" | "form"

/** One finding of `casen check`, the same shape for every resource kind. */
export interface CheckRow extends CheckFinding {
	file: string
	kind: CheckKind | "unknown"
}

export interface CheckOptions {
	/** The deploy-readiness gate: Camunda 8 rules on, error-severity findings only. */
	deploy?: boolean
	/** The sketch profile: no Camunda 8 deployability rules on BPMN. */
	sketch?: boolean
	/** Override whether user tasks without a form are reported. */
	userTaskForms?: "require" | "off"
	/** Honour the nearest `.bpmnlintrc` for BPMN files. Default `true`. */
	bpmnlintrc?: boolean
}

const KIND_BY_EXT: Record<string, CheckKind> = { ".bpmn": "bpmn", ".dmn": "dmn", ".form": "form" }

/** What one BPMN file references by id in the other resources of a deployment. */
interface References {
	file: string
	forms: { elementId: string; formId: string }[]
	decisions: { elementId: string; decisionId: string }[]
}

function* flowElements(elements: readonly BpmnFlowElement[]): Generator<BpmnFlowElement> {
	for (const el of elements) {
		yield el
		if ("flowElements" in el && Array.isArray(el.flowElements)) yield* flowElements(el.flowElements)
	}
}

/** A static id; a FEEL expression (`=…`) is resolved at runtime and cannot be checked here. */
function staticId(value: string | undefined): string | undefined {
	return value === undefined || value === "" || value.startsWith("=") ? undefined : value
}

function referencesOf(file: string, defs: BpmnDefinitions): References {
	const refs: References = { file, forms: [], decisions: [] }
	for (const process of defs.processes) {
		for (const el of flowElements(process.flowElements)) {
			for (const ext of el.extensionElements) {
				if (ext.name.endsWith(":formDefinition")) {
					const formId = staticId(ext.attributes.formId)
					if (formId !== undefined) refs.forms.push({ elementId: el.id, formId })
				} else if (ext.name.endsWith(":calledDecision")) {
					const decisionId = staticId(ext.attributes.decisionId)
					if (decisionId !== undefined) refs.decisions.push({ elementId: el.id, decisionId })
				}
			}
		}
	}
	return refs
}

async function checkBpmn(
	file: string,
	text: string,
	options: CheckOptions,
): Promise<{ rows: CheckRow[]; refs?: References }> {
	const row = (f: CheckFinding): CheckRow => ({ file, kind: "bpmn", ...f })
	try {
		parseXml(text)
	} catch (err) {
		return {
			rows: [
				row({
					rule: "bpmn/malformed-xml",
					severity: "error",
					message: `The document is not well-formed XML: ${(err as Error).message}`,
					fix: "Fix the XML syntax (unclosed or mismatched tags, unquoted attributes, a stray `&` written instead of `&amp;`).",
				}),
			],
		}
	}
	let outcome: Awaited<ReturnType<typeof lintBpmn>>
	try {
		outcome = await lintBpmn(file, text, {
			deployProfile: options.deploy === true,
			sketch: options.sketch === true,
			bpmnlintrc: options.bpmnlintrc !== false,
			...(options.userTaskForms !== undefined ? { userTaskForms: options.userTaskForms } : {}),
		})
	} catch (err) {
		return {
			rows: [
				row({
					rule: "bpmn/invalid-model",
					severity: "error",
					message: `The document is not a BPMN model BPMN Kit can read: ${(err as Error).message}`,
					fix: 'Make the root <bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"> and give every element its required attributes.',
				}),
			],
		}
	}
	const rows = outcome.findings.map((f) =>
		row({
			rule: f.id,
			severity: f.severity,
			...(f.elementIds[0] !== undefined ? { elementId: f.elementIds[0] } : {}),
			message: f.message,
			fix: `${f.suggestion !== "" ? f.suggestion : "See the rule's documentation."} (agent-cards/bpmn.md#traps)`,
		}),
	)
	if (options.deploy === true) rows.push(...gateRows(text, outcome.defs, rows).map(row))
	return { rows, refs: referencesOf(file, outcome.defs) }
}

/**
 * What the deploy gate (`assertDeployable`) refuses that the lint did not already
 * report: it checks the file's bytes, so the XML schema stage is covered too. An
 * element the lint already marks as an error keeps that finding, which says more.
 */
function gateRows(text: string, defs: BpmnDefinitions, rows: CheckRow[]): CheckFinding[] {
	const reported = new Set(rows.map((r) => `${r.rule} ${r.elementId ?? ""}`))
	const flagged = new Set(rows.filter((r) => r.severity === "error").map((r) => r.elementId))
	const camundaVersion = defs.unknownAttributes["modeler:executionPlatformVersion"]
	return validateDeployableXml(text, camundaVersion === undefined ? {} : { camundaVersion })
		.filter((f) => f.severity === "error")
		.filter((f) => {
			const elementId = f.elementIds[0]
			if (reported.has(`${f.id} ${elementId ?? ""}`)) return false
			return elementId === undefined || elementId === "" || !flagged.has(elementId)
		})
		.map((f) => ({
			rule: f.id,
			severity: "error" as const,
			...(f.elementIds[0] ? { elementId: f.elementIds[0] } : {}),
			message: f.message,
			fix: `${f.suggestion !== "" ? f.suggestion : "See the rule's documentation."} (agent-cards/bpmn.md#traps)`,
		}))
}

function idsOfForm(text: string): string | undefined {
	try {
		const json: unknown = JSON.parse(text)
		if (typeof json === "object" && json !== null && "id" in json && typeof json.id === "string")
			return json.id
	} catch {
		// The form's own check reports the JSON error.
	}
	return undefined
}

function decisionIdsOfDmn(text: string): string[] {
	try {
		return parseXml(text)
			.children.filter((c) => c.name === "decision" || c.name.endsWith(":decision"))
			.map((c) => c.attributes.id)
			.filter((id): id is string => id !== undefined)
	} catch {
		return []
	}
}

/**
 * Cross-file checks: a user task's `formId` and a business rule task's
 * `decisionId` must name a form or decision among the files being checked.
 * Only run for a kind when at least one file of that kind was given, since
 * otherwise the resource is presumably deployed separately.
 */
function checkReferences(
	refs: References[],
	formIds: Set<string> | undefined,
	decisionIds: Set<string> | undefined,
	deploy: boolean,
): CheckRow[] {
	// Zeebe deploys a dangling reference and fails only when the task is reached;
	// under the deploy gate the resources are meant to ship together, so it is an error.
	const severity: CheckSeverity = deploy ? "error" : "warning"
	const rows: CheckRow[] = []
	for (const r of refs) {
		if (formIds !== undefined) {
			for (const { elementId, formId } of r.forms) {
				if (formIds.has(formId)) continue
				rows.push({
					file: r.file,
					kind: "bpmn",
					rule: "check/unresolved-form",
					severity,
					elementId,
					message: `"${elementId}" links formId "${formId}", which none of the checked forms has.`,
					fix: `Set formId to one of ${[...formIds].map((id) => `"${id}"`).join(", ") || "the checked forms' ids"}, or check the form that has id "${formId}" too.`,
				})
			}
		}
		if (decisionIds !== undefined) {
			for (const { elementId, decisionId } of r.decisions) {
				if (decisionIds.has(decisionId)) continue
				rows.push({
					file: r.file,
					kind: "bpmn",
					rule: "check/unresolved-decision",
					severity,
					elementId,
					message: `"${elementId}" calls decisionId "${decisionId}", which none of the checked DMN files defines.`,
					fix: `Set decisionId to one of ${[...decisionIds].map((id) => `"${id}"`).join(", ") || "the checked decisions' ids"}, or check the DMN that defines "${decisionId}" too.`,
				})
			}
		}
	}
	return rows
}

/**
 * Checks BPMN, DMN and form files in one pass — each file on its own, then
 * the references between them — and returns every finding in one shape.
 *
 * @param files - Paths to `.bpmn`, `.dmn` and `.form` files.
 */
export async function checkFiles(
	files: readonly string[],
	options: CheckOptions = {},
): Promise<CheckRow[]> {
	const rows: CheckRow[] = []
	const refs: References[] = []
	let formIds: Set<string> | undefined
	let decisionIds: Set<string> | undefined

	for (const file of files) {
		const kind = KIND_BY_EXT[extname(file).toLowerCase()]
		if (kind === undefined) {
			rows.push({
				file,
				kind: "unknown",
				rule: "check/unsupported-file",
				severity: "error",
				message: `"${file}" is not a .bpmn, .dmn or .form file.`,
				fix: "Pass only .bpmn, .dmn and .form files.",
			})
			continue
		}
		let text: string
		try {
			text = await readFile(file, "utf-8")
		} catch (err) {
			rows.push({
				file,
				kind,
				rule: "check/unreadable",
				severity: "error",
				message: `Cannot read "${file}": ${(err as Error).message}`,
				fix: "Check the path.",
			})
			continue
		}
		if (kind === "bpmn") {
			const result = await checkBpmn(file, text, options)
			rows.push(...result.rows)
			if (result.refs !== undefined) refs.push(result.refs)
		} else if (kind === "dmn") {
			rows.push(...lintDmn(text).map((f) => ({ file, kind, ...f })))
			decisionIds ??= new Set()
			for (const id of decisionIdsOfDmn(text)) decisionIds.add(id)
		} else {
			rows.push(...lintForm(text).map((f) => ({ file, kind, ...f })))
			formIds ??= new Set()
			const id = idsOfForm(text)
			if (id !== undefined) formIds.add(id)
		}
	}
	rows.push(...checkReferences(refs, formIds, decisionIds, options.deploy === true))
	// The deploy gate answers one question — will it deploy and run — so only errors count.
	return options.deploy === true ? rows.filter((r) => r.severity === "error") : rows
}

const BOOLEAN_FLAGS = ["deploy", "sketch", "json"] as const

/**
 * The argument parser cannot know `--json` takes no value, so `--json a.bpmn`
 * reads the file as the flag's value. Give such values back as files.
 */
export function recoverFiles(
	positional: readonly string[],
	flags: ParsedFlags,
): { files: string[]; flags: Record<(typeof BOOLEAN_FLAGS)[number], boolean> } {
	const files = [...positional]
	const out = { deploy: false, sketch: false, json: false }
	for (const name of BOOLEAN_FLAGS) {
		const value = flags[name]
		if (typeof value === "string") {
			files.push(value)
			out[name] = true
		} else {
			out[name] = value === true
		}
	}
	return { files, flags: out }
}

const SEVERITY_SYMBOL: Record<CheckSeverity, string> = { error: "✖", warning: "⚠", info: "ℹ" }

const checkCmd: Command = {
	name: "check",
	description:
		"Check .bpmn, .dmn and .form files in one call — BPMN lint, DMN and form validation, and the references between them",
	args: [
		{
			name: "file...",
			description: "One or more .bpmn, .dmn or .form files",
			required: true,
		},
	],
	flags: [
		{
			name: "deploy",
			description:
				"Deploy-readiness gate: Camunda 8 rules on even for a model naming no platform, user tasks need a form, cross-file references are errors; only errors are shown.",
			type: "boolean",
		},
		{
			name: "sketch",
			description:
				"Sketch profile: skip every Camunda 8 deployability rule on BPMN, as for a model that names no platform.",
			type: "boolean",
		},
		{
			name: "user-task-forms",
			description:
				'"require" reports user tasks with no form; "off" does not. Default: "require" with --deploy, "off" otherwise.',
			type: "string",
			enum: ["require", "off"],
		},
		{ name: "json", description: "Print findings as JSON", type: "boolean" },
		{
			name: "bpmnlintrc",
			description: "Honour the nearest .bpmnlintrc for BPMN files. --no-bpmnlintrc ignores it.",
			type: "boolean",
			default: true,
		},
	],
	examples: [
		{
			description: "Check a process with its form and decision",
			command: "casen check order.bpmn order.form discount.dmn",
		},
		{ description: "Deploy-readiness gate", command: "casen check order.bpmn order.form --deploy" },
		{
			description: "Machine-readable findings for an agent loop",
			command: "casen check *.bpmn *.dmn *.form --json",
		},
	],
	async run(ctx) {
		const { files, flags } = recoverFiles(ctx.positional, ctx.flags)
		if (files.length === 0) throw new Error("Missing required argument: <file...>")
		const formsFlag = ctx.flags["user-task-forms"]
		const rows = await checkFiles(files, {
			deploy: flags.deploy,
			sketch: flags.sketch,
			bpmnlintrc: ctx.flags.bpmnlintrc !== false,
			...(formsFlag === "require" || formsFlag === "off" ? { userTaskForms: formsFlag } : {}),
		})
		const errors = rows.filter((r) => r.severity === "error").length
		const warnings = rows.filter((r) => r.severity === "warning").length

		if (flags.json) {
			ctx.output.print({ ok: errors === 0, errors, warnings, findings: rows })
		} else if (rows.length === 0) {
			ctx.output.ok(`${files.length} file${files.length === 1 ? "" : "s"} checked — no issues.`)
		} else {
			for (const file of files) {
				const own = rows.filter((r) => r.file === file)
				if (own.length === 0) continue
				ctx.output.info(file)
				for (const r of own) {
					const at = r.elementId !== undefined ? ` [${r.elementId}]` : ""
					ctx.output.info(
						`  ${SEVERITY_SYMBOL[r.severity]} ${r.rule}${bpmnlintrcSuffix(r.rule)}${at} ${r.message}`,
					)
					ctx.output.info(`      fix: ${r.fix}`)
				}
			}
			ctx.output.info(
				`\n${rows.length} finding${rows.length === 1 ? "" : "s"}: ${errors} error${errors === 1 ? "" : "s"}, ${warnings} warning${warnings === 1 ? "" : "s"}`,
			)
		}
		if (errors > 0) throw new Error(`Check failed with ${errors} error${errors === 1 ? "" : "s"}`)
	},
}

export const checkGroup: CommandGroup = {
	name: "check",
	description: "Check BPMN, DMN and form files before deploying — casen check <file...>",
	commands: [checkCmd],
}
