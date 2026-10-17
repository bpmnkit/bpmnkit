/**
 * Applying several element templates in one call, from values a caller wrote
 * by hand — an agent's script, not a property panel. Where
 * {@link applyTemplateToElement} takes a resolved template and string values,
 * this takes the names people and models actually use (`HttpJson.v2@18`,
 * `http`), lets numbers and booleans stand for themselves, and answers a
 * misspelt key with the key the template meant.
 */

import { levenshtein } from "../bpmn/optimize/variable-flow.js"
import type { BpmnDefinitions } from "../index.js"
import { CONNECTOR_ALIASES } from "./aliases.js"
import { applyTemplateToElement } from "./apply-element.js"
import { resolveValues } from "./apply.js"
import { getTemplate, propertyKey } from "./catalog.js"
import type { ElementTemplate, TemplateCondition } from "./template-types.js"

export interface TemplateApplication {
	elementId: string
	/** "io.camunda.connectors.HttpJson.v2", "io.camunda.connectors.HttpJson.v2@18", or an alias such as "http" */
	template: string | ElementTemplate
	values: Record<string, string | number | boolean>
}

export interface TemplateApplicationProblem {
	elementId: string
	message: string
	key?: string
	/** The template property id the key was most likely meant to be. */
	suggestion?: string
}

const ALIAS_TO_ID = new Map(Object.entries(CONNECTOR_ALIASES).map(([id, { alias }]) => [alias, id]))

function resolveTemplate(reference: string): { template: ElementTemplate } | { problem: string } {
	const at = reference.lastIndexOf("@")
	const name = at === -1 ? reference : reference.slice(0, at)
	const version = at === -1 ? undefined : reference.slice(at + 1)

	const template = getTemplate(name) ?? getTemplate(ALIAS_TO_ID.get(name) ?? "")
	if (!template) return { problem: `Unknown connector template "${name}"` }
	// The catalogue keeps one version of each id, so any other version is not there to apply.
	if (version !== undefined && version !== String(template.version)) {
		return {
			problem: `Template "${template.id}" is not available at version ${version}; the available version is ${template.version}`,
		}
	}
	return { template }
}

/**
 * The property id a wrong key most likely meant. A key that is the name a
 * property binds to (`retries` for `retryCount`, which writes
 * `zeebe:taskDefinition` `retries`) names it exactly; otherwise the closest
 * id or binding name within a third of the key's length.
 */
function suggestKey(template: ElementTemplate, key: string): string | undefined {
	let best: { id: string; distance: number } | undefined
	for (const prop of template.properties) {
		const id = propertyKey(prop)
		if (!id) continue
		const binding = prop.binding
		const names = [
			id,
			"name" in binding ? binding.name : undefined,
			"property" in binding ? binding.property : undefined,
			"key" in binding ? binding.key : undefined,
		]
		for (const name of names) {
			if (typeof name !== "string") continue
			const distance = levenshtein(key.toLowerCase(), name.toLowerCase())
			if (best === undefined || distance < best.distance) best = { id, distance }
		}
	}
	const limit = Math.max(2, Math.floor(key.length / 3))
	return best !== undefined && best.distance <= limit ? best.id : undefined
}

type SimpleCondition = Extract<TemplateCondition, { allMatch: unknown }>["allMatch"][number]

function describeCondition(condition: TemplateCondition | SimpleCondition): string {
	if ("allMatch" in condition) return condition.allMatch.map(describeCondition).join(" and ")
	const c: SimpleCondition = condition
	if (c.equals !== undefined) return `${c.property} is ${c.equals}`
	if (c.oneOf !== undefined) return `${c.property} is one of ${c.oneOf.join(", ")}`
	if (c.isActive !== undefined) return `${c.property} is ${c.isActive ? "" : "not "}set`
	return `${c.property} is ${c.isEmpty ? "" : "not "}empty`
}

/**
 * A problem for each given key whose property the template's conditions
 * switch off for these values — `ignoreNullValues` on a GET — which the
 * template would otherwise drop without a word.
 */
function unwrittenValues(
	template: ElementTemplate,
	elementId: string,
	values: Record<string, string>,
): TemplateApplicationProblem[] {
	const active = resolveValues(template, values)
	const problems: TemplateApplicationProblem[] = []
	for (const key of Object.keys(values)) {
		if (key in active) continue
		const condition = template.properties.find((p) => propertyKey(p) === key)?.condition
		if (condition === undefined) continue
		problems.push({
			elementId,
			key,
			message: `Value for "${key}" was not written: the template only uses it when ${describeCondition(condition)}`,
		})
	}
	return problems
}

/**
 * Applies each entry in order with {@link applyTemplateToElement} and gathers
 * what went wrong, each problem naming its element.
 *
 * - **Templates.** An id, `id@version`, an alias from `CONNECTOR_ALIASES`, or
 *   a template object. The catalogue holds one version of each id, so a
 *   different `@version` is a problem naming the available one and the
 *   element is left as it was.
 * - **Values.** Keyed by template property id, as in `applyTemplateToElement`;
 *   numbers and booleans become their string form. Strings are written
 *   verbatim — a real newline stays a newline. Properties left out keep the
 *   template's default.
 * - **Unknown keys.** Reported with a `suggestion` when a property id or
 *   binding name is close; the rest of the entry is still applied.
 * - **Switched-off keys.** A value for a property whose `condition` does not
 *   hold for the entry's values is not written, and is reported naming the
 *   condition.
 *
 * @param definitions - The model; not mutated.
 * @param entries - Elements anywhere in the model, nested ones included.
 */
export function applyTemplates(
	definitions: BpmnDefinitions,
	entries: TemplateApplication[],
): { definitions: BpmnDefinitions; problems: TemplateApplicationProblem[] } {
	const problems: TemplateApplicationProblem[] = []
	let current = definitions

	for (const entry of entries) {
		const { elementId } = entry
		let template: ElementTemplate
		if (typeof entry.template === "string") {
			const resolved = resolveTemplate(entry.template)
			if ("problem" in resolved) {
				problems.push({ elementId, message: resolved.problem })
				continue
			}
			template = resolved.template
		} else {
			template = entry.template
		}

		const values = Object.fromEntries(
			Object.entries(entry.values).map(([key, value]) => [key, String(value)]),
		)
		const result = applyTemplateToElement(current, elementId, template, values)
		current = result.definitions
		for (const problem of result.problems) {
			const reported: TemplateApplicationProblem = { elementId, message: problem.message }
			if (problem.key !== undefined) reported.key = problem.key
			if (problem.kind === "unknown-key" && problem.key !== undefined) {
				const suggestion = suggestKey(template, problem.key)
				if (suggestion !== undefined) {
					reported.suggestion = suggestion
					reported.message += `; did you mean "${suggestion}"?`
				}
			}
			problems.push(reported)
		}
		problems.push(...unwrittenValues(template, elementId, values))
	}
	return { definitions: current, problems }
}
