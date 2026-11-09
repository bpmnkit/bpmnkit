import { type FeelNode, parseExpression } from "@bpmnkit/feel"
import type { XmlElement } from "../../../types/xml-element.js"
import type { BpmnFlowElement } from "../../bpmn-model.js"
import { feelChildren } from "../../camunda-compat-feel.js"
import {
	type NodeEntry,
	type ZeebeCheck,
	type ZeebeContext,
	feelError,
	feelFailure,
	isExpression,
	staticValueMessage,
} from "../context.js"

/**
 * Section F of zeebe-rules.md: job workers (task definitions, headers, scripts,
 * send tasks, job priority, agent definitions), variable mappings and secret
 * references, linked resources.
 */

/** An element whose extension elements Zeebe validates, with the id findings are reported on. */
interface Owner {
	id: string
	extensionElements: XmlElement[]
	/** Absent for a process and a sequence flow. */
	node?: BpmnFlowElement
	isProcess: boolean
}

/** Whether a process is validated: Zeebe skips a non-executable process, contents included. */
function executable(ctx: ZeebeContext, processId: string): boolean {
	return ctx.defs.processes.some((p) => p.id === processId && p.isExecutable === true)
}

/** The flow elements of executable processes. */
function nodes(ctx: ZeebeContext): NodeEntry[] {
	return ctx.nodes.filter((n) => executable(ctx, n.scope.processId))
}

/**
 * Every element that can carry Zeebe extension elements: the processes, every
 * flow element of every scope, and every sequence flow. Zeebe validates a
 * `zeebe:taskDefinition`, `zeebe:input` or `zeebe:taskHeaders` wherever it is,
 * so the job-worker checks cover every element that has one.
 */
function owners(ctx: ZeebeContext): Owner[] {
	const out: Owner[] = []
	for (const p of ctx.defs.processes)
		if (p.isExecutable === true)
			out.push({ id: p.id, extensionElements: p.extensionElements, isProcess: true })
	for (const { node } of nodes(ctx))
		out.push({
			id: node.id,
			extensionElements: node.extensionElements ?? [],
			node,
			isProcess: false,
		})
	for (const { flow, scope } of ctx.flows)
		if (executable(ctx, scope.processId))
			out.push({ id: flow.id, extensionElements: flow.extensionElements, isProcess: false })
	return out
}

/**
 * The value Zeebe's model reads for an attribute: the XML model reads an empty
 * attribute as absent, so `""` counts as missing (but `" "` does not).
 */
function attr(el: XmlElement, name: string): string | undefined {
	const v = el.attributes[name]
	return v === undefined || v === "" ? undefined : v
}

/** What `ExpressionVerification` reports for one attribute, or `undefined`. */
function expressionProblem(
	value: string | undefined,
	opts: { mandatory: boolean; nonStatic: boolean },
): string | undefined {
	if (value === undefined) return opts.mandatory ? "Expected expression but not found." : undefined
	if (feelError(value) !== undefined) return feelFailure(value)
	if (opts.nonStatic && !isExpression(value)) return staticValueMessage(value)
	return undefined
}

const PATH_PATTERN = /^[a-zA-Z_][a-zA-Z0-9_]*(\.[a-zA-Z_][a-zA-Z0-9_]*)*$/
const PATH_PATTERN_TEXT = "[a-zA-Z_][a-zA-Z0-9_]*(\\.[a-zA-Z_][a-zA-Z0-9_]*)*"
const PATH_RESERVED_WORDS = [
	"null",
	"true",
	"false",
	"function",
	"if",
	"then",
	"else",
	"for",
	"between",
	"instance",
	"of",
]

