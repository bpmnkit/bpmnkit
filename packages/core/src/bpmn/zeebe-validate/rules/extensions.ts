import type { XmlElement } from "../../../types/xml-element.js"
import type { BpmnFlowElement } from "../../bpmn-model.js"
import {
	type ZeebeCheck,
	type ZeebeContext,
	feelError,
	feelFailure,
	isExpression,
} from "../context.js"

/**
 * Checks for zeebe-rules.md sections G (user tasks), H (call activity),
 * I (business rule task), M (generic FEEL), N (listeners) and O (deployment).
 *
 * Zeebe reads an attribute set to "" as absent, so `attr` does too.
 */

/** An attribute value; "" counts as absent because Zeebe's model reads it as null. */
function attr(el: XmlElement, name: string): string | undefined {
	const value = el.attributes[name]
	return value === undefined || value === "" ? undefined : value
}

const isBlank = (value: string | undefined): boolean => value === undefined || value.trim() === ""

type Extensible = { extensionElements?: XmlElement[] }

/** The BPMN element name Zeebe's model reports for a flow element (its `getTypeName()`). */
function typeName(node: BpmnFlowElement): string {
	return node.type === "eventSubProcess" ? "subProcess" : node.type
}

interface Owner {
	id: string
	typeName: string
	holder: Extensible
}

/** Everything that can carry `extensionElements` with listeners: the processes, flow nodes and flows. */
function owners(ctx: ZeebeContext): Owner[] {
	const out: Owner[] = ctx.defs.processes.map((p) => ({ id: p.id, typeName: "process", holder: p }))
	for (const { node } of ctx.nodes)
		out.push({ id: node.id, typeName: typeName(node), holder: node })
	for (const { flow } of ctx.flows)
		out.push({ id: flow.id, typeName: "sequenceFlow", holder: flow })
	return out
}

function nodeOwners(ctx: ZeebeContext): Owner[] {
	return owners(ctx).filter((o) => o.typeName !== "process" && o.typeName !== "sequenceFlow")
}

/** The static priority/number text Java's `new BigDecimal(text)` accepts. */
const DECIMAL = /^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/

/** Zeebe's static-number test: a decimal with no fraction. */
function isStaticInteger(text: string): boolean {
	return DECIMAL.test(text) && Number(text) % 1 === 0
}

const ZONED =
	/^(\d{4}|[+-]\d{5,10})-(\d{2})-(\d{2})[Tt](\d{2}):(\d{2})(?::(\d{2})(?:\.\d{1,9})?)?([Zz]|[+-]\d{2}:\d{2}(?::\d{2})?)(\[[^\]\s]+\])?$/

/** `ZonedDateTime.parse`: an ISO date-time with an offset, e.g. `2023-03-02T15:35+02:00`. */
function isZonedDateTime(text: string): boolean {
	const m = ZONED.exec(text)
	if (m === null) return false
	const year = Number(m[1])
	const month = Number(m[2])
	const day = Number(m[3])
	const hour = Number(m[4])
	const minute = Number(m[5])
	const second = m[6] === undefined ? 0 : Number(m[6])
	const leap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
	const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1]
	if (days === undefined || day < 1 || day > days) return false
	if (hour > 24 || minute > 59 || second > 60) return false
	if (hour === 24 && (minute !== 0 || second !== 0)) return false
	const offset = /^[+-](\d{2}):(\d{2})/.exec(m[7] ?? "")
	return offset === null || (Number(offset[1]) <= 18 && Number(offset[2]) <= 59)
}

/** Zeebe's `parseListOfCsv`: no blank entry between commas (Java's split drops trailing empties). */
function isListOfCsv(text: string): boolean {
	if (text === "") return true
	const parts = text.split(",")
	while (parts.length > 0 && parts[parts.length - 1] === "") parts.pop()
	const values = parts.filter((p) => p.trim() !== "").length
	return values >= text.split(",").length
}

