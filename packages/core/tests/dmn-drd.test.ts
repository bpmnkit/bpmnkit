import { beforeEach, describe, expect, it } from "vitest"
import { Dmn, ValidationError, drgId, resetIdCounter } from "../src/index.js"

const risk = (t: ReturnType<typeof Dmn.createDecisionTable>) =>
	t
		.name("Risk Score")
		.input({ expression: "age", typeRef: "number" })
		.output({ name: "risk", typeRef: "string" })
		.rule({ inputs: ["< 18"], outputs: ['"low"'] })

describe("Dmn.drd", () => {
	beforeEach(() => resetIdCounter())

	it("D04-like: decision A requires decision B via handle", () => {
		const drd = Dmn.drd("Approval")
		const b = drd.decision("riskScore", risk)
		drd.decision(
			"approval",
			(t) =>
				t
					.name("Approval")
					.input({ expression: "risk" })
					.output({ name: "approved" })
					.rule({ inputs: ['"low"'], outputs: ["true"] }),
			{ requires: [b] },
		)
		const xml = drd.toXml()
		expect(xml).toContain('<requiredDecision href="#riskScore"')
		expect(xml).toContain("<informationRequirement")
		expect(xml).toContain('dmnElementRef="riskScore"')
		expect(xml).toContain('dmnElementRef="approval"')
		const defs = Dmn.parse(xml)
		expect(
			defs.decisions.find((d) => d.id === "approval")?.informationRequirements[0]?.requiredDecision,
		).toBe("riskScore")
		expect(defs.diagram?.edges.length).toBeGreaterThan(0)
		expect(defs.diagram?.shapes).toHaveLength(2)
	})

	it("accepts branded id and input data handle", () => {
		const drd = Dmn.drd()
		const age = drd.inputData("age", "Age")
		drd.decision("a", risk, { requires: [age] })
		drd.decision("b", risk, { requires: [drgId("a")] })
		const defs = drd.build()
		expect(defs.decisions[0]?.informationRequirements[0]?.requiredInput).toBe("age")
		expect(defs.decisions[1]?.informationRequirements[0]?.requiredDecision).toBe("a")
	})

	it("unknown ref lists valid ids", () => {
		const drd = Dmn.drd()
		drd.decision("a", risk)
		drd.decision("b", risk, { requires: [drgId("nope")] })
		expect(() => drd.build()).toThrow(/unknown id "nope".*Valid ids: a, b/)
	})

	it("label suggests the id", () => {
		const drd = Dmn.drd()
		drd.decision("riskScore", risk)
		drd.decision("b", risk, { requires: [drgId("Risk Score")] })
		expect(() => drd.build()).toThrow(/name\/label.*Use the id "riskScore"/)
	})

	it("rejects duplicate ids", () => {
		const drd = Dmn.drd()
		drd.decision("a", risk)
		expect(() => drd.decision("a", risk)).toThrow(ValidationError)
	})
})

describe("expandDmn dangling requires", () => {
	it("throws instead of silently dropping", () => {
		expect(() =>
			Dmn.expand({
				id: "d",
				name: "d",
				inputData: [],
				decisions: [{ id: "a", inputs: [], outputs: [], rules: [], requires: ["Risk Score"] }],
			}),
		).toThrow(/unknown id "Risk Score"/)
	})
})
