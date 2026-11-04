import type { XmlElement } from "../types/xml-element.js"
import type { BpmnConditionalEventDefinition } from "./bpmn-model.js"
import { ZEEBE_PLACEMENT } from "./zeebe-placement.js"

/** Zeebe task definition extension. */
export interface ZeebeTaskDefinition {
	type: string
	retries?: string
}

/** A single Zeebe IO mapping entry. */
export interface ZeebeIoMappingEntry {
	source: string
	target: string
}

/** Zeebe IO mapping extension. */
export interface ZeebeIoMapping {
	inputs: ZeebeIoMappingEntry[]
	outputs: ZeebeIoMappingEntry[]
}

/** A single Zeebe task header entry. */
export interface ZeebeTaskHeaderEntry {
	key: string
	value: string
}

/** Zeebe task headers extension. */
export interface ZeebeTaskHeaders {
	headers: ZeebeTaskHeaderEntry[]
}

/** A single Zeebe property entry. */
export interface ZeebePropertyEntry {
	name: string
	value: string
}

/** Zeebe properties extension. */
export interface ZeebeProperties {
	properties: ZeebePropertyEntry[]
}

/** Zeebe ad-hoc sub-process extension (AI Agent job worker pattern). */
export interface ZeebeAdHoc {
	/** Variable name that collects tool call results from child tasks. */
	outputCollection?: string
	/** FEEL expression mapping each child task's result into the collection. */
	outputElement?: string
	/** FEEL expression selecting which child element IDs to activate (BPMN-native mode). */
	activeElementsCollection?: string
}

/**
 * Zeebe agent definition (`zeebe:agentDefinition`, Camunda 8.10+): marks a
 * service task or ad-hoc sub-process as an AI agent the engine runs, e.g.
 * `aiAgentTask` or `aiAgentSubProcess`.
 */
export interface ZeebeAgentDefinition {
	agentType: string
}

/** Zeebe form definition extension for user tasks. */
export type ZeebeFormDefinition =
	| {
			/** ID of the Camunda Form linked to this user task. */
			formId: string
			/** What `formId` resolves against (`bindingType`, Camunda 8.6+ unless `latest`). */
			bindingType?: "latest" | "deployment" | "versionTag"
			/** Version tag of the form; only meaningful with `bindingType: "versionTag"`. */
			versionTag?: string
	  }
	| {
			/** Embedded form (`camunda-forms:bpmn:<id>`) or a legacy form key. */
			formKey: string
	  }
	| {
			/** External form URL, for a Camunda user task (`zeebe:userTask`). */
			externalReference: string
	  }

/** Zeebe called decision extension for business rule tasks. */
export interface ZeebeCalledDecision {
	/** ID of the DMN decision to invoke. */
	decisionId: string
	/** Process variable that receives the decision result. */
	resultVariable: string
}

/** Zeebe user task assignment (assignee / candidate groups / candidate users). */
export interface ZeebeAssignmentDefinition {
	assignee?: string
	candidateGroups?: string
	candidateUsers?: string
}

/** Zeebe user task scheduling (due date / follow-up date). */
export interface ZeebeTaskSchedule {
	dueDate?: string
	followUpDate?: string
}

/** Zeebe user task priority (0-100, default 50). */
export interface ZeebePriorityDefinition {
	priority: string
}

/** Zeebe message correlation key for a message catch/boundary/receive element. */
export interface ZeebeSubscription {
	correlationKey: string
}

/** Zeebe called element extension for call activities (zeebe:calledElement). */
export interface ZeebeCalledElement {
	/** ID of the process to call. */
	processId: string
	/** Held as booleans; the XML attributes are the strings "true"/"false". */
	propagateAllChildVariables?: boolean
	propagateAllParentVariables?: boolean
	bindingType?: "latest" | "deployment" | "versionTag"
	/** Only meaningful with `bindingType: "versionTag"`. */
	versionTag?: string
}

