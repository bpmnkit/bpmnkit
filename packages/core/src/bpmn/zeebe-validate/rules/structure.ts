import type { XmlElement } from "../../../types/xml-element.js"
import type {
	BpmnEventDefinition,
	BpmnFlowElement,
	BpmnLaneSet,
	BpmnProcess,
	BpmnStartEvent,
} from "../../bpmn-model.js"
import type { Scope, ZeebeCheck, ZeebeContext } from "../context.js"

/**
 * Checks for zeebe-rules.md sections A-C (the model part): ids, executable
 * processes, configured lengths, the supported element and event definition
 * matrix, and the per-scope start event and duplicate trigger rules of
 * `ModelUtil`. Zeebe's `ModelWalker` skips non-executable processes entirely,
 * so every process-level check here looks at executable processes only.
 */

type Kind = BpmnEventDefinition["type"]

function eventDefinitions(node: BpmnFlowElement): BpmnEventDefinition[] {
	switch (node.type) {
		case "startEvent":
		case "endEvent":
		case "intermediateCatchEvent":
		case "intermediateThrowEvent":
		case "boundaryEvent":
			return node.eventDefinitions
		default:
			return []
	}
}

function isEventSubProcess(node: BpmnFlowElement): boolean {
	return (
		node.type === "eventSubProcess" ||
		(node.type === "subProcess" && node.triggeredByEvent === true)
	)
}

function isActivity(node: BpmnFlowElement): boolean {
	switch (node.type) {
		case "task":
		case "serviceTask":
		case "userTask":
		case "scriptTask":
		case "sendTask":
		case "receiveTask":
		case "businessRuleTask":
		case "manualTask":
		case "callActivity":
		case "subProcess":
		case "adHocSubProcess":
		case "eventSubProcess":
		case "transaction":
			return true
		default:
			return false
	}
}

function children(node: BpmnFlowElement): BpmnFlowElement[] {
	return "flowElements" in node && Array.isArray(node.flowElements) ? node.flowElements : []
}

function startEvents(elements: readonly BpmnFlowElement[]): BpmnStartEvent[] {
	return elements.filter((e): e is BpmnStartEvent => e.type === "startEvent")
}

function executable(ctx: ZeebeContext): Set<string> {
	return new Set(ctx.defs.processes.filter((p) => p.isExecutable === true).map((p) => p.id))
}

function scopes(ctx: ZeebeContext): Scope[] {
	const ids = executable(ctx)
	return ctx.scopes.filter((s) => ids.has(s.processId))
}

function executableProcesses(ctx: ZeebeContext): BpmnProcess[] {
	return ctx.defs.processes.filter((p) => p.isExecutable === true)
}

function nodes(ctx: ZeebeContext): { node: BpmnFlowElement; scope: Scope }[] {
	const ids = executable(ctx)
	return ctx.nodes.filter((n) => ids.has(n.scope.processId))
}

function* descendants(el: XmlElement): Generator<XmlElement> {
	yield el
	for (const child of el.children) yield* descendants(child)
}

function localName(name: string): string {
	return name.slice(name.indexOf(":") + 1)
}

const MODEL = "http://www.omg.org/spec/BPMN/20100524/MODEL"

/** Whether a verbatim element name is in the BPMN model namespace. */
function isBpmn(ctx: ZeebeContext, name: string): boolean {
	const colon = name.indexOf(":")
	const prefix = colon < 0 ? "" : name.slice(0, colon)
	return (ctx.defs.namespaces[prefix] ?? (prefix === "bpmn" ? MODEL : undefined)) === MODEL
}

/** BPMN elements BPMN Kit keeps verbatim whose `name` Zeebe's NameLengthValidator checks. */
const NAMED = new Set([
	"dataInput",
	"dataOutput",
	"dataState",
	"dataStore",
	"inputSet",
	"outputSet",
	"interface",
	"operation",
	"resource",
	"resourceParameter",
	"resourceRole",
	"performer",
	"humanPerformer",
	"potentialOwner",
	"correlationKey",
	"correlationProperty",
	"property",
	"lane",
	"laneSet",
	"category",
])

// ---------------------------------------------------------------------------
// A. ids, executable processes, lengths
// ---------------------------------------------------------------------------

const ID_MESSAGE = "Element id must be present and not empty."
const ID_SUGGESTION = "Give the element a non-empty id."

