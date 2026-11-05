import { describe, expect, it } from "vitest"
import { Dmn, lintDmn } from "../src/index.js"

const NS = 'xmlns="https://www.omg.org/spec/DMN/20191111/MODEL/"'

/** A valid one-decision document; `table` replaces the decision's body. */
function doc(body: string): string {
	return `<?xml version="1.0" encoding="UTF-8"?><definitions ${NS} id="defs" name="d" namespace="x">${body}</definitions>`
}

const TABLE = (opts: { hitPolicy?: string; extra?: string; input?: string; rule?: string } = {}) =>
	doc(`<decision id="discount" name="Discount">
	<decisionTable id="table"${opts.hitPolicy !== undefined ? ` hitPolicy="${opts.hitPolicy}"` : ""}${opts.extra ?? ""}>
		<input id="in1" label="Tier"><inputExpression id="ie1" typeRef="string"><text>${opts.input ?? "tier"}</text></inputExpression></input>
		<output id="out1" name="discount" typeRef="number"/>
		${opts.rule ?? `<rule id="r1"><inputEntry id="e1"><text>"gold"</text></inputEntry><outputEntry id="o1"><text>10</text></outputEntry></rule>`}
	</decisionTable>
</decision>`)

function rules(xml: string): string[] {
	return lintDmn(xml).map((f) => f.rule)
}

