/**
 * Where an op leaves a node: lane membership, pool growth and the pools
 * pushed aside. See ./swimlanes.ts for the model.
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
import {
	ALONG,
	type Kinked,
	MAX_DEPTH,
	POOL_HEADER,
	POOL_PADDING,
	anchors,
	besideOrBelow,
	bottom,
	centreOf,
	collectContent,
	contains,
	copyTouched,
	diagramsDrawing,
	drawn,
	edgeEnds,
	isBlackBox,
	laneAt,
	overlaps,
	poolAround,
	pushBeyond,
	rerouteMessage,
	right,
	sameEdge,
	straighten,
	topToBottom,
	unmovableIds,
} from "./swimlanes.js"

// ── Where an op leaves a node ───────────────────────────────────────────────────

/** Flow elements a lane never lists (core `laneProblems` reports them). */
export const DATA_TYPES: ReadonlySet<string> = new Set([
	"dataObject",
	"dataObjectReference",
	"dataStoreReference",
])

/**
 * Returns `defs` with the lane refs of process `processId` following the
 * drawing for `ids`, the nodes an op just placed: each top-level flow node
 * goes to the leaf lane its centre lies in. One that lies in no lane keeps its
 * lane, or, when `created`, gets {@link laneForNewNode}'s. A boundary event
 * follows its host (`assignLane` carries it), unless it was created without
 * its host, when it joins the host's lane. Data references, annotations, pools,
 * lanes, sub-process children and nodes of other processes are skipped, and a
 * node whose lane does not change is not touched, so its refs keep their
 * order. `defs` itself when no ref changes.
 */
export function reassignLanes(
	defs: BpmnDefinitions,
	processId: string,
	ids: readonly string[],
	created = false,
): BpmnDefinitions {
	const index = defs.processes.findIndex((p) => p.id === processId)
	const original = defs.processes[index]
	if (!original || leafLanes(original.laneSet).length === 0) return defs
	const placed = new Set(ids)
	const topLevel = new Map(original.flowElements.map((el) => [el.id, el]))
	let process = original
	for (const id of ids) {
		const el = topLevel.get(id)
		if (!el || DATA_TYPES.has(el.type)) continue
		let target: BpmnLane | undefined
		if (el.type === "boundaryEvent") {
			if (!created || placed.has(el.attachedToRef)) continue
			target = laneForNewNode(process, id)
		} else {
			const bounds = drawn(defs, id)?.shape.bounds
			target = bounds ? laneAt(defs, process, centreOf(bounds)) : undefined
			if (!target && created) target = laneForNewNode(process, id)
		}
		// laneAt and laneForNewNode only name leaf lanes of this process, which assignLane accepts.
		if (target && laneOf(process, id)?.id !== target.id)
			process = assignLane(process, id, target.id)
	}
	if (process === original) return defs
	return { ...defs, processes: defs.processes.map((p, k) => (k === index ? process : p)) }
}

/**
 * What an op that created (`created`) or moved the shapes `ids` must leave
 * behind, or `undefined` to refuse the whole op.
 *
 * Refused: a flow element of the {@link primaryProcess} whose centre lands in another
 * process's pool (a black box or not: it would be saved in one process and
 * drawn in another), or, when the primary has a pool, outside it. Lane bands
 * drawn without a pool ({@link bareBands}) frame the process as its pool would,
 * and grow as it would, but only for what lanes hold: data elements and a node
 * no lane lists (auto-layout draws both below the bands) move freely outside
 * them and are never taken in by `outward`. Boundary
 * events are not checked, their host is. With `outward`, a node placed right of
 * the own pool or below it (not off a corner) is taken in rather than refused: a
 * quick-add chain walks off the pool's right edge. Otherwise the own pool and its
 * lanes grow to contain a node that crosses one of its edges ({@link growPool}):
 * what lies below moves down and the pools beside it right by as much, and the
 * lane refs follow the drawing ({@link reassignLanes}); what the op itself moved
 * stays where it put it. Also refused: a pool among `ids` (the own pool or a
 * black box) that ends up over a pool the op left in place, which would draw one
 * process over the other's nodes, and growth of the own pool or the bare bands
 * up or left onto another pool (a resize stops there instead; here stopping
 * would leave the node outside the pool). `defs` itself when nothing changes.
 */
