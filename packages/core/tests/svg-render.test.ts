import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import { applyAutoLayout } from "../src/bpmn/auto-layout.js"
import { Bpmn } from "../src/bpmn/index.js"
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
	it("does not import auto-layout, so small bundles stay small", () => {
		const src = readFileSync(new URL("../src/bpmn/svg-render.ts", import.meta.url), "utf8")
		expect(src).not.toMatch(/from "\.\/auto-layout/)
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
})
