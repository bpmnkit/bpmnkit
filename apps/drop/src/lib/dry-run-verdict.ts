/**
 * What the page says about a dry run. Pure, so it is tested without a browser.
 */
import type { BpmnDefinitions, BpmnFlowElement } from "@bpmnkit/core"

/** The part of the engine's `DryRunResult` the words depend on. */
export interface DryRunOutcome {
	reachedEnd: boolean
	path: string[]
	stoppedAt: string[]
	connectors: { elementId: string; type: string }[]
	error?: string
}

/** `ok` ran to an end, `waits` loops until a person answers, `bad` could not run. */
export type DryRunVerdict = { kind: "ok" | "waits" | "bad"; text: string }

function flat(elements: readonly BpmnFlowElement[]): BpmnFlowElement[] {
	return elements.flatMap((el) => {
		const inner = (el as { flowElements?: BpmnFlowElement[] }).flowElements
		return inner ? [el, ...flat(inner)] : [el]
	})
}

export function dryRunVerdict(outcome: DryRunOutcome, defs: BpmnDefinitions): DryRunVerdict {
	const elements = flat(defs.processes.flatMap((p) => p.flowElements))
	const nameOf = (id: string) => elements.find((el) => el.id === id)?.name || id
	if (outcome.reachedEnd) {
		const end = outcome.path.at(-1)
		const n = outcome.connectors.length
		const mocked = n === 0 ? "" : ` · ${n} connector${n === 1 ? "" : "s"} mocked`
		return { kind: "ok", text: `✓ runs to “${end ? nameOf(end) : "the end"}”${mocked}` }
	}
	const at = outcome.stoppedAt[0] ?? outcome.path.at(-1)
	// The dry run answers a user task with nothing, so a "No, try again" loop never ends there; with a
	// person in the loop that is the design (the agent chat), not a defect.
	const person = outcome.path.some((id) => elements.find((el) => el.id === id)?.type === "userTask")
	if (person && /infinite loop/i.test(outcome.error ?? "")) {
		return {
			kind: "waits",
			text: `↻ loops${at ? ` at “${nameOf(at)}”` : ""} until a person answers; the dry run cannot answer for them`,
		}
	}
	return {
		kind: "bad",
		text: `✗ stops${at ? ` at “${nameOf(at)}”` : ""}${outcome.error ? `: ${outcome.error}` : ""}`,
	}
}
