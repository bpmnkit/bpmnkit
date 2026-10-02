import { Bpmn, type BpmnDefinitions, writeProcessText } from "@bpmnkit/core"
import { connectorLineFor, selectConnectors } from "@bpmnkit/core/connectors"
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
	CONNECT_SYSTEM_PROMPT,
	type ConnectEvent,
	MAX_CONNECT_DIAGRAM_CHARS,
	MAX_CONNECT_REQUEST_CHARS,
	connectApis,
	connectMessages,
	connectTasks,
	createConnectLineFilter,
	finishConnect,
	maxConnectTokens,
} from "../lib/connect.js"
import { MODEL_PROFILES, neuronsFor } from "../lib/generate.js"
import { ModelStream, hedge } from "../lib/hedge.js"
import { json } from "../lib/http.js"
import { sha256Hex } from "../lib/ids.js"
import { AI_PASS_HEADER, MAX_ROW_BYTES } from "../shared/constants.js"
import type { AiStreamLike } from "./generate.js"

const encoder = new TextEncoder()
const sse = (event: ConnectEvent) => encoder.encode(`data: ${JSON.stringify(event)}\n\n`)

const SSE_HEADERS = {
	"Content-Type": "text/event-stream; charset=utf-8",
	"Cache-Control": "no-store",
}

function fail(status: number, error: string): Response {
	return json({ error }, { status })
}

/** The request body, checked for shape only. */
interface ConnectRequest {
	xml: string
	request: string
	/** `with` lines the reader wrote themselves: applied as given, without a model. */
	lines?: string
	token?: string
}

function readBody(raw: unknown): ConnectRequest | string {
	if (typeof raw !== "object" || raw === null) return 'expected JSON: { "xml" }'
	const body = raw as Record<string, unknown>
	if (typeof body.xml !== "string" || body.xml.length === 0) return "the diagram is missing"
	if (body.xml.length > MAX_ROW_BYTES) return "the diagram is too large"
	const request = typeof body.request === "string" ? body.request.trim() : ""
	if (request.length > MAX_CONNECT_REQUEST_CHARS) {
		return `a request is at most ${MAX_CONNECT_REQUEST_CHARS} characters`
	}
	if (body.lines !== undefined && typeof body.lines !== "string") return "lines must be text"
	if (typeof body.lines === "string" && body.lines.length > MAX_CONNECT_REQUEST_CHARS) {
		return `lines are at most ${MAX_CONNECT_REQUEST_CHARS} characters`
	}
	return {
		xml: body.xml,
		request,
		...(typeof body.lines === "string" ? { lines: body.lines } : {}),
		...(typeof body.token === "string" ? { token: body.token } : {}),
	}
}

/**
 * POST /drop/api/connect — closed beta: configure the Camunda connectors of a
 * diagram that already has its shape (the second pass of
 * `doc/ai-connector-generation-plan.md` §4).
 *
 * Body `{ xml, request?, lines?, token? }`: the diagram, and optionally what
 * its author asked for, which says which systems the tasks talk to. The cards
 * each task could use are picked in code (`selectConnectors`); when none fits,
 * the stream ends `skipped` and no model is asked. With `lines` — `with` lines
 * the reader finished themselves, answering a question — no model is asked
 * either: the lines are applied as given. Services of the API index that the
 * request, the tasks or the lines name are loaded for both: their endpoints
 * become API cards, and complete the `http` lines that call them.
 *
 * Answers with a server-sent-event stream of {@link ConnectEvent}s: the alias
 * map, the `with` lines as the model writes them (only those), the diagram with
 * them applied — here, because the catalog is already loaded for the cards —
 * then `done` or `error`. Nothing is stored except the cached answer.
 *
 * Off (404) unless both `AI_PASSCODE` and `AI_CONNECT_MODEL` are set. Order:
 * passcode → Turnstile pass → input → diagram → cards → cache → daily budget
 * → hourly cap → model.
 */
export async function handleConnect(request: Request, env: Env, now: number): Promise<Response> {
	const model = env.AI_CONNECT_MODEL
	if (env.AI_PASSCODE === undefined || !model) return fail(404, "not found")
	const denied = await checkAiPasscode(request, env, env.AI_PASSCODE, now)
	if (denied) return denied

	const parsed = readBody(await request.json().catch(() => null))
	if (typeof parsed === "string") return fail(400, parsed)

	const { denied: unverified, pass } = await checkAiChallenge(request, env, parsed.token, now)
	if (unverified) return unverified
	const res = await answer(env, parsed, model, now, request)
	if (pass) res.headers.set(AI_PASS_HEADER, pass)
	return res
}

