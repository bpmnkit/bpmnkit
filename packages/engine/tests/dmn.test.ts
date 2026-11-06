import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { Dmn } from "@bpmnkit/core"
import type { DmnDecision } from "@bpmnkit/core"
import { describe, expect, it } from "vitest"
import { evaluateDecision, evaluateDecisionGraph, literalExpressionText } from "../src/dmn.js"

function makeDecision(
	hitPolicy: import("@bpmnkit/core").HitPolicy,
	inputs: { label: string; expression: string }[],
	outputs: { name: string }[],
	rules: { inputEntries: string[]; outputEntries: string[] }[],
	aggregation?: import("@bpmnkit/core").DmnAggregation,
): DmnDecision {
	return {
		id: "Decision_1",
		decisionTable: {
			id: "Table_1",
			hitPolicy,
			aggregation,
			inputs: inputs.map((inp, i) => ({
				id: `Input_${i}`,
				label: inp.label,
				inputExpression: { id: `InputExpr_${i}`, text: inp.expression },
			})),
			outputs: outputs.map((out, i) => ({
				id: `Output_${i}`,
				name: out.name,
			})),
			rules: rules.map((r, i) => ({
				id: `Rule_${i}`,
				inputEntries: r.inputEntries.map((t, j) => ({ id: `IE_${i}_${j}`, text: t })),
				outputEntries: r.outputEntries.map((t, j) => ({ id: `OE_${i}_${j}`, text: t })),
			})),
		},
		informationRequirements: [],
		knowledgeRequirements: [],
		authorityRequirements: [],
	}
}

describe("evaluateDecision", () => {
	it("UNIQUE — returns first match (single output)", () => {
		const d = makeDecision(
			"UNIQUE",
			[{ label: "age", expression: "age" }],
			[{ name: "category" }],
			[
				{ inputEntries: ["< 18"], outputEntries: ['"minor"'] },
				{ inputEntries: [">= 18"], outputEntries: ['"adult"'] },
			],
		)
		expect(evaluateDecision(d, { age: 25 })).toBe("adult")
		expect(evaluateDecision(d, { age: 12 })).toBe("minor")
	})

	it("UNIQUE — returns null when no rule matches", () => {
		const d = makeDecision(
			"UNIQUE",
			[{ label: "x", expression: "x" }],
			[{ name: "out" }],
			[{ inputEntries: ["1"], outputEntries: ['"one"'] }],
		)
		expect(evaluateDecision(d, { x: 99 })).toBeNull()
	})

	it("FIRST — stops at first match", () => {
		const d = makeDecision(
			"FIRST",
			[{ label: "x", expression: "x" }],
			[{ name: "out" }],
			[
				{ inputEntries: ["> 0"], outputEntries: ['"positive"'] },
				{ inputEntries: ["> 5"], outputEntries: ['"big"'] },
			],
		)
		expect(evaluateDecision(d, { x: 10 })).toBe("positive")
	})

	it("COLLECT SUM aggregation", () => {
		const d = makeDecision(
			"COLLECT",
			[{ label: "category", expression: "category" }],
			[{ name: "discount" }],
			[
				{ inputEntries: ['"A"'], outputEntries: ["10"] },
				{ inputEntries: ['"A"'], outputEntries: ["5"] },
			],
			"SUM",
		)
		expect(evaluateDecision(d, { category: "A" })).toBe(15)
	})

	it("COLLECT COUNT aggregation", () => {
		const d = makeDecision(
			"COLLECT",
			[{ label: "v", expression: "v" }],
			[{ name: "n" }],
			[
				{ inputEntries: ["> 0"], outputEntries: ["1"] },
				{ inputEntries: ["> 0"], outputEntries: ["1"] },
				{ inputEntries: ["> 0"], outputEntries: ["1"] },
			],
			"COUNT",
		)
		expect(evaluateDecision(d, { v: 5 })).toBe(3)
	})

	it("RULE ORDER — returns list of matches", () => {
		const d = makeDecision(
			"RULE ORDER",
			[{ label: "x", expression: "x" }],
			[{ name: "out" }],
			[
				{ inputEntries: ["> 0"], outputEntries: ['"pos"'] },
				{ inputEntries: ["> 10"], outputEntries: ['"big"'] },
			],
		)
		expect(evaluateDecision(d, { x: 20 })).toEqual(["pos", "big"])
	})

	it("reads multi-word variable names in input and output expressions", () => {
		const d = makeDecision(
			"UNIQUE",
			[{ label: "total", expression: "order total" }],
			[{ name: "out" }],
			[{ inputEntries: ["> order limit"], outputEntries: ["order total - order limit"] }],
		)
		expect(evaluateDecision(d, { "order total": 12, "order limit": 10 })).toBe(2)
	})

	it("empty input entry matches any value", () => {
		const d = makeDecision(
			"UNIQUE",
			[{ label: "x", expression: "x" }],
			[{ name: "out" }],
			[{ inputEntries: [""], outputEntries: ['"always"'] }],
		)
		expect(evaluateDecision(d, { x: "anything" })).toBe("always")
	})

	it("returns null when decisionTable is undefined", () => {
		const d: DmnDecision = {
			id: "d",
			informationRequirements: [],
			knowledgeRequirements: [],
			authorityRequirements: [],
		}
		expect(evaluateDecision(d, {})).toBeNull()
	})
})

describe("evaluateDecisionGraph", () => {
	const xml = fs.readFileSync(
		path.join(
			path.dirname(fileURLToPath(import.meta.url)),
			"../../../conformance/dmn/eval-drd/input.dmn",
		),
		"utf8",
	)
	const defs = Dmn.parse(xml)

	it("evaluates required decisions first and binds them by name", () => {
		const r = evaluateDecisionGraph(defs, "discount", { spend: 2000 })
		expect(r.result).toEqual({ amount: 300, tier: "gold" })
		expect(r.evaluatedDecisions.map((d) => d.decisionId)).toEqual(["tier", "rate", "discount"])
	})

	it("evaluates a shared requirement once", () => {
		const r = evaluateDecisionGraph(defs, "discount", { spend: 10 })
		expect(r.evaluatedDecisions.filter((d) => d.decisionId === "tier")).toHaveLength(1)
		expect(r.result).toEqual({ amount: 0.5, tier: "basic" })
	})

	it("reads the literal expression the parser keeps in extensionElements", () => {
		const rate = defs.decisions.find((d) => d.id === "rate")
		expect(rate && literalExpressionText(rate)).toBe(
			'if Customer Tier = "gold" then 0.15 else 0.05',
		)
	})

	it("returns null for a decision without a body", () => {
		expect(evaluateDecisionGraph(defs, "no_body", {}).result).toBeNull()
	})

	it("throws on a missing decision and on a cycle", () => {
		expect(() => evaluateDecisionGraph(defs, "nope", {})).toThrow("Decision 'nope' not found")
		expect(() => evaluateDecisionGraph(defs, "missing_req", {})).toThrow(
			"Decision 'nowhere' not found",
		)
		expect(() => evaluateDecisionGraph(defs, "loop_a", {})).toThrow(
			"Decision 'loop_a' requires itself",
		)
	})
})
