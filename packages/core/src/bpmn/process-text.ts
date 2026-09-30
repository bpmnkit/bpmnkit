/**
 * A line format for a language model to write a process in.
 *
 * A model's time and cost are its output tokens, and a diagram as compact JSON
 * spends most of them on keys, quotes and ids nobody reads: flow ids, `"type":`,
 * `"from":`, the merge gateway every branch has to be routed into. This format
 * writes a path as `a > b > c`, declares a node inline the first time it is
 * used, and leaves ids, merges and the obvious gaps to {@link parseProcessText}
 * — about a quarter of the tokens of minified compact JSON on the repo's own
 * fixtures (`doc/drop-ai-generate-analysis.md` §2).
 *
 * Every line is a complete fact, so a diagram can be drawn while it is still
 * being written: {@link createProcessTextStream} reads lines as they finish.
 * JSON cannot do this without a brace scanner, and Workers AI's JSON mode cannot
 * stream at all.
 *
 * The parser never throws on its input. Anything it cannot use is reported as a
 * {@link ProcessTextProblem} and left out, and what it adds to complete the
 * diagram is listed in `fixes` — so the result always expands.
 *
 * @packageDocumentation
 */

import { parseExpression } from "@bpmnkit/feel"
import { slugify, uniqueId } from "../plan/slug.js"
import type { BpmnDefinitions, BpmnElementType } from "./bpmn-model.js"
import { expand } from "./compact.js"
import type { CompactDiagram, CompactElement, CompactFlow } from "./compact.js"

/**
 * How to write the format — the part of a system prompt that teaches it.
 *
 * It lives beside the parser so the two cannot drift: a test parses its example
 * and expects no problems.
 */
export const PROCESS_TEXT_GUIDE = `Format — one path per line, nothing else:
# Process name            (first line)
a > b > c                 sequence flow
id[kind Name]             declare a node the first time it appears; afterwards write only id
gw >(Label: condition) x  conditional branch, condition in FEEL (amount > 1000, status = "ok")
gw >(Label: default) y    branch taken when no condition holds
Kinds: start end task user service rule (DMN decision) send receive script manual call xor and or eventgw catch (wait for message or timer) throw boundary
Events take a trigger: start:message end:error catch:timer boundary:error (timer message signal error escalation terminate conditional compensate link cancel)
Attributes after |: on=<task id> (required on boundary), nonint (non-interrupting), job=<job type>
Rules:
- One start event. Every node is on a path from it to an end event: never a node nothing leads to.
- An xor has two or more branches: exactly one is (Label: default), each other has a FEEL condition.
- A boundary starts its own line, on a task you declared, and leads to a task that handles it; never draw an arrow into a boundary.
- Branches that meet again are joined automatically; join parallel branches with an and node.

Example:
# Expense approval
start[start Expense submitted] > check[xor Amount over 1000?]
check >(Yes: amount > 1000) review[user Review expense] > pay[service Pay expense] > done[end Expense paid]
check >(No: default) auto[service Approve automatically] > pay
failed[boundary:error Payment failed | on=pay] > notify[send Notify submitter] > notice[end Payment failed]`

/** A line, or part of one, that {@link parseProcessText} could not use. */
export interface ProcessTextProblem {
	/** 1-based line number in the text. */
	line: number
	message: string
}

/** What {@link parseProcessText} read. */
export interface ProcessTextResult {
	/** One process. Always valid input for `expand`. */
	diagram: CompactDiagram
	/** Text that was left out, with the line it came from. */
	problems: ProcessTextProblem[]
	/** What was added or changed to complete the diagram, e.g. a join gateway or a missing end event. */
	fixes: string[]
}

const KINDS: Record<string, BpmnElementType> = {
	start: "startEvent",
	end: "endEvent",
	task: "task",
	user: "userTask",
	service: "serviceTask",
	rule: "businessRuleTask",
	send: "sendTask",
	receive: "receiveTask",
	script: "scriptTask",
	manual: "manualTask",
	call: "callActivity",
	xor: "exclusiveGateway",
	and: "parallelGateway",
	or: "inclusiveGateway",
	eventgw: "eventBasedGateway",
	catch: "intermediateCatchEvent",
	throw: "intermediateThrowEvent",
	boundary: "boundaryEvent",
}

/**
 * Words models write for a kind instead of the one the guide teaches, taken
 * from the Drop benchmark's recorded answers. Accepted without a problem: the
 * meaning is plain, and teaching them would only lengthen the prompt.
 */
const ALIASES: Record<string, BpmnElementType> = {
	event: "intermediateCatchEvent",
	parallel: "parallelGateway",
	exclusive: "exclusiveGateway",
	gateway: "exclusiveGateway",
	inclusive: "inclusiveGateway",
	decision: "businessRuleTask",
	dmn: "businessRuleTask",
	human: "userTask",
}

const TRIGGERS = new Set([
	"timer",
	"message",
	"signal",
	"error",
	"escalation",
	"terminate",
	"conditional",
	"compensate",
	"link",
	"cancel",
])

