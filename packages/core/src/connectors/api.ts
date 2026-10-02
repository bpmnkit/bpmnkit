/**
 * API cards: the real endpoints of an HTTP API, for the REST connector.
 *
 * A dedicated connector is the first choice for a system. When there is none —
 * Stripe, Notion, most of the long tail — the REST connector can still call
 * the system, but only with the right base URL, path and authentication. These
 * come from an index of the APIs' OpenAPI specs, built offline into
 * `@bpmnkit/connector-gen/api-index`. That index is too large for core, so
 * core has only its shape and works on the services a caller loaded.
 */

import { searchTerms } from "./cards.js"

/** How a service expects its credentials. */
export type ApiAuth =
	| { type: "noAuth" | "bearer" | "basic" | "oauth-client-credentials-flow" }
	| { type: "apiKey"; in: "header" | "query"; name: string }

/** One operation of a service. */
export interface ApiOperation {
	/** Upper-case HTTP method. */
	method: string
	/** Path below the base URL, with `{param}` placeholders. */
	path: string
	/** The spec's `operationId`, kept when it has no summary. */
	id?: string
	summary?: string
	/** Query parameters, required ones first and marked `*`. */
	query?: string[]
	/** Required headers besides authentication, as `Name` or `Name: value`. */
	headers?: string[]
	/** Top-level body properties, required ones first and marked `*`. */
	body?: string[]
	/** The body is sent form-encoded, not as JSON. */
	form?: true
}

/** A service of the index, operations included. */
export interface ApiService {
	id: string
	name: string
	/** Absent when the spec has no fixed host (a per-tenant domain, say). */
	baseUrl?: string
	auth: ApiAuth
	license?: string
	operations: ApiOperation[]
}

/** A service of the index without its operations. */
export interface ApiServiceSummary {
	id: string
	name: string
	description?: string
}

/** A service and the operations picked from it for one task. */
export interface ApiCard {
	service: ApiService
	operations: ApiOperation[]
}

/** The word that names a service: `twilio-voice` → `twilio`. */
export function apiBrand(id: string): string {
	return id.split("-")[0] ?? id
}

/** Brands that are also everyday words: they name the service only as "<brand> API". */
const EVERYDAY = new Set(["box", "square", "replicate", "docker", "copper", "gusto", "nasa"])

function lowerWords(text: string): string[] {
	return text.toLowerCase().split(/[^a-z0-9]+/)
}

/**
 * The services a text names, by id: "Charge the card with Stripe" names
 * `stripe`; "Send an SMS via Twilio" names every Twilio service.
 */
export function apiServicesIn(text: string, services: readonly ApiServiceSummary[]): string[] {
	const words = lowerWords(text)
	const present = new Set(words)
	return services
		.filter((s) => {
			const brand = apiBrand(s.id)
			if (!present.has(brand)) return false
			if (!EVERYDAY.has(brand)) return true
			return words.some((w, i) => w === brand && words[i + 1] === "api")
		})
		.map((s) => s.id)
}

/** The method a verb asks for. */
const VERB_METHOD: Record<string, string> = {
	create: "POST",
	add: "POST",
	new: "POST",
	post: "POST",
	send: "POST",
	submit: "POST",
	list: "GET",
	get: "GET",
	fetch: "GET",
	read: "GET",
	find: "GET",
	search: "GET",
	retrieve: "GET",
	load: "GET",
	look: "GET",
	update: "PATCH",
	change: "PATCH",
	edit: "PATCH",
	set: "PATCH",
	delete: "DELETE",
	remove: "DELETE",
}

/** `issues` and `issue` are one word for matching. */
function stem(word: string): string {
	if (word.length > 4 && word.endsWith("ies")) return `${word.slice(0, -3)}y`
	if (word.length > 3 && word.endsWith("s") && !word.endsWith("ss")) return word.slice(0, -1)
	return word
}

function stems(text: string): Set<string> {
	return new Set(searchTerms(text).map(stem))
}

function pathWords(path: string): Set<string> {
	return stems(path.replace(/\{[^}]*\}/g, " ").replace(/[_/-]+/g, " "))
}