/** A job-worker listener (`zeebe:executionListener` / `zeebe:taskListener`). */
export interface ZeebeListener {
	/** Lifecycle event, such as `start`, `end` (execution) or `completing` (task). */
	eventType: string
	/** Job type the listener's worker subscribes to. */
	type: string
	retries?: string
	/**
	 * Listener headers (`zeebe:taskHeaders`). Read and written back so a
	 * read-modify-write of a diagram that has them does not drop them; the
	 * builder does not offer them.
	 */
	headers?: ZeebeTaskHeaderEntry[]
}

/** Collected Zeebe extensions on a service task. */
export interface ZeebeExtensions {
	taskDefinition?: ZeebeTaskDefinition
	ioMapping?: ZeebeIoMapping
	taskHeaders?: ZeebeTaskHeaders
	properties?: ZeebeProperties
	adHoc?: ZeebeAdHoc
	/** AI agent marker (zeebe:agentDefinition). */
	agentDefinition?: ZeebeAgentDefinition
	/** Camunda Form linked to a user task (zeebe:formDefinition). */
	formDefinition?: ZeebeFormDefinition
	/** DMN decision invoked by a business rule task (zeebe:calledDecision). */
	calledDecision?: ZeebeCalledDecision
	/** Process invoked by a call activity (zeebe:calledElement). */
	calledElement?: ZeebeCalledElement
	/** Marks this as a Camunda 8 native user task (zeebe:userTask). */
	userTask?: true
	/** User task assignee/candidates (zeebe:assignmentDefinition). */
	assignmentDefinition?: ZeebeAssignmentDefinition
	/** User task due/follow-up dates (zeebe:taskSchedule). */
	taskSchedule?: ZeebeTaskSchedule
	/** User task priority (zeebe:priorityDefinition). */
	priorityDefinition?: ZeebePriorityDefinition
	/** Message correlation key for a message catch/boundary/receive element (zeebe:subscription). */
	subscription?: ZeebeSubscription
	/** Execution listeners (zeebe:executionListeners). */
	executionListeners?: ZeebeListener[]
	/** User task listeners (zeebe:taskListeners). */
	taskListeners?: ZeebeListener[]
	/** Unrecognized extension elements preserved for roundtrip. */
	unknownElements?: XmlElement[]
}

function listenersToXml(
	container: string,
	child: string,
	listeners: readonly ZeebeListener[],
): XmlElement {
	return {
		name: `zeebe:${container}`,
		attributes: {},
		children: listeners.map((l) => ({
			name: `zeebe:${child}`,
			attributes: {
				eventType: l.eventType,
				type: l.type,
				...(l.retries !== undefined ? { retries: l.retries } : {}),
			},
			children: l.headers?.length
				? [
						{
							name: "zeebe:taskHeaders",
							attributes: {},
							children: l.headers.map((h) => ({
								name: "zeebe:header",
								attributes: { key: h.key, value: h.value },
								children: [],
							})),
						},
					]
				: [],
		})),
	}
}

