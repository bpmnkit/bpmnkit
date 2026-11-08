/** Appends the pointer to a card's trap list, so a fix loop learns where the rule is explained. */
export function withCardHint(
	findings: CheckFinding[],
	card: "bpmn" | "dmn" | "form",
): CheckFinding[] {
	return findings.map((f) => ({ ...f, fix: `${f.fix} (agent-cards/${card}.md#traps)` }))
}

/** How bad a {@link CheckFinding} is. `error` means the resource will not deploy or run as written. */
export type CheckSeverity = "error" | "warning" | "info"

/**
 * One problem in a DMN or form resource, shaped for an agent's fix loop:
 * which rule fired, where, what is wrong and what to change.
 */
export interface CheckFinding {
	/** Stable rule id, e.g. `dmn/unresolved-requirement` or `form/duplicate-key`. */
	rule: string
	severity: CheckSeverity
	/** The element (DMN) or component (form) the finding is about, when there is one. */
	elementId?: string
	message: string
	/** A concrete change that resolves the finding. */
	fix: string
}
