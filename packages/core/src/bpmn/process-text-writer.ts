/**
 * Writes an existing diagram in the line format of {@link PROCESS_TEXT_GUIDE},
 * so a language model can read it — and answer with a change script
 * ({@link PROCESS_DELTA_GUIDE}) that names its nodes by id.
 *
 * Written ids are short aliases: a Modeler id such as `Activity_0x9k2lm` costs
 * several tokens and tells the model nothing, so each node is written under a
 * name-derived alias (`review_application`) and the map back to the real id is
 * returned beside the text. An id that is already short and readable is kept.
 *
 * Only what the format can express is written: the first process's flow nodes
 * and sequence flows. Lanes, data objects, annotations, event sub-processes and
 * the inside of a sub-process are left out. A script cannot name what it was
 * never shown, so those parts cannot be changed by it either.
 *
 * @packageDocumentation
 */

import { assertBpmnDefinitions } from "./argument-guards.js"
import type { BpmnDefinitions, BpmnElementType } from "./bpmn-model.js"
import { compactify } from "./compact.js"
import type { CompactElement, CompactFlow } from "./compact.js"
import { FIXED_KINDS } from "./process-delta.js"
import { KINDS } from "./process-text.js"

/** What {@link writeProcessText} wrote. */
export interface WrittenProcessText {
	/** The diagram in the line format. */
	text: string
	/** Every written id, mapped to the element id it stands for. */
	aliases: Record<string, string>
}

const KIND_WORDS = new Map<BpmnElementType, string>(
	[...Object.entries(KINDS), ...Object.entries(FIXED_KINDS)].map(([word, type]) => [type, word]),
)

/** Ids kept as they are: short, lowercase, and readable. */
const READABLE_ID = /^[a-z][a-z0-9_]{0,23}$/

/** Longest alias derived from a name, in words. */
const ALIAS_WORDS = 4

/**
 * A name as it can be written inside brackets: on one line, with no bracket
 * or bar to end the declaration early. The change applier compares a restated
 * name against this, so writing it back unchanged is no rename.
 */
export function writableName(name: string): string {
	return name
		.replace(/\[/g, "(")
		.replace(/\]/g, ")")
		.replace(/\|/g, "/")
		.replace(/\s+/g, " ")
		.trim()
}

/** A flow name as it can be written in an arrow label, which a colon or parenthesis would end. */
export function writableLabel(name: string): string {
	return name.replace(/[():]/g, " ").replace(/\s+/g, " ").trim()
}

/** A FEEL condition without its leading `=`, on one line. */
export function writableCondition(condition: string): string {
	return condition.replace(/^\s*=/, "").replace(/\s+/g, " ").trim()
}

function aliasFor(element: CompactElement, taken: Set<string>): string {
	if (READABLE_ID.test(element.id) && !taken.has(element.id)) {
		taken.add(element.id)
		return element.id
	}
	const words = (element.name ?? "")
		.replace(/([a-z0-9])([A-Z])/g, "$1 $2")
		.toLowerCase()
		.split(/[^a-z0-9]+/)
		.filter(Boolean)
		.slice(0, ALIAS_WORDS)
	let base = words.join("_")
	if (!/^[a-z]/.test(base))
		base = (KIND_WORDS.get(element.type) ?? "node") + (base ? `_${base}` : "")
	let alias = base
	for (let n = 2; taken.has(alias); n++) alias = `${base}_${n}`
	taken.add(alias)
	return alias
}

function spec(element: CompactElement, host: string | undefined): string {
	const word = KIND_WORDS.get(element.type) ?? "task"
	const trigger = element.eventType ? `:${element.eventType}` : ""
	const name = element.name ? ` ${writableName(element.name)}` : ""
	const attrs: string[] = []
	if (host !== undefined) attrs.push(`on=${host}`)
	if (element.interrupting === false) attrs.push("nonint")
	if (element.jobType) attrs.push(`job=${element.jobType}`)
	return `[${word}${trigger}${name}${attrs.length > 0 ? ` | ${attrs.join(" ")}` : ""}]`
}

function label(flow: CompactFlow): string {
	const name = flow.name ? writableLabel(flow.name) : ""
	if (flow.isDefault) return `>(${name ? `${name}: ` : ""}default) `
	if (flow.condition) return `>(${name}: ${writableCondition(flow.condition)}) `
	return name ? `>(${name}) ` : "> "
}

