import { type BpmnDefinitions, optimize, parseProcessDelta, writeProcessText } from "@bpmnkit/core"
import { applyProcessDelta } from "@bpmnkit/editor/headless"
import type { FeedbackItem } from "./feedback.js"

/**
 * One benchmark case for a change from review feedback: a shared BPMN file,
 * comment threads on it, and what the changed diagram must show. `reference`
 * is a hand-written change script that meets every assertion, so a case that
 * cannot be met fails the tests rather than a model run.
 */
export interface FeedbackCase {
	id: string
	/** The BPMN file, relative to the repository root. */
	file: string
	/** The threads, anchored by element id in the file, as Drop stores them. */
	items: (Omit<FeedbackItem, "on" | "label"> & { on?: string })[]
	reference: string
	assertions: FeedbackAssertions
}

export interface FeedbackAssertions {
	/** Words some element name must contain, case-insensitive. */
	mustMention?: string[]
	/** Each inner list: some element name contains at least one of these. */
	mustMentionAnyOf?: string[][]
	/** Words no element name may contain. */
	mustNotMention?: string[]
	/** Element id → the types it may have after the change. */
	types?: Record<string, string[]>
	/**
	 * Sequence flows that must exist. Each end is an element id, or `~word` for
	 * any element whose name contains the word.
	 */
	edges?: [string, string][]
	/** A boundary event on this element, with this trigger. */
	boundary?: { on: string; trigger?: string }
	/** Feedback items an `@` line must answer. */
	addressed?: number[]
	/** The feedback asks for nothing: the answer must change nothing. */
	noChange?: boolean
	/**
	 * Existing elements the feedback is about. Changing or removing one of these
	 * is the change; changing any other is collateral, and fails the case.
	 */
	touch?: string[]
}

/** What one answer did to its case. */
export interface FeedbackScore {
	/** Assertions not met, in words. Collateral is one of them. */
	failed: string[]
	/** Existing elements changed or removed that no feedback is about. */
	collateral: string[]
	created: number
	changed: number
	removed: number
	/** What the script asked for and could not be read or done: unknown ids, mostly. */
	problems: string[]
	fixes: number
	/** Feedback items the answer's `@` lines name. */
	addressed: number[]
	/** Lint errors the change introduced. */
	newLintErrors: string[]
}

/** What the model is shown for a case, and the map back from its ids. */
export interface PreparedFeedbackCase {
	text: string
	aliases: Record<string, string>
	items: FeedbackItem[]
}

/** Writes the case's diagram and points its threads at the written ids. */
export function prepareFeedbackCase(c: FeedbackCase, defs: BpmnDefinitions): PreparedFeedbackCase {
	const { text, aliases } = writeProcessText(defs)
	const written = new Map(Object.entries(aliases).map(([alias, id]) => [id, alias]))
	const names = new Map(defs.processes[0]?.flowElements.map((el) => [el.id, el.name]))
	const items = c.items.map(({ on, ...item }): FeedbackItem => {
		if (on === undefined) return item
		const alias = written.get(on)
		if (alias === undefined) throw new Error(`${c.id}: "${on}" is not written in the diagram`)
		const label = names.get(on)
		return label ? { ...item, on: alias, label } : { ...item, on: alias }
	})
	return { text, aliases, items }
}

function lintErrors(defs: BpmnDefinitions): string[] {
	return optimize(defs)
		.findings.filter((f) => f.severity === "error")
		.map((f) => f.message)
}

/** Applies `answer` to the case's diagram, as the page will, and checks it. */
export function scoreFeedback(
	c: FeedbackCase,
	defs: BpmnDefinitions,
	aliases: Record<string, string>,
	answer: string,
): FeedbackScore {
	const delta = parseProcessDelta(answer)
	const result = applyProcessDelta(defs, delta, { aliases })
	const after = result.definitions
	const elements = after.processes[0]?.flowElements ?? []
	const flows = after.processes[0]?.sequenceFlows ?? []
	const names = elements.map((el) => (el.name ?? "").toLowerCase())
	const a = c.assertions
	const failed: string[] = []

	for (const word of a.mustMention ?? []) {
		if (!names.some((name) => name.includes(word.toLowerCase()))) failed.push(`no "${word}"`)
	}
	for (const words of a.mustMentionAnyOf ?? []) {
		if (!words.some((word) => names.some((name) => name.includes(word.toLowerCase())))) {
			failed.push(`none of ${words.map((w) => `"${w}"`).join(", ")}`)
		}
	}
	for (const word of a.mustNotMention ?? []) {
		if (names.some((name) => name.includes(word.toLowerCase()))) failed.push(`still "${word}"`)
	}
	for (const [id, types] of Object.entries(a.types ?? {})) {
		const el = elements.find((e) => e.id === id)
		if (!el) failed.push(`lost ${id}`)
		else if (!types.includes(el.type)) failed.push(`${id} is ${el.type}, not ${types.join(" or ")}`)
	}
	const matches = (spec: string) =>
		spec.startsWith("~")
			? elements
					.filter((el) => (el.name ?? "").toLowerCase().includes(spec.slice(1).toLowerCase()))
					.map((el) => el.id)
			: [spec]
	for (const [from, to] of a.edges ?? []) {
		const sources = matches(from)
		const targets = matches(to)
		if (!flows.some((f) => sources.includes(f.sourceRef) && targets.includes(f.targetRef))) {
			failed.push(`no flow ${from} > ${to}`)
		}
	}
	if (a.boundary) {
		const { on, trigger } = a.boundary
		const found = elements.some(
			(el) =>
				el.type === "boundaryEvent" &&
				el.attachedToRef === on &&
				(trigger === undefined || el.eventDefinitions[0]?.type === trigger),
		)
		if (!found) failed.push(`no ${trigger ?? ""} boundary on ${on}`.replace("  ", " "))
	}
	const addressed = [...result.addressed.keys()].sort((x, y) => x - y)
	for (const item of a.addressed ?? []) {
		if (!addressed.includes(item)) failed.push(`no @${item}`)
	}
	const touched = result.created.length + result.changed.length + result.removed.length
	if (a.noChange && touched > 0) failed.push(`changed ${touched} element(s); none was asked for`)

	const allowed = new Set(a.touch ?? [])
	const collateral = [...result.changed, ...result.removed].filter((id) => !allowed.has(id))
	if (collateral.length > 0) failed.push(`collateral: ${collateral.join(", ")}`)

	const before = new Set(lintErrors(defs))
	return {
		failed,
		collateral,
		created: result.created.length,
		changed: result.changed.length,
		removed: result.removed.length,
		problems: [...delta.problems, ...result.problems].map((p) => `${p.line}: ${p.message}`),
		fixes: result.fixes.length,
		addressed,
		newLintErrors: lintErrors(after).filter((message) => !before.has(message)),
	}
}
