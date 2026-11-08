import { parseExpression } from "@bpmnkit/feel"
import {
	ZEEBE_LATEST_VERSION,
	ZEEBE_RULES,
	type ZeebeRuleMeta,
	type ZeebeRuleName,
} from "../../generated/zeebe-rules.js"
import type { XmlElement } from "../../types/xml-element.js"
import type {
	BpmnDefinitions,
	BpmnError,
	BpmnEscalation,
	BpmnFlowElement,
	BpmnMessage,
	BpmnSequenceFlow,
	BpmnSignal,
} from "../bpmn-model.js"
import { CAMUNDA_COMPAT_VERSIONS } from "../camunda-compat-data.js"
import { normalizeCamundaVersion } from "../camunda-compat.js"
import type { OptimizationFinding } from "../optimize/types.js"

export const ZEEBE_NS = "http://camunda.org/schema/zeebe/1.0"

/**
 * The other resources of the same deployment, for the rules that look past one
 * file (`bindingType="deployment"` targets, duplicate process ids). Each answers
 * for resources other than the BPMN being validated.
 */
export interface ZeebeResolver {
	hasProcess?(id: string): boolean
	hasDecision?(id: string): boolean
	hasForm?(id: string): boolean
	hasResource?(id: string): boolean
}

/** Zeebe's configured length limits (`EngineConfiguration`, 32768 by default). */
export interface ZeebeLimits {
	maxIdLength: number
	maxNameLength: number
	maxWorkerTypeLength: number
}

export const DEFAULT_ZEEBE_LIMITS: ZeebeLimits = {
	maxIdLength: 32768,
	maxNameLength: 32768,
	maxWorkerTypeLength: 32768,
}

export interface ValidateDeployableOptions {
	/** The Camunda 8 version to validate for, e.g. `"8.6"`. Defaults to the newest supported. */
	camundaVersion?: string
	/** Other resources of the deployment; without it the context rules are skipped. */
	resolver?: ZeebeResolver
	limits?: Partial<ZeebeLimits>
}

/** What a scope is: the process itself or a container whose children Zeebe validates as a scope. */
export type ScopeKind =
	| "process"
	| "subProcess"
	| "eventSubProcess"
	| "adHocSubProcess"
	| "transaction"

export interface Scope {
	kind: ScopeKind
	/** The process id, or the container's id. */
	id: string
	processId: string
	/** The container element; absent for a process. */
	container?: BpmnFlowElement
	parent?: Scope
	flowElements: BpmnFlowElement[]
	sequenceFlows: BpmnSequenceFlow[]
}

export interface NodeEntry {
	node: BpmnFlowElement
	scope: Scope
}

export interface FlowEntry {
	flow: BpmnSequenceFlow
	scope: Scope
}

/** One check: reads the context and reports through `ctx.report`. */
export type ZeebeCheck = (ctx: ZeebeContext) => void

type Container = BpmnFlowElement & {
	flowElements: BpmnFlowElement[]
	sequenceFlows: BpmnSequenceFlow[]
}

function isContainer(el: BpmnFlowElement): el is Container {
	return "flowElements" in el && Array.isArray((el as Container).flowElements)
}

function scopeKind(el: Container): ScopeKind {
	if (el.type === "eventSubProcess") return "eventSubProcess"
	if (el.type === "subProcess" && (el as { triggeredByEvent?: boolean }).triggeredByEvent === true)
		return "eventSubProcess"
	if (el.type === "adHocSubProcess") return "adHocSubProcess"
	if (el.type === "transaction") return "transaction"
	return "subProcess"
}

const RULE_INDEX = new Map<string, number>(ZEEBE_RULES.map((r, i) => [r.name, i]))
const RULE_META = new Map<string, ZeebeRuleMeta>(ZEEBE_RULES.map((r) => [r.name, r]))

function rank(version: string): number {
	return (CAMUNDA_COMPAT_VERSIONS as readonly string[]).indexOf(version)
}

/**
 * Everything a check needs, built once per validation: the scopes (recursive),
 * every flow node and sequence flow with its scope, the root elements by id,
 * and the document order findings are sorted by.
 */
