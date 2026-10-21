import { afterEach, describe, expect, it } from "vitest"
import {
	OnDeviceError,
	addOriginTrialToken,
	downloadStatus,
	initialMode,
	mayCallServer,
	mayDraft,
	onDeviceAvailable,
	onDeviceFailure,
	onDeviceRequested,
	onDeviceText,
} from "../src/client/on-device.js"

const PROCESS = "# Order\nstart[start Order received] > ship[task Ship order] > done[end Shipped]\n"

interface FakeOpts {
	chunks?: string[]
	contextWindow?: number
	createError?: Error
	streamError?: Error
	availability?: string
}

let destroyed = 0

function install(o: FakeOpts = {}): void {
	destroyed = 0
	;(globalThis as { LanguageModel?: unknown }).LanguageModel = {
		availability: async () => o.availability ?? "available",
		create: async () => {
			if (o.createError) throw o.createError
			return {
				contextUsage: 0,
				contextWindow: o.contextWindow ?? 100_000,
				measureContextUsage: async (input: string) => input.length,
				destroy: () => {
					destroyed++
				},
				promptStreaming(_input: string, opts?: { signal?: AbortSignal }) {
					const chunks = [...(o.chunks ?? [])]
					const signal = opts?.signal
					return new ReadableStream<string>({
						pull(controller) {
							if (signal?.aborted) return controller.error(signal.reason)
							const next = chunks.shift()
							if (next !== undefined) return controller.enqueue(next)
							if (o.streamError) return controller.error(o.streamError)
							controller.close()
						},
					})
				},
			}
		},
	}
}

async function collect(gen: AsyncGenerator<string, void, undefined>): Promise<string> {
	let out = ""
	for await (const part of gen) out += part
	return out
}

afterEach(() => {
	;(globalThis as { LanguageModel?: unknown }).LanguageModel = undefined
})

describe("onDeviceAvailable", () => {
	it("is false without the API", async () => {
		expect(await onDeviceAvailable()).toBe(false)
	})
	it("is true when downloadable", async () => {
		install({ availability: "downloadable" })
		expect(await onDeviceAvailable()).toBe(true)
	})
	it("is false when unavailable", async () => {
		install({ availability: "unavailable" })
		expect(await onDeviceAvailable()).toBe(false)
	})
})

describe("onDeviceText", () => {
	const signal = () => new AbortController().signal

	it("streams only diagram lines", async () => {
		const text = `Sure! Here it is:\n\`\`\`\n${PROCESS}\`\`\`\n`
		install({ chunks: [text.slice(0, 7), text.slice(7, 40), text.slice(40, 41), text.slice(41)] })
		expect(await collect(onDeviceText("an order", { signal: signal() }))).toBe(PROCESS)
		expect(destroyed).toBe(1)
	})

	it("flushes a last line without a newline", async () => {
		install({ chunks: ["# Order\nstart[start A] > done[end B]"] })
		expect(await collect(onDeviceText("x", { signal: signal() }))).toBe(
			"# Order\nstart[start A] > done[end B]",
		)
	})

	it("ends quietly when aborted mid-stream", async () => {
		install({ chunks: ["# Order\n", "start[start A]\n", "more\n"] })
		const ac = new AbortController()
		const gen = onDeviceText("x", { signal: ac.signal })
		const first = await gen.next()
		expect(first.value).toBe("# Order\n")
		ac.abort()
		expect((await gen.next()).done).toBe(true)
		expect(destroyed).toBe(1)
	})

	it("refuses a description that does not fit", async () => {
		install({ chunks: [PROCESS], contextWindow: 500 })
		const got: string[] = []
		const run = async () => {
			for await (const part of onDeviceText("x".repeat(100), { signal: signal() })) got.push(part)
		}
		await expect(run()).rejects.toThrow(
			new OnDeviceError("Description too long for the on-device model — shorten it."),
		)
		expect(got).toEqual([])
		expect(destroyed).toBe(1)
	})

	it("reports a model that cannot be prepared", async () => {
		install({ createError: new Error("disk") })
		await expect(collect(onDeviceText("x", { signal: signal() }))).rejects.toThrow(
			"Chrome couldn't prepare the on-device model: disk",
		)
		expect(destroyed).toBe(0)
	})

	it("reports a context overflow", async () => {
		install({ chunks: ["# A\n"], streamError: new DOMException("x", "QuotaExceededError") })
		const err = await collect(onDeviceText("x", { signal: signal() })).catch((e) => e)
		expect(err).toBeInstanceOf(OnDeviceError)
		expect(err.message).toBe("The diagram outgrew the model's context — try a smaller process.")
		expect(destroyed).toBe(1)
	})

	it("reports other stream errors", async () => {
		install({ streamError: new Error("boom") })
		await expect(collect(onDeviceText("x", { signal: signal() }))).rejects.toThrow(
			"Generation failed: boom",
		)
	})
})

describe("opt-in helpers", () => {
	it("reads ?ai=on-device and nothing else", () => {
		expect(onDeviceRequested("?ai=on-device")).toBe(true)
		expect(onDeviceRequested("?nolimit&ai=on-device")).toBe(true)
		expect(onDeviceRequested("")).toBe(false)
		expect(onDeviceRequested("?ai=server")).toBe(false)
	})

	it("adds the origin-trial meta tag only with a token", () => {
		const added: { httpEquiv?: string; content?: string }[] = []
		const doc = {
			createElement: () => ({}) as { httpEquiv?: string; content?: string },
			head: { append: (m: { httpEquiv?: string; content?: string }) => added.push(m) },
		} as never
		addOriginTrialToken(doc, "")
		expect(added).toEqual([])
		addOriginTrialToken(doc, "tok")
		expect(added).toEqual([{ httpEquiv: "origin-trial", content: "tok" }])
	})

	it("shows OnDeviceError copy as is and prefixes other errors", () => {
		expect(onDeviceFailure(new OnDeviceError("Description too long."))).toBe(
			"Description too long.",
		)
		expect(onDeviceFailure(new Error("boom"))).toBe("Generation failed: boom")
		expect(onDeviceFailure("odd")).toBe("Generation failed: odd")
	})

	it("words download progress as a percentage", () => {
		expect(downloadStatus(0.426)).toBe("downloading the on-device model… 43%")
	})
})

describe("draft mode", () => {
	it("probes only when the page opted in", () => {
		expect(initialMode(true)).toBe("probing")
		expect(initialMode(false)).toBe("server")
	})

	it("sends nothing while probing", () => {
		expect(mayDraft("probing")).toBe(false)
		expect(mayCallServer("probing")).toBe(false)
	})

	it("never calls the server on the device", () => {
		expect(mayDraft("device")).toBe(true)
		expect(mayCallServer("device")).toBe(false)
	})

	it("keeps today's behaviour on the server", () => {
		expect(mayDraft("server")).toBe(true)
		expect(mayCallServer("server")).toBe(true)
	})
})
