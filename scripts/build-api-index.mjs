#!/usr/bin/env node
/**
 * Builds the offline API index of `@bpmnkit/connector-gen/api-index`: for every
 * service of the connector-gen catalog, its base URL, how it authenticates and,
 * per operation, the method, path, a short summary and the parameter names a
 * call needs. The connect pass shows these as API cards, so the REST connector
 * gets a real URL instead of one the model remembers
 * (`doc/ai-connector-generation-plan.md` WS4).
 *
 * Writes one module per service to packages/connector-gen/src/generated/api-index/
 * and an index of them. A file whose content did not change is not rewritten,
 * and a service whose spec cannot be fetched keeps the module it had.
 *
 * Only specs under a permissive license, or none stated, are indexed: a spec
 * that names a non-commercial, copyleft or proprietary license is skipped.
 *
 *   node scripts/build-api-index.mjs                 # fetch every spec
 *   node scripts/build-api-index.mjs --from-dir DIR  # read DIR/<id> instead (offline)
 *   node scripts/build-api-index.mjs --only github,stripe
 */

import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { parse as parseYaml } from "yaml"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const OUT = join(ROOT, "packages/connector-gen/src/generated/api-index")
const { CATALOG } = await import(join(ROOT, "packages/connector-gen/dist/catalog.js"))

const args = process.argv.slice(2)
const option = (name) => {
	const i = args.indexOf(name)
	return i < 0 ? undefined : args[i + 1]
}
const fromDir = option("--from-dir")
const only = option("--only")?.split(",")

const METHODS = ["get", "post", "put", "patch", "delete"]
const MAX_SUMMARY_WORDS = 12
/** Body properties and query parameters shown per operation, required ones first. */
const MAX_FIELDS = 6
const FETCH_TIMEOUT_MS = 60_000

/** Licenses whose terms allow keeping a derived index of the spec. */
const PERMISSIVE =
	/^(mit|apache|bsd|isc|cc0|cc-by(?!-nc)|creative commons attribution(?! ?-?non)|unlicense)/i

// ── Reading a spec ────────────────────────────────────────────────────────────

function parseSpec(text) {
	return text.trimStart().startsWith("{") ? JSON.parse(text) : parseYaml(text)
}

