/**
 * Resolving and applying `with` lines (`parseConnectorLine` in
 * `@bpmnkit/core`), and writing them back.
 *
 * The model writes intent: an alias, an operation, a few inputs. This turns
 * that into a fully applied element template, deterministically, and never
 * throws: an unknown alias, an operation it cannot tell, an input the
 * operation does not have or a credential written as a value is repaired or
 * reported, and a required input still missing becomes a question.
 */

import type {
	BpmnDefinitions,
	BpmnFlowElement,
	ConnectorLine,
	ProcessTextProblem,
	ProcessTextQuestion,
	XmlElement,
} from "../index.js"
import { applyTemplateToElement, messageRefOf } from "./apply-element.js"
import { evalCondition, resolveValues } from "./apply.js"
import { type ConnectorCard, connectorAlias, connectorCards, templateIdForAlias } from "./cards.js"
import { allTemplates, getTemplate, isSecretField, propertyKey } from "./catalog.js"
import type { ElementTemplate, TemplateProperty } from "./template-types.js"

/**
 * How to write `with` lines — the system prompt of the connect pass, which
 * configures the connectors of a diagram that already has its shape. The
 * connector cards for the diagram's tasks follow it in the prompt. A test
 * parses its example and expects every line to resolve.
 */
export const CONNECT_GUIDE = `Connect the diagram: write one with line for each node that calls an outside system, nothing else.
with <id>: <alias> <operation> | key=value | key==FEEL expression
- <id> is a node of the diagram. <alias>, <operation> and the keys come from the connector cards.
- Write every input marked *. Write a mode (key=choice) only to change its default, with the inputs that choice adds.
- A value starting with = is FEEL: text== "Order " + orderId. Without =, it is literal text.
- Credentials are never values: token={{secrets.SLACK_TOKEN}}.
- result=name keeps the response in a variable; result=name: response.body keeps a part of it.
- A plain task that becomes a connector needs no other change. Leave out nodes no card fits.

Example:
with notify: slack chat.postMessage | token={{secrets.SLACK_TOKEN}} | data.channel=#ops | data.text== "Order " + orderId + " failed"
with fetch: http GET https://api.example.com/orders | result=order: response.body`

/** What {@link resolveConnectorLine} made of a line. */
export interface ResolvedConnectorLine {
	/** The template, when the alias named one. */
	templateId?: string
	/** The operation's card, when the line named one or the template has only one. */
	card?: ConnectorCard
	/** Values for `applyConnectorTemplate`/`applyTemplateToElement`, the operation's included. */
	values: Record<string, string>
	/** What could not be used. */
	problems: string[]
	/** What was changed to make the line usable, e.g. a misspelt alias or a literal credential. */
	fixes: string[]
}

const HTTP_METHODS = new Set(["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"])
const SECRET = /^\{\{\s*secrets\.[A-Za-z0-9_]+\s*\}\}$/

function distance(a: string, b: string): number {
	const row = Array.from({ length: b.length + 1 }, (_, j) => j)
	for (let i = 1; i <= a.length; i++) {
		let diagonal = row[0] ?? 0
		row[0] = i
		for (let j = 1; j <= b.length; j++) {
			const above = row[j] ?? 0
			row[j] = Math.min(
				above + 1,
				(row[j - 1] ?? 0) + 1,
				diagonal + (a[i - 1] === b[j - 1] ? 0 : 1),
			)
			diagonal = above
		}
	}
	return row[b.length] ?? 0
}

/** The template an alias names, or the one a near miss most likely meant. */
function templateFor(alias: string, fixes: string[]): string | undefined {
	const exact = templateIdForAlias(alias)
	if (exact) return exact
	const byId = allTemplates().find((t) => t.id.toLowerCase() === alias)
	if (byId) return byId.id
	let best: { id: string; alias: string; d: number } | undefined
	for (const template of allTemplates()) {
		const candidate = connectorAlias(template.id).toLowerCase()
		const d = distance(alias, candidate)
		if (d <= 2 && (best === undefined || d < best.d))
			best = { id: template.id, alias: candidate, d }
	}
	if (best) fixes.push(`read connector "${alias}" as "${best.alias}"`)
	return best?.id
}

