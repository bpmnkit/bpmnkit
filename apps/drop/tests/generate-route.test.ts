import { describe, expect, it } from "vitest"
import type { Env } from "../src/env.js"
import { getBudgetSpent } from "../src/lib/ai.js"
import { type GenerateEvent, neuronsFor } from "../src/lib/generate.js"
import { dropPage } from "../src/lib/pages.js"
import { handleGenerate } from "../src/routes/generate.js"
import { migratedDb } from "./d1.js"

const NOW = 1_752_000_000_000
const DAY = new Date(NOW).toISOString().slice(0, 10)
const MODEL = "@cf/openai/gpt-oss-20b"
const CODE = "sesame"

const ANSWER = [
	"# Expense approval\n",
	"start[start Expense submitted] > check[xor Over 1000?]\n",
	"check >(Yes: amount > 1000) review[user Review expense] > pay[service Pay expense] > done[end Paid]\n",
	"check >(No: default) pay\n",
]
const USAGE = { prompt_tokens: 420, completion_tokens: 160 }

/** A Workers AI binding that streams `chunks` in the chat-completion shape, reasoning first. */
function fakeAi(chunks: string[], options: { fail?: boolean } = {}) {
	const calls: { model: string; inputs: Record<string, unknown>; options: unknown }[] = []
	return {
		calls,
		async run(model: string, inputs: Record<string, unknown>, opts: unknown) {
			calls.push({ model, inputs, options: opts })
			const encoder = new TextEncoder()
			return new ReadableStream<Uint8Array>({
				start(controller) {
					const send = (o: unknown) =>
						controller.enqueue(encoder.encode(`data: ${JSON.stringify(o)}\n\n`))
					send({ choices: [{ delta: { reasoning_content: "Plan the steps." } }] })
					for (const content of chunks) send({ choices: [{ delta: { content } }] })
					if (options.fail) return controller.error(new Error("upstream reset"))
					send({ choices: [{ delta: {} }], usage: USAGE })
					controller.enqueue(encoder.encode("data: [DONE]\n\n"))
					controller.close()
				},
			})
		},
	}
}

function makeEnv(ai: ReturnType<typeof fakeAi>, over: Partial<Env> = {}): Env {
	return {
		AI: ai,
		AI_PASSCODE: CODE,
		AI_GENERATE_MODEL: MODEL,
		AI_DAILY_BUDGET: "8000",
		DB: migratedDb(),
		...over,
	} as unknown as Env
}

const post = (description: unknown, code = CODE) =>
	new Request("http://drop/drop/api/generate", {
		method: "POST",
		headers: { "Content-Type": "application/json", "X-Drop-AI-Code": code },
		body: JSON.stringify({ description }),
	})

async function events(res: Response): Promise<GenerateEvent[]> {
	return (await res.text())
		.split("\n\n")
		.filter((block) => block.startsWith("data: "))
		.map((block) => JSON.parse(block.slice(6)) as GenerateEvent)
}

const text = (evs: GenerateEvent[]) => evs.map((e) => ("text" in e ? e.text : "")).join("")

const DESCRIPTION = "Approve expenses: a manager reviews anything over 1000, then pay."

