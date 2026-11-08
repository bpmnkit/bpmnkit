import { Bpmn } from "@bpmnkit/core"
import type { BpmnDefinitions } from "@bpmnkit/core"
import { describe, expect, it, vi } from "vitest"
import { generateProcess } from "../../src/ai-local/generate.js"
import { AI_LOCAL_EXAMPLE } from "../../src/ai-local/prompt.js"
import { fakeSession } from "./fake-model.js"

const answer = AI_LOCAL_EXAMPLE.answer
const lines = answer.split("\n").map((l) => `${l}\n`)

function run(chunks: string[], ac = new AbortController()) {
	const frames: BpmnDefinitions[] = []
	const onFrame = vi.fn((d: BpmnDefinitions) => frames.push(d))
	const p = generateProcess(fakeSession({ chunks }), "x", { signal: ac.signal, onFrame })
	return { p, onFrame, frames, ac }
}

describe("generateProcess", () => {
	it("streams frames as lines complete", async () => {
		const { p, onFrame, frames } = run(lines)
		await p
		expect(onFrame.mock.calls.length).toBeGreaterThanOrEqual(3)
		const last = frames[frames.length - 1]
		expect(JSON.stringify(last)).toContain('"review"')
	})
	it("returns valid XML", async () => {
		const r = await run(lines).p
		expect(r).not.toBeNull()
		expect(() => Bpmn.parse(r?.xml ?? "")).not.toThrow()
		expect(r?.name).toBe("Expense approval")
		expect(r?.stopped).toBe(false)
	})
	it("ignores chunk boundaries and CRLF", async () => {
		const whole = await run([answer]).p
		const text = answer.replace(/\n/g, "\r\n")
		const chunks = text.match(/[\s\S]{1,3}/g) ?? []
		const split = await run(chunks).p
		expect(split?.xml).toBe(whole?.xml)
	})
	it("ignores code fences", async () => {
		const r = await run([`\`\`\`text\n${answer}\n\`\`\`\n`]).p
		expect(r).not.toBeNull()
		expect(r?.problems.some((x) => x.message.includes("```"))).toBe(false)
	})
	it("passes problems and fixes through", async () => {
		const r = await run(["a[task Do it]\n"]).p
		expect(r?.fixes.length).toBeGreaterThan(0)
	})
	it("returns null for prose", async () => {
		const { p, onFrame } = run(["Sure! Here is your process."])
		expect(await p).toBeNull()
		expect(onFrame).not.toHaveBeenCalled()
	})
	it("keeps the partial diagram on abort", async () => {
		const ac = new AbortController()
		const frames: BpmnDefinitions[] = []
		const chunks = ["# P\n", "a[start Go] > b[task Work]\n", "b > c[end Done]\n"]
		let n = 0
		const session = fakeSession({ chunks })
		const orig = session.promptStreaming
		session.promptStreaming = (i, opts) => {
			const s = orig(i, opts)
			const reader = s.getReader()
			return new ReadableStream<string>({
				async pull(c) {
					const r = await reader.read()
					if (r.done) return c.close()
					c.enqueue(r.value)
					if (++n === 2) ac.abort()
				},
			})
		}
		const r = await generateProcess(session, "x", {
			signal: ac.signal,
			onFrame: (d) => frames.push(d),
		})
		expect(r?.stopped).toBe(true)
		const xml = r?.xml ?? ""
		expect(xml).toContain('id="a"')
		expect(xml).toContain('id="b"')
		expect(xml).not.toContain('id="c"')
	})
	it("handles an already aborted signal", async () => {
		const ac = new AbortController()
		ac.abort()
		expect(await run(lines, ac).p).toBeNull()
	})
	it("names an unnamed process", async () => {
		const r = await run(["a[start Go] > b[end Done]\n"]).p
		expect(r?.name).toBe("Generated process")
	})
})
