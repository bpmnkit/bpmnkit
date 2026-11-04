/**
 * Turns one demo recording into per-run rows for the same-input comparison page. Pure (no core
 * import) so it can be tested with a tiny fixture; scoring happens in `build-compare-data.mjs`.
 */

/** Recording panel key → the route name shown on the page. */
export const ROUTES = {
	"without-sdk": "raw-xml",
	"with-sdk-compact": "compact-json",
	"with-sdk": "builder-script",
}

/** Early recordings carry no `scenarioId`; the file name (`<scenario>-<date>[suffix].json`) does. */
export const scenarioOf = (fileName) => fileName.replace(/-\d{4}-\d{2}-\d{2}[a-z]?\.json$/, "")

/** First line only, with any absolute path dropped so a recorder's home directory is not published. */
const errorSummary = (message) =>
	String(message ?? "no result")
		.split("\n")[0]
		.replace(/:?\s*\/\S+/g, "")
		.slice(0, 160)

/** `runId` is the file name without `.json`, e.g. `kyc-2026-07-03`. */
export function extractRows(recording, fileName) {
	const runId = fileName.replace(/\.json$/, "")
	const rows = []
	for (const [panelKey, route] of Object.entries(ROUTES)) {
		const panel = recording.panels?.[panelKey]
		if (!panel) continue
		const ok = panel.result?.type === "bpmn" && typeof panel.result.xml === "string"
		rows.push({
			scenario: recording.scenarioId ?? scenarioOf(fileName),
			runId,
			route,
			recordedAt: recording.recordedAt,
			durationMs: panel.durationMs ?? null,
			inputTokens: panel.usage?.inputTokens ?? null,
			outputTokens: panel.usage?.outputTokens ?? null,
			xml: ok ? panel.result.xml : null,
			error: ok ? null : errorSummary(panel.result?.message),
		})
	}
	return rows
}

/** Lower median by `key`, ties broken by `runId`, so the featured run is stable between builds. */
export function medianBy(items, key) {
	const sorted = items
		.filter((i) => i[key] != null)
		.sort((a, b) => a[key] - b[key] || a.runId.localeCompare(b.runId))
	return sorted[Math.floor((sorted.length - 1) / 2)] ?? null
}
