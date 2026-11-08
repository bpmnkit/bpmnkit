// @vitest-environment happy-dom
import { afterEach, describe, expect, it } from "vitest"
import { createSideDock } from "../src/dock.js"

const HIDDEN = "bpmnkit-side-dock__pane--hidden"

function mount() {
	const dock = createSideDock()
	document.body.appendChild(dock.el)
	const tab = () =>
		[...dock.el.querySelectorAll<HTMLElement>(".bpmnkit-side-dock__tab")].find(
			(b) => b.textContent === "Generate",
		)
	return { dock, tab }
}

afterEach(() => {
	document.body.innerHTML = ""
})

describe("side dock Generate tab", () => {
	it("is hidden by default", () => {
		const { tab } = mount()
		expect(tab()?.style.display).toBe("none")
	})

	it("is shown by setGenerateTabVisible(true)", () => {
		const { dock, tab } = mount()
		dock.setGenerateTabVisible(true)
		expect(tab()?.style.display).toBe("")
	})

	it("switchTab('generate') shows generatePane and hides the others", () => {
		const { dock } = mount()
		dock.switchTab("generate")
		expect(dock.activeTab).toBe("generate")
		expect(dock.generatePane.classList.contains(HIDDEN)).toBe(false)
		expect(dock.propertiesPane.classList.contains(HIDDEN)).toBe(true)
		expect(dock.testsPane.classList.contains(HIDDEN)).toBe(true)
	})

	it("falls back to properties when hidden while active", () => {
		const { dock } = mount()
		dock.setGenerateTabVisible(true)
		dock.switchTab("generate")
		dock.setGenerateTabVisible(false)
		expect(dock.activeTab).toBe("properties")
		expect(dock.generatePane.classList.contains(HIDDEN)).toBe(true)
	})
})
