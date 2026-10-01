/**
 * Suggested changes on review threads.
 *
 * ```
 * POST   /drop/api/suggestions/:shareId        share a proposal on the threads it answers
 * PATCH  /drop/api/suggestions/:shareId/:id    mark it applied, or withdraw your own
 * ```
 *
 * They are listed with the comments (`GET /drop/api/comments/:shareId`), because
 * a page shows them in the threads.
 *
 * An AI change is private to whoever asked for it until they apply it. Sharing
 * it as a suggestion is the other way: the proposal goes on its threads, and
 * the reviewers can look at it before anyone applies it
 * (`doc/drop-ai-feedback-edits-analysis.md` §16).
 *
 * What is stored is the change script and the ids it resolves against, never a
 * description of them. Every reader's preview is worked out again from the
 * script, so a browser cannot make a suggestion say one thing and do another.
 * The script is filtered again here, as the AI route filters the model's
 * answer: a suggestion holds change lines and nothing else. It changes nothing
 * on its own; applying it is an ordinary edit, made by whoever holds the baton
 * and checked by the room.
 *
 * Writes pass the comments' gates — demo, pinned, banned, the hourly write
 * allowance — and use the same author token, so a browser that has commented
 * here is not challenged again.
 */
import { parseProcessDelta } from "@bpmnkit/core"
import type { Env } from "../env.js"
import { listComments } from "../lib/comments.js"
import { MAX_FEEDBACK_ITEMS, createChangeLineFilter } from "../lib/feedback.js"
import { json } from "../lib/http.js"
import { randomBase58 } from "../lib/ids.js"
import {
	closeSuggestion,
	countOpenSuggestions,
	getSuggestion,
	insertSuggestion,
	toSuggestionView,
} from "../lib/suggestions.js"
import { ROOM_SUGGESTION_PATH } from "../room.js"
import { isCommentId, isElementId, normaliseName } from "../shared/comments.js"
import {
	MAX_OPEN_SUGGESTIONS,
	MAX_SUGGESTION_ALIASES,
	MAX_SUGGESTION_SCRIPT_CHARS,
	type SuggestionView,
	isSemanticHash,
} from "../shared/suggestions.js"
import { UNKNOWN_AUTHOR, authorFor, fail, gate, knownAuthor, readJson } from "./comments.js"

const WRITTEN_ID = /^[A-Za-z_][\w.-]{0,127}$/

/** Tells everyone in the drop's room. Best effort, as for comments. */
async function fanOut(env: Env, shareId: string, suggestion: SuggestionView): Promise<void> {
	try {
		const stub = env.ROOM.get(env.ROOM.idFromName(shareId))
		await stub.fetch(`https://room${ROOM_SUGGESTION_PATH}`, {
			method: "POST",
			body: JSON.stringify(suggestion),
		})
	} catch (err) {
		console.error("suggestion fan-out failed", shareId, err)
	}
}

/** The alias map, checked: written ids to element ids, both id-shaped, and not too many. */
function readAliases(raw: unknown): Record<string, string> | string {
	if (typeof raw !== "object" || raw === null || Array.isArray(raw)) return "aliases must map ids"
	const entries = Object.entries(raw as Record<string, unknown>)
	if (entries.length > MAX_SUGGESTION_ALIASES) return "too many aliases"
	const out: Record<string, string> = {}
	for (const [written, id] of entries) {
		if (!WRITTEN_ID.test(written) || !isElementId(id)) return "aliases must map ids"
		out[written] = id
	}
	return out
}

/** Routes `/drop/api/suggestions/:shareId[/:id]`. */
export async function handleSuggestions(
	request: Request,
	shareId: string,
	id: string | null,
	env: Env,
	now: number,
): Promise<Response> {
	if (id === null && request.method === "POST") return create(request, shareId, env, now)
	if (id !== null && request.method === "PATCH") return update(request, shareId, id, env, now)
	return fail(405, "method not allowed")
}

