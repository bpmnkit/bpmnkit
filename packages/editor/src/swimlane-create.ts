/**
 * Creating pools and lanes. See ./swimlanes.ts for the model.
 *
 * @packageDocumentation
 */
import {
	type BpmnAssociation,
	type BpmnBounds,
	type BpmnCollaboration,
	type BpmnDefinitions,
	type BpmnDiEdge,
	type BpmnDiPlane,
	type BpmnDiShape,
	type BpmnDiagram,
	type BpmnFlowElement,
	type BpmnLane,
	type BpmnLaneSet,
	type BpmnMessageFlow,
	type BpmnParticipant,
	type BpmnProcess,
	type BpmnSequenceFlow,
	type BpmnWaypoint,
	allLanes,
	assignLane,
	laneForNewNode,
	laneOf,
	leafLanes,
	pinPrimaryProcess,
	primaryProcess,
} from "@bpmnkit/core"
import { computeWaypointsAvoiding, edgeLabelBounds } from "./geometry.js"
import type { IdFactory } from "./id.js"
import { DATA_TYPES, poolOf, reassignLanes } from "./swimlane-placement.js"
import { MIN_BAND } from "./swimlane-resize.js"
import {
	BLACK_BOX_HEIGHT,
	POOL_HEADER,
	bottom,
	collectContent,
	copyTouched,
	diagramsDrawing,
	drawn,
	insertLaneBand,
	overlaps,
	poolAround,
	primaryFirst,
	right,
	topToBottom,
} from "./swimlanes.js"

// ── Creating pools and lanes ────────────────────────────────────────────────────

/**
 * Returns `defs` with `lane` as the only lane of the primary process
 * (`processes[0]`), listing every flow node but data references and drawn
 * across the whole of pool `poolId`, its shape `shapeId` right after the
 * pool's. The lane set is the process's own when it has one with no lanes,
 * else a new one with the id `setId` mints. `lane`'s own refs are replaced.
 * The process and the diagram that draws the pool are copied, nothing else.
 */
export function addFirstLane(
	defs: BpmnDefinitions,
	poolId: string,
	lane: BpmnLane,
	shapeId: string,
	setId: () => string,
): BpmnDefinitions {
	const process = defs.processes[0]
	if (!process) return defs
	const only: BpmnLane = {
		...lane,
		flowNodeRefs: process.flowElements.filter((el) => !DATA_TYPES.has(el.type)).map((el) => el.id),
	}
	const laneSet: BpmnLaneSet = process.laneSet
		? { ...process.laneSet, lanes: [...process.laneSet.lanes, only] }
		: { id: setId(), lanes: [only], unknownAttributes: {} }
	const next = copyTouched(defs, { diagrams: diagramsDrawing(defs, new Set([poolId])) })
	next.processes[0] = { ...process, laneSet }
	const pool = drawn(next, poolId)
	if (!pool) return next
	const { x, y, width, height } = pool.shape.bounds
	pool.plane.shapes.splice(pool.plane.shapes.indexOf(pool.shape) + 1, 0, {
		id: shapeId,
		bpmnElement: only.id,
		isHorizontal: true,
		bounds: { x: x + POOL_HEADER, y, width: width - POOL_HEADER, height },
		unknownAttributes: {},
	})
	return next
}

/** Mints the ids of what {@link poolPrimary} makes, each only when it makes it, in this order. */
export interface FirstPoolIds {
	collaboration: () => string
	participant: () => string
	shape: (participantId: string) => string
}

/** What {@link poolPrimary} did. */
export interface PooledPrimary {
	defs: BpmnDefinitions
	/** The primary process's participant, found or made. */
	pool: BpmnParticipant
	/** The participant and the collaboration when made, in that order. */
	made: string[]
	/** Whether the pool got a shape, which it had not. */
	drew: boolean
}

/**
 * A process other than `process` with content (flow elements or a lane set)
 * that no participant references. Once a collaboration exists every such
 * process needs a pool (core's `collaborationProblems`), and pooling it along
 * with `process` would decide its `isExecutable` for it, so a first pool for
 * `process` alone is refused while one exists.
 */
