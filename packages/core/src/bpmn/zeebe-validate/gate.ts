import { DeployabilityError } from "../../errors.js"
import { ZEEBE_LATEST_VERSION } from "../../generated/zeebe-rules.js"
import type { XmlElement } from "../../types/xml-element.js"
import type {
	BpmnDefinitions,
	BpmnEventDefinition,
	BpmnFlowElement,
	BpmnMessage,
	BpmnSequenceFlow,
} from "../bpmn-model.js"
import { serializeBpmn } from "../bpmn-serializer.js"
import { normalizeCamundaVersion } from "../camunda-compat.js"
import type { OptimizationFinding } from "../optimize/types.js"
import { type ValidateDeployableOptions, ZEEBE_NS, localRef } from "./context.js"
import { isDeployable, validateDeployableXml } from "./index.js"

/** Options for {@link assertDeployable}. */
export interface AssertDeployableOptions extends ValidateDeployableOptions {
	/**
	 * Fill the documented {@link PLACEHOLDERS} where a required value is missing,
	 * instead of refusing the model (default `false`).
	 */
	placeholders?: boolean
}

/** The fields {@link assertDeployable} can fill with a placeholder. */
export type PlaceholderField =
	| "jobType"
	| "messageName"
	| "correlationKey"
	| "signalName"
	| "errorCode"
	| "escalationCode"
	| "timer"
	| "calledElement"
	| "decisionId"
	| "condition"

/** One placeholder value {@link assertDeployable} wrote. */
export interface PlaceholderFill {
	/** The element that got the value (a flow node, sequence flow or root message/signal/escalation). */
	elementId: string
	field: PlaceholderField
	/** What was written. */
	value: string
	/** The `zeebe/*` rule the value satisfies. */
	rule: string
}

/** What {@link assertDeployable} returns for a model Zeebe accepts. */
export interface DeployableResult {
	/** The input when nothing was filled, else a filled copy; the input is never mutated. */
	definitions: BpmnDefinitions
	/** The values filled, in the order they were written; empty unless `placeholders: true`. */
	placeholders: PlaceholderFill[]
	/** Findings below severity `error`. */
	warnings: OptimizationFinding[]
}

/**
 * Every placeholder value, by field. `<elementId>` stands for the id of the element
 * that gets the value. Values are deterministic so the same input always fills the
 * same way; none of them makes the model do anything useful at runtime.
 */
export const PLACEHOLDERS: Readonly<
	Record<PlaceholderField, { readonly value: string; readonly where: string }>
> = {
	jobType: {
		value: "placeholder-<elementId>",
		where:
			"zeebe:taskDefinition type of a service task, send task, script task without a script, business rule task without a decision, or message throw/end event without zeebe:publishMessage",
	},
	messageName: {
		value: "placeholder-<elementId>",
		where:
			"name of a message without one; a missing messageRef gets a new message with this id and name",
	},
	correlationKey: {
		value: '="placeholder-<elementId>"',
		where: "correlationKey of zeebe:subscription (added when missing) or zeebe:publishMessage",
	},
	signalName: {
		value: "placeholder-<elementId>",
		where:
			"name of a signal without one; a missing signalRef gets a new signal with this id and name",
	},
	errorCode: {
		value: "placeholder-<elementId>",
		where:
			"errorCode of the error an error end event throws; a missing errorRef gets a new error with this id and code",
	},
	escalationCode: {
		value: "placeholder-<elementId>",
		where:
			"escalationCode of a thrown escalation; a missing escalationRef gets a new escalation with this id and code",
	},
	timer: {
		value: "PT1H",
		where: "timeDuration of a timer event definition with no duration, date or cycle",
	},
	calledElement: {
		value: "placeholder-<elementId>",
		where: "processId of a call activity's zeebe:calledElement (added when missing)",
	},
	decisionId: {
		value: "placeholder-<elementId>",
		where: "decisionId of a business rule task's zeebe:calledDecision",
	},
	condition: {
		value: "=false",
		where:
			"condition of a non-default outgoing flow of an exclusive or inclusive gateway, so the flow is never taken",
	},
}

