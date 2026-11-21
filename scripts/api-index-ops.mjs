/**
 * Pure functions that turn an OpenAPI/Swagger document into an API-index service
 * (`@bpmnkit/connector-gen/api-index`). Shared by `build-api-index.mjs` and
 * `record-api-index-fixtures.mjs`, the oracle of the Rust twin in `bpmnkit-connectors`.
 */

import { parse as parseYaml } from "yaml"

const METHODS = ["get", "post", "put", "patch", "delete"]
const MAX_SUMMARY_WORDS = 12
/** Body properties and query parameters shown per operation, required ones first. */
const MAX_FIELDS = 6

export function parseSpec(text) {
	return text.trimStart().startsWith("{") ? JSON.parse(text) : parseYaml(text)
}

export function deref(doc, value, seen = new Set()) {
	if (!value || typeof value !== "object" || typeof value.$ref !== "string") return value
	const ref = value.$ref
	if (!ref.startsWith("#/") || seen.has(ref)) return undefined
	seen.add(ref)
	let current = doc
	for (const part of ref.slice(2).split("/")) {
		current = current?.[decodeURIComponent(part.replace(/~1/g, "/").replace(/~0/g, "~"))]
		if (current === undefined) return undefined
	}
	return deref(doc, current, seen)
}

/** Top-level properties of a schema, `allOf` parts merged. */
export function properties(doc, schema, depth = 0) {
	const s = deref(doc, schema)
	if (!s || typeof s !== "object" || depth > 4) return { names: [], required: new Set() }
	const names = Object.keys(s.properties ?? {})
	const required = new Set(Array.isArray(s.required) ? s.required : [])
	for (const part of s.allOf ?? []) {
		const inner = properties(doc, part, depth + 1)
		names.push(...inner.names)
		for (const r of inner.required) required.add(r)
	}
	return { names: [...new Set(names)], required }
}

/** Fields most calls set, shown before the rest when a spec marks few as required. */
const COMMON = [
	"name",
	"title",
	"email",
	"text",
	"content",
	"description",
	"amount",
	"currency",
	"status",
	"message",
	"body",
]

export function fields(names, required) {
	const rank = (n) =>
		required.has(n) ? -1 : COMMON.includes(n) ? COMMON.indexOf(n) : COMMON.length
	const ordered = [...names].sort((a, b) => rank(a) - rank(b))
	return ordered.slice(0, MAX_FIELDS).map((n) => (required.has(n) ? `${n}*` : n))
}

/** Hosts that stand for a tenant's own: the URL is the caller's to give. */
const PLACEHOLDER_HOST =
	/your[-_]?(domain|instance|site|company)|example\.|subdomain|store_hash|^server\.|_id\b|consulting|^demo\.|\.local$|apiblueprint/i

export function absolute(url) {
	const match = /^https?:\/\/([^/{}\s]+)/.exec(url)
	// A bot token in the path (Telegram) is a credential, not a base URL
	if (!match?.[1] || PLACEHOLDER_HOST.test(match[1]) || /\/bot\d+:/.test(url)) return undefined
	return url.replace(/\/$/, "")
}

export function baseUrlOf(doc) {
	if (doc.swagger) {
		if (!doc.host) return undefined
		const scheme = doc.schemes?.includes("https") || !doc.schemes ? "https" : doc.schemes[0]
		return absolute(`${scheme}://${doc.host}${doc.basePath ?? ""}`)
	}
	const server = doc.servers?.[0]
	if (!server?.url) return undefined
	let url = server.url
	for (const [key, variable] of Object.entries(server.variables ?? {})) {
		if (variable?.default !== undefined) url = url.replace(`{${key}}`, String(variable.default))
	}
	return absolute(url)
}

