import { describe, expect, it } from "vitest"
import { connectRefusal } from "../src/lib/connect.js"

describe("connectRefusal", () => {
	it("leaves the reason empty when the route is off", () => {
		expect(connectRefusal(404, "Not found")).toBe("")
	})

	it("keeps the reason for other errors", () => {
		expect(connectRefusal(400, "request too long")).toBe("request too long")
		expect(connectRefusal(500, 42)).toBe("")
	})
})