/**
 * Empty ids on modelled elements (only reachable for models built in memory:
 * XML with an empty id already fails the XSD) and `zeebe:userTaskForm` without
 * an id, which the XSD does not see.
 */
const idPresent: ZeebeCheck = (ctx) => {
	for (const process of executableProcesses(ctx)) {
		if (process.id === "") ctx.report("id-present", "", ID_MESSAGE, ID_SUGGESTION)
		for (const form of ctx.zeebe(process, "userTaskForm"))
			if ((form.attributes.id ?? "") === "")
				ctx.report("id-present", process.id, ID_MESSAGE, ID_SUGGESTION)
	}
	for (const { node, scope } of nodes(ctx))
		if (node.id === "") ctx.report("id-present", scope.id, ID_MESSAGE, ID_SUGGESTION)
	const ids = executable(ctx)
	for (const { flow, scope } of ctx.flows)
		if (flow.id === "" && ids.has(scope.processId))
			ctx.report("id-present", scope.id, ID_MESSAGE, ID_SUGGESTION)
	for (const el of [...ctx.defs.messages, ...ctx.defs.signals, ...ctx.defs.escalations])
		if (el.id === "") ctx.report("id-present", "", ID_MESSAGE, ID_SUGGESTION)
}

const executableProcess: ZeebeCheck = (ctx) => {
	if (executableProcesses(ctx).length === 0)
		ctx.report(
			"executable-process",
			ctx.defs.id,
			"Must contain at least one executable process",
			'Mark the process isExecutable="true".',
		)
}

/**
 * Every id and name Zeebe checks the configured length of, with the element a
 * finding names: the flow node, flow, process or root element, or the one that
 * owns a nested element (event definition, loop, property, ...).
 */
function lengthTargets(ctx: ZeebeContext): { owner: string; id?: string; name?: string }[] {
	const out: { owner: string; id?: string; name?: string }[] = []
	// zeebe:property names in extension elements; ids and names of the BPMN elements BPMN Kit keeps verbatim.
	const xml = (owner: string, trees: readonly XmlElement[], verbatim: boolean) => {
		for (const tree of trees)
			for (const el of descendants(tree)) {
				if (ctx.isZeebe(el.name, "property")) out.push({ owner, name: el.attributes.name })
				else if (verbatim && isBpmn(ctx, el.name))
					out.push({
						owner,
						id: el.attributes.id,
						name: NAMED.has(localName(el.name)) ? el.attributes.name : undefined,
					})
			}
	}
	const laneSet = (owner: string, set: BpmnLaneSet | undefined) => {
		if (set === undefined) return
		out.push({ owner, id: set.id, name: set.name })
		for (const lane of set.lanes) {
			out.push({ owner: lane.id, id: lane.id, name: lane.name })
			laneSet(lane.id, lane.childLaneSet)
		}
	}
	const ids = executable(ctx)
	for (const process of ctx.defs.processes) {
		if (!ids.has(process.id)) continue
		out.push({ owner: process.id, id: process.id, name: process.name })
		laneSet(process.id, process.laneSet)
		xml(process.id, process.extensionElements, false)
		xml(process.id, process.unknownChildren ?? [], true)
	}
	for (const scope of scopes(ctx)) {
		const container = scope.container as
			| {
					textAnnotations?: { id: string }[]
					associations?: { id: string }[]
					groups?: { id: string }[]
			  }
			| undefined
		const process = ctx.defs.processes.find((p) => p.id === scope.id)
		const artifacts = container ?? process
		for (const a of [
			...(artifacts?.textAnnotations ?? []),
			...(artifacts?.associations ?? []),
			...(artifacts?.groups ?? []),
		])
			out.push({ owner: a.id, id: a.id })
	}
	for (const { node } of nodes(ctx)) {
		out.push({ owner: node.id, id: node.id, name: node.name })
		for (const def of eventDefinitions(node)) {
			out.push({ owner: node.id, id: def.id })
			if (def.type === "link") out.push({ owner: node.id, name: def.name })
		}
		const loop = (node as { loopCharacteristics?: { id?: string } }).loopCharacteristics
		if (loop !== undefined) out.push({ owner: node.id, id: loop.id })
		for (const p of node.properties ?? []) out.push({ owner: node.id, id: p.id, name: p.name })
		for (const a of [...(node.dataInputAssociations ?? []), ...(node.dataOutputAssociations ?? [])])
			out.push({ owner: node.id, id: a.id })
		xml(node.id, node.extensionElements, false)
		xml(node.id, node.unknownChildren ?? [], true)
	}
	for (const { flow, scope } of ctx.flows) {
		if (!ids.has(scope.processId)) continue
		out.push({ owner: flow.id, id: flow.id, name: flow.name })
		if (flow.conditionExpression !== undefined)
			out.push({ owner: flow.id, id: flow.conditionExpression.attributes.id })
		xml(flow.id, flow.extensionElements, false)
	}
	for (const el of [
		...ctx.defs.messages,
		...ctx.defs.errors,
		...ctx.defs.signals,
		...ctx.defs.escalations,
	]) {
		out.push({ owner: el.id, id: el.id, name: el.name })
		xml(el.id, el.extensionElements ?? [], false)
	}
	for (const c of ctx.defs.collaborations) {
		out.push({ owner: c.id, id: c.id, name: c.name })
		for (const p of c.participants) out.push({ owner: p.id, id: p.id, name: p.name })
		for (const f of c.messageFlows) out.push({ owner: f.id, id: f.id, name: f.name })
		for (const a of [...c.textAnnotations, ...c.associations, ...c.groups])
			out.push({ owner: a.id, id: a.id })
	}
	for (const root of ctx.defs.unknownChildren ?? [])
		xml(root.attributes.id ?? ctx.defs.id, [root], true)
	for (const cat of ctx.defs.categories ?? []) {
		out.push({ owner: cat.id ?? "", id: cat.id, name: cat.name })
		for (const v of cat.categoryValues) out.push({ owner: v.id, id: v.id })
	}
	out.push({ owner: ctx.defs.id, name: ctx.defs.unknownAttributes.name })
	return out
}