export function unpooledOther(
	defs: BpmnDefinitions,
	process: BpmnProcess,
): BpmnProcess | undefined {
	const pooled = new Set(
		defs.collaborations.flatMap((c) => c.participants.flatMap((p) => p.processRef ?? [])),
	)
	return defs.processes.find(
		(p) =>
			p !== process && !pooled.has(p.id) && (p.flowElements.length > 0 || p.laneSet !== undefined),
	)
}

/** A collaboration with nothing in it. */
function emptyCollaboration(id: string): BpmnCollaboration {
	return {
		id,
		participants: [],
		messageFlows: [],
		textAnnotations: [],
		associations: [],
		groups: [],
		extensionElements: [],
		unknownAttributes: {},
	}
}

/**
 * The bounds of a pool drawn around what `plane` draws of `process`: tight
 * around its top-level lane bands, with the header strip on their left, when
 * they are drawn (they tile the pool), else {@link poolAround} its shapes,
 * labels and routes, or `fallback` when it has none.
 */
function poolBoundsFor(
	process: BpmnProcess,
	plane: BpmnDiPlane,
	fallback: BpmnBounds | undefined,
): BpmnBounds {
	const shapeOf = (id: string) => plane.shapes.find((s) => s.bpmnElement === id)
	const bands = (process.laneSet?.lanes ?? []).flatMap((lane) => shapeOf(lane.id)?.bounds ?? [])
	if (bands.length > 0) {
		const x = Math.min(...bands.map((b) => b.x)) - POOL_HEADER
		const y = Math.min(...bands.map((b) => b.y))
		return {
			x,
			y,
			width: Math.max(...bands.map(right)) - x,
			height: Math.max(...bands.map(bottom)) - y,
		}
	}
	const inside = new Set<string>()
	collectContent(process.flowElements, process.sequenceFlows, inside, 0)
	for (const note of process.textAnnotations) inside.add(note.id)
	for (const association of process.associations) inside.add(association.id)
	const content: BpmnBounds[] = []
	for (const s of plane.shapes.filter((candidate) => inside.has(candidate.bpmnElement))) {
		content.push(s.bounds, ...(s.label?.bounds ? [s.label.bounds] : []))
	}
	for (const edge of plane.edges.filter((candidate) => inside.has(candidate.bpmnElement))) {
		content.push(...edge.waypoints.map((p) => ({ ...p, width: 0, height: 0 })))
	}
	return content.length === 0 && fallback ? fallback : poolAround(content)
}

/**
 * The participant of the primary process (`processes[0]`, drawn on
 * `diagrams[0]`), made when missing: a collaboration when the file has none
 * (else the first one takes it), a participant named `name` for this process
 * only, and a pool shape drawn behind everything around the process (see
 * `poolBoundsFor`) on a plane that then draws the collaboration.
 * The process itself is not touched, so its `isExecutable` and `flowable:*`
 * stay as they are, and other processes are not pooled: pooling one would mark
 * it non-executable. `undefined` when there is no process or no diagram, and
 * when a participant would be made while another process with content has
 * none ({@link unpooledOther}).
 */
