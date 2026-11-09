import type { BpmnConditionExpression, BpmnFlowElement } from "../../bpmn-model.js"
import {
	type ZeebeCheck,
	type ZeebeContext,
	feelError,
	feelFailure,
	isExpression,
	staticValueMessage,
} from "../context.js"

/** Checks for zeebe-rules.md sections J (gateways), K (multi-instance) and L (sub-processes, ad-hoc). */

type Gateway = Extract<
	BpmnFlowElement,
	{
		type:
			| "exclusiveGateway"
			| "inclusiveGateway"
			| "parallelGateway"
			| "eventBasedGateway"
			| "complexGateway"
	}
>

const GATEWAY_TYPES = new Set([
	"exclusiveGateway",
	"inclusiveGateway",
	"parallelGateway",
	"eventBasedGateway",
	"complexGateway",
])

function isGateway(node: BpmnFlowElement): node is Gateway {
	return GATEWAY_TYPES.has(node.type)
}

/**
 * Zeebe reads element text through `getTextContent()`, which trims; a
 * non-static expression must then match `=(.+)`.
 */
function expressionText(expression: BpmnConditionExpression | undefined): string | undefined {
	return expression === undefined ? undefined : expression.text.trim()
}

/**
 * The problem with an expression that must not be static: a static value, or a
 * FEEL parse failure; `undefined` when it is fine.
 */
function nonStaticProblem(text: string): string | undefined {
	if (!isExpression(text)) return staticValueMessage(text)
	return feelError(text) === undefined ? undefined : feelFailure(text)
}

/** An attribute the way Zeebe's getters see it: an empty value is the same as absent. */
function attr(el: { attributes: Record<string, string> }, name: string): string | undefined {
	const value = el.attributes[name]
	return value === undefined || value === "" ? undefined : value
}

function loopOf(node: BpmnFlowElement) {
	return (
		node as {
			loopCharacteristics?: import("../../bpmn-model.js").BpmnMultiInstanceLoopCharacteristics
		}
	).loopCharacteristics
}

// J: gateways and sequence flows ---------------------------------------------

const defaultSource: ZeebeCheck = (ctx) => {
	for (const { node } of ctx.nodes) {
		if (node.type !== "exclusiveGateway" && node.type !== "inclusiveGateway") continue
		const flow = ctx.flow(node.default)
		if (flow === undefined || flow.flow.sourceRef === node.id) continue
		ctx.report(
			node.type === "exclusiveGateway" ? "exclusive-default-source" : "inclusive-default-source",
			node.id,
			"Default flow must start at gateway",
			"Make the default flow start at the gateway that declares it.",
		)
	}
}

const flowCondition: ZeebeCheck = (ctx) => {
	for (const { flow } of ctx.flows) {
		const source = ctx.node(flow.sourceRef)?.node
		if (source === undefined || flow.conditionExpression !== undefined) continue
		if (source.type !== "exclusiveGateway" && source.type !== "inclusiveGateway") continue
		if (ctx.outgoing(source.id).length <= 1 || source.default === flow.id) continue
		ctx.report(
			source.type === "exclusiveGateway" ? "exclusive-flow-condition" : "inclusive-flow-condition",
			flow.id,
			source.type === "exclusiveGateway"
				? "Must have a condition or be default flow"
				: "Must have a condition",
			"Add a condition expression to the flow or make it the gateway's default flow.",
		)
	}
}

const conditionalFlowSource: ZeebeCheck = (ctx) => {
	for (const { node } of ctx.nodes) {
		if (node.type === "exclusiveGateway" || node.type === "inclusiveGateway") continue
		if (!ctx.outgoing(node.id).some((f) => f.flow.conditionExpression !== undefined)) continue
		ctx.report(
			"conditional-flow-source",
			node.id,
			"Conditional sequence flows are only supported at exclusive or inclusive gateway",
			"Remove the condition or route the flow through an exclusive or inclusive gateway.",
		)
	}
}