describe("POST /drop/api/generate", () => {
	it("is off (404) without AI_PASSCODE", async () => {
		const res = await handleGenerate(
			post(DESCRIPTION),
			makeEnv(fakeAi(ANSWER), { AI_PASSCODE: undefined }),
			NOW,
		)
		expect(res.status).toBe(404)
	})

	it("rejects a wrong access code before anything else", async () => {
		const ai = fakeAi(ANSWER)
		const res = await handleGenerate(post(DESCRIPTION, "nope"), makeEnv(ai), NOW)
		expect(res.status).toBe(401)
		expect(ai.calls).toHaveLength(0)
	})

	it("rejects a description that is too short or not text", async () => {
		const env = makeEnv(fakeAi(ANSWER))
		expect((await handleGenerate(post("hi"), env, NOW)).status).toBe(400)
		expect((await handleGenerate(post(42), env, NOW)).status).toBe(400)
		expect((await handleGenerate(post("x".repeat(2001)), env, NOW)).status).toBe(400)
	})

	it("streams the model's text, without its reasoning, then done", async () => {
		const ai = fakeAi(ANSWER)
		const env = makeEnv(ai)
		const res = await handleGenerate(post(DESCRIPTION), env, NOW)
		expect(res.headers.get("Content-Type")).toContain("text/event-stream")
		const evs = await events(res)
		expect(text(evs)).toBe(ANSWER.join(""))
		expect(evs.at(-1)).toEqual({ done: true, cached: false })
		expect(JSON.stringify(evs)).not.toContain("Plan the steps")

		const call = ai.calls[0]
		expect(call?.model).toBe(MODEL)
		expect(call?.inputs).toMatchObject({ stream: true, reasoning: { effort: "low" } })
		expect(call?.options).toEqual({ extraHeaders: { "x-session-affinity": "drop-generate" } })
	})

	it("charges the budget from the model's reported usage", async () => {
		const env = makeEnv(fakeAi(ANSWER))
		await events(await handleGenerate(post(DESCRIPTION), env, NOW))
		expect(await getBudgetSpent(env.DB, DAY)).toBe(
			neuronsFor(MODEL, { promptTokens: 420, completionTokens: 160 }),
		)
	})

	it("serves a repeated description from the cache without calling the model", async () => {
		const ai = fakeAi(ANSWER)
		const env = makeEnv(ai)
		await events(await handleGenerate(post(DESCRIPTION), env, NOW))
		const again = await events(
			await handleGenerate(post(`  ${DESCRIPTION.replace(/ /g, "  ")} `), env, NOW),
		)
		expect(ai.calls).toHaveLength(1)
		expect(text(again)).toBe(ANSWER.join(""))
		expect(again.at(-1)).toEqual({ done: true, cached: true })
	})

	it("does not cache across models", async () => {
		const ai = fakeAi(ANSWER)
		const env = makeEnv(ai)
		await events(await handleGenerate(post(DESCRIPTION), env, NOW))
		await events(
			await handleGenerate(post(DESCRIPTION), { ...env, AI_GENERATE_MODEL: "@cf/other" }, NOW),
		)
		expect(ai.calls).toHaveLength(2)
	})

	it("stops at the daily budget", async () => {
		const ai = fakeAi(ANSWER)
		const res = await handleGenerate(post(DESCRIPTION), makeEnv(ai, { AI_DAILY_BUDGET: "0" }), NOW)
		expect(res.status).toBe(503)
		expect(ai.calls).toHaveLength(0)
	})

	it("reports an answer with no process in it, charges it, and does not cache it", async () => {
		const ai = fakeAi(["I'm sorry, I can only help with processes."])
		const env = makeEnv(ai)
		const evs = await events(await handleGenerate(post(DESCRIPTION), env, NOW))
		expect(evs.at(-1)).toMatchObject({ error: expect.stringContaining("Couldn't turn that") })
		expect(await getBudgetSpent(env.DB, DAY)).toBeGreaterThan(0)
		await events(await handleGenerate(post(DESCRIPTION), env, NOW))
		expect(ai.calls).toHaveLength(2)
	})

	it("reports a stream that breaks part way", async () => {
		const env = makeEnv(fakeAi(ANSWER.slice(0, 2), { fail: true }))
		const evs = await events(await handleGenerate(post(DESCRIPTION), env, NOW))
		expect(evs.at(-1)).toMatchObject({ error: expect.stringContaining("stopped part way") })
		// No usage chunk arrived, so the charge is estimated from characters — never zero.
		expect(await getBudgetSpent(env.DB, DAY)).toBeGreaterThan(0)
	})
})

describe("drop page", () => {
	it("shows the describe section only when AI is enabled, numbering sections in order", () => {
		const on = dropPage("tos", true)
		const off = dropPage("tos", false)
		expect(on).toContain('id="describe"')
		expect(on).toContain('href="#describe"')
		expect(off).not.toContain('id="describe"')
		const numbers = (page: string) => [...page.matchAll(/section-num">(\d+)</g)].map((m) => m[1])
		expect(numbers(on)).toEqual(["01", "02", "03", "04", "05", "06"])
		expect(numbers(off)).toEqual(["01", "02", "03", "04", "05"])
	})
})
