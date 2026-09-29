import { Bpmn, compactify } from "@bpmnkit/core"
import type { Env } from "../env.js"
import {
	type AiLike,
	addBudget,
	checkAiPasscode,
	getBudgetSpent,
	getCachedReview,
	putCachedReview,
	runLlmReview,
} from "../lib/ai.js"
import { getCurrentBody } from "../lib/db.js"
import { demoFileBody, isDemo } from "../lib/demo.js"
import { json } from "../lib/http.js"
import { type ReviewResult, deterministicSuggestions } from "../lib/review.js"

/**
 * POST /drop/api/ai-review/:shareId/:filename — closed-beta AI process review.
 *
 * Order (doc/drop-v2-spec.md §2.6): passcode gate → attempt limit → cache →
 * budget guard → model call. Feature is off (404) unless AI_PASSCODE is set.
 */
export async function handleAiReview(
	request: Request,
	shareId: string,
	filename: string,
	env: Env,
	now: number,
): Promise<Response> {
	if (env.AI_PASSCODE === undefined) return json({ error: "not found" }, { status: 404 })

	// The current state, not the upload: a review of a diagram the reader is not
	// looking at would be wrong, and the content-hash cache follows for free.
	const file = isDemo(shareId)
		? await demoFileBody(filename, "original")
		: await getCurrentBody(env.DB, shareId, filename, "original")
	if (!file) return json({ error: "not found" }, { status: 404 })
	if (file.kind !== "bpmn") {
		return json({ error: "AI review is only available for BPMN files" }, { status: 400 })
	}

	// Passcode gate — before the cache, because closed means closed.
	const denied = await checkAiPasscode(request, env, env.AI_PASSCODE, now)
	if (denied) return denied

	// Deterministic pass always runs — the feature degrades to it, never breaks.
	let deterministic: ReviewResult["deterministic"]
	try {
		deterministic = deterministicSuggestions(file.body)
	} catch {
		deterministic = []
	}

	// Cache hit → no neurons spent.
	const cached = await getCachedReview(env.DB, file.hash)
	if (cached) {
		return json({
			model: cached.model,
			summary: cached.summary,
			suggestions: cached.suggestions,
			deterministic,
			cached: true,
		} satisfies ReviewResult)
	}

	// Daily neuron budget.
	const day = new Date(now).toISOString().slice(0, 10)
	const budget = Number.parseInt(env.AI_DAILY_BUDGET, 10) || 0
	if ((await getBudgetSpent(env.DB, day)) >= budget) {
		return json({
			model: null,
			summary: null,
			suggestions: [],
			deterministic,
			cached: false,
			note: "AI reviews are busy today — showing automated checks only.",
		} satisfies ReviewResult)
	}

	// Model call.
	try {
		const compactJson = JSON.stringify(compactify(Bpmn.parse(file.body)))
		const { summary, suggestions, neurons } = await runLlmReview(
			env.AI as unknown as AiLike,
			env.AI_MODEL,
			compactJson,
			deterministic,
		)
		await addBudget(env.DB, day, neurons)
		await putCachedReview(env.DB, file.hash, env.AI_MODEL, { summary, suggestions }, neurons, now)
		return json({
			model: env.AI_MODEL,
			summary,
			suggestions,
			deterministic,
			cached: false,
		} satisfies ReviewResult)
	} catch {
		return json({
			model: null,
			summary: null,
			suggestions: [],
			deterministic,
			cached: false,
			note: "AI narrative is unavailable right now — showing automated checks.",
		} satisfies ReviewResult)
	}
}
