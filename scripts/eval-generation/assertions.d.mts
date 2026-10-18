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