/** The properties active once a card's operation is chosen. */
function activeProperties(template: ElementTemplate, values: Record<string, string>) {
	const resolved = resolveValues(template, values)
	return template.properties.filter(
		(p) => p.type !== "Hidden" && (!p.condition || evalCondition(p.condition, resolved)),
	)
}

/** The key of the active task header bound to `header`, e.g. GitHub's `resultExpressionCreateIssue`. */
function headerKey(props: TemplateProperty[], header: string): string | undefined {
	const prop = props.find((p) => p.binding.type === "zeebe:taskHeader" && p.binding.key === header)
	return prop && propertyKey(prop)
}

function pickCard(
	cards: ConnectorCard[],
	args: string[],
	values: Record<string, string>,
): { card?: ConnectorCard; rest: string[] } {
	if (cards.length === 1) return { card: cards[0], rest: args }
	const word = args[0]?.toLowerCase()
	if (word !== undefined) {
		const named =
			cards.find((c) => c.operation?.toLowerCase() === word) ??
			cards.find((c) => c.operation?.toLowerCase().endsWith(`.${word}`))
		if (named) return { card: named, rest: args.slice(1) }
	}
	// `method=chat.postMessage` written as an input names the operation too
	const byValues = cards.filter((c) =>
		Object.entries(c.values).every(([k, v]) => values[k] !== undefined && values[k] === v),
	)
	if (byValues.length === 1) return { card: byValues[0], rest: args }
	return { rest: args }
}

/**
 * Resolves a `with` line against the catalog: the template its alias names,
 * the operation, and the values to apply.
 *
 * - An unknown alias within two letters of one is read as that one.
 * - The operation is the first word after the alias, matched exactly or by
 *   its last dotted part (`postMessage` for `chat.postMessage`). It may also
 *   be given as the input that selects it.
 * - Words without a key: an HTTP method sets `method`, a URL or `=` FEEL sets
 *   `url`, on a connector that has them.
 * - A key the operation lacks, written as the end of one it has
 *   (`channel` for `data.channel`), is read as that one.
 * - `result=name` sets the result variable; `result=name: expr` sets the
 *   result expression `={name: expr}`.
 * - A credential written as a value is replaced by a `{{secrets.…}}`
 *   placeholder: the diagram never carries one.
 */
