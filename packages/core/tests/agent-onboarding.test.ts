import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"
import { Bpmn, Dmn, ValidationError, lintDmn, lintForm } from "../src/index.js"

const PKG = join(import.meta.dirname, "..")
const read = (p: string) => readFileSync(join(PKG, p), "utf8")

describe("agent onboarding files", () => {
	const manifest = JSON.parse(read("package.json")) as { agents: string; files: string[] }

	it("ships AGENTS.md, llms.txt and the cards", () => {
		for (const f of ["AGENTS.md", "llms.txt", "agent-cards"]) expect(manifest.files).toContain(f)
		expect(manifest.agents).toBe("./AGENTS.md")
	})

	it("keeps AGENTS.md short and pointing at every card", () => {
		const agents = read("AGENTS.md")
		expect(agents.split("\n").length).toBeLessThanOrEqual(40)
		for (const kind of ["bpmn", "dmn", "form"]) {
			expect(agents).toContain(`agent-cards/${kind}.md`)
			expect(read("llms.txt")).toContain(`agent-cards/${kind}.md`)
		}
		expect(agents).toContain("check")
	})

	it("puts the card pointer in the README before the logo", () => {
		const readme = read("README.md")
		expect(readme.slice(0, 600)).toContain("agent-cards/<bpmn|dmn|form>.md")
		expect(readme.indexOf("agent-cards")).toBeLessThan(readme.indexOf("<div"))
	})

	it("documents the entry points for the .d.ts", () => {
		expect(read("src/index.ts")).toMatch(/@packageDocumentation[\s\S]*AGENTS\.md/)
		expect(read("src/bpmn/index.ts")).toContain("agent-cards/bpmn.md")
		expect(read("src/dmn/index.ts")).toContain("agent-cards/dmn.md")
		expect(read("src/form/index.ts")).toContain("agent-cards/form.md")
	})
})

describe("teaching errors point at the card", () => {
	it("builder ValidationErrors end with the traps hint", () => {
		const dmn = () =>
			Dmn.createDecisionTable("d").input({ expression: "a" }).rule({ inputs: [], outputs: [] })
		expect(dmn).toThrow(ValidationError)
		expect(dmn).toThrow(/agent-cards\/dmn\.md#traps/)
		expect(() =>
			Bpmn.createProcess("p")
				.startEvent("s")
				.boundaryEvent("b", {} as never),
		).toThrow(/agent-cards\/bpmn\.md#traps/)
	})

	it("lint findings carry the hint in their fix", () => {
		expect(lintDmn("<not xml").every((f) => f.fix.includes("agent-cards/dmn.md#traps"))).toBe(true)
		expect(lintForm("{").every((f) => f.fix.includes("agent-cards/form.md#traps"))).toBe(true)
	})
})
