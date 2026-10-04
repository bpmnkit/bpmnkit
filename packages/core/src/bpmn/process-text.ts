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
import { CONNECTOR_LINE, type ConnectorLine, parseConnectorLine } from "./connector-line.js"

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
Events take a trigger: start:message end:error catch:timer boundary:error (timer message signal error escalation terminate conditional compensate cancel)
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

/**
 * A guess {@link parseProcessText} had to make, put as a question. Each answer
 * is a change request, written for a model to apply to the diagram.
 */
export interface ProcessTextQuestion {
	/** The element the guess is about. It may have been left out of the diagram. */
	elementId: string
	/** What was guessed, then the question. */
	text: string
	/** Ready answers. Empty when only the reader can say. */
	options: { label: string; change: string }[]
	/** The start of a change request for the reader to finish. */
	draft: string
}

/** What {@link parseProcessText} read. */
export interface ProcessTextResult {
	/** One process. Always valid input for `expand`. */
	diagram: CompactDiagram
	/** Text that was left out, with the line it came from. */
	problems: ProcessTextProblem[]
	/** What was added or changed to complete the diagram, e.g. a join gateway or a missing end event. */
	fixes: string[]
	/** The guesses behind the fixes that only the reader can confirm, in the order of the text. */
	questions: ProcessTextQuestion[]
	/**
	 * The `with` lines, each with the id of the element it configures. Not
	 * applied: `applyConnectorLines` from `@bpmnkit/core/connectors` writes them
	 * onto the expanded diagram.
	 */
	connectors: ConnectorRef[]
}

/** A `with` line, and the element it names in the diagram. */
export interface ConnectorRef extends ConnectorLine {
	elementId: string
}

