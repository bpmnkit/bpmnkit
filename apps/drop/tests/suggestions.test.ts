/**
 * Suggested changes on review threads: the routes, what they store, and what
 * they refuse. Against the real migrations, as the comment routes are.
 */
import { beforeEach, describe, expect, it } from "vitest"
import type { Env } from "../src/env.js"
import { deleteDrop } from "../src/lib/db.js"
import { handleComments } from "../src/routes/comments.js"
import { handleSuggestions } from "../src/routes/suggestions.js"
import { AUTHOR_HEADER, type CommentView } from "../src/shared/comments.js"
import { DEMO_SHARE_ID } from "../src/shared/constants.js"
import {
	MAX_OPEN_SUGGESTIONS,
	MAX_SUGGESTION_SCRIPT_CHARS,
	type SuggestionView,
} from "../src/shared/suggestions.js"
import worker from "../src/worker.js"
import { migratedDb, seedFile } from "./d1.js"
import { SEEDED_FILE, SIMPLE_BPMN } from "./fixtures.js"

const T0 = 1_800_000_000_000
const HASH = "a".repeat(64)

let db: D1Database
let env: Env
let fanned: Array<{ path: string; body: SuggestionView }>

function fakeRoom(): DurableObjectNamespace {
	return {
		idFromName: (name: string) => name,
		get: () => ({
			fetch: async (url: string, init: RequestInit) => {
				fanned.push({ path: new URL(url).pathname, body: JSON.parse(init.body as string) })
				return new Response(null, { status: 204 })
			},
		}),
	} as unknown as DurableObjectNamespace
}

beforeEach(() => {
	db = migratedDb()
	fanned = []
	env = {
		DB: db,
		ROOM: fakeRoom(),
		AI_PASSCODE: "sesame",
		AI_FEEDBACK_MODEL: "@cf/zai-org/glm-4.7-flash",
	} as unknown as Env
	seedFile(db, { body: SIMPLE_BPMN, now: T0, expiresAt: T0 + 1e9 })
})

interface Call {
	body?: unknown
	author?: string
	shareId?: string
	ip?: string
}

function request(method: string, path: string, { body, author, ip = "203.0.113.7" }: Call) {
	const headers: Record<string, string> = { "cf-connecting-ip": ip }
	if (author) headers[AUTHOR_HEADER] = author
	if (body !== undefined) headers["Content-Type"] = "application/json"
	return new Request(`https://bpmnkit.com${path}`, {
		method,
		headers,
		...(body !== undefined ? { body: JSON.stringify(body) } : {}),
	})
}

/** Posts a comment thread on the task and answers it with the token it earned. */
async function thread(body = "Please rename this", author?: string) {
	const req = request("POST", "/drop/api/comments/share1", {
		body: { filename: SEEDED_FILE, elementId: "task", name: "Anna", body },
		author,
	})
	const res = await handleComments(req, "share1", null, env, T0 + 1)
	const json = (await res.json()) as { comment: CommentView; authorToken?: string }
	return { comment: json.comment, token: json.authorToken ?? author }
}

async function suggest(body: Record<string, unknown>, opts: Call = {}) {
	const shareId = opts.shareId ?? "share1"
	const req = request("POST", `/drop/api/suggestions/${shareId}`, { ...opts, body })
	const res = await handleSuggestions(req, shareId, null, env, T0 + 2)
	return {
		status: res.status,
		json: (await res.json()) as {
			suggestion?: SuggestionView
			authorToken?: string
			error?: string
		},
	}
}

async function patch(id: string, body: unknown, author?: string) {
	const req = request("PATCH", `/drop/api/suggestions/share1/${id}`, { body, author })
	const res = await handleSuggestions(req, "share1", id, env, T0 + 3)
	return {
		status: res.status,
		json: (await res.json()) as { suggestion?: SuggestionView; error?: string },
	}
}

const valid = (threadIds: string[]) => ({
	filename: SEEDED_FILE,
	threadIds,
	script: "task[Do the work]\n@1 task",
	aliases: { start: "start", task: "task", end: "end" },
	baseHash: HASH,
	name: "Ben",
})