const lengths: ZeebeCheck = (ctx) => {
	const { maxIdLength, maxNameLength, maxWorkerTypeLength } = ctx.limits
	for (const t of lengthTargets(ctx)) {
		if (t.id !== undefined && t.id.length > maxIdLength)
			ctx.report(
				"id-length",
				t.owner,
				`IDs must not be longer than the configured max-id-length of ${maxIdLength} characters.`,
				`Shorten the id to at most ${maxIdLength} characters.`,
			)
		if (t.name !== undefined && t.name.length > maxNameLength)
			ctx.report(
				"name-length",
				t.owner,
				`Names must not be longer than the configured max-name-length of ${maxNameLength} characters.`,
				`Shorten the name to at most ${maxNameLength} characters.`,
			)
	}
	for (const { node } of nodes(ctx))
		for (const td of ctx.zeebe(node, "taskDefinition")) {
			const type = td.attributes.type
			if (type !== undefined && type.length > maxWorkerTypeLength)
				ctx.report(
					"worker-type-length",
					node.id,
					`Worker types must not be longer than the configured max-worker-type-length of ${maxWorkerTypeLength} characters.`,
					`Shorten the job type to at most ${maxWorkerTypeLength} characters.`,
				)
		}
}

// ---------------------------------------------------------------------------
// B. supported elements and event definitions
// ---------------------------------------------------------------------------

/** Flow elements Zeebe rejects, by BPMN Kit type or verbatim XML name, with Zeebe's class name. */
const UNSUPPORTED: ReadonlyMap<string, string> = new Map([
	["complexGateway", "ComplexGateway"],
	["transaction", "Transaction"],
	["implicitThrowEvent", "ImplicitThrowEvent"],
	["callChoreography", "CallChoreography"],
	["choreographyTask", "ChoreographyTask"],
	["subChoreography", "SubChoreography"],
])

function unsupportedMessage(type: string): string {
	return `Elements of type '${type}' are currently not supported. Please refer to the documentation for a list of supported elements: https://docs.camunda.io/docs/components/modeler/bpmn/bpmn-coverage/`
}

