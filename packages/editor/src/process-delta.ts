/**
 * Applies a change script to a diagram someone already drew, keeping its
 * layout.
 *
 * `@bpmnkit/core` reads the script (`parseProcessDelta`) and writes the diagram
 * a model reads (`writeProcessText`). Putting the change back needs the
 * diagram interchange as well as the model: a new task needs a place on the
 * canvas, and the flows around it need routes. Laying the whole diagram out
 * again would answer that, and would also throw away the layout of the person
 * who drew it. So the change goes through the same modelling functions a
 * person's edit does, and only what the change touches moves
 * (`doc/drop-ai-feedback-edits-analysis.md` §5).
 *
 * Like every modelling function here, this acts on the first process and its
 * diagram — the only kind of document the Drop room lets anyone edit.
 *
 * @packageDocumentation
 */
import {
	type BpmnBounds,
	type BpmnConditionExpression,
	type BpmnDefinitions,
	type BpmnElementType,
	type BpmnFlowElement,
	type BpmnLane,
	type BpmnOperation,
	type BpmnProcess,
	type BpmnSequenceFlow,
	type CompactElement,
	type DeltaFlow,
	type DeltaNode,
	ELEMENT_SIZES,
	type ProcessDelta,
	type ProcessTextProblem,
	applyBpmnOperations,
	conditionOrLabel,
	writableCondition,
	writableLabel,
	writableName,
} from "@bpmnkit/core"
import { computeWaypointsAvoiding } from "./geometry.js"
import { type IdFactory, genId } from "./id.js"
import {
	changeElementType,
	createBoundaryEvent,
	createConnection,
	createShape,
	deleteElements,
	moveShapes,
	updateLabel,
} from "./modeling.js"
import type { CreateShapeType } from "./types.js"

export interface ApplyProcessDeltaOptions {
	/** Written id → element id: the map `writeProcessText` returned with the text the script answers. */
	aliases: Readonly<Record<string, string>>
	/**
	 * Makes the ids of new shapes, flows and their diagram elements. A new node
	 * keeps the id the script wrote when it is free; everything else comes from
	 * here. Pass `createIdFactory(seed)` for a result that replays identically.
	 */
	ids?: IdFactory
}

export interface ApplyProcessDeltaResult {
	/** The changed document. The input is never mutated. */
	definitions: BpmnDefinitions
	/** Element ids of the nodes the script added. */
	created: string[]
	/** Element ids of existing nodes it renamed, retyped or gave new attributes, or whose outgoing flow it relabelled. */
	changed: string[]
	/** Element ids of the nodes it removed. */
	removed: string[]
	/** Feedback item → the element ids its `@` line names, resolved. */
	addressed: Map<number, string[]>
	/** What the script asked for and was not done, with the line it was asked on. */
	problems: ProcessTextProblem[]
	/** What was done that the script did not say outright, e.g. a flow replaced by an insert. */
	fixes: string[]
}

/** Gap between a node and the next, left to right. */
const GAP = 50
/** How far a placement moves down to find a free spot. */
const ROW = 120
/** Clearance a placed shape keeps from every other. */
const CLEARANCE = 15
/** Placements tried before taking the last one. */
const TRIES = 20

/** Types a script may create with `createShape`. Boundaries go through `createBoundaryEvent`. */
const CREATABLE = new Set<BpmnElementType>([
	"startEvent",
	"endEvent",
	"intermediateCatchEvent",
	"intermediateThrowEvent",
	"task",
	"userTask",
	"serviceTask",
	"scriptTask",
	"sendTask",
	"receiveTask",
	"businessRuleTask",
	"manualTask",
	"callActivity",
	"exclusiveGateway",
	"parallelGateway",
	"inclusiveGateway",
	"eventBasedGateway",
])

const GATEWAYS = new Set<BpmnElementType>([
	"exclusiveGateway",
	"parallelGateway",
	"inclusiveGateway",
	"eventBasedGateway",
	"complexGateway",
])

/** Task types that need a job type to deploy; as in `parseProcessText`, the id stands in. */
const JOB_TASKS = new Set<BpmnElementType>(["serviceTask", "sendTask"])

