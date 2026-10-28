/**
 * Pure helpers for writing lanes and pools: every writer (builder, compact,
 * process text, change scripts, editor) goes through these so they agree on
 * one set of invariants. None of them mutates its input.
 *
 * Invariants a well-formed laned process meets (see {@link laneProblems}):
 * every top-level flow node sits in exactly one leaf lane, a boundary event
 * sits in its host's lane, sub-process children and data references sit in
 * none. Ancestor lanes may or may not repeat their descendants' refs: Flowable
 * and Camunda Modeler write the union, the editor writes leaves only, and both
 * are accepted.
 */

import type {
	BpmnCollaboration,
	BpmnDefinitions,
	BpmnFlowElement,
	BpmnLane,
	BpmnLaneSet,
	BpmnParticipant,
	BpmnProcess,
} from "./bpmn-model.js"

/** A lane to build: a leaf when `lanes` is absent or empty. Same shape as compact's lane. */
export interface LaneSpec {
	id: string
	name?: string
	lanes?: LaneSpec[]
}

interface LaneEntry {
	lane: BpmnLane
	/** Outermost first. */
	ancestors: BpmnLane[]
}

const DATA_ELEMENT_TYPES: ReadonlySet<string> = new Set([
	"dataObject",
	"dataObjectReference",
	"dataStoreReference",
])

/**
 * Every lane of `laneSet`, depth first with each lane's ancestors.
 * Throws when a lane object is reached twice, which is the only way a
 * programmatically built lane tree can loop.
 */
function laneEntries(laneSet: BpmnLaneSet | undefined): LaneEntry[] {
	const entries: LaneEntry[] = []
	const seen = new Set<BpmnLane>()
	const visit = (set: BpmnLaneSet | undefined, ancestors: BpmnLane[]): void => {
		for (const lane of set?.lanes ?? []) {
			if (seen.has(lane)) throw new Error(revisitMessage(lane.id))
			seen.add(lane)
			entries.push({ lane, ancestors })
			visit(lane.childLaneSet, [...ancestors, lane])
		}
	}
	visit(laneSet, [])
	return entries
}

function revisitMessage(laneId: string): string {
	return `Lane "${laneId}" appears twice in one lane tree; a lane tree must not loop back on itself`
}

function isLeaf(lane: BpmnLane): boolean {
	return (lane.childLaneSet?.lanes.length ?? 0) === 0
}

/** Rebuilds `laneSet` with each lane's refs replaced by `refsFor(lane)`, keeping everything else. */
function mapLaneRefs(laneSet: BpmnLaneSet, refsFor: (lane: BpmnLane) => string[]): BpmnLaneSet {
	const seen = new Set<BpmnLane>()
	const rebuild = (set: BpmnLaneSet): BpmnLaneSet => ({
		...set,
		lanes: set.lanes.map((lane) => {
			if (seen.has(lane)) throw new Error(revisitMessage(lane.id))
			seen.add(lane)
			const next: BpmnLane = { ...lane, flowNodeRefs: refsFor(lane) }
			if (lane.childLaneSet !== undefined) next.childLaneSet = rebuild(lane.childLaneSet)
			return next
		}),
	})
	return rebuild(laneSet)
}

function isFlowNode(element: BpmnFlowElement): boolean {
	return !DATA_ELEMENT_TYPES.has(element.type)
}

/** Ids of the top-level boundary events attached to `hostId`. */
function boundaryEventIds(process: BpmnProcess, hostId: string): string[] {
	return process.flowElements
		.filter((element) => element.type === "boundaryEvent" && element.attachedToRef === hostId)
		.map((element) => element.id)
}

/** Ids of every element nested inside a container (sub-process, transaction, …), at any depth. */
function nestedElementIds(elements: readonly BpmnFlowElement[]): Set<string> {
	const ids = new Set<string>()
	const seen = new Set<BpmnFlowElement>()
	const visit = (children: readonly BpmnFlowElement[]): void => {
		for (const child of children) {
			if (seen.has(child)) {
				throw new Error(`Flow element "${child.id}" appears twice in one element tree`)
			}
			seen.add(child)
			ids.add(child.id)
			if ("flowElements" in child) visit(child.flowElements)
		}
	}
	for (const element of elements) {
		if ("flowElements" in element) visit(element.flowElements)
	}
	return ids
}

