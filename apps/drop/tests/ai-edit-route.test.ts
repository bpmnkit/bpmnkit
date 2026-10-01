/**
 * `POST /drop/api/ai-edit/:shareId/:filename`: the gates, the prompt it builds
 * from the stored threads, and the stream it answers with. Against the real
 * migrations, as the comment routes are.
 */
import { readFileSync } from "node:fs"
import { Bpmn, parseProcessDelta } from "@bpmnkit/core"
import { applyProcessDelta } from "@bpmnkit/editor/headless"
import { beforeEach, describe, expect, it } from "vitest"
import type { Env } from "../src/env.js"
import { getBudgetSpent } from "../src/lib/ai.js"
import {
	type StoredComment,
	insertComment,
	setResolved,
	tombstoneComment,
} from "../src/lib/comments.js"
import { FEEDBACK_SYSTEM_PROMPT, type FeedbackEvent } from "../src/lib/feedback.js"
import { neuronsFor } from "../src/lib/generate.js"
import { sharePage } from "../src/lib/pages.js"
import { handleAiEdit } from "../src/routes/ai-edit.js"
import worker from "../src/worker.js"
import { migratedDb, seedFile } from "./d1.js"

const NOW = 1_800_000_000_000
const DAY = new Date(NOW).toISOString().slice(0, 10)
const MODEL = "@cf/zai-org/glm-4.7-flash"
const CODE = "sesame"
const FILE = "order-process.bpmn"
const XML = readFileSync(
	new URL("../../../bpmn-samples/order-process.bpmn", import.meta.url),
	"utf8",
)
const USAGE = { prompt_tokens: 900, completion_tokens: 30 }

/** A Workers AI binding that streams `chunks` in the chat-completion shape, after some reasoning. */
function fakeAi(chunks: string[], options: { throws?: boolean; fail?: boolean } = {}) {
	const calls: { model: string; inputs: Record<string, unknown>; options: unknown }[] = []
	return {
		calls,
		async run(model: string, inputs: Record<string, unknown>, opts: unknown) {
			calls.push({ model, inputs, options: opts })
			if (options.throws) throw new Error("capacity")
			const encoder = new TextEncoder()
			return new ReadableStream<Uint8Array>({
				async start(controller) {
					const send = (o: unknown) =>
						controller.enqueue(encoder.encode(`data: ${JSON.stringify(o)}\n\n`))
					send({ choices: [{ delta: { reasoning_content: "Read the threads." } }] })
					for (const content of chunks) send({ choices: [{ delta: { content } }] })
					if (options.fail) {
						// After a tick, so what was sent is read before the stream breaks.
						await new Promise((resolve) => setTimeout(resolve, 5))
						controller.error(new Error("upstream reset"))
						return
					}
					send({ choices: [{ delta: {} }], usage: USAGE })
					controller.enqueue(encoder.encode("data: [DONE]\n\n"))
					controller.close()
				},
			})
		},
	}
}

let db: D1Database

beforeEach(() => {
	db = migratedDb()
	seedFile(db, { filename: FILE, body: XML, now: NOW, expiresAt: NOW + 1e9 })
})

function makeEnv(ai: ReturnType<typeof fakeAi>, over: Partial<Env> = {}): Env {
	return {
		AI: ai,
		AI_PASSCODE: CODE,
		AI_FEEDBACK_MODEL: MODEL,
		AI_DAILY_BUDGET: "8000",
		DB: db,
		...over,
	} as unknown as Env
}

let next = 0
/** Stores a comment as the comments route would, and answers its id. */
async function comment(over: Partial<StoredComment> = {}): Promise<string> {
	next += 1
	// Base58 has no 0, so the counter is spelled in digits it does have.
	const id = `Cmnt${next
		.toString(8)
		.replace(/[0-7]/g, (d) => "23456789"[Number(d)] ?? "2")
		.padStart(8, "2")}`
	await insertComment(db, "share1", {
		id,
		filename: FILE,
		elementId: null,
		elementLabel: null,
		parentId: null,
		authorName: "Anna",
		authorHash: "h".repeat(64),
		body: "Please add a credit check before validating.",
		mentions: [],
		createdAt: NOW + next,
		editedAt: null,
		deletedAt: null,
		resolvedAt: null,
		resolvedBy: null,
		...over,
	})
	// A new comment is stored open and live; resolving and deleting are their own writes.
	if (over.resolvedAt != null)
		await setResolved(db, id, over.resolvedBy ?? "someone", over.resolvedAt)
	if (over.deletedAt != null) await tombstoneComment(db, id, over.deletedAt)
	return id
}

