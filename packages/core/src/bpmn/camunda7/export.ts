import type { XmlElement } from "../../types/xml-element.js"
import type { BpmnDefinitions } from "../bpmn-model.js"
import {
	CAMUNDA7_NS,
	type Camunda7Finding,
	type Camunda7Severity,
	MODELER_NS,
	ZEEBE_NS,
} from "./migrate.js"

/** What {@link convertCamunda8To7} did and could not do, in the forward converter's finding shape. */
export type Camunda8ExportFinding = Camunda7Finding

export interface Camunda8To7Conversion {
	definitions: BpmnDefinitions
	findings: Camunda8ExportFinding[]
}

/** The shape every element, process and message that can carry extensions shares. */
interface Owner {
	id: string
	type?: string
	extensionElements: XmlElement[]
	unknownAttributes: Record<string, string>
	unknownChildren?: XmlElement[]
}

const isFeel = (value: string | undefined): value is string =>
	value?.trimStart().startsWith("=") === true

function isOwner(value: unknown): value is Owner {
	if (typeof value !== "object" || value === null) return false
	const o = value as Record<string, unknown>
	return typeof o.id === "string" && Array.isArray(o.extensionElements)
}

const isForeign = (name: string): boolean =>
	/^(zeebe|modeler)(:|$)/.test(name.replace(/^xmlns:/, ""))

/**
 * Best-effort Camunda 8 → Camunda 7 / Operaton export. The input is not modified.
 *
 * Maps job types, I/O mappings, assignment, form keys, call activities and
 * version tags to `camunda:` equivalents and removes every `zeebe:` and
 * `modeler:` construct and namespace. FEEL is not translated to JUEL: it is
 * kept raw with a `manual` finding. Connectors and Zeebe-only features are
 * dropped with an `unsupported` finding.
 *
 * @example
 * ```typescript
 * const { definitions, findings } = convertCamunda8To7(Bpmn.parse(xml))
 * const c7Xml = Bpmn.export(definitions)
 * ```
 */
