import { parseProcessText } from "@bpmnkit/core"
import type { Env } from "../env.js"
import {
	addBudget,
	checkAiPasscode,
	getBudgetSpent,
	getCachedGeneration,
	putCachedGeneration,
} from "../lib/ai.js"
import {
	type AiUsage,
	GENERATE_MAX_TOKENS,
	GENERATE_SYSTEM_PROMPT,
	type GenerateEvent,
	MAX_DESCRIPTION_CHARS,
	MIN_DESCRIPTION_CHARS,
	MODEL_PROFILES,
	createSseReader,
	generateMessages,
	neuronsFor,
	normaliseDescription,
	readAiEvent,
} from "../lib/generate.js"
import { json } from "../lib/http.js"
import { sha256Hex } from "../lib/ids.js"

/** The slice of the Workers AI binding this route uses — a stream in, so it is mockable. */
export interface AiStreamLike {
	run(model: string, inputs: unknown, options?: unknown): Promise<unknown>
}

const encoder = new TextEncoder()
const sse = (event: GenerateEvent) => encoder.encode(`data: ${JSON.stringify(event)}\n\n`)

const SSE_HEADERS = {
	"Content-Type": "text/event-stream; charset=utf-8",
	"Cache-Control": "no-store",
}

/**
 * Whether an answer is worth keeping: something besides the start and end
 * events the parser adds on its own. A model that refused or wrote prose leaves
 * nothing else.
 */
function isUsable(text: string): boolean {
	return parseProcessText(text).diagram.processes.some((process) =>
		process.elements.some((el) => el.type !== "startEvent" && el.type !== "endEvent"),
	)
}

/**
 * POST /drop/api/generate — closed-beta describe-to-diagram.
 *
 * Body `{ description }`. Answers with a server-sent-event stream of
 * {@link GenerateEvent}s: the model's text as it is written, in the line format
 * `parseProcessText` reads, then `done` or `error`. The client draws the
 * diagram from the text; nothing is stored as a drop until the reader chooses
 * to share it, through the ordinary upload endpoint.
 *
 * Order, as the review: feature flag → passcode gate → input check → cache →
 * daily budget → model call. See `doc/drop-ai-generate-analysis.md` §6.
 */
export async function handleGenerate(request: Request, env: Env, now: number): Promise<Response> {
	if (env.AI_PASSCODE === undefined) return json({ error: "not found" }, { status: 404 })
	const denied = await checkAiPasscode(request, env, env.AI_PASSCODE, now)
	if (denied) return denied

	let description: string
	try {
		const body = (await request.json()) as { description?: unknown }
		description = typeof body.description === "string" ? normaliseDescription(body.description) : ""
	} catch {
		return json({ error: 'expected JSON: { "description": "…" }' }, { status: 400 })
	}
	if (description.length < MIN_DESCRIPTION_CHARS || description.length > MAX_DESCRIPTION_CHARS) {
		return json(
			{
				error: `describe the process in ${MIN_DESCRIPTION_CHARS}–${MAX_DESCRIPTION_CHARS} characters`,
			},
			{ status: 400 },
		)
	}

	const model = env.AI_GENERATE_MODEL
	// The prompt is part of the key: changing it must not serve answers written for the old one.
	const requestHash = await sha256Hex(`${model}\n${GENERATE_SYSTEM_PROMPT}\n${description}`)
	const cached = await getCachedGeneration(env.DB, requestHash)
	if (cached !== null) {
		return new Response(
			new ReadableStream({
				start(controller) {
					controller.enqueue(sse({ text: cached }))
					controller.enqueue(sse({ done: true, cached: true }))
					controller.close()
				},
			}),
			{ headers: SSE_HEADERS },
		)
	}

	const day = new Date(now).toISOString().slice(0, 10)
	const budget = Number.parseInt(env.AI_DAILY_BUDGET, 10) || 0
	if ((await getBudgetSpent(env.DB, day)) >= budget) {
		return json({ error: "AI generation is busy today — try again tomorrow." }, { status: 503 })
	}

	let upstream: unknown
	try {
		upstream = await (env.AI as unknown as AiStreamLike).run(
			model,
			{
				messages: generateMessages(description),
				stream: true,
				max_tokens: GENERATE_MAX_TOKENS,
				...(MODEL_PROFILES[model]?.options ?? {}),
			},
			// One instance for every generation, so the fixed system prompt stays in its prefix cache.
			{ extraHeaders: { "x-session-affinity": "drop-generate" } },
		)
	} catch {
		return json({ error: "AI generation is unavailable right now." }, { status: 502 })
	}
	if (!(upstream instanceof ReadableStream)) {
		return json({ error: "AI generation is unavailable right now." }, { status: 502 })
	}
	const modelStream = upstream as ReadableStream<Uint8Array>

	return new Response(
		new ReadableStream<Uint8Array>({
			async start(controller) {
				const reader = createSseReader()
				const decoder = new TextDecoder()
				let text = ""
				let reasoningChars = 0
				let usage: AiUsage | undefined
				let failed = false
				try {
					for await (const bytes of modelStream) {
						for (const data of reader.push(decoder.decode(bytes, { stream: true }))) {
							const delta = readAiEvent(data)
							if (!delta) continue
							if (delta.reasoning) reasoningChars += delta.reasoning.length
							if (delta.usage) usage = delta.usage
							if (delta.content) {
								text += delta.content
								controller.enqueue(sse({ text: delta.content }))
							}
						}
					}
				} catch {
					failed = true
				}

				// Charged whatever came of it: the neurons were spent either way. Without
				// a usage chunk, ~4 characters a token is close enough for a budget guard.
				const neurons = neuronsFor(
					model,
					usage ?? {
						promptTokens: Math.ceil((GENERATE_SYSTEM_PROMPT.length + description.length) / 4),
						completionTokens: Math.ceil((text.length + reasoningChars) / 4),
					},
				)
				await addBudget(env.DB, day, neurons)

				if (failed || !isUsable(text)) {
					controller.enqueue(
						sse({
							error: failed
								? "The model stopped part way. Please try again."
								: "Couldn't turn that into a process. Try describing the steps in order.",
						}),
					)
				} else {
					await putCachedGeneration(env.DB, requestHash, model, text, neurons, now)
					controller.enqueue(sse({ done: true, cached: false }))
				}
				controller.close()
			},
		}),
		{ headers: SSE_HEADERS },
	)
}