export const KINDS: Record<string, BpmnElementType> = {
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
export const ALIASES: Record<string, BpmnElementType> = {
	event: "intermediateCatchEvent",
	parallel: "parallelGateway",
	exclusive: "exclusiveGateway",
	gateway: "exclusiveGateway",
	inclusive: "inclusiveGateway",
	decision: "businessRuleTask",
	dmn: "businessRuleTask",
	human: "userTask",
}

export const TRIGGERS = new Set([
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

export const EVENTS = new Set<BpmnElementType>([
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

/** A line that ends in an arrow, with or without a branch label: the path goes on below. */
const DANGLING = /\s*-{0,2}>\s*(\([^()]*\))?\s*$/

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
	// `pick > and`, `and > dispatch`: the kind written as if it were an id.
	const kind = KINDS[id.toLowerCase()] ?? ALIASES[id.toLowerCase()]
	if (kind !== undefined && GATEWAYS.has(kind)) return kind
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

/** A path line split into its parts. */
export interface PathTokens {
	/** The nodes in the order written, each with the bracket text it was declared with, if any. */
	refs: { id: string; spec?: string }[]
	/** The label of each arrow, between `refs[k]` and `refs[k + 1]`. */
	labels: (string | undefined)[]
	/** A parenthesised note after the last node, which carries no meaning. */
	note?: string
	/** Ids written with spaces (`call back[…]`), and the id each was read as. */
	joined?: { written: string; id: string }[]
	/** Ids whose bracket was never closed, read as closed where the name ends. */
	unclosed?: string[]
}

/**
 * Splits one complete path line (`a[kind Name] >(Label: cond) b > c`) into its
 * node references and arrow labels, or says where it stops making sense.
 *
 * Shared by {@link parseProcessText} and the change-script parser, so the two
 * read paths the same way.
 */
export function tokenizePath(text: string): PathTokens | { error: string } {
	const refs: PathTokens["refs"] = []
	const labels: PathTokens["labels"] = []
	const joined: NonNullable<PathTokens["joined"]> = []
	const unclosed: string[] = []
	let note: string | undefined
	let i = 0
	for (;;) {
		let id = ID.exec(text.slice(i))?.[0]
		if (id === undefined) return { error: `expected a node id at "${text.slice(i, i + 20)}"` }
		i += id.length
		// `call back[service …]`: words before a bracket are one id
		const words = /^((?: +[A-Za-z_][\w.-]*)+)(?= *\[)/.exec(text.slice(i))?.[1]
		if (words !== undefined) {
			const written = `${id}${words}`
			id = written.split(/ +/).join("_")
			joined.push({ written, id })
			i += words.length
		}
		let spec: string | undefined
		// `done-end [end Done]`: a space before the bracket still declares.
		const gap = /^ +\[/.exec(text.slice(i))
		if (gap) i += gap[0].length - 1
		if (text[i] === "[") {
			let end = matching(text, i, "[", "]")
			let after = end + 1
			if (end < 0) {
				// `start[start HR) > …` or `end[Page created` at the end of the line: the
				// bracket closes where its name plainly ends, before the next arrow
				const open = /^[^[\]]*?(?:\)(?=\s*-{0,2}>)|(?=\s+-{0,2}>)|$)/.exec(text.slice(i + 1))?.[0]
				if (open === undefined || open.trim() === "") return { error: `"${id}[" is not closed` }
				const closer = open.endsWith(")") ? 1 : 0
				end = i + 1 + open.length - closer
				after = i + 1 + open.length
				unclosed.push(id)
			}
			spec = text.slice(i + 1, end).trim()
			i = after
		}
		refs.push({ id, spec })

		while (text[i] === " ") i++
		if (i >= text.length) break
		// `gr[xor Reproducible?]   (ADDED)`: a note after the last node, most
		// often marking what a change added.
		const trailing = /^\([^()]*\)\s*$/.exec(text.slice(i))?.[0]
		if (trailing !== undefined) {
			note = trailing.trim()
			break
		}
		// `->` and `-->` are what a model reaches for from Mermaid; take them too.
		const arrow = /^-{0,2}>/.exec(text.slice(i))?.[0]
		if (arrow === undefined) return { error: `expected ">" at "${text.slice(i, i + 20)}"` }
		i += arrow.length
		let label: string | undefined
		if (text[i] === "(") {
			const end = matching(text, i, "(", ")")
			if (end < 0) return { error: "edge label is not closed" }
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
	const tokens: PathTokens = { refs, labels }
	if (note !== undefined) tokens.note = note
	if (joined.length > 0) tokens.joined = joined
	if (unclosed.length > 0) tokens.unclosed = unclosed
	return tokens
}

/**
 * Keeps a condition only if it is FEEL.
 *
 * Models write the branch they mean in prose as often as in FEEL
 * (`No: is not approved`). As an expression that fails at deploy time; as the
 * branch's label it still says what was meant, and the missing condition is
 * one the lint names and a reader can fill in.
 */
export function conditionOrLabel(edge: Pick<CompactFlow, "name" | "condition" | "isDefault">): {
	edge: Pick<CompactFlow, "name" | "condition" | "isDefault">
	problem?: string
} {
	if (edge.condition === undefined) return { edge }
	const prose = edge.condition.slice(1).trim()
	if (parseExpression(prose).errors.length === 0) return { edge }
	const { condition: _dropped, ...rest } = edge
	return {
		edge: { ...rest, name: edge.name ? `${edge.name}: ${prose}` : prose },
		problem: `condition "${prose}" is not FEEL; kept as the branch label`,
	}
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
	/** `with` lines, with the written id resolved to the node it meant when read. */
	readonly connectors: ConnectorRef[] = []
	/** Catch and boundary events written without a trigger, and made message events. */
	readonly guessedMessage = new Set<string>()
	title: string | undefined
	/** A line that ended in an arrow, waiting for the line that continues it. */
	private carry: { text: string; line: number } | undefined

	/** Reads one line. Returns whether it added anything. */
	line(raw: string, n: number): boolean {
		let text = raw.trim()
		if (this.carry !== undefined) {
			if (text === "") return false
			text = `${this.carry.text} ${text}`
			this.carry = undefined
		}
		if (text === "" || text.startsWith("```") || text.startsWith("//")) return false
		if (text.startsWith("#")) {
			if (this.title === undefined) this.title = text.replace(/^#+/, "").trim() || undefined
			return false
		}
		if (CONNECTOR_LINE.test(text)) {
			const connector = parseConnectorLine(text, n, this.problems)
			if (connector) {
				this.connectors.push({
					...connector,
					elementId: this.current.get(connector.id) ?? connector.id,
				})
			}
			return false
		}
		// `engineer[user Fix issue] >` then the next step on the next line: models
		// wrap a long path. The line is read once it is complete.
		if (DANGLING.test(text)) {
			this.carry = { text, line: n }
			return false
		}
		return this.read(text, n)
	}

	/** Reads a line still waiting for its continuation, without its last arrow. */
	finish(): boolean {
		const carry = this.carry
		if (carry === undefined) return false
		this.carry = undefined
		this.problems.push({
			line: carry.line,
			message: 'the line ends with ">" and nothing follows; read without it',
		})
		return this.read(carry.text.replace(DANGLING, ""), carry.line)
	}

	private read(text: string, n: number): boolean {
		// Parse the whole line before keeping any of it, so a line that fails half
		// way leaves nothing behind.
		const path = tokenizePath(text)
		if ("error" in path) return this.fail(n, path.error)
		if (path.note !== undefined) {
			this.problems.push({ line: n, message: `ignored the note "${path.note}"` })
		}
		for (const id of path.unclosed ?? []) {
			this.problems.push({
				line: n,
				message: `"${id}[" is not closed; closed it where its name ends`,
			})
		}
		for (const { written, id } of path.joined ?? []) {
			this.problems.push({ line: n, message: `"${written}" is not an id; read as "${id}"` })
		}
		const { refs, labels } = path

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

	/** {@link conditionOrLabel}, with its problem recorded against line `n`. */
	private feelOrLabel(
		edge: Pick<CompactFlow, "name" | "condition" | "isDefault">,
		n: number,
	): Pick<CompactFlow, "name" | "condition" | "isDefault"> {
		const { edge: kept, problem } = conditionOrLabel(edge)
		if (problem !== undefined) this.problems.push({ line: n, message: problem })
		return kept
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
			// `send[…] > send[post Slack message to #support]`: a name of several words
			// after an arrow is a second node, whatever its kind word
			const named = afterArrow && !spec.includes("=") && spec.trim().split(/\s+/).length >= 3
			if ((kind === undefined && !named) || (!afterArrow && kind !== "boundaryEvent")) {
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
			} else if (trigger === "link") {
				// A link event needs a link name and a partner, which this format cannot
				// write; in a path a model means a milestone by it.
				if (type === "intermediateCatchEvent") element.type = "intermediateThrowEvent"
				this.problems.push({
					line: n,
					message: `"${id}" cannot be a link event here; made it a plain event`,
				})
			} else {
				element.eventType = trigger
			}
		}
		if (label) element.name = label
		// A catch or boundary event waits for something, and cannot deploy without
		// saying what. Unnamed, it is most often a message: "Payment confirmed".
		// `queue[event catch Send to SQS]` is named for a call it makes, not for what it waits
		// for: it is a service task, as every call to an outside system is
		const call =
			element.type === "intermediateCatchEvent" && element.eventType === undefined
				? /^(?:(?:catch|throw|event)\s+)?((?:send|post|publish|call|notify|invoke|push|upload|create|update|delete|run|trigger)\b.*)$/i.exec(
						label ?? "",
					)?.[1]
				: undefined
		if (call !== undefined) {
			element.type = "serviceTask"
			element.name = call
			this.problems.push({
				line: n,
				message: `"${id}" is named for a call it makes, "${call}"; made it a service task`,
			})
		} else if (
			(element.type === "intermediateCatchEvent" || element.type === "boundaryEvent") &&
			element.eventType === undefined
		) {
			element.eventType = "message"
			this.guessedMessage.add(id)
			this.problems.push({
				line: n,
				message: `"${id}" waits for nothing in particular; made it a message event`,
			})
		}

		const node: Node = { element, line: n, spec }
		// `| on=pay | nonint`: a second bar is only another separator.
		for (const attr of attrs.split(/[\s,|]+/).filter(Boolean)) {
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

export function edgeLabel(
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

/** `"A", "B" and "C"` */
function listOf(items: string[]): string {
	return items.length < 2
		? (items[0] ?? "")
		: `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`
}

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
	// Asked once the names are final, so a question uses the names the diagram shows.
	const asks: { line: number; ask: () => ProcessTextQuestion }[] = []
	const nodes = new Map<string, Node>()
	for (const [id, node] of reader.nodes) {
		nodes.set(id, { ...node, element: { ...node.element } })
	}
	const taken = new Set(nodes.keys())
	const typeOf = (id: string) => nodes.get(id)?.element.type
	const nameOf = (id: string) => nodes.get(id)?.element.name ?? nameFromId(id)
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
				add(id, type, edge.line, GATEWAYS.has(type) ? undefined : nameFromId(id))
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
			const { type, name = nameFromId(id) } = node.element
			if (EVENTS.has(type) || GATEWAYS.has(type)) continue
			asks.push({
				line: node.line,
				ask: () => ({
					elementId: id,
					text: `"${name}" was left out: nothing leads to it. Where does it belong?`,
					options: [],
					draft: `Put "${name}" after `,
				}),
			})
		}
		edges = edges.filter((edge) => reached.has(edge.from) && reached.has(edge.to))

		// Ends: every path that stops elsewhere, including a boundary with nowhere to go.
		const addEnds = () => {
			for (const node of [...nodes.values()]) {
				const { id, type } = node.element
				if (type === "endEvent" || outOf(id).length > 0) continue
				const end = uniqueId(`${id}_end`, taken)
				const name = EVENTS.has(type) ? node.element.name : undefined
				add(end, "endEvent", node.line, name ?? "Process completed")
				edges.push({ from: id, to: end, line: node.line })
				fixes.push(`added end event "${end}" after "${id}"`)
			}
		}
		addEnds()

		// Exits: a loop with no way out never ends. Its last decision gets a branch
		// to an end event; the condition rules below give it a condition. A loop
		// with no decision in it (`and > it[task IT] > and`, parallel branches
		// drawn back into their own split) is not a loop anyone meant: its flows
		// back go, and each path then ends.
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
				if (stuck.length === 0) break
				const inStuck = new Set(stuck.map((node) => node.element.id))
				const backs = new Set<Edge>()
				const done = new Set<string>()
				const onPath = new Set<string>()
				const visit = (id: string) => {
					onPath.add(id)
					for (const edge of outOf(id)) {
						if (onPath.has(edge.to)) {
							if (inStuck.has(edge.to)) backs.add(edge)
						} else if (!done.has(edge.to)) visit(edge.to)
					}
					onPath.delete(id)
					done.add(id)
				}
				for (const node of nodes.values()) {
					if (node.element.type === "startEvent") visit(node.element.id)
				}
				for (const edge of backs) {
					problems.push({
						line: edge.line,
						message: `flow ${edge.from} > ${edge.to} loops with no way out; left out`,
					})
				}
				edges = edges.filter((edge) => !backs.has(edge))
				addEnds()
				if (backs.size > 0) continue
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
			asks.push({
				line: decision.line,
				ask: () => {
					const name = nameOf(id)
					return {
						elementId: id,
						text: `The loop at "${name}" had no way out, so one was added. When does it end?`,
						options: [],
						draft: `Leave the loop at "${name}" when `,
					}
				},
			})
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
				if (CONDITIONAL.has(node.element.type)) {
					// Most often a question the model asked and answered only one way.
					const name = node.element.name ?? `${nameFromId(id)}?`
					asks.push({
						line: node.line,
						ask: () => ({
							elementId: id,
							text: `"${name}" had only one way to go, so it was removed. What happens otherwise?`,
							options: [],
							draft: `At "${name}", otherwise `,
						}),
					})
				}
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
		// without saying so. Labelled branches are a decision. Unlabelled ones that
		// all wait, at least one on a catch event (`poll > timeout[catch:timer 5m]`,
		// `poll > get[receive Report]`), are a race: whichever happens first. Other
		// unlabelled ones run in parallel, which is what the flows mean in BPMN.
		for (const node of [...nodes.values()]) {
			const { id, type } = node.element
			const out = outOf(id)
			if (GATEWAYS.has(type) || out.length < 2) continue
			const decides = out.some((edge) => edge.condition !== undefined || edge.name !== undefined)
			const targets = out.map((edge) => nodes.get(edge.to)?.element)
			const races =
				!decides &&
				targets.every((t) => t?.type === "intermediateCatchEvent" || t?.type === "receiveTask") &&
				targets.some((t) => t?.type === "intermediateCatchEvent")
			const split = uniqueId(`${id}_split`, taken)
			const gatewayType = decides
				? "exclusiveGateway"
				: races
					? "eventBasedGateway"
					: "parallelGateway"
			const name = decides ? `${node.element.name ?? nameFromId(id)} outcome?` : undefined
			add(split, gatewayType, node.line, name)
			for (const edge of out) edge.from = split
			edges.push({ from: id, to: split, line: node.line })
			if (races) {
				// Camunda 8 waits on catch events only after an event-based gateway.
				for (const target of targets) {
					if (!target) continue
					if (target.type === "receiveTask") target.type = "intermediateCatchEvent"
					target.eventType ??= "message"
				}
			}
			const kind = decides ? "xor" : races ? "event" : "and"
			fixes.push(`split the flows out of "${id}" with ${kind} gateway "${split}"`)
			if (kind === "and") {
				// Read now: a join below may take a branch's place as its target.
				const targetIds = out.map((edge) => edge.to)
				asks.push({
					line: node.line,
					ask: () => {
						const name = nameOf(id)
						const branches = listOf(targetIds.map((to) => `"${nameOf(to)}"`))
						return {
							elementId: split,
							text: `After "${name}", ${branches} run at the same time. Is that right?`,
							options: [
								{
									label: "Only one of them",
									change: `After "${name}", only one of ${branches} happens: decide which with an xor gateway.`,
								},
								{
									label: "One after the other",
									change: `After "${name}", do ${branches} one after the other, not at the same time.`,
								},
							],
							draft: `After "${name}", `,
						}
					},
				})
			}
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
				const otherwise = pool.find((edge) => OTHERWISE.test(edge.name ?? ""))
				const chosen = otherwise ?? pool[pool.length - 1]
				if (chosen && otherwise === undefined) {
					// Read now: the loop below gives every other branch a label.
					const labels = new Map(out.map((edge) => [edge, edge.name?.split(":")[0]?.trim()]))
					asks.push({
						line: node.line,
						ask: () => {
							const name = nameOf(id)
							const label = (edge: Edge) => labels.get(edge) || nameOf(edge.to)
							return {
								elementId: id,
								text: `When no condition at "${name}" holds, it takes "${label(chosen)}". Is that the right fallback?`,
								options: out
									.filter((edge) => edge !== chosen)
									.map((edge) => ({
										label: label(edge),
										change: `At "${name}", make "${label(edge)}" the default branch.`,
									})),
								draft: `At "${name}", when nothing else holds, `,
							}
						},
					})
				}
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
			let madeUp = false
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
					madeUp = true
				}
				edge.name ??= edge.condition.replace(/^=\s*/, "")
			}
			if (madeUp) {
				asks.push({
					line: node.line,
					ask: () => {
						const name = nameOf(id)
						return {
							elementId: id,
							text: `"${name}" decides on "${variable}", a variable the diagram made up. What data decides it?`,
							options: [],
							draft: `At "${name}", decide on `,
						}
					},
				})
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

		for (const id of reader.guessedMessage) {
			const node = nodes.get(id)
			if (node?.element.eventType !== "message") continue
			asks.push({
				line: node.line,
				ask: () => {
					const name = nameOf(id)
					return {
						elementId: id,
						text: `"${name}" was written without a trigger, so it waits for a message. Is it something else?`,
						options: [
							{ label: "A timer", change: `"${name}" waits for a timer, not a message.` },
							{ label: "A signal", change: `"${name}" waits for a signal, not a message.` },
							{
								label: "Nothing",
								change: `"${name}" waits for nothing: make it a plain event, or the end.`,
							},
						],
						draft: `"${name}" waits for `,
					}
				},
			})
		}
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

	// A `with` line configures a node of the diagram; one whose node was left out, or
	// never written, has nothing to configure.
	const connectors: ConnectorRef[] = []
	for (const ref of reader.connectors) {
		if (nodes.has(ref.elementId)) connectors.push(ref)
		else if (final) {
			problems.push({
				line: ref.line,
				message: `"with ${ref.id}:" names no node of the diagram; ignored`,
			})
		}
	}

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
		questions: asks.sort((a, b) => a.line - b.line).map(({ ask }) => ask()),
		connectors,
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
	reader.finish()
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
			reader.finish()
			pending = ""
			return assemble(reader, true)
		},
	}
}
