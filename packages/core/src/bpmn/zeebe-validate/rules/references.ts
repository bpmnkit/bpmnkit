import { type FeelValue, evaluate, parseExpression } from "@bpmnkit/feel"
import type { XmlElement } from "../../../types/xml-element.js"
import type {
	BpmnEventDefinition,
	BpmnFlowElement,
	BpmnMessage,
	BpmnSignal,
} from "../../bpmn-model.js"
import {
	type NodeEntry,
	type Scope,
	type ZeebeCheck,
	type ZeebeContext,
	feelError,
	feelFailure,
	isExpression,
	staticValueMessage,
} from "../context.js"

/**
 * Checks for zeebe-rules.md section E (messages, signals, errors, escalations,
 * links, compensation). Zeebe resolves a `messageRef` / `signalRef` / ... to the
 * root element; a reference that resolves to nothing is the same as no reference.
 */

type DefOf<T extends BpmnEventDefinition["type"]> = Extract<BpmnEventDefinition, { type: T }>

interface DefEntry<T extends BpmnEventDefinition["type"]> {
	entry: NodeEntry
	def: DefOf<T>
}

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

/** Every event definition of the type, in document order, with the node that owns it. */
function defsOf<T extends BpmnEventDefinition["type"]>(
	ctx: ZeebeContext,
	type: T,
	nodeTypes?: readonly BpmnFlowElement["type"][],
): DefEntry<T>[] {
	const out: DefEntry<T>[] = []
	for (const entry of ctx.nodes) {
		if (nodeTypes !== undefined && !nodeTypes.includes(entry.node.type)) continue
		for (const def of eventDefinitions(entry.node)) {
			if (def.type === type) out.push({ entry, def: def as DefOf<T> })
		}
	}
	return out
}

const CATCH = ["intermediateCatchEvent", "boundaryEvent"] as const
const THROW = ["intermediateThrowEvent", "endEvent"] as const

/** Zeebe's `getAttributeValue(...) == null || isEmpty()`. */
function blank(value: string | undefined): boolean {
	return value === undefined || value === ""
}

/** Start events of the process itself, which Zeebe validates as process start events. */
function isProcessStart(entry: NodeEntry): boolean {
	return entry.node.type === "startEvent" && entry.scope.kind === "process"
}

/** Start events of the sub-processes directly in a process (Zeebe's `p.getChildElementsByType(SubProcess)`). */
function isSubProcessStart(entry: NodeEntry): boolean {
	return (
		entry.node.type === "startEvent" &&
		entry.scope.kind !== "process" &&
		entry.scope.parent?.kind === "process"
	)
}

/** Zeebe's `ResultType` name of a FEEL value. */
function resultType(value: FeelValue): string {
	if (value === null) return "NULL"
	if (typeof value === "string") return "STRING"
	if (typeof value === "number") return "NUMBER"
	if (typeof value === "boolean") return "BOOLEAN"
	if (Array.isArray(value)) return "ARRAY"
	switch ((value as { type?: unknown }).type) {
		case "date":
			return "DATE"
		case "time":
			return "TIME"
		case "date-time":
			return "DATE_TIME"
		case "days-time-duration":
			return "DURATION"
		case "years-months-duration":
			return "PERIOD"
		default:
			return "OBJECT"
	}
}

/**
 * What the start event name validators say about a name that has to be known
 * without variables: the evaluated string, or Zeebe's message. Variables are
 * `null` there, so `=x` is a NULL, not a failure.
 */
