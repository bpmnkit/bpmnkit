/**
 * The `casen build` text spec: the core line format (`PROCESS_TEXT_GUIDE`) plus
 * pools, lanes, message flows, data objects and form fields, so a whole
 * collaboration is one short file a model can write in one go.
 *
 * Each pool section is read by `parseProcessText`; this module only adds what
 * the line format has no syntax for, on the expanded model.
 */
import {
	type BpmnDefinitions,
	type BpmnFlowElement,
	type BpmnLane,
	type BpmnMessageFlow,
	type BpmnParticipant,
	type BpmnProcess,
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
d[object Name] ..> task                 data input; task ..> d[store Name] = data output (objects = collection)`

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
}

const MESSAGE_LINE = /^(\S+)\s*~>\s*(\S+?)\s*(?::\s*(.*))?$/
const DATA_ARROW = /\s*\.\.>\s*/
const DATA_NODE = /^([A-Za-z_][\w.-]*)(?:\[(object|objects|store)\s*([^\]]*)\])?$/
const DECLARATION = /([A-Za-z_][\w.-]*)\[([^\]]*)\]/g

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
	const newSection = (name: string, attrs: Map<string, string>, line: number): Section => ({
		name,
		id: attrs.get("id") || specId(name),
		blackbox: attrs.has("blackbox"),
		header: line,
		lines: [],
		lanes: [],
		data: [],
	})
	let current: Section | undefined

	raw.forEach((rawLine, index) => {
		const n = index + 1
		const line = rawLine.trim()
		if (line.startsWith("###")) {
			if (current === undefined) {
				current = newSection(title?.name ?? "Process", title?.attrs ?? new Map(), 0)
				sections.push(current)
			}
			const { name } = header(line.slice(3))
			const id = `Lane_${specId(name)}`
			current.lane = current.lanes.find((l) => l.id === id)
			if (current.lane === undefined) {
				current.lane = { id, name, nodes: [] }
				current.lanes.push(current.lane)
			}
			return
		}
		if (line.startsWith("##")) {
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
		if (line.includes("~>")) {
			messageLines.push({ line: n, text: line })
			return
		}
		if (current === undefined) {
			current = newSection(title?.name ?? "Process", title?.attrs ?? new Map(), 0)
			sections.push(current)
		}
		if (line.includes("..>")) {
			current.data.push({ line: n, text: line })
			return
		}
		const kept = takeFields(line, fields)
		current.lane?.nodes.push(...declaredIds(kept))
		current.lines[n] = kept
	})

	const camunda = title?.attrs.get("camunda")
	const version = camunda ? (/^\d+\.\d+$/.test(camunda) ? `${camunda}.0` : camunda) : "8.10.0"
	const pools = sections.length > 1 || sections.some((s) => s.header > 0)

	// ── parse each executable pool ────────────────────────────────────────────
	const taken = new Set<string>()
	const compactProcesses: CompactProcess[] = []
	const sectionByProcess = new Map<string, Section>()
	for (const section of sections) {
		if (section.blackbox) continue
		const where = pools ? `pool "${section.name}" ` : ""
		// Keep line numbers: line n of the section text is line n of the file.
		const body = Array.from({ length: raw.length + 1 }, (_, i) => section.lines[i] ?? "")
		body[0] = `# ${section.name}`
		const parsed = parseProcessText(body.join("\n"))
		for (const p of parsed.problems) problems.push(`${where}line ${p.line - 1}: ${p.message}`)
		for (const f of parsed.fixes) fixes.push(`${where}${f}`)
		const process = parsed.diagram.processes[0]
		if (process === undefined) continue
		process.id = section.id
		process.name = section.name
		renameCollisions(process, taken, fixes)
		compactProcesses.push(process)
		sectionByProcess.set(process.id, section)
	}

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
	}

	if (pools) addCollaboration(defs, sections, messageLines, problems)
	else
		for (const m of messageLines)
			problems.push(`line ${m.line}: a message flow needs pools ("## Pool name" sections)`)

	return { definitions: applyAutoLayout(defs), fields, problems, fixes }
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
