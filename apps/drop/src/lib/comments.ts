/** Review comments in D1. The rules about who may write what live in `routes/comments.ts`. */
import { type CommentView, authorIdFromHash } from "../shared/comments.js"

/** A `comments` row. */
interface CommentRow {
	id: string
	drop_id: string
	filename: string
	element_id: string | null
	element_label: string | null
	/** JSON array of every element, when there is more than one; else null. */
	element_ids: string | null
	parent_id: string | null
	author_name: string
	author_hash: string
	body: string
	mentions: string
	created_at: number
	edited_at: number | null
	deleted_at: number | null
	resolved_at: number | null
	resolved_by: string | null
}

/** A comment with the one field the page must never see still attached. */
export interface StoredComment extends CommentView {
	authorHash: string
}

/** Every element a row is on: `element_ids` when set, else `element_id`, else none. */
function parseElementIds(row: Pick<CommentRow, "element_id" | "element_ids">): string[] {
	if (row.element_ids) {
		try {
			const parsed = JSON.parse(row.element_ids) as unknown
			if (
				Array.isArray(parsed) &&
				parsed.every((id) => typeof id === "string") &&
				parsed.length > 0
			) {
				return parsed as string[]
			}
		} catch {
			// A row this code did not write; its first anchor still stands.
		}
	}
	return row.element_id === null ? [] : [row.element_id]
}

function parseMentions(raw: string): string[] {
	try {
		const parsed = JSON.parse(raw) as unknown
		return Array.isArray(parsed) ? parsed.filter((m): m is string => typeof m === "string") : []
	} catch {
		return []
	}
}

async function fromRow(row: CommentRow): Promise<StoredComment> {
	return {
		id: row.id,
		filename: row.filename,
		elementId: row.element_id,
		elementLabel: row.element_label,
		elementIds: parseElementIds(row),
		parentId: row.parent_id,
		authorName: row.author_name,
		authorId: await authorIdFromHash(row.author_hash),
		authorHash: row.author_hash,
		body: row.body,
		mentions: parseMentions(row.mentions),
		createdAt: row.created_at,
		editedAt: row.edited_at,
		deletedAt: row.deleted_at,
		resolvedAt: row.resolved_at,
		resolvedBy: row.resolved_by,
	}
}

/** Strips the author hash: what a route answers and what the room broadcasts. */
export function toView(comment: StoredComment): CommentView {
	const { authorHash: _, ...view } = comment
	return view
}

/** Every comment on a drop, oldest first — threads and replies alike. */
export async function listComments(db: D1Database, shareId: string): Promise<StoredComment[]> {
	const { results } = await db
		.prepare("SELECT * FROM comments WHERE drop_id = ? ORDER BY created_at ASC, id ASC")
		.bind(shareId)
		.all<CommentRow>()
	return Promise.all(results.map(fromRow))
}

export async function getComment(
	db: D1Database,
	shareId: string,
	id: string,
): Promise<StoredComment | null> {
	const row = await db
		.prepare("SELECT * FROM comments WHERE drop_id = ? AND id = ?")
		.bind(shareId, id)
		.first<CommentRow>()
	return row ? fromRow(row) : null
}

export async function countComments(db: D1Database, shareId: string): Promise<number> {
	const row = await db
		.prepare("SELECT COUNT(*) AS n FROM comments WHERE drop_id = ?")
		.bind(shareId)
		.first<{ n: number }>()
	return row?.n ?? 0
}

/**
 * Stores a new comment. `elementIds` lists every element it is on; its first is
 * `elementId`. A single anchor is stored in `element_id` alone, as it always was.
 */
export async function insertComment(
	db: D1Database,
	shareId: string,
	c: Omit<StoredComment, "authorId" | "elementIds"> & { elementIds?: string[] },
): Promise<void> {
	const several = c.elementIds !== undefined && c.elementIds.length > 1
	await db
		.prepare(
			`INSERT INTO comments (id, drop_id, filename, element_id, element_label, element_ids, parent_id,
			   author_name, author_hash, body, mentions, created_at, edited_at, deleted_at, resolved_at,
			   resolved_by)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, NULL, NULL)`,
		)
		.bind(
			c.id,
			shareId,
			c.filename,
			c.elementId,
			c.elementLabel,
			several ? JSON.stringify(c.elementIds) : null,
			c.parentId,
			c.authorName,
			c.authorHash,
			c.body,
			JSON.stringify(c.mentions),
			c.createdAt,
		)
		.run()
}

export async function editComment(
	db: D1Database,
	id: string,
	body: string,
	mentions: string[],
	now: number,
): Promise<void> {
	await db
		.prepare("UPDATE comments SET body = ?, mentions = ?, edited_at = ? WHERE id = ?")
		.bind(body, JSON.stringify(mentions), now, id)
		.run()
}

/** Resolves a thread (`by` set) or reopens it (`by` null). */
export async function setResolved(
	db: D1Database,
	id: string,
	by: string | null,
	now: number,
): Promise<void> {
	await db
		.prepare("UPDATE comments SET resolved_at = ?, resolved_by = ? WHERE id = ?")
		.bind(by === null ? null : now, by, id)
		.run()
}

/** Deletes a comment's words but keeps its place, so replies to it still have a thread. */
export async function tombstoneComment(db: D1Database, id: string, now: number): Promise<void> {
	await db
		.prepare("UPDATE comments SET body = '', mentions = '[]', deleted_at = ? WHERE id = ?")
		.bind(now, id)
		.run()
}

/** Whether this drop issued the author token with this hash. */
export async function isKnownAuthor(
	db: D1Database,
	shareId: string,
	tokenHash: string,
): Promise<boolean> {
	const row = await db
		.prepare("SELECT 1 AS ok FROM comment_authors WHERE drop_id = ? AND token_hash = ?")
		.bind(shareId, tokenHash)
		.first<{ ok: number }>()
	return row !== null
}

export async function addAuthor(
	db: D1Database,
	shareId: string,
	tokenHash: string,
	now: number,
): Promise<void> {
	await db
		.prepare("INSERT INTO comment_authors (drop_id, token_hash, created_at) VALUES (?, ?, ?)")
		.bind(shareId, tokenHash, now)
		.run()
}

/**
 * Counts one write against an address's hourly allowance and answers the new
 * total. Counted before the write is judged, so a stream of refused writes
 * costs the sender its allowance as surely as accepted ones.
 */
export async function countWrite(db: D1Database, ipHash: string, hour: number): Promise<number> {
	await db
		.prepare(
			"INSERT INTO comment_writes (ip_hash, hour, count) VALUES (?, ?, 1) ON CONFLICT(ip_hash, hour) DO UPDATE SET count = count + 1",
		)
		.bind(ipHash, hour)
		.run()
	const row = await db
		.prepare("SELECT count FROM comment_writes WHERE ip_hash = ? AND hour = ?")
		.bind(ipHash, hour)
		.first<{ count: number }>()
	return row?.count ?? 0
}

/** Forgets write counters older than the current hour. Run from the daily cron. */
export async function pruneWriteCounters(db: D1Database, now: number): Promise<void> {
	await db
		.prepare("DELETE FROM comment_writes WHERE hour < ?")
		.bind(Math.floor(now / 3_600_000))
		.run()
}