const elementType: ZeebeCheck = (ctx) => {
	for (const { node } of nodes(ctx)) {
		const type = UNSUPPORTED.get(node.type)
		if (type !== undefined)
			ctx.report(
				"element-type",
				node.id,
				unsupportedMessage(type),
				"Use an element Zeebe supports.",
			)
	}
	// Flow elements BPMN Kit does not model stay verbatim in the container's unknown children.
	for (const scope of scopes(ctx)) {
		const owner = scope.container ?? ctx.defs.processes.find((p) => p.id === scope.id)
		for (const el of owner?.unknownChildren ?? []) {
			const type = UNSUPPORTED.get(localName(el.name))
			if (type !== undefined && (el.name.startsWith("bpmn:") || !el.name.includes(":")))
				ctx.report(
					"element-type",
					el.attributes.id ?? scope.id,
					unsupportedMessage(type),
					"Use an element Zeebe supports.",
				)
		}
	}
}

const SUPPORTED_DEFINITIONS: readonly Kind[] = [
	"message",
	"timer",
	"error",
	"terminate",
	"signal",
	"link",
	"escalation",
	"compensate",
	"conditional",
]

const eventDefinitionType: ZeebeCheck = (ctx) => {
	for (const { node } of nodes(ctx))
		for (const def of eventDefinitions(node))
			if (!SUPPORTED_DEFINITIONS.includes(def.type))
				ctx.report(
					"event-definition-type",
					node.id,
					"Event definition of this type is not supported",
					"Use an event definition Zeebe supports.",
				)
}

const ESP_START_TYPES: readonly Kind[] = [
	"timer",
	"message",
	"error",
	"signal",
	"escalation",
	"conditional",
]
const NON_INTERRUPTING_TYPES: readonly Kind[] = [
	"message",
	"timer",
	"signal",
	"escalation",
	"conditional",
]
const NON_INTERRUPTING = "Non-Interrupting event of this type is not allowed"

/** Zeebe validates the first start event of an event sub-process (`SubProcessValidator`). */
const eventSubProcessStart: ZeebeCheck = (ctx) => {
	for (const { node } of nodes(ctx)) {
		if (!isEventSubProcess(node)) continue
		const [start] = startEvents(children(node))
		if (start === undefined) continue
		for (const def of start.eventDefinitions) {
			if (!ESP_START_TYPES.includes(def.type))
				ctx.report(
					"event-sub-process-start-type",
					node.id,
					"Start events in event subprocesses must be one of: message, timer, error, signal, escalation or conditional",
					"Give the event sub-process start event a message, timer, error, signal, escalation or conditional definition.",
				)
			if (start.isInterrupting === false && !NON_INTERRUPTING_TYPES.includes(def.type))
				ctx.report(
					"non-interrupting-type",
					node.id,
					NON_INTERRUPTING,
					"Make the start event interrupting, or use a message, timer, signal, escalation or conditional trigger.",
				)
		}
	}
}

const ICE_TYPES: readonly Kind[] = ["message", "timer", "signal", "link", "conditional"]
const BOUNDARY_TYPES: readonly Kind[] = [
	"timer",
	"message",
	"error",
	"signal",
	"escalation",
	"compensate",
	"conditional",
]
const END_TYPES: readonly Kind[] = [
	"error",
	"message",
	"terminate",
	"signal",
	"escalation",
	"compensate",
]

const eventTypes: ZeebeCheck = (ctx) => {
	for (const { node } of nodes(ctx)) {
		if (node.type === "intermediateCatchEvent") {
			const [only] = node.eventDefinitions
			if (
				node.eventDefinitions.length === 1 &&
				only !== undefined &&
				!ICE_TYPES.includes(only.type)
			)
				ctx.report(
					"intermediate-catch-type",
					node.id,
					"Event definition must be one of: message, timer, signal, link or conditional",
					"Use a message, timer, signal, link or conditional catch event.",
				)
		} else if (node.type === "boundaryEvent") {
			for (const def of node.eventDefinitions)
				if (!BOUNDARY_TYPES.includes(def.type))
					ctx.report(
						"boundary-type",
						node.id,
						"Boundary events must be one of: timer, message, error, signal, escalation, conditional",
						"Use a timer, message, error, signal, escalation, compensation or conditional boundary event.",
					)
		} else if (node.type === "endEvent") {
			for (const def of node.eventDefinitions)
				if (!END_TYPES.includes(def.type))
					ctx.report(
						"end-event-type",
						node.id,
						"End events must be one of: none, error, message, terminate, signal, escalation or compensation",
						"Use a none, error, message, terminate, signal, escalation or compensation end event.",
					)
		}
	}
}

