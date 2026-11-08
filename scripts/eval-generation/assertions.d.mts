import type { BpmnDefinitions } from "@bpmnkit/core"

export const SPEC_ASSERTION_KEYS: readonly string[]
export function hasSpecAssertions(assertions: Record<string, unknown>): boolean
export function scoreSpecAssertions(
	defs: BpmnDefinitions,
	assertions: Record<string, unknown>,
	readiness?: (defs: BpmnDefinitions) => {
		state: "ready" | "shape-only" | "invalid"
		missing?: unknown[]
		errors?: unknown[]
	},
): string[]

export type SpecFailure = { assertion: string; value: unknown; message: string }
export function specFailures(
	defs: BpmnDefinitions,
	assertions: Record<string, unknown>,
	readiness?: Parameters<typeof scoreSpecAssertions>[2],
): SpecFailure[]
export function splitKnownGaps(
	failures: SpecFailure[],
	knownPlanGaps?: { assertion: string; value: unknown }[],
): {
	known: SpecFailure[]
	unexpected: SpecFailure[]
	stale: { assertion: string; value: unknown }[]
}
export function scoreGolden(
	defs: BpmnDefinitions,
	assertions: Record<string, unknown>,
	readiness?: Parameters<typeof scoreSpecAssertions>[2],
): { elements: number; failed: string[] }