export function settlePlaced(
	defs: BpmnDefinitions,
	ids: readonly string[],
	created = false,
	outward = false,
): BpmnDefinitions | undefined {
	const primary = primaryProcess(defs)
	if (!primary) return defs
	const pools = defs.collaborations
		.flatMap((c) => c.participants)
		.flatMap((p) => {
			const bounds = drawn(defs, p.id)?.shape.bounds
			return bounds ? [{ id: p.id, own: p.processRef === primary.id, bounds }] : []
		})
	const own = pools.find((pool) => pool.own)
	const frame = own?.bounds ?? bareBands(defs, primary)?.bounds
	// Annotations are left out: a note beside the pool says nothing about the process.
	const types = new Map(primary.flowElements.map((el) => [el.id, el.type]))
	const inside: BpmnBounds[] = []
	for (const id of ids) {
		const type = types.get(id)
		const bounds = type === undefined ? undefined : drawn(defs, id)?.shape.bounds
		if (!type || !bounds) continue
		const centre = centreOf(bounds)
		// Bare bands frame only what lanes hold: auto-layout draws data and laneless nodes below them.
		const loose = !own && (DATA_TYPES.has(type) || (!created && !laneOf(primary, id)))
		const ownsIt =
			frame !== undefined &&
			(contains(frame, centre) || (outward && !loose && besideOrBelow(frame, centre)))
		if (type !== "boundaryEvent") {
			if (pools.some((pool) => !pool.own && contains(pool.bounds, centre))) return undefined
			if (frame && !ownsIt && !loose) return undefined
		}
		if (ownsIt) inside.push(bounds)
	}
	const frozen = unmovableIds(defs)
	const placed = ids.filter((id) => !frozen.has(id))
	const grown =
		frame && inside.length > 0 ? growPool(defs, own?.id, primary.id, inside, placed) : defs
	// A pool moved onto another would draw one process over the other's nodes.
	const after = pools.map((pool) => drawn(grown, pool.id)?.shape.bounds ?? pool.bounds)
	for (const [k, pool] of pools.entries()) {
		const bounds = after[k]
		if (!bounds || !(placed.includes(pool.id) || pool.own)) continue
		const onto = pools.some(
			(other, j) =>
				j !== k &&
				!placed.includes(other.id) &&
				overlaps(bounds, after[j] ?? other.bounds) &&
				// The own pool, when the op did not move it, only for what its growth runs into: a
				// file may draw pools overlapping already.
				(placed.includes(pool.id) || !overlaps(pool.bounds, other.bounds)),
		)
		if (onto) return undefined
	}
	// Bare bands may not grow onto a pool either; one a file already draws over them is let be.
	const bands = own ? undefined : bareBands(grown, primary)?.bounds
	const hit = (pool: { bounds: BpmnBounds }, k: number) =>
		!!bands && overlaps(bands, after[k] ?? pool.bounds) && !!frame && !overlaps(frame, pool.bounds)
	if (pools.some(hit)) return undefined
	return reassignLanes(grown, primary.id, ids, created)
}

/**
 * Returns a copy of `defs` in which pool `poolId` of process `processId` and
 * its lanes reach {@link poolAround} `content` where `content` crosses an edge:
 * the pool's right or bottom edge, its top, or the left edge of its innermost
 * lane (a node over a name strip). Growing right or down takes the lanes on
 * that edge along, up the lanes on the top edge, left every lane, each keeping
 * its inset. Shapes and waypoints below the pool that are neither the
 * process's own nor among `placed` (what the op moved, already where it wants
 * it) move down by as much, so the pools below keep their distance and their
 * messages, and the pools beside it move right by what it grows into them
 * ({@link pushRight}). Growing up or left moves nothing else but the
 * messages docked on the pool, routed again. Only right and down for a pool
 * {@link bandStack} leaves out (a vertical one: its header is on top and its
 * lanes are columns). With no `poolId`, the process's {@link bareBands} grow
 * the same way, framed by their outer edges. Only the diagrams that draw the
 * pool and its lanes are copied. `defs` itself when nothing crosses.
 */
