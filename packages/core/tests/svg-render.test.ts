import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import { applyAutoLayout } from "../src/bpmn/auto-layout.js"
import { parseBpmn } from "../src/bpmn/bpmn-parser.js"
import { Bpmn } from "../src/bpmn/index.js"
import { collectLabelStyles } from "../src/bpmn/label-style.js"
import * as render from "../src/bpmn/svg-render.js"
import { exportSvg, exportSvgDetailed } from "../src/bpmn/svg.js"

const build = () =>
	Bpmn.createProcess("p")
		.startEvent("s", { name: "Start" })
		.userTask("u", { name: "Review" })
		.endEvent("e")
		.withAutoLayout()
		.build()

describe("svg-render (layout-free entry)", () => {
	it("imports neither auto-layout nor the label-style reader, so small bundles stay small", () => {
		const src = readFileSync(new URL("../src/bpmn/svg-render.ts", import.meta.url), "utf8")
		expect(src).not.toMatch(/from "\.\/auto-layout/)
		expect(src).not.toMatch(/^\s*collectLabelStyles,/m)
	})

	it("draws the same SVG as the barrel export for laid-out models", () => {
		const d = build()
		expect(render.exportSvg(d)).toBe(exportSvg(d))
		expect(render.exportSvg(d, { theme: "dark" })).toBe(exportSvg(d, { theme: "dark" }))
	})

	it("autoLayout without layout leaves a DI-less model empty", () => {
		const bare = { ...build(), diagrams: [] }
		const r = render.exportSvgDetailed(bare, { autoLayout: true })
		expect(r.elements).toHaveLength(0)
		expect(r.warnings).not.toContainEqual({ type: "autoLayoutApplied" })
	})

	it("autoLayout runs the given layout", () => {
		const bare = { ...build(), diagrams: [] }
		const layout = (d: typeof bare) => applyAutoLayout(d, "semantic")
		const r = render.exportSvgDetailed(bare, { autoLayout: true, layout })
		expect(r.warnings).toContainEqual({ type: "autoLayoutApplied" })
		expect(r.svg).toBe(exportSvgDetailed(bare, { autoLayout: true }).svg)
	})

	it("barrel export still auto-layouts by default", () => {
		const bare = { ...build(), diagrams: [] }
		expect(exportSvgDetailed(bare, { autoLayout: true }).elements.length).toBeGreaterThan(0)
	})

	it("label fonts need labelStyles; the barrel passes collectLabelStyles", () => {
		const d = parseBpmn(STYLED)
		expect(exportSvg(d)).toContain("font-weight:bold")
		expect(render.exportSvg(d)).not.toContain("font-weight:bold")
		expect(render.exportSvg(d, { labelStyles: collectLabelStyles })).toBe(exportSvg(d))
	})
})

const STYLED = `<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" id="d" targetNamespace="t">
  <bpmn:process id="proc"><bpmn:task id="t" name="Styled"/></bpmn:process>
  <bpmndi:BPMNDiagram id="dg">
    <bpmndi:BPMNPlane id="pl" bpmnElement="proc">
      <bpmndi:BPMNShape id="t_di" bpmnElement="t">
        <dc:Bounds x="0" y="0" width="100" height="80"/>
        <bpmndi:BPMNLabel labelStyle="LS1"/>
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
    <bpmndi:BPMNLabelStyle id="LS1"><dc:Font name="Serif" isBold="true"/></bpmndi:BPMNLabelStyle>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`
