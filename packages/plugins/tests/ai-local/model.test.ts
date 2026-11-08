import { afterEach, describe, expect, it } from "vitest"
import { checkAvailability, createSession, fitsContext } from "../../src/ai-local/model.js"
import { AI_LOCAL_EXAMPLE, AI_LOCAL_SYSTEM_PROMPT } from "../../src/ai-local/prompt.js"
import { fakeSession, installFakeModel, uninstallFakeModel } from "./fake-model.js"

afterEach(uninstallFakeModel)

describe("checkAvailability", () => {
	it("is unavailable without LanguageModel", async () => {
		expect(await checkAvailability()).toBe("unavailable")
	})
	it("is unavailable when availability throws", async () => {
		;(globalThis as Record<string, unknown>).LanguageModel = {
			availability: () => Promise.reject(new Error("boom")),
		}
		expect(await checkAvailability()).toBe("unavailable")
	})
	it("passes through the state", async () => {
		installFakeModel({ availability: "downloadable" })
		expect(await checkAvailability()).toBe("downloadable")
	})
	it("passes expected input/output languages", async () => {
		let seen: unknown
		;(globalThis as Record<string, unknown>).LanguageModel = {
			availability: (opts: unknown) => {
				seen = opts
				return Promise.resolve("available")
			},
		}
		await checkAvailability()
		const text = [{ type: "text", languages: ["en"] }]
		expect(seen).toEqual({ expectedInputs: text, expectedOutputs: text })
	})
})

describe("createSession", () => {
	it("seeds the prompt with the worked example", async () => {
		const fake = installFakeModel()
		await createSession({ signal: new AbortController().signal })
		expect((fake.created[0] as { initialPrompts: unknown }).initialPrompts).toEqual([
			{ role: "system", content: AI_LOCAL_SYSTEM_PROMPT },
			{ role: "user", content: AI_LOCAL_EXAMPLE.description },
			{ role: "assistant", content: AI_LOCAL_EXAMPLE.answer },
		])
	})
	it("reports download progress", async () => {
		installFakeModel({ progress: [0.5, 1] })
		const seen: number[] = []
		await createSession({
			signal: new AbortController().signal,
			onDownloadProgress: (l) => seen.push(l),
		})
		expect(seen).toEqual([0.5, 1])
	})
	it("rejects with the create error", async () => {
		const err = new Error("nope")
		installFakeModel({ createError: err })
		await expect(createSession({ signal: new AbortController().signal })).rejects.toBe(err)
	})
})

describe("fitsContext", () => {
	const s = fakeSession({ contextWindow: 4096, usage: 1000 })
	it("fits when usage + description + reserve <= window", async () => {
		expect(await fitsContext(s, "x".repeat(2000))).toBe(true)
	})
	it("does not fit when over", async () => {
		expect(await fitsContext(s, "x".repeat(2100))).toBe(false)
	})
})

describe("fakeSession", () => {
	it("streams chunks, errors on abort, counts destroy", async () => {
		const s = fakeSession({ chunks: ["a", "b"] })
		const out: string[] = []
		for await (const c of s.promptStreaming("q")) out.push(c)
		expect(out).toEqual(["a", "b"])
		const ac = new AbortController()
		const r = s.promptStreaming("q", { signal: ac.signal }).getReader()
		ac.abort(new Error("stop"))
		await expect(r.read()).rejects.toThrow("stop")
		s.destroy()
		expect(s.destroyed).toBe(1)
	})
})