const conditionExpression: ZeebeCheck = (ctx) => {
	for (const { flow } of ctx.flows) {
		const text = expressionText(flow.conditionExpression)
		if (text === undefined) continue
		const problem = nonStaticProblem(text)
		if (problem === undefined) continue
		ctx.report(
			"condition-expression",
			flow.id,
			problem,
			"Write the condition as a FEEL expression that starts with '='.",
		)
	}
}

const EVENT_BASED_TARGETS = new Set(["timer", "message", "signal", "conditional"])

function duplicates(values: string[]): string[] {
	const seen = new Set<string>()
	const out: string[] = []
	for (const v of values) {
		if (seen.has(v) && !out.includes(v)) out.push(v)
		seen.add(v)
	}
	return out
}

function eventBasedGateway(ctx: ZeebeContext): void {
	for (const { node } of ctx.nodes) {
		if (node.type !== "eventBasedGateway") continue
		const outgoing = ctx.outgoing(node.id)
		if (outgoing.length < 2) {
			ctx.report(
				"event-based-gateway-outgoing",
				node.id,
				"Event-based gateway must have at least 2 outgoing sequence flows.",
				"Add a second outgoing flow to a catch event.",
			)
		}
		const targets = outgoing.map((f) => ctx.node(f.flow.targetRef)?.node)
		const valid = outgoing.every((f) => {
			const target = ctx.node(f.flow.targetRef)?.node
			if (target?.type !== "intermediateCatchEvent") return false
			const [only] = target.eventDefinitions
			return (
				target.eventDefinitions.length === 1 &&
				only !== undefined &&
				EVENT_BASED_TARGETS.has(only.type)
			)
		})
		if (!valid) {
			ctx.report(
				"event-based-gateway-target",
				node.id,
				"Event-based gateway must not have an outgoing sequence flow to other elements than message/timer/signal/conditional intermediate catch events.",
				"Route each flow to an intermediate catch event with one message, timer, signal or conditional definition.",
			)
		}
		const defs = targets.flatMap((t) =>
			t?.type === "intermediateCatchEvent" ? t.eventDefinitions : [],
		)
		const messageNames: string[] = []
		const signalNames: string[] = []
		for (const def of defs) {
			if (def.type === "message") {
				const name = ctx.message(def.messageRef)?.name
				if (name !== undefined && name !== "") messageNames.push(name)
			} else if (def.type === "signal") {
				const name = ctx.signal(def.signalRef)?.name
				if (name !== undefined && name !== "") signalNames.push(name)
			}
		}
		for (const name of duplicates(messageNames)) {
			ctx.report(
				"event-based-gateway-duplicate-trigger",
				node.id,
				`Multiple message event definitions with the same name '${name}' are not allowed.`,
				"Give each branch of the event-based gateway a different message.",
			)
		}
		for (const name of duplicates(signalNames)) {
			ctx.report(
				"event-based-gateway-duplicate-trigger",
				node.id,
				`Multiple signal event definitions with the same name '${name}' are not allowed.`,
				"Give each branch of the event-based gateway a different signal.",
			)
		}
		// Duplicate conditions are Z60 (event-based-gateway-duplicate-condition, events.ts).
		const shared = outgoing.some((f) =>
			ctx.incoming(f.flow.targetRef).some((i) => i.flow.sourceRef !== node.id),
		)
		if (shared) {
			ctx.report(
				"event-based-gateway-target-incoming",
				node.id,
				"Target elements of an event gateway must not have any additional incoming sequence flows other than that from the event gateway.",
				"Remove the other incoming flows of the catch events behind the gateway.",
			)
		}
	}
}

/** The `eventType` of every listener of an element with exactly one `zeebe:executionListeners`. */
function listenerEventTypes(
	ctx: ZeebeContext,
	el: { extensionElements?: import("../../../types/xml-element.js").XmlElement[] },
): string[] {
	const lists = ctx.zeebe(el, "executionListeners")
	const [only] = lists
	if (lists.length !== 1 || only === undefined) return []
	return ctx.zeebeChildren(only, "executionListener").map((l) => l.attributes.eventType ?? "")
}

