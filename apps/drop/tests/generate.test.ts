import { PROCESS_TEXT_GUIDE, expand, parseProcessText } from "@bpmnkit/core"
import { describe, expect, it } from "vitest"
import {
	GENERATE_SYSTEM_PROMPT,
	createSseReader,
	generateMessages,
	readAiEvent,
} from "../src/lib/generate.js"

describe("generate prompt", () => {
	it("teaches the format the parser reads, and puts the description last", () => {
		expect(GENERATE_SYSTEM_PROMPT).toContain(PROCESS_TEXT_GUIDE)
		const messages = generateMessages("Approve expenses over 1000")
		expect(messages.map((m) => m.role)).toEqual(["system", "user"])
		expect(messages[1]?.content).toBe("Approve expenses over 1000")
	})

	it("is the same prefix for every description, so it can be cached", () => {
		expect(generateMessages("a")[0]).toEqual(generateMessages("b")[0])
	})

	it("turns a typical model answer into a diagram", () => {
		const answer = [
			"# Expense approval",
			"start[start Expense submitted] > check[xor Amount over 1000?]",
			"check >(Yes: amount > 1000) review[user Review expense] > pay[service Pay expense]",
			"check >(No: default) auto[service Approve automatically] > pay",
			"pay > done[end Expense paid]",
		].join("\n")
		const { diagram, problems } = parseProcessText(answer)
		expect(problems).toEqual([])
		expect(() => expand(diagram)).not.toThrow()
	})
})

describe("readAiEvent", () => {
	it("reads the legacy { response } shape", () => {
		expect(readAiEvent('{"response":"a > b"}')).toEqual({ content: "a > b" })
	})

	it("reads chat-completion deltas, reasoning separately", () => {
		expect(readAiEvent('{"choices":[{"delta":{"content":"x"}}]}')).toEqual({ content: "x" })
		expect(readAiEvent('{"choices":[{"delta":{"reasoning_content":"hmm"}}]}')).toEqual({
			reasoning: "hmm",
		})
	})

	it("reads usage, with reasoning and cached tokens when reported", () => {
		const event = readAiEvent(
			JSON.stringify({
				choices: [{ delta: {} }],
				usage: {
					prompt_tokens: 400,
					completion_tokens: 250,
					completion_tokens_details: { reasoning_tokens: 90 },
					prompt_tokens_details: { cached_tokens: 384 },
				},
			}),
		)
		expect(event?.usage).toEqual({
			promptTokens: 400,
			completionTokens: 250,
			reasoningTokens: 90,
			cachedTokens: 384,
		})
	})

	it("ignores [DONE] and junk", () => {
		expect(readAiEvent("[DONE]")).toBeNull()
		expect(readAiEvent("not json")).toBeNull()
	})
})

describe("createSseReader", () => {
	it("holds a line cut across chunks until it ends", () => {
		const reader = createSseReader()
		expect(reader.push('data: {"response":"a"}\n\ndata: {"resp')).toEqual(['{"response":"a"}'])
		expect(reader.push('onse":"b"}\n\n')).toEqual(['{"response":"b"}'])
		expect(reader.push("event: ping\r\ndata: [DONE]\r\n")).toEqual(["[DONE]"])
	})
})
