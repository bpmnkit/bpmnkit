/**
 * Pure helpers for `scripts/record-compare.mjs`, which records the same-input comparison matrix
 * through the demo server. No network or file access here, so the matrix check and the recording
 * shape are testable (and the dry run needs neither a server nor an API key).
 */

/** Route name (as on the comparison page) → recording panel key. */
export const ROUTE_PANELS = {
	"raw-xml": "without-sdk",
	"compact-json": "compact-json",
	"builder-script": "with-sdk",
	plan: "plan",
	// The older line-based notation; not in the default matrix.
	"compact-dsl": "with-sdk-compact",
}

/** Route name → demo server SSE path. */
export const ROUTE_ENDPOINTS = {
	"raw-xml": "/stream/without-sdk",
	"compact-json": "/stream/compact-json",
	"builder-script": "/stream/with-sdk",
	plan: "/stream/plan",
	"compact-dsl": "/stream/with-sdk-compact",
}

/** Route name → key of the system prompt in the server's `GET /prompts`. */
export const ROUTE_PROMPT_KEYS = {
	"raw-xml": "withoutSdk",
	"compact-json": "compactJson",
	"builder-script": "withSdk",
	plan: "plan",
	"compact-dsl": "withSdkCompact",
}

export const DEFAULT_ROUTES = ["raw-xml", "compact-json", "builder-script", "plan"]

export function parseArgs(argv) {
	const out = { scenario: undefined, routes: [...DEFAULT_ROUTES], runs: 3, dryRun: false }
	for (let i = 0; i < argv.length; i++) {
		const [flag, inline] = (argv[i] ?? "").split(/=(.*)/s)
		const value = () => inline ?? argv[++i]
		if (flag === "--scenario") out.scenario = value()
		else if (flag === "--routes")
			out.routes = String(value() ?? "")
				.split(",")
				.filter(Boolean)
		else if (flag === "--runs") out.runs = Number(value())
		else if (flag === "--dry-run") out.dryRun = true
		else throw new Error(`Unknown argument "${argv[i]}"`)
	}
	return out
}

/** Throws one error naming every problem; otherwise returns the number of LLM calls the matrix makes. */
export function validateMatrix({ scenario, routes, runs }, scenarioIds) {
	const problems = []
	if (!scenario) problems.push("--scenario is required")
	else if (!scenarioIds.includes(scenario)) {
		problems.push(`unknown scenario "${scenario}" (known: ${scenarioIds.join(", ")})`)
	}
	const seen = new Set()
	for (const r of routes) {
		if (!(r in ROUTE_PANELS)) {
			problems.push(`unknown route "${r}" (known: ${Object.keys(ROUTE_PANELS).join(", ")})`)
		} else if (seen.has(r)) problems.push(`duplicate route "${r}"`)
		seen.add(r)
	}
	if (routes.length === 0) problems.push("--routes is empty")
	if (!Number.isInteger(runs) || runs < 1) problems.push("--runs must be an integer >= 1")
	if (problems.length) throw new Error(`Invalid matrix:\n- ${problems.join("\n- ")}`)
	return { calls: routes.length * runs }
}

/** Incremental SSE parser: feed text chunks; calls `onEvent({ event, data })` per complete event. */
export function createSseParser(onEvent) {
	let buffer = ""
	return (chunk) => {
		buffer += chunk
		let end = buffer.indexOf("\n\n")
		while (end >= 0) {
			const block = buffer.slice(0, end)
			buffer = buffer.slice(end + 2)
			let event = "message"
			const data = []
			for (const line of block.split("\n")) {
				if (line.startsWith("event:")) event = line.slice(6).trim()
				else if (line.startsWith("data:")) data.push(line.slice(5).trim())
			}
			let parsed = null
			try {
				parsed = JSON.parse(data.join("\n"))
			} catch {
				// Not JSON: leave null; the caller only consumes the server's own JSON events.
			}
			onEvent({ event, data: parsed })
			end = buffer.indexOf("\n\n")
		}
	}
}

/** A `RecordedPanel` (apps/demo/shared/recording-types.ts) from one route's streamed events. */
export function buildPanel({ systemPrompt, chunks, durationMs, events }) {
	const final = [...events].reverse().find((e) => e.event === "bpmn" || e.event === "error")
	const d = final?.data ?? {}
	const result =
		final?.event === "bpmn" && typeof d.xml === "string"
			? { type: "bpmn", xml: d.xml }
			: { type: "error", message: String(d.message ?? "stream ended without a result") }
	return {
		...(typeof d.model === "string" ? { model: d.model } : {}),
		systemPrompt,
		chunks,
		durationMs,
		usage: d.usage ?? null,
		result,
	}
}

/** `<scenario>-<date>` for the first run of a day, then `b`, `c`, … as the existing recordings do. */
export function nextRecordingName(scenario, date, existingFiles) {
	const taken = new Set(existingFiles.map((f) => f.replace(/\.json$/, "")))
	const base = `${scenario}-${date}`
	if (!taken.has(base)) return base
	for (const s of "bcdefghijklmnopqrstuvwxyz") if (!taken.has(base + s)) return base + s
	throw new Error(`Too many recordings for ${base}`)
}