const sizeOf = (type: BpmnElementType) => ELEMENT_SIZES[type] ?? { width: 100, height: 80 }

const right = (b: BpmnBounds) => b.x + b.width
const bottom = (b: BpmnBounds) => b.y + b.height
const centreY = (b: BpmnBounds) => b.y + b.height / 2

function overlaps(a: BpmnBounds, b: BpmnBounds): boolean {
	return (
		a.x < right(b) + CLEARANCE &&
		right(a) + CLEARANCE > b.x &&
		a.y < bottom(b) + CLEARANCE &&
		bottom(a) + CLEARANCE > b.y
	)
}

/** Every id the document uses, so a new one cannot collide with any of them. */
function idsIn(definitions: BpmnDefinitions): Set<string> {
	const taken = new Set<string>()
	for (const match of JSON.stringify(definitions).matchAll(/"id":"([^"\\]+)"/g)) {
		if (match[1]) taken.add(match[1])
	}
	return taken
}

/** A factory whose first id is `id`, for the element; later ones come from `ids`. */
function startingWith(id: string, ids: IdFactory): IdFactory {
	let first = true
	return (prefix) => {
		if (!first) return ids(prefix)
		first = false
		return id
	}
}

function leafLanes(lanes: readonly BpmnLane[] | undefined, out: BpmnLane[] = []): BpmnLane[] {
	for (const lane of lanes ?? []) {
		const children = lane.childLaneSet?.lanes ?? []
		if (children.length > 0) leafLanes(children, out)
		else out.push(lane)
	}
	return out
}

function allLanes(lanes: readonly BpmnLane[] | undefined, out: BpmnLane[] = []): BpmnLane[] {
	for (const lane of lanes ?? []) {
		out.push(lane)
		allLanes(lane.childLaneSet?.lanes, out)
	}
	return out
}

function hasDefault(element: BpmnFlowElement): element is BpmnFlowElement & { default?: string } {
	return (
		element.type === "exclusiveGateway" ||
		element.type === "inclusiveGateway" ||
		element.type === "complexGateway"
	)
}

/**
 * Applies `delta` to `definitions`.
 *
 * What the script says, it does; what it does not say stays as it was:
 *
 * - A declaration of an id the diagram has changes that node — its kind, its
 *   name, `job=`, `nonint` — and only what it states. One that restates the
 *   node as it was written changes nothing.
 * - A declaration of a new id adds a node, placed beside the node it follows.
 * - A flow between two existing nodes that are already connected is a
 *   restatement: a label it states replaces the old one, an unstated part stays.
 * - `- x` and `- a > b` remove.
 *
 * Two rules fill in what a reviewer means and a small model leaves out. Both
 * are listed in `fixes`:
 *
 * - **Insert.** New nodes written between two connected nodes
 *   (`a > new > b`) replace the flow `a > b`, keep its label, and sit in the
 *   gap between them. Shapes to the right move along if the gap is too small.
 * - **Bridge.** Removing a node with one way in and one way out joins its
 *   neighbours, if nothing else the script wrote connects them.
 *
 * Never throws on the script: an id that names nothing, a kind that cannot be
 * created, or an attribute the Zeebe schema forbids is reported in `problems`
 * and left out.
 */
