/**
 * Swagger 2.0 → OpenAPI 3 upgrade, covering what the generator reads: servers,
 * schemas, parameters, JSON/form request bodies, JSON responses and security
 * schemes. Anything else is carried over untouched.
 */

type Json = Record<string, unknown>

const PARAM_SCHEMA_KEYS = [
	"type",
	"format",
	"items",
	"enum",
	"default",
	"minimum",
	"maximum",
	"minLength",
	"maxLength",
	"pattern",
]

const HTTP_METHODS = ["get", "put", "post", "delete", "options", "head", "patch"]

function isObject(value: unknown): value is Json {
	return typeof value === "object" && value !== null && !Array.isArray(value)
}

/** Point Swagger 2 `$ref`s at the OpenAPI 3 `components` sections they moved to. */
function rewriteRefs(value: unknown): unknown {
	if (Array.isArray(value)) return value.map(rewriteRefs)
	if (!isObject(value)) return value
	const out: Json = {}
	for (const [key, child] of Object.entries(value)) {
		if (key === "$ref" && typeof child === "string") {
			out[key] = child
				.replace(/^#\/definitions\//, "#/components/schemas/")
				.replace(/^#\/parameters\//, "#/components/parameters/")
				.replace(/^#\/responses\//, "#/components/responses/")
		} else {
			out[key] = rewriteRefs(child)
		}
	}
	return out
}

function upgradeParameter(param: Json): Json {
	if (typeof param.$ref === "string") return param
	const schema: Json = {}
	const out: Json = {}
	for (const [key, value] of Object.entries(param)) {
		if (PARAM_SCHEMA_KEYS.includes(key)) schema[key] = value
		else if (key !== "collectionFormat" && key !== "allowEmptyValue") out[key] = value
	}
	if (Object.keys(schema).length > 0) out.schema = schema
	return out
}

function upgradeResponse(response: Json, produces: string[]): Json {
	if (typeof response.$ref === "string") return response
	const { schema, examples: _examples, ...rest } = response
	if (!schema) return rest
	const types = produces.length > 0 ? produces : ["application/json"]
	const content: Json = {}
	for (const type of types) content[type] = { schema }
	return { ...rest, content }
}

function upgradeOperation(
	op: Json,
	pathParams: Json[],
	consumes: string[],
	produces: string[],
): Json {
	const { parameters, responses, consumes: opConsumes, produces: opProduces, ...rest } = op
	const opParams = Array.isArray(parameters) ? parameters.filter(isObject) : []
	// Op-level parameters override path-level ones by name + location.
	const merged = new Map<string, Json>()
	for (const p of [...pathParams, ...opParams]) {
		merged.set(typeof p.$ref === "string" ? p.$ref : `${p.in}:${p.name}`, p)
	}
	const all = [...merged.values()]

	const out: Json = { ...rest }
	const regular = all.filter((p) => p.in !== "body" && p.in !== "formData")
	if (regular.length > 0) out.parameters = regular.map(upgradeParameter)

	const body = all.find((p) => p.in === "body")
	const form = all.filter((p) => p.in === "formData")
	const opTypes = Array.isArray(opConsumes) ? (opConsumes as string[]) : consumes
	if (body) {
		const types = opTypes.filter((t) => t.includes("json"))
		const content: Json = {}
		for (const type of types.length > 0 ? types : ["application/json"]) {
			content[type] = { schema: body.schema }
		}
		out.requestBody = {
			...(body.description ? { description: body.description } : {}),
			required: body.required === true,
			content,
		}
	} else if (form.length > 0) {
		const properties: Json = {}
		const required: string[] = []
		for (const p of form) {
			const { schema } = upgradeParameter(p)
			properties[String(p.name)] = { ...(schema as Json), description: p.description }
			if (p.required === true) required.push(String(p.name))
		}
		const type = form.some((p) => p.type === "file")
			? "multipart/form-data"
			: "application/x-www-form-urlencoded"
		out.requestBody = {
			content: { [type]: { schema: { type: "object", properties, required } } },
		}
	}

	if (isObject(responses)) {
		const opProd = Array.isArray(opProduces) ? (opProduces as string[]) : produces
		const upgraded: Json = {}
		for (const [code, resp] of Object.entries(responses)) {
			upgraded[code] = isObject(resp) ? upgradeResponse(resp, opProd) : resp
		}
		out.responses = upgraded
	}
	return out
}

function upgradeSecurityScheme(scheme: Json): Json {
	if (scheme.type === "basic") return { type: "http", scheme: "basic" }
	if (scheme.type !== "oauth2") return scheme
	const { flow, authorizationUrl, tokenUrl, scopes = {}, ...rest } = scheme
	const flowName =
		flow === "application"
			? "clientCredentials"
			: flow === "accessCode"
				? "authorizationCode"
				: String(flow)
	return {
		...rest,
		type: "oauth2",
		flows: { [flowName]: { authorizationUrl, tokenUrl, scopes } },
	}
}

/** Returns true for a Swagger 2.0 document (`swagger: "2.0"`). */
export function isSwagger2(doc: unknown): doc is Json {
	return isObject(doc) && typeof doc.swagger === "string" && doc.swagger.startsWith("2.")
}

/** Convert a Swagger 2.0 document to the OpenAPI 3 shape the generator reads. */
export function upgradeSwagger2(input: Json): Json {
	const doc = rewriteRefs(input) as Json
	const {
		swagger: _swagger,
		host,
		basePath,
		schemes,
		consumes,
		produces,
		definitions,
		parameters,
		responses,
		securityDefinitions,
		paths,
		...rest
	} = doc

	const out: Json = { ...rest, openapi: "3.0.3" }

	if (typeof host === "string") {
		const list = Array.isArray(schemes) ? (schemes as string[]) : []
		const scheme = list.includes("https") ? "https" : (list[0] ?? "https")
		out.servers = [{ url: `${scheme}://${host}${typeof basePath === "string" ? basePath : ""}` }]
	} else if (typeof basePath === "string") {
		out.servers = [{ url: basePath }]
	}

	const components: Json = {}
	if (isObject(definitions)) components.schemas = definitions
	if (isObject(parameters)) {
		const params: Json = {}
		for (const [name, p] of Object.entries(parameters)) {
			if (isObject(p)) params[name] = upgradeParameter(p)
		}
		components.parameters = params
	}
	if (isObject(responses)) {
		const resps: Json = {}
		for (const [name, r] of Object.entries(responses)) {
			if (isObject(r)) resps[name] = upgradeResponse(r, ["application/json"])
		}
		components.responses = resps
	}
	if (isObject(securityDefinitions)) {
		const schemesOut: Json = {}
		for (const [name, s] of Object.entries(securityDefinitions)) {
			if (isObject(s)) schemesOut[name] = upgradeSecurityScheme(s)
		}
		components.securitySchemes = schemesOut
	}
	if (Object.keys(components).length > 0) out.components = components

	const docConsumes = Array.isArray(consumes) ? (consumes as string[]) : []
	const docProduces = Array.isArray(produces) ? (produces as string[]) : []
	const pathsOut: Json = {}
	for (const [path, item] of Object.entries(isObject(paths) ? paths : {})) {
		if (!isObject(item)) continue
		const pathParams = Array.isArray(item.parameters) ? item.parameters.filter(isObject) : []
		const itemOut: Json = {}
		for (const [key, value] of Object.entries(item)) {
			if (key === "parameters") continue
			itemOut[key] =
				HTTP_METHODS.includes(key) && isObject(value)
					? upgradeOperation(value, pathParams, docConsumes, docProduces)
					: value
		}
		pathsOut[path] = itemOut
	}
	out.paths = pathsOut
	return out
}
