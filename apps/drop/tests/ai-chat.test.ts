// @vitest-environment happy-dom
/**
 * The editor's AI chat: what it sends, and that the answer becomes one editor
 * change only while the diagram is still the one the AI read.
 */
import {
	Bpmn,
	type BpmnDefinitions,
	expand,
	parseProcessText,
	writeProcessText,
} from "@bpmnkit/core"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { type ChatTarget, mountAiChat } from "../src/client/ai-chat.js"
import { AI_CODE_STORAGE_KEY } from "../src/shared/constants.js"

const XML = Bpmn.export(
	expand(
		parseProcessText(
			"# Order\nstart[start Order received] > validate[service Validate order] > end[end Done]",
		).diagram,
	),
)
const { aliases } = writeProcessText(Bpmn.parse(XML))
const validateAlias = Object.entries(aliases).find(([, id]) => id === "validate")?.[0] ?? "validate"

const stream = (events: unknown[]) =>
	new Response(events.map((e) => `data: ${JSON.stringify(e)}\n\n`).join(""), {
		headers: { "Content-Type": "text/event-stream" },
	})

const ANSWER = [
	{ aliases },
	{ text: `${validateAlias} > credit[service Check credit] > end\n` },
	{ done: true, cached: false },
]

let log: HTMLElement
let compose: HTMLElement
let xml: string
let applied: BpmnDefinitions[]
let fetchMock: ReturnType<typeof vi.fn>

function target(): ChatTarget {
	return {
		filename: "order.bpmn",
		xml: () => xml,
		selection: () => ["validate", "Flow_not_an_element"],
		apply: (defs) => applied.push(defs),
	}
}

function mount(over: { target?: () => ChatTarget | null } = {}) {
	return mountAiChat({
		shareId: "share1",
		log,
		compose,
		turnstile: false,
		challenge: async () => ({ ok: true, token: null }),
		target: over.target ?? target,
	})
}

/** Types `text` and presses Enter, then lets the request and its answer run. */
async function ask(text: string): Promise<void> {
	const area = compose.querySelector("textarea") as HTMLTextAreaElement
	area.value = text
	area.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }))
	await vi.waitFor(() =>
		expect(log.querySelector("[role=status]")?.textContent).not.toMatch(/^Working/),
	)
}

beforeEach(() => {
	log = document.createElement("div")
	compose = document.createElement("div")
	document.body.append(log, compose)
	xml = XML
	applied = []
	localStorage.setItem(AI_CODE_STORAGE_KEY, "sesame")
	fetchMock = vi.fn(async () => stream(ANSWER))
	vi.stubGlobal("fetch", fetchMock)
})

afterEach(() => {
	vi.unstubAllGlobals()
	localStorage.clear()
	document.body.replaceChildren()
})

describe("the editor's AI chat", () => {
	it("sends the request with the selected elements, and makes the answer one editor change", async () => {
		mount()
		await ask("Check the credit after validating")
		const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
		expect(url).toBe("/drop/api/ai-edit/share1/order.bpmn")
		expect((init.headers as Record<string, string>)["X-Drop-AI-Code"]).toBe("sesame")
		expect(JSON.parse(init.body as string)).toEqual({
			xml: XML,
			request: "Check the credit after validating",
			// The edge is not an element a request can be about.
			elementIds: ["validate"],
		})
		expect(applied).toHaveLength(1)
		const ids = applied[0]?.processes[0]?.flowElements.map((e) => e.id)
		expect(ids).toContain("credit")
		expect(log.textContent).toContain("You · Validate order")
		expect(log.textContent).toContain('Added service task "Check credit"')
		expect(log.textContent).toContain("Undo in the editor reverts it")
	})

	it("changes nothing when the diagram changed while the AI was working", async () => {
		fetchMock.mockImplementation(async () => {
			xml = XML.replace("Validate order", "Validate the order")
			return stream(ANSWER)
		})
		mount()
		await ask("Check the credit")
		expect(applied).toHaveLength(0)
		expect(log.textContent).toContain("The diagram changed while the AI was working")
	})

	it("asks for the access code first, and again when it is refused", async () => {
		localStorage.removeItem(AI_CODE_STORAGE_KEY)
		mount()
		const area = compose.querySelector("textarea") as HTMLTextAreaElement
		area.value = "Check the credit"
		area.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }))
		expect(fetchMock).not.toHaveBeenCalled()
		expect(log.textContent).toContain("Enter your access code")

		fetchMock.mockImplementation(
			async () => new Response(JSON.stringify({ error: "invalid access code" }), { status: 401 }),
		)
		const input = log.querySelector("input[type=password]") as HTMLInputElement
		input.value = "wrong"
		input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }))
		await vi.waitFor(() => expect(log.textContent).toContain("was not accepted"))
		expect(localStorage.getItem(AI_CODE_STORAGE_KEY)).toBeNull()
		expect(applied).toHaveLength(0)
	})

	it("sends nothing once editing has ended", async () => {
		mount({ target: () => null })
		const area = compose.querySelector("textarea") as HTMLTextAreaElement
		area.value = "Check the credit"
		area.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }))
		expect(fetchMock).not.toHaveBeenCalled()
	})
})