/** An operation with how well it fits, and how many of the task's words (verbs aside) it has. */
export interface RankedApiOperation {
	op: ApiOperation
	score: number
	hits: number
}

/**
 * The operations of a service that best fit a task name, best first: words of
 * the summary count most, then of the path, then of the operation id, and a
 * verb that asks for the operation's method ("Create" → POST) adds to it, as
 * does a path that ends in a word of the text, and each word of the path the
 * text does not have takes one off. Without a verb, POST is preferred. An operation
 * needs a word other than a verb in common. Shorter paths win ties.
 */
export function rankApiOperations(service: ApiService, text: string): RankedApiOperation[] {
	const brand = new Set(lowerWords(`${service.id} ${service.name}`).map(stem))
	const terms = [...stems(text)].filter((t) => !brand.has(t))
	const methods = new Set(terms.map((t) => VERB_METHOD[t]).filter((m) => m !== undefined))
	const content = terms.filter((t) => VERB_METHOD[t] === undefined)
	if (content.length === 0) return []
	const ranked: RankedApiOperation[] = []
	for (const op of service.operations) {
		const summary = stems(op.summary ?? "")
		const path = pathWords(op.path)
		const id = stems(op.id ?? "")
		let hits = 0
		let score = 0
		for (const term of content) {
			const s = summary.has(term) ? 3 : path.has(term) ? 2 : id.has(term) ? 1 : 0
			if (s > 0) hits++
			score += s
		}
		if (hits === 0) continue
		for (const term of terms) if (VERB_METHOD[term] !== undefined && summary.has(term)) score += 1
		if (methods.has(op.method)) score += 2
		// A task without a verb that reads acts: "Refund payment" posts a refund
		else if (methods.size === 0 && op.method === "POST") score += 1
		// The resource itself: "Refund payment" is /v1/refunds more than /…/refund_payment
		const last = op.path
			.split("/")
			.filter((p) => p !== "" && !p.startsWith("{"))
			.at(-1)
		if (last !== undefined && content.includes(stem(last.toLowerCase()))) score += 2
		// A path the task does not describe is a more specific operation than it asks for:
		// "Refund payment" is POST /v1/refunds, not /v1/terminal/readers/{reader}/refund_payment
		const known = new Set(terms)
		for (const word of path) if (!known.has(word) && !/^v?\d+$/.test(word)) score -= 1
		ranked.push({ op, score, hits })
	}
	return ranked.sort(
		(a, b) =>
			b.score - a.score ||
			a.op.path.split("/").length - b.op.path.split("/").length ||
			a.op.path.length - b.op.path.length,
	)
}

/** The operations of {@link rankApiOperations}, best first. */
export function findApiOperations(
	service: ApiService,
	text: string,
	options: { limit?: number } = {},
): ApiOperation[] {
	return rankApiOperations(service, text)
		.slice(0, options.limit ?? 3)
		.map((r) => r.op)
}

/** The secret names a service's credentials go by: `STRIPE_TOKEN`. */
export function apiSecretNames(service: ApiService): Record<string, string> {
	const prefix = service.id.toUpperCase().replace(/[^A-Z0-9]+/g, "_")
	switch (service.auth.type) {
		case "bearer":
			return { "authentication.token": `${prefix}_TOKEN` }
		case "apiKey":
			return { "authentication.value": `${prefix}_API_KEY` }
		case "basic":
			return {
				"authentication.username": `${prefix}_USERNAME`,
				"authentication.password": `${prefix}_PASSWORD`,
			}
		case "oauth-client-credentials-flow":
			return { "authentication.clientSecret": `${prefix}_CLIENT_SECRET` }
		default:
			return {}
	}
}

/** The REST connector's authentication inputs for a service, credentials as secrets. */
export function apiAuthValues(service: ApiService): Record<string, string> {
	const values: Record<string, string> = { "authentication.type": service.auth.type }
	if (service.auth.type === "apiKey") {
		values["authentication.apiKeyLocation"] = service.auth.in === "query" ? "query" : "headers"
		values["authentication.name"] = service.auth.name
	}
	for (const [key, name] of Object.entries(apiSecretNames(service))) {
		values[key] = `{{secrets.${name}}}`
	}
	return values
}

