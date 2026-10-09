import { afterEach, describe, expect, it, vi } from "vitest"
import { CamundaClient } from "../generated/resources.js"

afterEach(() => {
	vi.unstubAllGlobals()
})

function stubFetch(): ReturnType<typeof vi.fn> {
	const fetchMock = vi.fn(async () => Response.json({ deploymentKey: "1", deployments: [] }))
	vi.stubGlobal("fetch", fetchMock)
	return fetchMock
}

describe("HttpClient request bodies", () => {
	it("sends a deployment's files as multipart form data", async () => {
		const fetchMock = stubFetch()
		const client = new CamundaClient({
			baseUrl: "http://localhost:8080/v2",
			auth: { type: "none" },
		})
		const form = new FormData()
		form.append("resources", new Blob(["<definitions/>"]), "order.bpmn")

		await client.resource.createDeployment(form)

		const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
		expect(url).toBe("http://localhost:8080/v2/deployments")
		expect(init.body).toBe(form)
		// fetch sets multipart/form-data with its boundary only when no Content-Type is given
		expect(init.headers).not.toHaveProperty("Content-Type")
	})

	it("still sends JSON bodies as JSON", async () => {
		const fetchMock = stubFetch()
		const client = new CamundaClient({
			baseUrl: "http://localhost:8080/v2",
			auth: { type: "none" },
		})

		await client.processInstance.createProcessInstance({ processDefinitionId: "order" } as never)

		const [, init] = fetchMock.mock.calls[0] as [string, RequestInit]
		expect(init.body).toBe(JSON.stringify({ processDefinitionId: "order" }))
		expect(init.headers).toHaveProperty("Content-Type", "application/json")
	})
})

describe("HttpClient text responses", () => {
	const client = () =>
		new CamundaClient({ baseUrl: "http://localhost:8080/v2", auth: { type: "none" } })

	it("returns a process definition's XML as text", async () => {
		const xml = '<?xml version="1.0"?><definitions/>'
		const fetchMock = vi.fn(
			async () => new Response(xml, { headers: { "content-type": "text/xml" } }),
		)
		vi.stubGlobal("fetch", fetchMock)

		expect(await client().processDefinition.getProcessDefinitionXML("1")).toBe(xml)
		const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
		expect(init.headers).toHaveProperty("Accept", "text/xml")
	})

	it("returns undefined when the definition has no XML (204)", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn(async () => new Response(null, { status: 204 })),
		)

		expect(await client().processDefinition.getProcessDefinitionXML("1")).toBeUndefined()
	})
})