const DUPLICATE =
	"Must have exactly one 'zeebe:%s' extension element when exists. Please check process definition XML and retain only one extension element."

const dupMessage = (name: string): string => DUPLICATE.replace("%s", name)

const USER_TASK_SINGLES = [
	"userTask",
	"assignmentDefinition",
	"formDefinition",
	"taskHeaders",
	"taskSchedule",
	"priorityDefinition",
	"taskListeners",
]

/** Z114 */
const duplicateUserTaskExtension: ZeebeCheck = (ctx) => {
	for (const { node } of ctx.nodes) {
		if (node.type !== "userTask") continue
		for (const name of USER_TASK_SINGLES) {
			if (ctx.zeebe(node, name).length > 1)
				ctx.report(
					"duplicate-user-task-extension",
					node.id,
					dupMessage(name),
					`Keep a single zeebe:${name} element on the user task.`,
				)
		}
	}
}

/** Z115, Z116, Z117: every zeebe:formDefinition. */
const formDefinition: ZeebeCheck = (ctx) => {
	for (const { id, holder } of nodeOwners(ctx)) {
		const native = ctx.zeebe(holder, "userTask").length > 0
		for (const form of ctx.zeebe(holder, "formDefinition")) {
			const formId = attr(form, "formId")
			if (native) {
				if (isBlank(attr(form, "externalReference")) === isBlank(formId))
					ctx.report(
						"form-definition-native",
						id,
						"Exactly one of the attributes 'formId, externalReference' must be present and not blank for native user tasks",
						"Set either formId or externalReference on the form definition, not both.",
					)
			} else if (isBlank(attr(form, "formKey")) === isBlank(formId)) {
				ctx.report(
					"form-definition-job-worker",
					id,
					"Exactly one of the attributes 'formId, formKey' must be present and not blank",
					"Set either formId or formKey on the form definition, not both.",
				)
			}
			bindingType(ctx, form, id, "form-binding-type")
		}
	}
}

const BINDING_TYPES = ["deployment", "latest", "versionTag"]

/** The binding-type rules shared by calledElement, calledDecision and formDefinition (Z117, Z129, Z135). */
function bindingType(
	ctx: ZeebeContext,
	el: XmlElement,
	id: string,
	rule: "form-binding-type" | "called-element-binding-type" | "called-decision-binding-type",
): void {
	const type = attr(el, "bindingType")
	const versionTag = attr(el, "versionTag")
	if (type !== undefined && !BINDING_TYPES.includes(type))
		ctx.report(
			rule,
			id,
			"Attribute 'bindingType' must be one of: deployment, latest, versionTag",
			"Use bindingType deployment, latest or versionTag.",
		)
	if (type === "versionTag" && isBlank(versionTag))
		ctx.report(
			rule,
			id,
			"Attribute 'versionTag' must be present and not empty if 'bindingType' is 'versionTag'",
			"Set versionTag, or use another bindingType.",
		)
	else if (type !== "versionTag" && !isBlank(versionTag))
		ctx.report(
			rule,
			id,
			"Attribute 'versionTag' may only be used if 'bindingType' is 'versionTag'",
			"Remove versionTag, or set bindingType to versionTag.",
		)
}

/** The top-level flow nodes of executable processes: all Zeebe's deployment-binding validators visit. */
function topLevel(ctx: ZeebeContext, type: BpmnFlowElement["type"]): BpmnFlowElement[] {
	const executable = new Set(
		ctx.defs.processes.filter((p) => p.isExecutable === true).map((p) => p.id),
	)
	return ctx.nodes
		.filter((n) => n.scope.kind === "process" && executable.has(n.scope.id) && n.node.type === type)
		.map((n) => n.node)
}

