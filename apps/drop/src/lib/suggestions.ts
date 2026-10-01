/** Suggested changes in D1. The rules about who may write what live in `routes/suggestions.ts`. */
import { authorIdFromHash } from "../shared/comments.js"
import type { SuggestionStatus, SuggestionView } from "../shared/suggestions.js"

interface SuggestionRow {
	id: string
	drop_id: string
	filename: string
	thread_ids: string
	script: string
	aliases: string
	base_hash: string
	author_name: string
	author_hash: string
	created_at: number
	status: string
	closed_at: number | null
	closed_by: string | null
}

/** A suggestion with the one field the page must never see still attached. */
export interface StoredSuggestion extends SuggestionView {
	authorHash: string
}

function parse<T>(raw: string, fallback: T): T {
	try {
		return JSON.parse(raw) as T
	} catch {
		return fallback
	}
}

async function fromRow(row: SuggestionRow): Promise<StoredSuggestion> {
	const status: SuggestionStatus =
		row.status === "applied" || row.status === "withdrawn" ? row.status : "open"
	return {
		id: row.id,
		filename: row.filename,
		threadIds: parse<string[]>(row.thread_ids, []),
		script: row.script,
		aliases: parse<Record<string, string>>(row.aliases, {}),
		baseHash: row.base_hash,
		authorName: row.author_name,
		authorId: await authorIdFromHash(row.author_hash),
		authorHash: row.author_hash,
		createdAt: row.created_at,
		status,
		closedAt: row.closed_at,
		closedBy: row.closed_by,
	}
}

/** Strips the author hash: what a route answers and what the room broadcasts. */
export function toSuggestionView(s: StoredSuggestion): SuggestionView {
	const { authorHash: _, ...view } = s
	return view
}

/** Every suggestion on a drop, oldest first. */
export async function listSuggestions(
	db: D1Database,
	shareId: string,
): Promise<StoredSuggestion[]> {
	const { results } = await db
		.prepare("SELECT * FROM comment_suggestions WHERE drop_id = ? ORDER BY created_at ASC, id ASC")
		.bind(shareId)
		.all<SuggestionRow>()
	return Promise.all(results.map(fromRow))
}

export async function getSuggestion(
	db: D1Database,
	shareId: string,
	id: string,
): Promise<StoredSuggestion | null> {
	const row = await db
		.prepare("SELECT * FROM comment_suggestions WHERE drop_id = ? AND id = ?")
		.bind(shareId, id)
		.first<SuggestionRow>()
	return row ? fromRow(row) : null
}

export async function countOpenSuggestions(db: D1Database, shareId: string): Promise<number> {
	const row = await db
		.prepare("SELECT COUNT(*) AS n FROM comment_suggestions WHERE drop_id = ? AND status = 'open'")
		.bind(shareId)
		.first<{ n: number }>()
	return row?.n ?? 0
}

export async function insertSuggestion(
	db: D1Database,
	shareId: string,
	s: Omit<StoredSuggestion, "authorId" | "status" | "closedAt" | "closedBy">,
): Promise<void> {
	await db
		.prepare(
			`INSERT INTO comment_suggestions (id, drop_id, filename, thread_ids, script, aliases, base_hash,
			   author_name, author_hash, created_at, status, closed_at, closed_by)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'open', NULL, NULL)`,
		)
		.bind(
			s.id,
			shareId,
			s.filename,
			JSON.stringify(s.threadIds),
			s.script,
			JSON.stringify(s.aliases),
			s.baseHash,
			s.authorName,
			s.authorHash,
			s.createdAt,
		)
		.run()
}

/** Closes an open suggestion: applied by someone, or withdrawn by its author. */
export async function closeSuggestion(
	db: D1Database,
	id: string,
	status: Exclude<SuggestionStatus, "open">,
	by: string,
	now: number,
): Promise<void> {
	await db
		.prepare(
			"UPDATE comment_suggestions SET status = ?, closed_at = ?, closed_by = ? WHERE id = ? AND status = 'open'",
		)
		.bind(status, now, by, id)
		.run()
}