function constantName(
	name: string,
	what: "message" | "signal",
): { value: string } | { problem: string } {
	if (!isExpression(name)) return { value: name }
	const detail = `Expected constant expression but found '${name}', which could not be evaluated without context: `
	const { ast, errors } = parseExpression(name.slice(1))
	if (ast === null || errors.length > 0) return { problem: `${detail}${feelFailure(name)}` }
	// Signal names are evaluated with a context whose variable lookup is null, which
	// feel-scala turns into a failure; message names get an empty answer, a NULL.
	let touchedVariable = false
	const vars = new Proxy<Record<string, FeelValue>>(
		{},
		{
			getOwnPropertyDescriptor() {
				touchedVariable = true
				return undefined
			},
			get() {
				touchedVariable = true
				return undefined
			},
		},
	)
	let value: FeelValue
	try {
		value = evaluate(ast, { vars })
	} catch (e) {
		return { problem: `${detail}${e instanceof Error ? e.message : String(e)}` }
	}
	if (touchedVariable && what === "signal") {
		return {
			problem: `${detail}failed to evaluate expression '${name.slice(1)}' : java.lang.NullPointerException: Cannot invoke "io.camunda.zeebe.util.Either.fold(java.util.function.Function, java.util.function.Function)" because the return value of "io.camunda.zeebe.el.EvaluationContext.getVariable(String)" is null`,
		}
	}
	if (typeof value === "string") return { value }
	return {
		problem: `Expected constant expression of type String for ${what} name '${name}', but was ${resultType(value)}`,
	}
}

/** The message, or `undefined` when the reference is absent or dangling. */
function messageOf(ctx: ZeebeContext, ref: string | undefined): BpmnMessage | undefined {
	return ctx.message(ref)
}

// ---------------------------------------------------------------------------
// Messages: Z61-Z73
// ---------------------------------------------------------------------------

const MESSAGE_REFERENCE_RULES: ZeebeCheck = (ctx) => {
	// Z61: every message definition that is not on a throw event (start, catch, boundary).
	for (const { entry, def } of defsOf(ctx, "message")) {
		if (THROW.includes(entry.node.type as (typeof THROW)[number])) continue
		if (messageOf(ctx, def.messageRef) === undefined) {
			ctx.report(
				"message-reference",
				entry.node.id,
				"Must reference a message",
				"Reference a message with messageRef on the message event definition.",
			)
		}
	}
	// Z72
	for (const { node } of ctx.nodes) {
		if (node.type === "receiveTask" && messageOf(ctx, node.messageRef) === undefined) {
			ctx.report(
				"receive-task-message",
				node.id,
				"Must reference a message",
				"Set messageRef on the receive task to a message.",
			)
		}
	}
}

/** Where a root message or signal is referenced from, as Zeebe's `MessageValidator` / `SignalValidator` see it. */
interface Usage {
	catches: boolean
	throws: boolean
	subProcessStarts: number
	processStarts: number
}

function messageUsage(ctx: ZeebeContext, message: BpmnMessage): Usage {
	const refs = (type: "message") =>
		defsOf(ctx, type).filter(({ def }) => messageOf(ctx, def.messageRef) === message)
	const all = refs("message")
	const byNode = (types: readonly BpmnFlowElement["type"][]) =>
		all.some(({ entry }) => types.includes(entry.node.type))
	const taskRef = (type: "receiveTask" | "sendTask") =>
		ctx.nodes.some(({ node }) => node.type === type && messageOf(ctx, node.messageRef) === message)
	return {
		catches: byNode(CATCH) || taskRef("receiveTask"),
		throws: byNode(THROW) || taskRef("sendTask"),
		subProcessStarts: all.filter(({ entry }) => isSubProcessStart(entry)).length,
		processStarts: all.filter(({ entry }) => isProcessStart(entry)).length,
	}
}

