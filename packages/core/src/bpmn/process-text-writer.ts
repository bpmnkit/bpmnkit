/**
 * Writes an existing diagram in the line format of {@link PROCESS_TEXT_GUIDE},
 * so a language model can read it — and answer with a change script
 * ({@link PROCESS_DELTA_GUIDE}) that names its nodes by id.
 *
 * Written ids are short aliases: a Modeler id such as `Activity_0x9k2lm` costs
 * several tokens and tells the model nothing, so each node, lane and pool is
 * written under a name-derived alias (`review_application`) and the map back to
 * the real id is returned beside the text. An id that is already short and
 * readable is kept.
 *
 * Only what the format can express is written, for one process: the
 * {@link primaryProcess} (the executable one, which need not come first in a
 * Modeler collaboration). That is its flow nodes, sequence flows, the tasks of
 * an ad-hoc sub-process, documentation, notes and connectors; its leaf lanes;
 * every other pool of the first collaboration, as a black box; and the message
 * flows between one of its top-level nodes and such a pool. Data objects, event
 * sub-processes, the inside of any other sub-process, parent lanes of nested
 * lanes, the content of other pools, and messages that touch the process's own
 * pool or a node of another pool are left out. A script cannot name what it was
 * never shown, so those parts cannot be changed by it either.
 *
 * @packageDocumentation
 */

import { assertBpmnDefinitions } from "./argument-guards.js"
import type {
	BpmnDefinitions,
	BpmnElementType,
	BpmnFlowElement,
	BpmnProcess,
} from "./bpmn-model.js"
import { compactify } from "./compact.js"
import type { CompactElement, CompactFlow } from "./compact.js"
import { FIXED_KINDS } from "./process-delta.js"
import { KINDS, splitMappings } from "./process-text.js"
import { leafLanes, primaryProcess } from "./swimlanes.js"

/** Options for {@link writeProcessText}. */
export interface WriteProcessTextOptions {
	/**
	 * Writes an element's connector as a `with` line, after `with <id>: `, or
	 * answers `undefined` for an element without one. Pass `connectorLineFor`
	 * from `@bpmnkit/core/connectors`, so a model that changes the diagram keeps
	 * its connectors; without it no `with` lines are written.
	 */
	connectorLine?: (element: BpmnFlowElement, definitions: BpmnDefinitions) => string | undefined
}

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

/** A mapping source as FEEL on one line; a literal (no leading `=`) is written as a string. */
function writableMapping(source: string): string {
	if (!source.startsWith("=")) return JSON.stringify(source)
	return source.replace(/^=\s*/, "").replace(/\s+/g, " ").trim()
}

function platformVersion(definitions: BpmnDefinitions): string | undefined {
	const platform = definitions.unknownAttributes["modeler:executionPlatform"]
	if (!platform?.toLowerCase().includes("cloud")) return undefined
	const version = /^\s*(\d+\.\d+)/.exec(
		definitions.unknownAttributes["modeler:executionPlatformVersion"] ?? "",
	)
	return version?.[1]
}

/** The alias of `id`: the id when readable and free, else derived from `name`, else from `kind`. */
function aliasFor(id: string, name: string | undefined, kind: string, taken: Set<string>): string {
	if (READABLE_ID.test(id) && !taken.has(id)) {
		taken.add(id)
		return id
	}
	const words = (name ?? "")
		.replace(/([a-z0-9])([A-Z])/g, "$1 $2")
		.toLowerCase()
		.split(/[^a-z0-9]+/)
		.filter(Boolean)
		.slice(0, ALIAS_WORDS)
	let base = words.join("_")
	if (!/^[a-z]/.test(base)) base = kind + (base ? `_${base}` : "")
	let alias = base
	for (let n = 2; taken.has(alias); n++) alias = `${base}_${n}`
	taken.add(alias)
	return alias
}

/** A lane's or pool's name in brackets, or nothing for one without a name. */
function bracketed(name: string | undefined): string {
	const written = name ? writableName(name) : ""
	return written ? `[${written}]` : ""
}

/** A message label: raw like a note, so colons stay, but a parenthesis would end it. */
function messageLabel(name: string): string {
	return name.replace(/[()]/g, " ").replace(/\s+/g, " ").trim()
}

/**
 * The `lane`, `pool` and `msg` lines of `source`, whose written top-level nodes
 * are `nodes`. Lane and pool aliases are claimed here, after every node alias,
 * so a diagram that gains a lane keeps the node aliases it had.
 *
 * Only leaf lanes are written, each with the nodes it lists in their ref order
 * (a node two leaves list goes to the first): a script can move a node between
 * leaf lanes but cannot create a nested lane. Every participant of the first
 * collaboration but the one that draws `source` is a `pool` line, its content
 * unwritten. A message is written only between a node of `nodes` and such a
 * pool, the two ends the line format can name.
 */
