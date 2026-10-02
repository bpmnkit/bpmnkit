/**
 * `@bpmnkit/connector-gen/api-index` — an offline index of the HTTP APIs in the
 * catalog: per service its base URL and authentication, per operation the
 * method, path, a short summary and the parameter names a call needs.
 *
 * Built by `scripts/build-api-index.mjs` from the catalog's OpenAPI specs; no
 * spec is fetched at runtime. Each service is its own module, loaded with
 * {@link loadApiService} only when a request names it. The shapes match
 * `ApiService` in `@bpmnkit/core/connectors`, which turns them into API cards
 * and REST connector configuration.
 *
 * @packageDocumentation
 */

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
	/** The spec's `operationId`. */
	id?: string
	/** At most twelve words. */
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
	/** The license the spec states, when it states one. */
	license?: string
	operations: ApiOperation[]
}

/** A service of the index without its operations. */
export interface ApiServiceSummary {
	id: string
	name: string
	description?: string
}

import { loadApiService } from "./generated/api-index/index.js"

export { API_SERVICES, loadApiService } from "./generated/api-index/index.js"

/** Loads several services; unknown ids are left out. */
export async function loadApiServices(ids: readonly string[]): Promise<ApiService[]> {
	const loaded = await Promise.all(ids.map((id) => loadApiService(id)))
	return loaded.filter((s): s is ApiService => s !== undefined)
}
