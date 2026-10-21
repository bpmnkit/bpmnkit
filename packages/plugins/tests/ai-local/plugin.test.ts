import type { BpmnDefinitions } from "@bpmnkit/core"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { createAiLocalPlugin } from "../../src/ai-local/index.js"
import { AI_LOCAL_EXAMPLE } from "../../src/ai-local/prompt.js"
import {
	type FakeHandle,
	type FakeOptions,
	installFakeModel,
	uninstallFakeModel,
} from "./fake-model.js"

const lines = AI_LOCAL_EXAMPLE.answer.split("\n").map((l) => `${l}\n`)
const flush = () => new Promise((r) => setTimeout(r, 0))

let container: HTMLDivElement
let handle: FakeHandle

beforeEach(() => {
	container = document.createElement("div")
	document.body.append(container)
})
afterEach(() => {
	container.remove()
	uninstallFakeModel()
})

async function setup(o: FakeOptions = {}) {
	handle = installFakeModel({ chunks: lines, ...o })
	const openDiagram = vi.fn<(xml: string, name: string) => void>()
	const updateDiagram = vi.fn<(defs: BpmnDefinitions) => void>()
	const plugin = createAiLocalPlugin({ openDiagram, updateDiagram, container })
	const ready = await plugin.ready
	const q = <T extends Element>(sel: string) => container.querySelector(sel) as T
	const input = q<HTMLTextAreaElement>("textarea.ai-local-input")
	const run = q<HTMLButtonElement>("button.ai-local-run")
	const status = q<HTMLElement>(".ai-local-status")
	const type = (text: string) => {
		input.value = text
		input.dispatchEvent(new Event("input"))
	}
	return { plugin, ready, openDiagram, updateDiagram, input, run, status, type, q }
}

const settle = async () => {
	for (let i = 0; i < 20; i++) await flush()
}

describe("createAiLocalPlugin", () => {
	it("is not ready and hidden when unavailable", async () => {
		const s = await setup({ availability: "unavailable" })
		expect(s.ready).toBe(false)
		expect(s.plugin.button.hidden).toBe(true)
	})
	it.each(["available", "downloadable"] as const)("is ready for %s", async (availability) => {
		const s = await setup({ availability })
		expect(s.ready).toBe(true)
		expect(s.plugin.button.hidden).toBe(false)
	})
	it("explains the one-time download", async () => {
		const s = await setup({ availability: "downloadable" })
		expect(s.status.textContent).toContain("one-time download")
		expect(s.status.textContent).toBe(
			"The first run needs a one-time download of Chrome's on-device model.",
		)
	})
	it("has the panel contract", async () => {
		const s = await setup()
		expect(container.querySelector(".ai-local-panel")).not.toBeNull()
		expect(s.input.maxLength).toBe(2000)
		expect(s.run.textContent).toBe("Generate")
	})
	it("opens the panel via onOpen when the button is clicked", async () => {
		handle = installFakeModel()
		const onOpen = vi.fn()
		const p = createAiLocalPlugin({
			openDiagram: vi.fn(),
			updateDiagram: vi.fn(),
			container,
			onOpen,
		})
		await p.ready
		p.button.click()
		expect(onOpen).toHaveBeenCalledOnce()
	})

	it("generates a diagram on the happy path", async () => {
		const s = await setup()
		s.type("Expense approval")
		s.run.click()
		await settle()
		expect(s.openDiagram).toHaveBeenCalledOnce()
		expect(s.openDiagram.mock.calls[0]?.[1]).toBe("Expense approval")
		expect(s.openDiagram.mock.calls[0]?.[0]).toContain("<")
		expect(s.updateDiagram.mock.calls.length).toBeGreaterThanOrEqual(2)
		expect(container.querySelector("ul.ai-local-notes")).not.toBeNull()
		expect(s.run.textContent).toBe("Generate")
		expect(handle.destroyed).toBe(1)
	})
	it("lists problems and fixes as notes", async () => {
		const s = await setup({ chunks: ["a[task Do it]\n"] })
		s.type("x")
		s.run.click()
		await settle()
		expect(s.q("ul.ai-local-notes").querySelectorAll("li").length).toBeGreaterThan(0)
	})
	it("creates one session for rapid double clicks", async () => {
		const s = await setup()
		s.type("Expense approval")
		s.run.click()
		s.run.click()
		await settle()
		expect(handle.created.length).toBe(1)
	})
	it("disables run for a blank description", async () => {
		const s = await setup()
		s.type("   ")
		expect(s.run.disabled).toBe(true)
		s.run.click()
		await settle()
		expect(handle.created.length).toBe(0)
		s.type("go")
		expect(s.run.disabled).toBe(false)
	})
	it("reports a session creation failure", async () => {
		const s = await setup({ createError: new Error("disk") })
		s.type("x")
		s.run.click()
		await settle()
		expect(s.status.textContent).toContain("Chrome couldn't prepare the on-device model: disk")
		expect(s.openDiagram).not.toHaveBeenCalled()
		expect(s.run.textContent).toBe("Generate")
	})
	it("rejects a description that does not fit, streaming nothing", async () => {
		const s = await setup({ contextWindow: 100 })
		s.type("x".repeat(50))
		s.run.click()
		await settle()
		expect(s.status.textContent).toBe("Description too long for the on-device model — shorten it.")
		expect(s.openDiagram).not.toHaveBeenCalled()
		expect(handle.destroyed).toBe(1)
	})
	it("reports prose output", async () => {
		const s = await setup({ chunks: ["Sure! Here is your process."] })
		s.type("x")
		s.run.click()
		await settle()
		expect(s.status.textContent).toBe("The model didn't return a diagram — try rephrasing.")
		expect(s.openDiagram).not.toHaveBeenCalled()
	})
	it("stops a run and destroys the session", async () => {
		const s = await setup()
		// Stop from inside the first frame so the run is certainly mid-stream.
		s.openDiagram.mockImplementation(() => s.plugin.stop())
		s.type("x")
		s.run.click()
		await settle()
		expect(s.status.textContent).toBe("Stopped")
		expect(handle.destroyed).toBe(1)
		expect(s.run.textContent).toBe("Generate")
	})
	it("stops when the run button says Stop", async () => {
		const s = await setup()
		s.type("x")
		s.run.click()
		expect(s.run.textContent).toBe("Stop")
		s.run.click()
		await settle()
		expect(s.status.textContent).toBe("Stopped")
		expect(handle.destroyed).toBe(1)
	})
	it("explains a quota error", async () => {
		const s = await setup({
			chunks: [lines[0] ?? "", lines[1] ?? ""],
			streamError: new DOMException("full", "QuotaExceededError"),
		})
		s.type("x")
		s.run.click()
		await settle()
		expect(s.status.textContent).toBe(
			"The diagram outgrew the model's context — try a smaller process.",
		)
		expect(handle.destroyed).toBe(1)
	})
	it("reports another stream error", async () => {
		const s = await setup({ chunks: [], streamError: new Error("boom") })
		s.type("x")
		s.run.click()
		await settle()
		expect(s.status.textContent).toBe("Generation failed: boom")
	})
	it("shows download progress", async () => {
		const s = await setup({ progress: [0.5] })
		s.type("x")
		s.run.click()
		await settle()
		expect(s.openDiagram).toHaveBeenCalled()
	})
})