function growPool(
	defs: BpmnDefinitions,
	poolId: string | undefined,
	processId: string,
	content: readonly BpmnBounds[],
	placed: readonly string[],
): BpmnDefinitions {
	const process = defs.processes.find((p) => p.id === processId)
	const before = process && frameOf(defs, poolId, process)
	if (!process || !before) return defs
	const old = before.bounds
	const lanes = allLanes(process.laneSet)
	// The deepest inset, as a resize keeps nodes clear of it: no node is left on a name strip.
	const inset = Math.max(
		POOL_HEADER,
		...lanes.map((lane) => (drawn(defs, lane.id)?.shape.bounds.x ?? old.x) - old.x),
	)
	const reach = poolAround(content)
	const [minX, minY] = [Math.min(...content.map((b) => b.x)), Math.min(...content.map((b) => b.y))]
	const widen = Math.max(...content.map(right)) > right(old) ? right(reach) - right(old) : 0
	const deepen = Math.max(...content.map(bottom)) > bottom(old) ? bottom(reach) - bottom(old) : 0
	const lift = before.sideways && minY < old.y ? old.y - reach.y : 0
	const extend = before.sideways && minX < old.x + inset ? old.x + inset + POOL_PADDING - minX : 0
	if (widen <= 0 && deepen <= 0 && lift <= 0 && extend <= 0) return defs

	const bands = new Set([...(poolId ? [poolId] : []), ...lanes.map((lane) => lane.id)])
	// DI only: the process and the collaborations are read, never changed.
	const next = copyTouched(defs, { diagrams: diagramsDrawing(defs, bands) })
	const found = frameOf(next, poolId, process)
	if (!found) return defs
	const [dx, dy] = [Math.max(extend, 0), Math.max(lift, 0)]
	for (const lane of lanes) {
		const shape = drawn(next, lane.id)?.shape
		if (!shape) continue
		const b = shape.bounds
		const up = found.tops.has(lane.id) ? dy : 0
		shape.bounds = {
			x: b.x - dx,
			y: b.y - up,
			width: b.width + dx + (widen > 0 && sameEdge(right(b), right(old)) ? widen : 0),
			height: b.height + up + (deepen > 0 && sameEdge(bottom(b), bottom(old)) ? deepen : 0),
		}
	}
	const keep = poolContent(process, poolId, lanes)
	for (const id of placed) keep.add(id)
	const kinked = deepen > 0 ? pushBelow(defs, next, found.plane, bottom(old), deepen, keep) : []
	const grown = {
		x: old.x - dx,
		y: old.y - dy,
		width: old.width + dx + Math.max(widen, 0),
		height: old.height + dy + Math.max(deepen, 0),
	}
	if (found.pool) found.pool.bounds = grown
	straighten(defs, found.plane, kinked)
	pushRight(defs, next, found.plane, old, grown, keep)
	if (poolId && (dx > 0 || dy > 0)) redockMessages(next, found.plane, poolId)
	return next
}

/** What {@link growPool} grows: a pool, or lane bands drawn without one. */
interface GrowFrame {
	plane: BpmnDiPlane
	/** The outer bounds: the pool's, or those of the bands together. */
	bounds: BpmnBounds
	/** The pool's shape; none for bands without a pool. */
	pool?: BpmnDiShape
	/** Whether it may grow up and left too: drawn horizontally, its header on the left. */
	sideways: boolean
	/** The lanes whose top is the frame's top. */
	tops: ReadonlySet<string>
}

/** The {@link GrowFrame} of pool `poolId`, or of `process`'s {@link bareBands} with no `poolId`. */
function frameOf(
	defs: BpmnDefinitions,
	poolId: string | undefined,
	process: BpmnProcess,
): GrowFrame | undefined {
	if (poolId === undefined) {
		const bare = bareBands(defs, process)
		if (!bare) return undefined
		const tops = new Set<string>()
		// The first band at each depth; the depth bound stops a lane tree that loops.
		let level = process.laneSet?.lanes ?? []
		for (let depth = 0; depth < MAX_DEPTH; depth++) {
			const first = topToBottom(defs, level)[0]
			if (!first) break
			tops.add(first.id)
			level = first.childLaneSet?.lanes ?? []
		}
		return { ...bare, sideways: true, tops }
	}
	const found = drawn(defs, poolId)
	if (!found) return undefined
	const stack = bandStack(defs, poolId)
	// By the lane tree, as a resize does: a file may draw its top lane a pixel off the pool's top.
	const tops = new Set(stack ? lineOf(defs, stack, poolId, "top").map(([band]) => band) : [])
	return {
		plane: found.plane,
		bounds: found.shape.bounds,
		pool: found.shape,
		sideways: !!stack,
		tops,
	}
}