export function poolPrimary(
	defs: BpmnDefinitions,
	ids: FirstPoolIds,
	name?: string,
	fallback?: BpmnBounds,
): PooledPrimary | undefined {
	const process = defs.processes[0]
	const diagram = defs.diagrams[0]
	if (!process || !diagram) return undefined
	const made: string[] = []
	let collaborations = defs.collaborations
	let holder = collaborations.find((c) => c.participants.some((p) => p.processRef === process.id))
	let pool = holder?.participants.find((p) => p.processRef === process.id)
	if (!holder || !pool) {
		if (unpooledOther(defs, process)) return undefined
		const madeCollaboration = collaborations.length === 0
		const target = collaborations[0] ?? emptyCollaboration(ids.collaboration())
		pool = {
			id: ids.participant(),
			...(name === undefined ? {} : { name }),
			processRef: process.id,
			unknownAttributes: {},
		}
		holder = { ...target, participants: [...target.participants, pool] }
		collaborations = madeCollaboration
			? [holder]
			: collaborations.map((c) => (c === target ? (holder as BpmnCollaboration) : c))
		made.push(pool.id, ...(madeCollaboration ? [holder.id] : []))
	}
	if (drawn(defs, pool.id)) {
		return { defs: made.length > 0 ? { ...defs, collaborations } : defs, pool, made, drew: false }
	}
	const plane = diagram.plane
	const shape: BpmnDiShape = {
		id: ids.shape(pool.id),
		bpmnElement: pool.id,
		isHorizontal: true,
		bounds: poolBoundsFor(process, plane, fallback),
		unknownAttributes: {},
	}
	const rebound = { ...plane, bpmnElement: holder.id, shapes: [shape, ...plane.shapes] }
	return {
		defs: {
			...defs,
			collaborations,
			diagrams: defs.diagrams.map((d) => (d === diagram ? { ...d, plane: rebound } : d)),
		},
		pool,
		made,
		drew: true,
	}
}

/**
 * Returns `defs` with `participant`, a black box, in the collaboration that
 * holds pool `ownPoolId` (the first one when none does), and its shape
 * `shapeId` at `bounds` on the plane that draws that pool (else the first),
 * after everything there. Only that collaboration and that diagram are copied.
 */
export function addBlackBox(
	defs: BpmnDefinitions,
	ownPoolId: string,
	participant: BpmnParticipant,
	shapeId: string,
	bounds: BpmnBounds,
): BpmnDefinitions {
	const holder =
		defs.collaborations.find((c) => c.participants.some((p) => p.id === ownPoolId)) ??
		defs.collaborations[0]
	const diagram = diagramsDrawing(defs, new Set([ownPoolId]))[0] ?? defs.diagrams[0]
	if (!holder || !diagram) return defs
	const shape: BpmnDiShape = {
		id: shapeId,
		bpmnElement: participant.id,
		isHorizontal: true,
		bounds,
		unknownAttributes: {},
	}
	return {
		...defs,
		collaborations: defs.collaborations.map((c) =>
			c === holder ? { ...c, participants: [...c.participants, participant] } : c,
		),
		diagrams: defs.diagrams.map((d) =>
			d === diagram ? { ...d, plane: { ...d.plane, shapes: [...d.plane.shapes, shape] } } : d,
		),
	}
}

/**
 * Where a new partner pool goes when the person only points at `point`: as
 * wide as the own pool and aligned with it, {@link BLACK_BOX_HEIGHT} high,
 * centred on `point`'s y. `undefined` when the {@link primaryProcess} has no
 * drawn pool, where a new pool wraps the process instead.
 */
export function blackBoxBounds(
	defs: BpmnDefinitions,
	point: { x: number; y: number },
): BpmnBounds | undefined {
	const primary = primaryProcess(defs)
	const own = defs.collaborations
		.flatMap((c) => c.participants)
		.find((p) => primary !== undefined && p.processRef === primary.id)
	const bounds = own && drawn(defs, own.id)?.shape.bounds
	if (!bounds) return undefined
	const height = BLACK_BOX_HEIGHT
	return { x: bounds.x, y: point.y - height / 2, width: bounds.width, height }
}

/** The size of a pool the pool tool puts on a process with nothing drawn, as bpmn-js draws one. */
const EMPTY_POOL = { width: 600, height: 250 }

/**
 * Where the pool tool's `addParticipant` puts a pool when the person clicks at
 * `point`, so its ghost shows it: a black box beside the own pool
 * ({@link blackBoxBounds}) when the primary process has a drawn pool, else the
 * pool the op draws around the process (`poolBoundsFor`), which only falls
 * back to a 600 by 250 pool centred on `point` when nothing is drawn.
 * `undefined` where the op refuses a first pool ({@link unpooledOther}), so
 * the tool shows no ghost there.
 */
