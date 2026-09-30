import { describe, expect, it } from "vitest"
import type { Env } from "../src/env.js"
import { getBudgetSpent } from "../src/lib/ai.js"
import { type GenerateEvent, REFINE_SYSTEM_PROMPT, neuronsFor } from "../src/lib/generate.js"
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

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/** How one model behaves in {@link fakeAi}. */
interface FakeModel {
	chunks?: string[]
	/** Wait before the first byte — Workers AI queueing. */
	delay?: number
	/** `run` rejects. */
	throws?: boolean
	/** The stream breaks after its content. */
	fail?: boolean
}

/**
 * A Workers AI binding that streams `chunks` in the chat-completion shape,
 * reasoning first. `byModel` overrides the behaviour per model.
 */
function fakeAi(
	chunks: string[],
	options: { fail?: boolean; byModel?: Record<string, FakeModel> } = {},
) {
	const calls: { model: string; inputs: Record<string, unknown>; options: unknown }[] = []
	const cancelled: string[] = []
	return {
		calls,
		cancelled,
		async run(model: string, inputs: Record<string, unknown>, opts: unknown) {
			calls.push({ model, inputs, options: opts })
			const behaviour: FakeModel = { chunks, fail: options.fail, ...options.byModel?.[model] }
			if (behaviour.throws) throw new Error("capacity")
			const encoder = new TextEncoder()
			let stopped = false
			return new ReadableStream<Uint8Array>({
				async start(controller) {
					const send = (o: unknown) => {
						if (!stopped) controller.enqueue(encoder.encode(`data: ${JSON.stringify(o)}\n\n`))
					}
					if (behaviour.delay) await sleep(behaviour.delay)
					send({ choices: [{ delta: { reasoning_content: "Plan the steps." } }] })
					for (const content of behaviour.chunks ?? []) send({ choices: [{ delta: { content } }] })
					if (behaviour.fail) {
						// After a tick, so what was sent is read before the stream breaks.
						await sleep(5)
						if (!stopped) controller.error(new Error("upstream reset"))
						return
					}
					send({ choices: [{ delta: {} }], usage: USAGE })
					if (!stopped) {
						controller.enqueue(encoder.encode("data: [DONE]\n\n"))
						controller.close()
					}
				},
				cancel() {
					stopped = true
					cancelled.push(model)
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
		expect(call?.options).toEqual({
			extraHeaders: { "x-session-affinity": `drop-generate-${MODEL}` },
		})
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

describe("POST /drop/api/generate — a change to a draft", () => {
	const DRAFT = ANSWER.join("")
	const CHANGED = [...ANSWER, "pay > notify[send Notify employee] > done\n"]
	const change = (body: Record<string, unknown>) =>
		new Request("http://drop/drop/api/generate", {
			method: "POST",
			headers: { "Content-Type": "application/json", "X-Drop-AI-Code": CODE },
			body: JSON.stringify({ description: DESCRIPTION, ...body }),
		})

	it("sends the description, the draft and the change, and streams the new diagram", async () => {
		const ai = fakeAi(CHANGED)
		const evs = await events(
			await handleGenerate(
				change({ diagram: DRAFT, change: "notify the employee once paid" }),
				makeEnv(ai),
				NOW,
			),
		)
		expect(text(evs)).toBe(CHANGED.join(""))
		expect(evs.at(-1)).toEqual({ done: true, cached: false })
		const messages = ai.calls[0]?.inputs.messages as { role: string; content: string }[]
		expect(messages.map((m) => m.role)).toEqual(["system", "user", "assistant", "user"])
		expect(messages[0]?.content).toBe(REFINE_SYSTEM_PROMPT)
		expect(messages[1]?.content).toBe(DESCRIPTION)
		expect(messages[2]?.content).toBe(DRAFT.trimEnd())
		expect(messages[3]?.content).toBe("Change: notify the employee once paid")
	})

	it("rejects a change without a draft, or a draft without a change", async () => {
		const ai = fakeAi(CHANGED)
		const env = makeEnv(ai)
		expect((await handleGenerate(change({ change: "add a step" }), env, NOW)).status).toBe(400)
		expect((await handleGenerate(change({ diagram: DRAFT }), env, NOW)).status).toBe(400)
		expect((await handleGenerate(change({ diagram: DRAFT, change: "x" }), env, NOW)).status).toBe(
			400,
		)
		expect(
			(
				await handleGenerate(
					change({ diagram: "a > b\n".repeat(1000), change: "add a step" }),
					env,
					NOW,
				)
			).status,
		).toBe(400)
		expect(ai.calls).toHaveLength(0)
	})

	it("caches a change apart from the first draft, and apart from other changes", async () => {
		const ai = fakeAi(CHANGED)
		const env = makeEnv(ai)
		await events(await handleGenerate(post(DESCRIPTION), env, NOW))
		await events(await handleGenerate(change({ diagram: DRAFT, change: "notify" }), env, NOW))
		await events(await handleGenerate(change({ diagram: DRAFT, change: "escalate" }), env, NOW))
		expect(ai.calls).toHaveLength(3)
		const again = await events(
			await handleGenerate(change({ diagram: `${DRAFT}\r\n\n`, change: " notify " }), env, NOW),
		)
		expect(ai.calls).toHaveLength(3)
		expect(again.at(-1)).toEqual({ done: true, cached: true })
	})

	it("charges a change from its usage, like a first draft", async () => {
		const env = makeEnv(fakeAi(CHANGED))
		await events(await handleGenerate(change({ diagram: DRAFT, change: "notify" }), env, NOW))
		expect(await getBudgetSpent(env.DB, DAY)).toBe(
			neuronsFor(MODEL, { promptTokens: 420, completionTokens: 160 }),
		)
	})
})

describe("POST /drop/api/generate — hedged", () => {
	const FALLBACK = "@cf/google/gemma-4-26b-a4b-it"
	const OTHER = ["# Other\n", "s[start Placed] > t[user Check order] > e[end Done]\n"]
	const hedged = (ai: ReturnType<typeof fakeAi>, over: Partial<Env> = {}) =>
		makeEnv(ai, { AI_GENERATE_FALLBACK_MODEL: FALLBACK, AI_GENERATE_HEDGE_MS: "30", ...over })

	it("does not ask the fallback when the primary writes in time", async () => {
		const ai = fakeAi(ANSWER)
		const evs = await events(await handleGenerate(post(DESCRIPTION), hedged(ai), NOW))
		expect(ai.calls.map((c) => c.model)).toEqual([MODEL])
		expect(text(evs)).toBe(ANSWER.join(""))
	})

	it("streams the fallback when the primary is queued, and cancels the primary", async () => {
		const ai = fakeAi(ANSWER, {
			byModel: { [MODEL]: { delay: 400 }, [FALLBACK]: { chunks: OTHER } },
		})
		const env = hedged(ai)
		const evs = await events(await handleGenerate(post(DESCRIPTION), env, NOW))
		expect(ai.calls.map((c) => c.model)).toEqual([MODEL, FALLBACK])
		expect(text(evs)).toBe(OTHER.join(""))
		expect(evs.at(-1)).toEqual({ done: true, cached: false })
		await sleep(450) // the primary's queued start finishes, then sees it was cancelled
		expect(ai.cancelled).toContain(MODEL)
		// Both calls are charged: the fallback's usage, and the primary's prompt at least.
		expect(await getBudgetSpent(env.DB, DAY)).toBeGreaterThan(
			neuronsFor(FALLBACK, { promptTokens: 420, completionTokens: 160 }),
		)
	})

	it("keeps the primary when it still writes first after the hedge", async () => {
		const ai = fakeAi(ANSWER, {
			byModel: { [MODEL]: { delay: 60 }, [FALLBACK]: { chunks: OTHER, delay: 400 } },
		})
		const evs = await events(await handleGenerate(post(DESCRIPTION), hedged(ai), NOW))
		expect(ai.calls.map((c) => c.model)).toEqual([MODEL, FALLBACK])
		expect(text(evs)).toBe(ANSWER.join(""))
		await sleep(450)
		expect(ai.cancelled).toContain(FALLBACK)
	})

	it("asks the fallback at once when the primary fails, without waiting for the hedge", async () => {
		const ai = fakeAi(ANSWER, {
			byModel: { [MODEL]: { throws: true }, [FALLBACK]: { chunks: OTHER } },
		})
		const started = Date.now()
		const evs = await events(
			await handleGenerate(post(DESCRIPTION), hedged(ai, { AI_GENERATE_HEDGE_MS: "5000" }), NOW),
		)
		expect(Date.now() - started).toBeLessThan(1000)
		expect(text(evs)).toBe(OTHER.join(""))
	})

	it("reports unavailable when neither model answers", async () => {
		const ai = fakeAi(ANSWER, {
			byModel: { [MODEL]: { throws: true }, [FALLBACK]: { throws: true } },
		})
		const evs = await events(await handleGenerate(post(DESCRIPTION), hedged(ai), NOW))
		expect(evs).toEqual([{ error: expect.stringContaining("unavailable") }])
	})

	it("caches the fallback's answer under the request", async () => {
		const ai = fakeAi(ANSWER, {
			byModel: { [MODEL]: { delay: 400 }, [FALLBACK]: { chunks: OTHER } },
		})
		const env = hedged(ai)
		await events(await handleGenerate(post(DESCRIPTION), env, NOW))
		const again = await events(await handleGenerate(post(DESCRIPTION), env, NOW))
		expect(ai.calls).toHaveLength(2)
		expect(text(again)).toBe(OTHER.join(""))
		expect(again.at(-1)).toEqual({ done: true, cached: true })
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
