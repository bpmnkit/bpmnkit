export interface Recording {
	name: string
	recordedAt: string
	scenarioId?: string
	scenarioPrompt: string
	panels: {
		/** The demo app's three panels are optional since 2026-11: `record-compare` records any subset of routes. */
		"with-sdk"?: RecordedPanel
		"with-sdk-compact"?: RecordedPanel
		/** LLM writes a `CompactDiagram` as JSON, expanded by `expand()`. Added 2026-11. */
		"compact-json"?: RecordedPanel
		/** LLM writes a `ProcessPlan`, compiled by `compilePlan()` (as `casen synth` does). Added 2026-11. */
		plan?: RecordedPanel
		"without-sdk"?: RecordedPanel
	}
}

export interface TokenUsage {
	inputTokens: number
	outputTokens: number
}

export interface RecordedPanel {
	/** Model id the `claude` CLI reported for the run; absent in recordings made before 2026-11. */
	model?: string
	systemPrompt: string
	chunks: { t: number; text: string }[]
	durationMs: number
	/** `inputTokens` includes cache reads and writes; `outputTokens` is billed separately. */
	usage?: TokenUsage | null
	result: { type: "bpmn"; xml: string } | { type: "error"; message: string }
}