/**
 * The plane that draws the lanes of `process` and their outer bounds, when no
 * pool draws the process (core's auto-layout draws such lane bands) and every
 * lane is a horizontal band on that plane; else `undefined`.
 */
function bareBands(
	defs: BpmnDefinitions,
	process: BpmnProcess,
): { plane: BpmnDiPlane; bounds: BpmnBounds } | undefined {
	const lanes = allLanes(process.laneSet)
	const plane = lanes[0] && drawn(defs, lanes[0].id)?.plane
	if (!plane || poolOf(defs, process)) return undefined
	const shapes = lanes.map((lane) => plane.shapes.find((s) => s.bpmnElement === lane.id))
	const bands = shapes.flatMap((s) => (s && s.isHorizontal !== false ? [s.bounds] : []))
	if (bands.length < lanes.length) return undefined
	const [x, y] = [Math.min(...bands.map((b) => b.x)), Math.min(...bands.map((b) => b.y))]
	const width = Math.max(...bands.map(right)) - x
	return { plane, bounds: { x, y, width, height: Math.max(...bands.map(bottom)) - y } }
}

/** Routes the message flows docked on pool `poolId` afresh on `plane` of `next`: an edge of the pool moved. */
export function redockMessages(next: BpmnDefinitions, plane: BpmnDiPlane, poolId: string): void {
	const pools = new Set(next.collaborations.flatMap((c) => c.participants.map((p) => p.id)))
	const docked = next.collaborations
		.flatMap((c) => c.messageFlows)
		.filter((f) => f.sourceRef === poolId || f.targetRef === poolId)
	plane.edges = plane.edges.map((edge) => {
		const flow = docked.find((f) => f.id === edge.bpmnElement)
		return flow ? rerouteMessage(edge, flow, plane.shapes, pools) : edge
	})
}

/**
 * Moves the pools of `plane` (in `next`, a copy of `defs`) that stand right of
 * `old`, a pool's bounds before it widened to `grown`, and share rows with
 * `grown`, right by as much as `grown` runs into the nearest of them, and with
 * them the pools that stand right of a moved one in its rows, so none lands on
 * another: each with what its process draws inside it and the collaboration
 * notes whose centre lies in it, all by the same distance, so they keep their
 * spacing. Pools in `keep` stay. Edges with both ends moved (sequence flows,
 * associations, data associations, messages) are translated, the message flows
 * with one end moved routed again. Nothing when `grown` runs into none of them.
 */
export function pushRight(
	defs: BpmnDefinitions,
	next: BpmnDefinitions,
	plane: BpmnDiPlane,
	old: BpmnBounds,
	grown: BpmnBounds,
	keep: ReadonlySet<string>,
): void {
	const shapeOf = new Map(plane.shapes.map((s) => [s.bpmnElement, s.bounds]))
	const pools = next.collaborations.flatMap((c) => c.participants)
	const pushed = poolsPushed(pools, shapeOf, old, grown, keep)
	const dx = right(grown) - (pushed[0]?.bounds.x ?? Number.POSITIVE_INFINITY)
	if (!(dx > 0)) return
	const notes = next.collaborations.flatMap((c) => c.textAnnotations)
	const moved = new Set<string>()
	for (const { pool, bounds } of pushed) {
		const process = defs.processes.find((p) => p.id === pool.processRef)
		for (const id of poolContent(process, pool.id, allLanes(process?.laneSet))) moved.add(id)
		for (const note of notes) {
			const b = shapeOf.get(note.id)
			if (b && !keep.has(note.id) && contains(bounds, centreOf(b))) moved.add(note.id)
		}
	}
	const h = ALONG.h
	for (const s of plane.shapes) {
		if (!moved.has(s.bpmnElement)) continue
		s.bounds = h.shift(s.bounds, dx)
		if (s.label?.bounds) s.label.bounds = h.shift(s.label.bounds, dx)
	}
	const flows = new Map(next.collaborations.flatMap((c) => c.messageFlows).map((f) => [f.id, f]))
	const ends = edgeEnds(defs)
	const ids = new Set(pools.map((p) => p.id))
	plane.edges = plane.edges.map((edge) => {
		const [source = "", target = ""] = ends.get(edge.bpmnElement) ?? []
		if (moved.has(edge.bpmnElement) || (moved.has(source) && moved.has(target))) {
			const label = edge.label?.bounds
			const waypoints = edge.waypoints.map((p) => h.shiftPoint(p, dx))
			if (!edge.label || !label) return { ...edge, waypoints }
			return { ...edge, waypoints, label: { ...edge.label, bounds: h.shift(label, dx) } }
		}
		const flow = flows.get(edge.bpmnElement)
		const loose = flow && (moved.has(flow.sourceRef) || moved.has(flow.targetRef))
		return loose ? rerouteMessage(edge, flow, plane.shapes, ids) : edge
	})
}