describe("lintDmn", () => {
	it("reports nothing on a valid decision table", () => {
		expect(lintDmn(TABLE())).toEqual([])
	})

	it("reports nothing on a document the builder writes", () => {
		const xml = Dmn.export(
			Dmn.createDecisionTable("Decision_1")
				.name("Age")
				.input({ label: "Age", expression: "age", typeRef: "number" })
				.output({ label: "Result", name: "result", typeRef: "string" })
				.rule({ inputs: ["< 18"], outputs: ['"minor"'] })
				.build(),
		)
		expect(lintDmn(xml).filter((f) => f.severity === "error")).toEqual([])
	})

	it("dmn/malformed-xml", () => {
		const [f] = lintDmn("<definitions><decision></definitions>")
		expect(f?.rule).toBe("dmn/malformed-xml")
		expect(f?.fix).toBeTruthy()
	})

	it("dmn/not-dmn", () => {
		expect(rules("<process id='p'/>")).toEqual(["dmn/not-dmn"])
	})

	it("dmn/duplicate-id", () => {
		const f = lintDmn(
			TABLE({
				input: "tier",
				rule: `<rule id="in1"><inputEntry id="e1"><text>-</text></inputEntry><outputEntry id="o1"><text>1</text></outputEntry></rule>`,
			}),
		)
		expect(f.map((x) => x.rule)).toEqual(["dmn/duplicate-id"])
		expect(f[0]?.elementId).toBe("in1")
	})

	it("dmn/missing-id", () => {
		expect(
			rules(
				doc(
					'<inputData name="Tier"/><decision id="d"><literalExpression><text>1</text></literalExpression></decision>',
				),
			),
		).toEqual(["dmn/missing-id"])
	})

	it("dmn/no-decision", () => {
		expect(rules(doc('<inputData id="i"/>'))).toEqual(["dmn/no-decision"])
	})

	it("dmn/unresolved-requirement: missing target, wrong kind and empty href", () => {
		const xml = doc(`<inputData id="tier"/>
			<decision id="a"><informationRequirement id="ir1"><requiredDecision href="#nope"/></informationRequirement><literalExpression><text>1</text></literalExpression></decision>
			<decision id="b"><informationRequirement id="ir2"><requiredDecision href="#tier"/></informationRequirement><literalExpression><text>1</text></literalExpression></decision>
			<decision id="c"><informationRequirement id="ir3"><requiredInput href=""/></informationRequirement><literalExpression><text>1</text></literalExpression></decision>`)
		const found = lintDmn(xml)
		expect(found.map((f) => [f.rule, f.elementId])).toEqual([
			["dmn/unresolved-requirement", "a"],
			["dmn/unresolved-requirement", "b"],
			["dmn/unresolved-requirement", "c"],
		])
		expect(found[1]?.fix).toContain("requiredInput")
	})

	it("resolves requirements by id and skips references into other files", () => {
		const xml = doc(`<inputData id="tier"/>
			<decision id="a"><informationRequirement id="ir1"><requiredInput href="#tier"/></informationRequirement><literalExpression><text>tier</text></literalExpression></decision>
			<decision id="b"><informationRequirement id="ir2"><requiredDecision href="#a"/></informationRequirement><informationRequirement id="ir3"><requiredDecision href="other.dmn#x"/></informationRequirement><literalExpression><text>a</text></literalExpression></decision>`)
		expect(lintDmn(xml)).toEqual([])
	})

	it("dmn/requirement-cycle", () => {
		const xml =
			doc(`<decision id="a"><informationRequirement id="ir1"><requiredDecision href="#b"/></informationRequirement><literalExpression><text>1</text></literalExpression></decision>
			<decision id="b"><informationRequirement id="ir2"><requiredDecision href="#a"/></informationRequirement><literalExpression><text>1</text></literalExpression></decision>`)
		expect(rules(xml)).toEqual(["dmn/requirement-cycle"])
	})

	it("dmn/decision-no-logic", () => {
		expect(rules(doc('<decision id="d"/>'))).toEqual(["dmn/decision-no-logic"])
	})

	it("dmn/empty-expression", () => {
		expect(
			rules(
				doc('<decision id="d"><literalExpression><text> </text></literalExpression></decision>'),
			),
		).toEqual(["dmn/empty-expression"])
	})

	it("dmn/invalid-hit-policy suggests the canonical spelling", () => {
		const [f] = lintDmn(TABLE({ hitPolicy: "rule_order" }))
		expect(f?.rule).toBe("dmn/invalid-hit-policy")
		expect(f?.fix).toContain('"RULE ORDER"')
	})

	it("dmn/invalid-aggregation: bad value, and aggregation without COLLECT", () => {
		expect(rules(TABLE({ hitPolicy: "COLLECT", extra: ' aggregation="AVG"' }))).toEqual([
			"dmn/invalid-aggregation",
		])
		expect(rules(TABLE({ hitPolicy: "FIRST", extra: ' aggregation="SUM"' }))).toEqual([
			"dmn/invalid-aggregation",
		])
		expect(rules(TABLE({ hitPolicy: "COLLECT", extra: ' aggregation="SUM"' }))).toEqual([])
	})

	it("dmn/invalid-type-ref suggests the right case", () => {
		const xml = TABLE().replace('typeRef="number"', 'typeRef="Number"')
		const [f] = lintDmn(xml)
		expect(f?.rule).toBe("dmn/invalid-type-ref")
		expect(f?.severity).toBe("warning")
		expect(f?.fix).toContain('typeRef="number"')
	})

	it("dmn/no-output", () => {
		expect(
			rules(
				TABLE()
					.replace('<output id="out1" name="discount" typeRef="number"/>', "")
					.replace(/<outputEntry.*?<\/outputEntry>/, ""),
			),
		).toEqual(["dmn/no-output"])
	})

	it("dmn/missing-output-name only with several outputs", () => {
		const xml = TABLE({
			rule: `<rule id="r1"><inputEntry id="e1"><text>-</text></inputEntry><outputEntry id="o1"><text>1</text></outputEntry><outputEntry id="o2"><text>2</text></outputEntry></rule>`,
		}).replace(
			'<output id="out1" name="discount" typeRef="number"/>',
			'<output id="out1" name="discount"/><output id="out2" label="Extra"/>',
		)
		expect(rules(xml)).toEqual(["dmn/missing-output-name"])
	})

	it("dmn/empty-input-expression", () => {
		expect(rules(TABLE({ input: "" }))).toEqual(["dmn/empty-input-expression"])
	})

	it("dmn/rule-entry-count", () => {
		const xml = TABLE({
			rule: `<rule id="r1"><outputEntry id="o1"><text>1</text></outputEntry></rule>`,
		})
		const [f] = lintDmn(xml)
		expect(f?.rule).toBe("dmn/rule-entry-count")
		expect(f?.elementId).toBe("r1")
	})

	it("dmn/feel-syntax in input expressions, input entries, output entries and literal expressions", () => {
		expect(rules(TABLE({ input: "tier +" }))).toEqual(["dmn/feel-syntax"])
		const entry = (inText: string, outText: string) =>
			TABLE({
				rule: `<rule id="r1"><inputEntry id="e1"><text>${inText}</text></inputEntry><outputEntry id="o1"><text>${outText}</text></outputEntry></rule>`,
			})
		const badIn = lintDmn(entry(">= 10 and &lt; 20", "1"))
		expect(badIn.map((f) => [f.rule, f.elementId])).toEqual([["dmn/feel-syntax", "e1"]])
		expect(rules(entry("-", "= 1"))).toEqual(["dmn/feel-syntax"])
		expect(rules(entry("-", ""))).toEqual([])
		expect(
			rules(
				doc('<decision id="d"><literalExpression><text>1 +</text></literalExpression></decision>'),
			),
		).toEqual(["dmn/feel-syntax"])
	})

	it("gives every finding a rule, a message and a fix", () => {
		for (const f of lintDmn(TABLE({ hitPolicy: "X", input: "" }))) {
			expect(f.rule).toMatch(/^dmn\//)
			expect(f.message).not.toBe("")
			expect(f.fix).not.toBe("")
		}
	})
})