export function newPoolBounds(
	defs: BpmnDefinitions,
	point: { x: number; y: number },
): BpmnBounds | undefined {
	const box = blackBoxBounds(defs, point)
	if (box) return box
	const fallback = {
		x: point.x - EMPTY_POOL.width / 2,
		y: point.y - EMPTY_POOL.height / 2,
		...EMPTY_POOL,
	}
	if (firstPoolRefused(defs)) return undefined
	const first = primaryFirst(defs)
	const process = first.processes[0]
	const plane = first.diagrams[0]?.plane
	return process && plane ? poolBoundsFor(process, plane, fallback) : fallback
}

/**
 * Whether `addParticipant` would refuse a first pool: the {@link primaryProcess}
 * has none yet, and another process with content has none either
 * ({@link unpooledOther}), so the collaboration would be invalid.
 */
export function firstPoolRefused(defs: BpmnDefinitions): boolean {
	const first = primaryFirst(defs)
	const process = first.processes[0]
	return process !== undefined && !poolOf(first, process) && !!unpooledOther(first, process)
}

/**
 * Whether `addParticipant` at `bounds` adds nothing ({@link addPool}): over
 * the own pool, or a first pool {@link firstPoolRefused}.
 */
export function poolRefused(defs: BpmnDefinitions, bounds: BpmnBounds): boolean {
	const first = primaryFirst(defs)
	const process = first.processes[0]
	const own = process && poolOf(first, process)
	const ownBounds = own && drawn(first, own.id)?.shape.bounds
	return ownBounds ? overlaps(bounds, ownBounds) : firstPoolRefused(first)
}

/** What a creating edit made: the new document and the new ids. */
export interface Made {
	defs: BpmnDefinitions
	created: string[]
}

/**
 * The `addParticipant` op, on a document whose primary process is
 * `processes[0]` drawn on `diagrams[0]`. When that process has no drawn pool
 * it gets one ({@link poolPrimary}), named `name`, around its content: `bounds`
 * only place the pool of a process with nothing drawn. Otherwise a black box
 * named `name`, with no `processRef` (valid BPMN, and no empty process to
 * keep in step), is drawn at `bounds` ({@link addBlackBox}); refused when that
 * overlaps the own pool, as a black box moved there is: nodes inside it would
 * read as the partner's. `created`: the participant, then the
 * collaboration when one was made. `undefined` when refused.
 */
export function addPool(
	defs: BpmnDefinitions,
	bounds: BpmnBounds,
	name: string | undefined,
	ids: IdFactory,
): Made | undefined {
	const process = defs.processes[0]
	if (!process) return undefined
	const own = poolOf(defs, process)
	const ownBounds = own && drawn(defs, own.id)?.shape.bounds
	if (!own || !ownBounds) {
		const pooled = poolPrimary(
			defs,
			{
				collaboration: () => ids("Collaboration"),
				participant: () => ids("Participant"),
				shape: () => ids("Participant_di"),
			},
			name,
			bounds,
		)
		return pooled && { defs: pooled.defs, created: pooled.made }
	}
	if (overlaps(bounds, ownBounds)) return undefined
	const id = ids("Participant")
	const participant: BpmnParticipant = {
		id,
		...(name === undefined ? {} : { name }),
		unknownAttributes: {},
	}
	return {
		defs: addBlackBox(defs, own.id, participant, ids("Participant_di"), bounds),
		created: [id],
	}
}