export function convertCamunda8To7(definitions: BpmnDefinitions): Camunda8To7Conversion {
	const draft = structuredClone(definitions)
	const findings: Camunda8ExportFinding[] = []
	let processId = ""
	/** Type for owners the model does not tag, i.e. messages. */
	let hint: string | undefined

	const add = (
		owner: { id: string; type?: string },
		construct: string,
		severity: Camunda7Severity,
		message: string,
		suggestion: string,
		applied: boolean,
	): void => {
		findings.push({
			elementId: owner.id,
			elementType: owner.type ?? hint ?? (owner.id === processId ? "process" : "element"),
			processId,
			construct,
			severity,
			message,
			suggestion,
			applied,
		})
	}

	/** Writes `camunda:<name>`; a FEEL value is kept raw because Camunda 7 expects JUEL. */
	const setAttr = (owner: Owner, name: string, value: string, from: string): void => {
		owner.unknownAttributes[`camunda:${name}`] = value
		if (isFeel(value)) {
			add(
				owner,
				from,
				"manual",
				`FEEL expression "${value}" kept as-is; Camunda 7 evaluates JUEL.`,
				`Rewrite camunda:${name} as a JUEL expression such as \${...}.`,
				true,
			)
		}
	}

	const convertOwner = (owner: Owner): void => {
		const kept: XmlElement[] = []
		const inputOutput: XmlElement[] = []
		const camundaExt: XmlElement[] = []
		const take = (name: string): XmlElement | undefined =>
			owner.extensionElements.find((e) => e.name === `zeebe:${name}`)

		const task = take("taskDefinition")
		if (task) {
			const type = task.attributes.type
			if (type !== undefined) {
				owner.unknownAttributes["camunda:type"] = "external"
				setAttr(owner, "topic", type, "zeebe:taskDefinition")
				if (type.startsWith("io.camunda:") || owner.unknownAttributes["zeebe:modelerTemplate"]) {
					add(
						owner,
						"connector",
						"unsupported",
						`Connector "${type}" has no Camunda 7 runtime; it becomes a plain external task.`,
						"Implement an external task worker for this topic.",
						false,
					)
				}
			}
			if (task.attributes.retries !== undefined) {
				add(
					owner,
					"zeebe:taskDefinition retries",
					"manual",
					"Job retries are not exported.",
					"Set camunda:failedJobRetryTimeCycle if needed.",
					false,
				)
			}
		}

		const assignment = take("assignmentDefinition")
		if (assignment) {
			for (const key of ["assignee", "candidateUsers", "candidateGroups"]) {
				const value = assignment.attributes[key]
				if (value !== undefined) setAttr(owner, key, value, "zeebe:assignmentDefinition")
			}
		}

		const form = take("formDefinition")
		if (form) {
			if (form.attributes.formKey !== undefined) {
				setAttr(owner, "formKey", form.attributes.formKey, "zeebe:formDefinition")
			} else {
				add(
					owner,
					"zeebe:formDefinition",
					"unsupported",
					"Only formKey forms exist in Camunda 7; formId and external references are dropped.",
					"Link an embedded or generated form by camunda:formKey.",
					false,
				)
			}
		}

		const tag = take("versionTag")
		if (tag?.attributes.value !== undefined) {
			setAttr(owner, "versionTag", tag.attributes.value, "zeebe:versionTag")
		}

		const called = take("calledElement")
		if (called) {
			const target = called.attributes.processId
			if (target !== undefined) {
				owner.unknownAttributes.calledElement = target
				if (isFeel(target)) {
					add(
						owner,
						"zeebe:calledElement",
						"manual",
						`FEEL expression "${target}" kept as-is; Camunda 7 evaluates JUEL.`,
						"Rewrite calledElement as a JUEL expression.",
						true,
					)
				}
			}
			const binding = called.attributes.bindingType
			if (binding !== undefined) {
				owner.unknownAttributes["camunda:calledElementBinding"] = binding
			}
			if (called.attributes.versionTag !== undefined) {
				owner.unknownAttributes["camunda:calledElementVersionTag"] = called.attributes.versionTag
			}
			// Zeebe propagates both ways unless told not to.
			if (called.attributes.propagateAllParentVariables !== "false") {
				camundaExt.push({ name: "camunda:in", attributes: { variables: "all" }, children: [] })
			}
			if (called.attributes.propagateAllChildVariables !== "false") {
				camundaExt.push({ name: "camunda:out", attributes: { variables: "all" }, children: [] })
			}
		}

		const io = take("ioMapping")
		if (io) {
			for (const child of io.children) {
				const source = child.attributes.source
				const target = child.attributes.target
				if (source === undefined || target === undefined) continue
				const direction = child.name === "zeebe:output" ? "outputParameter" : "inputParameter"
				inputOutput.push({
					name: `camunda:${direction}`,
					attributes: { name: target },
					children: [],
					text: source,
				})
				if (isFeel(source)) {
					add(
						owner,
						`zeebe:${child.name.slice(6)}`,
						"manual",
						`FEEL expression "${source}" (to "${target}") kept as-is; Camunda 7 evaluates JUEL.`,
						"Rewrite the parameter as a JUEL expression.",
						true,
					)
				}
			}
		}

		const subscription = take("subscription")
		if (subscription) {
			add(
				owner,
				"zeebe:subscription",
				"manual",
				"Camunda 7 does not subscribe messages by correlationKey; the key is dropped.",
				"Correlate with a business key or correlation variables when sending the message.",
				false,
			)
		}

		for (const ext of owner.extensionElements) {
			if (!ext.name.startsWith("zeebe:") && !ext.name.startsWith("modeler:")) {
				kept.push(ext)
				continue
			}
			const handled = [
				"taskDefinition",
				"assignmentDefinition",
				"formDefinition",
				"versionTag",
				"calledElement",
				"ioMapping",
				"subscription",
			]
			if (handled.includes(ext.name.slice(ext.name.indexOf(":") + 1))) continue
			add(
				owner,
				ext.name,
				"unsupported",
				`${ext.name} has no Camunda 7 equivalent and was dropped.`,
				"Reimplement the behavior in Camunda 7 or accept the difference.",
				false,
			)
		}

		if (inputOutput.length > 0) {
			camundaExt.push({ name: "camunda:inputOutput", attributes: {}, children: inputOutput })
		}
		owner.extensionElements = [...kept, ...camundaExt]
		stripForeignAttrs(owner.unknownAttributes)
		if (owner.unknownChildren) {
			owner.unknownChildren = owner.unknownChildren.filter((c) => !isForeign(c.name))
		}
	}

	const stripForeignAttrs = (attrs: Record<string, string>): void => {
		for (const key of Object.keys(attrs)) if (isForeign(key)) delete attrs[key]
	}

	const walk = (value: unknown): void => {
		if (Array.isArray(value)) {
			for (const item of value) walk(item)
			return
		}
		if (typeof value !== "object" || value === null) return
		const record = value as Record<string, unknown>
		if (isOwner(record)) convertOwner(record)
		else if (typeof record.unknownAttributes === "object" && record.unknownAttributes !== null) {
			stripForeignAttrs(record.unknownAttributes as Record<string, string>)
		}
		const condition = record.conditionExpression as { text?: string } | undefined
		if (isFeel(condition?.text)) {
			add(
				record as { id: string },
				"conditionExpression",
				"manual",
				`FEEL condition "${condition.text}" kept as-is; Camunda 7 evaluates JUEL.`,
				"Rewrite the condition as a JUEL expression.",
				true,
			)
		}
		for (const [key, child] of Object.entries(record)) {
			if (key !== "diagrams") walk(child)
		}
	}

	for (const message of draft.messages) {
		processId = ""
		const owner = message as unknown as Owner
		hint = "message"
		owner.extensionElements ??= []
		convertOwner(owner)
		hint = undefined
	}
	for (const process of draft.processes) {
		processId = process.id
		walk(process)
	}
	return { definitions: finish(draft), findings }

	function finish(d: BpmnDefinitions): BpmnDefinitions {
		processId = ""
		for (const [prefix, uri] of Object.entries(d.namespaces)) {
			if (isForeign(prefix) || uri === ZEEBE_NS || uri === MODELER_NS) delete d.namespaces[prefix]
		}
		stripForeignAttrs(d.unknownAttributes)
		if (d.unknownChildren) d.unknownChildren = d.unknownChildren.filter((c) => !isForeign(c.name))
		d.namespaces.camunda ??= CAMUNDA7_NS
		return d
	}
}