/** `ZeebeExpressionValidator.verifyPath`: both pattern and reserved-word errors can apply. */
function pathProblems(target: string | undefined): string[] {
	if (target === undefined) return ["Expected path expression but not found."]
	const out: string[] = []
	if (!PATH_PATTERN.test(target))
		out.push(
			`Expected path expression '${target}' but doesn't match the pattern '${PATH_PATTERN_TEXT}'.`,
		)
	if (PATH_RESERVED_WORDS.includes(target))
		out.push(
			`Expected path expression '${target}' but is one of the reserved words (${PATH_RESERVED_WORDS.join(", ")}).`,
		)
	return out
}

function duplicateMessage(local: string): string {
	return `Must have exactly one 'zeebe:${local}' extension element when exists. Please check process definition XML and retain only one extension element.`
}

const JOB_WORKER_MODE_MESSAGE =
	"'zeebe:jobPriorityDefinition' is only allowed in job-worker mode ('zeebe:taskDefinition')"

const FLOW_NODE_EXCLUDED = new Set(["dataObject", "dataObjectReference", "dataStoreReference"])

/** Inputs and outputs of an owner's `zeebe:ioMapping` elements. */
function mappings(ctx: ZeebeContext, owner: Owner, local: "input" | "output"): XmlElement[] {
	return ctx.zeebe(owner, "ioMapping").flatMap((m) => ctx.zeebeChildren(m, local))
}

// Z90
const serviceTaskDefinition: ZeebeCheck = (ctx) => {
	for (const { node } of nodes(ctx)) {
		if (node.type !== "serviceTask") continue
		if (ctx.zeebe(node, "taskDefinition").length !== 1)
			ctx.report(
				"service-task-definition",
				node.id,
				"Must have exactly one 'zeebe:taskDefinition' extension element",
				"Add one zeebe:taskDefinition with a job type to the service task.",
			)
	}
}

// Z91, Z92 (retries: an empty value falls back to the default "3", so only a
// value the model reads as absent could fail, which never happens), Z93
const taskDefinitionAttributes: ZeebeCheck = (ctx) => {
	for (const owner of owners(ctx)) {
		for (const td of ctx.zeebe(owner, "taskDefinition")) {
			const type = attr(td, "type")
			if (type === undefined)
				ctx.report(
					"task-definition-type",
					owner.id,
					"Attribute 'type' must be present and not empty",
					"Set the job type on zeebe:taskDefinition.",
				)
			const retries = attr(td, "retries") ?? "3"
			for (const value of [type, retries]) {
				const problem = expressionProblem(value, { mandatory: true, nonStatic: false })
				if (problem !== undefined)
					ctx.report(
						"task-definition-expression",
						owner.id,
						problem,
						"Write the job type and retries as a static value or a valid FEEL expression.",
					)
			}
		}
	}
}

/**
 * The extension elements Zeebe allows at most once per element type
 * (`ExtensionElementDuplicationValidators`), without those of other rules:
 * the process (Z33), user-task specific ones (Z114), `calledDecision` (Z137)
 * and the ad-hoc sub-process (Z165).
 */
function singleExtensions(ctx: ZeebeContext, node: BpmnFlowElement): string[] {
	const out = FLOW_NODE_EXCLUDED.has(node.type) ? [] : ["ioMapping", "executionListeners"]
	// jobPriorityDefinition and agentDefinition only exist from the version their own rules start at
	const priority = ctx.applies("job-priority-value") ? ["jobPriorityDefinition"] : []
	switch (node.type) {
		case "serviceTask":
			out.push(
				"taskHeaders",
				"linkedResources",
				...priority,
				...(ctx.applies("agent-type-required") ? ["agentDefinition"] : []),
			)
			break
		case "sendTask":
			out.push("taskHeaders", "linkedResources", ...priority)
			break
		case "businessRuleTask":
			out.push("taskDefinition", "taskHeaders", ...priority)
			break
		case "scriptTask":
			out.push("script", "taskDefinition", "taskHeaders", ...priority)
			break
		case "endEvent":
		case "intermediateThrowEvent":
			out.push("taskDefinition")
			break
	}
	return out
}