export class ZeebeContext {
	readonly defs: BpmnDefinitions
	/** The `major.minor` being validated for. */
	readonly version: string
	readonly limits: ZeebeLimits
	readonly resolver: ZeebeResolver | undefined
	readonly scopes: Scope[] = []
	readonly nodes: NodeEntry[] = []
	readonly flows: FlowEntry[] = []
	private readonly nodeIndex = new Map<string, NodeEntry>()
	private readonly flowIndex = new Map<string, FlowEntry>()
	private readonly order = new Map<string, number>()
	private readonly findings: OptimizationFinding[] = []

	constructor(defs: BpmnDefinitions, options: ValidateDeployableOptions = {}) {
		this.defs = defs
		this.version = normalizeCamundaVersion(options.camundaVersion) ?? ZEEBE_LATEST_VERSION
		this.limits = { ...DEFAULT_ZEEBE_LIMITS, ...options.limits }
		this.resolver = options.resolver
		for (const process of defs.processes) {
			this.mark(process.id)
			this.walk({
				kind: "process",
				id: process.id,
				processId: process.id,
				flowElements: process.flowElements,
				sequenceFlows: process.sequenceFlows,
			})
		}
		for (const el of [...defs.messages, ...defs.errors, ...defs.signals, ...defs.escalations])
			this.mark(el.id)
	}

	private mark(id: string): void {
		if (!this.order.has(id)) this.order.set(id, this.order.size)
	}

	private walk(scope: Scope): void {
		this.scopes.push(scope)
		for (const node of scope.flowElements) {
			const entry = { node, scope }
			this.nodes.push(entry)
			if (!this.nodeIndex.has(node.id)) this.nodeIndex.set(node.id, entry)
			this.mark(node.id)
			if (isContainer(node)) {
				this.walk({
					kind: scopeKind(node),
					id: node.id,
					processId: scope.processId,
					container: node,
					parent: scope,
					flowElements: node.flowElements,
					sequenceFlows: node.sequenceFlows,
				})
			}
		}
		for (const flow of scope.sequenceFlows) {
			const entry = { flow, scope }
			this.flows.push(entry)
			if (!this.flowIndex.has(flow.id)) this.flowIndex.set(flow.id, entry)
			this.mark(flow.id)
		}
	}

	/** Whether the rule applies to the version being validated. */
	applies(rule: ZeebeRuleName): boolean {
		const meta = RULE_META.get(rule)
		if (meta === undefined) return false
		const v = rank(this.version)
		if (v < rank(meta.since)) return false
		return meta.until === undefined || v <= rank(meta.until)
	}

	node(id: string | undefined): NodeEntry | undefined {
		return id === undefined ? undefined : this.nodeIndex.get(id)
	}

	flow(id: string | undefined): FlowEntry | undefined {
		return id === undefined ? undefined : this.flowIndex.get(id)
	}

	/** Sequence flows whose `targetRef` is the node, as Zeebe's model computes them. */
	incoming(nodeId: string): FlowEntry[] {
		return this.flows.filter((f) => f.flow.targetRef === nodeId)
	}

	/** Sequence flows whose `sourceRef` is the node. */
	outgoing(nodeId: string): FlowEntry[] {
		return this.flows.filter((f) => f.flow.sourceRef === nodeId)
	}

	/** Boundary events attached to the activity. */
	boundaries(activityId: string): NodeEntry[] {
		return this.nodes.filter(
			(n) => n.node.type === "boundaryEvent" && n.node.attachedToRef === activityId,
		)
	}

	message(id: string | undefined): BpmnMessage | undefined {
		return id === undefined ? undefined : this.defs.messages.find((m) => m.id === localRef(id))
	}

	error(id: string | undefined): BpmnError | undefined {
		return id === undefined ? undefined : this.defs.errors.find((m) => m.id === localRef(id))
	}

	signal(id: string | undefined): BpmnSignal | undefined {
		return id === undefined ? undefined : this.defs.signals.find((m) => m.id === localRef(id))
	}

	escalation(id: string | undefined): BpmnEscalation | undefined {
		return id === undefined ? undefined : this.defs.escalations.find((m) => m.id === localRef(id))
	}

	/** Whether an element name such as `zeebe:taskDefinition` is in the Zeebe namespace. */
	isZeebe(name: string, local: string): boolean {
		const colon = name.indexOf(":")
		if (colon < 0) return false
		if (name.slice(colon + 1) !== local) return false
		const prefix = name.slice(0, colon)
		return (
			(this.defs.namespaces[prefix] ?? (prefix === "zeebe" ? ZEEBE_NS : undefined)) === ZEEBE_NS
		)
	}

