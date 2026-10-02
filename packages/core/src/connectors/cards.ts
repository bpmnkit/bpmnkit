/**
 * Connector cards: the smallest text that lets a model configure one connector
 * operation.
 *
 * A template mixes many operations in one property list, gated by dropdowns:
 * GitHub's `owner` is required by five operations and listed five times. A
 * model handed the template, or a summary of it, cannot tell which inputs
 * belong to the operation it wants. A card is one operation with only the
 * inputs active for it. Modes of an operation (authentication type, AI
 * provider) stay on the card as choices, each with the inputs it adds.
 *
 * Cards are worked out from the templates and {@link CONNECTOR_ALIASES}, never
 * written by hand; tests apply every card's required inputs and expect no
 * missing-required problem.
 */

import { CONNECTOR_ALIASES } from "./aliases.js"
import { evalCondition, resolveValues } from "./apply.js"
import {
	type ConnectorDirection,
	allTemplates,
	isSecretField,
	propertyKey,
	summarizeTemplate,
} from "./catalog.js"
import type { ElementTemplate, TemplateCondition, TemplateProperty } from "./template-types.js"

/** One input a card asks for. */
export interface CardInput {
	/** The key to pass in `applyConnectorTemplate`'s `values`. */
	key: string
	label: string
	/** A credential: write `{{secrets.NAME}}`, never a value. */
	secret?: true
	/** The value must be a FEEL expression (starting with `=`). */
	feel?: true
	/** The allowed values of a dropdown. */
	choices?: string[]
	/** The template's default, when it has one. */
	default?: string
	/**
	 * Plumbing most flows leave alone — retries, timeouts, error expressions,
	 * TLS, saved credentials, inbound deduplication. {@link formatConnectorCard}
	 * leaves these out unless asked.
	 */
	advanced?: true
}

/** A dropdown that changes which inputs the operation needs, such as an authentication type. */
export interface CardMode {
	key: string
	label: string
	/** The flow must choose: the template requires a value and has no default. */
	required?: true
	default?: string
	/** Each choice, with the required inputs it adds to the card's. */
	choices: Array<{ value: string; requires: string[] }>
}

/** One connector operation, with only the inputs it uses. */
export interface ConnectorCard {
	templateId: string
	/** The short name a model writes, e.g. `slack`. */
	alias: string
	/** The operation within the template, e.g. `chat.postMessage`; absent when it has one. */
	operation?: string
	/** The template name, and the operation's label when it has several. */
	title: string
	description?: string
	taskType?: string
	direction: ConnectorDirection
	/** The values that select this operation; pass them with the inputs. */
	values: Record<string, string>
	required: CardInput[]
	optional: CardInput[]
	modes: CardMode[]
}

/** The keys every condition of a template reads. */
function conditionKeys(template: ElementTemplate): Set<string> {
	const keys = new Set<string>()
	const visit = (condition: TemplateCondition | undefined): void => {
		if (!condition) return
		if ("allMatch" in condition) {
			for (const part of condition.allMatch) keys.add(part.property)
		} else {
			keys.add(condition.property)
		}
	}
	for (const prop of template.properties) visit(prop.condition)
	return keys
}

function isActive(prop: TemplateProperty, resolved: Record<string, string>): boolean {
	return prop.condition === undefined || evalCondition(prop.condition, resolved)
}

function activeDropdown(
	template: ElementTemplate,
	key: string,
	resolved: Record<string, string>,
): TemplateProperty | undefined {
	return template.properties.find(
		(p) => p.type === "Dropdown" && propertyKey(p) === key && isActive(p, resolved),
	)
}

interface Operation {
	values: Record<string, string>
	path: Array<{ value: string; name: string }>
}

/** Every choice of the operation dropdowns, nested ones only under the choice that shows them. */
function operationsOf(template: ElementTemplate, selectors: readonly string[]): Operation[] {
	const found: Operation[] = []
	const walk = (values: Record<string, string>, path: Operation["path"]): void => {
		const resolved = resolveValues(template, values)
		for (const key of selectors) {
			if (key in values) continue
			const dropdown = activeDropdown(template, key, resolved)
			if (!dropdown?.choices?.length) continue
			for (const choice of dropdown.choices) {
				walk({ ...values, [key]: choice.value }, [...path, choice])
			}
			return
		}
		found.push({ values, path })
	}
	walk({}, [])
	return found
}

