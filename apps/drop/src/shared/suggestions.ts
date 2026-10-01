/**
 * Suggested changes on review threads: what the page and the Worker agree on.
 * See `routes/suggestions.ts` for who may write what.
 */

/** Longest change script a suggestion carries. A real one is a few hundred characters. */
export const MAX_SUGGESTION_SCRIPT_CHARS = 4_000

/** Most alias entries: one per written node of the largest diagram the AI is shown. */
export const MAX_SUGGESTION_ALIASES = 2_000

/** Most open suggestions a drop holds; applied and withdrawn ones do not count. */
export const MAX_OPEN_SUGGESTIONS = 100

export type SuggestionStatus = "open" | "applied" | "withdrawn"

/** A suggestion as the page sees it. */
export interface SuggestionView {
	id: string
	filename: string
	/** The threads it answers, in the order its `@n` lines number them. */
	threadIds: string[]
	/** The change script. Every preview is worked out from this, never from a stored description. */
	script: string
	/** Written id → element id: what the script's ids resolve against. */
	aliases: Record<string, string>
	/** `semanticHash` of the diagram it was worked out on. */
	baseHash: string
	authorName: string
	/** As `CommentView.authorId`: lets the page recognise its own. */
	authorId: string
	createdAt: number
	status: SuggestionStatus
	/** When, and by whom, it was applied or withdrawn. */
	closedAt: number | null
	closedBy: string | null
}

const HASH = /^[0-9a-f]{64}$/

export function isSemanticHash(value: unknown): value is string {
	return typeof value === "string" && HASH.test(value)
}
