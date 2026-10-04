/**
 * A change script: what a language model writes to change a diagram that
 * already exists, in the line format of {@link PROCESS_TEXT_GUIDE}.
 *
 * Writing the whole diagram again works for a draft of ten nodes. For a
 * diagram someone drew and shared, it costs output in proportion to the
 * diagram rather than to the change, and anything the line format cannot
 * express — lanes, data objects, the inside of a sub-process — would be lost
 * on the way back. A change script names only what changes, so what it does
 * not mention stays as it was by construction
 * (`doc/drop-ai-feedback-edits-analysis.md` §3).
 *
 * This module only reads the script. Resolving its ids against a diagram and
 * applying it is the editor's `applyProcessDelta`, which keeps the layout.
 *
 * @packageDocumentation
 */

import type { BpmnElementType } from "./bpmn-model.js"
import type { CompactFlow } from "./compact.js"
import { CONNECTOR_LINE, type ConnectorLine, parseConnectorLine } from "./connector-line.js"
import {
	ALIASES,
	KINDS,
	type ProcessTextProblem,
	TRIGGERS,
	edgeLabel,
	tokenizePath,
} from "./process-text.js"

/**
 * Kind words the writer uses for element types the line format cannot create.
 * A script may restate them on an existing node; it cannot declare a new one.
 */
export const FIXED_KINDS: Readonly<Record<string, BpmnElementType>> = {
	sub: "subProcess",
	adhoc: "adHocSubProcess",
	transaction: "transaction",
	complex: "complexGateway",
}

/**
 * How to write a change script — the part of a system prompt that teaches it,
 * after {@link PROCESS_TEXT_GUIDE}. A test parses its example and expects no
 * problems.
 */
export const PROCESS_DELTA_GUIDE = `Change script — write only what changes, one line each:
a > new[kind Name] > b    add nodes and flows; an existing node is written by its id only
a >(Label: condition) b   add a flow; restating an existing flow with a new label changes it
x[kind Name]              an existing id declared again changes its kind or name
- a > b                   remove the flow from a to b
- x                       remove node x and its flows
@2 x y                    feedback item 2 is answered by the changes to x and y
Rules:
- Use the ids of the diagram you were given. Never repeat a line that changes nothing.
- A new node written between two connected nodes (a > new > b) replaces the flow a > b.
- Removing a node with one way in and one way out joins the two.
- End with one @ line for each feedback item you answered.

Example:
check > second[user Second approval] > pay
review[user Review application]
- notify
@1 second
@2 review`

/** A node the script declares: a new one, or a change to an existing one. */
export interface DeltaNode {
	/** The id as written. */
	id: string
	/** The kind, when the declaration names one. Absent: a rename only. */
	type?: BpmnElementType
	/** The event trigger after `kind:`. */
	trigger?: string
	name?: string
	/** Boundary host, from `on=`. */
	on?: string
	/** Zeebe job type, from `job=`. */
	jobType?: string
	/** `nonint`: a non-interrupting boundary or start event. */
	interrupting?: false
	line: number
}

/** A flow the script adds, or restates with a new label. */
export interface DeltaFlow extends Pick<CompactFlow, "from" | "to" | "name" | "condition"> {
	isDefault?: true
	line: number
}

/** What {@link parseProcessDelta} read. Nothing is resolved against a diagram yet. */
export interface ProcessDelta {
	/** Declarations, in the order written. A node declared twice is kept once, first wins. */
	nodes: DeltaNode[]
	/** Flows, in the order written. */
	flows: DeltaFlow[]
	/** `- x` lines. */
	removedNodes: { id: string; line: number }[]
	/** `- a > b` lines, one entry per arrow. */
	removedFlows: { from: string; to: string; line: number }[]
	/** `@n` lines: the feedback item, and the ids the script says answer it. */
	addressed: { item: number; ids: string[]; line: number }[]
	/** `with` lines: connector configuration for a node, existing or new. */
	connectors: ConnectorLine[]
	/** Lines, or parts of lines, that were left out. */
	problems: ProcessTextProblem[]
}

/**
 * One id, or several separated by commas. Not by spaces: a model's prose bullet
 * ("- review is removed") would otherwise remove every word that is an id.
 */
const ID_LIST = /^[A-Za-z_][\w.-]*(\s*,\s*[A-Za-z_][\w.-]*)*$/

/** A line that ends in an arrow: the path goes on below, as in the line format. */
const DANGLING = /\s*-{0,2}>\s*(\([^()]*\))?\s*$/

/** Reads one declaration's bracket text. */
function readSpec(
	id: string,
	spec: string,
	line: number,
	problems: ProcessTextProblem[],
): DeltaNode {
	const node: DeltaNode = { id, line }
	const bar = spec.indexOf("|")
	const head = (bar < 0 ? spec : spec.slice(0, bar)).trim()
	const attrs = bar < 0 ? "" : spec.slice(bar + 1)
	const space = head.search(/\s/)
	const word = space < 0 ? head : head.slice(0, space)
	const [kindWord = "", trigger] = word.toLowerCase().split(":")
	const type = KINDS[kindWord] ?? ALIASES[kindWord] ?? FIXED_KINDS[kindWord]

	if (type === undefined) {
		// `review[Review application]`: no kind, so the whole head is the new name.
		if (head) node.name = head
	} else {
		node.type = type
		const name = space < 0 ? "" : head.slice(space + 1).trim()
		if (name) node.name = name
		if (trigger !== undefined) {
			if (TRIGGERS.has(trigger)) node.trigger = trigger
			else problems.push({ line, message: `unknown trigger "${trigger}" for "${id}"; ignored` })
		}
	}

	for (const attr of attrs.split(/[\s,|]+/).filter(Boolean)) {
		const [key, value] = attr.split("=", 2)
		if (key === "on" && value) node.on = value
		else if (key === "job" && value) node.jobType = value
		else if (key === "nonint" && value === undefined) node.interrupting = false
		else problems.push({ line, message: `unknown attribute "${attr}" on "${id}"; ignored` })
	}
	return node
}

