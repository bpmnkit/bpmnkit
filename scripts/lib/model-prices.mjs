/**
 * Anthropic list prices in USD per million tokens, for the cost column of the same-input
 * comparison page.
 *
 * Source: the `claude-api` skill's "Current Models" table (cached 2026-10-06), which lists
 * first-party API rates. Table dated 2026-11-05. Not verified against anthropic.com/pricing from
 * this sandbox; re-check before publishing and bump PRICES_AS_OF when you do.
 *
 * Left out on purpose: Claude Haiku 5.5 (tiered by prompt length, which a recording's token total
 * cannot resolve) and Mythos (access-programme model). A model that is not here gets no cost.
 */
export const PRICES_AS_OF = "2026-11-05"

export const PRICES = {
	"claude-fable-5-1": { input: 10, output: 50 },
	"claude-fable-5": { input: 10, output: 50 },
	"claude-opus-5-5": { input: 4, output: 20 },
	"claude-opus-5": { input: 5, output: 25 },
	"claude-opus-4-8": { input: 5, output: 25 },
	"claude-opus-4-7": { input: 5, output: 25 },
	"claude-opus-4-6": { input: 5, output: 25 },
	"claude-sonnet-5-5": { input: 2, output: 10 },
	"claude-sonnet-5": { input: 2, output: 10 },
	"claude-sonnet-4-6": { input: 3, output: 15 },
	"claude-haiku-4-5": { input: 1, output: 5 },
}

/**
 * Cost of one run at list price, or null when the model is not in the table or the run has no
 * token split. Recorded `inputTokens` include cache reads and writes, which this prices as plain
 * input, so it is an upper bound for a cached prompt.
 */
export function costUsd(model, inputTokens, outputTokens) {
	const p = model ? PRICES[model] : undefined
	if (!p || inputTokens == null || outputTokens == null) return null
	return (inputTokens * p.input + outputTokens * p.output) / 1_000_000
}
