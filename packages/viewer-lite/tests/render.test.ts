import { readFileSync } from "node:fs"
import { join } from "node:path"
import { beforeEach, describe, expect, it } from "vitest"
import { boot, render } from "../src/index.js"

const xml = readFileSync(
	join(import.meta.dirname, "../../../conformance/bpmn/sample-order-process/input.bpmn"),
	"utf8",
)
const noDi = readFileSync(
	join(import.meta.dirname, "../../../conformance/bpmn/collaboration/input.bpmn"),
	"utf8",
)

beforeEach(() => {
	document.body.innerHTML = ""
})

describe("render", () => {
	it("draws a fitted SVG and returns true", () => {
		const el = document.createElement("div")
		expect(render(xml, el)).toBe(true)
		const svg = el.querySelector("svg")
		expect(svg?.getAttribute("viewBox")).toMatch(/^-?[\d.]+ -?[\d.]+ [\d.]+ [\d.]+$/)
		expect(svg?.hasAttribute("width")).toBe(false)
		expect(el.getAttribute("data-bpmn-lite")).toBe("diagram")
	})

	it("uses the requested theme", () => {
		const el = document.createElement("div")
		render(xml, el, { theme: "dark" })
		expect(el.innerHTML).toContain("#1e1e2e")
	})

	it("shows a message for a file without DI", () => {
		const el = document.createElement("div")
		expect(render(noDi, el)).toBe(false)
		expect(el.textContent).toMatch(/no diagram layout/)
		expect(el.querySelector("svg")).toBeNull()
	})

	it("shows a message for something that is not BPMN", () => {
		const el = document.createElement("div")
		expect(render("<html/>", el)).toBe(false)
		expect(el.textContent).toMatch(/Cannot show/)
	})

	it("pans the viewBox on drag", () => {
		const el = document.createElement("div")
		render(xml, el)
		const svg = el.querySelector("svg") as SVGSVGElement
		const before = svg.getAttribute("viewBox")
		svg.dispatchEvent(new PointerEvent("pointerdown", { clientX: 10, clientY: 10 }))
		svg.dispatchEvent(new PointerEvent("pointermove", { clientX: 30, clientY: 10 }))
		svg.dispatchEvent(new PointerEvent("pointerup"))
		expect(svg.getAttribute("viewBox")).not.toBe(before)
	})
})

describe("boot", () => {
	it("replaces each application/bpmn+xml script with its diagram", () => {
		const s = document.createElement("script")
		s.type = "application/bpmn+xml"
		s.textContent = xml
		document.body.append(s, s.cloneNode(true))
		boot()
		expect(document.querySelectorAll('script[type="application/bpmn+xml"]')).toHaveLength(0)
		expect(document.querySelectorAll(".bpmn-lite svg")).toHaveLength(2)
	})
})
