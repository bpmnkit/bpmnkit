/**
 * Whether a generated diagram can be deployed and run, as one verdict the page
 * shows next to the diagram. Pure, so it is tested without a browser.
 */
import {
	type BpmnDefinitions,
	type BpmnFlowElement,
	DeployabilityError,
	type OptimizationFinding,
	assertDeployable,
	assertDeployableXml,
	detectExecutionPlatform,
	lintDiagram,
} from "@bpmnkit/core"
import { parseExpression } from "@bpmnkit/feel"

/** The deploy gate's refusal (`assertDeployable`), when it refuses the diagram. */
export interface ReadinessGate {
	/** The gate's message: a summary line, then one line per error. */
	message: string
	/** Every error is one a documented placeholder fills: "Fill placeholders" makes it deploy. */
	fillable: boolean
}

export type Readiness =
	| { state: "ready"; version: string }
	| { state: "shape-only"; missing: { elementId: string; what: string }[]; gate?: ReadinessGate }
	| { state: "invalid"; errors: { elementId: string; message: string }[]; gate?: ReadinessGate }

/** What a draft is judged against when the diagram names no platform version. */
const DEFAULT_VERSION = "8.10"

/**
 * Lint errors that mean "not configured yet" rather than "wrong": the draft is
 * the right shape, a person still has to fill something in. Everything else
 * lint calls an error in an engine category stops a deploy.
 */
const UNCONFIGURED = new Set([
	"deploy/service-task-no-type",
	"connector/missing-required",
	// Values the deploy gate's placeholders fill ("Fill placeholders"): still to configure.
	"deploy/message-catch-no-correlation",
	"deploy/message-start-no-name",
	"deploy/call-activity-no-process",
])
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
		// The model draws `task` when it has no better word; the engine passes straight through it.
		case "task":
			return "a plain task does nothing when run — make it a service, user or script task"
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
	// The deploy gate has the last word on "deploys". What a placeholder fills is still to
	// configure, whichever check says so; what lint does not already say is added below.
	const gate = gateVerdict(
		defs,
		camundaVersion ?? defs.unknownAttributes["modeler:executionPlatformVersion"] ?? DEFAULT_VERSION,
	)
	const unfillable = new Set(gate?.unfillable.map(findingKey))
	const fillable = new Set(gate?.findings.map(findingKey).filter((k) => !unfillable.has(k)))
	for (const d of report.diagnostics) {
		if (d.severity !== "error" || !ENGINE.has(d.category)) continue
		const elementId = d.elementIds[0] ?? ""
		if (
			UNCONFIGURED.has(d.id) ||
			fillable.has(findingKey(d)) ||
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

	if (gate !== undefined) {
		const said = new Set([...errors.map((e) => e.elementId), ...seen])
		for (const f of gate.findings) {
			const elementId = f.elementIds[0] ?? ""
			if (said.has(elementId) && elementId !== "") continue
			// Lint names a process that is not executable without an element id.
			if (f.id === "zeebe/executable-process" && errors.some((e) => /executable/.test(e.message)))
				continue
			if (unfillable.has(findingKey(f)))
				errors.push({ elementId, message: `${f.message} (${f.id})` })
			else {
				seen.add(elementId)
				missing.push({ elementId, what: f.message })
			}
		}
	}
	const gated = gate === undefined ? {} : { gate: gate.gate }
	if (errors.length > 0) return { state: "invalid", errors, ...gated }

	for (const process of defs.processes) {
		for (const el of walk(process.flowElements)) {
			for (const tool of undescribedTools(el)) {
				missing.push({ elementId: tool.id, what: "needs a tool description" })
			}
			const what = unconfigured(el)
			if (what !== undefined && !seen.has(el.id)) missing.push({ elementId: el.id, what })
		}
	}
	if (missing.length > 0) return { state: "shape-only", missing, ...gated }
	return {
		state: "ready",
		version:
			report.platform.id === "none"
				? (camundaVersion ?? DEFAULT_VERSION)
				: (report.platform.version ?? camundaVersion ?? DEFAULT_VERSION),
	}
}

const findingKey = (f: { id: string; elementIds: readonly string[] }) =>
	`${f.id} ${f.elementIds[0] ?? ""}`

/**
 * The gate's refusal of `defs`, and which of its errors a placeholder fill leaves:
 * `undefined` when the diagram deploys.
 */
function gateVerdict(
	defs: BpmnDefinitions,
	camundaVersion: string,
):
	| { gate: ReadinessGate; findings: OptimizationFinding[]; unfillable: OptimizationFinding[] }
	| undefined {
	try {
		assertDeployable(defs, { camundaVersion })
		return undefined
	} catch (err) {
		if (!(err instanceof DeployabilityError)) throw err
		let unfillable: OptimizationFinding[] = []
		try {
			assertDeployable(defs, { camundaVersion, placeholders: true })
		} catch (filled) {
			if (!(filled instanceof DeployabilityError)) throw filled
			unfillable = filled.findings
		}
		return {
			gate: { message: err.message, fillable: unfillable.length === 0 },
			findings: err.findings,
			unfillable,
		}
	}
}

/**
 * Fills every documented placeholder the deploy gate asks for: the explicit
 * "Fill placeholders" action. `null` when something no placeholder can fix remains.
 */
export function fillPlaceholders(
	defs: BpmnDefinitions,
	camundaVersion?: string,
): { definitions: BpmnDefinitions; filled: string[] } | null {
	try {
		const result = assertDeployable(defs, {
			placeholders: true,
			camundaVersion:
				camundaVersion ??
				defs.unknownAttributes["modeler:executionPlatformVersion"] ??
				DEFAULT_VERSION,
		})
		return {
			definitions: result.definitions,
			filled: result.placeholders.map((p) => `${p.elementId}: ${p.field} = ${p.value}`),
		}
	} catch (err) {
		if (err instanceof DeployabilityError) return null
		throw err
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

/**
 * Why the draft may not be shared yet: the deploy gate's message on the exact XML
 * that would be stored, then what to do about it. `null` when it deploys.
 */
export function shareRefusal(xml: string): string | null {
	try {
		assertDeployableXml(xml)
		return null
	} catch (err) {
		if (!(err instanceof DeployabilityError)) throw err
		return `${err.message}\nNot shared: it would not deploy on Camunda 8. Use "Fill placeholders", or complete the steps, then share. "Edit" opens the draft as it is.`
	}
}