const MESSAGE_ROOT_RULES: ZeebeCheck = (ctx) => {
	for (const message of ctx.defs.messages) {
		const usage = messageUsage(ctx, message)
		const name = message.name
		const nameMissing = () =>
			ctx.report(
				"message-name",
				message.id,
				"Name must be present and not empty",
				"Give the message a non-empty name.",
			)
		if (usage.catches || usage.subProcessStarts === 1) {
			if (blank(name)) nameMissing()
			// Z63
			if (ctx.zeebe(message, "subscription").length !== 1) {
				ctx.report(
					"message-subscription",
					message.id,
					"Must have exactly one zeebe:subscription extension element",
					"Add one zeebe:subscription with a correlationKey to the message.",
				)
			}
		} else if (usage.throws) {
			if (blank(name)) nameMissing()
		} else if (usage.processStarts === 1) {
			if (blank(name)) nameMissing()
		}
		// Z64 / Z65: every zeebe:subscription, referenced or not.
		for (const sub of ctx.zeebe(message, "subscription")) {
			const key = sub.attributes.correlationKey
			if (key === undefined || key === "") {
				ctx.report(
					"subscription-correlation-key",
					message.id,
					"Attribute 'correlationKey' must be present and not empty",
					"Set correlationKey on zeebe:subscription to a FEEL expression such as '=orderId'.",
				)
				// Zeebe's expression check treats an empty key as missing: one rejection, not two.
				continue
			}
			if (!isExpression(key)) {
				ctx.report(
					"correlation-key-expression",
					message.id,
					staticValueMessage(key),
					"Start the correlationKey with '=' so it is a FEEL expression.",
				)
			} else if (feelError(key) !== undefined) {
				ctx.report(
					"correlation-key-expression",
					message.id,
					feelFailure(key),
					"Fix the FEEL syntax of the correlationKey.",
				)
			}
		}
		// Z66
		if (name !== undefined && feelError(name) !== undefined) {
			ctx.report(
				"message-name-expression",
				message.id,
				feelFailure(name),
				"Fix the FEEL syntax of the message name.",
			)
		}
	}
}

const MESSAGE_START_RULES: ZeebeCheck = (ctx) => {
	for (const { entry, def } of defsOf(ctx, "message", ["startEvent"])) {
		if (!isProcessStart(entry)) continue
		const name = messageOf(ctx, def.messageRef)?.name
		if (name === undefined) continue
		const result = constantName(name, "message")
		if ("problem" in result) {
			// Z67
			ctx.report(
				"message-start-name-constant",
				entry.node.id,
				result.problem,
				"Use a static message name, or a FEEL expression that needs no variables.",
			)
		} else if (result.value.length > ctx.limits.maxNameLength) {
			// Z68
			ctx.report(
				"message-start-name-length",
				entry.node.id,
				`Expected message name '${result.value}' to be at most ${ctx.limits.maxNameLength} characters long (configured max-name-length), but was ${result.value.length} characters.`,
				"Shorten the message name.",
			)
		}
	}
}

/** The `zeebe:publishMessage` elements of a message throw event or send task. */
function publishMessages(
	ctx: ZeebeContext,
	holder: { extensionElements?: XmlElement[] } | undefined,
): XmlElement[] {
	return ctx.zeebe(holder, "publishMessage")
}

const MESSAGE_THROW_RULES: ZeebeCheck = (ctx) => {
	for (const entry of ctx.nodes) {
		const node = entry.node
		if (node.type !== "intermediateThrowEvent" && node.type !== "endEvent") continue
		const def = node.eventDefinitions.find((d) => d.type === "message")
		if (def === undefined || def.type !== "message") continue
		const publish = publishMessages(ctx, def).length
		const task = ctx.zeebe(node, "taskDefinition").length
		const exactlyOne = (publish === 1 && task === 0) || (publish === 0 && task === 1)
		if (!exactlyOne) {
			// Z69
			ctx.report(
				"message-throw-implementation",
				node.id,
				"Must have either one 'zeebe:publishMessage' or one 'zeebe:taskDefinition' extension element",
				"Add a zeebe:publishMessage to the message event definition, or a zeebe:taskDefinition to the event.",
			)
		} else if (task === 0 && messageOf(ctx, def.messageRef) === undefined) {
			// Z70
			ctx.report(
				"message-throw-reference",
				node.id,
				"Must reference a message",
				"Reference a message with messageRef on the message event definition.",
			)
		}
	}
	// Z71: Zeebe checks every zeebe:publishMessage, wherever it sits.
	for (const { node } of ctx.nodes) {
		const holders: ({ extensionElements?: XmlElement[] } | undefined)[] = [node]
		for (const def of eventDefinitions(node)) {
			if (def.type === "message") holders.push(def)
		}
		for (const holder of holders) {
			for (const publish of publishMessages(ctx, holder)) {
				if (blank(publish.attributes.correlationKey)) {
					ctx.report(
						"publish-message-correlation-key",
						node.id,
						"Attribute 'correlationKey' must be present and not empty",
						"Set correlationKey on zeebe:publishMessage to a FEEL expression such as '=orderId'.",
					)
				}
			}
		}
	}
}

