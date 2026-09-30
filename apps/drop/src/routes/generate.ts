import { parseProcessText } from "@bpmnkit/core"
import type { Env } from "../env.js"
import { checkAiChallenge } from "../lib/ai-pass.js"
import {
	addBudget,
	checkAiPasscode,
	getBudgetSpent,
	getCachedGeneration,
	putCachedGeneration,
	takeGenerateCall,
} from "../lib/ai.js"
import {
	GENERATE_SYSTEM_PROMPT,
	type GenerateEvent,
	IMAGE_SYSTEM_PROMPT,
	IMAGE_TOKEN_ESTIMATE,
	MAX_CHANGE_CHARS,
	MAX_DESCRIPTION_CHARS,
	MAX_DIAGRAM_CHARS,
	MIN_CHANGE_CHARS,
	MIN_DESCRIPTION_CHARS,
	MODEL_PROFILES,
	REFINE_SYSTEM_PROMPT,
	createDiagramLineFilter,
	generateMessages,
	imageMessages,
	maxTokensFor,
	neuronsFor,
	normaliseDescription,
	normaliseDiagram,
	normaliseImage,
	refineMessages,
} from "../lib/generate.js"
import { ModelStream, hedge } from "../lib/hedge.js"
import { json } from "../lib/http.js"
import { sha256Hex } from "../lib/ids.js"
import { AI_PASS_HEADER } from "../shared/constants.js"

/** The slice of the Workers AI binding this route uses — a stream in, so it is mockable. */
export interface AiStreamLike {
	run(model: string, inputs: unknown, options?: unknown): Promise<unknown>
}

const encoder = new TextEncoder()
const sse = (event: GenerateEvent) => encoder.encode(`data: ${JSON.stringify(event)}\n\n`)

/**
 * How long the primary model may take to write anything before the fallback is
 * asked too. The benchmark's median time to first content was well under a
 * second; the queued calls it hedges against waited 2–12 s.
 */
const DEFAULT_HEDGE_MS = 1500

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
 * Body `{ description }` for a first draft, `{ image, description? }` for a
 * first draft read from a JPEG data URL (a whiteboard, sketch or photo, sent to
 * `AI_GENERATE_IMAGE_MODEL`), or `{ description, diagram, change }`
 * to change a draft: `diagram` is the text the last answer streamed, and the
 * model writes the whole diagram again with the change made. The Worker keeps
 * no conversation; the client sends the state it has. Answers with a
 * server-sent-event stream of
 * {@link GenerateEvent}s: the model's text as it is written, in the line format
 * `parseProcessText` reads, then `done` or `error`. The client draws the
 * diagram from the text; nothing is stored as a drop until the reader chooses
 * to share it, through the ordinary upload endpoint.
 *
 * Order, as the review: feature flag → passcode gate → Turnstile (when
 * `TURNSTILE_SECRET` is set; a solved challenge earns a pass sent back in
 * `X-Drop-AI-Pass`) → input check → cache → daily budget → per-IP hourly cap →
 * model call. Only lines in the diagram
 * format are streamed back. See `doc/drop-ai-generate-analysis.md` §6 and §21.
 */
export async function handleGenerate(request: Request, env: Env, now: number): Promise<Response> {
	if (env.AI_PASSCODE === undefined) return json({ error: "not found" }, { status: 404 })
	const denied = await checkAiPasscode(request, env, env.AI_PASSCODE, now)
	if (denied) return denied

	let description: string
	let refine: { diagram: string; change: string } | undefined
	let image: string | null | undefined
	let token: string | undefined
	try {
		const body = (await request.json()) as {
			description?: unknown
			diagram?: unknown
			change?: unknown
			image?: unknown
			token?: unknown
		}
		if (typeof body.token === "string") token = body.token
		description = typeof body.description === "string" ? normaliseDescription(body.description) : ""
		if (body.image !== undefined) image = normaliseImage(body.image)
		if (body.diagram !== undefined || body.change !== undefined) {
			refine = {
				diagram: typeof body.diagram === "string" ? normaliseDiagram(body.diagram) : "",
				change: typeof body.change === "string" ? normaliseDescription(body.change) : "",
			}
		}
	} catch {
		return json({ error: 'expected JSON: { "description": "…" }' }, { status: 400 })
	}

	const { denied: unverified, pass } = await checkAiChallenge(request, env, token, now)
	if (unverified) return unverified
	const res = await answer(request, env, now, description, refine, image)
	// A solved challenge earns a pass, whatever the answer; the page keeps it for the next call.
	if (pass) res.headers.set(AI_PASS_HEADER, pass)
	return res
}

/**
 * Everything after the gates: input check, cache, budget, hourly cap, model call.
 * `image` is `undefined` when none was sent and `null` when one was sent but is not accepted.
 */