function hasContent(process: BpmnProcess): boolean {
	return process.flowElements.length > 0 || process.laneSet !== undefined
}

/**
 * Every lane of `laneSet`, nested ones included, depth first (a parent before
 * its children). Throws when the lane tree loops back on itself.
 */
export function allLanes(laneSet?: BpmnLaneSet): BpmnLane[] {
	return laneEntries(laneSet).map((entry) => entry.lane)
}

/**
 * The lanes of `laneSet` that have no child lanes, depth first: the lanes a
 * flow node is assigned to. Throws when the lane tree loops back on itself.
 */
export function leafLanes(laneSet?: BpmnLaneSet): BpmnLane[] {
	return allLanes(laneSet).filter(isLeaf)
}

/**
 * The deepest lane of `process` whose refs list `nodeId`, so a union-convention
 * ancestor never wins over the leaf. `undefined` when no lane lists it.
 */
export function laneOf(process: BpmnProcess, nodeId: string): BpmnLane | undefined {
	let deepest: LaneEntry | undefined
	for (const entry of laneEntries(process.laneSet)) {
		if (!entry.lane.flowNodeRefs.includes(nodeId)) continue
		if (deepest === undefined || entry.ancestors.length > deepest.ancestors.length) deepest = entry
	}
	return deepest?.lane
}

/**
 * True when one of `ancestors` already repeats a ref of its descendants, i.e.
 * the file follows the union convention and expects it kept.
 */
function followsUnion(ancestors: readonly BpmnLane[]): boolean {
	return ancestors.some((ancestor) => {
		const own = new Set(ancestor.flowNodeRefs)
		return allLanes(ancestor.childLaneSet).some((lane) =>
			lane.flowNodeRefs.some((ref) => own.has(ref)),
		)
	})
}

/**
 * Returns a copy of `process` in which `nodeId` and the boundary events
 * attached to it sit in leaf lane `laneId` and in no other lane.
 *
 * Ancestors of the target receive the node too only when the file already
 * follows the union convention there; otherwise only the leaf is written.
 * Whether `nodeId` exists is not checked ({@link laneProblems} reports it).
 *
 * @throws Error when `laneId` is not a lane of `process`, or has child lanes.
 */
export function assignLane(process: BpmnProcess, nodeId: string, laneId: string): BpmnProcess {
	const laneSet = process.laneSet
	const target = laneEntries(laneSet).find((entry) => entry.lane.id === laneId)
	if (laneSet === undefined || target === undefined) {
		throw new Error(`Lane "${laneId}" is not declared in process "${process.id}"`)
	}
	if (!isLeaf(target.lane)) {
		throw new Error(
			`Lane "${laneId}" has child lanes; "${nodeId}" must go in one of its leaf lanes`,
		)
	}

	const moving = [nodeId, ...boundaryEventIds(process, nodeId)]
	const movingIds = new Set(moving)
	const receivers = new Set<BpmnLane>([
		target.lane,
		...(followsUnion(target.ancestors) ? target.ancestors : []),
	])
	return {
		...process,
		laneSet: mapLaneRefs(laneSet, (lane) => {
			const kept = lane.flowNodeRefs.filter((ref) => !movingIds.has(ref))
			return receivers.has(lane) ? [...kept, ...moving] : kept
		}),
	}
}

/**
 * Returns a copy of `process` whose lanes list only its top-level flow nodes:
 * refs to missing ids, sub-process children and data references are dropped.
 * A lane set without lanes is removed. A process without a lane set is
 * returned as it is.
 */