const RECEIVE_TASK_RULES: ZeebeCheck = (ctx) => {
	for (const { node } of ctx.nodes) {
		if (node.type !== "receiveTask") continue
		const message = messageOf(ctx, node.messageRef)
		if (message === undefined) continue
		const clash = ctx.boundaries(node.id).some(({ node: boundary }) =>
			eventDefinitions(boundary).some((def) => {
				if (def.type !== "message") return false
				const other = messageOf(ctx, def.messageRef)
				return other?.name !== undefined && other.name !== "" && other.name === message.name
			}),
		)
		if (clash) {
			// Z73
			ctx.report(
				"receive-task-boundary-message",
				node.id,
				"Cannot reference the same message name as a boundary event",
				"Give the receive task and its boundary event messages different names.",
			)
		}
	}
}

// ---------------------------------------------------------------------------
// Signals: Z74-Z76
// ---------------------------------------------------------------------------

function signalUsage(ctx: ZeebeContext, signal: BpmnSignal) {
	const all = defsOf(ctx, "signal").filter(({ def }) => ctx.signal(def.signalRef) === signal)
	const byNode = (types: readonly BpmnFlowElement["type"][]) =>
		all.some(({ entry }) => types.includes(entry.node.type))
	return {
		roles: byNode(CATCH) || byNode(THROW),
		subProcessStarts: all.filter(({ entry }) => isSubProcessStart(entry)).length,
		processStarts: all.filter(({ entry }) => isProcessStart(entry)).length,
	}
}

const SIGNAL_RULES: ZeebeCheck = (ctx) => {
	// Z74
	for (const { entry, def } of defsOf(ctx, "signal")) {
		if (ctx.signal(def.signalRef) === undefined) {
			ctx.report(
				"signal-reference",
				entry.node.id,
				"Must reference a signal",
				"Reference a signal with signalRef on the signal event definition.",
			)
		}
	}
	for (const signal of ctx.defs.signals) {
		const usage = signalUsage(ctx, signal)
		// Z75
		if (
			(usage.roles || usage.subProcessStarts === 1 || usage.processStarts > 0) &&
			blank(signal.name)
		) {
			ctx.report(
				"signal-name",
				signal.id,
				"Name must be present and not empty",
				"Give the signal a non-empty name.",
			)
		}
		// Z76, FEEL part
		if (signal.name !== undefined && feelError(signal.name) !== undefined) {
			ctx.report(
				"signal-name-expression",
				signal.id,
				feelFailure(signal.name),
				"Fix the FEEL syntax of the signal name.",
			)
		}
	}
	// Z76, start events: no variables at deploy time
	for (const { entry, def } of defsOf(ctx, "signal", ["startEvent"])) {
		if (!isProcessStart(entry)) continue
		const name = ctx.signal(def.signalRef)?.name
		if (name === undefined) continue
		const result = constantName(name, "signal")
		if ("problem" in result) {
			ctx.report(
				"signal-name-expression",
				entry.node.id,
				result.problem,
				"Use a static signal name, or a FEEL expression that needs no variables.",
			)
		}
	}
}

// ---------------------------------------------------------------------------
// Errors and escalations: Z77-Z82
// ---------------------------------------------------------------------------

const ERROR_RULES: ZeebeCheck = (ctx) => {
	for (const { entry, def } of defsOf(ctx, "error")) {
		const error = ctx.error(def.errorRef)
		if (entry.node.type === "endEvent") {
			if (error === undefined) {
				// Z77
				ctx.report(
					"error-end-reference",
					entry.node.id,
					"Must reference an error",
					"Reference an error with errorRef on the error event definition.",
				)
			} else if (blank(error.errorCode)) {
				// Z78
				ctx.report(
					"error-code",
					entry.node.id,
					"ErrorCode must be present and not empty",
					"Set an errorCode on the error.",
				)
			}
		} else if (error?.errorCode?.startsWith("=")) {
			// Z79: the code is matched literally, so a FEEL expression can never match
			ctx.report(
				"error-catch-code-expression",
				entry.node.id,
				"The errorCode of the error catch event is not allowed to be an expression",
				"Use a literal errorCode, without a leading '='.",
			)
		}
	}
}

