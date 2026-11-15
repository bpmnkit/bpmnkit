import { readFileSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import {
	WITHOUT_SDK_SYSTEM_PROMPT,
	buildCompactJsonSystemPrompt,
	buildCompactSystemPrompt,
	buildPlanSystemPrompt,
	buildSdkSystemPrompt,
} from "./system-prompt.js"

const REPO_ROOT = join(fileURLToPath(import.meta.url), "../../../../")

describe("buildSdkSystemPrompt", () => {
	it("returns a non-empty string", () => {
		const prompt = buildSdkSystemPrompt(REPO_ROOT)
		expect(typeof prompt).toBe("string")
		expect(prompt.length).toBeGreaterThan(500)
	})

	it("includes the SDK package name", () => {
		const prompt = buildSdkSystemPrompt(REPO_ROOT)
		expect(prompt).toContain("@bpmnkit/core")
	})

	it("includes the example loan approval code", () => {
		const prompt = buildSdkSystemPrompt(REPO_ROOT)
		expect(prompt).toContain("LoanApproval")
	})

	it("includes the output instruction", () => {
		const prompt = buildSdkSystemPrompt(REPO_ROOT)
		expect(prompt).toContain("process.stdout.write")
	})

	it("embeds the generated builder reference, not the package README", () => {
		const prompt = buildSdkSystemPrompt(REPO_ROOT)
		expect(prompt).toContain("## Builder Reference")
		expect(prompt).toContain("withBoundary(")
		expect(prompt).toContain("timerDuration")
		// A README-only heading: the README is what the reference replaces.
		expect(prompt).not.toContain("## Related Packages")
		expect(prompt).not.toContain("## SDK Overview")
	})

	it("is much smaller than the README-based prompt", () => {
		const readme = readFileSync(join(REPO_ROOT, "packages/core/README.md"), "utf-8")
		const reference = readFileSync(join(REPO_ROOT, "packages/core/builder-reference.md"), "utf-8")
		// 0.75: the reference gained the DiagramBuilder and lanes sections the README lacks.
		expect(reference.length).toBeLessThan(readme.length * 0.75)
	})
})

describe("WITHOUT_SDK_SYSTEM_PROMPT", () => {
	it("instructs raw XML output", () => {
		expect(WITHOUT_SDK_SYSTEM_PROMPT).toContain("XML")
	})
})

describe("buildCompactSystemPrompt", () => {
	it("returns a non-empty string", () => {
		const prompt = buildCompactSystemPrompt(REPO_ROOT)
		expect(typeof prompt).toBe("string")
		expect(prompt.length).toBeGreaterThan(500)
	})

	it("includes the grammar's tag table", () => {
		const prompt = buildCompactSystemPrompt(REPO_ROOT)
		expect(prompt).toContain("startEvent")
		expect(prompt).toContain("subProcess")
	})

	it("includes the worked example's process id", () => {
		const prompt = buildCompactSystemPrompt(REPO_ROOT)
		expect(prompt).toContain("LoanApproval")
	})

	it("includes the output instruction", () => {
		const prompt = buildCompactSystemPrompt(REPO_ROOT)
		expect(prompt).toContain("```compact")
	})
})

describe("buildCompactJsonSystemPrompt", () => {
	it("documents the CompactDiagram shape and the output block", () => {
		const prompt = buildCompactJsonSystemPrompt(REPO_ROOT)
		expect(prompt).toContain("interface CompactDiagram")
		expect(prompt).toContain("```json")
	})
})

describe("buildPlanSystemPrompt", () => {
	it("documents ProcessPlan and the output block", () => {
		const prompt = buildPlanSystemPrompt(REPO_ROOT)
		expect(prompt).toContain("interface ProcessPlan")
		expect(prompt).toContain("```json")
	})
})
