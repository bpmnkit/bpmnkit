import { describe, expect, it } from "vitest"
import { tryItDecision } from "../src/api/try-it.js"

describe("Try it", () => {
	it("sends a GET of the REST connector", () => {
		expect(tryItDecision("io.camunda:http-json:1", "get")).toEqual({ send: true })
		expect(tryItDecision("io.camunda:http-json:1", undefined)).toEqual({ send: true })
	})

	it("simulates any other method, and says so", () => {
		expect(tryItDecision("io.camunda:http-json:1", "POST")).toEqual({
			send: false,
			note: "POST not sent: Try it only sends GET requests",
		})
	})

	it("simulates every other connector and job", () => {
		expect(tryItDecision("io.camunda:slack:1", undefined).send).toBe(false)
		expect(tryItDecision("payment-worker", "GET").send).toBe(false)
	})
})
