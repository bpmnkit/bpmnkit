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
 * Like every modelling function here, this acts on one process and its
 * diagram — the only kind of document the Drop room lets anyone edit: the
 * executable one (`primaryProcess`), with its lanes, the partner pools beside
 * it and the messages between them.
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
	type BpmnMessageFlow,
	type BpmnOperation,
	type BpmnParticipant,
	type BpmnProcess,
	type BpmnSequenceFlow,
	type BpmnWaypoint,
	type CompactElement,
	type ConnectorRef,
	type DeltaFlow,
	type DeltaNode,
	ELEMENT_SIZES,
	type ProcessDelta,
	type ProcessTextProblem,
	type ProcessTextQuestion,
	allLanes,
	applyBpmnOperations,
	assignLane,
	conditionOrLabel,
	laneForNewNode,
	leafLanes,
	messageEndProblem,
	nameFromId,
	writableCondition,
	writableLabel,
	writableMessageLabel,
	writableName,
} from "@bpmnkit/core"
import { computeWaypointsAvoiding } from "./geometry.js"
import { type IdFactory, genId } from "./id.js"
import {
	changeElementType,
	createAnnotationWithLink,
	createBoundaryEvent,
	createConnection,
	createShape,
	deleteElements,
	moveShapes,
	updateLabel,
} from "./modeling.js"
import { eventTrigger } from "./rules.js"
import {
	BLACK_BOX_HEIGHT,
	addBlackBox,
	addFirstLane,
	insertLaneBand,
	laneAt,
	messageWaypoints,
	poolPrimary,
	removeBlackBox,
	removeLaneBand,
	swimlaneIds,
	unpooledOther,
	withPrimaryFirst,
} from "./swimlanes.js"
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
	/**
	 * Applies the script's `with` lines. Pass `applyConnectorLines` from
	 * `@bpmnkit/core/connectors`; it is a parameter so that this package does not
	 * carry the connector catalog. Without it, `with` lines are reported and left
	 * out.
	 */
	applyConnectors?: (
		definitions: BpmnDefinitions,
		lines: ConnectorRef[],
	) => {
		definitions: BpmnDefinitions
		problems: ProcessTextProblem[]
		fixes: string[]
		questions: ProcessTextQuestion[]
	}
}

