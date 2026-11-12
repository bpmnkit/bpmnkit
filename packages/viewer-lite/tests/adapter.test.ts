import { existsSync, readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"
import { Bpmn } from "@bpmnkit/core"
import { exportSvgDetailed } from "@bpmnkit/core/svg"
import { describe, expect, it } from "vitest"
import { parseBpmnLite } from "../src/adapter.js"

const DIR = join(import.meta.dirname, "../../../conformance/bpmn")
const fixtures = readdirSync(DIR).filter((d) => existsSync(join(DIR, d, "input.bpmn")))
const read = (name: string): string => readFileSync(join(DIR, name, "input.bpmn"), "utf8")
// happy-dom's DOMParser rejects CDATA sections; scripts/smoke.mjs checks these in Chromium.
const domSafe = fixtures.filter((n) => !read(n).includes("<![CDATA["))

describe("parseBpmnLite", () => {
	it("finds the conformance fixtures", () => {
		expect(fixtures.length).toBeGreaterThan(20)
		expect(fixtures.length - domSafe.length).toBeLessThan(5)
	})

	it.each(domSafe)("%s draws the same SVG as the core parser", (name) => {
		const xml = read(name)
		const lite = exportSvgDetailed(parseBpmnLite(xml))
		const core = exportSvgDetailed(Bpmn.parse(xml))
		expect(lite.elements.length).toBe(core.elements.length)
		expect(lite.svg).toBe(core.svg)
	})

	it("reads the fields exportSvg draws", () => {
		const defs = parseBpmnLite(read("miwg-b-1-0"))
		expect(defs.collaborations[0]?.participants.length).toBeGreaterThan(0)
		const plane = defs.diagrams[0]?.plane
		expect(plane?.shapes[0]?.bounds.width).toBeGreaterThan(0)
		expect(plane?.edges.some((e) => e.waypoints.length >= 2)).toBe(true)
	})

	it("rejects what is not BPMN", () => {
		expect(() => parseBpmnLite("<html/>")).toThrow(/Not a BPMN/)
		expect(() => parseBpmnLite("<not xml")).toThrow(/Not a BPMN/)
	})
})
