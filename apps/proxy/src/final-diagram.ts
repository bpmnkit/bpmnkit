import {
	Bpmn,
	type BpmnDefinitions,
	DeployabilityError,
	type PlaceholderFill,
	assertDeployable,
	assertDeployableXml,
} from "@bpmnkit/core"

/** How `/chat` and `/improve` check the diagram they return (request body fields). */
export interface FinalGate {
	/** Refuse a diagram Zeebe would reject (default `true`). `false`: a draft, returned as it is. */
	validate?: boolean
	/** Fill documented placeholder values instead of refusing. */
	placeholders?: boolean
}

/** The SSE events the final diagram turns into, in order. */
export type FinalEvent =
	| { type: "xml"; xml: string }
	/** The gate's message for a draft returned with `validate: false`; advice, not a failure. */
	| { type: "deployability"; message: string }
	| { type: "placeholders"; placeholders: PlaceholderFill[] }
	| { type: "error"; message: string }

/** Appended to a refusal, so an API caller knows the two ways out. */
export const REFUSAL_HINT =
	'The diagram was not returned. Ask for the missing values, send "placeholders": true to fill placeholder values, or "validate": false to receive it as a draft.'

/** Reads `validate` / `placeholders` off a request body, ignoring anything else. */
export function finalGateOf(body: unknown): FinalGate {
	if (typeof body !== "object" || body === null) return {}
	const { validate, placeholders } = body as Record<string, unknown>
	return {
		...(typeof validate === "boolean" ? { validate } : {}),
		...(placeholders === true ? { placeholders: true } : {}),
	}
}

/**
 * The deploy gate on the diagram an AI route returns: deployable XML as it is, a
 * refusal as an `error` event with the gate's message, filled XML with its fills,
 * or, for a draft (`validate: false`), the XML plus the gate's message as advice.
 */
export function finalDiagramEvents(xml: string, gate: FinalGate = {}): FinalEvent[] {
	try {
		assertDeployableXml(xml)
		return [{ type: "xml", xml }]
	} catch (err) {
		if (!(err instanceof DeployabilityError)) throw err
		if (gate.validate === false) {
			return [
				{ type: "xml", xml },
				{ type: "deployability", message: err.message },
			]
		}
		if (gate.placeholders !== true) {
			return [{ type: "error", message: `${err.message}\n${REFUSAL_HINT}` }]
		}
		const defs = Bpmn.parse(xml)
		try {
			const filled = assertDeployable(defs, {
				placeholders: true,
				camundaVersion: defs.unknownAttributes["modeler:executionPlatformVersion"],
			})
			return [
				{ type: "xml", xml: Bpmn.export(filled.definitions, { validate: false }) },
				{ type: "placeholders", placeholders: filled.placeholders },
			]
		} catch (filledErr) {
			if (!(filledErr instanceof DeployabilityError)) throw filledErr
			return [{ type: "error", message: `${filledErr.message}\n${REFUSAL_HINT}` }]
		}
	}
}

/**
 * The line appended to every tool result that changed a BPMN diagram: the model
 * sees what Zeebe would refuse while it can still fix it.
 */
export function deployCheckLine(xml: string): string {
	try {
		assertDeployableXml(xml)
		return "Deploy check: the diagram deploys on Camunda 8."
	} catch (err) {
		if (!(err instanceof DeployabilityError)) throw err
		return `Deploy check: ${err.message}\nFix every error above before you finish; a diagram that does not deploy is not returned to the user.`
	}
}

/**
 * Declares the diagram-interchange namespaces on a model the MCP tools lay out. A
 * model parsed from XML without a diagram (or started without one) does not declare
 * them, and the serializer leaves the structural prefixes to the caller.
 */
export function declareDiNamespaces(definitions: BpmnDefinitions): void {
	const ns = definitions.namespaces
	const declared = new Set(Object.values(ns))
	for (const [prefix, uri] of DI_NAMESPACES) {
		if (!declared.has(uri)) ns[prefix] ??= uri
	}
}

const DI_NAMESPACES = [
	["bpmndi", "http://www.omg.org/spec/BPMN/20100524/DI"],
	["dc", "http://www.omg.org/spec/DD/20100524/DC"],
	["di", "http://www.omg.org/spec/DD/20100524/DI"],
] as const

/**
 * Throws the gate's message followed by `next` (what the caller can do about it) when
 * `xml` would not deploy: for a tool about to deploy or write BPMN it did not build.
 */
export function refuseUndeployable(xml: string, next: string): void {
	try {
		assertDeployableXml(xml)
	} catch (err) {
		if (!(err instanceof DeployabilityError)) throw err
		throw new Error(`${err.message}\n${next}`)
	}
}