// Z94
const duplicateTaskExtension: ZeebeCheck = (ctx) => {
	for (const { node } of nodes(ctx)) {
		for (const local of singleExtensions(ctx, node)) {
			if (ctx.zeebe(node, local).length > 1)
				ctx.report(
					"duplicate-task-extension",
					node.id,
					duplicateMessage(local),
					`Merge the zeebe:${local} elements into one.`,
				)
		}
	}
}

const RESERVED_HEADER_PREFIX = "io.camunda.zeebe:"

// Z95, Z96
const taskHeaders: ZeebeCheck = (ctx) => {
	for (const owner of owners(ctx)) {
		for (const headers of ctx.zeebe(owner, "taskHeaders")) {
			const keys = ctx.zeebeChildren(headers, "header").map((h) => attr(h, "key"))
			for (const key of keys) {
				if (key?.startsWith(RESERVED_HEADER_PREFIX))
					ctx.report(
						"header-reserved-key",
						owner.id,
						`Attribute 'key' contains '${key}', but header keys starting with '${RESERVED_HEADER_PREFIX}' are reserved for internal use.`,
						`Rename the header so it does not start with '${RESERVED_HEADER_PREFIX}'.`,
					)
			}
			// a missing key is Java's null: distinct from the text "null", but printed the same
			const seen: (string | undefined)[] = []
			const reported: (string | undefined)[] = []
			for (const key of keys) {
				if (!seen.includes(key)) {
					seen.push(key)
					continue
				}
				if (reported.includes(key)) continue
				reported.push(key)
				ctx.report(
					"duplicate-header-key",
					owner.id,
					`Headers contain duplicate entries for key '${key ?? "null"}'`,
					"Give every task header a distinct key.",
				)
			}
		}
	}
}

// Z98
const scriptTaskImplementation: ZeebeCheck = (ctx) => {
	for (const { node } of nodes(ctx)) {
		if (node.type !== "scriptTask") continue
		const scripts = ctx.zeebe(node, "script").length
		const definitions = ctx.zeebe(node, "taskDefinition").length
		if (!((scripts === 1 && definitions === 0) || (scripts === 0 && definitions === 1)))
			ctx.report(
				"script-task-implementation",
				node.id,
				"Must have either one 'zeebe:script' or one 'zeebe:taskDefinition' extension element",
				"Give the script task one zeebe:script or one zeebe:taskDefinition.",
			)
	}
}

// Z99, Z100
const scripts: ZeebeCheck = (ctx) => {
	for (const owner of owners(ctx)) {
		for (const script of ctx.zeebe(owner, "script")) {
			const expression = attr(script, "expression")
			for (const name of ["expression", "resultVariable"]) {
				if (attr(script, name) === undefined)
					ctx.report(
						"script-attributes",
						owner.id,
						`Attribute '${name}' must be present and not empty`,
						`Set ${name} on zeebe:script.`,
					)
			}
			const problem = expressionProblem(expression, { mandatory: true, nonStatic: true })
			if (problem !== undefined)
				ctx.report(
					"script-expression",
					owner.id,
					problem,
					"Write the script as a valid FEEL expression starting with '='.",
				)
		}
	}
}

// Z101
const jobPriorityMode: ZeebeCheck = (ctx) => {
	for (const { node } of nodes(ctx)) {
		if (node.type !== "scriptTask" && node.type !== "businessRuleTask" && node.type !== "sendTask")
			continue
		if (
			ctx.zeebe(node, "jobPriorityDefinition").length > 0 &&
			ctx.zeebe(node, "taskDefinition").length === 0
		)
			ctx.report(
				"job-priority-mode",
				node.id,
				JOB_WORKER_MODE_MESSAGE,
				"Remove zeebe:jobPriorityDefinition, or implement the task as a job worker.",
			)
	}
}