const ESCALATION_RULES: ZeebeCheck = (ctx) => {
	for (const { entry, def } of defsOf(ctx, "escalation")) {
		const escalation = ctx.escalation(def.escalationRef)
		const type = entry.node.type
		if ((type === "intermediateThrowEvent" || type === "endEvent") && escalation === undefined) {
			// Z80
			ctx.report(
				"escalation-throw-reference",
				entry.node.id,
				"Must reference an escalation",
				"Reference an escalation with escalationRef on the escalation event definition.",
			)
		}
		const isCatch =
			type === "startEvent" || type === "intermediateCatchEvent" || type === "boundaryEvent"
		if (isCatch && escalation?.escalationCode?.startsWith("=")) {
			// Z82
			ctx.report(
				"escalation-catch-code-expression",
				entry.node.id,
				"The escalationCode of the escalation catch event is not allowed to be an expression",
				"Use a literal escalationCode, without a leading '='.",
			)
		}
	}
	// Z81
	const thrown = new Set<string>()
	for (const { entry, def } of defsOf(ctx, "escalation")) {
		if (
			(entry.node.type === "intermediateThrowEvent" || entry.node.type === "endEvent") &&
			def.escalationRef !== undefined
		) {
			thrown.add(def.escalationRef)
		}
	}
	for (const escalation of ctx.defs.escalations) {
		if (thrown.has(escalation.id) && blank(escalation.escalationCode)) {
			ctx.report(
				"escalation-code",
				escalation.id,
				"EscalationCode must be present and not empty",
				"Set an escalationCode on the escalation.",
			)
		}
	}
}

// ---------------------------------------------------------------------------
// Links: Z83-Z85
// ---------------------------------------------------------------------------

function isWithin(scope: Scope, ancestor: Scope): boolean {
	for (let s: Scope | undefined = scope; s !== undefined; s = s.parent) {
		if (s === ancestor) return true
	}
	return false
}

const LINK_RULES: ZeebeCheck = (ctx) => {
	const links = defsOf(ctx, "link")
	// Z83
	for (const { entry, def } of links) {
		if (blank(def.name)) {
			ctx.report(
				"link-name",
				entry.node.id,
				"Link name must be present and not empty.",
				"Give the link event definition a name.",
			)
		}
	}
	const named = (type: "intermediateCatchEvent" | "intermediateThrowEvent") =>
		links.filter(({ entry, def }) => entry.node.type === type && !blank(def.name))
	const catches = named("intermediateCatchEvent")
	const throws = named("intermediateThrowEvent")
	// Zeebe runs this for the process and for every sub-process: the catch events are
	// collected through nested sub-processes, the throw events only directly in it.
	for (const scope of ctx.scopes) {
		const below = catches.filter(({ entry }) => isWithin(entry.scope, scope))
		const counts = new Map<string, number>()
		for (const { def } of below) counts.set(def.name ?? "", (counts.get(def.name ?? "") ?? 0) + 1)
		for (const [name, count] of counts) {
			if (count > 1) {
				// Z85
				ctx.report(
					"duplicate-link-catch",
					scope.id,
					`Multiple intermediate catch link event definitions with the same name '${name}' are not allowed.`,
					"Give each link catch event its own name.",
				)
			}
		}
		const direct = new Set(
			below.filter(({ entry }) => entry.scope === scope).map(({ def }) => def.name),
		)
		for (const { entry, def } of throws) {
			if (entry.scope !== scope || direct.has(def.name)) continue
			// Z84
			ctx.report(
				"link-throw-catch",
				scope.id,
				`Can't find an catch link event for the throw link event with the name '${def.name}'.`,
				"Add a link catch event with the same name in the same scope.",
			)
		}
	}
}

