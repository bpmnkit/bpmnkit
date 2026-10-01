import { Bpmn, type BpmnDefinitions, writeProcessText } from "@bpmnkit/core"
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
import { listComments } from "../lib/comments.js"
import { currentHashes, findBannedHashes, getDrop } from "../lib/db.js"
import { isDemo } from "../lib/demo.js"
import {
	FEEDBACK_SYSTEM_PROMPT,
	type FeedbackEvent,
	type FeedbackItem,
	MAX_FEEDBACK_DIAGRAM_CHARS,
	MAX_FEEDBACK_ITEMS,
	MAX_HINT_CHARS,
	createChangeLineFilter,
	feedbackMessages,
} from "../lib/feedback.js"
import { MODEL_PROFILES, maxTokensFor, neuronsFor } from "../lib/generate.js"
import { ModelStream, hedge } from "../lib/hedge.js"
import { json } from "../lib/http.js"
import { sha256Hex } from "../lib/ids.js"
import { isCommentId } from "../shared/comments.js"
import { AI_PASS_HEADER, MAX_ROW_BYTES } from "../shared/constants.js"
import type { AiStreamLike } from "./generate.js"

const encoder = new TextEncoder()
const sse = (event: FeedbackEvent) => encoder.encode(`data: ${JSON.stringify(event)}\n\n`)

const SSE_HEADERS = {
	"Content-Type": "text/event-stream; charset=utf-8",
	"Cache-Control": "no-store",
}

function fail(status: number, error: string): Response {
	return json({ error }, { status })
}

/** The request body, checked for shape only. */
interface EditRequest {
	xml: string
	threadIds: string[]
	hint: string
	token?: string
}

function readBody(raw: unknown): EditRequest | string {
	if (typeof raw !== "object" || raw === null) return 'expected JSON: { "xml", "threadIds" }'
	const body = raw as Record<string, unknown>
	if (typeof body.xml !== "string" || body.xml.length === 0) return "the diagram is missing"
	if (body.xml.length > MAX_ROW_BYTES) return "the diagram is too large"
	const ids = body.threadIds
	if (!Array.isArray(ids) || ids.length === 0) return "pick at least one comment thread"
	if (ids.length > MAX_FEEDBACK_ITEMS) {
		return `at most ${MAX_FEEDBACK_ITEMS} threads at a time — split the review up`
	}
	if (!ids.every((id) => typeof id === "string" && isCommentId(id))) return "unknown thread id"
	const hint = typeof body.hint === "string" ? body.hint.trim() : ""
	if (hint.length > MAX_HINT_CHARS) return `a hint is at most ${MAX_HINT_CHARS} characters`
	return {
		xml: body.xml,
		threadIds: [...new Set(ids as string[])],
		hint,
		...(typeof body.token === "string" ? { token: body.token } : {}),
	}
}

/**
 * The threads as the prompt shows them, in the order asked for. Read from D1,
 * never from the request: the comments are other people's words, and a request
 * must not be able to put new ones in their mouths.
 */
async function loadItems(
	env: Env,
	shareId: string,
	filename: string,
	threadIds: readonly string[],
	aliases: Record<string, string>,
	defs: BpmnDefinitions,
): Promise<FeedbackItem[] | string> {
	const all = await listComments(env.DB, shareId)
	const written = new Map(Object.entries(aliases).map(([alias, id]) => [id, alias]))
	const names = new Map(defs.processes[0]?.flowElements.map((el) => [el.id, el.name]))
	const items: FeedbackItem[] = []
	for (const id of threadIds) {
		const root = all.find((c) => c.id === id)
		if (!root || root.parentId !== null || root.filename !== filename) {
			return "a thread is not on this file"
		}
		if (root.deletedAt !== null) return "a thread was deleted"
		if (root.resolvedAt !== null) return "a thread is already resolved"
		const item: FeedbackItem = { author: root.authorName, body: root.body }
		if (root.elementId !== null) {
			const alias = written.get(root.elementId)
			const label = names.get(root.elementId) ?? root.elementLabel ?? undefined
			if (alias !== undefined) item.on = alias
			if (label) item.label = label
			// Anchored to something the diagram no longer has, and nothing to name it by.
			else if (alias === undefined) item.label = root.elementId
		}
		const replies = all
			.filter((c) => c.parentId === id && c.deletedAt === null)
			.sort((a, b) => a.createdAt - b.createdAt)
		if (replies.length > 0) {
			item.replies = replies.map((r) => ({ author: r.authorName, body: r.body }))
		}
		items.push(item)
	}
	return items
}

/**
 * POST /drop/api/ai-edit/:shareId/:filename — closed beta: change a shared
 * diagram as its review threads ask.
 *
 * Body `{ xml, threadIds, hint?, token? }`. `xml` is the requester's editor
 * document: the answer is applied to exactly that, in their editor, so it is
 * what the model must read. It is public — any viewer of the drop has it — and
 * a forged one only misleads the person who sent it. The threads are read
 * from D1 by id: those are other people's words.
 *
 * Answers with a server-sent-event stream of {@link FeedbackEvent}s: the alias
 * map the answer's ids resolve against, then the change script as the model
 * writes it (only lines a change script can hold), then `done` or `error`.
 * Nothing is applied or stored here: the page applies the script in the
 * editor, where the room checks it like any other edit, and only once the
 * requester has seen it.
 *
 * Off (404) unless both `AI_PASSCODE` and `AI_FEEDBACK_MODEL` are set. Order:
 * passcode → Turnstile pass → input → drop (demo, pinned, banned, file) →
 * diagram → threads → cache → daily budget → hourly cap → model.
 * See `doc/drop-ai-feedback-edits-analysis.md` §8 and §14.
 */