/** Inputs nearly every template has and nearly no flow sets. */
const ADVANCED_KEYS = new Set([
	"errorExpression",
	"retryCount",
	"retryBackoff",
	"jobTimeout",
	"connectionTimeoutInSeconds",
	"readTimeoutInSeconds",
	"messageTtl",
	"messageIdExpression",
	"activationCondition",
	"inbound.activationCondition",
	"consumeUnmatchedEvents",
	"regionOverride",
])

function isAdvanced(prop: TemplateProperty, key: string): boolean {
	return (
		ADVANCED_KEYS.has(key) ||
		key.startsWith("clientTls.") ||
		key.startsWith("deduplication") ||
		prop.type === "Configuration"
	)
}

function toInput(prop: TemplateProperty, key: string): CardInput {
	const input: CardInput = { key, label: prop.label ?? key }
	if (isAdvanced(prop, key)) input.advanced = true
	if (isSecretField(prop, key)) input.secret = true
	if (prop.feel === "required") input.feel = true
	if (prop.type === "Dropdown" && prop.choices) input.choices = prop.choices.map((c) => c.value)
	if (prop.value !== undefined && prop.value !== "") input.default = String(prop.value)
	return input
}

function buildCard(
	template: ElementTemplate,
	alias: string,
	operation: Operation,
	name: string | undefined,
): ConnectorCard {
	const summary = summarizeTemplate(template)
	const gates = conditionKeys(template)
	const resolved = resolveValues(template, operation.values)
	const required: CardInput[] = []
	const optional: CardInput[] = []
	const modes: CardMode[] = []
	const seen = new Set(Object.keys(operation.values))

	for (const prop of template.properties) {
		const key = propertyKey(prop)
		if (!key || seen.has(key) || prop.type === "Hidden" || !isActive(prop, resolved)) continue
		seen.add(key)
		if (prop.type === "Dropdown" && gates.has(key) && prop.choices?.length) {
			const mode: CardMode = {
				key,
				label: prop.label ?? key,
				default: resolved[key],
				choices: prop.choices.map(({ value }) => {
					const chosen = resolveValues(template, { ...operation.values, [key]: value })
					const requires = template.properties
						.filter(
							(p) =>
								p.type !== "Hidden" &&
								p.constraints?.notEmpty === true &&
								isActive(p, chosen) &&
								!isActive(p, resolved),
						)
						.map(propertyKey)
					return { value, requires: [...new Set(requires)] }
				}),
			}
			if (prop.constraints?.notEmpty && resolved[key] === undefined) mode.required = true
			modes.push(mode)
			continue
		}
		// Required means the flow must supply it: a required input with a default already has one
		const needed =
			prop.constraints?.notEmpty === true && (prop.value === undefined || prop.value === "")
		;(needed ? required : optional).push(toInput(prop, key))
	}

	const card: ConnectorCard = {
		templateId: template.id,
		alias,
		title:
			operation.path.length > 0
				? `${template.name}: ${operation.path.map((p) => p.name).join(" / ")}`
				: template.name,
		direction: summary.direction,
		values: operation.values,
		required,
		optional,
		modes,
	}
	if (name !== undefined) card.operation = name
	if (template.description) card.description = template.description
	if (summary.taskType) card.taskType = summary.taskType
	return card
}

/** The alias of a template: its entry in {@link CONNECTOR_ALIASES}, else its id. */
export function connectorAlias(templateId: string): string {
	return CONNECTOR_ALIASES[templateId]?.alias ?? templateId
}

/** The template an alias names, among bundled and registered templates. */
export function templateIdForAlias(alias: string): string | undefined {
	const wanted = alias.toLowerCase()
	return allTemplates().find((t) => connectorAlias(t.id).toLowerCase() === wanted)?.id
}

const cardsByTemplate = new WeakMap<ElementTemplate, ConnectorCard[]>()

function cardsFor(template: ElementTemplate): ConnectorCard[] {
	const cached = cardsByTemplate.get(template)
	if (cached) return cached
	const entry = CONNECTOR_ALIASES[template.id]
	const operations = operationsOf(template, entry?.operations ?? [])
	// The innermost choice names an operation, unless two share it (then the whole path does)
	const leaf = (op: Operation) => op.path.at(-1)?.value
	const counts = new Map<string | undefined, number>()
	for (const op of operations) counts.set(leaf(op), (counts.get(leaf(op)) ?? 0) + 1)
	const cards = operations.map((op) =>
		buildCard(
			template,
			connectorAlias(template.id),
			op,
			op.path.length === 0
				? undefined
				: (counts.get(leaf(op)) ?? 0) > 1
					? op.path.map((p) => p.value).join(".")
					: leaf(op),
		),
	)
	cardsByTemplate.set(template, cards)
	return cards
}