// ---------------------------------------------------------------------------
// Compensation: Z86-Z89
// ---------------------------------------------------------------------------

const ACTIVITY_TYPES: readonly BpmnFlowElement["type"][] = [
	"task",
	"serviceTask",
	"scriptTask",
	"userTask",
	"businessRuleTask",
	"sendTask",
	"receiveTask",
	"manualTask",
	"callActivity",
	"subProcess",
	"eventSubProcess",
	"adHocSubProcess",
	"transaction",
]

const SUB_PROCESS_TYPES: readonly BpmnFlowElement["type"][] = [
	"subProcess",
	"adHocSubProcess",
	"transaction",
]

const TASK_TYPES: readonly BpmnFlowElement["type"][] = [
	"task",
	"serviceTask",
	"scriptTask",
	"userTask",
	"businessRuleTask",
	"sendTask",
	"receiveTask",
	"manualTask",
]

const COMPENSATION_RULES: ZeebeCheck = (ctx) => {
	for (const { entry, def } of defsOf(ctx, "compensate")) {
		const ref = def.activityRef
		const target = ref === undefined ? undefined : ctx.node(ref)
		const activity =
			target !== undefined && ACTIVITY_TYPES.includes(target.node.type) ? target : undefined
		if (activity === undefined) {
			if (ref !== undefined && ref !== "") {
				// Z86
				ctx.report(
					"compensation-activity-exists",
					entry.node.id,
					`The referenced compensation activity '${ref}' doesn't exist`,
					"Point activityRef at an existing activity.",
				)
			}
			continue
		}
		const id = activity.node.id
		const hasHandler = ctx
			.boundaries(id)
			.some(({ node }) => eventDefinitions(node).some((d) => d.type === "compensate"))
		// A sub-process triggered by an event is not an embedded sub-process.
		const embedded =
			SUB_PROCESS_TYPES.includes(activity.node.type) &&
			(activity.node as { triggeredByEvent?: boolean }).triggeredByEvent !== true
		if (!hasHandler && !embedded) {
			// Z87
			ctx.report(
				"compensation-activity-handler",
				entry.node.id,
				`The referenced compensation activity '${id}' must have either a compensation boundary event or be a subprocess`,
				"Attach a compensation boundary event to the activity, or reference an embedded sub-process.",
			)
		}
		const scope = entry.scope
		const sameScope =
			activity.scope === scope ||
			(scope.kind === "eventSubProcess" && activity.scope === scope.parent)
		if (!sameScope) {
			// Z88
			ctx.report(
				"compensation-activity-scope",
				entry.node.id,
				`The referenced compensation activity '${id}' must be in the same scope as the compensation throw event`,
				"Reference an activity from the same scope as the compensation throw event.",
			)
		}
	}
	for (const { node } of ctx.nodes) {
		if (!TASK_TYPES.includes(node.type) || node.isForCompensation !== true) continue
		if (ctx.incoming(node.id).length > 0) {
			ctx.report(
				"compensation-handler-flows",
				node.id,
				"A compensation handler should have no incoming sequence flows",
				"Remove the incoming sequence flows of the compensation handler.",
			)
		}
		if (ctx.outgoing(node.id).length > 0) {
			ctx.report(
				"compensation-handler-flows",
				node.id,
				"A compensation handler should have no outgoing sequence flows",
				"Remove the outgoing sequence flows of the compensation handler.",
			)
		}
		if (ctx.boundaries(node.id).length > 0) {
			ctx.report(
				"compensation-handler-flows",
				node.id,
				"A compensation handler should have no boundary events",
				"Remove the boundary events of the compensation handler.",
			)
		}
	}
}

export const checks: ZeebeCheck[] = [
	MESSAGE_REFERENCE_RULES,
	MESSAGE_ROOT_RULES,
	MESSAGE_START_RULES,
	MESSAGE_THROW_RULES,
	RECEIVE_TASK_RULES,
	SIGNAL_RULES,
	ERROR_RULES,
	ESCALATION_RULES,
	LINK_RULES,
	COMPENSATION_RULES,
]