async function create(request: Request, shareId: string, env: Env, now: number): Promise<Response> {
	// Part of AI changes: off with them, whatever a browser sends.
	if (env.AI_PASSCODE === undefined || !env.AI_FEEDBACK_MODEL) return fail(404, "not found")
	const gated = await gate(request, shareId, env, now)
	if (!gated.ok) return gated.error
	const payload = await readJson(request)
	if (!payload) return fail(400, "expected a JSON body")

	const name = normaliseName(payload.name)
	if (!name) return fail(400, "a name is 1–40 letters, digits, spaces or . _ ' -")
	const file = gated.found.files.find((f) => f.filename === payload.filename)
	if (!file || file.kind !== "bpmn") return fail(400, "that diagram is not in this drop")

	const ids = payload.threadIds
	if (!Array.isArray(ids) || ids.length === 0 || ids.length > MAX_FEEDBACK_ITEMS) {
		return fail(400, `a suggestion answers 1–${MAX_FEEDBACK_ITEMS} threads`)
	}
	if (!ids.every(isCommentId)) return fail(400, "unknown thread id")
	const threadIds = [...new Set(ids as string[])]
	const comments = await listComments(env.DB, shareId)
	for (const threadId of threadIds) {
		const root = comments.find((c) => c.id === threadId)
		if (!root || root.parentId !== null || root.filename !== file.filename) {
			return fail(400, "a thread is not on this diagram")
		}
		if (root.deletedAt !== null || root.resolvedAt !== null) {
			return fail(400, "a thread is no longer open")
		}
	}

	if (typeof payload.script !== "string" || payload.script.length > MAX_SUGGESTION_SCRIPT_CHARS) {
		return fail(400, `a change script is at most ${MAX_SUGGESTION_SCRIPT_CHARS} characters`)
	}
	// Change lines only, as the AI route lets out of the Worker.
	const filter = createChangeLineFilter()
	const script = (filter.push(payload.script) + filter.end()).trim()
	const delta = parseProcessDelta(script)
	const changes =
		delta.nodes.length + delta.flows.length + delta.removedNodes.length + delta.removedFlows.length
	if (changes === 0) return fail(400, "a suggestion has to change something")

	const aliases = readAliases(payload.aliases)
	if (typeof aliases === "string") return fail(400, aliases)
	if (!isSemanticHash(payload.baseHash))
		return fail(400, "baseHash must be the diagram's semantic hash")

	if ((await countOpenSuggestions(env.DB, shareId)) >= MAX_OPEN_SUGGESTIONS) {
		return fail(409, `this drop already has ${MAX_OPEN_SUGGESTIONS} open suggestions`)
	}

	const author = await authorFor(request, shareId, env, payload, now)
	if (!author.ok) return author.error

	const suggestionId = randomBase58(12)
	await insertSuggestion(env.DB, shareId, {
		id: suggestionId,
		filename: file.filename,
		threadIds,
		script,
		aliases,
		baseHash: payload.baseHash,
		authorName: name,
		authorHash: author.hash,
		createdAt: now,
	})
	const stored = await getSuggestion(env.DB, shareId, suggestionId)
	if (!stored) return fail(500, "the suggestion was not stored")
	const view = toSuggestionView(stored)
	await fanOut(env, shareId, view)
	return json(
		{ suggestion: view, ...(author.issued ? { authorToken: author.issued } : {}) },
		{ status: 201 },
	)
}

/**
 * `{ status: "applied", name }` from anyone who writes on this drop: applying
 * is an edit the room already checked, and this only records it.
 * `{ status: "withdrawn" }` from its author only.
 */
async function update(
	request: Request,
	shareId: string,
	id: string,
	env: Env,
	now: number,
): Promise<Response> {
	const gated = await gate(request, shareId, env, now)
	if (!gated.ok) return gated.error
	const author = await knownAuthor(request, shareId, env)
	if (author === null || author === "unknown") return UNKNOWN_AUTHOR()
	const found = isCommentId(id) ? await getSuggestion(env.DB, shareId, id) : null
	if (!found) return fail(404, "not found")
	if (found.status !== "open") return fail(409, `that suggestion was already ${found.status}`)
	const payload = await readJson(request)
	if (!payload) return fail(400, "expected a JSON body")

	if (payload.status === "withdrawn") {
		if (found.authorHash !== author) return fail(403, "only its author can withdraw a suggestion")
		await closeSuggestion(env.DB, id, "withdrawn", found.authorName, now)
	} else if (payload.status === "applied") {
		const name = normaliseName(payload.name)
		if (!name) return fail(400, "an applied suggestion says who applied it")
		await closeSuggestion(env.DB, id, "applied", name, now)
	} else {
		return fail(400, 'status is "applied" or "withdrawn"')
	}
	const updated = await getSuggestion(env.DB, shareId, id)
	if (!updated) return fail(404, "not found")
	const view = toSuggestionView(updated)
	await fanOut(env, shareId, view)
	return json({ suggestion: view })
}