/** Z118: bindingType=deployment needs the form in the deployment. */
const formDeployment: ZeebeCheck = (ctx) => {
	const has = ctx.resolver?.hasForm
	if (has === undefined) return
	for (const node of topLevel(ctx, "userTask")) {
		const form = ctx.zeebe(node, "formDefinition")[0]
		const formId = form === undefined ? undefined : attr(form, "formId")
		if (form === undefined || formId === undefined || attr(form, "bindingType") !== "deployment")
			continue
		if (formId.startsWith("=") || has(formId)) continue
		ctx.report(
			"form-deployment",
			node.id,
			`Expected to find form with id '${formId}' in current deployment, but not found.`,
			"Deploy the form together with the process, or use another bindingType.",
		)
	}
}

/** Z119: the embedded form. */
const embeddedForm: ZeebeCheck = (ctx) => {
	for (const { id, holder } of nodeOwners(ctx)) {
		for (const form of ctx.zeebe(holder, "userTaskForm")) {
			if (attr(form, "id") === undefined)
				ctx.report(
					"embedded-form",
					id,
					"Element id must be present and not empty.",
					"Give the embedded form an id.",
				)
			if ((form.text ?? "").trim() === "")
				ctx.report(
					"embedded-form",
					id,
					"User task form text content has to be present and not empty",
					"Add the form schema as the content of the userTaskForm element.",
				)
		}
	}
}

/** Z120, Z121, Z122 and the FEEL parse of their attributes (Z167). */
const userTaskExpressions: ZeebeCheck = (ctx) => {
	for (const { node } of ctx.nodes) {
		if (node.type !== "userTask") continue
		const parse = (value: string | undefined) => {
			if (value === undefined) return
			if (feelError(value) !== undefined)
				ctx.report(
					"feel-parse",
					node.id,
					feelFailure(value),
					"Fix the FEEL expression, or remove the leading '=' for a static value.",
				)
		}
		for (const assignment of ctx.zeebe(node, "assignmentDefinition")) {
			parse(attr(assignment, "assignee"))
			for (const name of ["candidateGroups", "candidateUsers"]) {
				const value = attr(assignment, name)
				parse(value)
				if (value !== undefined && !isExpression(value) && !isListOfCsv(value))
					ctx.report(
						"assignment-expression",
						node.id,
						`Expected static value to be a list of comma-separated values, e.g. 'a,b,c', but found '${value}'.`,
						`Write ${name} as comma-separated values without empty entries, or as a FEEL expression.`,
					)
			}
		}
		for (const schedule of ctx.zeebe(node, "taskSchedule")) {
			for (const name of ["dueDate", "followUpDate"]) {
				const value = attr(schedule, name)
				parse(value)
				if (value !== undefined && !isExpression(value) && !isZonedDateTime(value))
					ctx.report(
						"task-schedule-date",
						node.id,
						`Expected static value to be a valid DateTime String, e.g. '2023-03-02T15:35+02:00', but found '${value}'.`,
						`Write ${name} as an ISO 8601 date-time with an offset, or as a FEEL expression.`,
					)
			}
		}
		for (const definition of ctx.zeebe(node, "priorityDefinition")) {
			// An absent priority defaults to 50 in Zeebe's model, so it is never missing.
			const value = attr(definition, "priority")
			parse(value)
			if (value === undefined || isExpression(value)) continue
			if (!isStaticInteger(value))
				ctx.report(
					"user-task-priority",
					node.id,
					`Expected static value to be a valid Number between 0 and 100, but found '${value}'.`,
					"Set the priority to a whole number from 0 to 100, or a FEEL expression.",
				)
			else if (/^[+-]?\d+$/.test(value)) {
				const n = Number(value)
				if (Math.abs(n) <= 2147483647 && (n < 0 || n > 100))
					ctx.report(
						"user-task-priority",
						node.id,
						`Priority must be a number between 0 and 100, but was '${value}'.`,
						"Set the priority to a whole number from 0 to 100.",
					)
			}
		}
	}
}

const TASK_LISTENER_EVENTS = [
	"create",
	"assignment",
	"update",
	"complete",
	"cancel",
	"creating",
	"assigning",
	"updating",
	"completing",
	"canceling",
]