describe("sharing a suggestion", () => {
	it("stores the filtered script on its threads, lists it with the comments, and tells the room", async () => {
		const { comment } = await thread()
		const res = await suggest({
			...valid([comment.id]),
			script: "Here is my change:\ntask[Do the work]\n```\n@1 task",
		})
		expect(res.status).toBe(201)
		expect(res.json.authorToken).toMatch(/^[1-9A-HJ-NP-Za-km-z]{24}$/)
		expect(res.json.suggestion).toMatchObject({
			filename: SEEDED_FILE,
			threadIds: [comment.id],
			// Prose and fences never reach storage.
			script: "task[Do the work]\n@1 task",
			aliases: { start: "start", task: "task", end: "end" },
			baseHash: HASH,
			authorName: "Ben",
			status: "open",
			closedAt: null,
			closedBy: null,
		})
		expect(res.json.suggestion).not.toHaveProperty("authorHash")
		expect(fanned.map((f) => f.path)).toEqual(["/internal/comment", "/internal/suggestion"])

		const listed = await handleComments(
			request("GET", "/drop/api/comments/share1", {}),
			"share1",
			null,
			env,
			T0 + 3,
		)
		const json = (await listed.json()) as { suggestions: SuggestionView[] }
		expect(json.suggestions.map((s) => s.id)).toEqual([res.json.suggestion?.id])
	})

	it("uses the comment author token, so a commenter is not given a second one", async () => {
		const { comment, token } = await thread()
		const res = await suggest(valid([comment.id]), { author: token })
		expect(res.status).toBe(201)
		expect(res.json.authorToken).toBeUndefined()
	})

	it.each([
		["no name", { name: "" }],
		["a file not in the drop", { filename: "other.bpmn" }],
		["no threads", { threadIds: [] }],
		["a malformed thread id", { threadIds: ["nope"] }],
		["a thread that does not exist", { threadIds: ["111111111111"] }],
		["a script that is not text", { script: 42 }],
		["a script past the limit", { script: `a > b\n${"x".repeat(MAX_SUGGESTION_SCRIPT_CHARS)}` }],
		["a script that changes nothing", { script: "@1 task\nJust prose." }],
		["aliases that are not ids", { aliases: { task: "<x>" } }],
		["aliases that are not a map", { aliases: ["task"] }],
		["a base hash that is not one", { baseHash: "abc" }],
	])("refuses %s", async (_label, over) => {
		const { comment } = await thread()
		const res = await suggest({ ...valid([comment.id]), ...over })
		expect(res.status).toBe(400)
		expect(res.json.error).toBeTruthy()
	})

	it("refuses a resolved thread, a reply, and the demo; and is off without AI changes", async () => {
		const { comment, token } = await thread()
		const reply = await handleComments(
			request("POST", "/drop/api/comments/share1", {
				body: { parentId: comment.id, name: "Anna", body: "and?" },
				author: token,
			}),
			"share1",
			null,
			env,
			T0 + 1,
		)
		const replyId = ((await reply.json()) as { comment: CommentView }).comment.id
		expect((await suggest(valid([replyId]))).status).toBe(400)

		await handleComments(
			request("PATCH", `/drop/api/comments/share1/${comment.id}`, {
				body: { resolved: true, name: "Anna" },
				author: token,
			}),
			"share1",
			comment.id,
			env,
			T0 + 1,
		)
		expect((await suggest(valid([comment.id]))).status).toBe(400)
		expect((await suggest(valid([comment.id]), { shareId: DEMO_SHARE_ID })).status).toBe(403)

		env = { ...env, AI_FEEDBACK_MODEL: undefined } as unknown as Env
		expect((await suggest(valid([comment.id]))).status).toBe(404)
	})

	it(`holds at most ${MAX_OPEN_SUGGESTIONS} open suggestions per drop`, async () => {
		const { comment, token } = await thread()
		const stmt = db.prepare(
			`INSERT INTO comment_suggestions (id, drop_id, filename, thread_ids, script, aliases, base_hash,
			   author_name, author_hash, created_at) VALUES (?, 'share1', ?, '[]', 'a > b', '{}', ?, 'X', 'h', 1)`,
		)
		for (let k = 0; k < MAX_OPEN_SUGGESTIONS; k++) {
			await stmt.bind(`s${String(k).padStart(11, "x")}`, SEEDED_FILE, HASH).run()
		}
		expect((await suggest(valid([comment.id]), { author: token })).status).toBe(409)
	})
})

describe("closing a suggestion", () => {
	async function shared() {
		const { comment, token } = await thread()
		const res = await suggest(valid([comment.id]), { author: token })
		return { id: res.json.suggestion?.id as string, token: token as string }
	}

	it("lets anyone who writes here mark it applied, once", async () => {
		const { id } = await shared()
		const other = await thread("Me too", undefined)
		const res = await patch(id, { status: "applied", name: "Carla" }, other.token)
		expect(res.status).toBe(200)
		expect(res.json.suggestion).toMatchObject({
			status: "applied",
			closedBy: "Carla",
			closedAt: T0 + 3,
		})
		expect(fanned.at(-1)?.body.status).toBe("applied")
		expect((await patch(id, { status: "applied", name: "Carla" }, other.token)).status).toBe(409)
	})

	it("lets only its author withdraw it", async () => {
		const { id, token } = await shared()
		const other = await thread("Me too", undefined)
		expect((await patch(id, { status: "withdrawn" }, other.token)).status).toBe(403)
		const res = await patch(id, { status: "withdrawn" }, token)
		expect(res.json.suggestion).toMatchObject({ status: "withdrawn", closedBy: "Ben" })
	})

	it("needs a known author, a name to apply, and a real status", async () => {
		const { id, token } = await shared()
		expect((await patch(id, { status: "applied", name: "X" })).status).toBe(403)
		expect((await patch(id, { status: "applied" }, token)).status).toBe(400)
		expect((await patch(id, { status: "open" }, token)).status).toBe(400)
		expect((await patch("111111111111", { status: "withdrawn" }, token)).status).toBe(404)
	})
})

describe("routing and retention", () => {
	it("is routed by the worker: POST to share, PATCH to close", async () => {
		const { comment } = await thread()
		const fetch = worker.fetch as (r: Request, e: Env) => Promise<Response>
		const res = await fetch(
			request("POST", "/drop/api/suggestions/share1", { body: valid([comment.id]) }),
			env,
		)
		expect(res.status).toBe(201)
		const get = await fetch(request("GET", "/drop/api/suggestions/share1", {}), env)
		expect(get.status).toBe(405)
	})

	it("goes when the drop goes", async () => {
		const { comment, token } = await thread()
		await suggest(valid([comment.id]), { author: token })
		await deleteDrop(db, "share1", { ban: false, now: T0 })
		const row = await db
			.prepare("SELECT COUNT(*) AS n FROM comment_suggestions")
			.first<{ n: number }>()
		expect(row?.n).toBe(0)
	})
})