/**
 * The pools {@link pushRight} moves, with their bounds before the push: the
 * nearest of those in `grown`'s rows first, then the rest of them, then, a
 * moved pool at a time, every pool right of it in its rows. Only pools right
 * of `old` and not in `keep`.
 */
function poolsPushed(
	pools: readonly BpmnParticipant[],
	shapeOf: ReadonlyMap<string, BpmnBounds>,
	old: BpmnBounds,
	grown: BpmnBounds,
	keep: ReadonlySet<string>,
): { pool: BpmnParticipant; bounds: BpmnBounds }[] {
	const rows = (a: BpmnBounds, b: BpmnBounds) => a.y < bottom(b) && b.y < bottom(a)
	const rightOf = (a: BpmnBounds, b: BpmnBounds) => a.x >= right(b) - 0.5
	const candidates = pools.flatMap((pool) => {
		const bounds = shapeOf.get(pool.id)
		return bounds && !keep.has(pool.id) && rightOf(bounds, old) ? [{ pool, bounds }] : []
	})
	const pushed = candidates
		.filter((c) => rows(c.bounds, grown))
		.sort((a, b) => a.bounds.x - b.bounds.x)
	// A worklist over the candidates: each joins once, so it ends after at most that many rounds.
	for (let k = 0; k < pushed.length; k++) {
		const by = pushed[k]?.bounds
		for (const c of candidates) {
			if (by && !pushed.includes(c) && rows(c.bounds, by) && rightOf(c.bounds, by)) pushed.push(c)
		}
	}
	return pushed
}

/**
 * The ids that stay put when pool `poolId` (none for bare bands) grows down:
 * the pool, its `lanes`, and what `process` (its process, if any) draws inside it.
 */
export function poolContent(
	process: BpmnProcess | undefined,
	poolId: string | undefined,
	lanes: readonly BpmnLane[],
): Set<string> {
	const keep = new Set([...(poolId ? [poolId] : []), ...lanes.map((lane) => lane.id)])
	if (!process) return keep
	collectContent(process.flowElements, process.sequenceFlows, keep, 0)
	for (const note of process.textAnnotations) keep.add(note.id)
	for (const association of process.associations) keep.add(association.id)
	return keep
}

/**
 * Moves what `plane` of `next` (a copy of `defs`) draws at or below `line`
 * down by `height` ({@link pushBeyond}), or up for a negative `height`, except
 * `keep`, the pool that grows or shrinks from `line` and its content, and
 * re-routes the message flows that would come off an end in `keep`. Adds the
 * message flows with both ends in `keep` to it. Returns the edges the push
 * kinked, for {@link straighten} once `keep` has grown.
 */
export function pushBelow(
	defs: BpmnDefinitions,
	next: BpmnDefinitions,
	plane: BpmnDiPlane,
	line: number,
	height: number,
	keep: Set<string>,
): Kinked[] {
	// A message with one end staying put and its waypoint there below the line
	// would come off that end; with both ends staying put it stays as it is.
	const loose: BpmnMessageFlow[] = []
	for (const flow of next.collaborations.flatMap((c) => c.messageFlows)) {
		const [from, to] = [keep.has(flow.sourceRef), keep.has(flow.targetRef)]
		if (from && to) keep.add(flow.id)
		if (from === to) continue
		const points = plane.edges.find((e) => e.bpmnElement === flow.id)?.waypoints
		const docked = from ? points?.[0] : points?.at(-1)
		if (docked && docked.y >= line - 0.5) loose.push(flow)
	}
	const { kinked } = pushBeyond(plane, "v", line, height, keep, anchors(defs), defs, 1)
	const pools = new Set(next.collaborations.flatMap((c) => c.participants.map((p) => p.id)))
	plane.edges = plane.edges.map((edge) => {
		const flow = loose.find((f) => f.id === edge.bpmnElement)
		return flow ? rerouteMessage(edge, flow, plane.shapes, pools) : edge
	})
	return kinked
}

