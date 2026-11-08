import type { XmlElement } from "../types/xml-element.js"
import type { BpmnDefinitions, BpmnFlowElement, BpmnSequenceFlow } from "./bpmn-model.js"

/**
 * The builder's Camunda 8 rules: what Zeebe would refuse, said in the builder's
 * terms (the option or call that fixes it) before the generic deploy check runs.
 * They read the built model, not the calls, so the Rust twin
 * (`bpmnkit_builder::rules`) gives the same answer on the same (pinned) model.
 * Walk order is the model's: processes, then each scope's elements in order,
 * descending into sub-processes after the element itself.
 */

/** What `placeholders: true` fills, so the rules leave those gaps to the gate. */
export interface BuilderRuleOptions {
	placeholders?: boolean
}

const zeebe = (extensions: readonly XmlElement[] | undefined, name: string) =>
	extensions?.find((x) => x.name === `zeebe:${name}`)

/** Zeebe reads a value without a leading `=` as a static string. */
const isStatic = (value: string | undefined): value is string =>
	value !== undefined && value !== "" && !value.startsWith("=")

function staticFeel(field: string, value: string, elementId: string): string {
	return `${field} "${value}" of "${elementId}" is a static value; Camunda 8 needs a FEEL expression here, e.g. "=${value}"`
}

/** The message a send task or message throw/end event refers to, if it is one. */
function messageJobLabel(el: BpmnFlowElement): string | undefined {
	if (el.type === "sendTask") return "Send task"
	if (el.type !== "intermediateThrowEvent" && el.type !== "endEvent") return undefined
	if (!el.eventDefinitions.some((d) => d.type === "message")) return undefined
	return el.type === "endEvent" ? "Message end event" : "Message throw event"
}

function hasMessageImplementation(el: BpmnFlowElement): boolean {
	if (
		zeebe(el.extensionElements, "taskDefinition") ||
		zeebe(el.extensionElements, "publishMessage")
	)
		return true
	if (!("eventDefinitions" in el)) return false
	return el.eventDefinitions.some(
		(d) => d.type === "message" && zeebe(d.extensionElements, "publishMessage") !== undefined,
	)
}

function messageRefOf(el: BpmnFlowElement): string | undefined {
	if ("messageRef" in el && typeof el.messageRef === "string") return el.messageRef
	if (!("eventDefinitions" in el)) return undefined
	for (const d of el.eventDefinitions) if (d.type === "message") return d.messageRef
	return undefined
}

function elementProblem(
	el: BpmnFlowElement,
	flows: readonly BpmnSequenceFlow[],
	defs: BpmnDefinitions,
	options: BuilderRuleOptions,
): string | undefined {
	const fill = options.placeholders === true

	if (!fill && (el.type === "exclusiveGateway" || el.type === "inclusiveGateway")) {
		const outgoing = flows.filter((f) => f.sourceRef === el.id)
		if (outgoing.length > 1) {
			const kind = el.type === "exclusiveGateway" ? "exclusive" : "inclusive"
			for (const flow of outgoing) {
				if (flow.conditionExpression !== undefined || el.default === flow.id) continue
				return `Flow "${flow.id}" leaves ${kind} gateway "${el.id}" without a condition: give its branch .condition("=<FEEL>") or .defaultFlow(); Camunda 8 needs one when a gateway has several outgoing flows`
			}
		}
	}

	const label = messageJobLabel(el)
	if (!fill && label !== undefined && !hasMessageImplementation(el)) {
		return `${label} "${el.id}" needs a taskType: Camunda 8 hands the message to a job worker of that type (zeebe:taskDefinition)`
	}

	if (el.type === "adHocSubProcess") {
		const adHoc = zeebe(el.extensionElements, "adHoc")
		if (zeebe(el.extensionElements, "taskDefinition")) {
			const forbidden = [
				adHoc?.attributes.activeElementsCollection !== undefined
					? "activeElementsCollection"
					: undefined,
				el.completionCondition !== undefined ? "completionCondition" : undefined,
				el.cancelRemainingInstances === false ? "cancelRemainingInstances: false" : undefined,
			].find((x) => x !== undefined)
			if (forbidden !== undefined) {
				return `Ad-hoc sub-process "${el.id}" has a taskDefinition (an AI agent) and ${forbidden}; Camunda 8 refuses that combination: remove ${forbidden}, the agent job decides which tools run and when it is done`
			}
		}
		const element = adHoc?.attributes.outputElement
		const collection = adHoc?.attributes.outputCollection
		if ((element === undefined) !== (collection === undefined)) {
			const [set, missing] =
				element === undefined
					? ["outputCollection", "outputElement"]
					: ["outputElement", "outputCollection"]
			return `Ad-hoc sub-process "${el.id}" sets ${set} without ${missing}: set both, or neither`
		}
		const active = adHoc?.attributes.activeElementsCollection
		if (isStatic(active)) return staticFeel("activeElementsCollection", active, el.id)
	}

	const ref = messageRefOf(el)
	if (ref !== undefined) {
		const own = zeebe(el.extensionElements, "subscription")
		const shared = zeebe(
			defs.messages?.find((m) => m.id === ref)?.extensionElements,
			"subscription",
		)
		const key = (own ?? shared)?.attributes.correlationKey
		if (isStatic(key)) return staticFeel("correlationKey", key, el.id)
	}

	if ("loopCharacteristics" in el && el.loopCharacteristics !== undefined) {
		const loop = zeebe(el.loopCharacteristics.extensionElements, "loopCharacteristics")
		const collection = loop?.attributes.inputCollection
		if (isStatic(collection)) return staticFeel("Multi-instance inputCollection", collection, el.id)
	}

	return undefined
}

function scopeProblem(
	elements: readonly BpmnFlowElement[],
	flows: readonly BpmnSequenceFlow[],
	defs: BpmnDefinitions,
	options: BuilderRuleOptions,
): string | undefined {
	for (const el of elements) {
		const problem = elementProblem(el, flows, defs, options)
		if (problem !== undefined) return problem
		if ("flowElements" in el && Array.isArray(el.flowElements)) {
			const inner = scopeProblem(el.flowElements, el.sequenceFlows ?? [], defs, options)
			if (inner !== undefined) return inner
		}
	}
	return undefined
}

/**
 * The first Camunda 8 builder rule the model breaks, or `undefined`.
 * Only rules that are Camunda 8 requirements live here; structural ones
 * (nothing after an end event) are refused at the call that breaks them.
 */
export function camunda8BuilderProblem(
	defs: BpmnDefinitions,
	options: BuilderRuleOptions = {},
): string | undefined {
	for (const process of defs.processes) {
		const problem = scopeProblem(process.flowElements, process.sequenceFlows, defs, options)
		if (problem !== undefined) return problem
	}
	return undefined
}