/**
 * Writes the first process of `definitions` in the line format.
 *
 * Paths start at the start events and follow the flows; each flow is written
 * once and each node is declared where it first appears. A boundary event
 * starts its own line once its host has been declared, and a node no path
 * reaches is declared on a line of its own, so nothing the format can express
 * is left out.
 *
 * @example
 * ```typescript
 * const { text, aliases } = writeProcessText(Bpmn.parse(xml))
 * // text:    "# Order\nstart[start Order placed] > check_order[service Check order] > …"
 * // aliases: { start: "StartEvent_1", check_order: "Activity_0x9k2lm", … }
 * ```
 */
export function writeProcessText(definitions: BpmnDefinitions): WrittenProcessText {
	assertBpmnDefinitions(definitions, "writeProcessText")
	const process = compactify(definitions).processes[0]
	if (!process) return { text: "", aliases: {} }

	// What the format can write: flow nodes with a kind word, outside any event sub-process.
	const elements = process.elements.filter((el) => KIND_WORDS.has(el.type))
	const byId = new Map(elements.map((el) => [el.id, el]))
	const flows = process.flows.filter((f) => byId.has(f.from) && byId.has(f.to))
	const outgoing = new Map<string, CompactFlow[]>()
	for (const flow of flows) outgoing.set(flow.from, [...(outgoing.get(flow.from) ?? []), flow])

	const taken = new Set<string>()
	const alias = new Map<string, string>()
	// Readable ids first, so a name-derived alias never takes one of them.
	for (const el of elements) if (READABLE_ID.test(el.id)) alias.set(el.id, aliasFor(el, taken))
	for (const el of elements) if (!alias.has(el.id)) alias.set(el.id, aliasFor(el, taken))

	const declared = new Set<string>()
	const ref = (id: string): string => {
		const el = byId.get(id)
		const written = alias.get(id) ?? id
		if (!el || declared.has(id)) return written
		declared.add(id)
		return `${written}${spec(el, el.attachedTo === undefined ? undefined : alias.get(el.attachedTo))}`
	}

	const lines: string[] = []
	if (process.name) lines.push(`# ${writableName(process.name)}`)
	const written = new Set<CompactFlow>()
	const expanded = new Set<string>()
	const queue: string[] = []

	/** Writes every unwritten flow out of `id`, each as a path that runs on while it can. */
	const expand = (id: string): void => {
		if (expanded.has(id)) return
		expanded.add(id)
		for (const first of outgoing.get(id) ?? []) {
			if (written.has(first)) continue
			let line = `${ref(id)} `
			let flow: CompactFlow | undefined = first
			while (flow) {
				written.add(flow)
				line += `${label(flow)}${ref(flow.to)} `
				queue.push(flow.to)
				const next: CompactFlow[] = (outgoing.get(flow.to) ?? []).filter((f) => !written.has(f))
				// Run on only through a node with one way out, and only once.
				const only: CompactFlow | undefined =
					next.length === 1 && !expanded.has(flow.to) ? next[0] : undefined
				if (only) expanded.add(flow.to)
				flow = only
			}
			lines.push(line.trimEnd())
		}
	}

	const drain = (): void => {
		for (let id = queue.shift(); id !== undefined; id = queue.shift()) {
			// A boundary waits for its host; it is written after the main paths.
			if (byId.get(id)?.type !== "boundaryEvent") expand(id)
		}
	}

	const starts = elements.filter(
		(el) => el.type === "startEvent" || !flows.some((f) => f.to === el.id),
	)
	for (const el of starts) {
		if (el.type === "boundaryEvent") continue
		queue.push(el.id)
		drain()
	}
	// Then boundaries, after their hosts, and whatever no path reached.
	for (const el of elements) {
		if (el.attachedTo !== undefined && !declared.has(el.attachedTo)) lines.push(ref(el.attachedTo))
		expand(el.id)
		drain()
		if (!declared.has(el.id)) lines.push(ref(el.id))
	}

	const aliases: Record<string, string> = {}
	for (const [id, written] of alias) aliases[written] = id
	return { text: lines.join("\n"), aliases }
}
