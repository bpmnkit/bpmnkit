/**
 * Whether a generated diagram can be deployed and run, as one verdict the page
 * shows next to the diagram. Pure, so it is tested without a browser.
 */
import {
	type BpmnDefinitions,
	type BpmnFlowElement,
	detectExecutionPlatform,
	lintDiagram,
} from "@bpmnkit/core"
import { parseExpression } from "@bpmnkit/feel"

export type Readiness =
	| { state: "ready"; version: string }
	| { state: "shape-only"; missing: { elementId: string; what: string }[] }
	| { state: "invalid"; errors: { elementId: string; message: string }[] }

/** What a draft is judged against when the diagram names no platform version. */
const DEFAULT_VERSION = "8.10"

/**
 * Lint errors that mean "not configured yet" rather than "wrong": the draft is
 * the right shape, a person still has to fill something in. Everything else
 * lint calls an error in an engine category stops a deploy.
 */
const UNCONFIGURED = new Set(["deploy/service-task-no-type", "connector/missing-required"])
// `compat/implementation` joins them when it says an implementation is missing, which the
// version-pinned check reports for a script task still to be written.

const ENGINE = new Set(["deploy", "connector", "agentic", "compat"])

type Ext = { name: string; attributes: Record<string, string>; children?: Ext[] }

const ext = (el: BpmnFlowElement): Ext[] =>
	(el as { extensionElements?: Ext[] }).extensionElements ?? []
const has = (el: BpmnFlowElement, name: string) => ext(el).some((e) => e.name === name)

/** Every flow element, sub-processes included. */
function walk(elements: readonly BpmnFlowElement[]): BpmnFlowElement[] {
	return elements.flatMap((el) => {
		const inner = (el as { flowElements?: BpmnFlowElement[] }).flowElements
		return inner ? [el, ...walk(inner)] : [el]
	})
}

/**
 * What lint cannot see. `expand` fills a service task's job type with the
 * element id so the file validates, but no worker listens for it; a user task
 * with neither a form nor `zeebe:userTask` and a script task with no script
 * have the same problem. A template-bound task (a connector) is configured by
 * its template, and lint already checks the template's required values.
 */
function unconfigured(el: BpmnFlowElement): string | undefined {
	if (el.unknownAttributes["zeebe:modelerTemplate"] !== undefined) return undefined
	const type = ext(el).find((e) => e.name === "zeebe:taskDefinition")?.attributes.type
	switch (el.type) {
		case "serviceTask":
		case "sendTask":
			return type === el.id ? "needs a job type or a connector" : undefined
		case "businessRuleTask": {
			const decision = ext(el).find((e) => e.name === "zeebe:calledDecision")?.attributes.decisionId
			if (decision !== undefined)
				return decision === el.id ? "needs a deployed decision" : undefined
			return type === el.id ? "needs a decision or a job type" : undefined
		}
		case "scriptTask":
			return has(el, "zeebe:script") || type !== undefined ? undefined : "needs a script"
		case "userTask":
			return has(el, "zeebe:formDefinition") || has(el, "zeebe:userTask")
				? undefined
				: "needs a form or a user task definition"
		default:
			return undefined
	}
}

/**
 * The tools of an AI Agent ad-hoc sub-process that have no documentation: the
 * agent picks a tool by its description, so one without cannot be chosen.
 */
function undescribedTools(el: BpmnFlowElement): BpmnFlowElement[] {
	if (el.type !== "adHocSubProcess") return []
	if (
		!el.unknownAttributes["zeebe:modelerTemplate"]?.startsWith("io.camunda.connectors.agenticai.")
	) {
		return []
	}
	return el.flowElements.filter(
		(child) => /Task$|^callActivity$/.test(child.type) && !child.documentation?.trim(),
	)
}

/** Mappings (`zeebe:input` / `zeebe:output`) whose source is FEEL that does not parse. */
function badMappings(el: BpmnFlowElement): string[] {
	const found: string[] = []
	for (const group of ext(el).filter((e) => e.name === "zeebe:ioMapping")) {
		for (const m of group.children ?? []) {
			const source = m.attributes.source ?? ""
			if (!source.startsWith("=")) continue
			if (source.slice(1).trim() === "" || parseExpression(source.slice(1)).errors.length > 0) {
				const kind = m.name === "zeebe:output" ? "output" : "input"
				found.push(`${kind} mapping "${m.attributes.target ?? ""}" is not valid FEEL: ${source}`)
			}
		}
	}
	return found
}

/**
 * Judges a diagram against Camunda 8: `invalid` when lint finds an error that
 * stops a deploy, `shape-only` when it deploys-in-principle but a step still
 * needs configuration, `ready` otherwise.
 */
export function readiness(defs: BpmnDefinitions, camundaVersion?: string): Readiness {
	// A diagram that names no platform is judged against the version the badge claims; one that
	// names its own is left to say so itself.
	const judged =
		camundaVersion ?? (detectExecutionPlatform(defs).id === "none" ? DEFAULT_VERSION : undefined)
	const report = lintDiagram(defs, {
		forceEngineRules: true,
		...(judged !== undefined ? { camundaVersion: judged } : {}),
	})
	const errors: { elementId: string; message: string }[] = []
	const missing: { elementId: string; what: string }[] = []
	const seen = new Set<string>()
	for (const d of report.diagnostics) {
		if (d.severity !== "error" || !ENGINE.has(d.category)) continue
		const elementId = d.elementIds[0] ?? ""
		if (
			UNCONFIGURED.has(d.id) ||
			(d.id === "compat/implementation" && /has no implementation/.test(d.message))
		) {
			seen.add(elementId)
			missing.push({ elementId, what: d.message })
		} else errors.push({ elementId, message: d.message })
	}
	for (const process of defs.processes) {
		for (const el of walk(process.flowElements)) {
			for (const message of badMappings(el)) errors.push({ elementId: el.id, message })
		}
	}
	if (errors.length > 0) return { state: "invalid", errors }

	for (const process of defs.processes) {
		for (const el of walk(process.flowElements)) {
			for (const tool of undescribedTools(el)) {
				missing.push({ elementId: tool.id, what: "needs a tool description" })
			}
			const what = unconfigured(el)
			if (what !== undefined && !seen.has(el.id)) missing.push({ elementId: el.id, what })
		}
	}
	if (missing.length > 0) return { state: "shape-only", missing }
	return {
		state: "ready",
		version:
			report.platform.id === "none"
				? (camundaVersion ?? DEFAULT_VERSION)
				: (report.platform.version ?? camundaVersion ?? DEFAULT_VERSION),
	}
}

/** The badge's words; the page adds the colour. */
export function badgeText(r: Readiness): string {
	switch (r.state) {
		case "ready":
			return `Ready to deploy (${r.version.split(".").slice(0, 2).join(".")})`
		case "shape-only": {
			const n = r.missing.length
			return `Shape only — ${n} ${n === 1 ? "step needs" : "steps need"} configuration`
		}
		case "invalid":
			return `${r.errors.length} deploy ${r.errors.length === 1 ? "error" : "errors"}`
	}
}