/** Java's `Integer.parseInt`: an optional sign, ASCII digits, within 32 bits. */
function isJavaInt(text: string): boolean {
	if (!/^[+-]?[0-9]+$/.test(text)) return false
	const n = Number(text)
	return n >= -2147483648 && n <= 2147483647
}

// Z102 (an absent or empty priority falls back to the model's default, so only the format can fail)
const jobPriorityValue: ZeebeCheck = (ctx) => {
	for (const owner of owners(ctx)) {
		for (const def of ctx.zeebe(owner, "jobPriorityDefinition")) {
			const priority = attr(def, "priority")
			if (priority === undefined || priority.startsWith("=") || isJavaInt(priority)) continue
			ctx.report(
				"job-priority-value",
				owner.id,
				`Expected 'priority' to be a literal integer or a FEEL expression (starting with '='), but got '${priority}'.`,
				"Write the priority as an integer or a FEEL expression starting with '='.",
			)
		}
	}
}

// Z103, Z104
const sendTasks: ZeebeCheck = (ctx) => {
	for (const { node } of nodes(ctx)) {
		if (node.type !== "sendTask") continue
		const publish = ctx.zeebe(node, "publishMessage").length
		const definitions = ctx.zeebe(node, "taskDefinition").length
		if (!((publish === 1 && definitions === 0) || (publish === 0 && definitions === 1)))
			ctx.report(
				"send-task-implementation",
				node.id,
				"Must have either one 'zeebe:publishMessage' or one 'zeebe:taskDefinition' extension element",
				"Give the send task one zeebe:taskDefinition (or one zeebe:publishMessage).",
			)
		if (publish > 0 && ctx.message(node.messageRef) === undefined)
			ctx.report(
				"send-task-message",
				node.id,
				"Must reference a message",
				"Set messageRef to a message defined in the file.",
			)
	}
}

// Z105
const inputMappings: ZeebeCheck = (ctx) => {
	for (const owner of owners(ctx)) {
		for (const input of mappings(ctx, owner, "input")) {
			const problems = [
				expressionProblem(attr(input, "source"), { mandatory: false, nonStatic: false }),
				...pathProblems(attr(input, "target")),
			]
			for (const problem of problems) {
				if (problem !== undefined)
					ctx.report(
						"input-mapping",
						owner.id,
						problem,
						"Use a valid FEEL source and a variable name or dotted path as target.",
					)
			}
		}
	}
}

// Z106
const outputMappings: ZeebeCheck = (ctx) => {
	for (const owner of owners(ctx)) {
		for (const output of mappings(ctx, owner, "output")) {
			const problems = [
				expressionProblem(attr(output, "source"), { mandatory: true, nonStatic: true }),
				...pathProblems(attr(output, "target")),
			]
			for (const problem of problems) {
				if (problem !== undefined)
					ctx.report(
						"output-mapping",
						owner.id,
						problem,
						"Use a FEEL expression starting with '=' as source and a variable name or dotted path as target.",
					)
			}
		}
	}
}