// ── Resizing pools and lanes ────────────────────────────────────────────────────

/** What a resize of a pool or one of its lanes works on. */
export interface BandStack {
	/** The plane that draws the pool. */
	plane: BpmnDiPlane
	pool: BpmnParticipant
	/** The pool's lanes, at every depth; none for a black box. */
	lanes: BpmnLane[]
	/** The process drawn inside the pool: the primary one, or none for a black box. */
	process?: BpmnProcess
}

/** A band's top or bottom edge, as `[band id, side]`. */
export type BandEdge = [string, "top" | "bottom"]

/**
 * The pool `id` is, or whose lane it is, when a resize may change it: a black
 * box, or the own pool of the {@link primaryProcess} and its lanes, drawn
 * horizontally on one plane. Partner pools with content are locked, and lanes
 * without a pool and vertical pools are left out: the bands are laid out
 * horizontally only.
 */
export function bandStack(defs: BpmnDefinitions, id: string): BandStack | undefined {
	const primary = primaryProcess(defs)
	const lanes = allLanes(primary?.laneSet)
	const participants = defs.collaborations.flatMap((c) => c.participants)
	const pool = lanes.some((lane) => lane.id === id)
		? participants.find((p) => primary !== undefined && p.processRef === primary.id)
		: participants.find((p) => p.id === id)
	if (!pool) return undefined
	const own = primary !== undefined && pool.processRef === primary.id
	if (!own && !isBlackBox(defs, pool)) return undefined
	const found = drawn(defs, pool.id)
	if (!found) return undefined
	const bands = own ? lanes : []
	for (const band of [pool.id, ...bands.map((lane) => lane.id)]) {
		const shape = found.plane.shapes.find((s) => s.bpmnElement === band)
		if (!shape || shape.isHorizontal === false) return undefined
	}
	return { plane: found.plane, pool, lanes: bands, process: own ? primary : undefined }
}

/**
 * The band edges that are one line with `id`'s edge on `side`, `id`'s among
 * them: a parent's top and its first child's, a parent's bottom and its last
 * child's, a lane's bottom and the next sibling's top, at every depth. By the
 * lane tree and the drawn order, not by matching coordinates: a modeler file
 * may draw a lane a pixel off its pool's edge (miwg-C.10.0), and a match
 * would then move the pool without its lane.
 */
export function lineOf(
	defs: BpmnDefinitions,
	stack: BandStack,
	id: string,
	side: "top" | "bottom",
): BandEdge[] {
	const links = new Map<string, string[]>()
	const link = (a: string, b: string) => {
		links.set(a, [...(links.get(a) ?? []), b])
		links.set(b, [...(links.get(b) ?? []), a])
	}
	const tile = (parent: string, children: readonly BpmnLane[]) => {
		const drawnOrder = topToBottom(defs, children)
		const [first, last] = [drawnOrder[0], drawnOrder.at(-1)]
		if (!first || !last) return
		link(`${parent} top`, `${first.id} top`)
		link(`${parent} bottom`, `${last.id} bottom`)
		for (let k = 1; k < drawnOrder.length; k++) {
			link(`${drawnOrder[k - 1]?.id} bottom`, `${drawnOrder[k]?.id} top`)
		}
	}
	tile(stack.pool.id, stack.process?.laneSet?.lanes ?? [])
	for (const lane of stack.lanes) tile(lane.id, lane.childLaneSet?.lanes ?? [])
	// Ids are NCNames, so a space never occurs in one; the seen set stops a walk round a loop.
	const seen = new Set([`${id} ${side}`])
	const queue = [...seen]
	for (let at = queue.pop(); at !== undefined; at = queue.pop()) {
		for (const next of links.get(at) ?? []) {
			if (seen.has(next)) continue
			seen.add(next)
			queue.push(next)
		}
	}
	return [...seen].map((key) => {
		const [band = "", edge] = key.split(" ")
		return [band, edge === "top" ? "top" : "bottom"]
	})
}

// ── Creating pools and lanes ────────────────────────────────────────────────────

/** The participant of `process` in `defs`, if one draws it. */
export function poolOf(defs: BpmnDefinitions, process: BpmnProcess): BpmnParticipant | undefined {
	return defs.collaborations.flatMap((c) => c.participants).find((p) => p.processRef === process.id)
}