/** Filling one kind of value can reveal the next (a new message then needs a subscription). */
const MAX_FILL_ROUNDS = 4

function check(definitions: BpmnDefinitions, options: ValidateDeployableOptions) {
	// The serialized XML, not the model: what is deployed is the XML, so serializer bugs count too.
	return validateDeployableXml(serializeBpmn(definitions), options)
}

/** The message of a {@link DeployabilityError}; the Rust twin builds the same bytes. */
export function deployabilityMessage(
	camundaVersion: string,
	errors: readonly OptimizationFinding[],
): string {
	const lines = errors.map((f) => `- ${f.elementIds[0] ?? ""}: ${f.message} (${f.id})`)
	return [`Not deployable on Camunda ${camundaVersion}: ${errors.length} error(s)`, ...lines].join(
		"\n",
	)
}

/**
 * Refuses a model Zeebe would reject on deploy, with every reason in one error.
 *
 * The check is {@link validateDeployableXml} on the serialized model, so anything
 * the serializer gets wrong is refused too. With `placeholders: true`, missing
 * required values (job types, message names, correlation keys, ...) are filled
 * with the values in {@link PLACEHOLDERS} on a copy, which is validated again.
 *
 * @param definitions - The model to check; never mutated.
 * @param options - As for {@link validateDeployable}, plus `placeholders`.
 * @returns The model to deploy (the input, or the filled copy), the fills and the warnings.
 * @throws {DeployabilityError} When an error finding remains.
 *
 * @example
 * ```typescript
 * const { definitions, placeholders } = assertDeployable(defs, { placeholders: true })
 * for (const p of placeholders) console.log(`${p.elementId}.${p.field} = ${p.value}`)
 * ```
 */
export function assertDeployable(
	definitions: BpmnDefinitions,
	options: AssertDeployableOptions = {},
): DeployableResult {
	const { placeholders: fill = false, ...validateOptions } = options
	const version = normalizeCamundaVersion(options.camundaVersion) ?? ZEEBE_LATEST_VERSION
	let result = definitions
	let findings = check(definitions, validateOptions)
	const fills: PlaceholderFill[] = []
	if (fill && !isDeployable(findings)) {
		const copy = structuredClone(definitions)
		// Callers such as the lint plugin pass partial models; filling adds root elements.
		copy.messages ??= []
		copy.signals ??= []
		copy.errors ??= []
		copy.escalations ??= []
		for (let round = 0; round < MAX_FILL_ROUNDS && !isDeployable(findings); round++) {
			const added = fillPlaceholders(copy, findings)
			if (added.length === 0) break
			fills.push(...added)
			findings = check(copy, validateOptions)
		}
		if (fills.length > 0) result = copy
	}
	const errors = findings.filter((f) => f.severity === "error")
	if (errors.length > 0) {
		throw new DeployabilityError(deployabilityMessage(version, errors), errors, version)
	}
	return { definitions: result, placeholders: fills, warnings: findings }
}

// ---------------------------------------------------------------------------
// Filling
// ---------------------------------------------------------------------------

type Node = BpmnFlowElement & { eventDefinitions?: BpmnEventDefinition[]; messageRef?: string }

const placeholder = (id: string): string => `placeholder-${id}`
const blank = (v: string | undefined): boolean => v === undefined || v.trim() === ""