/**
 * Reads a change script ({@link PROCESS_DELTA_GUIDE}).
 *
 * Never throws: what it cannot read is reported in `problems` and left out.
 * Ids are taken as written; whether they name anything is for the caller to
 * decide against the diagram the script was written for.
 */
export function parseProcessDelta(text: string): ProcessDelta {
	const delta: ProcessDelta = {
		nodes: [],
		flows: [],
		removedNodes: [],
		removedFlows: [],
		addressed: [],
		connectors: [],
		problems: [],
	}
	const declared = new Map<string, DeltaNode>()
	let carry: { text: string; line: number } | undefined

	const path = (raw: string, n: number) => {
		const tokens = tokenizePath(raw)
		if ("error" in tokens) {
			delta.problems.push({ line: n, message: tokens.error })
			return
		}
		if (tokens.note !== undefined) {
			delta.problems.push({ line: n, message: `ignored the note "${tokens.note}"` })
		}
		for (const id of tokens.unclosed ?? []) {
			delta.problems.push({
				line: n,
				message: `"${id}[" is not closed; closed it where its name ends`,
			})
		}
		for (const { written, id } of tokens.joined ?? []) {
			delta.problems.push({ line: n, message: `"${written}" is not an id; read as "${id}"` })
		}
		for (const ref of tokens.refs) {
			if (ref.spec === undefined) continue
			const node = readSpec(ref.id, ref.spec, n, delta.problems)
			const earlier = declared.get(ref.id)
			if (earlier) {
				delta.problems.push({
					line: n,
					message: `"${ref.id}" is already declared on line ${earlier.line}; ignored "${ref.spec}"`,
				})
				continue
			}
			declared.set(ref.id, node)
			delta.nodes.push(node)
		}
		tokens.labels.forEach((raw, k) => {
			const from = tokens.refs[k]?.id
			const to = tokens.refs[k + 1]?.id
			if (from === undefined || to === undefined) return
			// The condition is kept as written, FEEL or not: restating a flow in another
			// expression language must not change it. The applier checks a condition
			// it is about to write.
			const edge = edgeLabel(raw)
			const flow: DeltaFlow = { from, to, line: n }
			if (edge.name !== undefined) flow.name = edge.name
			if (edge.condition !== undefined) flow.condition = edge.condition
			if (edge.isDefault) flow.isDefault = true
			delta.flows.push(flow)
		})
	}

	const removal = (rest: string, n: number) => {
		if (ID_LIST.test(rest) && !rest.includes(">")) {
			for (const id of rest.split(/[\s,]+/).filter(Boolean)) {
				delta.removedNodes.push({ id, line: n })
			}
			return
		}
		if (!rest.includes(">")) {
			delta.problems.push({
				line: n,
				message: `expected "- <id>" or "- <id> > <id>" at "${rest.slice(0, 30)}"`,
			})
			return
		}
		const tokens = tokenizePath(rest)
		if ("error" in tokens) {
			delta.problems.push({ line: n, message: tokens.error })
			return
		}
		for (let k = 0; k + 1 < tokens.refs.length; k++) {
			const from = tokens.refs[k]?.id
			const to = tokens.refs[k + 1]?.id
			if (from !== undefined && to !== undefined) delta.removedFlows.push({ from, to, line: n })
		}
		if (tokens.refs.some((ref) => ref.spec !== undefined)) {
			delta.problems.push({ line: n, message: "a removal names ids only; ignored the brackets" })
		}
	}

	const lines = text.split(/\r?\n/)
	lines.forEach((raw, index) => {
		const n = index + 1
		let line = raw.trim()
		if (carry !== undefined) {
			if (line === "") return
			line = `${carry.text} ${line}`
			carry = undefined
		}
		if (line === "" || line.startsWith("```") || line.startsWith("//") || line.startsWith("#")) {
			return
		}
		if (line.startsWith("@")) {
			const match = /^@\s*(\d+)\s*:?\s*(.*)$/.exec(line)
			const item = match ? Number.parseInt(match[1] ?? "", 10) : Number.NaN
			if (!match || !Number.isFinite(item)) {
				delta.problems.push({ line: n, message: `expected "@<feedback number> <ids>"` })
				return
			}
			const ids = (match[2] ?? "").split(/[\s,]+/).filter((id) => /^[A-Za-z_][\w.-]*$/.test(id))
			delta.addressed.push({ item, ids, line: n })
			return
		}
		if (CONNECTOR_LINE.test(line)) {
			const connector = parseConnectorLine(line, n, delta.problems)
			if (connector) delta.connectors.push(connector)
			return
		}
		// `- x` removes; `-> x` is an arrow a model wrote at the start of a line.
		const removed = /^-(?![->])\s*(.*)$/.exec(line)
		if (removed) {
			removal((removed[1] ?? "").trim(), n)
			return
		}
		if (DANGLING.test(line)) {
			carry = { text: line, line: n }
			return
		}
		path(line, n)
	})
	if (carry !== undefined) {
		const { text: rest, line } = carry
		delta.problems.push({
			line,
			message: 'the line ends with ">" and nothing follows; read without it',
		})
		path(rest.replace(DANGLING, ""), line)
	}
	return delta
}