/** Z123, Z124: task listeners. */
const taskListeners: ZeebeCheck = (ctx) => {
	for (const { id, holder } of nodeOwners(ctx)) {
		const native = ctx.zeebe(holder, "userTask").length > 0
		for (const listeners of ctx.zeebe(holder, "taskListeners")) {
			const children = ctx.zeebeChildren(listeners, "taskListener")
			if (children.length > 0 && !native)
				ctx.report(
					"task-listener-placement",
					id,
					"Task listeners are only allowed on Camunda user tasks.",
					"Add zeebe:userTask to the user task, or remove the task listeners.",
				)
			for (const listener of children) {
				const eventType = attr(listener, "eventType")
				if (eventType === undefined)
					ctx.report(
						"task-listener-attributes",
						id,
						"Attribute 'eventType' must be present and not empty",
						"Set eventType on the task listener.",
					)
				else if (!TASK_LISTENER_EVENTS.includes(eventType))
					ctx.report(
						"task-listener-attributes",
						id,
						`No enum constant io.camunda.zeebe.model.bpmn.instance.zeebe.ZeebeTaskListenerEventType.${eventType}`,
						"Use a task listener event type such as creating, assigning or completing.",
					)
				if (attr(listener, "type") === undefined)
					ctx.report(
						"task-listener-attributes",
						id,
						"Attribute 'type' must be present and not empty",
						"Set type on the task listener.",
					)
			}
		}
	}
}

/** Z125, Z126, Z127: call activity and its calledElement. */
const calledElement: ZeebeCheck = (ctx) => {
	for (const { node } of ctx.nodes) {
		if (node.type !== "callActivity") continue
		const elements = ctx.zeebe(node, "calledElement")
		if (elements.length !== 1)
			ctx.report(
				"call-activity-called-element",
				node.id,
				"Must have exactly one 'zeebe:calledElement' extension element",
				"Add a single zeebe:calledElement with the called process id.",
			)
		for (const el of elements) {
			const processId = attr(el, "processId")
			if (processId === undefined) {
				ctx.report(
					"called-element-process-id",
					node.id,
					"Attribute 'processId' must be present and not empty",
					"Set processId on the zeebe:calledElement.",
				)
				ctx.report(
					"called-element-expression",
					node.id,
					"Expected expression but not found.",
					"Set processId on the zeebe:calledElement.",
				)
			} else if (feelError(processId) !== undefined)
				ctx.report(
					"called-element-expression",
					node.id,
					feelFailure(processId),
					"Fix the FEEL expression in processId, or remove the leading '='.",
				)
			// businessId arrived after 8.9.28, whose model does not know the attribute; the rule is
			// read from the spec (EngineConfiguration / BusinessIdValidator), not confirmed by ZCheck.
			const businessId = attr(el, "businessId")
			if (businessId !== undefined) {
				if (feelError(businessId) !== undefined)
					ctx.report(
						"called-element-business-id",
						node.id,
						feelFailure(businessId),
						"Fix the FEEL expression in businessId, or remove the leading '='.",
					)
				else if (!isExpression(businessId) && businessId.length > 256)
					ctx.report(
						"called-element-business-id",
						node.id,
						`Expected static value to be no longer than 256 characters, but found '${businessId}'.`,
						"Shorten businessId to at most 256 characters.",
					)
			}
			bindingType(ctx, el, node.id, "called-element-binding-type")
		}
	}
}