export function pruneLaneRefs(process: BpmnProcess): BpmnProcess {
	const { laneSet, ...rest } = process
	if (laneSet === undefined) return process
	if (laneSet.lanes.length === 0) return rest

	const flowNodeIds = new Set(process.flowElements.filter(isFlowNode).map((e) => e.id))
	return {
		...rest,
		laneSet: mapLaneRefs(laneSet, (lane) => lane.flowNodeRefs.filter((r) => flowNodeIds.has(r))),
	}
}

/** Ids of all lanes in `specs`, and of the leaves among them. Throws on a looping spec tree. */
function specIds(specs: readonly LaneSpec[]): { all: Set<string>; leaves: Set<string> } {
	const all = new Set<string>()
	const leaves = new Set<string>()
	const seen = new Set<LaneSpec>()
	const visit = (children: readonly LaneSpec[]): void => {
		for (const spec of children) {
			if (seen.has(spec)) throw new Error(revisitMessage(spec.id))
			seen.add(spec)
			all.add(spec.id)
			if ((spec.lanes?.length ?? 0) === 0) leaves.add(spec.id)
			else visit(spec.lanes ?? [])
		}
	}
	visit(specs)
	return { all, leaves }
}

/**
 * Builds the lane set of `process` from `specs` and `leafOf` (flow node id to
 * leaf lane id). Refs keep `leafOf`'s order and ids verbatim, so
 * {@link laneProblems} can still report a ref to an unknown node. A boundary
 * event always joins its host's lane when the host is mapped. Parent lanes list
 * the union of their descendants' refs. Ids: `LaneSet_<processId>` for the set,
 * `LaneSet_<laneId>` for a child set, with a numeric suffix when already in use.
 *
 * @throws Error listing every `leafOf` entry that names an undeclared lane or a
 *   lane with child lanes, or when `specs` loops back on itself.
 */
export function buildLaneSet(
	process: BpmnProcess,
	specs: readonly LaneSpec[],
	leafOf: ReadonlyMap<string, string>,
): BpmnLaneSet {
	const ids = specIds(specs)
	const problems: string[] = []
	for (const [nodeId, laneId] of leafOf) {
		if (!ids.all.has(laneId)) problems.push(`Lane "${laneId}" is not declared`)
		else if (!ids.leaves.has(laneId)) {
			problems.push(
				`Lane "${laneId}" has child lanes; "${nodeId}" must go in one of its leaf lanes`,
			)
		}
	}
	if (problems.length > 0) throw new Error(`Invalid lane membership:\n  ${problems.join("\n  ")}`)

	const hostOf = new Map<string, string>()
	for (const element of process.flowElements) {
		if (element.type === "boundaryEvent") hostOf.set(element.id, element.attachedToRef)
	}
	const refsByLane = new Map<string, string[]>()
	const place = (laneId: string, nodeId: string): void => {
		refsByLane.set(laneId, [...(refsByLane.get(laneId) ?? []), nodeId])
	}
	for (const [nodeId, laneId] of leafOf) {
		const host = hostOf.get(nodeId)
		if (host !== undefined && leafOf.has(host)) continue // placed together with its host
		place(laneId, nodeId)
		for (const eventId of boundaryEventIds(process, nodeId)) place(laneId, eventId)
	}

	// A lane may be named `LaneSet_<id>` too; the set ids step around every id in use.
	const taken = new Set<string>([
		process.id,
		...ids.all,
		...process.flowElements.map((element) => element.id),
		...process.sequenceFlows.map((flow) => flow.id),
	])
	const setId = (owner: string) =>
		freshId(`LaneSet_${owner}`, (n) => `LaneSet_${owner}_${n}`, taken)
	// specIds has rejected a looping spec tree, so this recursion terminates.
	const toLane = (spec: LaneSpec): BpmnLane => {
		const children = (spec.lanes ?? []).map(toLane)
		const lane: BpmnLane = {
			id: spec.id,
			flowNodeRefs:
				children.length === 0
					? (refsByLane.get(spec.id) ?? [])
					: [...new Set(children.flatMap((child) => child.flowNodeRefs))],
			unknownAttributes: {},
		}
		if (spec.name !== undefined) lane.name = spec.name
		if (children.length > 0) {
			lane.childLaneSet = { id: setId(spec.id), lanes: children, unknownAttributes: {} }
		}
		return lane
	}
	const rootId = setId(process.id)
	return { id: rootId, lanes: specs.map(toLane), unknownAttributes: {} }
}