/**
 * The `addLane` op, on a document whose primary process is `processes[0]`: a
 * new, unnamed top-level lane (as bpmn-js makes them) whose
 * {@link LANE_BAND_HEIGHT} band goes `where` `refId`, the own pool or one of
 * its top-level leaf lanes, through {@link insertLaneBand}. In the lane set it
 * comes next to `refId`, or first or last for the pool. On a pool without
 * lanes the first add makes two, as bpmn-js does: the one asked for and one over
 * the whole old pool holding every node ({@link addFirstLane}). Existing lane
 * refs never change, as the band goes in at an edge and what is below moves
 * by it. `created`: the new lane, then the lane that took the old pool and the
 * new lane set when made. `undefined`, refused, for a child lane, a lane with
 * child lanes (the editor does not edit nested lanes yet), any other pool
 * (black boxes, other processes' pools), an undrawn pool, a pool drawn
 * vertically (`isHorizontal="false"`, not supported yet) and unknown ids.
 */
export function addLaneBeside(
	defs: BpmnDefinitions,
	refId: string,
	where: "above" | "below",
	ids: IdFactory,
): Made | undefined {
	const process = defs.processes[0]
	const own = process && poolOf(defs, process)
	const poolShape = own && drawn(defs, own.id)?.shape
	// The bands are horizontal: on a vertical pool one would go below its lane columns.
	if (!process || !own || !poolShape || poolShape.isHorizontal === false) return undefined
	const pool = poolShape.bounds
	const above = where === "above"
	const lanes = process.laneSet?.lanes ?? []
	let line: number
	let index: number
	if (refId === own.id) {
		line = above ? pool.y : bottom(pool)
		const order = topToBottom(defs, lanes)
		const edge = above ? order[0] : order.at(-1)
		index = edge ? lanes.indexOf(edge) + (above ? 0 : 1) : 0
	} else {
		const ref = lanes.find((lane) => lane.id === refId)
		const band = ref && drawn(defs, ref.id)?.shape.bounds
		if (!ref || !band || (ref.childLaneSet?.lanes.length ?? 0) > 0) return undefined
		line = above ? band.y : bottom(band)
		index = lanes.indexOf(ref) + (above ? 0 : 1)
	}
	const id = ids("Lane")
	const shapeId = ids("Lane_di")
	const lane: BpmnLane = { id, flowNodeRefs: [], unknownAttributes: {} }
	const created = [id]
	let next = defs
	if (lanes.length === 0) {
		const existing = ids("Lane")
		const existingShape = ids("Lane_di")
		const blank: BpmnLane = { id: existing, flowNodeRefs: [], unknownAttributes: {} }
		next = addFirstLane(defs, own.id, blank, existingShape, () => {
			const setId = ids("LaneSet")
			created.push(setId)
			return setId
		})
		created.splice(1, 0, existing)
		index = above ? 0 : 1
	}
	const holder = next.processes[0]
	if (!holder?.laneSet) return undefined
	const laneSet = {
		...holder.laneSet,
		lanes: [...holder.laneSet.lanes.slice(0, index), lane, ...holder.laneSet.lanes.slice(index)],
	}
	next = insertLaneBand(next, own.id, id, shapeId, line)
	return {
		defs: { ...next, processes: next.processes.map((p, k) => (k === 0 ? { ...p, laneSet } : p)) },
		created,
	}
}

/**
 * The `addLane` op with a `count`, "Divide into lanes", on a
 * document whose primary process is `processes[0]`: the own pool `poolId`,
 * which has no lanes, becomes `count` top-level lanes. When each band keeps
 * {@link MIN_BAND}, the pool's height is split as bpmn-js splits it: equal
 * integer bands, the last taking the remainder so they tile the pool, which
 * keeps its bounds; nothing moves, and every node joins the lane its centre
 * lies in ({@link reassignLanes}). On a smaller pool it grows as `count - 1`
 * adds below would ({@link addLaneBeside}), the first lane over the old pool
 * holding every node. `created`: the lanes top to bottom, then the new lane
 * set when made. `undefined`, refused, wherever {@link canDivideLanes} is false.
 */