/** Z130: bindingType=deployment needs the called process in the deployment. */
const calledElementDeployment: ZeebeCheck = (ctx) => {
	const has = ctx.resolver?.hasProcess
	if (has === undefined) return
	const own = new Set(ctx.defs.processes.filter((p) => p.isExecutable === true).map((p) => p.id))
	for (const node of topLevel(ctx, "callActivity")) {
		const el = ctx.zeebe(node, "calledElement")[0]
		const processId = el === undefined ? undefined : attr(el, "processId")
		if (el === undefined || processId === undefined || attr(el, "bindingType") !== "deployment")
			continue
		if (processId.startsWith("=") || own.has(processId) || has(processId)) continue
		ctx.report(
			"called-element-deployment",
			node.id,
			`Expected to find process with id '${processId}' in current deployment, but not found.`,
			"Deploy the called process together with this one, or use another bindingType.",
		)
	}
}

/** Z132, Z133, Z134, Z135, Z137: business rule task. */
const businessRuleTask: ZeebeCheck = (ctx) => {
	for (const { node } of ctx.nodes) {
		if (node.type !== "businessRuleTask") continue
		const decisions = ctx.zeebe(node, "calledDecision")
		const definitions = ctx.zeebe(node, "taskDefinition")
		if (
			!(
				(decisions.length === 1 && definitions.length === 0) ||
				(decisions.length === 0 && definitions.length === 1)
			)
		)
			ctx.report(
				"business-rule-task-implementation",
				node.id,
				"Must have either one 'zeebe:calledDecision' or one 'zeebe:taskDefinition' extension element",
				"Give the task one zeebe:calledDecision or one zeebe:taskDefinition, not both.",
			)
		if (decisions.length > 1)
			ctx.report(
				"duplicate-called-decision",
				node.id,
				dupMessage("calledDecision"),
				"Keep a single zeebe:calledDecision element on the task.",
			)
		for (const el of decisions) {
			const decisionId = attr(el, "decisionId")
			if (decisionId === undefined) {
				ctx.report(
					"called-decision-attributes",
					node.id,
					"Attribute 'decisionId' must be present and not empty",
					"Set decisionId on the zeebe:calledDecision.",
				)
				ctx.report(
					"called-decision-expression",
					node.id,
					"Expected expression but not found.",
					"Set decisionId on the zeebe:calledDecision.",
				)
			} else if (feelError(decisionId) !== undefined)
				ctx.report(
					"called-decision-expression",
					node.id,
					feelFailure(decisionId),
					"Fix the FEEL expression in decisionId, or remove the leading '='.",
				)
			if (attr(el, "resultVariable") === undefined)
				ctx.report(
					"called-decision-attributes",
					node.id,
					"Attribute 'resultVariable' must be present and not empty",
					"Set resultVariable on the zeebe:calledDecision.",
				)
			bindingType(ctx, el, node.id, "called-decision-binding-type")
		}
	}
}

/** Z136: bindingType=deployment needs the decision in the deployment. */
const calledDecisionDeployment: ZeebeCheck = (ctx) => {
	const has = ctx.resolver?.hasDecision
	if (has === undefined) return
	for (const node of topLevel(ctx, "businessRuleTask")) {
		const el = ctx.zeebe(node, "calledDecision")[0]
		const decisionId = el === undefined ? undefined : attr(el, "decisionId")
		if (el === undefined || decisionId === undefined || attr(el, "bindingType") !== "deployment")
			continue
		if (decisionId.startsWith("=") || has(decisionId)) continue
		ctx.report(
			"called-decision-deployment",
			node.id,
			`Expected to find decision with id '${decisionId}' in current deployment, but not found.`,
			"Deploy the decision together with the process, or use another bindingType.",
		)
	}
}

const EXECUTION_LISTENER_ELEMENTS = [
	"process",
	"subProcess",
	"callActivity",
	"adHocSubProcess",
	"task",
	"sendTask",
	"serviceTask",
	"scriptTask",
	"userTask",
	"receiveTask",
	"businessRuleTask",
	"manualTask",
	"startEvent",
	"intermediateThrowEvent",
	"intermediateCatchEvent",
	"boundaryEvent",
	"endEvent",
	"exclusiveGateway",
	"inclusiveGateway",
	"parallelGateway",
	"eventBasedGateway",
]

