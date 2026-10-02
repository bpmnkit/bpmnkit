/** Bindings and vars available to the Worker, configured in wrangler.jsonc. */
export interface Env {
	/** D1 database holding drops, files, content, reports, and bans. */
	DB: D1Database
	/** Durable Object namespace — one DocRoom instance per shareId. */
	ROOM: DurableObjectNamespace
	/** Static assets (client bundles, CSS) served from ./public. */
	ASSETS: Fetcher
	/** Terms/Privacy version recorded on each drop. */
	TOS_VERSION: string
	/** Operator secret for admin endpoints (`wrangler secret put DROP_ADMIN_TOKEN`). */
	DROP_ADMIN_TOKEN?: string
	/** Salt for hashing reporter IPs (`wrangler secret put REPORT_IP_SALT`). */
	REPORT_IP_SALT?: string
	/** Workers AI binding — used by the AI process review. */
	AI: Ai
	/** Closed-beta access code for AI review. Unset = feature off (`wrangler secret put AI_PASSCODE`). */
	AI_PASSCODE?: string
	/** Workers AI model id (var; default `@cf/openai/gpt-oss-120b`). */
	AI_MODEL: string
	/**
	 * Workers AI model for describe-to-diagram (var). Separate from `AI_MODEL`:
	 * generation wants the fastest model that writes the line format well, the
	 * review the one that reasons best. Its options come from `MODEL_PROFILES`.
	 */
	AI_GENERATE_MODEL: string
	/**
	 * Second model for describe-to-diagram (var). Asked too when the first has
	 * written nothing after `AI_GENERATE_HEDGE_MS`, or fails; whichever writes
	 * first is kept. Unset = no hedge.
	 */
	AI_GENERATE_FALLBACK_MODEL?: string
	/**
	 * Vision model that drafts from an image (var). Unset = images are refused.
	 * Only first drafts use it; changes to a draft go to `AI_GENERATE_MODEL`.
	 */
	AI_GENERATE_IMAGE_MODEL?: string
	/** Milliseconds before the fallback is asked (var; default 1500). */
	AI_GENERATE_HEDGE_MS?: string
	/**
	 * Workers AI model that changes a shared diagram from its review comments
	 * (var). Unset = the feature is off, even with `AI_PASSCODE` set. Pick it with
	 * `bench:generate --feedback` (doc/drop-ai-feedback-edits-analysis.md §13);
	 * its options come from `MODEL_PROFILES`.
	 */
	AI_FEEDBACK_MODEL?: string
	/**
	 * Workers AI model for the connect pass, which configures the connectors of a
	 * generated or existing diagram (var). Unset = the feature is off, even with
	 * `AI_PASSCODE` set.
	 */
	AI_CONNECT_MODEL?: string
	/** Daily neuron budget shared by AI reviews and generations (var; string, parsed at the edge). */
	AI_DAILY_BUDGET: string
	/**
	 * Turnstile site key (var; public, rendered into the page). Unset = no widget.
	 *
	 * Paired with {@link TURNSTILE_SECRET}, which is what actually enforces. Set
	 * the secret without this and every claim fails — which is the right way round
	 * for a check whose job is to say no.
	 */
	TURNSTILE_SITE_KEY?: string
	/** Turnstile secret (`wrangler secret put TURNSTILE_SECRET`). Unset = claims are not challenged. */
	TURNSTILE_SECRET?: string
}
