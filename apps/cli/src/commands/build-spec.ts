/**
 * The `casen build` text spec: the core line format (`PROCESS_TEXT_GUIDE`) plus
 * pools, lanes, message flows, data objects and form fields, so a whole
 * collaboration is one short file a model can write in one go.
 *
 * Each pool section is read by `parseProcessText`; this module only adds what
 * the line format has no syntax for, on the expanded model.
 */
import {
	type BpmnAssociation,
	type BpmnDefinitions,
	type BpmnFlowElement,
	type BpmnLane,
	type BpmnMessageFlow,
	type BpmnParticipant,
	type BpmnProcess,
	type BpmnSequenceFlow,
	type BpmnTextAnnotation,
	type CompactDiagram,
	type CompactElement,
	type CompactProcess,
	applyAutoLayout,
	createFlowElement,
	expand,
	parseProcessText,
} from "@bpmnkit/core"

/** The guide `casen build --help` and the agent card show. */
export const BUILD_SPEC_GUIDE = `# Title | id=<process id> camunda=8.10   first line; one pool = one process
<line format paths>                     a > b[user Review | form=f fields=amount:number,ok:checkbox] > c
## Pool name | id=<process id>          starts a pool (its own process); "| blackbox" = partner without a process
### Lane name                           nodes declared after it go in this lane
a ~> b: label                           message flow; a/b = node ids or pool ids
d[object Name] ..> task                 data input; task ..> d[store Name] = data output (objects = collection)
sp[sub Name] > …  then  sp {            expanded sub-process: its body paths up to a line "}"
n[annotation Text]                      text annotation; n[annotation Text] ..> task links it
start:condition / catch:condition       conditional event: cond=<FEEL> (last)`

export interface SpecBuild {
	definitions: BpmnDefinitions
	/** `fields=` per user task id, for `attachUserTaskForms`. */
	fields: Record<string, string>
	/** What was written but could not be used; the build should fail on any. */
	problems: string[]
	/** What the parser added to complete the model (ends, joins, ids). */
	fixes: string[]
}

interface Section {
	name: string
	id: string
	blackbox: boolean
	/** 1-based line of the `##` header (0 for the implicit single section). */
	header: number
	/** Line-format text, with consumed lines blanked so line numbers stay aligned. */
	lines: string[]
	lanes: { id: string; name: string; nodes: string[] }[]
	/** The lane the next declared nodes go in: the last `###` read. */
	lane?: { id: string; name: string; nodes: string[] }
	data: { line: number; text: string }[]
	/** `id {` … `}` bodies of the sub-processes declared in this pool. */
	blocks: Block[]
	annotations: Annotation[]
}

/** The body of a sub-process: `sp {`, its path lines, `}`. */
interface Block {
	id: string
	line: number
	parent?: Block
	/** Line-format text by line number, like {@link Section.lines}. */
	lines: string[]
}

interface Annotation {
	id: string
	text: string
}

/** A `..>` line with a text annotation at one end, and the pool it was written in. */
interface AnnotationLink {
	line: number
	text: string
	section?: Section
}

const MESSAGE_LINE = /^(\S+)\s*~>\s*(\S+?)\s*(?::\s*(.*))?$/
const DATA_ARROW = /\s*\.\.>\s*/
const DATA_NODE = /^([A-Za-z_][\w.-]*)(?:\[(object|objects|store)\s*([^\]]*)\])?$/
const DECLARATION = /([A-Za-z_][\w.-]*)\[([^\]]*)\]/g
const ANNOTATION = /^([A-Za-z_][\w.-]*)\[annotation\b\s*([^\]]*)\]$/
/** The node a `… {` line opens the body of: its last id, declared or not. */
const BLOCK_OPEN = /([A-Za-z_][\w.-]*)(?:\[[^\]]*\])?$/
/** A literal ISO 8601 date or date-time: all a timer start event can be given. */
const ISO_DATE = /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:?\d{2})?)?$/

/** A readable NCName: `Expense approval` → `expense-approval`. */
export function specId(name: string): string {
	const id = name
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9_.]+/g, "-")
		.replace(/^-+|-+$/g, "")
	return /^[a-z_]/.test(id) ? id : `p-${id || "process"}`
}