const boundaryEvents: ZeebeCheck = (ctx) => {
	for (const { node } of nodes(ctx)) {
		if (node.type !== "boundaryEvent") continue
		const interrupting = node.cancelActivity !== false
		for (const def of node.eventDefinitions) {
			if (def.type === "escalation") {
				const host = ctx.node(node.attachedToRef)?.node.type
				const supported =
					host === "subProcess" ||
					host === "eventSubProcess" ||
					host === "adHocSubProcess" ||
					host === "transaction" ||
					host === "callActivity"
				if (!supported)
					ctx.report(
						"escalation-boundary-host",
						node.id,
						"An escalation boundary event should only be attached to a subprocess, or a call activity.",
						"Attach the escalation boundary event to a sub-process or a call activity.",
					)
			}
			if (!interrupting && !NON_INTERRUPTING_TYPES.includes(def.type))
				ctx.report(
					"non-interrupting-type",
					node.id,
					NON_INTERRUPTING,
					"Make the boundary event interrupting, or use a message, timer, signal, escalation or conditional trigger.",
				)
		}
	}
}

// ---------------------------------------------------------------------------
// C. start events and duplicate triggers per scope (ModelUtil)
// ---------------------------------------------------------------------------

/** Each value that occurs more than once, in first-occurrence order. */
function duplicates(values: readonly string[]): string[] {
	const out: string[] = []
	values.forEach((v, i) => {
		if (values.indexOf(v) !== i && !out.includes(v)) out.push(v)
	})
	return out
}

const processStartEvents: ZeebeCheck = (ctx) => {
	for (const process of executableProcesses(ctx)) {
		const starts = startEvents(process.flowElements)
		if (starts.length === 0)
			ctx.report(
				"process-start-event",
				process.id,
				"Must have at least one start event",
				"Add a start event to the process.",
			)
		else if (starts.filter((s) => s.eventDefinitions.length === 0).length > 1)
			ctx.report(
				"multiple-none-start",
				process.id,
				"Multiple none start events are not allowed",
				"Keep one none start event and give the others a trigger.",
			)
	}
}

interface Duplicates {
	/** The rule message, signal and link name duplicates are reported under. */
	names:
		| "duplicate-event-sub-process-trigger"
		| "duplicate-boundary-trigger"
		| "duplicate-message-start"
		| "duplicate-signal-start"
	owner: string
	definitions: readonly BpmnEventDefinition[]
}

function messageNames(ctx: ZeebeContext, defs: readonly BpmnEventDefinition[]): string[] {
	const out: string[] = []
	for (const d of defs) {
		if (d.type !== "message") continue
		const name = ctx.message(d.messageRef)?.name
		if (name !== undefined && name !== "") out.push(name)
	}
	return out
}

function signalNames(ctx: ZeebeContext, defs: readonly BpmnEventDefinition[]): string[] {
	const out: string[] = []
	for (const d of defs) {
		if (d.type !== "signal") continue
		const name = ctx.signal(d.signalRef)?.name
		if (name !== undefined && name !== "") out.push(name)
	}
	return out
}

function linkNames(defs: readonly BpmnEventDefinition[]): string[] {
	const out: string[] = []
	for (const d of defs)
		if (d.type === "link" && d.name !== undefined && d.name !== "") out.push(d.name)
	return out
}

/** `ModelUtil.verifyNoDuplicatedEventDefinition`: message, signal and link names. */
function verifyNames(ctx: ZeebeContext, { names, owner, definitions }: Duplicates): void {
	for (const name of duplicates(messageNames(ctx, definitions)))
		ctx.report(
			names,
			owner,
			`Multiple message event definitions with the same name '${name}' are not allowed.`,
			"Use a different message for each of these events.",
		)
	for (const name of duplicates(signalNames(ctx, definitions)))
		ctx.report(
			names,
			owner,
			`Multiple signal event definitions with the same name '${name}' are not allowed.`,
			"Use a different signal for each of these events.",
		)
	for (const name of duplicates(linkNames(definitions)))
		ctx.report(
			names,
			owner,
			`Multiple intermediate catch link event definitions with the same name '${name}' are not allowed.`,
			"Give each link catch event a unique name.",
		)
}