export interface ApplyProcessDeltaResult {
	/** The changed document. The input is never mutated. */
	definitions: BpmnDefinitions
	/** Element ids of the nodes, lanes, pools and message flows the script added. */
	created: string[]
	/**
	 * Element ids of existing nodes it renamed, retyped, gave new attributes or
	 * moved to another lane, or whose outgoing flow or message it relabelled; and
	 * of the lanes and pools it renamed.
	 */
	changed: string[]
	/** Element ids of the nodes, lanes and pools it removed. */
	removed: string[]
	/** Feedback item → the element ids its `@` line names, resolved. */
	addressed: Map<number, string[]>
	/** What the script asked for and was not done, with the line it was asked on. */
	problems: ProcessTextProblem[]
	/** What was done that the script did not say outright, e.g. a flow replaced by an insert. */
	fixes: string[]
	/** Required connector inputs the `with` lines left out, as questions with a line to finish. */
	questions: ProcessTextQuestion[]
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

/**
 * Adds what `form=` and `in.`/`out.` ask for to `patch`, as the script does for `job=`: only
 * what differs from the element as it is, so a restated node patches nothing.
 */
function mappingPatch(
	node: DeltaNode,
	element: BpmnFlowElement,
	patch: Partial<CompactElement>,
	problem: (line: number, message: string) => void,
): void {
	const has = (name: string) => element.extensionElements.find((e) => e.name === name)
	if (node.formId !== undefined) {
		if (element.type !== "startEvent" && element.type !== "userTask") {
			problem(node.line, `form= takes a start or user node; ignored on "${node.id}"`)
		} else if (has("zeebe:formDefinition")?.attributes.formId !== node.formId) {
			patch.formId = node.formId
			if (element.type === "userTask" && !has("zeebe:userTask")) patch.nativeUserTask = true
		}
	}
	const current = has("zeebe:ioMapping")?.children ?? []
	// As `writeProcessText` writes a source, so a restated mapping compares equal to the one shown
	const shown = (source: string) =>
		source.startsWith("=")
			? source.replace(/^=\s*/, "").replace(/\s+/g, " ").trim()
			: JSON.stringify(source)
	for (const [key, kind, wanted] of [
		["inputs", "zeebe:input", node.inputs],
		["outputs", "zeebe:output", node.outputs],
	] as const) {
		const changed = Object.entries(wanted ?? {}).filter(
			([target, source]) =>
				!current.some(
					(c) =>
						c.name === kind &&
						c.attributes.target === target &&
						shown(c.attributes.source ?? "") === shown(source),
				),
		)
		if (changed.length > 0) patch[key] = Object.fromEntries(changed)
	}
}

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

/** The element with `id` at any depth, and the container it sits in (absent: the process itself). */
function findDeep(
	elements: readonly BpmnFlowElement[],
	id: string,
	container?: BpmnFlowElement,
): { element: BpmnFlowElement; container?: BpmnFlowElement } | undefined {
	for (const el of elements) {
		if (el.id === id) return container ? { element: el, container } : { element: el }
		const inner = "flowElements" in el ? el.flowElements : undefined
		const found = inner ? findDeep(inner, id, el) : undefined
		if (found) return found
	}
	return undefined
}

/** Ids of everything inside `elements`, at any depth. */
function deepIds(elements: readonly BpmnFlowElement[], out = new Set<string>()): Set<string> {
	for (const el of elements) {
		out.add(el.id)
		if ("flowElements" in el) deepIds(el.flowElements, out)
	}
	return out
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
 * - `lane l[Name]: a, b` moves `a` and `b` into leaf lane `l`, straight down or
 *   up into its band; a name that differs renames it. A new lane is a band at
 *   the bottom of the process's pool, drawn first when there is none; the
 *   first lane of a pool takes every node. A script never nests a lane.
 * - `pool p[Name]` renames a pool, or adds an empty partner pool below
 *   everything; `msg a > p` adds a message between a node and such a pool, and
 *   `- msg a > p` removes it. `- x` removes a lane (the one above takes its
 *   band and nodes) or an empty partner pool with its messages.
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
	// Nothing to edit: the inner function reports it and hands back the caller's model.
	if (!definitions.processes[0] || !definitions.diagrams[0]) {
		return applyToPrimaryFirst(definitions, delta, options)
	}
	// One copy up front, so the direct edits never reach the caller's model. The
	// modeling helpers edit processes[0] and draw on diagrams[0], and the script was
	// written against the primary process (writeProcessText): it goes first while
	// applying, and back after.
	const held: { result?: ApplyProcessDeltaResult } = {}
	const restored = withPrimaryFirst(structuredClone(definitions), (first) => {
		held.result = applyToPrimaryFirst(first, delta, options)
		// A new object: the delta edits the view in place (lane refs go straight
		// into its processes), and handing the view back would read as "unchanged".
		return { ...held.result.definitions }
	})
	if (!held.result) throw new Error("withPrimaryFirst did not run the delta")
	return { ...held.result, definitions: restored }
}

/**
 * {@link applyProcessDelta} on `definitions`, a private copy whose primary
 * process and the diagram that draws it come first. Edits the copy in place.
 */
function applyToPrimaryFirst(
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
		questions: [],
	}
	const problem = (line: number, message: string) => result.problems.push({ line, message })
	if (!definitions.processes[0] || !definitions.diagrams[0]) {
		problem(0, "the document has no process with a diagram to change")
		return result
	}
	let defs = definitions
	const ids = options.ids ?? genId
	const taken = idsIn(defs)

	const proc = () => defs.processes[0] as BpmnProcess
	const plane = () => (defs.diagrams[0] as NonNullable<BpmnDefinitions["diagrams"][0]>).plane
	// At any depth: the tools of an ad-hoc sub-process are written, so a script may restate them
	const element = (id: string) => findDeep(proc().flowElements, id)?.element
	const containerOf = (id: string) => findDeep(proc().flowElements, id)?.container
	const shape = (id: string) => plane().shapes.find((s) => s.bpmnElement === id)
	const flowsOut = (id: string) => proc().sequenceFlows.filter((f) => f.sourceRef === id)
	const flowsIn = (id: string) => proc().sequenceFlows.filter((f) => f.targetRef === id)
	const flowBetween = (from: string, to: string) =>
		proc().sequenceFlows.find((f) => f.sourceRef === from && f.targetRef === to)