/** Splits `Name | id=x blackbox camunda=8.10` into the name and its attributes. */
function header(text: string): { name: string; attrs: Map<string, string> } {
	const [name = "", ...rest] = text.split("|")
	const attrs = new Map<string, string>()
	for (const word of rest.join(" ").split(/\s+/).filter(Boolean)) {
		const [key = "", value = ""] = word.split("=", 2)
		attrs.set(key, value)
	}
	return { name: name.trim(), attrs }
}

/** Declared node ids in a path line, in order, ignoring branch labels `>(…)`. */
function declaredIds(line: string): string[] {
	const plain = line.replace(/>\([^)]*\)/g, ">")
	return [...plain.matchAll(DECLARATION)].map((m) => m[1] ?? "")
}

/** Pulls `fields=` out of node declarations: the line format does not know it. */
function takeFields(line: string, fields: Record<string, string>): string {
	return line.replace(DECLARATION, (whole, id: string, body: string) => {
		const match = /(?:^|\s|\|)fields=(\S+)/.exec(body)
		if (match === null) return whole
		fields[id] = match[1] ?? ""
		const rest = body
			.replace(/fields=\S+/, "")
			.replace(/\|\s*$/, "")
			.trimEnd()
		return `${id}[${rest}]`
	})
}

/**
 * Rewrites what the spec adds to the line format into words `parseProcessText`
 * knows: `sub` (an expanded sub-process, typed once its body is attached),
 * `:condition` and `cond=`. Rejects a timer start `at=` that is not a literal date.
 */
function normalize(line: string, n: number, subs: Set<string>, problems: string[]): string {
	return line.replace(DECLARATION, (_whole, id: string, raw: string) => {
		let body = raw
			.trimStart()
			.replace(/^(start|catch|boundary):condition\b(?!al)/, "$1:conditional")
			.replace(/(^|[\s|,])cond=/, "$1feel=")
		if (/^sub(?:\s|\||$)/.test(body)) {
			subs.add(id)
			body = `task${body.slice(3)}`
		}
		const at = /^start:timer\b.*?(?:^|[\s|,])at=(\S+)/.exec(body)?.[1]
		if (at !== undefined && !ISO_DATE.test(at))
			problems.push(
				`line ${n}: "${id}" at=${at}: a timer start takes a literal date-time (at=2026-01-31T09:00:00Z); for a date from a variable, start plainly and wait with catch:timer at==<FEEL>`,
			)
		return `${id}[${body}]`
	})
}

