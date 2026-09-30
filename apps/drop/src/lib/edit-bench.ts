import type { CompactDiagram } from "@bpmnkit/core"

/**
 * One benchmark case for a change to a draft: a draft as a model wrote it, a
 * change request, and what the changed diagram must show. `reference` is a
 * hand-written answer that meets every assertion, so a case that cannot be
 * met is caught by the tests rather than by a model run.
 */
export interface EditCase {
	id: string
	description: string
	diagram: string
	change: string
	reference: string
	assertions: EditAssertions
}

export interface EditAssertions {
	mustContainElementTypes?: string[]
	/** Each inner list: at least one of these types. */
	mustContainAnyOf?: string[][]
	/** Words some element name must contain, case-insensitive. */
	mustMention?: string[]
	/** Words no element name may contain any more. */
	mustNotMention?: string[]
	/**
	 * Draft elements the change must leave in place, with the same type. Never
	 * the element the change is about: a model that renames "Process payment"
	 * may fairly rename its id `pay` too.
	 */
	keepIds?: string[]
	/** The element a decision's default branch must lead to. */
	defaultTo?: string
	/** A word some branch condition must contain. */
	conditionMentions?: string
}

/** How a changed diagram compares with its draft. */
export interface EditScore {
	/** Assertions not met, in words. */
	failed: string[]
	/** Share of the draft's elements still there under the same id: what the change left alone. */
	kept: number
	added: number
	removed: number
}

export function scoreEdit(
	draft: CompactDiagram,
	answer: CompactDiagram,
	assertions: EditAssertions,
): EditScore {
	const before = draft.processes.flatMap((p) => p.elements)
	const elements = answer.processes.flatMap((p) => p.elements)
	const flows = answer.processes.flatMap((p) => p.flows)
	const byId = new Map(elements.map((e) => [e.id, e]))
	const types = new Set<string>(elements.map((e) => e.type))
	const names = elements.map((e) => (e.name ?? "").toLowerCase())
	const failed: string[] = []

	for (const type of assertions.mustContainElementTypes ?? []) {
		if (!types.has(type)) failed.push(`no ${type}`)
	}
	for (const alternatives of assertions.mustContainAnyOf ?? []) {
		if (!alternatives.some((type) => types.has(type)))
			failed.push(`no ${alternatives.join(" or ")}`)
	}
	for (const word of assertions.mustMention ?? []) {
		if (!names.some((name) => name.includes(word.toLowerCase()))) failed.push(`no "${word}"`)
	}
	for (const word of assertions.mustNotMention ?? []) {
		if (names.some((name) => name.includes(word.toLowerCase()))) failed.push(`still "${word}"`)
	}
	for (const id of assertions.keepIds ?? []) {
		const was = before.find((e) => e.id === id)
		const now = byId.get(id)
		if (!now || now.type !== was?.type) failed.push(`lost ${id}`)
	}
	if (
		assertions.defaultTo !== undefined &&
		!flows.some((f) => f.isDefault && f.to === assertions.defaultTo)
	) {
		failed.push(`default is not to ${assertions.defaultTo}`)
	}
	const word = assertions.conditionMentions?.toLowerCase()
	if (word !== undefined && !flows.some((f) => f.condition?.toLowerCase().includes(word))) {
		failed.push(`no condition on "${word}"`)
	}

	const kept = before.filter((e) => byId.get(e.id)?.type === e.type).length
	return {
		failed,
		kept: before.length === 0 ? 1 : kept / before.length,
		added: elements.filter((e) => !before.some((b) => b.id === e.id)).length,
		removed: before.length - kept,
	}
}