function swimlaneLines(
	definitions: BpmnDefinitions,
	source: BpmnProcess,
	nodes: ReadonlyMap<string, CompactElement>,
	alias: Map<string, string>,
	taken: Set<string>,
): string[] {
	const collaboration = definitions.collaborations[0]
	// A node two leaves list is written in the first only, or the reader would move it.
	const placed = new Set<string>()
	const membersOf = new Map<string, string[]>()
	for (const lane of leafLanes(source.laneSet)) {
		const members = [...new Set(lane.flowNodeRefs)].filter((id) => nodes.has(id) && !placed.has(id))
		for (const id of members) placed.add(id)
		membersOf.set(lane.id, members)
	}
	// An unnamed lane holding nothing has nothing to say, and `lane x:` reads as prose.
	const lanes = leafLanes(source.laneSet).filter(
		(lane) => lane.name || (membersOf.get(lane.id) ?? []).length > 0,
	)
	const pools = (collaboration?.participants ?? []).filter((p) => p.processRef !== source.id)
	const named = [
		...lanes.map((lane) => ({ item: lane, kind: "lane" })),
		...pools.map((pool) => ({ item: pool, kind: "pool" })),
	]
	// Readable ids first, as for nodes.
	for (const { item, kind } of named) {
		if (READABLE_ID.test(item.id)) alias.set(item.id, aliasFor(item.id, item.name, kind, taken))
	}
	for (const { item, kind } of named) {
		if (!alias.has(item.id)) alias.set(item.id, aliasFor(item.id, item.name, kind, taken))
	}

	const lines: string[] = []
	for (const lane of lanes) {
		const list = (membersOf.get(lane.id) ?? []).map((id) => alias.get(id)).join(", ")
		lines.push(`lane ${alias.get(lane.id)}${bracketed(lane.name)}: ${list}`.trimEnd())
	}
	for (const pool of pools) lines.push(`pool ${alias.get(pool.id)}${bracketed(pool.name)}`)
	const poolIds = new Set(pools.map((pool) => pool.id))
	for (const flow of collaboration?.messageFlows ?? []) {
		const nodeToPool = nodes.has(flow.sourceRef) && poolIds.has(flow.targetRef)
		const poolToNode = poolIds.has(flow.sourceRef) && nodes.has(flow.targetRef)
		if (!nodeToPool && !poolToNode) continue
		const name = flow.name ? messageLabel(flow.name) : ""
		const arrow = name ? `>(${name})` : ">"
		lines.push(`msg ${alias.get(flow.sourceRef)} ${arrow} ${alias.get(flow.targetRef)}`)
	}
	return lines
}

function spec(element: CompactElement, host: string | undefined, container?: string): string {
	const word = KIND_WORDS.get(element.type) ?? "task"
	const trigger = element.eventType ? `:${element.eventType}` : ""
	const name = element.name ? ` ${writableName(element.name)}` : ""
	const attrs: string[] = []
	if (host !== undefined) attrs.push(`on=${host}`)
	if (container !== undefined) attrs.push(`inside=${container}`)
	if (element.interrupting === false) attrs.push("nonint")
	if (element.jobType) attrs.push(`job=${element.jobType}`)
	if (element.formId) attrs.push(`form=${element.formId}`)
	// Mapping values run to the next ` word=`, so they are written before result= and feel=
	for (const [direction, mappings] of [
		["in", element.inputs],
		["out", element.outputs],
	] as const) {
		for (const [target, source] of Object.entries(mappings ?? {})) {
			const written = `${direction}.${target}=${writableMapping(source)}`
			// A target with a space, or a value that reads back as another attribute, cannot be written
			const back = splitMappings(written)
			if (back.plain.trim() === "" && back.mappings.length === 1) attrs.push(written)
		}
	}
	if (element.script) {
		// Last: feel= takes the rest of the attributes
		if (element.resultVariable) attrs.push(`result=${element.resultVariable}`)
		attrs.push(`feel=${element.script.replace(/^=\s*/, "").replace(/\s+/g, " ")}`)
	}
	return `[${word}${trigger}${name}${attrs.length > 0 ? ` | ${attrs.join(" ")}` : ""}]`
}

function label(flow: CompactFlow): string {
	const name = flow.name ? writableLabel(flow.name) : ""
	if (flow.isDefault) return `>(${name ? `${name}: ` : ""}default) `
	if (flow.condition) return `>(${name}: ${writableCondition(flow.condition)}) `
	return name ? `>(${name}) ` : "> "
}