/**
 * The leaf lane a node newly added to an already-laned `process` belongs in:
 * its host's lane for a boundary event, else the lane of its first sequence-flow
 * predecessor that has one, else of its first such successor, else the first
 * leaf lane. `undefined` when the process has no lanes.
 */
export function laneForNewNode(process: BpmnProcess, nodeId: string): BpmnLane | undefined {
	const leaves = leafLanes(process.laneSet)
	if (leaves.length === 0) return undefined

	const element = process.flowElements.find((e) => e.id === nodeId)
	const neighbours = [
		...(element?.type === "boundaryEvent" ? [element.attachedToRef] : []),
		...process.sequenceFlows.filter((f) => f.targetRef === nodeId).map((f) => f.sourceRef),
		...process.sequenceFlows.filter((f) => f.sourceRef === nodeId).map((f) => f.targetRef),
	]
	for (const neighbour of neighbours) {
		const leaf = leaves.find((lane) => lane.flowNodeRefs.includes(neighbour))
		if (leaf !== undefined) return leaf
	}
	return leaves[0]
}

/**
 * The process a single-process writer edits: the first process, in the
 * participant order of `collaborations[0]`, that is explicitly executable; else
 * the first explicitly executable process; else the first process with flow
 * elements or lanes. When every process is empty, the candidates are the ones
 * not marked `isExecutable="false"` (Flowable reads an absent attribute as
 * executable), or all of them when every one is; among them the one whose pool
 * is drawn largest, else the first. Modeler files do not always put the
 * executable pool first.
 */
export function primaryProcess(
	defs: Pick<BpmnDefinitions, "collaborations" | "processes"> &
		Partial<Pick<BpmnDefinitions, "diagrams">>,
): BpmnProcess | undefined {
	const byId = new Map(defs.processes.map((process) => [process.id, process]))
	for (const participant of defs.collaborations[0]?.participants ?? []) {
		const process =
			participant.processRef === undefined ? undefined : byId.get(participant.processRef)
		if (process?.isExecutable === true) return process
	}
	return (
		defs.processes.find((process) => process.isExecutable === true) ??
		// An empty process is a partner's; picking it would mark the real one
		// non-executable in poolLanedProcesses, and Flowable would deploy nothing.
		defs.processes.find((process) => process.flowElements.length > 0 || process.laneSet) ??
		emptiedPrimary(defs)
	)
}

/**
 * Once an edit empties the process the user works on, nothing in the semantics
 * may tell it from an empty partner, and a switch would lock the user out of
 * their own pool. The drawing still does: a partner is a thin band.
 * ponytail: a file without pool DI falls back to document order.
 */
function emptiedPrimary(
	defs: Pick<BpmnDefinitions, "collaborations" | "processes"> &
		Partial<Pick<BpmnDefinitions, "diagrams">>,
): BpmnProcess | undefined {
	const runnable = defs.processes.filter((process) => process.isExecutable !== false)
	const candidates = runnable.length > 0 ? runnable : defs.processes
	const area = new Map<string, number>()
	for (const diagram of defs.diagrams ?? []) {
		for (const shape of diagram.plane.shapes) {
			area.set(shape.bpmnElement, shape.bounds.width * shape.bounds.height)
		}
	}
	const poolArea = (process: BpmnProcess): number => {
		let largest = 0
		for (const participant of defs.collaborations.flatMap((c) => c.participants)) {
			if (participant.processRef !== process.id) continue
			largest = Math.max(largest, area.get(participant.id) ?? 0)
		}
		return largest
	}
	let best = candidates[0]
	for (const candidate of candidates) {
		if (best === undefined || poolArea(candidate) > poolArea(best)) best = candidate
	}
	return best
}

