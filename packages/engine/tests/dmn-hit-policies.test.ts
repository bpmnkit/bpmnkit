import { Dmn } from "@bpmnkit/core"
import type { DmnDecision } from "@bpmnkit/core"
import { describe, expect, it } from "vitest"
import { evaluateDecision } from "../src/dmn.js"

function table(
	hitPolicy: string,
	opts: { typeIn?: string; typeOut?: string; outputValues?: string; rules: string[][] },
): DmnDecision {
	const rules = opts.rules
		.map(
			([when, then], i) =>
				`<rule id="r${i}"><inputEntry id="ri${i}"><text>${when}</text></inputEntry><outputEntry id="ro${i}"><text>${then}</text></outputEntry></rule>`,
		)
		.join("")
	const typeIn = opts.typeIn ? ` typeRef="${opts.typeIn}"` : ""
	const typeOut = opts.typeOut ? ` typeRef="${opts.typeOut}"` : ""
	const values = opts.outputValues
		? `<outputValues><text>${opts.outputValues}</text></outputValues>`
		: ""
	const xml = `<definitions xmlns="https://www.omg.org/spec/DMN/20191111/MODEL/" id="d" name="d" namespace="n"><decision id="t"><decisionTable id="tt" hitPolicy="${hitPolicy}">
<input id="i"><inputExpression id="ie"${typeIn}><text>x</text></inputExpression></input>
<output id="o" name="o"${typeOut}>${values}</output>
${rules}</decisionTable></decision></definitions>`
	return Dmn.parse(xml).decisions[0] as DmnDecision
}

const any = (typeIn: string, x: unknown) =>
	evaluateDecision(table("FIRST", { typeIn, rules: [["-", "1"]] }), { x })

describe("hit policies (DMN 1.3)", () => {
	it("UNIQUE fails when several rules match", () => {
		const d = table("UNIQUE", {
			rules: [
				["> 1", '"a"'],
				["> 2", '"b"'],
				["&lt; 0", '"c"'],
			],
		})
		expect(() => evaluateDecision(d, { x: 5 })).toThrow(
			"Hit policy UNIQUE violated in decision 't': 2 rules match (r0, r1)",
		)
		expect(evaluateDecision(d, { x: 2 })).toBe("a")
		expect(evaluateDecision(d, { x: 1 })).toBeNull()
	})

	const ranked = (hp: string) =>
		table(hp, {
			outputValues: '"gold","silver","bronze"',
			rules: [
				["-", '"bronze"'],
				["-", '"gold"'],
				["-", '"other"'],
				["-", '"silver"'],
			],
		})

	it("PRIORITY returns the match that ranks first in the output values", () => {
		expect(evaluateDecision(ranked("PRIORITY"), { x: 1 })).toBe("gold")
	})

	it("OUTPUT ORDER sorts matches by the output values, unlisted last", () => {
		expect(evaluateDecision(ranked("OUTPUT ORDER"), { x: 1 })).toEqual([
			"gold",
			"silver",
			"bronze",
			"other",
		])
	})

	it("without output values OUTPUT ORDER keeps rule order and PRIORITY the first match", () => {
		const rules = [
			["-", '"b"'],
			["-", '"a"'],
		]
		expect(evaluateDecision(table("OUTPUT ORDER", { rules }), { x: 1 })).toEqual(["b", "a"])
		expect(evaluateDecision(table("PRIORITY", { rules }), { x: 1 })).toBe("b")
	})
})

describe("typeRef (as Zeebe checks it)", () => {
	it("fails when an input or output value is not of its typeRef", () => {
		expect(any("number", 1)).toBe(1)
		expect(() => any("number", "1")).toThrow(
			"Decision 't': input 'x' is of type 'string' but its typeRef is 'number'",
		)
		const output = table("FIRST", { typeOut: "string", rules: [["-", "1"]] })
		expect(() => evaluateDecision(output, { x: 1 })).toThrow(
			"Decision 't': output 'o' of rule 'r0' is of type 'number' but its typeRef is 'string'",
		)
	})

	it("does not check null, Any, legacy numeric names or unknown types", () => {
		expect(any("Any", "s")).toBe(1)
		expect(any("double", 1.5)).toBe(1)
		expect(any("frobnicate", "s")).toBe(1)
		expect(any("number", null)).toBe(1)
	})

	it("converts a string to a temporal typeRef", () => {
		const d = table("FIRST", {
			typeIn: "date",
			rules: [
				["&lt; date(&quot;2025-01-01&quot;)", '"old"'],
				["-", '"new"'],
			],
		})
		expect(evaluateDecision(d, { x: "2024-06-01" })).toBe("old")
		expect(() => evaluateDecision(d, { x: "nonsense" })).toThrow("typeRef is 'date'")
	})
})
