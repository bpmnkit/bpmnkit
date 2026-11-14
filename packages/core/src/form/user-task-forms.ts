import type { BpmnDefinitions, BpmnFlowElement } from "../bpmn/bpmn-model.js"
import type { XmlElement } from "../types/xml-element.js"
import type { FormComponent, FormDefinition } from "./form-model.js"

/** Options for {@link attachUserTaskForms}. */
export interface UserTaskFormsOptions {
	/**
	 * Form fields per user task id, as `key[:type]` items separated by commas:
	 * `amount:number,approved:checkbox,decision:select(approve|reject),note:textarea,due:date,name`.
	 * Types: `text` (default), `textarea`, `number`, `checkbox`, `date`, `select(a|b)`.
	 * A task without an entry gets a heading and a "Done" checkbox.
	 */
	fields?: Record<string, string>
	/** Form ids that already exist (a `.form` file next to the model); no form is generated for them. */
	existing?: ReadonlySet<string>
	/** Element ids left as they are: an edit gives forms to the user tasks it adds, not to those already there. */
	skip?: ReadonlySet<string>
}

/** What {@link attachUserTaskForms} did. */
export interface UserTaskFormsResult {
	/** Ids of the user tasks that had no form and now link one. */
	attached: string[]
	/** One generated form per linked form id not in `existing`; write each as `<id>.form`. */
	forms: FormDefinition[]
}

const FORM_LINK = new Set(["zeebe:formDefinition", "zeebe:formKey"])

function* walk(elements: readonly BpmnFlowElement[]): Generator<BpmnFlowElement> {
	for (const el of elements) {
		yield el
		if ("flowElements" in el && Array.isArray(el.flowElements)) yield* walk(el.flowElements)
	}
}

function labelOf(key: string): string {
	const words = key
		.replace(/([a-z0-9])([A-Z])/g, "$1 $2")
		.replace(/[_-]+/g, " ")
		.trim()
	return words.charAt(0).toUpperCase() + words.slice(1).toLowerCase()
}

/** A FEEL-safe variable name: form keys become process variables. */
function variableOf(text: string): string {
	const camel = text.replace(/[^A-Za-z0-9]+(.)?/g, (_m, c: string | undefined) =>
		c === undefined ? "" : c.toUpperCase(),
	)
	return /^[A-Za-z_]/.test(camel) ? camel : `v${camel}`
}

/**
 * Parses a `key[:type]` field list. Unknown types fall back to a text field, so a
 * typo still yields a deployable form.
 */
export function parseFormFields(spec: string): FormComponent[] {
	const components: FormComponent[] = []
	for (const raw of spec.split(",")) {
		const item = raw.trim()
		if (item === "") continue
		const match = /^([^:]+)(?::(\w+)(?:\(([^)]*)\))?)?$/.exec(item)
		const key = variableOf((match?.[1] ?? item).trim())
		const type = (match?.[2] ?? "text").toLowerCase()
		const id = `Field_${key}`
		const label = labelOf(key)
		switch (type) {
			case "number":
			case "textarea":
			case "checkbox":
				components.push({ id, type, label, key } as FormComponent)
				break
			case "date":
				components.push({ id, type: "datetime", key, subtype: "date", dateLabel: label })
				break
			case "select": {
				const values = (match?.[3] ?? "")
					.split("|")
					.map((v) => v.trim())
					.filter(Boolean)
					.map((value) => ({ label: labelOf(value), value }))
				components.push({ id, type: "select", label, key, values })
				break
			}
			default:
				components.push({ id, type: "textfield", label, key })
		}
	}
	return components
}

function formFor(formId: string, title: string, spec: string | undefined, taskId: string) {
	const fields =
		spec !== undefined
			? parseFormFields(spec)
			: [
					{
						id: "Field_done",
						type: "checkbox",
						label: "Done",
						key: `${variableOf(taskId)}Done`,
					} as FormComponent,
				]
	const form: FormDefinition = {
		id: formId,
		type: "default",
		executionPlatform: "Camunda Cloud",
		executionPlatformVersion: "8.10.0",
		schemaVersion: 16,
		components: [{ id: "Field_title", type: "text", text: `## ${title}` }, ...fields],
	}
	return form
}

/**
 * Gives every user task a Camunda form in one step, so the model passes the
 * Camunda lint (`camunda-compat/user-task-definition`) and deploys with its forms.
 *
 * A user task with no `zeebe:formDefinition` (or `zeebe:formKey`) gets
 * `formId="<processId>-<taskId>"` and becomes a Camunda user task
 * (`zeebe:userTask`). Every form id a user task or start event links, and that
 * is not in `options.existing`, gets a generated form. Changes `defs` in place.
 *
 * @example
 * ```ts
 * const { forms } = attachUserTaskForms(defs, { fields: { review: "amount:number,approved:checkbox" } })
 * for (const form of forms) writeFileSync(`${form.id}.form`, Form.export(form))
 * ```
 */
export function attachUserTaskForms(
	defs: BpmnDefinitions,
	options: UserTaskFormsOptions = {},
): UserTaskFormsResult {
	const attached: string[] = []
	const forms = new Map<string, FormDefinition>()
	for (const process of defs.processes) {
		for (const el of walk(process.flowElements)) {
			if (el.type !== "userTask" && el.type !== "startEvent") continue
			if (options.skip?.has(el.id)) continue
			const ext: XmlElement[] = el.extensionElements
			let link = ext.find((x) => FORM_LINK.has(x.name))
			if (link === undefined && el.type === "userTask") {
				link = {
					name: "zeebe:formDefinition",
					attributes: { formId: `${process.id}-${el.id}` },
					children: [],
				}
				if (!ext.some((x) => x.name === "zeebe:userTask"))
					ext.push({ name: "zeebe:userTask", attributes: {}, children: [] })
				ext.push(link)
				attached.push(el.id)
			}
			const formId = link?.attributes.formId
			// A FEEL form id is resolved at runtime; only a static one names a file to write.
			if (formId === undefined || formId === "" || formId.startsWith("=")) continue
			if (options.existing?.has(formId) || forms.has(formId)) continue
			forms.set(formId, formFor(formId, el.name ?? el.id, options.fields?.[el.id], el.id))
		}
	}
	return { attached, forms: [...forms.values()] }
}
