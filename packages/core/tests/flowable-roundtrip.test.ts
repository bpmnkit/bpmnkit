import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"
import { lintDiagram } from "../src/bpmn/lint.js"
import { Bpmn, resolveBpmnlintConfig } from "../src/index.js"

const fixture = readFileSync(
	join(import.meta.dirname, "fixtures/roundtrip/08-flowable-lanes-pools.bpmn"),
	"utf8",
)

describe("Flowable round trip", () => {
	it("reads a Flowable Modeler export, whose <definitions> has no id", () => {
		const defs = Bpmn.parse(fixture)
		expect(defs.processes.map((p) => p.id)).toEqual(["order", "customer"])
	})

	// Definitions-level lint findings carry `defs.id` as their scope, so it is "" here.
	// Selection goes by `elementIds`, which still name the element; pinned so the
	// empty scope stays a known choice.
	it("points definitions-level lint findings at the element, with an empty scope", () => {
		const defs = Bpmn.parse(fixture.replace(' name="Customer" processRef', " processRef"))
		const report = lintDiagram(defs, {
			bpmnlint: resolveBpmnlintConfig({ rules: { "label-required": "warn" } }),
		})
		const finding = report.diagnostics.find((d) => d.elementIds.includes("Participant_customer"))
		expect(finding?.processId).toBe("")
		expect(finding?.elementIds).toEqual(["Participant_customer"])
	})

	it("does not invent a definitions id on export", () => {
		const xml = Bpmn.export(Bpmn.parse(fixture))
		expect(xml).not.toMatch(/<definitions[^>]*\sid=/)
	})

	it('keeps isExecutable="false", which Flowable reads differently from an absent attribute', () => {
		const defs = Bpmn.parse(fixture)
		expect(defs.processes.map((p) => p.isExecutable)).toEqual([true, false])
		expect(Bpmn.export(defs)).toContain(
			'<process id="customer" name="Customer" isExecutable="false"',
		)
	})

	it("leaves an absent isExecutable absent", () => {
		const xml = fixture.replace(' isExecutable="false"', "")
		const defs = Bpmn.parse(xml)
		expect(defs.processes[1]?.isExecutable).toBeUndefined()
		expect(Bpmn.export(defs)).toContain('<process id="customer" name="Customer"/>')
	})

	it("reads every xsd:boolean spelling of isExecutable", () => {
		const read = (value: string) =>
			Bpmn.parse(fixture.replace(' isExecutable="false"', ` isExecutable="${value}"`)).processes[1]
				?.isExecutable
		expect(["1", " true ", "true"].map(read)).toEqual([true, true, true])
		expect(["0", " false ", "false"].map(read)).toEqual([false, false, false])
	})

	it("writes a nested lane set as <childLaneSet>", () => {
		const xml = Bpmn.export(Bpmn.parse(fixture))
		expect(xml).toContain('<childLaneSet id="LaneSet_sales">')
		expect(xml).not.toMatch(/<lane\b[^>]*>(?:(?!<\/lane>)[\s\S])*<laneSet/)
		const sales = Bpmn.parse(xml).processes[0]?.laneSet?.lanes[0]
		expect(sales?.childLaneSet?.lanes.map((l) => l.id)).toEqual(["Lane_inside", "Lane_desk"])
	})

	it("reads back a nested <laneSet>, as earlier versions wrote it", () => {
		const legacy = fixture
			.replace('<childLaneSet id="LaneSet_sales">', '<laneSet id="LaneSet_sales">')
			.replace("</childLaneSet>", "</laneSet>")
		const sales = Bpmn.parse(legacy).processes[0]?.laneSet?.lanes[0]
		expect(sales?.childLaneSet?.lanes.map((l) => l.id)).toEqual(["Lane_inside", "Lane_desk"])
		expect(Bpmn.export(Bpmn.parse(legacy))).toContain('<childLaneSet id="LaneSet_sales">')
	})
})