/** Convert Zeebe extensions to XmlElement array for the BPMN model. */
export function zeebeExtensionsToXmlElements(extensions: ZeebeExtensions): XmlElement[] {
	const elements: XmlElement[] = []

	if (extensions.taskDefinition) {
		const attrs: Record<string, string> = {
			type: extensions.taskDefinition.type,
		}
		if (extensions.taskDefinition.retries !== undefined) {
			attrs.retries = extensions.taskDefinition.retries
		}
		elements.push({
			name: "zeebe:taskDefinition",
			attributes: attrs,
			children: [],
		})
	}

	if (extensions.ioMapping) {
		const children: XmlElement[] = []
		for (const input of extensions.ioMapping.inputs) {
			children.push({
				name: "zeebe:input",
				attributes: { source: input.source, target: input.target },
				children: [],
			})
		}
		for (const output of extensions.ioMapping.outputs) {
			children.push({
				name: "zeebe:output",
				attributes: { source: output.source, target: output.target },
				children: [],
			})
		}
		elements.push({
			name: "zeebe:ioMapping",
			attributes: {},
			children,
		})
	}

	if (extensions.taskHeaders) {
		const children: XmlElement[] = extensions.taskHeaders.headers.map((header) => ({
			name: "zeebe:header",
			attributes: { key: header.key, value: header.value },
			children: [],
		}))
		elements.push({
			name: "zeebe:taskHeaders",
			attributes: {},
			children,
		})
	}

	if (extensions.properties) {
		const children: XmlElement[] = extensions.properties.properties.map((prop) => ({
			name: "zeebe:property",
			attributes: { name: prop.name, value: prop.value },
			children: [],
		}))
		elements.push({
			name: "zeebe:properties",
			attributes: {},
			children,
		})
	}

	if (extensions.adHoc) {
		const attrs: Record<string, string> = {}
		const { outputCollection, outputElement, activeElementsCollection } = extensions.adHoc
		if (outputCollection) attrs.outputCollection = outputCollection
		if (outputElement) attrs.outputElement = outputElement
		if (activeElementsCollection) attrs.activeElementsCollection = activeElementsCollection
		elements.push({ name: "zeebe:adHoc", attributes: attrs, children: [] })
	}

	if (extensions.agentDefinition) {
		elements.push({
			name: "zeebe:agentDefinition",
			attributes: { agentType: extensions.agentDefinition.agentType },
			children: [],
		})
	}

	if (extensions.userTask) {
		elements.push({ name: "zeebe:userTask", attributes: {}, children: [] })
	}

	if (extensions.formDefinition) {
		elements.push({
			name: "zeebe:formDefinition",
			attributes: { ...extensions.formDefinition },
			children: [],
		})
	}

	if (extensions.calledDecision) {
		elements.push({
			name: "zeebe:calledDecision",
			attributes: {
				decisionId: extensions.calledDecision.decisionId,
				resultVariable: extensions.calledDecision.resultVariable,
			},
			children: [],
		})
	}

	if (extensions.calledElement) {
		const { processId, propagateAllChildVariables, propagateAllParentVariables } =
			extensions.calledElement
		const { bindingType, versionTag } = extensions.calledElement
		const attrs: Record<string, string> = { processId }
		if (propagateAllChildVariables !== undefined) {
			attrs.propagateAllChildVariables = String(propagateAllChildVariables)
		}
		if (propagateAllParentVariables !== undefined) {
			attrs.propagateAllParentVariables = String(propagateAllParentVariables)
		}
		if (bindingType !== undefined) attrs.bindingType = bindingType
		if (versionTag !== undefined) attrs.versionTag = versionTag
		elements.push({ name: "zeebe:calledElement", attributes: attrs, children: [] })
	}

	if (extensions.assignmentDefinition) {
		const attrs: Record<string, string> = {}
		const { assignee, candidateGroups, candidateUsers } = extensions.assignmentDefinition
		if (assignee) attrs.assignee = assignee
		if (candidateGroups) attrs.candidateGroups = candidateGroups
		if (candidateUsers) attrs.candidateUsers = candidateUsers
		if (Object.keys(attrs).length > 0) {
			elements.push({ name: "zeebe:assignmentDefinition", attributes: attrs, children: [] })
		}
	}

	if (extensions.taskSchedule) {
		const attrs: Record<string, string> = {}
		if (extensions.taskSchedule.dueDate) attrs.dueDate = extensions.taskSchedule.dueDate
		if (extensions.taskSchedule.followUpDate) {
			attrs.followUpDate = extensions.taskSchedule.followUpDate
		}
		if (Object.keys(attrs).length > 0) {
			elements.push({ name: "zeebe:taskSchedule", attributes: attrs, children: [] })
		}
	}

	if (extensions.priorityDefinition) {
		elements.push({
			name: "zeebe:priorityDefinition",
			attributes: { priority: extensions.priorityDefinition.priority },
			children: [],
		})
	}

	if (extensions.subscription) {
		elements.push({
			name: "zeebe:subscription",
			attributes: { correlationKey: extensions.subscription.correlationKey },
			children: [],
		})
	}

	if (extensions.executionListeners?.length) {
		elements.push(
			listenersToXml("executionListeners", "executionListener", extensions.executionListeners),
		)
	}

	if (extensions.taskListeners?.length) {
		elements.push(listenersToXml("taskListeners", "taskListener", extensions.taskListeners))
	}

	if (extensions.unknownElements) {
		elements.push(...extensions.unknownElements)
	}

	return elements
}

// ---------------------------------------------------------------------------
// Placement
// ---------------------------------------------------------------------------