const EVENTS = new Set<BpmnElementType>([
	"startEvent",
	"endEvent",
	"intermediateCatchEvent",
	"intermediateThrowEvent",
	"boundaryEvent",
])

const GATEWAYS = new Set<BpmnElementType>([
	"exclusiveGateway",
	"parallelGateway",
	"inclusiveGateway",
	"eventBasedGateway",
])

/** Gateways whose outgoing flows carry conditions, and so a default. */
const CONDITIONAL = new Set<BpmnElementType>(["exclusiveGateway", "inclusiveGateway"])

/** Task types that need a `zeebe:taskDefinition` to deploy; the id stands in when none is given. */
const JOB_TASKS = new Set<BpmnElementType>(["serviceTask", "sendTask"])

interface Node {
	element: CompactElement
	line: number
	/** The bracket text it was declared with, to tell a restatement from a new node. */
	spec: string
	/** Boundary host id, from `on=`. */
	on?: string
}

interface Edge extends Omit<CompactFlow, "id"> {
	line: number
}

const ID = /^[A-Za-z_][\w.-]*/

/**
 * Returns the index of the `close` that matches the `open` at `start`, or -1.
 * Quoted text is skipped, so a FEEL string holding a bracket does not end it.
 */
function matching(text: string, start: number, open: string, close: string): number {
	let depth = 0
	let quote = false
	for (let i = start; i < text.length; i++) {
		const ch = text[i]
		if (ch === '"') quote = !quote
		if (quote) continue
		if (ch === open) depth++
		else if (ch === close && --depth === 0) return i
	}
	return -1
}

/** The type a bare id suggests, for a node written without a kind or never declared. */
function typeFromId(id: string): BpmnElementType {
	if (/^start/i.test(id)) return "startEvent"
	if (/^(end|done|finish)/i.test(id)) return "endEvent"
	return "task"
}

/** `send_email` / `sendEmail` → "Send email": a readable name for a node the model never named. */
function nameFromId(id: string): string {
	const words = id
		.replace(/([a-z0-9])([A-Z])/g, "$1 $2")
		.replace(/[_.-]+/g, " ")
		.trim()
		.toLowerCase()
	return words.charAt(0).toUpperCase() + words.slice(1)
}

class Reader {
	readonly nodes = new Map<string, Node>()
	/**
	 * The node each written id means now. Models reuse an id for a second node
	 * (`done[end Approved]`, later `done[end Rejected]`); the second becomes
	 * `done_2`, and a bare `done` after it means the latest one.
	 */
	private readonly current = new Map<string, string>()
	/** Every node declared under each written id, oldest first. */
	private readonly declared = new Map<string, string[]>()
	private readonly taken = new Set<string>()
	readonly edges: Edge[] = []
	readonly problems: ProcessTextProblem[] = []
	title: string | undefined