function replay(events: ConnectEvent[]): Response {
	return new Response(
		new ReadableStream({
			start(controller) {
				for (const event of events) controller.enqueue(sse(event))
				controller.close()
			},
		}),
		{ headers: SSE_HEADERS },
	)
}

async function answer(
	env: Env,
	body: ConnectRequest,
	model: string,
	now: number,
	request: Request,
): Promise<Response> {
	let defs: BpmnDefinitions
	try {
		defs = Bpmn.parse(body.xml)
	} catch {
		return fail(400, "the diagram could not be read")
	}
	if (defs.processes.length !== 1) {
		return fail(400, "only a diagram with one process can be connected")
	}
	const { text, aliases } = writeProcessText(defs, { connectorLine: connectorLineFor })
	if (text.length > MAX_CONNECT_DIAGRAM_CHARS) {
		return fail(413, "this diagram is too large to connect yet")
	}

	const tasks = connectTasks(defs, aliases)
	if (body.lines !== undefined) {
		// Only `with` lines, as from a model: anything else in them is not the reader's to send
		const filter = createConnectLineFilter()
		const lines = filter.push(body.lines) + filter.end()
		const apis = await connectApis(body.request, [], lines)
		return replay([
			{ aliases },
			{ result: finishConnect(defs, aliases, lines, apis) },
			{ done: true, cached: false },
		])
	}

	const apis = await connectApis(body.request, tasks)
	const selection = selectConnectors({ text: body.request, tasks }, { apis })
	if (selection.length === 0) {
		return replay([{ aliases }, { done: true, cached: false, skipped: true }])
	}

	const messages = connectMessages(text, selection, body.request || undefined)
	const userContent = messages[1]?.content ?? ""
	// The prompt is part of the key, as for generate: a new prompt must not serve old answers.
	const requestHash = await sha256Hex(`connect\n${model}\n${CONNECT_SYSTEM_PROMPT}\n${userContent}`)
	const cached = await getCachedGeneration(env.DB, requestHash)
	if (cached !== null) {
		return replay([
			{ aliases },
			...(cached === "" ? [] : [{ text: cached }]),
			{ result: finishConnect(defs, aliases, cached, apis, selection) },
			{ done: true, cached: true },
		])
	}

	const day = new Date(now).toISOString().slice(0, 10)
	const budget = Number.parseInt(env.AI_DAILY_BUDGET, 10) || 0
	if ((await getBudgetSpent(env.DB, day)) >= budget) {
		return fail(503, "AI connectors are busy today — try again tomorrow.")
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
				max_tokens: maxConnectTokens(selection.length),
				...(MODEL_PROFILES[model]?.options ?? {}),
			},
			// One instance per model, so the fixed system prompt stays in its prefix cache.
			{ extraHeaders: { "x-session-affinity": `drop-connect-${model}` } },
		),
	)
	const promptTokens = Math.ceil(messages.reduce((n, m) => n + m.content.length, 0) / 4)

	return new Response(
		new ReadableStream<Uint8Array>({
			async start(controller) {
				controller.enqueue(sse({ aliases }))
				const { winner } = await hedge(stream, null, 0)
				const filter = createConnectLineFilter()
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
				const failed = stream.failed
				const result = failed ? undefined : finishConnect(defs, aliases, script, apis, selection)
				console.log(
					JSON.stringify({
						msg: "drop.connect",
						model,
						tasks: selection.length,
						cards: selection.reduce((n, t) => n + t.cards.length, 0),
						firstContentMs: stream.firstContentMs ?? null,
						neurons,
						lines: script === "" ? 0 : script.trimEnd().split("\n").length,
						connected: result?.connected.length ?? 0,
						questions: result?.questions.length ?? 0,
						failed,
					}),
				)
				if (!result) {
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
					controller.enqueue(sse({ result }))
					controller.enqueue(sse({ done: true, cached: false }))
				}
				controller.close()
			},
		}),
		{ headers: SSE_HEADERS },
	)
}
