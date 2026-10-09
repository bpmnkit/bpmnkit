import { describe, expect, it } from "vitest"
import {
	type GeneratorSettings,
	generateConnectors,
	serializeTemplates,
	templatesFileName,
} from "../src/scripts/connector-generator.js"

const SETTINGS: GeneratorSettings = {
	idPrefix: "com.example",
	baseUrl: "",
	filter: "",
	expandBody: false,
	auth: "auto",
}

const OPENAPI = JSON.stringify({
	openapi: "3.0.3",
	info: { title: "Pet Store API", version: "1.2.0" },
	servers: [{ url: "https://pets.example.com" }],
	components: { securitySchemes: { token: { type: "http", scheme: "bearer" } } },
	paths: {
		"/pets": {
			get: { operationId: "listPets", responses: { "200": { description: "OK" } } },
			post: { operationId: "createPet", responses: { "201": { description: "Created" } } },
		},
	},
})

const SWAGGER = `
swagger: "2.0"
info: { title: Legacy, version: "1" }
host: legacy.example.com
paths:
  /things:
    get:
      operationId: listThings
      responses: { "200": { description: OK } }
`

describe("generateConnectors", () => {
	it("generates one connector per operation with its method and path", () => {
		const result = generateConnectors(OPENAPI, SETTINGS)
		expect(result.title).toBe("Pet Store API")
		expect(result.version).toBe("1.2.0")
		expect(result.auth).toBe("bearer")
		expect(result.connectors.map((c) => `${c.method} ${c.path}`)).toEqual([
			"GET /pets",
			"POST /pets",
		])
		expect(result.connectors[0]?.template.id).toMatch(/^com\.example\./)
	})

	it("accepts Swagger 2.0 specs", () => {
		const result = generateConnectors(SWAGGER, SETTINGS)
		expect(result.connectors).toHaveLength(1)
		expect(JSON.stringify(result.connectors[0]?.template)).toContain(
			"https://legacy.example.com/things",
		)
	})

	it("applies the filter, base URL and auth overrides", () => {
		const result = generateConnectors(OPENAPI, {
			...SETTINGS,
			filter: "create",
			baseUrl: "https://staging.example.com/",
			auth: "apiKey",
		})
		expect(result.auth).toBe("apiKey")
		expect(result.connectors.map((c) => c.path)).toEqual(["/pets"])
		expect(JSON.stringify(result.connectors[0]?.template)).toContain(
			"https://staging.example.com/pets",
		)
	})

	it("explains bad input", () => {
		expect(() => generateConnectors(OPENAPI, { ...SETTINGS, idPrefix: " " })).toThrow("ID prefix")
		expect(() => generateConnectors(OPENAPI, { ...SETTINGS, filter: "(" })).toThrow(
			"not a valid regular expression",
		)
		expect(() => generateConnectors("just text", SETTINGS)).toThrow()
	})
})

describe("serializeTemplates", () => {
	it("writes a lone template as an object and several as an array", () => {
		const templates = generateConnectors(OPENAPI, SETTINGS).connectors.map((c) => c.template)
		expect(Array.isArray(JSON.parse(serializeTemplates(templates)))).toBe(true)
		expect(JSON.parse(serializeTemplates(templates.slice(0, 1))).id).toBe(templates[0]?.id)
	})
})

describe("templatesFileName", () => {
	it("slugs the API title", () => {
		expect(templatesFileName("Pet Store API")).toBe("pet-store-api-connectors.json")
		expect(templatesFileName("  ")).toBe("api-connectors.json")
	})
})
