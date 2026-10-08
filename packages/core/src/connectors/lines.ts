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
import { type ApiService, apiAuthValues, apiHeaders, apiUrl, findApiOperation } from "./api.js"
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
- <id> is a node of the diagram, written exactly as before the colon of its cards. <alias>, <operation> and the keys come from the connector cards.
- When the request names a system, use that system's card.
- Write every input marked *. Write a mode (key=choice) only to change its default, with the inputs that choice adds.
- A value starting with = is FEEL: text== "Order " + orderId. Without =, it is literal text. A variable is FEEL too: to==email, never {{email}} or \${email}; {{…}} is only for secrets.
- Credentials are never values: token={{secrets.SLACK_TOKEN}}.
- result=name keeps the response in a variable; result=name: response.body keeps a part of it.
- A plain task that becomes a connector needs no other change. Leave out nodes no card fits.
- An api card lists real endpoints of a service for the http connector: write http <METHOD> <path> | api=<service>. The base URL, the authentication and the {params} of the path, read from variables of the same name, are added. Prefer a dedicated connector's card to an api card.

Example:
with notify: slack chat.postMessage | token={{secrets.SLACK_TOKEN}} | data.channel=#ops | data.text== "Order " + orderId + " failed"
with fetch: http GET https://api.example.com/orders | result=order: response.body
with charge: http POST /v1/customers | api=stripe | body=={email: email} | result=customer: response.body`

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
	/** What a person should check or give, with the input that answers it. */
	questions: { text: string; input: string }[]
}

/** Options of {@link resolveConnectorLine} and {@link applyConnectorLines}. */
export interface ConnectorLineOptions {
	/**
	 * Services of the API index (`@bpmnkit/connector-gen/api-index`) an `http`
	 * line may call. A line naming one with `api=<id>`, or calling a URL under
	 * its base URL, gets the base URL, the authentication and the headers the
	 * operation needs; a call the index does not know becomes a question.
	 */
	apis?: readonly ApiService[]
}

const HTTP_TEMPLATE = "io.camunda.connectors.HttpJson.v2"

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
		// Two letters off a short alias is another word: "api" is not "a2a"
		const allowed = Math.min(alias.length, candidate.length) <= 4 ? 1 : 2
		if (d <= allowed && (best === undefined || d < best.d))
			best = { id: template.id, alias: candidate, d }
	}
	if (best) fixes.push(`read connector "${alias}" as "${best.alias}"`)
	return best?.id
}

/**
 * Whether a `with` line's alias names a connector, as the resolver reads it: exactly, by a
 * template id, or within a letter or two of one.
 */
export function isConnectorAlias(alias: string): boolean {
	return templateFor(alias.toLowerCase(), []) !== undefined
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
): { card?: ConnectorCard; rest: string[]; guessed?: boolean } {
	if (cards.length === 1) return { card: cards[0], rest: args }
	const word = args[0]?.toLowerCase()
	if (word !== undefined) {
		const named =
			cards.find((c) => c.operation?.toLowerCase() === word) ??
			cards.find((c) => c.operation?.toLowerCase().endsWith(`.${word}`)) ??
			// `chat.completions.create`, the SDK call, for the operation `chat`
			cards.find(
				(c) => c.operation !== undefined && word.startsWith(`${c.operation.toLowerCase()}.`),
			)
		if (named) return { card: named, rest: args.slice(1) }
		// `sendEmailImap`, an operation the connector does not have, for `sendEmailSmtp`: the
		// one operation that shares the longest start with it, when that start is a word or more
		const shared = (op: string) => {
			let k = 0
			while (k < op.length && k < word.length && op[k] === word[k]) k++
			return k
		}
		const ranked = cards
			.map((c) => ({ c, n: shared(c.operation?.toLowerCase() ?? "") }))
			.sort((a, b) => b.n - a.n)
		const [best, next] = ranked
		if (best && best.n >= 5 && best.n > (next?.n ?? 0)) {
			return { card: best.c, rest: args.slice(1), guessed: true }
		}
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
 * - On `http`, `api=<service>` or a URL under a service's base URL completes
 *   the call from `options.apis`: base URL, path parameters, authentication
 *   and required headers. A call the index lacks is a question.
 */
export function resolveConnectorLine(
	given: ConnectorLine,
	options: ConnectorLineOptions = {},
): ResolvedConnectorLine {
	const out: ResolvedConnectorLine = { values: {}, problems: [], fixes: [], questions: [] }
	const line = apiCardLine(given, options.apis ?? [], out.fixes)
	const templateId = templateFor(line.alias, out.fixes)
	const template = templateId === undefined ? undefined : getTemplate(templateId)
	if (!templateId || !template) {
		out.problems.push(`no connector is called "${line.alias}"`)
		return out
	}
	out.templateId = templateId
	const cards = connectorCards(templateId)
	const { card, rest, guessed } = pickCard(cards, line.args, line.values)
	if (!card) {
		const names = cards.map((c) => c.operation).filter(Boolean)
		out.problems.push(
			`${connectorAlias(templateId)} has several operations; name one of ${names.slice(0, 8).join(", ")}${names.length > 8 ? ", …" : ""}`,
		)
		return out
	}
	out.card = card
	if (guessed) out.fixes.push(`read operation "${line.args[0]}" as "${card.operation}"`)
	// Words without a key first: `http POST` makes `body` an input, as a mode does
	const values: Record<string, string> = {}
	const templateKeys = new Set(template.properties.map(propertyKey))
	for (const arg of rest) {
		if (HTTP_METHODS.has(arg.toUpperCase()) && templateKeys.has("method")) {
			values.method = arg.toUpperCase()
		} else if (/^(https?:\/\/|=|["']|\/)/.test(arg) && templateKeys.has("url")) {
			values.url = arg.replace(/^(["'])(.*)\1$/, "$2")
		} else {
			out.problems.push(`"${arg}" is not an input of ${connectorAlias(templateId)}; ignored`)
		}
	}

	// A mode the line sets (authentication.type=bearer) switches on the inputs that come with it
	const { result: _result, api: _api, ...written } = line.values
	const props = activeProperties(template, { ...card.values, ...values, ...written })
	const keys = new Set(props.map(propertyKey))
	const secrets = new Set(
		props
			.filter((p) => p.type !== "Configuration" && isSecretField(p, propertyKey(p)))
			.map(propertyKey),
	)

	for (const [written, value] of Object.entries(line.values)) {
		if (written === "api") continue
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
		// `url=api.notion.base` beside a positional URL is not one: the positional stands. With
		// api=, the index completes the positional path, so a FEEL url= only gets it wrong
		if (
			key === "url" &&
			values.url !== undefined &&
			(!/^(https?:\/\/|=|\/|["'])/.test(value) || line.values.api !== undefined)
		) {
			out.fixes.push(`kept the URL ${values.url}, not url=${value}`)
			continue
		}
		values[key] =
			key === "headers" ? feelHeaders(value, out.fixes) : feelForVariable(key, value, out.fixes)
	}

	for (const key of secrets) {
		const value = values[key]
		if (value === undefined || value === "" || value.startsWith("=") || SECRET.test(value)) continue
		const name = `${connectorAlias(templateId)}_${key}`.toUpperCase().replace(/[^A-Z0-9]+/g, "_")
		values[key] = `{{secrets.${name}}}`
		out.fixes.push(`"${key}" holds a credential; it is the secret ${name} now, never a value`)
	}

	if (templateId === HTTP_TEMPLATE) {
		const service = apiServiceFor(line.values.api, values.url, options.apis ?? [], out)
		if (service) applyApiService(service, values, line.values, out)
	} else if (line.values.api !== undefined) {
		out.problems.push("api= is for the http connector; ignored")
	}

	out.values = { ...card.values, ...values }
	return out
}

/**
 * A line written like an API card's head, `api github GET /issues`, read as the call it
 * means: `http GET /issues | api=github`; one that starts with the method, `GET /issues`,
 * as `http GET /issues`.
 */
function apiCardLine(
	given: ConnectorLine,
	apis: readonly ApiService[],
	fixes: string[],
): ConnectorLine {
	let line = given
	// `with fetch: https://api.github.com/… | api=github GET`: a URL where the alias goes is a
	// REST call to it, and a method after the service in api= is the call's method
	if (/^https?:\/\//i.test(line.alias)) {
		fixes.push(`read "${line.alias}" as "http ${line.alias}"`)
		line = { ...line, alias: "http", args: [line.alias, ...line.args] }
	}
	const apiMethod = /^(\S+)\s+(get|post|put|patch|delete)$/i.exec(line.values.api ?? "")
	if (apiMethod?.[1] && apiMethod[2]) {
		const method = apiMethod[2].toUpperCase()
		fixes.push(`read api=${line.values.api} as api=${apiMethod[1]} with ${method}`)
		const hasMethod = line.args.some((arg) => HTTP_METHODS.has(arg.toUpperCase()))
		line = {
			...line,
			args: hasMethod ? line.args : [method, ...line.args],
			values: { ...line.values, api: apiMethod[1] },
		}
	}
	// `http GET api github — List workflow runs for a repository`: an API card's line copied
	// with the summary where the path goes. The summary names the operation
	const dash = line.args.findIndex((arg) => arg === "—" || arg === "-")
	if (line.alias === "http" && dash >= 0) {
		const summary = line.args
			.slice(dash + 1)
			.join(" ")
			.trim()
			.toLowerCase()
		for (const service of apis) {
			const op = service.operations.find((o) => o.summary?.toLowerCase() === summary)
			if (!op) continue
			fixes.push(
				`read "${line.args.slice(dash + 1).join(" ")}" as ${op.method} ${op.path} of ${service.name}`,
			)
			return { ...line, args: [op.method, op.path], values: { ...line.values, api: service.id } }
		}
	}
	// `with list: GET /repos/…` is a REST call missing its alias
	if (HTTP_METHODS.has(line.alias.toUpperCase())) {
		fixes.push(`read "${line.alias}" as "http ${line.alias.toUpperCase()}"`)
		return { ...line, alias: "http", args: [line.alias.toUpperCase(), ...line.args] }
	}
	// `stripe POST /v1/refunds` names a service of the index where a connector alias goes
	if (
		apis.some((s) => s.id === line.alias) &&
		templateIdForAlias(line.alias) === undefined &&
		!allTemplates().some((t) => t.id.toLowerCase() === line.alias)
	) {
		// `STRIPE_API_POST` is an operation of the card read as its method
		const args = line.args.map((arg) => {
			const method = /(?:^|[_.-])(get|post|put|patch|delete)$/i.exec(arg)?.[1]
			return method ? method.toUpperCase() : arg
		})
		fixes.push(`read "${line.alias}" as "http … | api=${line.alias}"`)
		return { ...line, alias: "http", args, values: { ...line.values, api: line.alias } }
	}
	const service = line.args[0]?.toLowerCase()
	if (line.alias !== "api" || !apis.some((s) => s.id === service)) return line
	fixes.push(`read "api ${line.args[0]}" as "http … | api=${service}"`)
	return {
		...line,
		alias: "http",
		args: line.args.slice(1),
		values: { ...line.values, api: service ?? "" },
	}
}

