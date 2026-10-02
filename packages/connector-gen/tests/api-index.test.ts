import { describe, expect, it } from "vitest"
import { API_SERVICES, loadApiService, loadApiServices } from "../src/api-index.js"
import { CATALOG } from "../src/catalog.js"

const METHODS = new Set(["GET", "POST", "PUT", "PATCH", "DELETE"])

describe("the API index", () => {
	it("indexes catalog services, each once", () => {
		const ids = API_SERVICES.map((s) => s.id)
		expect(new Set(ids).size).toBe(ids.length)
		const catalog = new Set(CATALOG.map((e) => e.id))
		for (const id of ids) expect(catalog.has(id)).toBe(true)
		expect(ids).toEqual(expect.arrayContaining(["github", "stripe", "notion"]))
	})

	it("loads every service it lists, with well-formed operations", async () => {
		for (const summary of API_SERVICES) {
			const service = await loadApiService(summary.id)
			expect(service?.id).toBe(summary.id)
			expect(service?.operations.length).toBeGreaterThan(0)
			if (service?.baseUrl !== undefined) expect(service.baseUrl).toMatch(/^https?:\/\/[^/]+/)
			for (const op of service?.operations ?? []) {
				expect(METHODS.has(op.method)).toBe(true)
				expect(op.path.startsWith("/")).toBe(true)
			}
		}
	})

	it("keeps what a REST call needs: base URL, auth, path, body fields", async () => {
		const [stripe, notion] = await loadApiServices(["stripe", "notion", "acme"])
		expect(stripe).toMatchObject({ baseUrl: "https://api.stripe.com", auth: { type: "bearer" } })
		expect(stripe?.operations).toContainEqual(
			expect.objectContaining({ method: "POST", path: "/v1/customers", form: true }),
		)
		const page = notion?.operations.find((o) => o.method === "POST" && o.path === "/v1/pages")
		expect(page?.headers?.[0]).toMatch(/^Notion-Version: \d{4}-\d{2}-\d{2}$/)
		expect(await loadApiService("acme")).toBeUndefined()
	})

	it("leaves out specs under a non-commercial or proprietary license", () => {
		const ids = new Set(API_SERVICES.map((s) => s.id))
		for (const id of ["circleci", "mollie", "cohere", "trello", "lago"]) {
			expect(ids.has(id)).toBe(false)
		}
	})
})
