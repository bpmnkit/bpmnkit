import { describe, expect, it } from "vitest"
import { buildTemplates } from "../src/build-template.js"
import { detectDefaultAuth, getOperations, parseOpenApi } from "../src/parse-openapi.js"

const SWAGGER_SPEC = `
swagger: "2.0"
info:
  title: Pet API
  version: "1.0.0"
host: pets.example.com
basePath: /v1
schemes: [http, https]
securityDefinitions:
  oauth:
    type: oauth2
    flow: application
    tokenUrl: https://pets.example.com/oauth/token
    scopes: {}
parameters:
  limitParam:
    name: limit
    in: query
    type: integer
paths:
  /pets/{petId}:
    parameters:
      - name: petId
        in: path
        required: true
        type: string
    get:
      operationId: getPet
      parameters:
        - $ref: "#/parameters/limitParam"
      responses:
        "200":
          description: OK
          schema:
            $ref: "#/definitions/Pet"
    put:
      operationId: updatePet
      parameters:
        - name: body
          in: body
          required: true
          schema:
            $ref: "#/definitions/Pet"
      responses:
        "200":
          description: OK
  /pets/{petId}/photo:
    post:
      operationId: uploadPhoto
      consumes: [multipart/form-data]
      parameters:
        - name: petId
          in: path
          required: true
          type: string
        - name: caption
          in: formData
          type: string
          required: true
      responses:
        "204":
          description: No content
definitions:
  Pet:
    type: object
    properties:
      name: { type: string }
      tag: { type: string }
`

describe("Swagger 2.0 specs", () => {
	it("upgrades to OpenAPI 3 when parsed", () => {
		const doc = parseOpenApi(SWAGGER_SPEC)
		expect(doc.openapi).toBe("3.0.3")
		expect(doc.servers).toEqual([{ url: "https://pets.example.com/v1" }])
		expect(doc.components?.schemas?.Pet).toBeDefined()
	})

	it("resolves path params, $ref params, body and responses", () => {
		const ops = getOperations(parseOpenApi(SWAGGER_SPEC))
		const get = ops.find((o) => o.operation.operationId === "getPet")
		expect(get?.baseUrl).toBe("https://pets.example.com/v1")
		expect(get?.pathParams.map((p) => p.name)).toEqual(["petId"])
		expect(get?.queryParams.map((p) => p.name)).toEqual(["limit"])
		expect(get?.responseSchema?.properties?.name).toEqual({ type: "string" })

		const put = ops.find((o) => o.operation.operationId === "updatePet")
		expect(put?.requestBodySchema?.properties?.tag).toEqual({ type: "string" })
	})

	it("turns formData parameters into a form request body", () => {
		const op = getOperations(parseOpenApi(SWAGGER_SPEC)).find(
			(o) => o.operation.operationId === "uploadPhoto",
		)
		expect(op?.pathParams.map((p) => p.name)).toEqual(["petId"])
		expect(op?.operation.requestBody).toEqual({
			content: {
				"application/x-www-form-urlencoded": {
					schema: {
						type: "object",
						properties: { caption: { type: "string" } },
						required: ["caption"],
					},
				},
			},
		})
	})

	it("maps securityDefinitions to securitySchemes", () => {
		expect(detectDefaultAuth(parseOpenApi(SWAGGER_SPEC))).toBe("oauth-client-credentials-flow")
	})

	it("generates one template per operation", () => {
		const templates = buildTemplates(getOperations(parseOpenApi(SWAGGER_SPEC)), {
			idPrefix: "com.example",
		})
		expect(templates).toHaveLength(3)
	})
})