/**
 * Reports where a Zeebe extension may go, from the descriptor rather than from
 * our own idea of the rules.
 *
 * `zeebe.json` records a `meta.allowedIn` list per extension type;
 * `scripts/generate-zeebe-placement.ts` resolves those entries — many of which
 * name abstract BPMN types or Zeebe aliases — into the concrete element names in
 * `ZEEBE_PLACEMENT`. Writing `zeebe:calledDecision` onto a service task produces
 * a file Camunda rejects at deploy time; catching it at the write is the point.
 *
 * **An extension the table does not mention is allowed.** The descriptor
 * declares no owner for `zeebe:subscription` or `zeebe:properties`, so we do not
 * know where they may go and must not invent a rule — this check rejects only
 * what the descriptor positively forbids. Vendor extensions outside the `zeebe:`
 * namespace are not this function's business and are likewise allowed.
 *
 * @param ownerElement - The owner's BPMN element name, e.g. `bpmn:serviceTask`.
 * @param extension - The extension element name, e.g. `zeebe:taskDefinition`.
 */
export function isZeebePlacementAllowed(ownerElement: string, extension: string): boolean {
	const owners = ZEEBE_PLACEMENT[extension]
	return owners === undefined || owners.includes(ownerElement)
}

/** Thrown when a Zeebe extension is written somewhere the descriptor forbids. */
export class ZeebePlacementError extends Error {
	constructor(
		readonly ownerElement: string,
		readonly extension: string,
		readonly allowedOn: readonly string[],
	) {
		super(
			`<${extension}> is not allowed on <${ownerElement}>. The Zeebe schema allows it on: ${allowedOn.join(", ")}.`,
		)
		this.name = "ZeebePlacementError"
	}
}

/**
 * Throws {@link ZeebePlacementError} if the placement is one the descriptor
 * forbids. See {@link isZeebePlacementAllowed} for what "forbids" covers.
 */
export function assertZeebePlacement(ownerElement: string, extension: string): void {
	if (isZeebePlacementAllowed(ownerElement, extension)) return
	throw new ZeebePlacementError(ownerElement, extension, ZEEBE_PLACEMENT[extension] ?? [])
}

/**
 * The BPMN element name a flow element is written as.
 *
 * The model's `type` is the element's local name in every case but one:
 * `eventSubProcess` is our name for a `bpmn:subProcess` carrying
 * `triggeredByEvent`, and BPMN has no element of that name.
 */
export function bpmnElementName(flowElement: { type: string }): string {
	const local = flowElement.type === "eventSubProcess" ? "subProcess" : flowElement.type
	return `bpmn:${local}`
}

/**
 * Finds a Zeebe extension element on a flow element, creating it if absent, and
 * refuses a placement the descriptor forbids.
 *
 * Use this rather than pushing onto `extensionElements` directly: the push
 * cannot fail, so an extension on the wrong element becomes a deploy-time error
 * in someone else's terminal instead of a throw here.
 *
 * @throws ZeebePlacementError
 */
export function ensureZeebeExtension(
	owner: { type: string; extensionElements: XmlElement[] },
	extension: string,
): XmlElement {
	assertZeebePlacement(bpmnElementName(owner), extension)
	const existing = owner.extensionElements.find((candidate) => candidate.name === extension)
	if (existing) return existing
	const created: XmlElement = { name: extension, attributes: {}, children: [] }
	owner.extensionElements.push(created)
	return created
}

/**
 * A conditional event definition with a FEEL `condition` and, when `variableEvents`
 * is given, a `zeebe:conditionalFilter` limiting which variable changes re-evaluate it.
 */
export function makeConditionalDefinition(
	condition: string,
	variableEvents?: readonly ("create" | "update")[],
): BpmnConditionalEventDefinition {
	return {
		type: "conditional",
		condition,
		conditionAttributes: { "xsi:type": "bpmn:tFormalExpression" },
		...(variableEvents && variableEvents.length > 0
			? {
					extensionElements: [
						{
							name: "zeebe:conditionalFilter",
							attributes: { variableEvents: variableEvents.join(",") },
							children: [],
						},
					],
				}
			: {}),
	}
}
