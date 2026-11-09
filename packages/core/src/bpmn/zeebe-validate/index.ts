import type { BpmnDefinitions } from "../bpmn-model.js"
import { parseBpmn } from "../bpmn-parser.js"
import type { OptimizationFinding } from "../optimize/types.js"
import { type ValidateDeployableOptions, type ZeebeCheck, ZeebeContext } from "./context.js"
import { checks as events } from "./rules/events.js"
import { checks as extensions } from "./rules/extensions.js"
import { checks as gateways } from "./rules/gateways.js"
import { checks as references } from "./rules/references.js"
import { checks as structure } from "./rules/structure.js"
import { checks as tasks } from "./rules/tasks.js"
import { checkXml } from "./xml.js"

export type { ValidateDeployableOptions, ZeebeLimits, ZeebeResolver } from "./context.js"

/**
 * Sections of zeebe-rules.md: structure A-C, events D, references E, tasks F-I,
 * gateways/multi-instance/sub-processes J-L, expressions/extensions/deployment M-O.
 */
const CHECKS: readonly ZeebeCheck[] = [
	...structure,
	...events,
	...references,
	...tasks,
	...gateways,
	...extensions,
]

/**
 * Checks a model against the rules Zeebe applies when it is deployed
 * (`spec/zeebe-rules.json`), so a model that passes deploys on Camunda 8.
 *
 * Recursive (sub-processes, event sub-processes, ad-hoc sub-processes) and
 * version-aware, and independent of `modeler:executionPlatform`: a caller that
 * targets Camunda 8 asks for it. Findings are `zeebe/<rule>` in the `deploy`
 * category, sorted by rule then document order.
 *
 * @param definitions - The parsed model.
 * @param options - `camundaVersion` (default: the newest supported), a
 *   `resolver` for the other resources of the deployment, and length `limits`.
 *
 * @example
 * ```typescript
 * const findings = validateDeployable(Bpmn.parse(xml), { camundaVersion: "8.8" })
 * if (!isDeployable(findings)) throw new Error(findings[0].message)
 * ```
 */
export function validateDeployable(
	definitions: BpmnDefinitions,
	options: ValidateDeployableOptions = {},
): OptimizationFinding[] {
	const ctx = new ZeebeContext(withRootLists(definitions), options)
	for (const check of CHECKS) check(ctx)
	return ctx.finish()
}

/** Lint callers may hand over a partial model; missing root-element lists count as empty. */
function withRootLists(defs: BpmnDefinitions): BpmnDefinitions {
	return {
		...defs,
		processes: defs.processes ?? [],
		messages: defs.messages ?? [],
		errors: defs.errors ?? [],
		signals: defs.signals ?? [],
		escalations: defs.escalations ?? [],
		collaborations: defs.collaborations ?? [],
		diagrams: defs.diagrams ?? [],
	}
}

/** Whether Zeebe would accept the model: no finding of severity `error`. */
export function isDeployable(findings: readonly OptimizationFinding[]): boolean {
	return !findings.some((f) => f.severity === "error")
}

const EMPTY: BpmnDefinitions = {
	id: "",
	targetNamespace: "",
	namespaces: {},
	unknownAttributes: {},
	errors: [],
	escalations: [],
	messages: [],
	signals: [],
	collaborations: [],
	processes: [],
	diagrams: [],
}

/**
 * {@link validateDeployable} on BPMN XML, plus the checks Zeebe runs on the text
 * before it builds a model (well-formedness, namespaces, XSD-required attributes,
 * id syntax and uniqueness). This is the full gate for generated XML: BPMN Kit's
 * own parser is tolerant and repairs some of what Zeebe rejects.
 *
 * @param xml - The BPMN XML as it would be deployed.
 * @param options - As for {@link validateDeployable}.
 */
export function validateDeployableXml(
	xml: string,
	options: ValidateDeployableOptions = {},
): OptimizationFinding[] {
	let definitions: BpmnDefinitions | undefined
	let parseError: string | undefined
	try {
		definitions = parseBpmn(xml)
	} catch (err) {
		parseError = (err as Error).message
	}
	const ctx = new ZeebeContext(definitions ?? EMPTY, options)
	const { fatal } = checkXml(xml, ctx)
	if (parseError !== undefined && !fatal) {
		ctx.report(
			"xml-schema",
			"",
			`Unable to parse BPMN XML: ${parseError}`,
			"Fix the XML so it is well-formed BPMN 2.0.",
		)
	}
	if (definitions !== undefined && !fatal && parseError === undefined) {
		for (const check of CHECKS) check(ctx)
	}
	return ctx.finish()
}
