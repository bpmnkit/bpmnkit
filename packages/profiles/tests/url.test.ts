import { describe, expect, it } from "vitest"
import { clusterApiUrl } from "../src/index.js"

describe("clusterApiUrl", () => {
	it("does not double the /v2 a profile base URL already ends in", () => {
		expect(clusterApiUrl("https://bru-2.zeebe.camunda.io/abc/v2", "/deployments")).toBe(
			"https://bru-2.zeebe.camunda.io/abc/v2/deployments",
		)
	})

	it("adds /v2 when the base URL has none", () => {
		expect(clusterApiUrl("http://localhost:8080", "/jobs/activation")).toBe(
			"http://localhost:8080/v2/jobs/activation",
		)
	})

	it("ignores trailing and leading slashes", () => {
		expect(clusterApiUrl("http://localhost:8080/v2/", "process-instances")).toBe(
			"http://localhost:8080/v2/process-instances",
		)
	})
})