function deref(doc, value, seen = new Set()) {
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
function properties(doc, schema, depth = 0) {
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

function fields(names, required) {
	const rank = (n) =>
		required.has(n) ? -1 : COMMON.includes(n) ? COMMON.indexOf(n) : COMMON.length
	const ordered = [...names].sort((a, b) => rank(a) - rank(b))
	return ordered.slice(0, MAX_FIELDS).map((n) => (required.has(n) ? `${n}*` : n))
}

/** Hosts that stand for a tenant's own: the URL is the caller's to give. */
const PLACEHOLDER_HOST =
	/your[-_]?(domain|instance|site|company)|example\.|subdomain|store_hash|^server\.|_id\b|consulting|^demo\.|\.local$|apiblueprint/i

function absolute(url) {
	const match = /^https?:\/\/([^/{}\s]+)/.exec(url)
	// A bot token in the path (Telegram) is a credential, not a base URL
	if (!match?.[1] || PLACEHOLDER_HOST.test(match[1]) || /\/bot\d+:/.test(url)) return undefined
	return url.replace(/\/$/, "")
}

function baseUrlOf(doc) {
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
function authOf(doc, fallback) {
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

function summaryOf(op) {
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

function operationsOf(doc) {
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

// ── Building ──────────────────────────────────────────────────────────────────

async function load(entry) {
	if (fromDir) {
		const file = join(fromDir, entry.id)
		return existsSync(file) ? readFileSync(file, "utf8") : undefined
	}
	const res = await fetch(entry.url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) })
	if (!res.ok) throw new Error(`HTTP ${res.status}`)
	return res.text()
}

function moduleName(id) {
	return id.replace(/[^a-z0-9]+/gi, "-")
}

function writeIfChanged(file, content) {
	if (existsSync(file) && readFileSync(file, "utf8") === content) return false
	writeFileSync(file, content)
	return true
}

const HEADER = "// Generated by scripts/build-api-index.mjs — do not edit.\n"

const services = []
/** Services a license or an empty spec rules out: their modules go. A failed fetch keeps its module. */
const refused = new Set()
let skipped = 0
for (const entry of CATALOG) {
	if (only && !only.includes(entry.id)) continue
	let text
	try {
		text = await load(entry)
	} catch (err) {
		console.warn(`  SKIP ${entry.id}: ${err.message}`)
		skipped++
		continue
	}
	if (text === undefined) {
		console.warn(`  SKIP ${entry.id}: no spec in ${fromDir}`)
		skipped++
		continue
	}
	let doc
	try {
		doc = parseSpec(text)
	} catch (err) {
		console.warn(`  SKIP ${entry.id}: ${String(err.message).split("\n")[0]}`)
		skipped++
		continue
	}
	const license = doc.info?.license?.name
	if (license && !PERMISSIVE.test(license)) {
		console.warn(`  SKIP ${entry.id}: license "${license}"`)
		refused.add(entry.id)
		skipped++
		continue
	}
	const operations = operationsOf(doc)
	if (operations.length === 0) {
		console.warn(`  SKIP ${entry.id}: no operations`)
		refused.add(entry.id)
		skipped++
		continue
	}
	const service = { id: entry.id, name: entry.name }
	const baseUrl = baseUrlOf(doc)
	if (baseUrl) service.baseUrl = baseUrl
	service.auth = authOf(doc, entry.defaultAuth)
	if (license) service.license = license
	service.operations = operations
	services.push({ entry, service })
	console.log(`  ✓ ${entry.id} — ${operations.length} operations`)
}

mkdirSync(OUT, { recursive: true })
let changed = 0
for (const { service } of services) {
	const file = `${moduleName(service.id)}.ts`
	// One operation per line: compact, and a refresh diffs by operation
	const { operations, ...head } = service
	const literal = `${JSON.stringify(head).slice(0, -1)},"operations":[\n${operations.map((o) => `\t${JSON.stringify(o)}`).join(",\n")}\n]}`
	const content = `${HEADER}import type { ApiService } from "../../api-index.js"\n\nconst service: ApiService = ${literal}\n\nexport default service\n`
	if (writeIfChanged(join(OUT, file), content)) changed++
}
// A service that left the catalog, or whose spec is now refused, leaves the index. One
// whose spec could not be fetched this time keeps the module it had.
const catalogModules = new Set(
	CATALOG.filter((e) => !refused.has(e.id)).map((e) => `${moduleName(e.id)}.ts`),
)
for (const file of readdirSync(OUT)) {
	if (file !== "index.ts" && !catalogModules.has(file)) {
		rmSync(join(OUT, file))
		changed++
	}
}

const present = new Set(readdirSync(OUT))
const summaries = CATALOG.filter((e) => present.has(`${moduleName(e.id)}.ts`)).map((e) => ({
	id: e.id,
	name: e.name,
	description: e.description,
}))
const index = `${HEADER}import type { ApiService, ApiServiceSummary } from "../../api-index.js"

/** Every indexed service, without its operations. */
export const API_SERVICES: readonly ApiServiceSummary[] = ${JSON.stringify(summaries, null, "\t")}

/** Loads one service of the index, operations included; \`undefined\` for an unknown id. */
export async function loadApiService(id: string): Promise<ApiService | undefined> {
\tswitch (id) {
${summaries.map((s) => `\t\tcase ${JSON.stringify(s.id)}:\n\t\t\treturn (await import("./${moduleName(s.id)}.js")).default`).join("\n")}
\t\tdefault:
\t\t\treturn undefined
\t}
}
`
if (writeIfChanged(join(OUT, "index.ts"), index)) changed++

console.log(
	`\n${services.length} services indexed, ${skipped} skipped, ${changed} file(s) written to ${OUT}`,
)
