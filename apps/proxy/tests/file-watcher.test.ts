import { afterEach, describe, expect, it, vi } from "vitest"
import { fetchDeployedProcesses, fetchProcessXml } from "../src/triggers/file-watcher.js"

const BASE = "http://localhost:8080/v2"

afterEach(() => {
	vi.unstubAllGlobals()
})

describe("file-watch trigger lookups", () => {
	it("keeps the latest version of each process definition", async () => {
		const fetchMock = vi.fn(async () =>
			Response.json({
				items: [
					{ processDefinitionId: "intake", processDefinitionKey: "11", version: 1 },
					{ processDefinitionId: "intake", processDefinitionKey: "12", version: 2 },
					{ processDefinitionId: "report", processDefinitionKey: "21", version: 1 },
				],
			}),
		)
		vi.stubGlobal("fetch", fetchMock)

		expect(await fetchDeployedProcesses(BASE, "")).toEqual([
			{ processDefinitionId: "intake", processDefinitionKey: "12" },
			{ processDefinitionId: "report", processDefinitionKey: "21" },
		])
		const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
		expect(url).toBe(`${BASE}/process-definitions/search`)
		expect(JSON.parse(String(init.body))).toEqual({ page: { limit: 100 } })
	})

	it("fetches the XML by definition key and reads it as text", async () => {
		const xml = "<definitions/>"
		const fetchMock = vi.fn(
			async () => new Response(xml, { headers: { "content-type": "application/xml" } }),
		)
		vi.stubGlobal("fetch", fetchMock)

		expect(await fetchProcessXml(BASE, "", "12")).toBe(xml)
		const [url] = fetchMock.mock.calls[0] as unknown as [string]
		expect(url).toBe(`${BASE}/process-definitions/12/xml`)
	})

	it("returns null when the definition has no XML", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn(async () => new Response(null, { status: 204 })),
		)
		expect(await fetchProcessXml(BASE, "", "12")).toBeNull()
	})
})