const post = (body: unknown, { code = CODE, shareId = "share1", file = FILE } = {}) =>
	new Request(`http://drop/drop/api/ai-edit/${shareId}/${encodeURIComponent(file)}`, {
		method: "POST",
		headers: { "Content-Type": "application/json", "X-Drop-AI-Code": code },
		body: JSON.stringify(body),
	})

async function events(res: Response): Promise<FeedbackEvent[]> {
	return (await res.text())
		.split("\n\n")
		.filter((block) => block.startsWith("data: "))
		.map((block) => JSON.parse(block.slice(6)) as FeedbackEvent)
}

const script = (evs: FeedbackEvent[]) => evs.map((e) => ("text" in e ? e.text : "")).join("")

const ANSWER = [
	"Sure! Here is the change:\n",
	"start > credit[service Check credit] > validate\n",
	"@1 credit\n",
]

describe("POST /drop/api/ai-edit", () => {
	it("is off (404) without AI_PASSCODE or without AI_FEEDBACK_MODEL", async () => {
		const id = await comment()
		const body = { xml: XML, threadIds: [id] }
		for (const over of [{ AI_PASSCODE: undefined }, { AI_FEEDBACK_MODEL: undefined }]) {
			const res = await handleAiEdit(post(body), "share1", FILE, makeEnv(fakeAi(ANSWER), over), NOW)
			expect(res.status).toBe(404)
		}
	})

	it("rejects a wrong access code before reading anything", async () => {
		const ai = fakeAi(ANSWER)
		const res = await handleAiEdit(post({}, { code: "nope" }), "share1", FILE, makeEnv(ai), NOW)
		expect(res.status).toBe(401)
		expect(ai.calls).toHaveLength(0)
	})

	it("refuses bad input with a reason", async () => {
		const id = await comment()
		const env = makeEnv(fakeAi(ANSWER))
		const bad = [
			{ threadIds: [id] },
			{ xml: XML, threadIds: [] },
			{ xml: XML, threadIds: ["not an id!"] },
			{
				xml: XML,
				threadIds: Array.from({ length: 11 }, (_, k) => `Cmnt${String(k).padStart(8, "3")}`),
			},
			{ xml: XML, threadIds: [id], hint: "x".repeat(501) },
			{ xml: "<not bpmn", threadIds: [id] },
		]
		for (const body of bad) {
			const res = await handleAiEdit(post(body), "share1", FILE, env, NOW)
			expect(res.status, JSON.stringify(body).slice(0, 60)).toBe(400)
		}
	})

	it("refuses the demo, a pinned drop and a file that is not a diagram here", async () => {
		const id = await comment()
		const env = makeEnv(fakeAi(ANSWER))
		const body = { xml: XML, threadIds: [id] }
		expect((await handleAiEdit(post(body), "demo-loan-approval", FILE, env, NOW)).status).toBe(403)
		expect((await handleAiEdit(post(body), "share1", "other.bpmn", env, NOW)).status).toBe(404)
		seedFile(db, { shareId: "pinned", fileId: "f2", filename: FILE, body: XML, expiresAt: null })
		expect(
			(await handleAiEdit(post(body, { shareId: "pinned" }), "pinned", FILE, env, NOW)).status,
		).toBe(403)
	})

	it("only takes open threads on this file", async () => {
		const env = makeEnv(fakeAi(ANSWER))
		const root = await comment()
		const reply = await comment({ parentId: root })
		const resolved = await comment({ resolvedAt: NOW, resolvedBy: "Ben" })
		const deleted = await comment({ deletedAt: NOW, body: "" })
		const elsewhere = await comment({ filename: "other.bpmn" })
		for (const id of [reply, resolved, deleted, elsewhere, "Unknown12345"]) {
			const res = await handleAiEdit(post({ xml: XML, threadIds: [id] }), "share1", FILE, env, NOW)
			expect(res.status, id).toBe(400)
		}
	})

	it("refuses a diagram with no drawing", async () => {
		const id = await comment()
		const bare = Bpmn.export({ ...Bpmn.parse(XML), diagrams: [] })
		const res = await handleAiEdit(
			post({ xml: bare, threadIds: [id] }),
			"share1",
			FILE,
			makeEnv(fakeAi(ANSWER)),
			NOW,
		)
		expect(res.status).toBe(400)
	})

	it("sends the stored threads with the written diagram, and streams the aliases and the filtered script", async () => {
		const root = await comment({ elementId: "validate", elementLabel: "Validate Order" })
		await comment({ parentId: root, authorName: "Ben", body: "Agreed,\nthe limit is creditLimit." })
		const fileWide = await comment({ authorName: "Carla", body: "Looks fine otherwise." })
		const ai = fakeAi(ANSWER)
		const env = makeEnv(ai)
		const res = await handleAiEdit(
			post({ xml: XML, threadIds: [root, fileWide], hint: "keep it short" }),
			"share1",
			FILE,
			env,
			NOW,
		)
		expect(res.headers.get("Content-Type")).toContain("text/event-stream")
		const evs = await events(res)
		const first = evs[0]
		expect(first && "aliases" in first ? first.aliases.valid : undefined).toBe("gw-check")
		// The prose line never leaves the Worker.
		expect(script(evs)).toBe("start > credit[service Check credit] > validate\n@1 credit\n")
		expect(evs.at(-1)).toEqual({ done: true, cached: false })
		expect(JSON.stringify(evs)).not.toContain("Read the threads")

		const messages = ai.calls[0]?.inputs.messages as { role: string; content: string }[]
		expect(messages[0]).toEqual({ role: "system", content: FEEDBACK_SYSTEM_PROMPT })
		const user = messages[1]?.content ?? ""
		expect(user).toContain("Diagram:\n# Order Process\nstart[start Order Received] > validate[")
		expect(user).toContain(
			'1. On validate ("Validate Order") — Anna: Please add a credit check before validating.\n   Reply from Ben: Agreed, the limit is creditLimit.',
		)
		expect(user).toContain("2. On the whole diagram — Carla: Looks fine otherwise.")
		expect(user).toContain("Also: keep it short")
		expect(ai.calls[0]?.options).toEqual({
			extraHeaders: { "x-session-affinity": `drop-ai-edit-${MODEL}` },
		})
		expect(await getBudgetSpent(env.DB, DAY)).toBe(
			neuronsFor(MODEL, { promptTokens: 900, completionTokens: 30 }),
		)
	})

	it("produces a script the page can apply to the diagram it sent", async () => {
		const id = await comment({ elementId: "validate", elementLabel: "Validate Order" })
		const evs = await events(
			await handleAiEdit(
				post({ xml: XML, threadIds: [id] }),
				"share1",
				FILE,
				makeEnv(fakeAi(ANSWER)),
				NOW,
			),
		)
		const first = evs[0]
		const aliases = first && "aliases" in first ? first.aliases : {}
		const result = applyProcessDelta(Bpmn.parse(XML), parseProcessDelta(script(evs)), { aliases })
		expect(result.problems).toEqual([])
		expect(result.created).toEqual(["credit"])
		expect(result.addressed.get(1)).toEqual(["credit"])
	})

	it("names a thread whose element is no longer in the diagram", async () => {
		const id = await comment({ elementId: "Gone_1", elementLabel: "Old step" })
		const ai = fakeAi(ANSWER)
		await events(
			await handleAiEdit(post({ xml: XML, threadIds: [id] }), "share1", FILE, makeEnv(ai), NOW),
		)
		const user = (ai.calls[0]?.inputs.messages as { content: string }[])[1]?.content
		expect(user).toContain('1. On "Old step", which is no longer in the diagram — Anna:')
	})

	it("names every element a thread is on, and says which are gone", async () => {
		const id = await comment({
			elementId: "validate",
			elementLabel: "Validate Order",
			elementIds: ["validate", "gw-check", "Gone_1"],
			body: "These belong together.",
		})
		const ai = fakeAi(ANSWER)
		await events(
			await handleAiEdit(post({ xml: XML, threadIds: [id] }), "share1", FILE, makeEnv(ai), NOW),
		)
		const user = (ai.calls[0]?.inputs.messages as { content: string }[])[1]?.content
		expect(user).toContain(
			'1. On validate ("Validate Order"), valid ("Valid?"), "Gone_1" (no longer in the diagram) — Anna: These belong together.',
		)
	})

	it("treats an empty answer as no change, and serves a repeat from the cache", async () => {
		const id = await comment({ body: "Why do we validate here?" })
		const ai = fakeAi(["This is a question, so nothing changes.\n"])
		const env = makeEnv(ai)
		const body = { xml: XML, threadIds: [id] }
		const evs = await events(await handleAiEdit(post(body), "share1", FILE, env, NOW))
		expect(script(evs)).toBe("")
		expect(evs.at(-1)).toEqual({ done: true, cached: false })
		const again = await events(await handleAiEdit(post(body), "share1", FILE, env, NOW))
		expect(ai.calls).toHaveLength(1)
		expect(again).toEqual([evs[0], { done: true, cached: true }])
	})

	it("reports a failed call, charges it, and does not cache it", async () => {
		const id = await comment()
		const ai = fakeAi(ANSWER, { fail: true })
		const env = makeEnv(ai)
		const evs = await events(
			await handleAiEdit(post({ xml: XML, threadIds: [id] }), "share1", FILE, env, NOW),
		)
		expect(evs.at(-1)).toEqual({ error: "The AI stopped part way. Please try again." })
		await events(await handleAiEdit(post({ xml: XML, threadIds: [id] }), "share1", FILE, env, NOW))
		expect(ai.calls).toHaveLength(2)
		expect(await getBudgetSpent(env.DB, DAY)).toBeGreaterThan(0)
	})

	it("says the AI is unavailable when the call never starts", async () => {
		const id = await comment()
		const evs = await events(
			await handleAiEdit(
				post({ xml: XML, threadIds: [id] }),
				"share1",
				FILE,
				makeEnv(fakeAi(ANSWER, { throws: true })),
				NOW,
			),
		)
		expect(evs.at(-1)).toEqual({ error: "The AI is unavailable right now. Please try again." })
	})

	it("stops at the daily budget before calling the model", async () => {
		const id = await comment()
		const ai = fakeAi(ANSWER)
		const res = await handleAiEdit(
			post({ xml: XML, threadIds: [id] }),
			"share1",
			FILE,
			makeEnv(ai, { AI_DAILY_BUDGET: "0" }),
			NOW,
		)
		expect(res.status).toBe(503)
		expect(ai.calls).toHaveLength(0)
	})

	it("is routed by the worker, POST only", async () => {
		const id = await comment()
		const env = makeEnv(fakeAi(ANSWER))
		const fetch = worker.fetch as (r: Request, e: Env) => Promise<Response>
		const res = await fetch(post({ xml: XML, threadIds: [id] }), env)
		expect(res.status).toBe(200)
		const get = await fetch(new Request(`http://drop/drop/api/ai-edit/share1/${FILE}`), env)
		expect(get.status).toBe(405)
	})

	it("tells the page whether the feature is on", () => {
		const page = (aiEdit: boolean) =>
			sharePage(
				"share1",
				{ created_at: NOW, expires_at: NOW + 1, view_count: 0 } as never,
				[],
				true,
				undefined,
				aiEdit,
			)
		expect(page(true)).toContain('"aiEdit":true')
		expect(page(false)).toContain('"aiEdit":false')
	})
})