	/** Reads one line. Returns whether it added anything. */
	line(raw: string, n: number): boolean {
		const text = raw.trim()
		if (text === "" || text.startsWith("```") || text.startsWith("//")) return false
		if (text.startsWith("#")) {
			if (this.title === undefined) this.title = text.replace(/^#+/, "").trim() || undefined
			return false
		}

		// Parse the whole line before keeping any of it, so a line that fails half
		// way leaves nothing behind.
		const refs: { id: string; spec?: string }[] = []
		const labels: (string | undefined)[] = []
		let i = 0
		for (;;) {
			const id = ID.exec(text.slice(i))?.[0]
			if (id === undefined) return this.fail(n, `expected a node id at "${text.slice(i, i + 20)}"`)
			i += id.length
			let spec: string | undefined
			// `done-end [end Done]`: a space before the bracket still declares.
			const gap = /^ +\[/.exec(text.slice(i))
			if (gap) i += gap[0].length - 1
			if (text[i] === "[") {
				const end = matching(text, i, "[", "]")
				if (end < 0) return this.fail(n, `"${id}[" is not closed`)
				spec = text.slice(i + 1, end).trim()
				i = end + 1
			}
			refs.push({ id, spec })

			while (text[i] === " ") i++
			if (i >= text.length) break
			// `->` and `-->` are what a model reaches for from Mermaid; take them too.
			const arrow = /^-{0,2}>/.exec(text.slice(i))?.[0]
			if (arrow === undefined) return this.fail(n, `expected ">" at "${text.slice(i, i + 20)}"`)
			i += arrow.length
			let label: string | undefined
			if (text[i] === "(") {
				const end = matching(text, i, "(", ")")
				if (end < 0) return this.fail(n, "edge label is not closed")
				label = text.slice(i + 1, end)
				i = end + 1
			}
			labels.push(label)
			while (text[i] === " ") i++
			// `gw >(No: default) > next`: a second arrow after the label.
			if (label !== undefined && text[i] === ">") {
				i++
				while (text[i] === " ") i++
			}
		}

		// Declarations and references resolve left to right, so a chain that
		// reuses an id (`task[A] > task[B]`) links the nodes in the order written.
		const ids = refs.map((ref, k) =>
			ref.spec !== undefined
				? this.declare(ref.id, ref.spec, n, k > 0)
				: (this.current.get(ref.id) ?? ref.id),
		)
		for (let k = 0; k < labels.length; k++) {
			const from = ids[k]
			const to = ids[k + 1]
			if (from !== undefined && to !== undefined) {
				this.edges.push({ from, to, line: n, ...this.feelOrLabel(edgeLabel(labels[k]), n) })
			}
		}
		return true
	}

	/**
	 * Keeps a condition only if it is FEEL.
	 *
	 * Models write the branch they mean in prose as often as in FEEL
	 * (`No: is not approved`). As an expression that fails at deploy time; as the
	 * branch's label it still says what was meant, and the missing condition is
	 * one the lint names and a reader can fill in.
	 */
	private feelOrLabel(
		edge: Pick<CompactFlow, "name" | "condition" | "isDefault">,
		n: number,
	): Pick<CompactFlow, "name" | "condition" | "isDefault"> {
		if (edge.condition === undefined) return edge
		const prose = edge.condition.slice(1).trim()
		if (parseExpression(prose).errors.length === 0) return edge
		this.problems.push({
			line: n,
			message: `condition "${prose}" is not FEEL; kept as the branch label`,
		})
		const { condition: _dropped, ...rest } = edge
		return { ...rest, name: edge.name ? `${edge.name}: ${prose}` : prose }
	}

	private fail(n: number, message: string): false {
		this.problems.push({ line: n, message })
		return false
	}

	/**
	 * Declares a node and returns the id it was stored under.
	 *
	 * @param afterArrow - Whether it follows a `>` on its line. A reused id there
	 * is the next step of a path (`check > done[end Rejected]`); at the start of a
	 * line it is the model revising a node it has already written.
	 */
	private declare(written: string, spec: string, n: number, afterArrow: boolean): string {
		const before = this.declared.get(written) ?? []
		// Restating a node is harmless; the same id for something else is a new node.
		const same = before.find((id) => this.nodes.get(id)?.spec.toLowerCase() === spec.toLowerCase())
		if (same !== undefined) {
			this.current.set(written, same)
			return same
		}
		const earlierId = before.at(-1)
		const earlier = earlierId === undefined ? undefined : this.nodes.get(earlierId)
		if (earlierId !== undefined && earlier) {
			// Only a real kind after an arrow, or a boundary, makes a second node.
			// `and[kind and]` or `ord[id=ord kind=start]` annotate the node already
			// there, and `validate[xor …] > …` restarts from it.
			const word = spec.split(/[\s|]/, 1)[0]?.toLowerCase().split(":")[0] ?? ""
			const kind = KINDS[word] ?? ALIASES[word]
			// A boundary is always new: it cannot be a revision of the task it sits on.
			if (kind === undefined || (!afterArrow && kind !== "boundaryEvent")) {
				this.problems.push({
					line: n,
					message: `"${written}" is already declared on line ${earlier.line}; ignored "${spec}"`,
				})
				return earlierId
			}
		}
		// Read before the id is remapped: in `pay[boundary:error … | on=pay]` the
		// host is the earlier `pay`.
		const meant = (ref: string) => this.current.get(ref) ?? ref
		const hostOf = new Map<string, string>()
		for (const match of spec.matchAll(/\bon=([\w.-]+)/g)) {
			if (match[1]) hostOf.set(match[1], meant(match[1]))
		}
		const id = uniqueId(written, this.taken)
		this.current.set(written, id)
		this.declared.set(written, [...before, id])
		if (earlier) {
			this.problems.push({
				line: n,
				message: `"${written}" on line ${earlier.line} is a different node; this one is "${id}"`,
			})
		}
		const bar = spec.indexOf("|")
		const head = (bar < 0 ? spec : spec.slice(0, bar)).trim()
		const attrs = bar < 0 ? "" : spec.slice(bar + 1)
		const space = head.search(/\s/)
		const kindWord = space < 0 ? head : head.slice(0, space)
		const name = space < 0 ? undefined : head.slice(space + 1).trim() || undefined
		const [kind = "", trigger] = kindWord.toLowerCase().split(":")

		let type = KINDS[kind] ?? ALIASES[kind]
		let label = name
		if (type === undefined) {
			// Most often the kind was left out (`start[Order placed]`): the whole
			// head is the name, and the id is the best remaining hint at the type.
			type = typeFromId(id)
			label = head || undefined
			this.problems.push({ line: n, message: `unknown kind "${kind}" for "${id}"; used ${type}` })
		}
		const element: CompactElement = { id, type }
		if (trigger !== undefined) {
			if (!EVENTS.has(type)) {
				this.problems.push({
					line: n,
					message: `"${kind}" takes no trigger; ignored ":${trigger}"`,
				})
			} else if (!TRIGGERS.has(trigger)) {
				// `start:order received` — a name written where the trigger goes. When the
				// name already says it (`start:kyc Start KYC`), the word is only noise.
				const word = kindWord.slice(kindWord.indexOf(":") + 1)
				const said = label?.toLowerCase().split(/\W+/).includes(trigger) ?? false
				if (!said) label = [word, label].filter(Boolean).join(" ")
				this.problems.push({
					line: n,
					message: `unknown trigger "${trigger}" for "${id}"; ${said ? "ignored, the name already says it" : "read as part of the name"}`,
				})
			} else {
				element.eventType = trigger
			}
		}
		if (label) element.name = label

		const node: Node = { element, line: n, spec }
		for (const attr of attrs.split(/[\s,]+/).filter(Boolean)) {
			const [key, value] = attr.split("=", 2)
			if (key === "on" && value) node.on = hostOf.get(value) ?? value
			else if (key === "job" && value) element.jobType = value
			else if (key === "nonint" && value === undefined) element.interrupting = false
			else
				this.problems.push({ line: n, message: `unknown attribute "${attr}" on "${id}"; ignored` })
		}
		this.nodes.set(id, node)
		return id
	}
}

function edgeLabel(
	label: string | undefined,
): Pick<CompactFlow, "name" | "condition" | "isDefault"> {
	if (label === undefined) return {}
	const colon = label.indexOf(":")
	const name = (colon < 0 ? label : label.slice(0, colon)).trim()
	const rest = colon < 0 ? "" : label.slice(colon + 1).trim()
	const out: Pick<CompactFlow, "name" | "condition" | "isDefault"> = {}
	if (name.toLowerCase() === "default" && rest === "") return { isDefault: true }
	if (name) out.name = name
	if (rest.toLowerCase() === "default") out.isDefault = true
	else if (rest) out.condition = rest.startsWith("=") ? rest : `= ${rest}`
	return out
}

/** Branch labels that read as "otherwise" — the branch a gateway should default to. */
const OTHERWISE =
	/^(no|not|else|otherwise|default|false|reject(ed)?|fail(ed|ure)?|invalid|denied|declined)\b/i

/** `Status approved?` → `statusApproved`: a FEEL variable name for the question a gateway asks. */
function variableFrom(text: string): string {
	const words = text
		.replace(/([a-z0-9])([A-Z])/g, "$1 $2")
		.split(/[^A-Za-z0-9]+/)
		.filter(Boolean)
		.map((word, k) => {
			const lower = word.toLowerCase()
			return k === 0 ? lower : lower.charAt(0).toUpperCase() + lower.slice(1)
		})
	const name = words.join("")
	return /^[A-Za-z_]/.test(name) ? name : `_${name}`
}

/**
 * Turns what the reader holds into a diagram `expand` accepts.
 *
 * `final` is false while the text is still arriving: an edge to a node not yet
 * declared is only waiting, so it is left out without a problem, and nothing is
 * added at the ends of paths that are still being written. Once final, the
 * result also keeps the modelling rules `lintDiagram` checks — see
 * {@link parseProcessText}.
 */
function assemble(reader: Reader, final: boolean): ProcessTextResult {
	const problems = [...reader.problems]
	const fixes: string[] = []
	const nodes = new Map<string, Node>()
	for (const [id, node] of reader.nodes) {
		nodes.set(id, { ...node, element: { ...node.element } })
	}
	const taken = new Set(nodes.keys())
	const typeOf = (id: string) => nodes.get(id)?.element.type
	const add = (id: string, type: BpmnElementType, line: number, name?: string) => {
		const element: CompactElement = name === undefined ? { id, type } : { id, type, name }
		nodes.set(id, { element, line, spec: "" })
	}

	// An id used in a flow but never declared (`review > pay`) would take every
	// flow on it down with it. Once the text is complete, it becomes a task named
	// from its id instead — while streaming it may yet be declared. An id only an
	// `on=` names is not added: nothing would lead to it.
	if (final) {
		for (const edge of reader.edges) {
			for (const id of [edge.from, edge.to]) {
				if (nodes.has(id)) continue
				const type = typeFromId(id)
				add(id, type, edge.line, nameFromId(id))
				taken.add(id)
				problems.push({ line: edge.line, message: `"${id}" is never declared; added as a ${type}` })
			}
		}
	}

	// Boundary events: a host that is an activity, in this process.
	for (const [id, node] of nodes) {
		if (node.element.type !== "boundaryEvent") continue
		const host = node.on === undefined ? undefined : nodes.get(node.on)
		const hostType = host?.element.type
		if (hostType !== undefined && !EVENTS.has(hostType) && !GATEWAYS.has(hostType)) {
			node.element.attachedTo = node.on
			continue
		}
		if (!final && node.on !== undefined && host === undefined) {
			nodes.delete(id) // host still to come
			continue
		}
		problems.push({
			line: node.line,
			message:
				node.on === undefined
					? `boundary "${id}" has no on=<task id>; left out`
					: host === undefined
						? `boundary "${id}" is on "${node.on}", which is never declared; left out`
						: `boundary "${id}" is on "${node.on}", which is not a task; left out`,
		})
		nodes.delete(id)
	}

	// A branch drawn into a boundary event (`check >(No) failed[boundary:error … |
	// on=pay] > notify`) means the path that boundary leads to. Nothing can flow
	// into a boundary, so the branch goes to its handler instead of being lost.
	const written = reader.edges.flatMap((edge) => {
		if (reader.nodes.get(edge.to)?.element.type !== "boundaryEvent") return [edge]
		const next = reader.edges.filter((out) => out.from === edge.to)
		if (next.length === 0) return [edge]
		if (final) {
			fixes.push(
				`led ${edge.from} > ${edge.to} to what the boundary leads to, since nothing flows into a boundary event`,
			)
		}
		return next.map((out) => ({ ...edge, to: out.to }))
	})

	// Edges: both ends declared, pointing a way BPMN allows, once.
	const seen = new Set<string>()
	let edges: Edge[] = []
	for (const edge of written) {
		const from = typeOf(edge.from)
		const to = typeOf(edge.to)
		if (from === undefined || to === undefined) {
			if (final) {
				const missing = from === undefined ? edge.from : edge.to
				const why = reader.nodes.has(missing) ? "was left out" : "is never declared"
				problems.push({
					line: edge.line,
					message: `"${missing}" ${why}; flow ${edge.from} > ${edge.to} left out`,
				})
			}
			continue
		}
		const wrong =
			from === "endEvent"
				? "an end event has no outgoing flow"
				: to === "startEvent"
					? "a start event has no incoming flow"
					: to === "boundaryEvent"
						? "a boundary event has no incoming flow"
						: edge.from === edge.to
							? "a flow cannot lead back to where it starts"
							: undefined
		if (wrong) {
			problems.push({
				line: edge.line,
				message: `${wrong}; flow ${edge.from} > ${edge.to} left out`,
			})
			continue
		}
		const key = `${edge.from}>${edge.to}`
		if (seen.has(key)) continue
		seen.add(key)
		edges.push({ ...edge })
	}

	// Defaults: only on a conditional gateway, at most one each.
	const defaulted = new Set<string>()
	for (const edge of edges) {
		if (!edge.isDefault) continue
		const from = typeOf(edge.from)
		if (from === undefined || !CONDITIONAL.has(from) || defaulted.has(edge.from)) {
			problems.push({
				line: edge.line,
				message: defaulted.has(edge.from)
					? `"${edge.from}" already has a default branch; this one is not the default`
					: `only an xor or or gateway has a default branch; ${edge.from} > ${edge.to} is not`,
			})
			edge.isDefault = undefined
			continue
		}
		defaulted.add(edge.from)
	}

	const outOf = (id: string) => edges.filter((edge) => edge.from === id)
	const into = (id: string) => edges.filter((edge) => edge.to === id)

	if (final) {
		// One blank start: a process that starts twice with no trigger to tell the
		// two apart is two processes. The later one goes, and what it led to is
		// placed as any path nothing leads to is, below.
		const blank = [...nodes.values()]
			.filter((node) => node.element.type === "startEvent" && node.element.eventType === undefined)
			.sort((a, b) => a.line - b.line)
		for (const extra of blank.slice(1)) {
			const id = extra.element.id
			nodes.delete(id)
			edges = edges.filter((edge) => edge.from !== id)
			problems.push({
				line: extra.line,
				message: `"${id}" is a second blank start event; left out`,
			})
		}

		// Start: one where none was written, and a start the model left unconnected
		// leads to the first path that has no way in.
		const roots = [...nodes.values()].filter(
			(node) =>
				node.element.type !== "startEvent" &&
				node.element.type !== "boundaryEvent" &&
				node.element.type !== "endEvent" &&
				into(node.element.id).length === 0,
		)
		const first = roots[0]?.element.id
		const starts = [...nodes.values()].filter((node) => node.element.type === "startEvent")
		if (starts.length === 0) {
			const start = uniqueId("start", taken)
			add(start, "startEvent", 0, "Process started")
			if (first) edges.unshift({ from: start, to: first, line: 0 })
			fixes.push(`added start event "${start}"${first ? ` before "${first}"` : ""}`)
		} else {
			const idle = starts.find((node) => outOf(node.element.id).length === 0)
			if (idle && first) {
				edges.push({ from: idle.element.id, to: first, line: idle.line })
				fixes.push(`connected start event "${idle.element.id}" to "${first}"`)
			}
		}

		// Reachability: every node lies on a path from a start event.
		const reach = () => {
			const reached = new Set<string>()
			const queue = [...nodes.values()]
				.filter((node) => node.element.type === "startEvent")
				.map((node) => node.element.id)
			for (let id = queue.shift(); id !== undefined; id = queue.shift()) {
				if (reached.has(id)) continue
				reached.add(id)
				for (const edge of outOf(id)) queue.push(edge.to)
				for (const node of nodes.values()) {
					if (node.element.attachedTo === id) queue.push(node.element.id)
				}
			}
			return reached
		}
		let reached = reach()
		// A task or gateway nothing leads to, written after a path that stops short,
		// is most often that path's next step with the arrow left out
		// (`… > label` then `gw[xor Done?] > dispatch`): it continues the latest
		// such path written before it. Events are not guessed at — a loose timer
		// or message could belong anywhere.
		for (const node of [...nodes.values()].sort((a, b) => a.line - b.line)) {
			const { id, type } = node.element
			if (reached.has(id) || EVENTS.has(type) || into(id).length > 0) continue
			const open = [...nodes.values()].filter(
				(other) =>
					reached.has(other.element.id) &&
					other.element.type !== "endEvent" &&
					other.line <= node.line &&
					outOf(other.element.id).length === 0,
			)
			const from = open.reduce<Node | undefined>(
				(latest, other) => (latest === undefined || other.line >= latest.line ? other : latest),
				undefined,
			)
			if (from === undefined) continue
			edges.push({ from: from.element.id, to: id, line: node.line })
			fixes.push(`connected "${from.element.id}" to "${id}", which nothing led to`)
			reached = reach()
		}
		// What is still unreached is a fragment the model never connected, and
		// drawing it loose is worse than leaving it out.
		for (const [id, node] of nodes) {
			if (reached.has(id)) continue
			problems.push({
				line: node.line,
				message: `"${id}" is not connected to a start event; left out`,
			})
			nodes.delete(id)
		}
		edges = edges.filter((edge) => reached.has(edge.from) && reached.has(edge.to))

		// Ends: every path that stops elsewhere, including a boundary with nowhere to go.
		for (const node of [...nodes.values()]) {
			const { id, type } = node.element
			if (type === "endEvent" || outOf(id).length > 0) continue
			const end = uniqueId(`${id}_end`, taken)
			const name = EVENTS.has(type) ? node.element.name : undefined
			add(end, "endEvent", node.line, name ?? "Process completed")
			edges.push({ from: id, to: end, line: node.line })
			fixes.push(`added end event "${end}" after "${id}"`)
		}

		// Exits: a loop with no way out never ends. Its last decision gets a branch
		// to an end event; the condition rules below give it a condition.
		for (;;) {
			const ends = new Set<string>()
			const queue = [...nodes.values()]
				.filter((node) => node.element.type === "endEvent")
				.map((node) => node.element.id)
			for (let id = queue.shift(); id !== undefined; id = queue.shift()) {
				if (ends.has(id)) continue
				ends.add(id)
				for (const edge of into(id)) queue.push(edge.from)
			}
			const stuck = [...nodes.values()].filter(
				(node) => !ends.has(node.element.id) && node.element.type !== "boundaryEvent",
			)
			const decision = stuck
				.filter((node) => CONDITIONAL.has(node.element.type))
				.sort((a, b) => b.line - a.line)[0]
			if (decision === undefined) {
				for (const node of stuck) {
					problems.push({
						line: node.line,
						message: `"${node.element.id}" is in a loop with no way out`,
					})
				}
				break
			}
			const id = decision.element.id
			const end = uniqueId(`${id}_end`, taken)
			add(end, "endEvent", decision.line, "Process completed")
			edges.push({ from: id, to: end, line: decision.line, name: "Otherwise" })
			fixes.push(`added an exit from the loop at "${id}" to end event "${end}"`)
		}

		// Pass-through gateways: one way in and one way out decides nothing. Most
		// often a question the model asked and then answered only one way.
		for (let removed = true; removed; ) {
			removed = false
			for (const [id, node] of nodes) {
				if (!GATEWAYS.has(node.element.type)) continue
				const [inEdge, ...moreIn] = into(id)
				const [outEdge, ...moreOut] = outOf(id)
				if (!inEdge || !outEdge || moreIn.length > 0 || moreOut.length > 0) continue
				if (inEdge.from === outEdge.to) continue
				const target = typeOf(outEdge.to)
				if (
					node.element.type === "eventBasedGateway" &&
					target !== "intermediateCatchEvent" &&
					target !== "receiveTask"
				) {
					// Waiting for one event is a catch event, not a race between events.
					node.element.type = "intermediateCatchEvent"
					node.element.eventType = "message"
					problems.push({
						line: node.line,
						message: `"${id}" waits for only one event; made it a message catch event`,
					})
					continue
				}
				inEdge.to = outEdge.to
				edges = edges.filter((edge) => edge !== outEdge)
				nodes.delete(id)
				problems.push({ line: node.line, message: `"${id}" has only one branch; gateway removed` })
				removed = true
			}
		}
		const once = new Set<string>()
		edges = edges.filter((edge) => {
			const key = `${edge.from}>${edge.to}`
			if (once.has(key)) return false
			once.add(key)
			return true
		})

		// Implicit splits: a task or event with several ways out forks the token
		// without saying so. Labelled branches are a decision; unlabelled ones run
		// in parallel, which is what the flows mean in BPMN.
		for (const node of [...nodes.values()]) {
			const { id, type } = node.element
			const out = outOf(id)
			if (GATEWAYS.has(type) || out.length < 2) continue
			const decides = out.some((edge) => edge.condition !== undefined || edge.name !== undefined)
			const split = uniqueId(`${id}_split`, taken)
			const gatewayType = decides ? "exclusiveGateway" : "parallelGateway"
			const name = decides ? `${node.element.name ?? nameFromId(id)} outcome?` : undefined
			add(split, gatewayType, node.line, name)
			for (const edge of out) edge.from = split
			edges.push({ from: id, to: split, line: node.line })
			fixes.push(
				`split the flows out of "${id}" with ${decides ? "xor" : "and"} gateway "${split}"`,
			)
		}
	}

	// Joins: branches that meet at anything but a join gateway meet at a join
	// gateway first. Camunda style keeps one incoming flow per task and one role
	// per gateway, and it is the piece of structure a model most often leaves out.
	// The join matches the split the branches came from: an xor join after a
	// parallel split would run what follows once per branch.
	const splitOf = (edge: Edge): string | undefined => {
		const visited = new Set<string>()
		for (let id = edge.from; !visited.has(id); ) {
			visited.add(id)
			if (GATEWAYS.has(typeOf(id) ?? "task") && outOf(id).length > 1) return id
			const [only, ...more] = into(id)
			if (!only || more.length > 0) return undefined
			id = only.from
		}
		return undefined
	}
	for (const [target, node] of [...nodes]) {
		const incoming = into(target)
		const type = node.element.type
		if (incoming.length < 2 || (GATEWAYS.has(type) && outOf(target).length < 2)) continue
		const splits = new Set(incoming.map(splitOf))
		const [split] = splits
		const splitType = splits.size === 1 && split !== undefined ? typeOf(split) : undefined
		const joinType =
			splitType === "parallelGateway" || splitType === "inclusiveGateway"
				? splitType
				: "exclusiveGateway"
		const join = uniqueId(`${target}_join`, taken)
		add(join, joinType, node.line)
		for (const edge of incoming) edge.to = join
		edges.push({ from: join, to: target, line: node.line })
		const kind =
			joinType === "parallelGateway" ? "and" : joinType === "inclusiveGateway" ? "or" : "xor"
		fixes.push(`joined ${incoming.length} flows into "${target}" with ${kind} gateway "${join}"`)
	}

	if (final) {
		// Conditions: every branch of a decision has a FEEL condition, or is its one
		// default; every other flow carries neither, nor a label that implies one.
		for (const [id, node] of nodes) {
			const out = outOf(id)
			if (!CONDITIONAL.has(node.element.type) || out.length < 2) {
				for (const edge of out) {
					if (edge.condition !== undefined) {
						fixes.push(`dropped the condition on ${id} > ${edge.to}, which is not a decision`)
					}
					edge.condition = undefined
					edge.isDefault = undefined
					edge.name = undefined
				}
				continue
			}
			if (!out.some((edge) => edge.isDefault)) {
				const plain = out.filter((edge) => edge.condition === undefined)
				const pool = plain.length > 0 ? plain : out
				const chosen = pool.find((edge) => OTHERWISE.test(edge.name ?? "")) ?? pool[pool.length - 1]
				if (chosen) {
					chosen.isDefault = true
					if (chosen.condition !== undefined) {
						chosen.condition = undefined
						fixes.push(
							`made ${id} > ${chosen.to} the default branch of "${id}" instead of its condition`,
						)
					} else {
						fixes.push(`made ${id} > ${chosen.to} the default branch of "${id}"`)
					}
				}
			}
			const variable = variableFrom(node.element.name ?? id)
			for (const edge of out) {
				if (edge.isDefault) {
					edge.condition = undefined
					continue
				}
				if (edge.condition === undefined) {
					// A branch the model described in prose, or not at all: a condition on
					// a variable named for the question keeps the gateway deployable and
					// says plainly which variable decides it.
					const label = (edge.name ?? nodes.get(edge.to)?.element.name ?? edge.to)
						.split(":")[0]
						?.trim()
						.replace(/"/g, "")
					edge.condition = /^(yes|true)\b/i.test(label ?? "")
						? `= ${variable} = true`
						: /^(no|false)\b/i.test(label ?? "")
							? `= ${variable} = false`
							: `= ${variable} = "${label}"`
					fixes.push(`gave ${id} > ${edge.to} the condition "${edge.condition}"`)
				}
				edge.name ??= edge.condition.replace(/^=\s*/, "")
			}
		}

		// Names: every event, task and decision says what it is.
		let named = 0
		for (const [id, node] of nodes) {
			const { element } = node
			if (element.name?.trim()) continue
			if (element.type === "parallelGateway" || element.type === "eventBasedGateway") continue
			if (GATEWAYS.has(element.type) && outOf(id).length < 2) continue
			element.name = GATEWAYS.has(element.type) ? `${nameFromId(id)}?` : nameFromId(id)
			named++
		}
		if (named > 0) fixes.push(`named ${named} unnamed element(s) from their ids`)
	}

	for (const node of nodes.values()) {
		if (JOB_TASKS.has(node.element.type) && node.element.jobType === undefined) {
			node.element.jobType = node.element.id
		}
		// A DMN task needs a decision to deploy; the id stands in, as it does for a job type.
		if (
			node.element.type === "businessRuleTask" &&
			node.element.jobType === undefined &&
			node.element.decisionId === undefined
		) {
			node.element.decisionId = node.element.id
		}
	}

	const processBase = reader.title ? slugify(reader.title) : "Process_1"
	const processId = uniqueId(
		/^[A-Za-z_]/.test(processBase) ? processBase : `Process_${processBase}`,
		taken,
	)
	let flowNumber = 0
	const flows: CompactFlow[] = edges.map(({ line: _line, ...edge }) => {
		let id: string
		do id = `Flow_${++flowNumber}`
		while (taken.has(id))
		taken.add(id)
		const flow: CompactFlow = { id, ...edge }
		for (const key of ["name", "condition", "isDefault"] as const) {
			if (flow[key] === undefined) delete flow[key]
		}
		return flow
	})

	return {
		diagram: {
			id: "Definitions_1",
			processes: [
				{
					id: processId,
					...(reader.title ? { name: reader.title } : {}),
					elements: [...nodes.values()].map((node) => node.element),
					flows,
				},
			],
		},
		problems: problems.sort((a, b) => a.line - b.line),
		fixes,
	}
}

/**
 * Reads a process written in the line format ({@link PROCESS_TEXT_GUIDE}).
 *
 * Never throws. The returned diagram always expands, and keeps the structural
 * rules `lintDiagram` checks; what could not be used is in `problems`, what was
 * added or changed to complete the diagram is in `fixes`:
 *
 * - flow ids are generated, and a repeated edge is written once;
 * - a missing start event is added before the first node without an incoming
 *   flow, and a start left unconnected leads there;
 * - every node lies on a path from a start event: a task or gateway nothing
 *   leads to continues the latest path written before it that stops short of
 *   an end event, and a fragment that still cannot be reached is left out,
 *   never drawn loose;
 * - an end event is added after every path that stops elsewhere;
 * - a gateway with one way in and one way out is removed;
 * - a task or event with several ways out gets a split gateway: xor when the
 *   branches are labelled, and otherwise parallel;
 * - branches meeting at a task, an event or a splitting gateway are joined
 *   first, by a gateway of the type they were split with;
 * - every decision has a default branch, and every other branch a FEEL
 *   condition — a prose one becomes a condition on a variable named for the
 *   gateway's question; flows out of anything else carry no condition or label;
 * - an unnamed event, task or decision is named from its id;
 * - a service or send task without `job=` uses its id as its job type, and a
 *   rule task its id as its decision id.
 *
 * @example
 * ```typescript
 * const { diagram, problems } = parseProcessText(modelOutput)
 * const xml = Bpmn.export(expand(diagram))
 * ```
 */
export function parseProcessText(text: string): ProcessTextResult {
	const reader = new Reader()
	text.split(/\r?\n/).forEach((line, index) => reader.line(line, index + 1))
	return assemble(reader, true)
}

/** A process read line by line as it arrives. See {@link createProcessTextStream}. */
export interface ProcessTextStream {
	/**
	 * Adds the next piece of text.
	 *
	 * @returns The diagram as it now stands, laid out, or `null` when the chunk
	 * completed no line that added anything.
	 */
	push(chunk: string): BpmnDefinitions | null
	/** Reads the last, unterminated line and returns the finished result, as {@link parseProcessText}. */
	end(): ProcessTextResult
}

/**
 * Reads the line format while it is being written, for a live preview.
 *
 * Only complete lines are read, so every frame is built from whole facts. A
 * frame leaves out edges whose far end has not been declared yet and adds no
 * start or end events; {@link ProcessTextStream.end} applies the full
 * {@link parseProcessText} rules.
 *
 * @example
 * ```typescript
 * const stream = createProcessTextStream()
 * for await (const chunk of tokens) {
 *   const defs = stream.push(chunk)
 *   if (defs) render(defs)
 * }
 * const { diagram, problems } = stream.end()
 * ```
 */
export function createProcessTextStream(): ProcessTextStream {
	const reader = new Reader()
	let pending = ""
	let lineNumber = 0

	return {
		push(chunk: string): BpmnDefinitions | null {
			pending += chunk
			let changed = false
			for (let nl = pending.indexOf("\n"); nl >= 0; nl = pending.indexOf("\n")) {
				changed = reader.line(pending.slice(0, nl), ++lineNumber) || changed
				pending = pending.slice(nl + 1)
			}
			if (!changed || reader.nodes.size === 0) return null
			return expand(assemble(reader, false).diagram)
		},
		end(): ProcessTextResult {
			if (pending !== "") reader.line(pending, ++lineNumber)
			pending = ""
			return assemble(reader, true)
		},
	}
}
