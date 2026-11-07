import { describe, expect, it } from "vitest"
import { Dmn } from "../src/index.js"

const wrap = (body: string) =>
	`<definitions xmlns="https://www.omg.org/spec/DMN/20191111/MODEL/" id="d" name="n" namespace="x">${body}</definitions>`

describe("DMN export is idempotent", () => {
	const xml = wrap(`
  <decision id="lit" name="Literal">
    <variable id="v" name="y" typeRef="number"/>
    <literalExpression id="le"><text>1 + 1</text></literalExpression>
  </decision>
  <decision id="ext" name="Ext">
    <extensionElements>
      <custom:tags xmlns:custom="urn:c">
        <custom:tag>a</custom:tag>
      </custom:tags>
    </extensionElements>
  </decision>`)

	it("parse -> export -> parse -> export gives identical bytes", () => {
		const once = Dmn.export(Dmn.parse(xml))
		const twice = Dmn.export(Dmn.parse(once))
		expect(twice).toBe(once)
		expect(Dmn.parse(twice)).toEqual(Dmn.parse(once))
	})
})

describe("a requirement that parsed to nothing", () => {
	it("is not exported as href=#undefined", () => {
		const defs = Dmn.parse(
			wrap(
				`<decision id="a"><informationRequirement id="r"><requiredInput/></informationRequirement></decision>`,
			),
		)
		const out = Dmn.export(defs)
		expect(out).not.toContain("undefined")
		expect(Dmn.parse(out)).toEqual(defs)
	})
})

describe("literalExpression next to the decision's own extensionElements", () => {
	const xml = wrap(`
  <decision id="a" name="A">
    <extensionElements><x:owner xmlns:x="urn:x">me</x:owner></extensionElements>
    <literalExpression id="le" typeRef="number"><text>1 + 1</text></literalExpression>
  </decision>`)

	it("keeps both", () => {
		const d = Dmn.parse(xml).decisions[0]
		expect(d?.literalExpression).toEqual({ id: "le", typeRef: "number", text: "1 + 1" })
		expect(d?.extensionElements?.map((e) => e.name)).toEqual(["x:owner"])
		const out = Dmn.export(Dmn.parse(xml))
		expect(out).toContain("x:owner")
		expect(out).toContain('<literalExpression id="le" typeRef="number">')
		expect(out).toContain("<text>1 + 1</text>")
	})
})

describe("an empty extensionElements", () => {
	it("counts as absent, so the other kept content survives the export", () => {
		const d = Dmn.parse(
			wrap(`<decision id="a"><extensionElements/><variable id="v" name="y"/></decision>`),
		).decisions[0]
		expect(d?.extensionElements?.map((e) => e.name)).toEqual(["variable"])
	})
})