/** `{{orderId}}`, `{{variables.orderId}}` or `${orderId}`: a variable, which FEEL reads as `=orderId`. */
const TEMPLATED_VARIABLE =
	/^=?\s*(?:\{\{\s*(?:variables\.)?([A-Za-z_][\w.]*)\s*\}\}|\$\{\s*([A-Za-z_][\w.]*)\s*\})\s*$/

/** `Notion-Version: 2026-03-11`, headers written as text, as the FEEL context the connector reads. */
function feelHeaders(value: string, fixes: string[]): string {
	if (/^\s*[={]/.test(value) || !/^\s*[\w-]+\s*:/.test(value)) return value
	const entries = value.split(/[,;]\s*(?=[\w-]+\s*:)/).map((pair) => {
		const colon = pair.indexOf(":")
		return `${JSON.stringify(pair.slice(0, colon).trim())}: ${JSON.stringify(pair.slice(colon + 1).trim())}`
	})
	fixes.push(`read headers ${value} as a FEEL context`)
	return `={${entries.join(", ")}}`
}

/** A variable written in another template syntax, as the FEEL expression it means. */
function feelForVariable(key: string, value: string, fixes: string[]): string {
	// `== "Order " + ${orderId} + " failed"`: a template variable inside FEEL is the variable
	if (value.startsWith("=") && /\$\{\s*[A-Za-z_][\w.]*\s*\}/.test(value)) {
		const feel = value.replace(/\$\{\s*([A-Za-z_][\w.]*)\s*\}/g, "$1")
		fixes.push(`read "${key}" ${value} as ${feel}`)
		return feel
	}
	// `channel==#ops` is the literal #ops: no FEEL starts with # or @
	if (/^=\s*[#@][\w.-]+$/.test(value)) {
		const literal = value.replace(/^=\s*/, "")
		fixes.push(`read "${key}" ${value} as the text ${literal}`)
		return literal
	}
	const match = TEMPLATED_VARIABLE.exec(value)
	const name = match?.[1] ?? match?.[2]
	if (name === undefined || name.startsWith("secrets.")) return value
	fixes.push(`read "${key}" ${value} as the variable =${name}`)
	return `=${name}`
}

/** The service an `http` line calls: the one `api=` names, or the one whose base URL its URL starts with. */
function apiServiceFor(
	name: string | undefined,
	url: string | undefined,
	apis: readonly ApiService[],
	out: ResolvedConnectorLine,
): ApiService | undefined {
	if (name !== undefined) {
		const wanted = name.trim().toLowerCase()
		const named = apis.find((s) => s.id === wanted)
		if (!named) out.problems.push(`no API "${name}" is in the API index; api= ignored`)
		return named
	}
	if (url === undefined) return undefined
	const under = apis.find((s) => s.baseUrl !== undefined && url.startsWith(`${s.baseUrl}/`))
	if (under) return under
	// A path alone, with one service in play, is a path of that service
	const only = apis.length === 1 ? apis[0] : undefined
	if (only && url.startsWith("/")) {
		out.fixes.push(`read ${url} as a path of ${only.name}`)
		return only
	}
	return undefined
}

/**
 * Completes an `http` line from the API index: the base URL before a path, the
 * path's `{params}` read from variables, the service's authentication unless
 * the line sets its own, and the headers the operation needs. A call the index
 * does not have is kept, with a question to check it.
 */
function applyApiService(
	service: ApiService,
	values: Record<string, string>,
	written: Record<string, string>,
	out: ResolvedConnectorLine,
): void {
	const url = values.url
	if (!Object.keys(written).some((k) => k.startsWith("authentication."))) {
		Object.assign(values, apiAuthValues(service))
	}
	// A FEEL URL is the line's own: nothing to look up
	if (url === undefined || url.startsWith("=")) return
	const base = service.baseUrl
	// `/charges/{{chargeId}}/refunds` is the path parameter `{chargeId}` in another syntax
	const given = (base !== undefined && url.startsWith(base) ? url.slice(base.length) : url).replace(
		/\{\{\s*(?:variables\.)?([A-Za-z_]\w*)\s*\}\}/g,
		"{$1}",
	)
	// `/repos/web/Actions/runs`: a word of the service's paths, in the case the service writes it
	const spelling = new Map(
		service.operations
			.flatMap((op) => op.path.split("/"))
			.filter((part) => part !== "" && !part.startsWith("{"))
			.map((part) => [part.toLowerCase(), part]),
	)
	const path = given
		.split("/")
		.map((part) => spelling.get(part.toLowerCase()) ?? part)
		.join("/")
	if (path !== given) out.fixes.push(`read ${given} as ${path}, as ${service.name} spells it`)
	if (!path.startsWith("/")) return
	const method = values.method ?? "GET"
	const op = findApiOperation(service, method, path)
	if (base === undefined) {
		out.questions.push({
			text: `${service.name} has no fixed address: give the full URL of ${method} ${path} for your account.`,
			input: "url",
		})
	} else {
		values.url = apiUrl(base, path)
	}
	if (!op) {
		out.questions.push({
			text: `${method} ${path} is not an operation of ${service.name} in the API index — check the method and the URL.`,
			input: "url",
		})
		return
	}
	if (!("headers" in written)) {
		const { headers, missing } = apiHeaders(op)
		if (headers !== undefined) values.headers = headers
		if (missing.length > 0) {
			out.questions.push({
				text: `${service.name} needs the header${missing.length > 1 ? "s" : ""} ${missing.join(", ")} for ${method} ${op.path}.`,
				input: "headers",
			})
		}
	}
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
	options: ConnectorLineOptions = {},
): AppliedConnectorLines {
	const out: AppliedConnectorLines = { definitions, problems: [], fixes: [], questions: [] }
	for (const line of lines) {
		const resolved = resolveConnectorLine(line, options)
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
		for (const question of resolved.questions) {
			out.questions.push({
				elementId: line.elementId,
				text: `"${element?.name ?? line.id}": ${question.text}`,
				options: [],
				draft: `${head} | ${question.input}=`,
			})
		}
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