/** The cards of one template, registered or bundled; empty for an unknown id. */
export function connectorCards(templateId: string): ConnectorCard[] {
	const template = allTemplates().find((t) => t.id === templateId)
	return template ? cardsFor(template) : []
}

/** Every card of every bundled and registered template. */
export function listConnectorCards(): ConnectorCard[] {
	return allTemplates().flatMap(cardsFor)
}

const DIRECTION_RANK: Record<ConnectorDirection, number> = {
	outbound: 0,
	agentic: 1,
	"inbound-start": 2,
	"inbound-intermediate": 3,
	"inbound-boundary": 4,
}

function words(text: string): string[] {
	return text
		.replace(/([a-z0-9])([A-Z])/g, "$1 $2")
		.toLowerCase()
		.split(/[^a-z0-9]+/)
		.filter((w) => w.length > 1)
}

/** Words a request uses that say nothing about which connector it means. */
const NOISE = new Set([
	"a",
	"an",
	"the",
	"to",
	"of",
	"for",
	"from",
	"with",
	"and",
	"in",
	"on",
	"into",
	"via",
	"my",
	"our",
	"api",
	"call",
	"connector",
	"using",
])

/** How well a card matches search terms: alias, then template name, then operation, then anywhere. */
export function cardScore(card: ConnectorCard, terms: readonly string[]): number {
	const alias = card.alias.toLowerCase()
	const name = new Set(words(card.title.split(":")[0] ?? ""))
	const operation = new Set(words(`${card.operation ?? ""} ${card.title.split(":")[1] ?? ""}`))
	const anywhere = `${card.description ?? ""} ${card.taskType ?? ""}`.toLowerCase()
	let score = 0
	for (const term of terms) {
		if (alias === term || alias.split("-").includes(term)) score += 5
		else if (name.has(term)) score += 4
		if (operation.has(term)) score += 3
		else if (anywhere.includes(term)) score += 1
	}
	return score
}

/** The words of a request that can say which connector it means. */
export function searchTerms(text: string): string[] {
	return words(text).filter((w) => !NOISE.has(w))
}

/**
 * Cards that match a query, best first: an alias named outright scores highest,
 * then words of the template name, then of the operation, then anywhere.
 * Outbound connectors win ties.
 */
export function findConnectorCards(
	query: string,
	options: { limit?: number } = {},
): ConnectorCard[] {
	const terms = searchTerms(query)
	if (terms.length === 0) return []
	const scored = listConnectorCards()
		.map((card) => ({ card, score: cardScore(card, terms) }))
		.filter((s) => s.score > 0)
		.sort(
			(a, b) =>
				b.score - a.score || DIRECTION_RANK[a.card.direction] - DIRECTION_RANK[b.card.direction],
		)
	return scored.slice(0, options.limit ?? 5).map((s) => s.card)
}

function inputText(input: CardInput, required: boolean): string {
	let text = input.key
	if (required) text += "*"
	if (input.secret) text += "(secret)"
	else if (input.feel) text += "(=FEEL)"
	else if (input.choices) {
		const shown = input.choices.slice(0, 6).join("|")
		text += `(${shown}${input.choices.length > 6 ? "|…" : ""})`
	}
	return text
}

/**
 * A card as one line for a prompt: `alias operation — title | required* … |
 * optional: … | mode=default: choice(adds*) …`. A `*` marks a required input.
 * Advanced inputs are left out unless `options.advanced` is set.
 */
export function formatConnectorCard(
	card: ConnectorCard,
	options: { advanced?: boolean } = {},
): string {
	const head = `${card.alias}${card.operation ? ` ${card.operation}` : ""} — ${card.title}`
	const parts = [head]
	if (card.required.length > 0) parts.push(card.required.map((i) => inputText(i, true)).join(" "))
	const optional = options.advanced ? card.optional : card.optional.filter((i) => !i.advanced)
	if (optional.length > 0) {
		parts.push(`optional: ${optional.map((i) => inputText(i, false)).join(" ")}`)
	}
	for (const mode of card.modes) {
		const choices = mode.choices
			.map((c) => (c.requires.length > 0 ? `${c.value}(${c.requires.join(" ")})` : c.value))
			.join(" | ")
		const head = `${mode.key}${mode.required ? "*" : ""}${mode.default ? `=${mode.default}` : ""}`
		parts.push(`${head}: ${choices}`)
	}
	return parts.join(" | ")
}
