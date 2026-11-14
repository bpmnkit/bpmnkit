import { readFileSync } from "node:fs"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
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
afterEach(() => {
	vi.unstubAllGlobals()
})

const osDark = (): void => {
	vi.stubGlobal("matchMedia", (q: string) => ({ matches: q.includes("dark") }))
}
const draw = (options?: Parameters<typeof render>[2]): string => {
	const el = document.createElement("div")
	document.body.append(el)
	render(xml, el, options)
	return el.innerHTML
}
const LIGHT_BG = "#f8f9fa"
const DARK_BG = "#1e1e2e"

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

	it("is light by default, even when the reader's OS prefers dark", () => {
		osDark()
		const out = draw()
		expect(out).toContain(LIGHT_BG)
		expect(out).not.toContain(DARK_BG)
	})

	it('follows prefers-color-scheme with theme "auto"', () => {
		osDark()
		expect(draw({ theme: "auto" })).toContain(DARK_BG)
		vi.stubGlobal("matchMedia", () => ({ matches: false }))
		expect(draw({ theme: "auto" })).toContain(LIGHT_BG)
	})

	it("merges a partial palette over the light theme", () => {
		const out = draw({ theme: { shapeStroke: "#112233" } })
		expect(out).toContain("#112233")
		expect(out).toContain(LIGHT_BG)
	})

	it("reads --bpmnkit-viewer-* variables, and the halo follows bg", () => {
		const host = document.createElement("div")
		host.style.setProperty("--bpmnkit-viewer-bg", "#abcdef")
		host.style.setProperty("--bpmnkit-viewer-stroke", "#fedcba")
		document.body.append(host)
		render(xml, host)
		expect(host.innerHTML).toContain("#abcdef")
		expect(host.innerHTML).toContain("#fedcba")
		expect(host.innerHTML).not.toContain(LIGHT_BG)
	})

	it("lets an explicit palette win over variables", () => {
		const host = document.createElement("div")
		host.style.setProperty("--bpmnkit-viewer-stroke", "#fedcba")
		document.body.append(host)
		render(xml, host, { theme: { shapeStroke: "#112233" } })
		expect(host.innerHTML).toContain("#112233")
		expect(host.innerHTML).not.toContain("#fedcba")
	})

	it("shows a message for a file without DI", () => {
		const el = document.createElement("div")
		expect(render(noDi, el)).toBe(false)
		expect(el.textContent).toMatch(/No diagram layout/)
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
	const script = (theme?: string): HTMLScriptElement => {
		const s = document.createElement("script")
		s.type = "application/bpmn+xml"
		s.textContent = xml
		if (theme) s.setAttribute("data-theme", theme)
		return s
	}

	it("reads data-theme from the script", () => {
		osDark()
		document.body.append(script("dark"))
		boot()
		expect(document.body.innerHTML).toContain(DARK_BG)
		document.body.innerHTML = ""
		document.body.append(script("auto"))
		boot()
		expect(document.body.innerHTML).toContain(DARK_BG)
		document.body.innerHTML = ""
		document.body.append(script("nonsense"), script())
		boot()
		expect(document.body.innerHTML).not.toContain(DARK_BG)
	})

	it("reads CSS variables from the page", () => {
		const style = document.createElement("style")
		style.textContent = ".bpmn-lite{--bpmnkit-viewer-flow:#0a0b0c}"
		document.head.append(style)
		document.body.append(script())
		boot()
		style.remove()
		expect(document.body.innerHTML).toContain("#0a0b0c")
	})

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
