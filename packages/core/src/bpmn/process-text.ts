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
Branches that meet again are joined automatically; join parallel branches with an and node.

Example:
# Expense approval
start[start Expense submitted] > check[xor Amount over 1000?]
check >(Yes: amount > 1000) review[user Review expense] > pay[service Pay expense] > done[end Expense paid]
check >(No: default) auto[service Approve automatically] > pay
failed[boundary:error Payment failed | on=pay] > notice[end:error Failure notified]`

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

class Reader {
	readonly nodes = new Map<string, Node>()
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
		}

		for (const ref of refs) if (ref.spec !== undefined) this.declare(ref.id, ref.spec, n)
		for (let k = 0; k < labels.length; k++) {
			const from = refs[k]?.id
			const to = refs[k + 1]?.id
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

	private declare(id: string, spec: string, n: number): void {
		const earlier = this.nodes.get(id)
		if (earlier) {
			this.problems.push({
				line: n,
				message: `"${id}" is already declared on line ${earlier.line}; the first declaration is kept`,
			})
			return
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
			type = /^start/i.test(id)
				? "startEvent"
				: /^(end|done|finish)/i.test(id)
					? "endEvent"
					: "task"
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
				// `start:order received` — a name written where the trigger goes.
				label = [kindWord.slice(kindWord.indexOf(":") + 1), label].filter(Boolean).join(" ")
				this.problems.push({
					line: n,
					message: `unknown trigger "${trigger}" for "${id}"; read as part of the name`,
				})
			} else {
				element.eventType = trigger
			}
		}
		if (label) element.name = label

		const node: Node = { element, line: n }
		for (const attr of attrs.split(/[\s,]+/).filter(Boolean)) {
			const [key, value] = attr.split("=", 2)
			if (key === "on" && value) node.on = value
			else if (key === "job" && value) element.jobType = value
			else if (key === "nonint" && value === undefined) element.interrupting = false
			else
				this.problems.push({ line: n, message: `unknown attribute "${attr}" on "${id}"; ignored` })
		}
		this.nodes.set(id, node)
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

/**
 * Turns what the reader holds into a diagram `expand` accepts.
 *
 * `final` is false while the text is still arriving: an edge to a node not yet
 * declared is only waiting, so it is left out without a problem, and nothing is
 * added at the ends of paths that are still being written.
 */
function assemble(reader: Reader, final: boolean): ProcessTextResult {
	const problems = [...reader.problems]
	const fixes: string[] = []
	const nodes = new Map<string, Node>()
	for (const [id, node] of reader.nodes) {
		nodes.set(id, { ...node, element: { ...node.element } })
	}
	const taken = new Set(nodes.keys())

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
					: `boundary "${id}" is on "${node.on}", which is not a task; left out`,
		})
		nodes.delete(id)
	}

	// Edges: both ends declared, pointing a way BPMN allows, once.
	const seen = new Set<string>()
	const edges: Edge[] = []
	for (const edge of reader.edges) {
		const from = nodes.get(edge.from)?.element.type
		const to = nodes.get(edge.to)?.element.type
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
		const from = nodes.get(edge.from)?.element.type
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

	// Joins: branches that meet at anything but a gateway meet at an xor first.
	// Camunda style keeps one incoming flow per task, and it is the one piece of
	// structure a model most often leaves out.
	const incoming = new Map<string, Edge[]>()
	for (const edge of edges) incoming.set(edge.to, [...(incoming.get(edge.to) ?? []), edge])
	for (const [target, into] of incoming) {
		const type = nodes.get(target)?.element.type
		if (into.length < 2 || type === undefined || GATEWAYS.has(type)) continue
		const join = uniqueId(`${target}_join`, taken)
		const after = nodes.get(target)?.line ?? 0
		nodes.set(join, { element: { id: join, type: "exclusiveGateway" }, line: after })
		for (const edge of into) edge.to = join
		edges.push({ from: join, to: target, line: after })
		fixes.push(`joined ${into.length} flows into "${target}" with xor gateway "${join}"`)
	}

	if (final) {
		// A conditional split with exactly one unconditioned branch: that branch is the default.
		for (const [id, node] of nodes) {
			if (!CONDITIONAL.has(node.element.type) || defaulted.has(id)) continue
			const out = edges.filter((edge) => edge.from === id)
			const plain = out.filter((edge) => edge.condition === undefined)
			const only = plain[0]
			if (out.length > 1 && plain.length === 1 && only) {
				only.isDefault = true
				fixes.push(`made ${id} > ${only.to} the default branch of "${id}"`)
			}
		}

		const hasIncoming = new Set(edges.map((edge) => edge.to))
		const hasOutgoing = new Set(edges.map((edge) => edge.from))
		if (![...nodes.values()].some((node) => node.element.type === "startEvent")) {
			const first = [...nodes.values()].find(
				(node) => node.element.type !== "boundaryEvent" && !hasIncoming.has(node.element.id),
			)
			const start = uniqueId("start", taken)
			nodes.set(start, { element: { id: start, type: "startEvent" }, line: 0 })
			if (first) {
				edges.unshift({ from: start, to: first.element.id, line: 0 })
				hasOutgoing.add(start)
			}
			fixes.push(`added start event "${start}"${first ? ` before "${first.element.id}"` : ""}`)
		}
		for (const node of [...nodes.values()]) {
			const { id, type } = node.element
			if (type === "endEvent" || hasOutgoing.has(id)) continue
			const end = uniqueId(`${id}_end`, taken)
			nodes.set(end, { element: { id: end, type: "endEvent" }, line: node.line })
			edges.push({ from: id, to: end, line: node.line })
			fixes.push(`added end event "${end}" after "${id}"`)
		}
	}

	for (const node of nodes.values()) {
		if (JOB_TASKS.has(node.element.type) && node.element.jobType === undefined) {
			node.element.jobType = node.element.id
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
		return { id, ...edge }
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
 * Never throws. The returned diagram always expands; what could not be used is
 * in `problems`, what was added to complete the diagram is in `fixes`:
 *
 * - flow ids are generated, and a repeated edge is written once;
 * - branches meeting at a task or event are joined by an xor gateway first;
 * - a conditional split with one unconditioned branch makes it the default;
 * - a missing start event is added before the first node without an incoming
 *   flow, and an end event after every path that stops elsewhere;
 * - a service or send task without `job=` uses its id as its job type.
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