/** Every id the document already uses at the levels a new collaboration or participant could clash with. */
function documentIds(defs: BpmnDefinitions): Set<string> {
	const ids = new Set<string>()
	for (const root of [...defs.messages, ...defs.errors, ...defs.signals, ...defs.escalations]) {
		ids.add(root.id)
	}
	for (const collaboration of defs.collaborations) {
		ids.add(collaboration.id)
		for (const item of [...collaboration.participants, ...collaboration.messageFlows])
			ids.add(item.id)
	}
	for (const process of defs.processes) {
		ids.add(process.id)
		for (const item of [...process.flowElements, ...process.sequenceFlows]) ids.add(item.id)
		for (const id of nestedElementIds(process.flowElements)) ids.add(id)
		for (const lane of allLanes(process.laneSet)) ids.add(lane.id)
	}
	return ids
}

/**
 * `first` when free, else the first free `nth(2)`, `nth(3)`, …; claims it in `taken`.
 * Bounded: at most `taken.size` candidates can be taken, so one of the first
 * `taken.size + 1` distinct candidates is free.
 */
function freshId(first: string, nth: (n: number) => string, taken: Set<string>): string {
	let id = first
	for (let n = 2; taken.has(id) && n <= taken.size + 2; n++) id = nth(n)
	taken.add(id)
	return id
}

/**
 * "Lanes imply a pool": auto-layout draws lanes only inside a participant, and
 * once a collaboration exists a process without one is drawn pool-less.
 *
 * When any process has a lane set or any collaboration exists, returns a copy
 * in which `collaborations[0]` exists (id `Collaboration_1` unless taken) and
 * every process with flow elements or a lane set is referenced by a
 * participant (`Participant_<processId>`, named after the process, else its
 * id). A process pooled here that is not the {@link primaryProcess} and has no
 * `isExecutable` gets `isExecutable: false`, because Flowable reads an absent
 * attribute as executable. Otherwise returns `defs` itself.
 */
export function poolLanedProcesses(defs: BpmnDefinitions): BpmnDefinitions {
	const hasLanes = defs.processes.some((process) => process.laneSet !== undefined)
	if (!hasLanes && defs.collaborations.length === 0) return defs

	const pooled = new Set(
		defs.collaborations.flatMap((c) => c.participants.map((participant) => participant.processRef)),
	)
	const unpooled = defs.processes.filter(
		(process) => hasContent(process) && !pooled.has(process.id),
	)
	if (unpooled.length === 0 && defs.collaborations.length > 0) return defs

	const taken = documentIds(defs)
	const first: BpmnCollaboration = defs.collaborations[0] ?? {
		id: freshId("Collaboration_1", (n) => `Collaboration_${n}`, taken),
		participants: [],
		messageFlows: [],
		textAnnotations: [],
		associations: [],
		groups: [],
		extensionElements: [],
		unknownAttributes: {},
	}
	const added: BpmnParticipant[] = unpooled.map((process) => ({
		id: freshId(`Participant_${process.id}`, (n) => `Participant_${process.id}_${n}`, taken),
		name: process.name ?? process.id,
		processRef: process.id,
		unknownAttributes: {},
	}))

	const primary = primaryProcess(defs)
	const partners = new Set(unpooled.filter((process) => process !== primary))
	return {
		...defs,
		collaborations: [
			{ ...first, participants: [...first.participants, ...added] },
			...defs.collaborations.slice(1),
		],
		processes: defs.processes.map((process) =>
			partners.has(process) && process.isExecutable === undefined
				? { ...process, isExecutable: false }
				: process,
		),
	}
}

/**
 * Everything wrong with the lanes of `process`, one message per finding:
 * duplicate lane ids, refs to missing ids, to sub-process children or to data
 * references, a flow node in two leaf lanes, and — once lanes exist — a
 * top-level flow node in no leaf lane (data references, and boundary events
 * whose host is assigned, are exempt). Whether parents repeat their children's
 * refs is not checked. Empty for a process without lanes.
 */