/**
 * Writes the {@link primaryProcess} of `definitions` in the line format, with
 * its leaf lanes, the other pools and their messages (see the module comment
 * for what is left out).
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
export function writeProcessText(
	definitions: BpmnDefinitions,
	options: WriteProcessTextOptions = {},
): WrittenProcessText {
	assertBpmnDefinitions(definitions, "writeProcessText")
	const source = primaryProcess(definitions)
	// compactify keeps the process order, so the index finds the compact twin.
	const process = source && compactify(definitions).processes[definitions.processes.indexOf(source)]
	if (!source || !process) return { text: "", aliases: {} }

	// What the format can write: flow nodes with a kind word, outside any event sub-process.
	const elements = process.elements.filter((el) => KIND_WORDS.has(el.type))
	const byId = new Map(elements.map((el) => [el.id, el]))
	const flows = process.flows.filter((f) => byId.has(f.from) && byId.has(f.to))
	const outgoing = new Map<string, CompactFlow[]>()
	for (const flow of flows) outgoing.set(flow.from, [...(outgoing.get(flow.from) ?? []), flow])

	// Tasks inside an ad-hoc sub-process: written on lines of their own, without flows.
	const inner = new Map<string, { element: CompactElement; container: string }>()
	for (const el of elements) {
		if (el.type !== "adHocSubProcess") continue
		for (const child of el.children?.elements ?? []) {
			if (KIND_WORDS.has(child.type) && child.type !== "boundaryEvent" && !byId.has(child.id)) {
				inner.set(child.id, { element: child, container: el.id })
			}
		}
	}

	const taken = new Set<string>()
	const alias = new Map<string, string>()
	// Readable ids first, so a name-derived alias never takes one of them.
	const named = [...elements, ...[...inner.values()].map((child) => child.element)]
	const nodeAlias = (el: CompactElement) =>
		aliasFor(el.id, el.name, KIND_WORDS.get(el.type) ?? "node", taken)
	for (const el of named) if (READABLE_ID.test(el.id)) alias.set(el.id, nodeAlias(el))
	for (const el of named) if (!alias.has(el.id)) alias.set(el.id, nodeAlias(el))

	const declared = new Set<string>()
	const ref = (id: string): string => {
		const el = byId.get(id)
		const written = alias.get(id) ?? id
		if (!el || declared.has(id)) return written
		declared.add(id)
		return `${written}${spec(el, el.attachedTo === undefined ? undefined : alias.get(el.attachedTo))}`
	}
	/** A task inside an ad-hoc sub-process, declared with `inside=` on a line of its own. */
	const inside = (id: string): string => {
		const child = inner.get(id)
		if (!child || declared.has(id)) return alias.get(id) ?? id
		declared.add(id)
		return `${alias.get(id)}${spec(child.element, undefined, alias.get(child.container))}`
	}

	const lines: string[] = []
	const camunda = platformVersion(definitions)
	if (process.name || camunda) {
		const title = process.name ? writableName(process.name) : ""
		lines.push(`#${title ? ` ${title}` : ""}${camunda ? ` | camunda=${camunda}` : ""}`)
	}
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

	for (const id of inner.keys()) lines.push(inside(id))
	lines.push(...swimlaneLines(definitions, source, byId, alias, taken))

	// Documentation, on one line like a note: it is the tool description of an agent's tool
	for (const el of named) {
		const text = el.documentation?.replace(/\s+/g, " ").trim()
		if (text) lines.push(`doc ${alias.get(el.id)}: ${text}`)
	}

	// A note names an element it is associated with; one tied to nothing the format writes has no line.
	const annotations = new Map((source.textAnnotations ?? []).map((a) => [a.id, a.text ?? ""]))
	for (const assoc of source.associations ?? []) {
		const [annotation, target] = annotations.has(assoc.targetRef)
			? [assoc.targetRef, assoc.sourceRef]
			: [assoc.sourceRef, assoc.targetRef]
		const text = (annotations.get(annotation) ?? "").replace(/\s+/g, " ").trim()
		// Nodes only: the alias map also holds lanes and pools, which have no note line.
		const written = byId.has(target) || inner.has(target) ? alias.get(target) : undefined
		if (annotations.has(annotation) && written !== undefined && text !== "") {
			lines.push(`note ${written}: ${text}`)
		}
	}

	if (options.connectorLine) {
		const real = new Map(source.flowElements.map((el) => [el.id, el] as const))
		for (const el of elements) {
			const element = real.get(el.id)
			const line = element && options.connectorLine(element, definitions)
			if (line) lines.push(`with ${alias.get(el.id) ?? el.id}: ${line}`)
		}
	}

	const aliases: Record<string, string> = {}
	for (const [id, written] of alias) aliases[written] = id
	return { text: lines.join("\n"), aliases }
}