	/** Pools and lanes: drawn as shapes, but containers rather than obstacles. */
	const containerIds = swimlaneIds(defs)
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
		if (node.inside !== undefined) {
			problem(
				node.line,
				`inside=${node.inside} on "${node.id}": a change script cannot add a new node inside an ad-hoc sub-process; left out`,
			)
		} else if (node.type === undefined) {
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
		const holder = containerOf(id)
		if (node.inside !== undefined && real.get(node.inside) !== holder?.id) {
			problem(
				node.line,
				`inside=${node.inside} on "${node.id}": a change script cannot move a node into or out of an ad-hoc sub-process; left where it is`,
			)
		}
		if (node.type !== undefined && node.type !== el.type) {
			if (holder) {
				problem(node.line, `"${node.id}" is inside "${holder.id}"; its kind cannot change here`)
			} else if (el.type === "boundaryEvent" || node.type === "boundaryEvent") {
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
		if (node.script !== undefined) {
			const current = now?.extensionElements.find((e) => e.name === "zeebe:script")
			if (current?.attributes.expression !== node.script) patch.script = node.script
		}
		if (node.resultVariable !== undefined) patch.resultVariable = node.resultVariable
		if (now) mappingPatch(node, now, patch, problem)
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
	/** `- x` lines that name a lane or a pool, removed with the other swimlane lines. */
	const swimlaneRemovals: { id: string; line: number }[] = []
	for (const removal of delta.removedNodes) {
		const id = real.get(removal.id)
		if (id === undefined && swimlaneOf(defs, options.aliases, new Map(), removal.id)) {
			swimlaneRemovals.push(removal)
			continue
		}
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
		const before = deepIds(proc().flowElements)
		// A note goes with the node it is on; `deleteElements` leaves it behind
		const going = new Set(removedIds)
		for (const id of removedIds) {
			const inside = element(id)
			if (inside && "flowElements" in inside)
				for (const inner of deepIds(inside.flowElements)) going.add(inner)
		}
		const noteIds = proc()
			.associations.filter((a) => going.has(a.sourceRef) || going.has(a.targetRef))
			.flatMap((a) => [a.sourceRef, a.targetRef])
			.filter((id) => proc().textAnnotations.some((t) => t.id === id))
		defs = deleteElements(defs, [...removedIds, ...noteIds])
		const after = deepIds(proc().flowElements)
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
		const tool = [flow.from, flow.to].find((w) => {
			const id = real.get(w)
			return id !== undefined && containerOf(id) !== undefined
		})
		if (tool !== undefined) {
			problem(
				flow.line,
				`"${tool}" is inside an ad-hoc sub-process, where a task has no flows; flow ${flow.from} > ${flow.to} left out`,
			)
			continue
		}
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
	/** New nodes of a laned process that no lane band holds; they join a lane once their flows exist. */
	const unlaned: string[] = []
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

	// New nodes drawn outside every lane: now that their flows exist, the lane of what they follow.
	for (const id of unlaned) {
		const lane = laneForNewNode(proc(), id)
		if (lane) defs.processes[0] = assignLane(proc(), id, lane.id)
	}

	// ── Lanes, pools and messages ────────────────────────────────────────────
	// After every node exists, so a lane or msg line can name one the script added.
	const run: SwimlaneRun = {
		defs,
		real,
		aliases: options.aliases,
		ids,
		taken,
		containerIds,
		result,
		changed,
		problem,
		created: new Map(),
	}
	applySwimlaneLines(run, delta, swimlaneRemovals)
	defs = run.defs

	// ── Tidy references the removals left behind ─────────────────────────────
	const present = deepIds(proc().flowElements)
	const flowSet = new Set(proc().sequenceFlows.map((f) => f.id))
	for (const lane of allLanes(proc().laneSet)) {
		lane.flowNodeRefs = lane.flowNodeRefs.filter((ref) => present.has(ref))
	}
	const removedNodes = new Set(result.removed)
	dropMessageFlows(defs, (f) => removedNodes.has(f.sourceRef) || removedNodes.has(f.targetRef))
	for (const el of proc().flowElements) {
		if (hasDefault(el) && el.default !== undefined && !flowSet.has(el.default))
			el.default = undefined
	}

	// ── Connectors ───────────────────────────────────────────────────────────
	// Last, so a `with` line can name a node the script added or retyped.
	const connectorLines: ConnectorRef[] = []
	for (const line of delta.connectors) {
		const id = real.get(line.id)
		if (id === undefined || !element(id)) {
			problem(line.line, `"with ${line.id}:" names no node of the diagram; ignored`)
		} else if (!options.applyConnectors) {
			problem(line.line, `"with ${line.id}:" needs the connector catalog to apply; ignored`)
		} else {
			connectorLines.push({ ...line, elementId: id })
		}
	}
	if (options.applyConnectors && connectorLines.length > 0) {
		const applied = options.applyConnectors(defs, connectorLines)
		defs = applied.definitions
		result.problems.push(...applied.problems)
		result.fixes.push(...applied.fixes)
		result.questions.push(...applied.questions)
		for (const line of connectorLines) changed.add(line.elementId)
	}

	// ── Documentation ────────────────────────────────────────────────────────
	// Last, like notes, so it can name a node the script added or one inside an ad-hoc sub-process.
	const documented: BpmnOperation[] = []
	for (const doc of delta.docs) {
		const target = real.get(doc.id) ?? options.aliases[doc.id]
		const current = target === undefined ? undefined : element(target)
		if (target === undefined || !current) {
			problem(doc.line, `doc ${doc.id}: "${doc.id}" is not in the diagram; ignored`)
		} else if ((current.documentation ?? "").replace(/\s+/g, " ").trim() !== doc.text) {
			// Compared as the writer shows it (one line), so restating changes nothing
			documented.push({ op: "update", id: target, patch: { documentation: doc.text } })
			changed.add(target)
		}
	}
	if (documented.length > 0) {
		defs = applyBpmnOperations(defs, documented, { strict: false }).definitions
	}

	// ── Notes ────────────────────────────────────────────────────────────────
	// Last, so a note can name a node the script added. A tool inside an ad-hoc sub-process has an
	// alias too, and a shape of its own to be drawn beside.
	for (const note of delta.notes) {
		const target = real.get(note.id) ?? options.aliases[note.id]
		const bounds = target === undefined || !element(target) ? undefined : shape(target)?.bounds
		if (target === undefined || !bounds) {
			problem(note.line, `note ${note.id}: "${note.id}" is not in the diagram; ignored`)
			continue
		}
		// Restating a note the node already has changes nothing
		const annotations = new Map(proc().textAnnotations.map((t) => [t.id, t.text ?? ""]))
		const held = proc().associations.some((a) => {
			const other = a.sourceRef === target ? a.targetRef : a.targetRef === target ? a.sourceRef : ""
			return annotations.get(other) === note.text
		})
		if (held) continue
		const size = { width: 200, height: 60 }
		const above = slot({
			x: bounds.x + bounds.width / 2 - size.width / 2,
			y: bounds.y - 30 - size.height,
			...size,
		})
		defs = createAnnotationWithLink(defs, above, target, bounds, note.text, ids).defs
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
	const reportable = new Set([
		...present,
		...allLanes(proc().laneSet).map((lane) => lane.id),
		...defs.collaborations.flatMap((c) => c.participants.map((p) => p.id)),
	])
	result.changed = [...changed].filter((id) => reportable.has(id) && !result.created.includes(id))
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
		if (node.script !== undefined) patch.script = node.script
		if (node.resultVariable !== undefined) patch.resultVariable = node.resultVariable
		const created = element(id)
		if (created) mappingPatch(node, created, patch, problem)
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

	/**
	 * Adds a new node to the leaf lane it was drawn in. One drawn outside every
	 * lane, and a boundary event (its host's lane, not the band its centre
	 * crosses), is left to `unlaned`.
	 */
	function joinLane(id: string, bounds: BpmnBounds): void {
		if (leafLanes(proc().laneSet).length === 0) return
		const centre = { x: bounds.x + bounds.width / 2, y: centreY(bounds) }
		const boundary = element(id)?.type === "boundaryEvent"
		const lane = boundary ? undefined : laneAt(defs, proc(), centre)
		if (lane) defs.processes[0] = assignLane(proc(), id, lane.id)
		else unlaned.push(id)
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

// ── Lanes, pools and messages ────────────────────────────────────────────────

/** Gap between a partner pool added by a script and the lowest shape above it. */
const POOL_GAP = 30

/** Elements a lane never lists. */
const DATA_TYPES = new Set<BpmnElementType>([
	"dataObject",
	"dataObjectReference",
	"dataStoreReference",
])

/** What the lane, pool and msg lines read and write while they apply. */
interface SwimlaneRun {
	/** The document, with the primary process first. */
	defs: BpmnDefinitions
	/** Written id → node id, for every node of the primary process the script may name. */
	real: ReadonlyMap<string, string>
	aliases: Readonly<Record<string, string>>
	ids: IdFactory
	/** Every id in use; new ones are claimed here. */
	taken: Set<string>
	/** Pools and lanes, which placement treats as containers rather than obstacles. */
	containerIds: Set<string>
	result: ApplyProcessDeltaResult
	changed: Set<string>
	problem: (line: number, message: string) => void
	/** Lanes and pools the script created, by written id. */
	created: Map<string, string>
}

type Swimlane = { kind: "lane"; lane: BpmnLane } | { kind: "pool"; pool: BpmnParticipant }

/**
 * The lane of the primary process (`defs.processes[0]`) or the pool of the
 * first collaboration that `written` names: through the lanes and pools the
 * script created, then the aliases, then as a real id.
 */
function swimlaneOf(
	defs: BpmnDefinitions,
	aliases: Readonly<Record<string, string>>,
	created: ReadonlyMap<string, string>,
	written: string,
): Swimlane | undefined {
	const id = created.get(written) ?? aliases[written] ?? written
	const lane = allLanes(defs.processes[0]?.laneSet).find((candidate) => candidate.id === id)
	if (lane) return { kind: "lane", lane }
	const pool = defs.collaborations[0]?.participants.find((candidate) => candidate.id === id)
	return pool ? { kind: "pool", pool } : undefined
}

/**
 * Removes from `defs`, in place, the message flows `drop` picks and the
 * diagram edges that draw them.
 */
function dropMessageFlows(defs: BpmnDefinitions, drop: (flow: BpmnMessageFlow) => boolean): void {
	const gone = new Set<string>()
	for (const collaboration of defs.collaborations) {
		for (const flow of collaboration.messageFlows) if (drop(flow)) gone.add(flow.id)
		collaboration.messageFlows = collaboration.messageFlows.filter((flow) => !gone.has(flow.id))
	}
	if (gone.size === 0) return
	for (const diagram of defs.diagrams) {
		diagram.plane.edges = diagram.plane.edges.filter((edge) => !gone.has(edge.bpmnElement))
	}
}

/**
 * Applies the lane, pool and msg lines, in an order where each can use what the
 * one before made: lanes, pools, message removals, messages, then the `- x`
 * lines that name a lane or a pool.
 */
function applySwimlaneLines(
	run: SwimlaneRun,
	delta: ProcessDelta,
	removals: readonly { id: string; line: number }[],
): void {
	const listed = new Set(delta.lanes.flatMap((line) => line.nodes))
	for (const line of delta.lanes) applyLaneLine(run, line, listed)
	for (const line of delta.pools) applyPoolLine(run, line)
	for (const line of delta.removedMessageFlows) removeMessageLine(run, line)
	for (const line of delta.messageFlows) applyMessageLine(run, line)
	for (const removal of removals) removeSwimlane(run, removal)
}

const primaryOf = (run: SwimlaneRun) => run.defs.processes[0] as BpmnProcess
const planeOf = (run: SwimlaneRun) =>
	(run.defs.diagrams[0] as NonNullable<BpmnDefinitions["diagrams"][0]>).plane
const shapeOf = (run: SwimlaneRun, id: string) =>
	planeOf(run).shapes.find((s) => s.bpmnElement === id)

function setPrimary(run: SwimlaneRun, process: BpmnProcess): void {
	run.defs = { ...run.defs, processes: [process, ...run.defs.processes.slice(1)] }
}

/** `wanted` when it is free, else a new id from the factory; claimed either way. */
function claim(run: SwimlaneRun, wanted: string | undefined, prefix: string): string {
	let id = wanted !== undefined && !run.taken.has(wanted) ? wanted : run.ids(prefix)
	for (let k = 0; k < TRIES && run.taken.has(id); k++) id = run.ids(prefix)
	run.taken.add(id)
	return id
}

/** The id the script knows `id` by, for messages: its alias, else the id itself. */
function writtenOf(run: SwimlaneRun, id: string): string {
	for (const [written, real] of run.real) if (real === id) return written
	return id
}

/** A `lane` line: moves its nodes into an existing leaf lane, renaming it, or into a new one. */
function applyLaneLine(
	run: SwimlaneRun,
	line: ProcessDelta["lanes"][number],
	listed: ReadonlySet<string>,
): void {
	const found = swimlaneOf(run.defs, run.aliases, run.created, line.id)
	if (found?.kind === "pool") {
		run.problem(line.line, `lane ${line.id}: "${line.id}" is a pool, not a lane; ignored`)
		return
	}
	let laneId = found?.lane.id
	if (laneId !== undefined && !leafLanes(primaryOf(run).laneSet).some((l) => l.id === laneId)) {
		run.problem(line.line, `lane ${line.id}: it has lanes inside it; name one of those; ignored`)
		return
	}
	if (found === undefined) laneId = addLane(run, line, listed)
	else renameLane(run, found.lane.id, line.name)
	if (laneId === undefined) return
	for (const written of line.nodes) moveIntoLane(run, written, laneId, line)
}

function renameLane(run: SwimlaneRun, laneId: string, name: string | undefined): void {
	const lane = allLanes(primaryOf(run).laneSet).find((candidate) => candidate.id === laneId)
	if (!lane || name === undefined || name === writableName(lane.name ?? "")) return
	lane.name = name
	run.changed.add(laneId)
}

/** Puts a top-level node in leaf lane `laneId`, and its shape in the lane's band. */
function moveIntoLane(
	run: SwimlaneRun,
	written: string,
	laneId: string,
	line: ProcessDelta["lanes"][number],
): void {
	const refuse = (why: string) => run.problem(line.line, `lane ${line.id}: "${written}" ${why}`)
	const id = run.real.get(written)
	const node = primaryOf(run).flowElements.find((el) => el.id === id)
	if (id === undefined) {
		refuse("is not in the diagram; left out")
		return
	}
	if (!node) {
		refuse("is inside a sub-process; only top-level nodes go in a lane")
		return
	}
	const lane = allLanes(primaryOf(run).laneSet).find((candidate) => candidate.id === laneId)
	// Restating where a node already is changes nothing, wherever it is drawn.
	if (lane?.flowNodeRefs.includes(id)) return
	if (node.type === "boundaryEvent") {
		// The writer lists a boundary event beside its host; the host's move carries it.
		const hostListed = line.nodes.some((other) => run.real.get(other) === node.attachedToRef)
		if (!hostListed) refuse("is a boundary event; it stays in its host's lane")
		return
	}
	setPrimary(run, assignLane(primaryOf(run), id, laneId))
	run.changed.add(id)
	moveIntoBand(run, id, laneId)
}

/** Moves a node straight up or down to the middle of a lane's band, unless its centre is already in it. */
function moveIntoBand(run: SwimlaneRun, id: string, laneId: string): void {
	const band = shapeOf(run, laneId)?.bounds
	const node = shapeOf(run, id)?.bounds
	if (!band || !node) return
	const cy = centreY(node)
	if (cy >= band.y && cy <= bottom(band)) return
	// ponytail: the middle of the band, not a free spot in it; slot() there if crowded lanes overlap
	const dy = centreY(band) - cy
	// moveShapes carries boundary events and sub-process content along, and re-docks their messages.
	run.defs = moveShapes(run.defs, [{ id, dx: 0, dy }])
}

/**
 * Adds a top-level lane for a `lane` line with a new id, at the bottom of the
 * primary process's pool (drawn first if there is none). Returns its id.
 */
function addLane(
	run: SwimlaneRun,
	line: ProcessDelta["lanes"][number],
	listed: ReadonlySet<string>,
): string | undefined {
	const pool = ownPool(run, line.line)
	if (!pool) return undefined
	// The bands are laid out horizontally only; one across a column pool would cover its lanes.
	if (shapeOf(run, pool.id)?.isHorizontal === false) {
		run.problem(
			line.line,
			`lane ${line.id}: pool "${pool.id}" is drawn vertically; lanes are added to horizontal pools only; left out`,
		)
		return undefined
	}
	const id = claim(run, line.id, "Lane")
	const shapeId = claim(run, `${id}_di`, "Lane_di")
	const lane: BpmnLane = {
		id,
		name: line.name ?? nameFromId(line.id),
		flowNodeRefs: [],
		unknownAttributes: {},
	}
	const laneSet = primaryOf(run).laneSet
	if (laneSet && laneSet.lanes.length > 0) {
		laneSet.lanes.push(lane)
		run.defs = insertLaneBand(run.defs, pool.id, id, shapeId)
	} else {
		const process = primaryOf(run)
		run.defs = addFirstLane(run.defs, pool.id, lane, shapeId, () =>
			claim(run, `LaneSet_${process.id}`, "LaneSet"),
		)
		const placed = allLanes(primaryOf(run).laneSet).find((candidate) => candidate.id === id)
		for (const nodeId of placed?.flowNodeRefs ?? []) {
			const written = writtenOf(run, nodeId)
			const boundary = primaryOf(run).flowElements.some(
				(el) => el.id === nodeId && el.type === "boundaryEvent",
			)
			if (!boundary && !listed.has(written)) {
				run.result.fixes.push(`put "${written}", which no lane named, in lane ${line.id}`)
			}
		}
	}
	run.created.set(line.id, id)
	run.containerIds.add(id)
	run.result.created.push(id)
	return id
}

/**
 * The participant of the primary process, made when missing (`poolPrimary`):
 * a collaboration if there is none, a participant for this process only, and
 * a pool shape drawn around the process on a plane that then draws the
 * collaboration. Other processes are left as they are: a script edits one
 * process, and pooling another would mark it non-executable. Reported and
 * left out while another process with content has no pool (`unpooledOther`).
 */
function ownPool(run: SwimlaneRun, line: number): BpmnParticipant | undefined {
	const process = primaryOf(run)
	if (process.flowElements.length === 0 && !process.laneSet) {
		run.problem(line, "the process has nothing in it to draw a pool around; left out")
		return undefined
	}
	const pooled = poolPrimary(
		run.defs,
		{
			collaboration: () => claim(run, "Collaboration_1", "Collaboration"),
			participant: () => claim(run, `Participant_${process.id}`, "Participant"),
			shape: (poolId) => claim(run, `${poolId}_di`, "Participant_di"),
		},
		process.name ?? process.id,
	)
	if (!pooled) {
		const other = unpooledOther(run.defs, process)
		if (other) {
			run.problem(
				line,
				`process "${other.id}" has content and no pool, and once there is a pool every such process needs one; left out`,
			)
		}
		return undefined
	}
	run.defs = pooled.defs
	run.containerIds.add(pooled.pool.id)
	if (pooled.drew) {
		run.result.fixes.push(
			`drew the pool "${pooled.pool.name ?? pooled.pool.id}" around the process`,
		)
	}
	return pooled.pool
}

/** A `pool` line: renames a pool, or adds an empty partner pool below everything. */
function applyPoolLine(run: SwimlaneRun, line: ProcessDelta["pools"][number]): void {
	const found = swimlaneOf(run.defs, run.aliases, run.created, line.id)
	if (found?.kind === "lane") {
		run.problem(line.line, `pool ${line.id}: "${line.id}" is a lane, not a pool; ignored`)
		return
	}
	if (found) {
		if (line.name === undefined || line.name === writableName(found.pool.name ?? "")) return
		found.pool.name = line.name
		run.changed.add(found.pool.id)
		return
	}
	const own = ownPool(run, line.line)
	const ownBounds = own === undefined ? undefined : shapeOf(run, own.id)?.bounds
	if (!own || !ownBounds) return
	const id = claim(run, line.id, "Participant")
	const lowest = Math.max(
		...planeOf(run).shapes.flatMap((s) => [
			bottom(s.bounds),
			...(s.label?.bounds ? [bottom(s.label.bounds)] : []),
		]),
	)
	const participant = { id, name: line.name ?? nameFromId(line.id), unknownAttributes: {} }
	run.defs = addBlackBox(run.defs, own.id, participant, claim(run, `${id}_di`, "Participant_di"), {
		x: ownBounds.x,
		y: lowest + POOL_GAP,
		width: ownBounds.width,
		height: BLACK_BOX_HEIGHT,
	})
	run.created.set(line.id, id)
	run.containerIds.add(id)
	run.result.created.push(id)
}

/** The two ends of a `msg` line, resolved: a node of the primary process and another pool. */
interface MessageEnds {
	source: string
	target: string
	node: BpmnFlowElement
	pool: BpmnParticipant
	nodeSends: boolean
}

/** Resolves a `msg` line's ends, or says why they are not a node and another pool. */
function messageEnds(run: SwimlaneRun, line: { from: string; to: string }): MessageEnds | string {
	const nodeOf = (written: string) => {
		const id = run.real.get(written)
		return id === undefined ? undefined : findDeep(primaryOf(run).flowElements, id)?.element
	}
	const poolOf = (written: string) => {
		const found = swimlaneOf(run.defs, run.aliases, run.created, written)
		return found?.kind === "pool" ? found.pool : undefined
	}
	const fromNode = nodeOf(line.from)
	const toNode = nodeOf(line.to)
	if (fromNode && toNode) {
		return "both ends are in this process; a message goes to or comes from a pool line"
	}
	const fromPool = fromNode ? undefined : poolOf(line.from)
	const toPool = toNode ? undefined : poolOf(line.to)
	if (fromPool && toPool) return "both ends are pools; one end must be a node of the process"
	const node = fromNode ?? toNode
	const pool = fromPool ?? toPool
	if (!node || !pool)
		return `"${fromNode || fromPool ? line.to : line.from}" is not a node or a pool`
	if (pool.processRef === primaryOf(run).id) {
		return "that is this process's own pool; a message goes to another pool"
	}
	const nodeSends = node === fromNode
	return {
		source: nodeSends ? node.id : pool.id,
		target: nodeSends ? pool.id : node.id,
		node,
		pool,
		nodeSends,
	}
}

/** A `msg` line: adds the message, relabels one the diagram has, or restates it. */
function applyMessageLine(run: SwimlaneRun, line: ProcessDelta["messageFlows"][number]): void {
	const ends = messageEnds(run, line)
	const reason =
		typeof ends === "string"
			? ends
			: messageEndProblem(
					ends.node.type,
					eventTrigger(ends.node),
					ends.nodeSends ? "source" : "target",
				)
	const collaboration = run.defs.collaborations[0]
	if (typeof ends === "string" || reason !== undefined || !collaboration) {
		run.problem(line.line, `msg ${line.from} > ${line.to}: ${reason}; left out`)
		return
	}
	const existing = collaboration.messageFlows.find(
		(f) => f.sourceRef === ends.source && f.targetRef === ends.target,
	)
	if (existing) {
		if (line.name === undefined || line.name === writableMessageLabel(existing.name ?? "")) return
		existing.name = line.name
		run.changed.add(ends.node.id)
		return
	}
	const id = claim(run, undefined, "MessageFlow")
	collaboration.messageFlows.push({
		id,
		...(line.name !== undefined ? { name: line.name } : {}),
		sourceRef: ends.source,
		targetRef: ends.target,
		unknownAttributes: {},
	})
	const node = shapeOf(run, ends.node.id)?.bounds
	const pool = shapeOf(run, ends.pool.id)?.bounds
	if (node && pool) {
		planeOf(run).edges.push({
			id: claim(run, undefined, "MessageFlow_di"),
			bpmnElement: id,
			waypoints: messageWaypoints(node, pool, ends.nodeSends),
			unknownAttributes: {},
		})
	}
	run.result.created.push(id)
}

/** A `- msg a > b` line: removes that message and its edge. */
function removeMessageLine(
	run: SwimlaneRun,
	line: ProcessDelta["removedMessageFlows"][number],
): void {
	const ends = messageEnds(run, line)
	const flow =
		typeof ends === "string"
			? undefined
			: run.defs.collaborations[0]?.messageFlows.find(
					(f) => f.sourceRef === ends.source && f.targetRef === ends.target,
				)
	if (!flow) {
		run.problem(line.line, `there is no message ${line.from} > ${line.to} to remove`)
		return
	}
	dropMessageFlows(run.defs, (f) => f === flow)
}

/**
 * A `- x` line naming a lane or a pool. A lane goes, its band and nodes to its
 * neighbour; a black box (`isBlackBox`) goes with its messages and its empty
 * process. The process's own pool and a pool that draws a process with content
 * stay: a script edits one process.
 */
function removeSwimlane(run: SwimlaneRun, removal: { id: string; line: number }): void {
	const found = swimlaneOf(run.defs, run.aliases, run.created, removal.id)
	const refuse = (why: string) => run.problem(removal.line, `cannot remove "${removal.id}": ${why}`)
	if (!found) {
		refuse("it is not in the diagram")
		return
	}
	if (found.kind === "lane") {
		const next = removeLaneBand(run.defs, 0, found.lane.id)
		if (!next) {
			refuse("it has lanes inside it; remove those first")
			return
		}
		run.defs = next
		run.result.removed.push(found.lane.id)
		return
	}
	const { pool } = found
	if (pool.processRef === primaryOf(run).id) {
		refuse("it is the pool of this process")
		return
	}
	// A black box goes with its messages, and with its process when that is empty (U3).
	const next = removeBlackBox(run.defs, pool.id)
	if (!next) {
		refuse("it draws a process of its own")
		return
	}
	run.defs = next
	run.result.removed.push(pool.id)
}