/** One line for a kind the reader does not know, with the way out. */
function unsupported(message: string): string {
	const m = /^unknown kind "([^"]*)" for "([^"]*)"; used \w+$/.exec(message)
	return m === null
		? message
		: `"${m[2]}": kind "${m[1]}" is not in the text spec (kinds: casen build --help); write a builder module (.mjs) instead, see the card's "Not in the text spec"`
}

function* walk(elements: readonly BpmnFlowElement[]): Generator<BpmnFlowElement> {
	for (const el of elements) {
		yield el
		if ("flowElements" in el && Array.isArray(el.flowElements)) yield* walk(el.flowElements)
	}
}

/** The flow-element list that holds `id` (a process's, or a sub-process's). */
function scopeOf(elements: BpmnFlowElement[], id: string): BpmnFlowElement[] | undefined {
	for (const el of elements) {
		if (el.id === id) return elements
		if ("flowElements" in el && Array.isArray(el.flowElements)) {
			const inner = scopeOf(el.flowElements as BpmnFlowElement[], id)
			if (inner) return inner
		}
	}
	return undefined
}

function compactIds(process: CompactProcess): Set<string> {
	const ids = new Set<string>([process.id])
	const visit = (elements: CompactElement[], flows: { id: string }[]) => {
		for (const e of elements) {
			ids.add(e.id)
			if (e.children) visit(e.children.elements, e.children.flows)
		}
		for (const f of flows) ids.add(f.id)
	}
	visit(process.elements, process.flows)
	return ids
}

/** Renames ids of `process` that `taken` already holds: ids are global in one file. */
function renameCollisions(process: CompactProcess, taken: Set<string>, fixes: string[]): void {
	const renamed = new Map<string, string>()
	for (const id of compactIds(process)) {
		if (id === process.id || !taken.has(id)) continue
		let next = `${process.id}_${id}`
		for (let n = 2; taken.has(next); n++) next = `${process.id}_${id}_${n}`
		renamed.set(id, next)
		fixes.push(`"${id}" is used in another pool; renamed to "${next}" in ${process.id}`)
	}
	const to = (id: string) => renamed.get(id) ?? id
	const visit = (elements: CompactElement[], flows: { id: string; from: string; to: string }[]) => {
		for (const e of elements) {
			e.id = to(e.id)
			if (e.attachedTo) e.attachedTo = to(e.attachedTo)
			if (e.children) visit(e.children.elements, e.children.flows)
		}
		for (const f of flows) {
			f.id = to(f.id)
			f.from = to(f.from)
			f.to = to(f.to)
		}
	}
	visit(process.elements, process.flows)
	for (const note of process.notes ?? []) note.elementId = to(note.elementId)
	for (const id of compactIds(process)) taken.add(id)
}

/**
 * Compiles a `casen build` text spec into a laid-out model. The model is not
 * gated: `Bpmn.export` does that, with one line per problem.
 */
export function compileTextSpec(text: string): SpecBuild {
	const problems: string[] = []
	const fixes: string[] = []
	const fields: Record<string, string> = {}
	const raw = text.split(/\r?\n/)

	let title: { name: string; attrs: Map<string, string> } | undefined
	const sections: Section[] = []
	const messageLines: { line: number; text: string }[] = []
	/** Annotations written before the first pool: on the collaboration, or the only process. */
	const loose: Annotation[] = []
	const links: AnnotationLink[] = []
	const subs = new Set<string>()
	const newSection = (name: string, attrs: Map<string, string>, line: number): Section => ({
		name,
		id: attrs.get("id") || specId(name),
		blackbox: attrs.has("blackbox"),
		header: line,
		lines: [],
		lanes: [],
		data: [],
		blocks: [],
		annotations: [],
	})
	let current: Section | undefined
	let block: Block | undefined
	const ensureSection = (): Section => {
		if (current === undefined) {
			current = newSection(title?.name ?? "Process", title?.attrs ?? new Map(), 0)
			sections.push(current)
		}
		return current
	}
	const closeBlocks = () => {
		for (; block !== undefined; block = block.parent)
			problems.push(`line ${block.line}: "${block.id} {" is not closed; end the body with "}"`)
	}

	/** One path, message, data or annotation line, in the current pool and body. */
	const take = (line: string, n: number) => {
		const annotation = ANNOTATION.exec(line)
		if (annotation !== null) {
			const list = current?.annotations ?? loose
			list.push({ id: annotation[1] ?? "", text: (annotation[2] ?? "").trim() })
			return
		}
		if (line.includes("~>")) {
			messageLines.push({ line: n, text: line })
			return
		}
		if (line.includes("..>") && /\[annotation\b/.test(line)) {
			links.push({ line: n, text: line, section: current })
			return
		}
		const section = ensureSection()
		if (line.includes("..>")) {
			section.data.push({ line: n, text: line })
			return
		}
		const kept = takeFields(normalize(line, n, subs, problems), fields)
		if (block !== undefined) {
			block.lines[n] = kept
			return
		}
		section.lane?.nodes.push(...declaredIds(kept))
		section.lines[n] = kept
	}

	raw.forEach((rawLine, index) => {
		const n = index + 1
		const line = rawLine.trim()
		if (line === "}") {
			if (block === undefined) problems.push(`line ${n}: "}" closes no "id {" body`)
			else block = block.parent
			return
		}
		if (line.startsWith("###")) {
			closeBlocks()
			const section = ensureSection()
			const { name } = header(line.slice(3))
			const id = `Lane_${specId(name)}`
			section.lane = section.lanes.find((l) => l.id === id)
			if (section.lane === undefined) {
				section.lane = { id, name, nodes: [] }
				section.lanes.push(section.lane)
			}
			return
		}
		if (line.startsWith("##")) {
			closeBlocks()
			const { name, attrs } = header(line.slice(2))
			current = newSection(name, attrs, n)
			sections.push(current)
			return
		}
		if (line.startsWith("#")) {
			if (title === undefined && current === undefined) title = header(line.slice(1))
			return
		}
		if (line === "" || line.startsWith("//")) return
		if (line.endsWith("{")) {
			// `sp {` alone, or `a > sp[sub Name] {`: the path, then the body of its last node.
			const before = line.slice(0, -1).trim()
			const id = BLOCK_OPEN.exec(before)?.[1]
			if (id === undefined) {
				problems.push(`line ${n}: write a sub-process body as "<id> {" on its own line`)
				return
			}
			if (before !== id) take(before, n)
			const section = ensureSection()
			block = { id, line: n, parent: block, lines: [] }
			section.blocks.push(block)
			return
		}
		take(line, n)
	})
	closeBlocks()

	const camunda = title?.attrs.get("camunda")
	const version = camunda ? (/^\d+\.\d+$/.test(camunda) ? `${camunda}.0` : camunda) : "8.10.0"
	const pools = sections.length > 1 || sections.some((s) => s.header > 0)

	/** Parses line-format text kept by line number, as `parseProcessText` reads one process. */
	const parseLines = (lines: string[], name: string, where: string): CompactProcess | undefined => {
		// Keep line numbers: line n of the text is line n of the file.
		const body = Array.from({ length: raw.length + 1 }, (_, i) => lines[i] ?? "")
		body[0] = `# ${name}`
		const parsed = parseProcessText(body.join("\n"))
		for (const p of parsed.problems)
			problems.push(`${where}line ${p.line - 1}: ${unsupported(p.message)}`)
		for (const f of parsed.fixes) fixes.push(`${where}${f}`)
		return parsed.diagram.processes[0]
	}

	/** Parses each body in `blocks` and makes its node an expanded sub-process holding it. */
	const attachBodies = (
		process: CompactProcess,
		scope: { elements: CompactElement[] },
		blocks: Block[],
		all: Block[],
		where: string,
	) => {
		for (const b of blocks) {
			const el = scope.elements.find((e) => e.id === b.id)
			if (el === undefined || !subs.has(b.id)) {
				problems.push(
					`${where}line ${b.line}: "${b.id} {" opens a body, but "${b.id}" is not declared ${b.id}[sub Name] in that scope`,
				)
				continue
			}
			const inner = parseLines(b.lines, el.name ?? b.id, where)
			if (inner === undefined) continue
			inner.id = b.id
			// Ids are unique in a file: rename body ids the rest of the pool already uses.
			renameCollisions(inner, compactIds(process), fixes)
			el.type = "subProcess"
			el.children = { elements: inner.elements, flows: inner.flows }
			if (inner.notes?.length) process.notes = [...(process.notes ?? []), ...inner.notes]
			attachBodies(
				process,
				el.children,
				all.filter((c) => c.parent === b),
				all,
				where,
			)
		}
	}

	// ── parse each executable pool ────────────────────────────────────────────
	const taken = new Set<string>()
	const compactProcesses: CompactProcess[] = []
	const sectionByProcess = new Map<string, Section>()
	for (const section of sections) {
		if (section.blackbox) continue
		const where = pools ? `pool "${section.name}" ` : ""
		const process = parseLines(section.lines, section.name, where)
		if (process === undefined) continue
		process.id = section.id
		process.name = section.name
		attachBodies(
			process,
			process,
			section.blocks.filter((b) => b.parent === undefined),
			section.blocks,
			where,
		)
		renameCollisions(process, taken, fixes)
		compactProcesses.push(process)
		sectionByProcess.set(process.id, section)
	}
	const visitSubs = (elements: CompactElement[]) => {
		for (const e of elements) {
			if (subs.has(e.id) && e.type !== "subProcess")
				problems.push(
					`"${e.id}": a sub-process needs its body: "${e.id} {" on its own line, its paths, then "}"`,
				)
			if (e.children) visitSubs(e.children.elements)
		}
	}
	for (const p of compactProcesses) visitSubs(p.elements)

	const compact: CompactDiagram = {
		id: `Definitions_${specId(title?.name ?? sections[0]?.name ?? "diagram")}`,
		executionPlatformVersion: version,
		processes: compactProcesses,
	}
	const defs = expand(compact, { validate: false })
	defs.diagrams = []

	for (const process of defs.processes) {
		const section = sectionByProcess.get(process.id)
		if (section === undefined) continue
		if (section.lanes.length > 0) addLanes(process, section)
		for (const d of section.data) addData(defs, process, d, problems)
		for (const a of section.annotations)
			process.textAnnotations.push({ id: a.id, text: a.text, unknownAttributes: {} })
	}

	if (pools) addCollaboration(defs, sections, messageLines, problems)
	else
		for (const m of messageLines)
			problems.push(`line ${m.line}: a message flow needs pools ("## Pool name" sections)`)
	addAnnotations(defs, sections, loose, links, problems)

	return { definitions: placeCollaborationNotes(applyAutoLayout(defs)), fields, problems, fixes }
}

/** Puts every top-level node in a lane: declared ones where written, the rest next to a neighbour. */
function addLanes(process: BpmnProcess, section: Section): void {
	const laneOf = new Map<string, string>()
	for (const lane of section.lanes) for (const id of lane.nodes) laneOf.set(id, lane.id)
	const nodes = process.flowElements.filter(
		(e) =>
			e.type !== "dataObject" &&
			e.type !== "dataObjectReference" &&
			e.type !== "dataStoreReference",
	)
	for (let changed = true; changed; ) {
		changed = false
		for (const node of nodes) {
			if (laneOf.has(node.id)) continue
			const neighbour =
				node.type === "boundaryEvent"
					? node.attachedToRef
					: (process.sequenceFlows.find((f) => f.targetRef === node.id && laneOf.has(f.sourceRef))
							?.sourceRef ??
						process.sequenceFlows.find((f) => f.sourceRef === node.id && laneOf.has(f.targetRef))
							?.targetRef)
			const lane = neighbour === undefined ? undefined : laneOf.get(neighbour)
			if (lane !== undefined) {
				laneOf.set(node.id, lane)
				changed = true
			}
		}
	}
	const first = section.lanes[0]?.id ?? ""
	const lanes: BpmnLane[] = section.lanes.map((lane) => ({
		id: lane.id,
		name: lane.name,
		flowNodeRefs: nodes.filter((n) => (laneOf.get(n.id) ?? first) === lane.id).map((n) => n.id),
		unknownAttributes: {},
	}))
	process.laneSet = { id: `LaneSet_${process.id}`, lanes }
}

/** `d[object Name] ..> task` (input) or `task ..> d[store Name]` (output), chainable. */
function addData(
	defs: BpmnDefinitions,
	process: BpmnProcess,
	line: { line: number; text: string },
	problems: string[],
): void {
	const tokens = line.text.split(DATA_ARROW)
	const all = [...walk(process.flowElements)]
	const isData = (id: string) =>
		all.some(
			(e) => e.id === id && (e.type === "dataObjectReference" || e.type === "dataStoreReference"),
		)
	const ids: string[] = []
	for (const token of tokens) {
		const m = DATA_NODE.exec(token.trim())
		if (m === null) {
			problems.push(`line ${line.line}: cannot read "${token}" (write id or id[object Name])`)
			return
		}
		const id = m[1] ?? ""
		ids.push(id)
		const kind = m[2]
		if (kind === undefined || all.some((e) => e.id === id)) continue
		// Declared here: the reference goes next to the activity it is wired to.
		const neighbour = tokens
			.map((t) => DATA_NODE.exec(t.trim())?.[1])
			.find((t) => t !== undefined && t !== id && all.some((e) => e.id === t))
		const scope = neighbour === undefined ? undefined : scopeOf(process.flowElements, neighbour)
		if (scope === undefined) {
			problems.push(`line ${line.line}: "${id}" is wired to no node of pool "${process.id}"`)
			return
		}
		const name = (m[3] ?? "").trim() || undefined
		if (kind === "store") {
			const ref = createFlowElement(id, "dataStoreReference", { name })
			if (ref.type === "dataStoreReference") ref.dataStoreRef = `DataStore_${id}`
			scope.push(ref)
			defs.unknownChildren = [
				...(defs.unknownChildren ?? []),
				{
					name: "bpmn:dataStore",
					attributes: { id: `DataStore_${id}`, ...(name ? { name } : {}) },
					children: [],
				},
			]
		} else {
			const object = createFlowElement(`DataObject_${id}`, "dataObject", {})
			if (object.type === "dataObject" && kind === "objects") object.isCollection = true
			const ref = createFlowElement(id, "dataObjectReference", { name })
			if (ref.type === "dataObjectReference") ref.dataObjectRef = object.id
			scope.push(object, ref)
		}
		all.push(...scope.slice(-2))
	}
	for (let i = 0; i + 1 < ids.length; i++) {
		const from = ids[i] ?? ""
		const to = ids[i + 1] ?? ""
		const input = isData(from)
		const [dataId, activityId] = input ? [from, to] : [to, from]
		if (!isData(dataId) || isData(activityId)) {
			problems.push(`line ${line.line}: "${from} ..> ${to}" must join one data node and one task`)
			continue
		}
		const activity = all.find((e) => e.id === activityId)
		if (activity === undefined) {
			problems.push(`line ${line.line}: no node "${activityId}" in pool "${process.id}"`)
			continue
		}
		const key = input ? "dataInputAssociations" : "dataOutputAssociations"
		const target = activity as BpmnFlowElement & {
			dataInputAssociations?: unknown[]
			dataOutputAssociations?: unknown[]
			properties?: { id?: string; name: string; unknownAttributes: Record<string, string> }[]
		}
		const id = `${input ? "DataInputAssociation" : "DataOutputAssociation"}_${activityId}_${dataId}`
		if (input) {
			// BPMN20.xsd requires a targetRef; like Camunda Modeler, a placeholder property.
			const prop = `Property_${activityId}`
			if (!target.properties?.some((p) => p.id === prop)) {
				target.properties = [
					...(target.properties ?? []),
					{ id: prop, name: "__targetRef_placeholder", unknownAttributes: {} },
				]
			}
			target[key] = [
				...(target[key] ?? []),
				{ id, sourceRefs: [dataId], targetRef: prop, unknownAttributes: {} },
			]
		} else {
			target[key] = [
				...(target[key] ?? []),
				{ id, sourceRefs: [], targetRef: dataId, unknownAttributes: {} },
			]
		}
	}
}

/**
 * Free text annotations (`n[annotation Text]`) and their links (`n[annotation Text] ..> task`).
 * One written in a pool is the process's; one written before the first pool is the
 * collaboration's (the process's when there are no pools). The layout places them.
 */
function addAnnotations(
	defs: BpmnDefinitions,
	sections: Section[],
	loose: Annotation[],
	links: AnnotationLink[],
	problems: string[],
): void {
	const collab = defs.collaborations[0]
	type Holder = { textAnnotations: BpmnTextAnnotation[]; associations: BpmnAssociation[] }
	const holderOf = (section: Section | undefined): Holder | undefined =>
		section === undefined
			? (collab ?? defs.processes[0])
			: defs.processes.find((p) => p.id === section.id)
	const nodes = new Set<string>()
	for (const p of defs.processes) for (const el of walk(p.flowElements)) nodes.add(el.id)
	for (const p of collab?.participants ?? []) {
		nodes.add(p.id)
		if (p.processRef) nodes.add(p.processRef)
	}
	const notes = new Set([
		...loose.map((a) => a.id),
		...sections.flatMap((s) => s.annotations.map((a) => a.id)),
	])
	const looseHolder = holderOf(undefined)
	for (const a of loose)
		looseHolder?.textAnnotations.push({ id: a.id, text: a.text, unknownAttributes: {} })

	for (const link of links) {
		const ends = link.text.split(DATA_ARROW).map((t) => t.trim())
		const holder = holderOf(link.section)
		let note: string | undefined
		let node: string | undefined
		for (const end of ends) {
			const declared = ANNOTATION.exec(end)
			if (declared !== null) {
				note = declared[1] ?? ""
				if (!notes.has(note)) {
					notes.add(note)
					holder?.textAnnotations.push({
						id: note,
						text: (declared[2] ?? "").trim(),
						unknownAttributes: {},
					})
				}
			} else if (notes.has(end)) note = end
			else node = end
		}
		if (ends.length !== 2 || note === undefined || node === undefined || holder === undefined) {
			problems.push(`line ${link.line}: write an annotation link as "n[annotation Text] ..> task"`)
			continue
		}
		const target = participantOrNode(node, defs)
		if (!nodes.has(node)) {
			problems.push(`line ${link.line}: no node or pool "${node}"`)
			continue
		}
		holder.associations.push({
			id: `Association_${note}_${target}`,
			sourceRef: target,
			targetRef: note,
			unknownAttributes: {},
		})
	}
}

/**
 * The layout places a process's annotations; a collaboration's go in a row above
 * the pools, each association a straight line down to the shape it notes.
 */
function placeCollaborationNotes(defs: BpmnDefinitions): BpmnDefinitions {
	const collab = defs.collaborations[0]
	const plane = defs.diagrams[0]?.plane
	if (collab === undefined || plane === undefined || collab.textAnnotations.length === 0)
		return defs
	const shapes = new Map(plane.shapes.map((s) => [s.bpmnElement, s.bounds]))
	const top = Math.min(...plane.shapes.map((s) => s.bounds.y))
	let x = Math.min(...plane.shapes.map((s) => s.bounds.x))
	const width = 200
	const placed = collab.textAnnotations.filter((a) => !shapes.has(a.id))
	const heights = placed.map((a) => 30 + 15 * (Math.ceil(((a.text ?? "").length * 6.4) / 180) - 1))
	placed.forEach((a, i) => {
		const height = heights[i] ?? 30
		const bounds = { x, y: top - 40 - height, width, height }
		x += width + 30
		shapes.set(a.id, bounds)
		plane.shapes.push({ id: `${a.id}_di`, bpmnElement: a.id, bounds, unknownAttributes: {} })
	})
	for (const assoc of collab.associations) {
		const note = shapes.get(assoc.targetRef)
		const node = shapes.get(assoc.sourceRef)
		if (note === undefined || node === undefined) continue
		if (plane.edges.some((e) => e.bpmnElement === assoc.id)) continue
		const from = { x: note.x + note.width / 2, y: note.y + note.height }
		plane.edges.push({
			id: `${assoc.id}_di`,
			bpmnElement: assoc.id,
			waypoints: [from, { x: Math.min(Math.max(from.x, node.x), node.x + node.width), y: node.y }],
			unknownAttributes: {},
		})
	}
	return defs
}

/** A pool named by its process id means the pool's participant. */
function participantOrNode(id: string, defs: BpmnDefinitions): string {
	return defs.collaborations[0]?.participants.find((p) => p.processRef === id)?.id ?? id
}

function addCollaboration(
	defs: BpmnDefinitions,
	sections: Section[],
	messageLines: { line: number; text: string }[],
	problems: string[],
): void {
	const participants: BpmnParticipant[] = sections.map((s) =>
		s.blackbox
			? { id: s.id, name: s.name, unknownAttributes: {} }
			: { id: `Pool_${s.id}`, name: s.name, processRef: s.id, unknownAttributes: {} },
	)
	// Endpoint id → participant id: pools by process or participant id, nodes by their process.
	const owner = new Map<string, string>()
	for (const p of participants) {
		owner.set(p.id, p.id)
		if (p.processRef) owner.set(p.processRef, p.id)
	}
	for (const process of defs.processes) {
		for (const el of walk(process.flowElements)) owner.set(el.id, `Pool_${process.id}`)
	}
	const flows: BpmnMessageFlow[] = []
	for (const m of messageLines) {
		const match = MESSAGE_LINE.exec(m.text)
		if (match === null) {
			problems.push(`line ${m.line}: write a message flow as "a ~> b: label"`)
			continue
		}
		const ends = [match[1] ?? "", match[2] ?? ""].map((id) =>
			// A pool written by its process id means the pool.
			participants.some((p) => p.processRef === id) ? `Pool_${id}` : id,
		)
		const [source = "", target = ""] = ends
		const missing = ends.filter((id) => !owner.has(id))
		if (missing.length > 0) {
			problems.push(`line ${m.line}: no node or pool "${missing.join('", "')}"`)
			continue
		}
		if (owner.get(source) === owner.get(target)) {
			problems.push(
				`line ${m.line}: "${source} ~> ${target}" stays in one pool; use ">" for a sequence flow`,
			)
			continue
		}
		const label = match[3]?.trim()
		flows.push({
			id: `MessageFlow_${flows.length + 1}`,
			sourceRef: source,
			targetRef: target,
			...(label ? { name: label } : {}),
			unknownAttributes: {},
		})
	}
	defs.collaborations = [
		{
			id: "Collaboration_1",
			participants,
			messageFlows: flows,
			textAnnotations: [],
			associations: [],
			groups: [],
			extensionElements: [],
			unknownAttributes: {},
		},
	]
}

/**
 * A message only thrown (message end/throw event, send task) needs no
 * subscription in Zeebe, but camunda-compat lint requires one on every
 * `bpmn:message` (`camunda-compat/subscription`). With no correlation key to
 * give it, the throw drops the reference instead: Zeebe deploys and runs it
 * the same, and the lint is clean. Returns the message ids removed.
 */
export function dropThrowOnlyMessages(defs: BpmnDefinitions): string[] {
	const subscribed = (m: BpmnDefinitions["messages"][number]) =>
		m.extensionElements?.some((x) => x.name === "zeebe:subscription") === true
	const candidates = new Set(defs.messages.filter((m) => !subscribed(m)).map((m) => m.id))
	if (candidates.size === 0) return []
	const throws: Array<{ messageRef?: string }> = []
	for (const process of defs.processes) {
		for (const el of walk(process.flowElements)) {
			const refs: Array<{ messageRef?: string }> = []
			if (el.type === "sendTask" || el.type === "receiveTask") refs.push(el)
			if ("eventDefinitions" in el)
				for (const d of el.eventDefinitions) if (d.type === "message") refs.push(d)
			const throwing =
				el.type === "sendTask" || el.type === "endEvent" || el.type === "intermediateThrowEvent"
			for (const ref of refs) {
				if (ref.messageRef === undefined || !candidates.has(ref.messageRef)) continue
				if (throwing) throws.push(ref)
				else candidates.delete(ref.messageRef)
			}
		}
	}
	for (const c of defs.collaborations)
		for (const f of c.messageFlows) if (f.messageRef) candidates.delete(f.messageRef)
	for (const ref of throws)
		if (ref.messageRef && candidates.has(ref.messageRef)) ref.messageRef = undefined
	defs.messages = defs.messages.filter((m) => !candidates.has(m.id))
	return [...candidates]
}

/**
 * A gateway with two or more flows in and out is a join and a split at once
 * (bpmnlint `no-gateway-join-fork`), most often a loop back into an event-based
 * gateway. The text spec never writes one; a builder module can. Puts a merge
 * gateway in front of it (parallel before a parallel split, inclusive before an
 * inclusive one, else exclusive) and returns the gateways it split.
 */
export function splitMixedGateways(defs: BpmnDefinitions): string[] {
	const split: string[] = []
	const ids = new Set<string>()
	for (const p of defs.processes) {
		for (const el of walk(p.flowElements)) ids.add(el.id)
		for (const f of p.sequenceFlows) ids.add(f.id)
	}
	const fresh = (base: string) => {
		let id = base
		for (let n = 2; ids.has(id); n++) id = `${base}_${n}`
		ids.add(id)
		return id
	}
	const visit = (elements: BpmnFlowElement[], flows: BpmnSequenceFlow[], process: BpmnProcess) => {
		for (const el of [...elements]) {
			const inner = el as { flowElements?: BpmnFlowElement[]; sequenceFlows?: BpmnSequenceFlow[] }
			if (inner.flowElements && inner.sequenceFlows)
				visit(inner.flowElements, inner.sequenceFlows, process)
			if (!el.type.endsWith("Gateway")) continue
			const incoming = flows.filter((f) => f.targetRef === el.id)
			if (incoming.length < 2 || flows.filter((f) => f.sourceRef === el.id).length < 2) continue
			const type =
				el.type === "parallelGateway" || el.type === "inclusiveGateway"
					? el.type
					: "exclusiveGateway"
			const merge = createFlowElement(fresh(`${el.id}_merge`), type, {})
			const flow: BpmnSequenceFlow = {
				id: fresh(`Flow_${merge.id}`),
				sourceRef: merge.id,
				targetRef: el.id,
				extensionElements: [],
				unknownAttributes: {},
			}
			for (const f of incoming) f.targetRef = merge.id
			if ("incoming" in merge && "incoming" in el) {
				merge.incoming = incoming.map((f) => f.id)
				merge.outgoing = [flow.id]
				el.incoming = [flow.id]
			}
			elements.splice(elements.indexOf(el), 0, merge)
			flows.push(flow)
			for (const lane of process.laneSet?.lanes ?? [])
				if (lane.flowNodeRefs.includes(el.id)) lane.flowNodeRefs.push(merge.id)
			split.push(el.id)
		}
	}
	for (const p of defs.processes) visit(p.flowElements, p.sequenceFlows, p)
	return split
}