function authText(service: ApiService): string {
	const secrets = Object.values(apiSecretNames(service))
	const auth =
		service.auth.type === "apiKey"
			? `auth=apiKey(${service.auth.in} ${service.auth.name})`
			: `auth=${service.auth.type}`
	return secrets.length > 0 ? `${auth} secret=${secrets.join(",")}` : auth
}

/** One operation as a card line: `POST /v1/customers — Create a customer | form body: name email`. */
export function formatApiOperation(op: ApiOperation): string {
	const parts = [
		`${op.method} ${op.path}${op.summary ? ` — ${op.summary}` : op.id ? ` — ${op.id}` : ""}`,
	]
	if (op.query?.length) parts.push(`query: ${op.query.join(" ")}`)
	if (op.body?.length) parts.push(`${op.form ? "form body" : "body"}: ${op.body.join(" ")}`)
	if (op.headers?.length) parts.push(`headers: ${op.headers.join(", ")}`)
	return parts.join(" | ")
}

/**
 * A service and its picked operations as a prompt block:
 *
 * ```
 * api stripe — Stripe API https://api.stripe.com auth=bearer secret=STRIPE_TOKEN
 * POST /v1/customers — Create a customer | form body: name email description
 * ```
 *
 * A service without a fixed host says so: its URL is the reader's to give.
 */
export function formatApiCard(card: ApiCard): string {
	const { service } = card
	const base = service.baseUrl ?? "(base URL: the account's own)"
	return [
		`api ${service.id} — ${service.name} ${base} ${authText(service)}`,
		...card.operations.map(formatApiOperation),
	].join("\n")
}

function pathPattern(path: string): RegExp {
	const escaped = path
		.split(/\{[^}]*\}/)
		.map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
		.join("[^/]+")
	return new RegExp(`^${escaped}/?$`)
}

/**
 * The operation of a service a call names, by method and path. The path may be
 * the spec's (`/repos/{owner}/{repo}/issues`) or filled in (`/repos/acme/web/issues`).
 */
export function findApiOperation(
	service: ApiService,
	method: string,
	path: string,
): ApiOperation | undefined {
	const bare = path.split("?")[0] ?? path
	const upper = method.toUpperCase()
	const same = service.operations.filter((op) => op.method === upper)
	return same.find((op) => op.path === bare) ?? same.find((op) => pathPattern(op.path).test(bare))
}

const FEEL_NAME = /^[A-Za-z_][A-Za-z0-9_]*$/

/**
 * A URL for the REST connector: the base URL and the path, each `{param}` of
 * the path read from the process variable of the same name —
 * `="https://api.github.com/repos/" + string(owner) + "/" + string(repo) + "/issues"`.
 * A path without parameters stays a literal URL.
 */
export function apiUrl(baseUrl: string, path: string): string {
	const parts = path.split(/(\{[^}]*\})/).filter((p) => p !== "")
	if (!parts.some((p) => p.startsWith("{"))) return `${baseUrl}${path}`
	const terms: string[] = []
	let literal = baseUrl
	for (const part of parts) {
		const name = /^\{([^}]*)\}$/.exec(part)?.[1]
		if (name !== undefined && FEEL_NAME.test(name)) {
			terms.push(JSON.stringify(literal), `string(${name})`)
			literal = ""
		} else {
			literal += part
		}
	}
	if (literal !== "") terms.push(JSON.stringify(literal))
	return `=${terms.filter((t) => t !== '""').join(" + ")}`
}

/** The headers an operation needs besides authentication, as a FEEL context; `undefined` when none. */
export function apiHeaders(op: ApiOperation): { headers?: string; missing: string[] } {
	const entries: string[] = []
	const missing: string[] = []
	if (op.form) entries.push(`"Content-Type": "application/x-www-form-urlencoded"`)
	for (const header of op.headers ?? []) {
		const colon = header.indexOf(":")
		if (colon < 0) missing.push(header)
		else {
			entries.push(
				`${JSON.stringify(header.slice(0, colon).trim())}: ${JSON.stringify(header.slice(colon + 1).trim())}`,
			)
		}
	}
	return entries.length > 0 ? { headers: `={${entries.join(", ")}}`, missing } : { missing }
}