export function laneProblems(process: BpmnProcess): string[] {
	const entries = laneEntries(process.laneSet)
	if (entries.length === 0) return []

	const problems: string[] = []
	const laneIds = new Set<string>()
	for (const { lane } of entries) {
		if (laneIds.has(lane.id)) problems.push(`Duplicate lane ID "${lane.id}"`)
		laneIds.add(lane.id)
	}

	const topLevel = new Map(process.flowElements.map((element) => [element.id, element]))
	const nested = nestedElementIds(process.flowElements)
	// A union-convention parent repeats its children's refs; one finding per ref is enough.
	const reported = new Set<string>()
	for (const { lane } of entries) {
		for (const ref of lane.flowNodeRefs) {
			const problem = refProblem(process, lane.id, ref, topLevel.get(ref), nested.has(ref))
			if (problem === undefined || reported.has(ref)) continue
			reported.add(ref)
			problems.push(problem)
		}
	}

	const leavesOf = new Map<string, string[]>()
	for (const { lane } of entries.filter((entry) => isLeaf(entry.lane))) {
		for (const ref of new Set(lane.flowNodeRefs)) {
			leavesOf.set(ref, [...(leavesOf.get(ref) ?? []), lane.id])
		}
	}
	for (const element of process.flowElements.filter(isFlowNode)) {
		const leaves = leavesOf.get(element.id) ?? []
		if (leaves.length > 1) {
			problems.push(
				`Flow node "${element.id}" is in lanes ${leaves.map((id) => `"${id}"`).join(" and ")}; a node belongs to one leaf lane`,
			)
		}
		if (leaves.length > 0) continue
		if (element.type === "boundaryEvent" && leavesOf.has(element.attachedToRef)) continue
		problems.push(`Flow node "${element.id}" is in no lane of process "${process.id}"`)
	}
	return problems
}

function refProblem(
	process: BpmnProcess,
	laneId: string,
	ref: string,
	element: BpmnFlowElement | undefined,
	isNested: boolean,
): string | undefined {
	if (element !== undefined) {
		return isFlowNode(element)
			? undefined
			: `Lane "${laneId}" lists "${ref}", a data object or data store reference; lanes hold flow nodes only`
	}
	if (isNested) {
		return `Lane "${laneId}" lists "${ref}", which sits inside a sub-process; only top-level flow nodes belong in a lane`
	}
	return `Lane "${laneId}" lists "${ref}", which is not a flow node of process "${process.id}"`
}

const MESSAGE_EVENTS: ReadonlySet<string> = new Set([
	"startEvent",
	"endEvent",
	"intermediateCatchEvent",
	"intermediateThrowEvent",
	"boundaryEvent",
])

const DATA_TYPES: ReadonlySet<string> = new Set([
	"dataObject",
	"dataObjectReference",
	"dataStoreReference",
])

/**
 * Why an element of `type` cannot be the `side` end of a message flow, or
 * undefined when it can. `trigger` is an event's first event definition
 * (`"message"`, `"timer"`, …), undefined for a plain event or anything else.
 * A pool can be either end. One rule for every writer, so a change script, the
 * process text reader and the editor refuse the same messages.
 */
export function messageEndProblem(
	type: string,
	trigger: string | undefined,
	side: "source" | "target",
): string | undefined {
	if (type.endsWith("Gateway")) return "a gateway cannot send or receive a message"
	if (DATA_TYPES.has(type)) return "a data object or store cannot send or receive a message"
	if (side === "source") {
		if (type === "startEvent") return "a start event cannot send a message"
		if (type === "intermediateCatchEvent" || type === "boundaryEvent") {
			return "a catch event cannot send a message"
		}
	} else {
		if (type === "endEvent") return "an end event cannot receive a message"
		if (type === "intermediateThrowEvent") return "a throw event cannot receive a message"
	}
	// A timer or a signal waits for, or sends, something else; only a plain event can be made a message one.
	if (MESSAGE_EVENTS.has(type) && trigger !== undefined && trigger !== "message") {
		return `a ${trigger} event cannot ${side === "source" ? "send" : "receive"} a message`
	}
	return undefined
}