/** Z175, Z177, Z178, Z179: execution listeners. */
const executionListeners: ZeebeCheck = (ctx) => {
	// 'cancel' and 'beforeAll' only became event types together with their placement rules.
	const cancelKnown = ctx.applies("cancel-listener-placement")
	const beforeAllKnown = ctx.applies("before-all-listener")
	for (const { id, typeName: type, holder } of owners(ctx)) {
		for (const listeners of ctx.zeebe(holder, "executionListeners")) {
			const children = ctx.zeebeChildren(listeners, "executionListener")
			for (const listener of children) {
				const eventType = attr(listener, "eventType")
				if (eventType === undefined)
					ctx.report(
						"execution-listener-attributes",
						id,
						"Attribute 'eventType' must be present and not empty",
						"Set eventType on the execution listener.",
					)
				else if (
					eventType !== "start" &&
					eventType !== "end" &&
					!(cancelKnown && eventType === "cancel") &&
					!(beforeAllKnown && eventType === "beforeAll")
				)
					ctx.report(
						"execution-listener-attributes",
						id,
						`No enum constant io.camunda.zeebe.model.bpmn.instance.zeebe.ZeebeExecutionListenerEventType.${eventType}`,
						"Use the execution listener event type start or end.",
					)
				if (attr(listener, "type") === undefined)
					ctx.report(
						"execution-listener-attributes",
						id,
						"Attribute 'type' must be present and not empty",
						"Set type on the execution listener.",
					)
			}
			if (children.length === 0) continue
			if (!EXECUTION_LISTENER_ELEMENTS.includes(type)) {
				ctx.report(
					"execution-listener-placement",
					id,
					`Execution listeners are not supported for the '${type}' element. Currently, only [${EXECUTION_LISTENER_ELEMENTS.join(", ")}] elements can have execution listeners.`,
					"Move the execution listeners to a supported element or remove them.",
				)
				continue
			}
			for (const listener of children) {
				if (attr(listener, "eventType") === "cancel" && type !== "process")
					ctx.report(
						"cancel-listener-placement",
						id,
						`The 'cancel' execution listener event type is not supported for the '${type}' element. The 'cancel' event type is only supported on the 'process' element.`,
						"Use the cancel event type on the process only.",
					)
			}
			const groups = new Map<string, { eventType: string; type: string; count: number }>()
			for (const listener of children) {
				const eventType = attr(listener, "eventType") ?? "null"
				const listenerType = attr(listener, "type") ?? "null"
				const key = `${eventType}|${listenerType}`
				const group = groups.get(key)
				if (group === undefined) groups.set(key, { eventType, type: listenerType, count: 1 })
				else group.count += 1
			}
			for (const group of groups.values()) {
				if (group.count > 1)
					ctx.report(
						"duplicate-execution-listener",
						id,
						`Found '${group.count}' duplicates based on eventType[${group.eventType}] and type[${group.type}], these combinations should be unique.`,
						"Remove the repeated execution listeners.",
					)
			}
		}
	}
}

/** Z183: a process id another resource of the deployment already defines. */
const duplicateProcessId: ZeebeCheck = (ctx) => {
	const has = ctx.resolver?.hasProcess
	if (has === undefined) return
	for (const process of ctx.defs.processes) {
		if (has(process.id))
			ctx.report(
				"duplicate-process-id",
				process.id,
				`Duplicated process id in resources, '${process.id}' is also defined in another resource of the deployment`,
				"Give each process in the deployment its own id.",
			)
	}
}

/** Checks for zeebe-rules.md sections (see index.ts). */
export const checks: ZeebeCheck[] = [
	duplicateUserTaskExtension,
	formDefinition,
	formDeployment,
	embeddedForm,
	userTaskExpressions,
	taskListeners,
	calledElement,
	calledElementDeployment,
	businessRuleTask,
	calledDecisionDeployment,
	executionListeners,
	duplicateProcessId,
]