async function answer(
	request: Request,
	env: Env,
	now: number,
	description: string,
	refine: { diagram: string; change: string } | undefined,
	image: string | null | undefined,
): Promise<Response> {
	if (image !== undefined) {
		if (!env.AI_GENERATE_IMAGE_MODEL) {
			return json({ error: "drawing from an image is not enabled here" }, { status: 400 })
		}
		if (image === null) {
			return json({ error: "the image must be a JPEG of at most about 1 MB" }, { status: 400 })
		}
		if (refine) {
			return json({ error: "an image starts a draft; send a change without one" }, { status: 400 })
		}
	}
	// With an image, the description is an optional hint.
	const minDescription = image ? 0 : MIN_DESCRIPTION_CHARS
	if (description.length < minDescription || description.length > MAX_DESCRIPTION_CHARS) {
		return json(
			{
				error: `describe the process in ${MIN_DESCRIPTION_CHARS}–${MAX_DESCRIPTION_CHARS} characters`,
			},
			{ status: 400 },
		)
	}
	if (refine && (refine.diagram === "" || refine.diagram.length > MAX_DIAGRAM_CHARS)) {
		return json({ error: "the diagram to change is missing or too long" }, { status: 400 })
	}
	if (
		refine &&
		(refine.change.length < MIN_CHANGE_CHARS || refine.change.length > MAX_CHANGE_CHARS)
	) {
		return json(
			{ error: `describe the change in ${MIN_CHANGE_CHARS}–${MAX_CHANGE_CHARS} characters` },
			{ status: 400 },
		)
	}

	const model = image ? (env.AI_GENERATE_IMAGE_MODEL as string) : env.AI_GENERATE_MODEL
	const messages = image
		? imageMessages(description, image)
		: refine
			? refineMessages(description, refine.diagram, refine.change)
			: generateMessages(description)
	const promptTokenEstimate =
		Math.ceil(
			messages.reduce(
				(sum, m) =>
					sum +
					(typeof m.content === "string"
						? m.content.length
						: m.content.reduce((n, part) => n + (part.type === "text" ? part.text.length : 0), 0)),
				0,
			) / 4,
		) + (image ? IMAGE_TOKEN_ESTIMATE : 0)
	// The prompt is part of the key: changing it must not serve answers written for the old one.
	const requestHash = await sha256Hex(
		image
			? `${model}\n${IMAGE_SYSTEM_PROMPT}\n${description}\n${image}`
			: refine
				? `${model}\n${REFINE_SYSTEM_PROMPT}\n${description}\n${refine.diagram}\n${refine.change}`
				: `${model}\n${GENERATE_SYSTEM_PROMPT}\n${description}`,
	)
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
	const limited = await takeGenerateCall(request, env, now)
	if (limited) return limited

	const ai = env.AI as unknown as AiStreamLike
	const call = (name: string) =>
		new ModelStream(name, () =>
			ai.run(
				name,
				{
					messages,
					stream: true,
					max_tokens: maxTokensFor(name),
					...(MODEL_PROFILES[name]?.options ?? {}),
				},
				// One instance per model, so the fixed system prompt can stay in its prefix cache.
				{ extraHeaders: { "x-session-affinity": `drop-generate-${name}` } },
			),
		)
	// Not hedged: the fallback is picked for text, and a second image call would double its cost.
	const fallbackModel = image ? undefined : env.AI_GENERATE_FALLBACK_MODEL
	const hedgeMs = Number.parseInt(env.AI_GENERATE_HEDGE_MS ?? "", 10)

	return new Response(
		new ReadableStream<Uint8Array>({
			async start(controller) {
				const { winner, started } = await hedge(
					call(model),
					fallbackModel && fallbackModel !== model ? () => call(fallbackModel) : null,
					Number.isFinite(hedgeMs) ? hedgeMs : DEFAULT_HEDGE_MS,
				)
				// Only diagram lines leave the Worker, and only they are judged and cached.
				const filter = createDiagramLineFilter()
				let text = ""
				const send = (lines: string) => {
					if (lines === "") return
					text += lines
					controller.enqueue(sse({ text: lines }))
				}
				if (winner) {
					for await (const chunk of winner.rest()) send(filter.push(chunk))
					send(filter.end())
				}

				// Every call is charged, the cancelled one included: its neurons were
				// spent either way. Without a usage chunk, ~4 characters a token is close
				// enough for a budget guard.
				let neurons = 0
				for (const stream of started) {
					neurons += neuronsFor(
						stream.model,
						stream.usage ?? {
							promptTokens: promptTokenEstimate,
							completionTokens: Math.ceil((stream.text.length + stream.reasoningChars) / 4),
						},
					)
				}
				await addBudget(env.DB, day, neurons)

				const usable = winner !== null && !winner.failed && isUsable(text)
				// A small model sometimes writes the draft back as it was (2 of 30 changes
				// in the §16 run). Not cached, so asking again gets a fresh answer.
				const unchanged =
					usable && refine !== undefined && normaliseDiagram(text) === refine.diagram
				console.log(
					JSON.stringify({
						msg: "drop.generate",
						primary: model,
						refine: refine !== undefined,
						image: image !== undefined,
						winner: winner?.model ?? null,
						hedged: started.length > 1,
						firstContentMs: winner?.firstContentMs ?? null,
						neurons,
						usable,
						unchanged,
					}),
				)
				if (unchanged) {
					controller.enqueue(
						sse({ error: "The diagram came back unchanged. Try saying the change another way." }),
					)
				} else if (!usable) {
					controller.enqueue(
						sse({
							error: !winner
								? "AI generation is unavailable right now. Please try again."
								: winner.failed
									? "The model stopped part way. Please try again."
									: image
										? "Couldn't read a process in that image. Try a clearer picture, or describe the steps."
										: "Couldn't turn that into a process. Try describing the steps in order.",
						}),
					)
				} else {
					// Cached under the request, whichever model answered it.
					await putCachedGeneration(env.DB, requestHash, winner.model, text, neurons, now)
					controller.enqueue(sse({ done: true, cached: false }))
				}
				controller.close()
			},
		}),
		{ headers: SSE_HEADERS },
	)
}