const gatewayEndListener: ZeebeCheck = (ctx) => {
	for (const { node } of ctx.nodes) {
		if (!isGateway(node) || !listenerEventTypes(ctx, node).includes("end")) continue
		ctx.report(
			"gateway-end-listener",
			node.id,
			"Execution listeners of type 'end' are not supported by gateway element",
			"Use a 'start' execution listener or move the listener to a neighbouring element.",
		)
	}
}

// K: multi-instance -----------------------------------------------------------

const multiInstance: ZeebeCheck = (ctx) => {
	for (const { node } of ctx.nodes) {
		const loop = loopOf(node)
		if (loop === undefined) continue
		const configs = ctx.zeebe(loop, "loopCharacteristics")
		if (configs.length !== 1) {
			ctx.report(
				"multi-instance-loop-characteristics",
				node.id,
				"Must have exactly one 'zeebe:loopCharacteristics' extension element",
				"Add a single zeebe:loopCharacteristics element to the multi-instance loop.",
			)
		}
		for (const config of configs) {
			const input = attr(config, "inputCollection")
			if (input === undefined) {
				ctx.report(
					"multi-instance-input-collection",
					node.id,
					"Attribute 'inputCollection' must be present and not empty",
					"Set inputCollection to the FEEL expression of the collection to iterate.",
				)
			}
			const outputCollection = attr(config, "outputCollection")
			const outputElement = attr(config, "outputElement")
			if (outputCollection !== undefined && outputElement === undefined) {
				ctx.report(
					"multi-instance-output-pair",
					node.id,
					"Attribute 'outputElement' must be present if the attribute 'outputCollection' is set",
					"Set outputElement or remove outputCollection.",
				)
			} else if (outputElement !== undefined && outputCollection === undefined) {
				ctx.report(
					"multi-instance-output-pair",
					node.id,
					"Attribute 'outputCollection' must be present if the attribute 'outputElement' is set",
					"Set outputCollection or remove outputElement.",
				)
			}
			// A missing inputCollection is Zeebe's "Expected expression but not found." (Z168), not ours.
			for (const value of [input, outputElement]) {
				const problem = value === undefined ? undefined : nonStaticProblem(value)
				if (problem === undefined) continue
				ctx.report(
					"multi-instance-expression",
					node.id,
					problem,
					"Write the value as a FEEL expression that starts with '='.",
				)
			}
		}
		// The completion condition may be static; only a '=' expression is parsed.
		const completion = expressionText(loop.completionCondition)
		if (
			completion !== undefined &&
			isExpression(completion) &&
			feelError(completion) !== undefined
		) {
			ctx.report(
				"multi-instance-expression",
				node.id,
				feelFailure(completion),
				"Fix the FEEL syntax of the completion condition.",
			)
		}
	}
}

const beforeAllListener: ZeebeCheck = (ctx) => {
	const check = (
		id: string,
		type: string,
		el: Parameters<typeof listenerEventTypes>[1],
		multi: boolean,
	) => {
		if (multi || !listenerEventTypes(ctx, el).includes("beforeAll")) return
		ctx.report(
			"before-all-listener",
			id,
			`Execution listeners with event type 'beforeAll' are only supported on multi-instance activities and are not valid on '${type}'`,
			"Remove the beforeAll listener or make the activity multi-instance.",
		)
	}
	for (const process of ctx.defs.processes) check(process.id, "process", process, false)
	for (const { node } of ctx.nodes) {
		// Zeebe has one `subProcess` type for embedded and event sub-processes.
		const type = node.type === "eventSubProcess" ? "subProcess" : node.type
		check(node.id, type, node, loopOf(node) !== undefined)
	}
}

// L: sub-processes and ad-hoc ---------------------------------------------------

const subProcessStart: ZeebeCheck = (ctx) => {
	for (const scope of ctx.scopes) {
		const container = scope.container
		if (container === undefined) continue
		const starts = scope.flowElements.filter((n) => n.type === "startEvent")
		if (starts.length !== 1 && scope.kind !== "adHocSubProcess") {
			ctx.report(
				"sub-process-start-event",
				container.id,
				"Must have exactly one start event",
				"Give the sub-process exactly one start event.",
			)
		}
		const [first] = starts
		if (
			first?.type === "startEvent" &&
			scope.kind !== "eventSubProcess" &&
			first.eventDefinitions.length > 0
		) {
			ctx.report(
				"sub-process-start-none",
				container.id,
				"Start events in subprocesses must be of type none",
				"Use a none start event inside an embedded sub-process.",
			)
		}
	}
}