/** `ModelUtil.verifyNoDuplicatedErrorHandler` and its escalation twin. */
function verifyHandlers(
	ctx: ZeebeContext,
	owner: string,
	defs: readonly BpmnEventDefinition[],
): void {
	const handlers = (
		kind: "error" | "escalation",
		resolve: (d: BpmnEventDefinition) => { code: string | undefined } | undefined,
	) => {
		const refs = defs.filter((d) => d.type === kind).map(resolve)
		if (refs.length === 0) return
		const word = kind === "error" ? "error" : "escalation"
		const catchAll =
			kind === "error"
				? "The same scope can not contain more than one error catch event without error code. An error catch event without error code catches all errors."
				: "The same scope can not contain more than one escalation catch event without escalation code. An escalation catch event without escalation code catches all escalations."
		const rule = kind === "error" ? "duplicate-error-catch" : "duplicate-escalation-catch"
		const suggestion = `Give each ${word} catch event of the scope a different ${word} code.`
		if (refs.filter((r) => r === undefined).length > 1)
			ctx.report(rule, owner, catchAll, suggestion)
		const codes = refs.filter((r) => r !== undefined).map((r) => r?.code)
		const seen: (string | undefined)[] = []
		for (const code of codes) {
			if (seen.includes(code)) continue
			seen.push(code)
			if (codes.filter((c) => c === code).length < 2) continue
			ctx.report(
				rule,
				owner,
				code === undefined
					? catchAll
					: `Multiple ${word} catch events with the same ${word} code '${code}' are not supported on the same scope.`,
				suggestion,
			)
		}
	}
	handlers("error", (d) => {
		const error = d.type === "error" ? ctx.error(d.errorRef) : undefined
		return error === undefined ? undefined : { code: error.errorCode }
	})
	handlers("escalation", (d) => {
		const escalation = d.type === "escalation" ? ctx.escalation(d.escalationRef) : undefined
		return escalation === undefined ? undefined : { code: escalation.escalationCode }
	})
}

/**
 * The scope rule ProcessValidator and SubProcessValidator apply to the process
 * and to every sub-process (embedded, event, ad-hoc, transaction): duplicate
 * triggers among the start events of the scope's direct event sub-processes.
 * Their duplicate link catch names are `duplicate-link-catch` (references.ts).
 */
const scopeDuplicates: ZeebeCheck = (ctx) => {
	for (const scope of scopes(ctx)) {
		const espStarts = scope.flowElements
			.filter(isEventSubProcess)
			.flatMap((esp) => startEvents(children(esp)))
			.flatMap((s) => s.eventDefinitions)
		verifyNames(ctx, {
			names: "duplicate-event-sub-process-trigger",
			owner: scope.id,
			definitions: espStarts,
		})
		verifyHandlers(ctx, scope.id, espStarts)
	}
}

const processStartDuplicates: ZeebeCheck = (ctx) => {
	for (const process of executableProcesses(ctx)) {
		const defs = startEvents(process.flowElements).flatMap((s) => s.eventDefinitions)
		verifyNames(ctx, {
			names: "duplicate-signal-start",
			owner: process.id,
			definitions: defs.filter((d) => d.type === "signal"),
		})
		// Start events referring to the same message count once here; MessageValidator reports those.
		const referred: (string | undefined)[] = []
		const messages = defs.filter((d) => {
			if (d.type !== "message") return false
			const message = ctx.message(d.messageRef)?.id
			if (referred.includes(message)) return false
			referred.push(message)
			return true
		})
		verifyNames(ctx, { names: "duplicate-message-start", owner: process.id, definitions: messages })
	}
}

function conditions(starts: readonly BpmnStartEvent[]): string[] {
	const out: string[] = []
	for (const s of starts)
		for (const d of s.eventDefinitions)
			if (d.type === "conditional" && d.condition !== undefined) out.push(d.condition)
	return out
}

const conditionalStarts: ZeebeCheck = (ctx) => {
	for (const process of executableProcesses(ctx)) {
		for (const text of duplicates(conditions(startEvents(process.flowElements))))
			ctx.report(
				"duplicate-conditional-start",
				process.id,
				`Duplicate condition expression '${text}' found in conditional start events of process '${process.id}'. Condition expressions for conditional start events must be unique within a process.`,
				"Give each conditional start event a different condition.",
			)
		const espStarts = process.flowElements
			.filter(isEventSubProcess)
			.flatMap((esp) => startEvents(children(esp)))
		for (const text of duplicates(conditions(espStarts)))
			ctx.report(
				"duplicate-event-sub-process-condition",
				process.id,
				`Duplicate condition expression '${text}' found in conditional start events of event subprocesses in process '${process.id}'. Condition expressions for conditional start events in event subprocesses must be unique within a process.`,
				"Give each conditional event sub-process start a different condition.",
			)
	}
}