/** `SecretReference.REFERENCE_PATTERN` (Java's `\p{Alnum}` is ASCII). */
const SECRET_REFERENCE = /camunda\.secrets\.[A-Za-z0-9_-]+/g
/** One whole double-quoted FEEL string literal, escapes included. */
const STRING_LITERAL = /"[^"\\]*(?:\\.[^"\\]*)*"/g

/** Zeebe parses the source; an invalid expression is reported by the expression rules instead. */
function parses(source: string): boolean {
	return feelError(source) === undefined
}

/** `SecretReferenceLiteralValidator`: the references written as literal text, in order, once each. */
function literalSecretReferences(source: string): string[] {
	const text = isExpression(source)
		? (source.slice(1).match(STRING_LITERAL) ?? []).join("\n")
		: source
	const out: string[] = []
	for (const m of text.match(SECRET_REFERENCE) ?? []) if (!out.includes(m)) out.push(m)
	return out
}

// Z107
const secretLiteral: ZeebeCheck = (ctx) => {
	const check = (owner: Owner, source: string | undefined, location: string) => {
		if (source === undefined || !parses(source)) return
		const refs = literalSecretReferences(source)
		if (refs.length === 0) return
		ctx.report(
			"secret-literal",
			owner.id,
			`Secret reference(s) ${refs.map((r) => `'${r}'`).join(", ")} must be used as an expression (e.g. '=camunda.secrets.<name>'), not as a string literal, in ${location} '${source}'.`,
			"Write the secret reference as a FEEL expression, outside quotes.",
		)
	}
	for (const owner of owners(ctx)) {
		for (const input of mappings(ctx, owner, "input"))
			check(owner, attr(input, "source"), "input mapping source")
		for (const props of ctx.zeebe(owner, "properties"))
			for (const prop of ctx.zeebeChildren(props, "property"))
				check(owner, attr(prop, "value"), "property value")
	}
}

/** `camunda.secrets.<name>` exactly: feel-scala's three-segment qualified name. */
function isSecretPath(node: FeelNode): boolean {
	return (
		node.kind === "path" &&
		node.base.kind === "path" &&
		node.base.key === "secrets" &&
		node.base.base.kind === "name" &&
		node.base.base.name === "camunda"
	)
}

/** Whether a secret reference is anywhere below the node; a longer path is not one. */
function containsSecret(node: FeelNode, isPathBase = false): boolean {
	if (!isPathBase && isSecretPath(node)) return true
	return feelChildren(node).some((child) =>
		containsSecret(child, node.kind === "path" && child === node.base),
	)
}

/** `SecretReference.containsReferenceInsideContainerLiteral`. */
function insideContainer(node: FeelNode): boolean {
	if (node.kind === "list" || node.kind === "context") return containsSecret(node)
	if (node.kind === "if") return insideContainer(node.then) || insideContainer(node.else)
	return false
}

/** `SecretReference.isImprecise`: a root context is descended entry by entry. */
function isImprecise(node: FeelNode): boolean {
	if (node.kind === "context") return node.entries.some((e) => isImprecise(e.value))
	return insideContainer(node)
}

// Z108
const secretInList: ZeebeCheck = (ctx) => {
	for (const owner of owners(ctx)) {
		for (const input of mappings(ctx, owner, "input")) {
			const source = attr(input, "source")
			if (source === undefined || !isExpression(source) || !parses(source)) continue
			const { ast } = parseExpression(source.slice(1))
			if (ast === null || !isImprecise(ast)) continue
			ctx.report(
				"secret-in-list",
				owner.id,
				`Input mapping source '${source}' puts a secret reference inside a list, or inside a context built by an 'if' branch. Camunda can only replace a secret where the mapping assigns it directly to a value, so this secret would never be filled in. Assign each secret reference to its own input mapping instead.`,
				"Map each secret reference to its own input variable.",
			)
		}
	}
}

const BINDING_TYPES = ["latest", "deployment", "versionTag"]

function linkedResources(ctx: ZeebeContext, owner: Owner): XmlElement[] {
	return ctx.zeebe(owner, "linkedResources").flatMap((r) => ctx.zeebeChildren(r, "linkedResource"))
}

// Z110
const linkedResourceAttributes: ZeebeCheck = (ctx) => {
	for (const owner of owners(ctx)) {
		for (const res of linkedResources(ctx, owner)) {
			const binding = attr(res, "bindingType")
			if (binding !== undefined && !BINDING_TYPES.includes(binding)) {
				// the model throws reading an unknown enum value, before any validator reports
				ctx.report(
					"linked-resource-attributes",
					owner.id,
					`No enum constant io.camunda.zeebe.model.bpmn.instance.zeebe.ZeebeBindingType.${binding}`,
					`Set bindingType to one of: ${BINDING_TYPES.join(", ")}.`,
				)
				continue
			}
			for (const name of ["resourceId", "resourceType"]) {
				if (attr(res, name) === undefined)
					ctx.report(
						"linked-resource-attributes",
						owner.id,
						`Attribute '${name}' must be present and not empty`,
						`Set ${name} on zeebe:linkedResource.`,
					)
			}
		}
	}
}

// Z111: Zeebe looks only at the process's direct flow elements, and at their first zeebe:linkedResources
const linkedResourceDeployment: ZeebeCheck = (ctx) => {
	const resolver = ctx.resolver
	if (resolver === undefined) return
	for (const { node, scope } of nodes(ctx)) {
		if (scope.kind !== "process") continue
		const first = ctx.zeebe(node, "linkedResources")[0]
		for (const res of ctx.zeebeChildren(first, "linkedResource")) {
			const id = attr(res, "resourceId")
			if (attr(res, "bindingType") !== "deployment" || id === undefined || id.startsWith("="))
				continue
			if (id.trim() === "") continue
			const isForm = (attr(res, "resourceType") ?? "").toLowerCase() === "form"
			const found = isForm ? resolver.hasForm?.(id) : resolver.hasResource?.(id)
			if (found !== false) continue
			ctx.report(
				"linked-resource-deployment",
				node.id,
				`Expected to find ${isForm ? "form" : "resource"} with id '${id}' in current deployment, but not found.`,
				`Deploy the ${isForm ? "form" : "resource"} '${id}' together with the process, or bind it by 'latest'.`,
			)
		}
	}
}

const AGENT_TYPES = ["aiAgentSubProcess", "aiAgentTask", "external"]

// Z112 (an unknown value makes the model throw while reading it), Z113
const agentDefinitions: ZeebeCheck = (ctx) => {
	for (const owner of owners(ctx)) {
		const defs = ctx.zeebe(owner, "agentDefinition")
		for (const def of defs) {
			const type = attr(def, "agentType")
			if (type === undefined)
				ctx.report(
					"agent-type-required",
					owner.id,
					"Attribute 'agentType' must be present and not empty",
					`Set agentType on zeebe:agentDefinition to one of: ${AGENT_TYPES.join(", ")}.`,
				)
			else if (!AGENT_TYPES.includes(type))
				ctx.report(
					"agent-type-required",
					owner.id,
					`No enum constant io.camunda.zeebe.model.bpmn.instance.zeebe.ZeebeAgentType.${type}`,
					`Set agentType to one of: ${AGENT_TYPES.join(", ")}.`,
				)
		}
		// AgentDefinitionValidator applies to flow elements, and only to the first definition
		if (owner.isProcess) continue
		const type = defs[0] === undefined ? undefined : attr(defs[0], "agentType")
		const kind = owner.node?.type
		const message =
			type === "aiAgentSubProcess" && kind !== "adHocSubProcess"
				? "agentType 'aiAgentSubProcess' is only allowed on an ad-hoc sub-process."
				: type === "aiAgentTask" && kind !== "serviceTask"
					? "agentType 'aiAgentTask' is only allowed on a service task."
					: type === "external" && kind !== "serviceTask" && kind !== "adHocSubProcess"
						? "agentType 'external' is only allowed on a service task or an ad-hoc sub-process."
						: undefined
		if (message !== undefined)
			ctx.report(
				"agent-type-placement",
				owner.id,
				message,
				"Use the agent type that matches the element, or move the agent definition.",
			)
	}
}

/** Checks for zeebe-rules.md section F (see index.ts), in spec order. */
export const checks: ZeebeCheck[] = [
	serviceTaskDefinition,
	taskDefinitionAttributes,
	duplicateTaskExtension,
	taskHeaders,
	scriptTaskImplementation,
	scripts,
	jobPriorityMode,
	jobPriorityValue,
	sendTasks,
	inputMappings,
	outputMappings,
	secretLiteral,
	secretInList,
	linkedResourceAttributes,
	linkedResourceDeployment,
	agentDefinitions,
]