	/** The `zeebe:<local>` children of an element's `extensionElements`. */
	zeebe(el: { extensionElements?: XmlElement[] } | undefined, local: string): XmlElement[] {
		return (el?.extensionElements ?? []).filter((x) => this.isZeebe(x.name, local))
	}

	/** The `zeebe:<local>` children of an XML element. */
	zeebeChildren(el: XmlElement | undefined, local: string): XmlElement[] {
		return (el?.children ?? []).filter((x) => this.isZeebe(x.name, local))
	}

	/**
	 * Reports a rule violation. Dropped when the rule does not apply to the
	 * version, so a check never tests the version itself.
	 */
	report(
		rule: ZeebeRuleName,
		elementId: string,
		message: string,
		suggestion: string,
		processId = this.processOf(elementId),
	): void {
		const meta = RULE_META.get(rule)
		if (meta === undefined || !this.applies(rule)) return
		this.findings.push({
			id: `zeebe/${rule}`,
			category: "deploy",
			severity: meta.severity,
			message,
			suggestion,
			processId,
			elementIds: [elementId],
		})
	}

	/** The process an element belongs to; root elements answer the first process. */
	processOf(elementId: string): string {
		const node = this.nodeIndex.get(elementId) ?? this.flowIndex.get(elementId)
		if (node !== undefined) return node.scope.processId
		if (this.defs.processes.some((p) => p.id === elementId)) return elementId
		return this.defs.processes[0]?.id ?? ""
	}

	/** The findings, deduplicated and sorted by rule, then document order, then message. */
	finish(): OptimizationFinding[] {
		const seen = new Set<string>()
		const unique = this.findings.filter((f) => {
			const key = `${f.id}\u0000${f.elementIds.join(",")}\u0000${f.message}`
			if (seen.has(key)) return false
			seen.add(key)
			return true
		})
		const pos = (id: string | undefined) =>
			(id === undefined ? undefined : this.order.get(id)) ?? Number.MAX_SAFE_INTEGER
		return unique.sort(
			(a, b) =>
				(RULE_INDEX.get(a.id.slice(6)) ?? 0) - (RULE_INDEX.get(b.id.slice(6)) ?? 0) ||
				pos(a.elementIds[0]) - pos(b.elementIds[0]) ||
				(a.message < b.message ? -1 : a.message > b.message ? 1 : 0),
		)
	}
}

/**
 * A reference with its QName prefix removed: Zeebe resolves `messageRef="bpmn:m"`
 * to `m`. Ids are NCNames, so they never contain a colon themselves.
 */
export function localRef(ref: string): string {
	const colon = ref.lastIndexOf(":")
	return colon < 0 ? ref : ref.slice(colon + 1)
}

/**
 * Whether a Zeebe expression attribute is an expression rather than a static value:
 * Zeebe's `FeelExpressionLanguage` matches the whole text against `=(.+)`, so a
 * leading space or a lone `=` makes it static.
 */
export function isExpression(text: string): boolean {
	return text.length > 1 && text.startsWith("=")
}

/**
 * The FEEL parse error of an expression attribute, or `undefined` when it parses
 * or is a static value. Only the part after `=` is FEEL.
 */
export function feelError(text: string): string | undefined {
	if (!isExpression(text)) return undefined
	const body = text.slice(1)
	const { errors } = parseExpression(body)
	return errors.length === 0 ? undefined : (errors[0]?.message ?? "invalid FEEL")
}

/**
 * Zeebe's message for a FEEL parse failure, up to the parser's own detail, which
 * differs between feel-scala and @bpmnkit/feel.
 */
export function feelFailure(text: string): string {
	return `failed to parse expression '${text.slice(1)}'`
}

/** Zeebe's message for a static value where an expression is required. */
export function staticValueMessage(text: string): string {
	return `Expected expression but found static value '${text}'. An expression must start with '=' (e.g. '=${text}').`
}

/** An attribute value, or `undefined` when absent or blank (Zeebe's "present and not empty"). */
export function nonEmpty(value: string | undefined): string | undefined {
	return value === undefined || value.trim() === "" ? undefined : value
}