export async function handleAiEdit(
	request: Request,
	shareId: string,
	filename: string,
	env: Env,
	now: number,
): Promise<Response> {
	const model = env.AI_FEEDBACK_MODEL
	if (env.AI_PASSCODE === undefined || !model) return fail(404, "not found")
	const denied = await checkAiPasscode(request, env, env.AI_PASSCODE, now)
	if (denied) return denied

	const parsed = readBody(await request.json().catch(() => null))
	if (typeof parsed === "string") return fail(400, parsed)

	const { denied: unverified, pass } = await checkAiChallenge(request, env, parsed.token, now)
	if (unverified) return unverified
	const res = await answer(env, shareId, filename, parsed, model, now, request)
	if (pass) res.headers.set(AI_PASS_HEADER, pass)
	return res
}

async function answer(
	env: Env,
	shareId: string,
	filename: string,
	body: EditRequest,
	model: string,
	now: number,
	request: Request,
): Promise<Response> {
	if (isDemo(shareId)) return fail(403, "the demo cannot be changed — take a copy first")
	const found = await getDrop(env.DB, shareId)
	if (!found) return fail(404, "not found")
	if (found.drop.expires_at === null) return fail(403, "this drop is pinned and read-only")
	if ((await findBannedHashes(env.DB, await currentHashes(env.DB, shareId))).length > 0) {
		return fail(403, "this content is blocked")
	}
	const file = found.files.find((f) => f.filename === filename)
	if (!file || file.kind !== "bpmn") return fail(404, "no such diagram in this drop")

	let defs: BpmnDefinitions
	try {
		defs = Bpmn.parse(body.xml)
	} catch {
		return fail(400, "the diagram could not be read")
	}
	// The same rule the room applies to editing: the editor addresses one process.
	if (defs.processes.length !== 1 || !defs.diagrams[0]) {
		return fail(400, "only a diagram with one drawn process can be changed")
	}
	const { text, aliases } = writeProcessText(defs)
	if (text.length > MAX_FEEDBACK_DIAGRAM_CHARS) {
		return fail(413, "this diagram is too large for AI changes yet")
	}

	const items = await loadItems(env, shareId, filename, body.threadIds, aliases, defs)
	if (typeof items === "string") return fail(400, items)

	const messages = feedbackMessages(text, items, body.hint || undefined)
	const userContent = messages[1]?.content ?? ""
	// The prompt is part of the key, as for generate: a new prompt must not serve old answers.
	const requestHash = await sha256Hex(
		`ai-edit\n${model}\n${FEEDBACK_SYSTEM_PROMPT}\n${userContent}`,
	)
	const cached = await getCachedGeneration(env.DB, requestHash)
	if (cached !== null) {
		return new Response(
			new ReadableStream({
				start(controller) {
					controller.enqueue(sse({ aliases }))
					if (cached !== "") controller.enqueue(sse({ text: cached }))
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
		return fail(503, "AI changes are busy today — try again tomorrow.")
	}
	const limited = await takeGenerateCall(request, env, now)
	if (limited) return limited

	const ai = env.AI as unknown as AiStreamLike
	const stream = new ModelStream(model, () =>
		ai.run(
			model,
			{
				messages,
				stream: true,
				max_tokens: maxTokensFor(model),
				...(MODEL_PROFILES[model]?.options ?? {}),
			},
			// One instance per model, so the fixed system prompt stays in its prefix cache.
			{ extraHeaders: { "x-session-affinity": `drop-ai-edit-${model}` } },
		),
	)
	const promptTokens = Math.ceil(messages.reduce((n, m) => n + m.content.length, 0) / 4)

	return new Response(
		new ReadableStream<Uint8Array>({
			async start(controller) {
				controller.enqueue(sse({ aliases }))
				const { winner } = await hedge(stream, null, 0)
				const filter = createChangeLineFilter()
				let script = ""
				const send = (lines: string) => {
					if (lines === "") return
					script += lines
					controller.enqueue(sse({ text: lines }))
				}
				if (winner) {
					for await (const chunk of winner.rest()) send(filter.push(chunk))
					send(filter.end())
				}

				const neurons = neuronsFor(
					model,
					stream.usage ?? {
						promptTokens,
						completionTokens: Math.ceil((stream.text.length + stream.reasoningChars) / 4),
					},
				)
				await addBudget(env.DB, day, neurons)
				// An answer with no change is a fair one — "this is a question" — so only
				// a call that failed is an error, not one that wrote nothing.
				const failed = stream.failed
				console.log(
					JSON.stringify({
						msg: "drop.ai-edit",
						model,
						threads: items.length,
						firstContentMs: stream.firstContentMs ?? null,
						neurons,
						lines: script === "" ? 0 : script.trimEnd().split("\n").length,
						failed,
					}),
				)
				if (failed) {
					controller.enqueue(
						sse({
							error:
								stream.text === ""
									? "The AI is unavailable right now. Please try again."
									: "The AI stopped part way. Please try again.",
						}),
					)
				} else {
					await putCachedGeneration(env.DB, requestHash, model, script, neurons, now)
					controller.enqueue(sse({ done: true, cached: false }))
				}
				controller.close()
			},
		}),
		{ headers: SSE_HEADERS },
	)
}
