import { describe, expect, it } from "vitest"
import { agentJobType, agentJobTypes, promptVariables, renderPrompt } from "../src/index.js"

describe("agent job types", () => {
	it("names a role on its own or at a rank", () => {
		expect(agentJobType("pr-review")).toBe("agent:pr-review")
		expect(agentJobType("pr-review", "senior")).toBe("agent:senior:pr-review")
	})

	it("lists every type a worker serves: each role, then each role at its rank", () => {
		expect(agentJobTypes(["plan", "feature"])).toEqual(["agent:plan", "agent:feature"])
		expect(agentJobTypes(["plan", "feature"], "junior")).toEqual([
			"agent:plan",
			"agent:feature",
			"agent:junior:plan",
			"agent:junior:feature",
		])
	})

	it("rejects names that would make an ambiguous type", () => {
		expect(() => agentJobType("a:b")).toThrow(/role/)
		expect(() => agentJobType("a", "")).toThrow(/rank/)
	})
})

describe("prompts", () => {
	it("lists the variables a template refers to, once each", () => {
		expect(promptVariables("{{a}} {{ b }} {{c}} {{a}}")).toEqual(["a", "c"])
	})

	it("fills strings as is and anything else as JSON", () => {
		expect(renderPrompt("{{s}}|{{n}}|{{o}}", { s: "x", n: 1, o: { k: [1] } })).toBe('x|1|{"k":[1]}')
	})

	it("refuses a prompt with a missing variable", () => {
		expect(() => renderPrompt("{{a}} {{b}}", { a: 1 })).toThrow("missing variable(s): b")
	})
})