export function applyProcessDelta(
	definitions: BpmnDefinitions,
	delta: ProcessDelta,
	options: ApplyProcessDeltaOptions,
): ApplyProcessDeltaResult {
	const result: ApplyProcessDeltaResult = {
		definitions,
		created: [],
		changed: [],
		removed: [],
		addressed: new Map(),
		problems: [],
		fixes: [],
	}
	const problem = (line: number, message: string) => result.problems.push({ line, message })
	if (!definitions.processes[0] || !definitions.diagrams[0]) {
		problem(0, "the document has no process with a diagram to change")
		return result
	}
	// One copy up front, so the direct edits below never reach the caller's model.
	let defs = structuredClone(definitions)
	const ids = options.ids ?? genId
	const taken = idsIn(defs)

	const proc = () => defs.processes[0] as BpmnProcess
	const plane = () => (defs.diagrams[0] as NonNullable<BpmnDefinitions["diagrams"][0]>).plane
	const element = (id: string) => proc().flowElements.find((el) => el.id === id)
	const shape = (id: string) => plane().shapes.find((s) => s.bpmnElement === id)
	const flowsOut = (id: string) => proc().sequenceFlows.filter((f) => f.sourceRef === id)
	const flowsIn = (id: string) => proc().sequenceFlows.filter((f) => f.targetRef === id)
	const flowBetween = (from: string, to: string) =>
		proc().sequenceFlows.find((f) => f.sourceRef === from && f.targetRef === to)

	/** Pools and lanes: drawn as shapes, but containers rather than obstacles. */
	const containerIds = new Set<string>([
		...defs.collaborations.flatMap((c) => c.participants.map((p) => p.id)),
		...defs.processes.flatMap((p) => allLanes(p.laneSet?.lanes)).map((lane) => lane.id),
	])
	const obstacles = (except: readonly string[] = []) =>
		plane()
			.shapes.filter((s) => !containerIds.has(s.bpmnElement) && !except.includes(s.bpmnElement))
			.map((s) => s.bounds)

	// ── Resolve the script's ids ─────────────────────────────────────────────
	/** Written id → element id, for nodes that exist and, as they are made, new ones. */
	const real = new Map<string, string>()
	for (const [written, id] of Object.entries(options.aliases)) {
		if (element(id)) real.set(written, id)
	}
	/** New nodes the script may create, by written id. */
	const fresh = new Map<string, DeltaNode>()
	for (const node of delta.nodes) {
		if (real.has(node.id)) continue
		if (node.type === undefined) {
			problem(node.line, `"${node.id}" is not in the diagram; a new node needs a kind`)
		} else if (node.type === "boundaryEvent") {
			if (node.on === undefined) problem(node.line, `boundary "${node.id}" needs on=<task>`)
			else fresh.set(node.id, node)
		} else if (!CREATABLE.has(node.type)) {
			problem(node.line, `a new ${node.type} cannot be added here; left out "${node.id}"`)
		} else {
			fresh.set(node.id, node)
		}
	}
	const known = (written: string) => real.has(written) || fresh.has(written)
	/** Patches for `applyBpmnOperations`, applied once every node exists. */
	const patches: { line: number; op: BpmnOperation }[] = []
	const changed = new Set<string>()

	// ── Changes to existing nodes ────────────────────────────────────────────
	for (const node of delta.nodes) {
		const id = real.get(node.id)
		const el = id === undefined ? undefined : element(id)
		if (id === undefined || !el) continue
		const patch: Partial<CompactElement> = {}
		if (node.type !== undefined && node.type !== el.type) {
			if (el.type === "boundaryEvent" || node.type === "boundaryEvent") {
				problem(node.line, `"${node.id}" cannot become or stop being a boundary event`)
			} else if (!CREATABLE.has(node.type) || !CREATABLE.has(el.type)) {
				problem(node.line, `"${node.id}" cannot change from ${el.type} to ${node.type}`)
			} else {
				defs = changeElementType(defs, id, node.type as CreateShapeType)
				resizeAround(id, node.type)
				changed.add(id)
				if (node.jobType === undefined) deployable(id, node.id, node.type, patch)
			}
		}
		const now = element(id)
		const trigger = now && "eventDefinitions" in now ? now.eventDefinitions[0]?.type : undefined
		if (node.trigger !== undefined && node.trigger !== trigger) patch.eventType = node.trigger
		if (node.jobType !== undefined) {
			const current = now?.extensionElements.find((e) => e.name === "zeebe:taskDefinition")
				?.attributes.type
			if (current !== node.jobType) patch.jobType = node.jobType
		}
		if (node.interrupting === false && now && "cancelActivity" in now && now.cancelActivity) {
			patch.interrupting = false
		}
		if (node.on !== undefined && now?.type === "boundaryEvent") {
			const host = real.get(node.on)
			if (host !== now.attachedToRef) {
				problem(node.line, `"${node.id}" cannot move to another task; remove it and add a new one`)
			}
		}
		if (node.name !== undefined && node.name !== writableName(now?.name ?? "")) {
			defs = updateLabel(defs, id, node.name)
			changed.add(id)
		}
		if (Object.keys(patch).length > 0) {
			patches.push({ line: node.line, op: { op: "update", id, patch } })
			changed.add(id)
		}
	}

	// ── Removals ─────────────────────────────────────────────────────────────
	/** Flows the script removed, by `from>to`, so an insert in their place can keep the label. */
	const removedFlows = new Map<string, BpmnSequenceFlow>()
	const flowKey = (from: string, to: string) => `${from}>${to}`
	/** Of those, the ones that were their gateway's default. */
	const removedDefaults = new Set<string>()
	const flowIds: string[] = []
	for (const removal of delta.removedFlows) {
		const from = real.get(removal.from)
		const to = real.get(removal.to)
		const flow = from !== undefined && to !== undefined ? flowBetween(from, to) : undefined
		if (!flow || from === undefined || to === undefined) {
			problem(removal.line, `there is no flow ${removal.from} > ${removal.to} to remove`)
			continue
		}
		removedFlows.set(flowKey(from, to), structuredClone(flow))
		const source = element(from)
		if (source && hasDefault(source) && source.default === flow.id) removedDefaults.add(flow.id)
		flowIds.push(flow.id)
	}
	if (flowIds.length > 0) defs = deleteElements(defs, flowIds)

	/** Removed nodes by written id: no longer a target, but an `@` line may still name them. */
	const gone = new Map<string, string>()
	/** For the bridge rule: each removed node's one way in and one way out. */
	const bridges: { removed: string; into: BpmnSequenceFlow; to: string; wasDefault: boolean }[] = []
	const removedIds: string[] = []
	for (const removal of delta.removedNodes) {
		const id = real.get(removal.id)
		if (id === undefined) {
			problem(removal.line, `there is no "${removal.id}" to remove`)
			continue
		}
		if (removedIds.includes(id)) continue
		removedIds.push(id)
	}
	for (const id of removedIds) {
		const into = flowsIn(id).filter((f) => !removedIds.includes(f.sourceRef))
		const out = flowsOut(id).filter((f) => !removedIds.includes(f.targetRef))
		const only = into[0]
		const next = out[0]?.targetRef
		const source = only === undefined ? undefined : element(only.sourceRef)
		// An empty branch of a parallel split does nothing, and one of an
		// event-based gateway cannot exist: removing the only step on either is
		// removing the branch.
		const branchOnly = source?.type === "parallelGateway" || source?.type === "eventBasedGateway"
		if (into.length === 1 && out.length === 1 && only && next !== undefined && !branchOnly) {
			const wasDefault = source !== undefined && hasDefault(source) && source.default === only.id
			bridges.push({ removed: id, into: structuredClone(only), to: next, wasDefault })
		}
	}
	if (removedIds.length > 0) {
		const before = new Set(proc().flowElements.map((el) => el.id))
		defs = deleteElements(defs, removedIds)
		const after = new Set(proc().flowElements.map((el) => el.id))
		result.removed = [...before].filter((id) => !after.has(id))
		for (const [written, id] of real) {
			if (after.has(id)) continue
			real.delete(written)
			gone.set(written, id)
		}
	}

	// ── Flows: restatements, and the ones to add ─────────────────────────────
	const toAdd: DeltaFlow[] = []
	for (const flow of delta.flows) {
		const missing = [flow.from, flow.to].filter((w) => !known(w))
		if (missing.length > 0) {
			problem(
				flow.line,
				`${missing.map((w) => `"${w}"`).join(" and ")} ${missing.length > 1 ? "are" : "is"} not in the diagram`,
			)
			continue
		}
		const from = real.get(flow.from)
		const to = real.get(flow.to)
		const existing = from !== undefined && to !== undefined ? flowBetween(from, to) : undefined
		if (existing) restate(existing, flow)
		else toAdd.push({ ...flow })
	}

	// ── Inserts: new nodes written between two connected nodes ───────────────
	const inn = new Map<string, DeltaFlow[]>()
	const out = new Map<string, DeltaFlow[]>()
	for (const flow of toAdd) {
		out.set(flow.from, [...(out.get(flow.from) ?? []), flow])
		inn.set(flow.to, [...(inn.get(flow.to) ?? []), flow])
	}
	const throughOnce = (w: string) =>
		fresh.get(w)?.type !== "boundaryEvent" &&
		(inn.get(w)?.length ?? 0) === 1 &&
		(out.get(w)?.length ?? 0) === 1
	const placed = new Map<string, BpmnBounds>()
	/** Conditions a new flow takes over from one it replaces, copied as they were. */
	const carried = new Map<Pick<DeltaFlow, "line">, BpmnConditionExpression>()

	for (const first of toAdd) {
		const a = real.get(first.from)
		if (a === undefined || !fresh.has(first.to) || placed.has(first.to)) continue
		const chain: string[] = []
		let cur = first.to
		while (throughOnce(cur) && !real.has(cur) && !chain.includes(cur)) {
			chain.push(cur)
			const next = out.get(cur)?.[0]?.to
			if (next === undefined || !fresh.has(next)) break
			cur = next
		}
		const last = chain.at(-1)
		const end = last === undefined ? undefined : out.get(last)?.[0]?.to
		const b = end === undefined ? undefined : real.get(end)
		if (last === undefined || b === undefined || end === undefined) continue
		const old = flowBetween(a, b) ?? removedFlows.get(flowKey(a, b))
		if (!old) continue
		// Read before the flow goes: removing it clears the gateway's default.
		const gateway = element(a)
		const wasDefault =
			(gateway !== undefined && hasDefault(gateway) && gateway.default === old.id) ||
			removedDefaults.has(old.id)
		if (flowBetween(a, b)) {
			defs = deleteElements(defs, [old.id])
			result.fixes.push(
				`replaced the flow ${first.from} > ${end} with the path through ${chain.join(" > ")}`,
			)
		}
		// The branch keeps what it was: a condition on `a > b` belongs on `a > new`.
		if (first.name === undefined && first.condition === undefined && !first.isDefault) {
			if (old.name) first.name = old.name
			if (old.conditionExpression) carried.set(first, old.conditionExpression)
			if (wasDefault) first.isDefault = true
		}
		placeBetween(a, b, chain)
	}

	// ── Everything else new: beside what it follows ──────────────────────────
	for (let progress = true; progress; ) {
		progress = false
		for (const [written, node] of fresh) {
			if (real.has(written)) continue
			const bounds = place(written, node)
			if (bounds === undefined) continue
			create(written, node, bounds)
			progress = true
		}
	}
	for (const [written, node] of fresh) {
		if (real.has(written) || node.type === "boundaryEvent") continue
		const all = obstacles()
		const size = sizeOf(node.type as BpmnElementType)
		const x = all.length > 0 ? Math.min(...all.map((b) => b.x)) : 0
		const y = (all.length > 0 ? Math.max(...all.map(bottom)) : 0) + ROW / 2
		create(written, node, slot({ x, y, ...size }))
	}
	for (const [written, node] of fresh) {
		if (!real.has(written)) problem(node.line, `"${written}" has no host to attach to; left out`)
	}

	if (patches.length > 0) {
		const applied = applyBpmnOperations(
			defs,
			patches.map((p) => p.op),
			{ strict: false },
		)
		defs = applied.definitions
		for (const p of applied.problems) {
			problem(patches[p.index]?.line ?? 0, p.reason)
		}
	}

	// ── New flows ────────────────────────────────────────────────────────────
	for (const flow of toAdd) {
		const from = real.get(flow.from)
		const to = real.get(flow.to)
		if (from === undefined || to === undefined) continue
		if (flowBetween(from, to)) continue
		connect(from, to, flow)
	}

	// ── Bridges over removed nodes ───────────────────────────────────────────
	// Only where the script itself connected neither side: then the gap is one
	// it did not mean to leave.
	const addedFrom = new Set(toAdd.map((f) => real.get(f.from)))
	const addedTo = new Set(toAdd.map((f) => real.get(f.to)))
	for (const { removed, into, to, wasDefault } of bridges) {
		const from = into.sourceRef
		if (!element(from) || !element(to) || flowBetween(from, to)) continue
		if (addedFrom.has(from) || addedTo.has(to)) continue
		const written = { line: 0, name: into.name, isDefault: wasDefault || undefined }
		if (into.conditionExpression) carried.set(written, into.conditionExpression)
		connect(from, to, written)
		result.fixes.push(`joined ${from} > ${to} where ${removed} was removed`)
	}

	// ── Tidy references the removals left behind ─────────────────────────────
	const present = new Set(proc().flowElements.map((el) => el.id))
	const flowSet = new Set(proc().sequenceFlows.map((f) => f.id))
	for (const lane of allLanes(proc().laneSet?.lanes)) {
		lane.flowNodeRefs = lane.flowNodeRefs.filter((ref) => present.has(ref))
	}
	for (const el of proc().flowElements) {
		if (hasDefault(el) && el.default !== undefined && !flowSet.has(el.default))
			el.default = undefined
	}

	for (const entry of delta.addressed) {
		const resolved = entry.ids
			.map((w) => real.get(w) ?? gone.get(w))
			.filter((id) => id !== undefined)
		const unknown = entry.ids.filter((w) => !real.has(w) && !gone.has(w))
		if (unknown.length > 0) {
			problem(entry.line, `@${entry.item} names ${unknown.join(", ")}, which is not in the diagram`)
		}
		result.addressed.set(entry.item, [...(result.addressed.get(entry.item) ?? []), ...resolved])
	}

	result.problems.sort((a, b) => a.line - b.line)
	result.changed = [...changed].filter((id) => present.has(id) && !result.created.includes(id))
	result.definitions = defs
	return result

	// ── Helpers that read and write `defs` ───────────────────────────────────

	/** Gives a retyped shape the size of its new type, about the same centre. */
	function resizeAround(id: string, type: BpmnElementType): void {
		const s = shape(id)
		if (!s) return
		const size = sizeOf(type)
		if (size.width === s.bounds.width && size.height === s.bounds.height) return
		s.bounds = {
			x: s.bounds.x + (s.bounds.width - size.width) / 2,
			y: s.bounds.y + (s.bounds.height - size.height) / 2,
			...size,
		}
		// A move of nothing re-routes the shape's flows to its new outline.
		defs = moveShapes(defs, [{ id, dx: 0, dy: 0 }])
	}

	/** Applies the parts of `flow` it states to an existing flow. */
	function restate(existing: BpmnSequenceFlow, flow: DeltaFlow): void {
		let touched = false
		if (flow.name !== undefined && flow.name !== writableLabel(existing.name ?? "")) {
			existing.name = flow.name
			touched = true
		}
		const condition = existing.conditionExpression?.text
		if (
			flow.condition !== undefined &&
			writableCondition(flow.condition) !== writableCondition(condition ?? "")
		) {
			const { problem: notFeel } = conditionOrLabel({ condition: flow.condition })
			if (notFeel !== undefined)
				problem(flow.line, `${notFeel.split(";")[0]}; kept the condition it had`)
			else {
				existing.conditionExpression = { text: flow.condition, attributes: {} }
				touched = true
			}
		}
		const gateway = element(existing.sourceRef)
		if (flow.isDefault && gateway && hasDefault(gateway) && gateway.default !== existing.id) {
			gateway.default = existing.id
			existing.conditionExpression = undefined
			touched = true
		}
		if (touched) changed.add(existing.sourceRef)
	}

	/** Places new nodes in the gap between `a` and `b`, moving shapes right if it is too narrow. */
	function placeBetween(a: string, b: string, chain: readonly string[]): void {
		const from = shape(a)?.bounds
		const to = shape(b)?.bounds
		if (!from || !to || to.x <= right(from)) return
		const sizes = chain.map((w) => sizeOf(fresh.get(w)?.type as BpmnElementType))
		const needed = sizes.reduce((sum, s) => sum + s.width, 0) + GAP * (chain.length + 1)
		const available = to.x - right(from)
		if (needed > available) makeSpace(to.x, needed - available)
		const start = shape(a)?.bounds
		const end = shape(b)?.bounds
		if (!start || !end) return
		// A branch's new step sits on the branch's row; anything else on the row it continues.
		const el = element(a)
		const cy = el && GATEWAYS.has(el.type) ? centreY(end) : centreY(start)
		let x = right(start) + (end.x - right(start) - needed) / 2 + GAP
		let boxes = sizes.map((size) => {
			const box = { x, y: cy - size.height / 2, ...size }
			x += size.width + GAP
			return box
		})
		// Something drawn in the gap — a data object, an annotation — moves the whole row down.
		const all = obstacles()
		for (let k = 0; k < TRIES && boxes.some((b) => all.some((o) => overlaps(b, o))); k++) {
			boxes = boxes.map((b) => ({ ...b, y: b.y + ROW }))
		}
		chain.forEach((w, k) => {
			const node = fresh.get(w)
			const box = boxes[k]
			if (node && box) create(w, node, box)
		})
	}

	/** Moves every top-level shape at or right of `x` by `dx`, and widens the pools and lanes it crosses. */
	function makeSpace(x: number, dx: number): void {
		const topLevel = new Set([
			...proc().flowElements.map((el) => el.id),
			...proc().textAnnotations.map((t) => t.id),
		])
		const moves = plane()
			.shapes.filter((s) => topLevel.has(s.bpmnElement) && s.bounds.x >= x - 1)
			.map((s) => ({ id: s.bpmnElement, dx, dy: 0 }))
		defs = moveShapes(defs, moves)
		for (const s of plane().shapes) {
			if (containerIds.has(s.bpmnElement) && s.bounds.x < x && right(s.bounds) > x - 1) {
				s.bounds = { ...s.bounds, width: s.bounds.width + dx }
			}
		}
	}

	/**
	 * Where a new node goes: on its host's edge for a boundary, otherwise right of
	 * a node it follows, or left of one it leads to. `undefined` until one of
	 * those has been placed.
	 */
	function place(written: string, node: DeltaNode): BpmnBounds | undefined {
		const size = sizeOf(node.type as BpmnElementType)
		if (node.type === "boundaryEvent") {
			const host = node.on === undefined ? undefined : real.get(node.on)
			const hostShape = host === undefined ? undefined : shape(host)?.bounds
			if (host === undefined || !hostShape) return undefined
			const siblings = proc().flowElements.filter(
				(el) => el.type === "boundaryEvent" && el.attachedToRef === host,
			).length
			const cx = right(hostShape) - 25 - siblings * (size.width + 6)
			return { x: cx - size.width / 2, y: bottom(hostShape) - size.height / 2, ...size }
		}
		const before = toAdd.find((f) => f.to === written && real.has(f.from))
		const source = before === undefined ? undefined : real.get(before.from)
		const sourceShape = source === undefined ? undefined : shape(source)?.bounds
		if (source !== undefined && sourceShape) {
			const fromBoundary = element(source)?.type === "boundaryEvent"
			return slot({
				x: right(sourceShape) + (fromBoundary ? GAP / 2 : GAP),
				y: fromBoundary ? bottom(sourceShape) + GAP : centreY(sourceShape) - size.height / 2,
				...size,
			})
		}
		const after = toAdd.find((f) => f.from === written && real.has(f.to))
		const target = after === undefined ? undefined : real.get(after.to)
		const targetShape = target === undefined ? undefined : shape(target)?.bounds
		if (targetShape) {
			return slot({
				x: targetShape.x - GAP - size.width,
				y: centreY(targetShape) - size.height / 2,
				...size,
			})
		}
		return undefined
	}

	/** `bounds`, or the first spot below it that overlaps nothing. */
	function slot(bounds: BpmnBounds): BpmnBounds {
		const all = obstacles()
		let candidate = bounds
		for (let k = 0; k < TRIES && all.some((o) => overlaps(candidate, o)); k++) {
			candidate = { ...candidate, y: candidate.y + ROW }
		}
		return candidate
	}

	/** Creates a new node at `bounds` under the id the script wrote, if it is free. */
	function create(written: string, node: DeltaNode, bounds: BpmnBounds): void {
		const type = node.type as BpmnElementType
		let id = written
		for (let n = 2; taken.has(id); n++) id = `${written}_${n}`
		taken.add(id)
		const named = startingWith(id, ids)
		if (type === "boundaryEvent") {
			const host = real.get(node.on ?? "")
			if (host === undefined) return
			defs = createBoundaryEvent(defs, host, null, bounds, node.interrupting !== false, named).defs
			if (node.name) defs = updateLabel(defs, id, node.name)
		} else {
			defs = createShape(defs, type as CreateShapeType, bounds, node.name, named).defs
		}
		real.set(written, id)
		result.created.push(id)
		placed.set(written, bounds)
		joinLane(id, bounds)

		const patch: Partial<CompactElement> = {}
		if (node.trigger !== undefined) patch.eventType = node.trigger
		if (node.jobType !== undefined) patch.jobType = node.jobType
		else deployable(id, written, type, patch)
		if (Object.keys(patch).length > 0) {
			patches.push({ line: node.line, op: { op: "update", id, patch } })
		}
	}

	/**
	 * What a task of `type` needs to deploy and does not have yet: a job type for
	 * a service or send task, a decision for a business rule task. As in a parsed
	 * draft, the written id stands in, and each one is listed in `fixes`.
	 */
	function deployable(
		id: string,
		written: string,
		type: BpmnElementType,
		patch: Partial<CompactElement>,
	): void {
		const has = (name: string) =>
			element(id)?.extensionElements.some((e) => e.name === name) ?? false
		if (has("zeebe:taskDefinition")) return
		if (JOB_TASKS.has(type)) {
			patch.jobType = written
			result.fixes.push(`gave ${written} the job type "${written}"`)
		} else if (type === "businessRuleTask" && !has("zeebe:calledDecision")) {
			patch.decisionId = written
			result.fixes.push(`gave ${written} the decision "${written}"`)
		}
	}

	/** Adds a new node to the lane it was drawn in. */
	function joinLane(id: string, bounds: BpmnBounds): void {
		const cx = bounds.x + bounds.width / 2
		const cy = centreY(bounds)
		const lane = leafLanes(proc().laneSet?.lanes).find((candidate) => {
			const b = shape(candidate.id)?.bounds
			return b !== undefined && cx >= b.x && cx <= right(b) && cy >= b.y && cy <= bottom(b)
		})
		lane?.flowNodeRefs.push(id)
	}

	/** Draws a flow from `from` to `to` with the label it was written with. */
	function connect(
		from: string,
		to: string,
		written: Pick<DeltaFlow, "name" | "condition" | "isDefault" | "line">,
	): string | undefined {
		// A condition that is not FEEL fails at deploy time; as the label it still says what was meant.
		const { edge: label, problem: notFeel } = conditionOrLabel(written)
		if (notFeel !== undefined) problem(written.line, notFeel)
		const src = shape(from)?.bounds
		const tgt = shape(to)?.bounds
		if (!src || !tgt) return undefined
		const waypoints = computeWaypointsAvoiding(src, tgt, obstacles([from, to]))
		const r = createConnection(defs, from, to, waypoints, ids)
		defs = r.defs
		const flow = proc().sequenceFlows.find((f) => f.id === r.id)
		if (!flow) return undefined
		if (label.name) flow.name = label.name
		const gateway = element(from)
		const kept = carried.get(written)
		if (label.isDefault && gateway && hasDefault(gateway)) gateway.default = flow.id
		else if (kept) flow.conditionExpression = structuredClone(kept)
		else if (label.condition) flow.conditionExpression = { text: label.condition, attributes: {} }
		return flow.id
	}
}