const adHocStructure: ZeebeCheck = (ctx) => {
	for (const scope of ctx.scopes) {
		if (scope.kind !== "adHocSubProcess" || scope.container === undefined) continue
		const id = scope.container.id
		if (scope.flowElements.length === 0 && scope.sequenceFlows.length === 0) {
			ctx.report(
				"ad-hoc-activity",
				id,
				"Must have at least one activity.",
				"Add at least one activity to the ad-hoc sub-process.",
			)
		}
		if (scope.flowElements.some((n) => n.type === "startEvent")) {
			ctx.report(
				"ad-hoc-start-event",
				id,
				"Must not contain a start event.",
				"Remove the start event from the ad-hoc sub-process.",
			)
		}
		if (scope.flowElements.some((n) => n.type === "endEvent")) {
			ctx.report(
				"ad-hoc-end-event",
				id,
				"Must not contain an end event.",
				"Remove the end event from the ad-hoc sub-process.",
			)
		}
	}
}

const adHocExtensions: ZeebeCheck = (ctx) => {
	for (const { node } of ctx.nodes) {
		if (node.type !== "adHocSubProcess") continue
		const adHocs = ctx.zeebe(node, "adHoc")
		if (ctx.zeebe(node, "taskDefinition").length > 0) {
			if (node.cancelRemainingInstances === false) {
				ctx.report(
					"ad-hoc-agent-cancel-remaining",
					node.id,
					"Must not define cancelRemainingInstances in combination with zeebe:taskDefinition.",
					"Remove cancelRemainingInstances or the task definition.",
				)
			}
			if (node.completionCondition !== undefined) {
				ctx.report(
					"ad-hoc-agent-completion-condition",
					node.id,
					"Must not define completionCondition in combination with zeebe:taskDefinition.",
					"Remove the completion condition or the task definition.",
				)
			}
			const [first] = adHocs
			if (first !== undefined && attr(first, "activeElementsCollection") !== undefined) {
				ctx.report(
					"ad-hoc-agent-active-elements",
					node.id,
					"Must not define activeElementsCollection in combination with zeebe:taskDefinition.",
					"Remove activeElementsCollection or the task definition.",
				)
			}
		}
		for (const adHoc of adHocs) {
			const element = attr(adHoc, "outputElement")
			const collection = attr(adHoc, "outputCollection")
			if ((element === undefined) !== (collection === undefined)) {
				ctx.report(
					"ad-hoc-output-pair",
					node.id,
					`OutputElement and OutputCollection must both be set, or neither of them set. outputElement:${element ?? "null"} and outputCollection:${collection ?? "null"}.`,
					"Set both outputElement and outputCollection or neither.",
				)
			}
		}
		const values = [
			expressionText(node.completionCondition),
			...adHocs.flatMap((a) => [attr(a, "activeElementsCollection"), attr(a, "outputElement")]),
		]
		for (const value of values) {
			const problem = value === undefined ? undefined : nonStaticProblem(value)
			if (problem === undefined) continue
			ctx.report(
				"ad-hoc-expression",
				node.id,
				problem,
				"Write the value as a FEEL expression that starts with '='.",
			)
		}
		if (adHocs.length > 1) {
			ctx.report(
				"duplicate-ad-hoc-extension",
				node.id,
				"Must have exactly one 'zeebe:adHoc' extension element when exists. Please check process definition XML and retain only one extension element.",
				"Keep a single zeebe:adHoc extension element.",
			)
		}
	}
}

export const checks: ZeebeCheck[] = [
	defaultSource,
	flowCondition,
	conditionalFlowSource,
	conditionExpression,
	eventBasedGateway,
	gatewayEndListener,
	multiInstance,
	beforeAllListener,
	subProcessStart,
	adHocStructure,
	adHocExtensions,
]