/** ActivityValidator: the boundary events attached to each activity from the same scope. */
const boundaryDuplicates: ZeebeCheck = (ctx) => {
	for (const { node, scope } of nodes(ctx)) {
		if (!isActivity(node)) continue
		const defs = scope.flowElements
			.filter((e) => e.type === "boundaryEvent" && e.attachedToRef === node.id)
			.flatMap(eventDefinitions)
		verifyNames(ctx, { names: "duplicate-boundary-trigger", owner: node.id, definitions: defs })
		verifyHandlers(ctx, node.id, defs)
	}
}

const PROCESS_SINGLE_EXTENSIONS = ["versionTag", "jobPriorityDefinition", "case"] as const

const processExtensions: ZeebeCheck = (ctx) => {
	for (const process of executableProcesses(ctx))
		for (const local of PROCESS_SINGLE_EXTENSIONS) {
			// zeebe:jobPriorityDefinition and zeebe:case exist from 8.10, the version of the case marker rule.
			if (local !== "versionTag" && !ctx.applies("case-marker")) continue
			if (ctx.zeebe(process, local).length > 1)
				ctx.report(
					"duplicate-process-extension",
					process.id,
					`Must have exactly one 'zeebe:${local}' extension element when exists. Please check process definition XML and retain only one extension element.`,
					`Keep a single zeebe:${local} on the process.`,
				)
		}
}

const caseMarker: ZeebeCheck = (ctx) => {
	for (const process of executableProcesses(ctx))
		for (const c of ctx.zeebe(process, "case")) {
			const title = c.attributes.title
			if (title === undefined || title.trim() === "")
				ctx.report(
					"case-marker",
					process.id,
					"Attribute 'title' must be present and not empty",
					"Set the case title to a variable name.",
				)
			else if (title.startsWith("="))
				ctx.report(
					"case-marker",
					process.id,
					"Attribute 'title' must be a variable name, not an expression",
					"Set the case title to a variable name without '='.",
				)
		}
	const misplaced = (owner: string, type: string, el: { extensionElements?: XmlElement[] }) => {
		if (ctx.zeebe(el, "case").length > 0)
			ctx.report(
				"case-marker",
				owner,
				`The case marker 'zeebe:case' is only allowed on a process, but was found on '${type}'`,
				"Move zeebe:case to the process.",
			)
	}
	for (const { node } of nodes(ctx))
		misplaced(node.id, node.type === "eventSubProcess" ? "subProcess" : node.type, node)
	const ids = executable(ctx)
	for (const { flow, scope } of ctx.flows)
		if (ids.has(scope.processId)) misplaced(flow.id, "sequenceFlow", flow)
	for (const m of ctx.defs.messages) misplaced(m.id, "message", m)
	for (const e of ctx.defs.errors) misplaced(e.id, "error", e)
	for (const s of ctx.defs.signals) misplaced(s.id, "signal", s)
	for (const e of ctx.defs.escalations) misplaced(e.id, "escalation", e)
}

/** Checks for zeebe-rules.md sections A-C (see index.ts), in spec order. */
/**
 * Z26, from the message's side (MessageValidator): one message may start at most
 * one top-level start event across every process of the file, executable or not.
 */
const sharedStartMessage: ZeebeCheck = (ctx) => {
	for (const message of ctx.defs.messages) {
		let count = 0
		for (const process of ctx.defs.processes)
			for (const el of process.flowElements)
				if (el.type === "startEvent")
					for (const def of el.eventDefinitions)
						if (def.type === "message" && ctx.message(def.messageRef) === message) count += 1
		if (count > 1)
			ctx.report(
				"duplicate-message-start",
				message.id,
				"A message cannot be referred by more than one start event",
				"Give each message start event its own message.",
			)
	}
}

export const checks: ZeebeCheck[] = [
	idPresent,
	executableProcess,
	lengths,
	elementType,
	eventDefinitionType,
	eventSubProcessStart,
	eventTypes,
	boundaryEvents,
	processStartEvents,
	scopeDuplicates,
	processStartDuplicates,
	sharedStartMessage,
	conditionalStarts,
	boundaryDuplicates,
	processExtensions,
	caseMarker,
]
