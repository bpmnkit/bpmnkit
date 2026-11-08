import { afterEach, describe, expect, it, vi } from "vitest"
import { deployabilityNote, streamChat, streamImprove } from "../../src/ai-bridge/panel.js"

const GATE =
	"Not deployable on Camunda 8.10: 1 error(s)\n- charge: Must have exactly one 'zeebe:taskDefinition' extension element (zeebe/service-task-definition)"

function sse(events: unknown[]): Response {
	const body = events.map((e) => `data: ${JSON.stringify(e)}\n\n`).join("")
	return new Response(body, { status: 200 })
}

async function collect(stream: AsyncGenerator<string>): Promise<string> {
	let text = ""
	for await (const token of stream) text += token
	return text
}

afterEach(() => vi.unstubAllGlobals())

describe("AI panel streams: deploy gate", () => {
	it("/chat asks for a draft and shows the gate's lines with the inserted diagram", async () => {
		const fetchMock = vi.fn(async () =>
			sse([
				{ type: "token", text: "Built it." },
				{ type: "xml", xml: "<x/>" },
				{ type: "deployability", message: GATE },
				{ type: "done" },
			]),
		)
		vi.stubGlobal("fetch", fetchMock)
		const xml: string[] = []
		const text = await collect(
			streamChat(
				"http://proxy",
				[{ role: "user", content: "Charge" }],
				null,
				"auto",
				new AbortController().signal,
				undefined,
				(x) => xml.push(x),
			),
		)
		const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
		expect(JSON.parse(String(init.body)).validate).toBe(false)
		expect(xml).toEqual(["<x/>"])
		expect(text).toBe(`Built it.${deployabilityNote(GATE)}`)
		expect(text).toContain("- charge: ")
		expect(text).toContain("(zeebe/service-task-definition)")
	})

	it("/improve does the same", async () => {
		const fetchMock = vi.fn(async () =>
			sse([
				{ type: "ops", ops: [], autoFixCount: 1 },
				{ type: "xml", xml: "<x/>" },
				{ type: "deployability", message: GATE },
				{ type: "done" },
			]),
		)
		vi.stubGlobal("fetch", fetchMock)
		const text = await collect(
			streamImprove("http://proxy", "<x/>", "auto", new AbortController().signal),
		)
		const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
		expect(JSON.parse(String(init.body)).validate).toBe(false)
		expect(text).toContain(GATE)
	})

	it("a refusal the proxy sends is an error carrying the gate's message", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn(async () => sse([{ type: "error", message: GATE }])),
		)
		await expect(
			collect(streamImprove("http://proxy", "<x/>", "auto", new AbortController().signal)),
		).rejects.toThrow(GATE)
	})
})
