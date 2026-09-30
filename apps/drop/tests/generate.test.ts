import { readFileSync, readdirSync } from "node:fs"
import {
	PROCESS_TEXT_GUIDE,
	expand,
	lintDiagram,
	parseProcessText,
	resolveBpmnlintConfig,
} from "@bpmnkit/core"
import { describe, expect, it } from "vitest"
import {
	GENERATE_MAX_TOKENS,
	GENERATE_SYSTEM_PROMPT,
	REFINE_SYSTEM_PROMPT,
	createSseReader,
	generateMessages,
	maxTokensFor,
	normaliseDiagram,
	readAiEvent,
	refineMessages,
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

	it("sends a change with the draft as the model's own answer, on the same prefix", () => {
		expect(REFINE_SYSTEM_PROMPT.startsWith(GENERATE_SYSTEM_PROMPT)).toBe(true)
		const messages = refineMessages("Approve expenses", "a > b", "add a review")
		expect(messages.map((m) => m.role)).toEqual(["system", "user", "assistant", "user"])
		expect(messages[3]?.content).toBe("Change: add a review")
	})

	it("teaches only change patterns the parser reads without a problem", () => {
		const rules = REFINE_SYSTEM_PROMPT.slice(GENERATE_SYSTEM_PROMPT.length)
		expect(rules).toContain("late[boundary:timer 24h | on=pay] > handler")
		const parallel = [
			"before > fork[and]",
			"fork > a",
			"fork > b",
			"a > joined[and]",
			"b > joined",
			"joined > after",
		]
		expect(rules).toContain(parallel.map((line) => `  ${line}`).join("\n"))
		// In a change the steps already exist; here they are declared where first used.
		const declared: Record<string, string> = {
			"fork > a": "fork > a[task A]",
			"fork > b": "fork > b[task B]",
			"joined > after": "joined > after[task After]",
		}
		const answer = [
			"s[start Go] > pay[service Pay] > before[task Before]",
			...parallel.map((line) => declared[line] ?? line),
			"after > e[end Done]",
			"late[boundary:timer 24h | on=pay] > handler[task Handle] > h[end Handled]",
		].join("\n")
		expect(parseProcessText(answer).problems).toEqual([])
	})

	it("sends a draft back without blank lines or trailing spaces", () => {
		expect(normaliseDiagram("# P\r\na > b  \n\n\nb > c\n")).toBe("# P\na > b\nb > c")
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

	it("keeps every recorded model answer free of structural lint findings", () => {
		// Every answer the benchmark recorded, however broken: what reaches the
		// canvas has no loose node, pass-through gateway, implicit split, branch
		// without a condition or unnamed event.
		const root = new URL("../bench-results/", import.meta.url)
		const answers = readdirSync(root).flatMap((run) =>
			(
				JSON.parse(readFileSync(new URL(`${run}/results.json`, root), "utf8")) as {
					model: string
					prompt: string
					text?: string
				}[]
			).filter((r) => r.text !== undefined),
		)
		expect(answers.length).toBeGreaterThan(100)
		const recommended = resolveBpmnlintConfig({ extends: "bpmnlint:recommended" })
		const structural = new Set(["flow", "naming", "feel"])
		const findings = answers.flatMap(({ model, prompt, text = "" }) =>
			lintDiagram(expand(parseProcessText(text).diagram), { bpmnlint: recommended })
				// How long a condition the model wrote is, is up to the model.
				.diagnostics.filter(
					(d) =>
						structural.has(d.category) &&
						d.severity !== "info" &&
						d.id !== "feel/complex-condition",
				)
				.map((d) => `${model} ${prompt}: ${d.id} ${d.message}`),
		)
		expect(findings).toEqual([])
	})
})

describe("maxTokensFor", () => {
	it("caps a model that does not reason far below one that does", () => {
		expect(maxTokensFor("@cf/zai-org/glm-4.7-flash")).toBe(600)
		expect(maxTokensFor("@cf/openai/gpt-oss-120b")).toBe(GENERATE_MAX_TOKENS)
		expect(maxTokensFor("@cf/unknown/model")).toBe(GENERATE_MAX_TOKENS)
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