export function resolveConnectorLine(line: ConnectorLine): ResolvedConnectorLine {
	const out: ResolvedConnectorLine = { values: {}, problems: [], fixes: [] }
	const templateId = templateFor(line.alias, out.fixes)
	const template = templateId === undefined ? undefined : getTemplate(templateId)
	if (!templateId || !template) {
		out.problems.push(`no connector is called "${line.alias}"`)
		return out
	}
	out.templateId = templateId
	const cards = connectorCards(templateId)
	const { card, rest } = pickCard(cards, line.args, line.values)
	if (!card) {
		const names = cards.map((c) => c.operation).filter(Boolean)
		out.problems.push(
			`${connectorAlias(templateId)} has several operations; name one of ${names.slice(0, 8).join(", ")}${names.length > 8 ? ", …" : ""}`,
		)
		return out
	}
	out.card = card
	// Words without a key first: `http POST` makes `body` an input, as a mode does
	const values: Record<string, string> = {}
	const templateKeys = new Set(template.properties.map(propertyKey))
	for (const arg of rest) {
		if (HTTP_METHODS.has(arg.toUpperCase()) && templateKeys.has("method")) {
			values.method = arg.toUpperCase()
		} else if (/^(https?:\/\/|=|["'])/.test(arg) && templateKeys.has("url")) {
			values.url = arg.replace(/^(["'])(.*)\1$/, "$2")
		} else {
			out.problems.push(`"${arg}" is not an input of ${connectorAlias(templateId)}; ignored`)
		}
	}

	// A mode the line sets (authentication.type=bearer) switches on the inputs that come with it
	const { result: _result, ...written } = line.values
	const props = activeProperties(template, { ...card.values, ...values, ...written })
	const keys = new Set(props.map(propertyKey))
	const secrets = new Set(
		props
			.filter((p) => p.type !== "Configuration" && isSecretField(p, propertyKey(p)))
			.map(propertyKey),
	)

	for (const [written, value] of Object.entries(line.values)) {
		if (written === "result") {
			const colon = value.indexOf(":")
			const name = (colon < 0 ? value : value.slice(0, colon)).trim()
			const expression = colon < 0 ? "" : value.slice(colon + 1).trim()
			const key = headerKey(props, expression ? "resultExpression" : "resultVariable")
			if (key === undefined || !/^[A-Za-z_]\w*$/.test(name)) {
				out.problems.push(`result="${value}" cannot be written here; ignored`)
			} else {
				values[key] = expression ? `={${name}: ${expression.replace(/^=\s*/, "")}}` : name
			}
			continue
		}
		let key = written
		if (!keys.has(key) && !(key in card.values)) {
			const ends = [...keys].filter((k) => k.endsWith(`.${written}`) || k.endsWith(`_${written}`))
			if (ends.length !== 1 || ends[0] === undefined) {
				out.problems.push(
					`${connectorAlias(templateId)}${card.operation ? ` ${card.operation}` : ""} has no input "${written}"; ignored`,
				)
				continue
			}
			key = ends[0]
			out.fixes.push(`read "${written}" as "${key}"`)
		}
		values[key] = value
	}

	for (const key of secrets) {
		const value = values[key]
		if (value === undefined || value === "" || value.startsWith("=") || SECRET.test(value)) continue
		const name = `${connectorAlias(templateId)}_${key}`.toUpperCase().replace(/[^A-Z0-9]+/g, "_")
		values[key] = `{{secrets.${name}}}`
		out.fixes.push(`"${key}" holds a credential; it is the secret ${name} now, never a value`)
	}

	out.values = { ...card.values, ...values }
	return out
}

/** What {@link applyConnectorLines} did. */
export interface AppliedConnectorLines {
	/** The changed document. The input is never mutated. */
	definitions: BpmnDefinitions
	problems: ProcessTextProblem[]
	fixes: string[]
	/** Required inputs the lines left out, as questions with a line to finish. */
	questions: ProcessTextQuestion[]
}

/**
 * Applies `with` lines to the elements they name: each line is resolved
 * ({@link resolveConnectorLine}) and written with `applyTemplateToElement`,
 * which converts a plain task into the template's element type and stamps the
 * template. A line for an element that already carries the same template
 * changes only the inputs it names. A required input the line did not give
 * becomes a question; the rest of the line is still applied.
 *
 * Pass `parseProcessText(text).connectors` with the expanded diagram, or the
 * lines of a change script with the ids they resolve to.
 */
export function applyConnectorLines(
	definitions: BpmnDefinitions,
	lines: ReadonlyArray<ConnectorLine & { elementId: string }>,
): AppliedConnectorLines {
	const out: AppliedConnectorLines = { definitions, problems: [], fixes: [], questions: [] }
	for (const line of lines) {
		const resolved = resolveConnectorLine(line)
		for (const message of resolved.problems) out.problems.push({ line: line.line, message })
		out.fixes.push(...resolved.fixes.map((fix) => `${line.id}: ${fix}`))
		const template = resolved.templateId ? getTemplate(resolved.templateId) : undefined
		if (!template || !resolved.card) continue
		// A line for a node that already carries this connector changes only what it names:
		// answering "which channel?" must not drop the token the first line set
		const current = elementOf(out.definitions, line.elementId)
		const kept =
			current?.unknownAttributes["zeebe:modelerTemplate"] === template.id
				? readValues(out.definitions, current, template)
				: {}
		const applied = applyTemplateToElement(out.definitions, line.elementId, template, {
			...kept,
			...resolved.values,
		})
		out.definitions = applied.definitions
		const card = resolved.card
		const head = `with ${line.id}: ${card.alias}${card.operation ? ` ${card.operation}` : ""}`
		const element = elementOf(out.definitions, line.elementId)
		for (const problem of applied.problems) {
			if (problem.kind === "missing-required" && problem.key !== undefined) {
				const input = [...card.required, ...card.optional].find((i) => i.key === problem.key)
				out.questions.push({
					elementId: line.elementId,
					text: `"${element?.name ?? line.id}" needs ${input?.label ?? problem.key} for ${card.title}.`,
					options: [],
					draft: `${head} | ${problem.key}=`,
				})
			} else {
				out.problems.push({ line: line.line, message: problem.message })
			}
		}
	}
	return out
}

function elementOf(definitions: BpmnDefinitions, id: string): BpmnFlowElement | undefined {
	return definitions.processes.flatMap((p) => p.flowElements).find((el) => el.id === id)
}

function child(ext: readonly XmlElement[] | undefined, name: string): XmlElement | undefined {
	return ext?.find((x) => x.name === name)
}

/** What an element holds for each binding of a template, by property key. */
function readValues(
	definitions: BpmnDefinitions | undefined,
	element: BpmnFlowElement,
	template: ElementTemplate,
): Record<string, string> {
	const ext = element.extensionElements
	const inputs = new Map<string, string>()
	for (const c of child(ext, "zeebe:ioMapping")?.children ?? []) {
		if (c.name === "zeebe:input" && c.attributes.target !== undefined) {
			inputs.set(c.attributes.target, c.attributes.source ?? "")
		}
	}
	const headers = new Map(
		(child(ext, "zeebe:taskHeaders")?.children ?? []).map((c) => [
			c.attributes.key ?? "",
			c.attributes.value ?? "",
		]),
	)
	const properties = new Map(
		(child(ext, "zeebe:properties")?.children ?? []).map((c) => [
			c.attributes.name ?? "",
			c.attributes.value ?? "",
		]),
	)
	const messageId = messageRefOf(element)
	const message = definitions?.messages.find((m) => m.id === messageId)
	const subscription = child(message?.extensionElements, "zeebe:subscription")?.attributes

	const values: Record<string, string> = {}
	for (const prop of template.properties) {
		const key = propertyKey(prop)
		if (!key || key in values) continue
		const b = prop.binding
		let value: string | undefined
		if (b.type === "zeebe:input") value = inputs.get(b.name)
		else if (b.type === "zeebe:taskHeader") value = headers.get(b.key)
		else if (b.type === "zeebe:property") value = properties.get(b.name)
		else if (b.type === "bpmn:Message#property" && b.name === "name") value = message?.name
		else if (b.type === "bpmn:Message#zeebe:subscription#property") value = subscription?.[b.name]
		if (value !== undefined) values[key] = value
	}
	return values
}

/**
 * The `with` line that re-creates an element's connector, after `with <id>: `,
 * or `undefined` when the element has no template this catalog knows.
 *
 * Written so a model reading a diagram (`writeProcessText`'s `connectorLine`
 * option) keeps its connectors when it rewrites or changes it: the operation,
 * and every input that differs from the template's default. Hidden and
 * generated values are left out — applying the line sets them again.
 */
export function connectorLineFor(
	element: BpmnFlowElement,
	definitions?: BpmnDefinitions,
): string | undefined {
	const templateId = element.unknownAttributes["zeebe:modelerTemplate"]
	const template = templateId === undefined ? undefined : getTemplate(templateId)
	if (!templateId || !template) return undefined
	const raw = readValues(definitions, element, template)
	const card = connectorCards(templateId)
		.filter((c) => Object.entries(c.values).every(([k, v]) => raw[k] === v))
		.sort((a, b) => Object.keys(b.values).length - Object.keys(a.values).length)[0]
	const fixed = card?.values ?? {}
	const parts = [`${connectorAlias(templateId)}${card?.operation ? ` ${card.operation}` : ""}`]
	const written = new Set<string>()
	for (const prop of activeProperties(template, raw)) {
		const key = propertyKey(prop)
		const value = raw[key]
		if (!key || written.has(key) || key in fixed || value === undefined || prop.generatedValue) {
			continue
		}
		written.add(key)
		if (prop.value !== undefined && String(prop.value) === value) continue
		parts.push(`${key}=${value.replace(/\s+/g, " ").trim()}`)
	}
	return parts.join(" | ")
}