/** How a service authenticates, preferring a bearer token, then an API key, then basic. */
export function authOf(doc, fallback) {
	const schemes = Object.values(
		(doc.swagger ? doc.securityDefinitions : doc.components?.securitySchemes) ?? {},
	)
		.map((s) => deref(doc, s))
		.filter(Boolean)
	const bearer = schemes.find(
		(s) => s.type === "http" && String(s.scheme).toLowerCase() === "bearer",
	)
	if (bearer) return { type: "bearer" }
	const key = schemes.find((s) => s.type === "apiKey" && (s.in === "header" || s.in === "query"))
	if (key) {
		// An "Authorization" key is a token by another name
		if (key.in === "header" && /^authorization$/i.test(key.name)) return { type: "bearer" }
		return { type: "apiKey", in: key.in, name: key.name }
	}
	if (schemes.some((s) => (s.type === "http" && s.scheme === "basic") || s.type === "basic")) {
		return { type: "basic" }
	}
	if (
		schemes.some(
			(s) => s.type === "oauth2" && (s.flows?.clientCredentials || s.flow === "application"),
		)
	) {
		return { type: "oauth-client-credentials-flow" }
	}
	return { type: fallback === "apiKey" ? "noAuth" : fallback }
}

export function summaryOf(op) {
	const text = String(op.summary ?? op.description ?? "")
		.split(/\n/)[0]
		.replace(/[`*_[\]]/g, "")
		.replace(/\(([^)]*)\)/g, "")
		.trim()
	const words = text.split(/\s+/).filter(Boolean)
	if (words.length === 0) return undefined
	return words.length > MAX_SUMMARY_WORDS
		? `${words.slice(0, MAX_SUMMARY_WORDS).join(" ")}…`
		: words.join(" ").replace(/\.$/, "")
}

export function operationsOf(doc) {
	const out = []
	for (const [path, rawItem] of Object.entries(doc.paths ?? {})) {
		const item = deref(doc, rawItem)
		if (!item || typeof item !== "object") continue
		for (const method of METHODS) {
			const op = item[method]
			if (!op || op.deprecated) continue
			try {
				const params = [...(item.parameters ?? []), ...(op.parameters ?? [])]
					.map((p) => deref(doc, p))
					.filter((p) => p?.name)
				const byName = new Map(params.map((p) => [`${p.in}:${p.name}`, p]))
				const all = [...byName.values()]
				const query = all.filter((p) => p.in === "query")
				const queryRequired = new Set(query.filter((p) => p.required).map((p) => p.name))
				const headers = all
					.filter(
						(p) =>
							p.in === "header" &&
							p.required &&
							!/^(authorization|content-type|accept)$/i.test(p.name),
					)
					.map((p) => {
						const schema = deref(doc, p.schema) ?? p
						const value = schema.default ?? schema.enum?.[0] ?? p.example ?? schema.example
						return value === undefined ? p.name : `${p.name}: ${value}`
					})

				let body = []
				let form = false
				if (doc.swagger) {
					const inBody = all.find((p) => p.in === "body")
					if (inBody) {
						const { names, required } = properties(doc, inBody.schema)
						body = fields(names, required)
					}
					const formData = all.filter((p) => p.in === "formData")
					if (formData.length > 0) {
						form = true
						body = fields(
							formData.map((p) => p.name),
							new Set(formData.filter((p) => p.required).map((p) => p.name)),
						)
					}
				} else {
					const content = deref(doc, op.requestBody)?.content ?? {}
					const type =
						Object.keys(content).find((t) => t.includes("json")) ?? Object.keys(content)[0]
					if (type) {
						form = type === "application/x-www-form-urlencoded"
						const { names, required } = properties(doc, content[type]?.schema)
						body = fields(names, required)
					}
				}

				const entry = { method: method.toUpperCase(), path }
				// The operation id only where there is no summary: it is mostly the summary's words
				const summary = summaryOf(op)
				if (summary) entry.summary = summary
				else if (op.operationId) entry.id = String(op.operationId)
				const queryFields = fields(
					query.map((p) => p.name),
					queryRequired,
				)
				if (queryFields.length > 0) entry.query = queryFields
				if (headers.length > 0) entry.headers = headers
				if (body.length > 0) entry.body = body
				if (form && body.length > 0) entry.form = true
				out.push(entry)
			} catch (err) {
				console.warn(`    skip ${method.toUpperCase()} ${path}: ${err.message}`)
			}
		}
	}
	return out
}