/** Flow nodes and sequence flows by id, first occurrence winning, as the validator indexes them. */
function index(defs: BpmnDefinitions) {
	const nodes = new Map<string, Node>()
	const flows = new Map<string, BpmnSequenceFlow>()
	/** Start events directly in a process: their messages need no subscription. */
	const processStarts = new Set<Node>()
	const walk = (elements: BpmnFlowElement[], seq: BpmnSequenceFlow[], top: boolean) => {
		for (const el of elements) {
			if (!nodes.has(el.id)) nodes.set(el.id, el as Node)
			if (top && el.type === "startEvent") processStarts.add(el as Node)
			if ("flowElements" in el && Array.isArray(el.flowElements)) {
				walk(el.flowElements, (el as { sequenceFlows: BpmnSequenceFlow[] }).sequenceFlows, false)
			}
		}
		for (const f of seq) if (!flows.has(f.id)) flows.set(f.id, f)
	}
	for (const p of defs.processes) walk(p.flowElements, p.sequenceFlows, true)
	return { nodes, flows, processStarts }
}

class Filler {
	readonly fills: PlaceholderFill[] = []
	private readonly defs: BpmnDefinitions
	private readonly nodes: Map<string, Node>
	private readonly flows: Map<string, BpmnSequenceFlow>
	private readonly processStarts: Set<Node>
	/** The prefix new zeebe:* elements get: the model's own one for the Zeebe namespace. */
	private readonly prefix: string
	/** The rule of the finding being filled. */
	private rule = ""

	constructor(defs: BpmnDefinitions) {
		const { nodes, flows, processStarts } = index(defs)
		this.defs = defs
		this.nodes = nodes
		this.flows = flows
		this.processStarts = processStarts
		this.prefix =
			Object.entries(defs.namespaces).find(([, uri]) => uri === ZEEBE_NS)?.[0] ?? "zeebe"
	}

	record(elementId: string, field: PlaceholderField, value: string): void {
		this.fills.push({ elementId, field, value, rule: this.rule })
	}

	isZeebe(name: string, local: string): boolean {
		const colon = name.indexOf(":")
		if (colon < 0 || name.slice(colon + 1) !== local) return false
		const prefix = name.slice(0, colon)
		return (
			(this.defs.namespaces[prefix] ?? (prefix === "zeebe" ? ZEEBE_NS : undefined)) === ZEEBE_NS
		)
	}

	zeebe(elements: XmlElement[] | undefined, local: string): XmlElement[] {
		return (elements ?? []).filter((x) => this.isZeebe(x.name, local))
	}

	element(local: string, attributes: Record<string, string>): XmlElement {
		return { name: `${this.prefix}:${local}`, attributes, children: [] }
	}

	/** A job type on a node that has no implementation at all. */
	addJobType(node: Node, others: XmlElement[]): void {
		if (others.length > 0 || this.zeebe(node.extensionElements, "taskDefinition").length > 0) return
		const value = placeholder(node.id)
		node.extensionElements.push(this.element("taskDefinition", { type: value }))
		this.record(node.id, "jobType", value)
	}

	setJobType(node: Node): void {
		for (const td of this.zeebe(node.extensionElements, "taskDefinition")) {
			if (!blank(td.attributes.type)) continue
			const value = placeholder(node.id)
			td.attributes.type = value
			this.record(node.id, "jobType", value)
		}
	}

	defsOf<T extends BpmnEventDefinition["type"]>(
		node: Node,
		type: T,
	): Extract<BpmnEventDefinition, { type: T }>[] {
		return (node.eventDefinitions ?? []).filter(
			(d): d is Extract<BpmnEventDefinition, { type: T }> => d.type === type,
		)
	}

	/**
	 * The message a node references, created when the reference does not resolve. A message
	 * a node catches gets its subscription here, keyed on the node, so the key does not
	 * repeat the generated message id.
	 */
	message(node: Node, ref: string | undefined, catches: boolean): string | undefined {
		if (ref !== undefined && this.defs.messages.some((m) => m.id === localRef(ref)))
			return undefined
		const id = placeholder(node.id)
		if (!this.defs.messages.some((m) => m.id === id)) {
			const message: BpmnMessage = { id, name: id, unknownAttributes: {} }
			this.defs.messages.push(message)
			this.record(node.id, "messageName", id)
			if (catches && !this.processStarts.has(node)) {
				const key = `="${id}"`
				message.extensionElements = [this.element("subscription", { correlationKey: key })]
				this.record(node.id, "correlationKey", key)
			}
		}
		return id
	}