export function divideLanes(
	defs: BpmnDefinitions,
	poolId: string,
	count: 2 | 3,
	ids: IdFactory,
): Made | undefined {
	const pool = drawn(defs, poolId)?.shape.bounds
	if (!pool || !canDivideLanes(defs, poolId)) return undefined
	if (pool.height < count * MIN_BAND) return divideByGrowing(defs, poolId, count, ids)
	const lanes = Array.from({ length: count }, () => ({ lane: ids("Lane"), shape: ids("Lane_di") }))
	const [first, ...rest] = lanes
	if (!first) return undefined
	const sets: string[] = []
	const blank = (id: string): BpmnLane => ({ id, flowNodeRefs: [], unknownAttributes: {} })
	const next = addFirstLane(defs, poolId, blank(first.lane), first.shape, () => {
		const setId = ids("LaneSet")
		sets.push(setId)
		return setId
	})
	const holder = next.processes[0]
	const top = drawn(next, first.lane)
	if (!holder?.laneSet || !top) return undefined
	next.processes[0] = {
		...holder,
		laneSet: {
			...holder.laneSet,
			lanes: [...holder.laneSet.lanes, ...rest.map((l) => blank(l.lane))],
		},
	}
	const band = Math.floor(pool.height / count)
	top.shape.bounds = { ...top.shape.bounds, height: band }
	const at = top.plane.shapes.indexOf(top.shape)
	for (const [k, { lane, shape }] of rest.entries()) {
		const y = pool.y + (k + 1) * band
		const height = k === rest.length - 1 ? bottom(pool) - y : band
		top.plane.shapes.splice(at + k + 1, 0, {
			id: shape,
			bpmnElement: lane,
			isHorizontal: true,
			bounds: { ...top.shape.bounds, y, height },
			unknownAttributes: {},
		})
	}
	const nodes = holder.flowElements.map((el) => el.id)
	return {
		defs: reassignLanes(next, holder.id, nodes),
		created: [...lanes.map((l) => l.lane), ...sets],
	}
}

/**
 * {@link divideLanes} on a pool too small to split: `count - 1` lanes added
 * below ({@link addLaneBeside}), each growing the pool by a band.
 */
function divideByGrowing(
	defs: BpmnDefinitions,
	poolId: string,
	count: 2 | 3,
	ids: IdFactory,
): Made | undefined {
	const made = addLaneBeside(defs, poolId, "below", ids)
	const [added, existing, ...sets] = made?.created ?? []
	if (!made || !added || !existing) return undefined
	const lanes = [existing, added]
	let next = made.defs
	for (let k = 2; k < count; k++) {
		const more = addLaneBeside(next, lanes.at(-1) ?? "", "below", ids)
		const [lane] = more?.created ?? []
		if (!more || !lane) return undefined
		lanes.push(lane)
		next = more.defs
	}
	return { defs: next, created: [...lanes, ...sets] }
}

/**
 * Whether `addLane` takes `refId` (either side): the drawn, horizontal own
 * pool of the {@link primaryProcess}, or one of its drawn top-level lanes with
 * no child lanes. Mirrors the refusals of {@link addLaneBeside}, so the
 * context bar offers Add lane only where it does something.
 */
export function canAddLane(defs: BpmnDefinitions, refId: string): boolean {
	const process = primaryProcess(defs)
	const own = process && poolOf(defs, process)
	const poolShape = own && drawn(defs, own.id)?.shape
	if (!process || !own || !poolShape || poolShape.isHorizontal === false) return false
	if (refId === own.id) return true
	const ref = process.laneSet?.lanes.find((lane) => lane.id === refId)
	return (
		ref !== undefined &&
		drawn(defs, ref.id) !== undefined &&
		(ref.childLaneSet?.lanes.length ?? 0) === 0
	)
}

/**
 * Whether "Divide into lanes" applies to `poolId`: the drawn own pool of a
 * primary process with no lanes yet (dividing a lane would make child lanes,
 * which the editor does not edit).
 */
export function canDivideLanes(defs: BpmnDefinitions, poolId: string): boolean {
	const process = primaryProcess(defs)
	const own = process && poolOf(defs, process)
	return (
		own?.id === poolId && canAddLane(defs, poolId) && (process?.laneSet?.lanes.length ?? 0) === 0
	)
}