/**
 * Everything about the collaborations of `defs` that a modeler would refuse
 * or open broken, one message per finding: duplicate participant or message
 * flow ids, a participant naming a missing process, two participants claiming
 * one process, a message-flow end that is neither a participant nor a flow node
 * in one, a message flow that stays inside one pool, a message flow naming an
 * undeclared message, and — once a collaboration exists — a process with
 * content that no participant references. Empty without collaborations.
 */
export function collaborationProblems(
	defs: Pick<BpmnDefinitions, "collaborations" | "processes" | "messages">,
): string[] {
	if (defs.collaborations.length === 0) return []
	const participants = defs.collaborations.flatMap((collaboration) => collaboration.participants)
	const messageFlows = defs.collaborations.flatMap((collaboration) => collaboration.messageFlows)
	const problems: string[] = []

	const seen = new Set<string>()
	for (const id of [...participants.map((p) => p.id), ...messageFlows.map((f) => f.id)]) {
		if (seen.has(id)) problems.push(`Duplicate element ID "${id}"`)
		seen.add(id)
	}

	const processIds = new Set(defs.processes.map((process) => process.id))
	const claimed = new Map<string, string>()
	for (const participant of participants) {
		const processId = participant.processRef
		if (processId === undefined) continue
		if (!processIds.has(processId)) {
			problems.push(
				`Participant "${participant.id}" references process "${processId}", which this diagram does not contain`,
			)
			continue
		}
		const owner = claimed.get(processId)
		if (owner !== undefined) {
			problems.push(
				`Participants "${owner}" and "${participant.id}" both reference process "${processId}"; a process belongs to one pool`,
			)
		}
		claimed.set(processId, participant.id)
	}

	const owningParticipant = participantIndex(participants, defs.processes)
	const messageIds = new Set(defs.messages.map((message) => message.id))
	for (const flow of messageFlows) {
		for (const [role, ref] of [
			["source", flow.sourceRef],
			["target", flow.targetRef],
		] as const) {
			if (!owningParticipant.has(ref)) {
				problems.push(
					`Message flow "${flow.id}" names ${role} "${ref}", which is not a participant or a flow node in one`,
				)
			}
		}

		const from = owningParticipant.get(flow.sourceRef)
		const to = owningParticipant.get(flow.targetRef)
		if (from !== undefined && from === to) {
			problems.push(
				`Message flow "${flow.id}" starts and ends in participant "${from}"; a message flow crosses pools, a sequence flow stays inside one`,
			)
		}

		if (flow.messageRef !== undefined && !messageIds.has(flow.messageRef)) {
			problems.push(
				`Message flow "${flow.id}" references message "${flow.messageRef}", which this diagram does not declare`,
			)
		}
	}

	for (const process of defs.processes) {
		if (hasContent(process) && !claimed.has(process.id)) {
			problems.push(
				`Process "${process.id}" has content but no participant; once a diagram has a collaboration, every process with content needs a pool`,
			)
		}
	}
	return problems
}

/** Maps every participant id and every flow node id (nested ones included) to its owning participant. */
function participantIndex(
	participants: readonly BpmnParticipant[],
	processes: readonly BpmnProcess[],
): Map<string, string> {
	const index = new Map<string, string>()
	const byProcess = new Map<string, string>()
	for (const participant of participants) {
		index.set(participant.id, participant.id)
		if (participant.processRef !== undefined) byProcess.set(participant.processRef, participant.id)
	}
	for (const process of processes) {
		const owner = byProcess.get(process.id)
		if (owner === undefined) continue
		for (const element of process.flowElements) index.set(element.id, owner)
		for (const id of nestedElementIds(process.flowElements)) index.set(id, owner)
	}
	return index
}