	fill(f: OptimizationFinding): void {
		this.rule = f.id
		const id = f.elementIds[0] ?? ""
		const node = this.nodes.get(id)
		switch (f.id.slice("zeebe/".length)) {
			case "service-task-definition":
				if (node?.type === "serviceTask") this.addJobType(node, [])
				break
			case "script-task-implementation":
				if (node?.type === "scriptTask")
					this.addJobType(node, this.zeebe(node.extensionElements, "script"))
				break
			case "send-task-implementation":
				if (node?.type === "sendTask")
					this.addJobType(node, this.zeebe(node.extensionElements, "publishMessage"))
				break
			case "business-rule-task-implementation":
				if (node?.type === "businessRuleTask")
					this.addJobType(node, this.zeebe(node.extensionElements, "calledDecision"))
				break
			case "message-throw-implementation":
				if (node !== undefined) {
					const publish = this.defsOf(node, "message").flatMap((d) =>
						this.zeebe(d.extensionElements, "publishMessage"),
					)
					this.addJobType(node, publish)
				}
				break
			case "task-definition-type":
				if (node !== undefined) this.setJobType(node)
				break
			case "message-reference":
			case "message-throw-reference":
				if (node !== undefined) {
					const catches = f.id === "zeebe/message-reference"
					for (const def of this.defsOf(node, "message")) {
						const ref = this.message(node, def.messageRef, catches)
						if (ref !== undefined) def.messageRef = ref
					}
				}
				break
			case "receive-task-message":
			case "send-task-message":
				if (node !== undefined) {
					const ref = this.message(node, node.messageRef, node.type === "receiveTask")
					if (ref !== undefined) node.messageRef = ref
				}
				break
			case "message-name": {
				const message = this.defs.messages.find((m) => m.id === id)
				if (message !== undefined && blank(message.name)) {
					message.name = placeholder(id)
					this.record(id, "messageName", message.name)
				}
				break
			}
			case "message-subscription": {
				const message = this.defs.messages.find((m) => m.id === id)
				if (
					message === undefined ||
					this.zeebe(message.extensionElements, "subscription").length > 0
				)
					break
				const value = `="${placeholder(id)}"`
				message.extensionElements ??= []
				message.extensionElements.push(this.element("subscription", { correlationKey: value }))
				this.record(id, "correlationKey", value)
				break
			}
			case "subscription-correlation-key": {
				const message = this.defs.messages.find((m) => m.id === id)
				this.setCorrelationKey(id, this.zeebe(message?.extensionElements, "subscription"))
				break
			}
			case "publish-message-correlation-key":
				if (node !== undefined) {
					const holders = [
						node.extensionElements,
						...this.defsOf(node, "message").map((d) => d.extensionElements),
					]
					this.setCorrelationKey(
						id,
						holders.flatMap((h) => this.zeebe(h, "publishMessage")),
					)
				}
				break
			case "signal-reference":
				if (node !== undefined) {
					for (const def of this.defsOf(node, "signal")) {
						const ref = def.signalRef
						if (ref !== undefined && this.defs.signals.some((s) => s.id === localRef(ref))) continue
						const sid = placeholder(node.id)
						if (!this.defs.signals.some((s) => s.id === sid)) {
							this.defs.signals.push({ id: sid, name: sid })
							this.record(node.id, "signalName", sid)
						}
						def.signalRef = sid
					}
				}
				break
			case "signal-name": {
				const signal = this.defs.signals.find((s) => s.id === id)
				if (signal !== undefined && blank(signal.name)) {
					signal.name = placeholder(id)
					this.record(id, "signalName", signal.name)
				}
				break
			}
			case "error-end-reference":
			case "error-code":
				if (node !== undefined) {
					for (const def of this.defsOf(node, "error")) {
						const ref = def.errorRef
						const error =
							ref === undefined ? undefined : this.defs.errors.find((e) => e.id === localRef(ref))
						const code = placeholder(node.id)
						if (error === undefined) {
							if (!this.defs.errors.some((e) => e.id === code)) {
								this.defs.errors.push({ id: code, name: code, errorCode: code })
								this.record(node.id, "errorCode", code)
							}
							def.errorRef = code
						} else if (blank(error.errorCode)) {
							error.errorCode = code
							this.record(node.id, "errorCode", code)
						}
					}
				}
				break
			case "escalation-throw-reference":
				if (node !== undefined) {
					for (const def of this.defsOf(node, "escalation")) {
						const ref = def.escalationRef
						if (ref !== undefined && this.defs.escalations.some((e) => e.id === localRef(ref)))
							continue
						const code = placeholder(node.id)
						if (!this.defs.escalations.some((e) => e.id === code)) {
							this.defs.escalations.push({ id: code, name: code, escalationCode: code })
							this.record(node.id, "escalationCode", code)
						}
						def.escalationRef = code
					}
				}
				break
			case "escalation-code": {
				const escalation = this.defs.escalations.find((e) => e.id === id)
				if (escalation !== undefined && blank(escalation.escalationCode)) {
					escalation.escalationCode = placeholder(id)
					this.record(id, "escalationCode", escalation.escalationCode)
				}
				break
			}
			case "timer-one-value":
			case "intermediate-timer-value":
				if (node !== undefined) {
					for (const def of this.defsOf(node, "timer")) {
						if ([def.timeDuration, def.timeDate, def.timeCycle].some((v) => v !== undefined))
							continue
						def.timeDuration = PLACEHOLDERS.timer.value
						this.record(node.id, "timer", def.timeDuration)
					}
				}
				break
			case "call-activity-called-element":
				if (
					node?.type === "callActivity" &&
					this.zeebe(node.extensionElements, "calledElement").length === 0
				) {
					const value = placeholder(node.id)
					node.extensionElements.push(this.element("calledElement", { processId: value }))
					this.record(node.id, "calledElement", value)
				}
				break
			case "called-element-process-id":
				if (node !== undefined) {
					for (const el of this.zeebe(node.extensionElements, "calledElement")) {
						if (!blank(el.attributes.processId)) continue
						el.attributes.processId = placeholder(node.id)
						this.record(node.id, "calledElement", el.attributes.processId)
					}
				}
				break
			case "called-decision-attributes":
				if (node !== undefined) {
					for (const el of this.zeebe(node.extensionElements, "calledDecision")) {
						if (!blank(el.attributes.decisionId)) continue
						el.attributes.decisionId = placeholder(node.id)
						this.record(node.id, "decisionId", el.attributes.decisionId)
					}
				}
				break
			case "exclusive-flow-condition":
			case "inclusive-flow-condition": {
				const flow = this.flows.get(id)
				if (flow !== undefined && flow.conditionExpression === undefined) {
					flow.conditionExpression = {
						text: PLACEHOLDERS.condition.value,
						attributes: { "xsi:type": "bpmn:tFormalExpression" },
					}
					this.record(id, "condition", PLACEHOLDERS.condition.value)
				}
				break
			}
		}
	}

	setCorrelationKey(elementId: string, holders: XmlElement[]): void {
		for (const el of holders) {
			if (!blank(el.attributes.correlationKey)) continue
			const value = `="${placeholder(elementId)}"`
			el.attributes.correlationKey = value
			this.record(elementId, "correlationKey", value)
		}
	}
}

/** Fills what the error findings ask for, in the findings' order; mutates `defs`. */
function fillPlaceholders(
	defs: BpmnDefinitions,
	findings: readonly OptimizationFinding[],
): PlaceholderFill[] {
	const filler = new Filler(defs)
	for (const f of findings) {
		if (f.severity === "error") filler.fill(f)
	}
	return filler.fills
}
