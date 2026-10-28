/**
 * Incremental geometry for pools and lanes: the editor and the change-script
 * applier change one band at a time and never lay the diagram out again, so
 * the layout of the person who drew it stays. Lanes are horizontal: a pool has
 * a {@link POOL_HEADER} strip on its left, and its top-level lanes tile the
 * rest of it from top to bottom.
 *
 * @packageDocumentation
 */
import {
	type BpmnBounds,
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
	primaryProcess,
} from "@bpmnkit/core"

/** Width of a pool's name strip; a top-level lane starts this far right of its pool. */
export const POOL_HEADER = 30

/** Height of a lane band added to a pool. */
export const LANE_BAND_HEIGHT = 120

const right = (b: BpmnBounds) => b.x + b.width
const bottom = (b: BpmnBounds) => b.y + b.height
const centreOf = (b: BpmnBounds) => ({ x: b.x + b.width / 2, y: b.y + b.height / 2 })
const contains = (b: BpmnBounds, p: { x: number; y: number }) =>
	p.x >= b.x && p.x <= right(b) && p.y >= b.y && p.y <= bottom(b)
/** Whether `p` lies right of `b` within its height, or below it within its width. */
const besideOrBelow = (b: BpmnBounds, p: { x: number; y: number }) =>
	p.x >= b.x && p.y >= b.y && (p.y <= bottom(b) || p.x <= right(b))
/** Whether `a` and `b` share more than an edge. */
const overlaps = (a: BpmnBounds, b: BpmnBounds) =>
	a.x < right(b) && b.x < right(a) && a.y < bottom(b) && b.y < bottom(a)
/** Half a pixel: an edge written a rounding error away from another is the same edge. */
const sameEdge = (a: number, b: number) => Math.abs(a - b) < 0.5

/** The plane that draws `elementId`, and its shape there. */
function drawn(
	defs: BpmnDefinitions,
	elementId: string,
): { plane: BpmnDiPlane; shape: BpmnDiShape } | undefined {
	for (const diagram of defs.diagrams) {
		const shape = diagram.plane.shapes.find((s) => s.bpmnElement === elementId)
		if (shape) return { plane: diagram.plane, shape }
	}
	return undefined
}

// ── The primary process first ─────────────────────────────────────────────────

/** `items` with the one at `from` moved to `to`; unchanged when either is out of range. */
function moveItem<T>(items: T[], from: number, to: number): T[] {
	if (from === to || from < 0 || to < 0 || from >= items.length) return items
	const rest = items.filter((_, k) => k !== from)
	rest.splice(to, 0, items[from] as T)
	return rest
}

/**
 * The index of the diagram that draws `process`: its plane names the process,
 * or draws its pool or one of its nodes. 0 when none does.
 */
export function diagramIndexOf(defs: BpmnDefinitions, process: BpmnProcess | undefined): number {
	if (!process) return 0
	const pools = defs.collaborations.flatMap((c) => c.participants)
	const ids = new Set([
		...pools.filter((p) => p.processRef === process.id).map((p) => p.id),
		...process.flowElements.map((el) => el.id),
	])
	const at = defs.diagrams.findIndex(
		(d) => d.plane.bpmnElement === process.id || d.plane.shapes.some((s) => ids.has(s.bpmnElement)),
	)
	return Math.max(at, 0)
}

/**
 * The plane the editor shows and edits: the one that draws the
 * {@link primaryProcess}, which a modeler file does not always put first.
 */
export function primaryPlane(defs: BpmnDefinitions): BpmnDiPlane | undefined {
	return defs.diagrams[diagramIndexOf(defs, primaryProcess(defs))]?.plane
}

/**
 * A shallow view of `defs` with the {@link primaryProcess} at `processes[0]`
 * and the diagram that draws it at `diagrams[0]`, which is where the modeling
 * helpers look. `defs` itself when both are already first.
 */
export function primaryFirst(defs: BpmnDefinitions): BpmnDefinitions {
	const primary = primaryProcess(defs)
	const processes = moveItem(defs.processes, primary ? defs.processes.indexOf(primary) : -1, 0)
	const diagrams = moveItem(defs.diagrams, diagramIndexOf(defs, primary), 0)
	if (processes === defs.processes && diagrams === defs.diagrams) return defs
	return { ...defs, processes, diagrams }
}

/**
 * `after` with the item keyed `key` put back right behind the nearest item that
 * preceded it in `before` and is still there, or first when none is. By key,
 * not by index: the edit may have removed or added items around it.
 */
function putBack<T>(before: T[], after: T[], keyOf: (item: T) => string, key: string): T[] {
	const at = after.findIndex((item) => keyOf(item) === key)
	if (at < 0) return after
	const rest = after.filter((_, k) => k !== at)
	let to = 0
	for (let j = before.findIndex((item) => keyOf(item) === key) - 1; j >= 0; j--) {
		const predecessor = keyOf(before[j] as T)
		const found = rest.findIndex((item) => keyOf(item) === predecessor)
		if (found >= 0) {
			to = found + 1
			break
		}
	}
	rest.splice(to, 0, after[at] as T)
	return rest
}

/** A diagram's identity: its id, or the element its plane draws when the file left the id out. */
const diagramKey = (diagram: BpmnDiagram) => diagram.id || diagram.plane.bpmnElement

/**
 * Runs `fn` on {@link primaryFirst}`(defs)` and puts the primary process and
 * its diagram back where they were in the file, by id. The modeling helpers
 * and core auto-layout edit `processes[0]` and draw on `diagrams[0]`; this is
 * what makes them edit the executable process of a file that lists a
 * partner's process or diagram first, without reordering the saved XML.
 *
 * Returns `defs` itself when `fn` returns the view it was given, so a caller
 * can still tell a no-op by identity. `fn` must therefore not change the view
 * in place and then return it: the view's top-level arrays are its own, and
 * such a change would be dropped.
 */
export function withPrimaryFirst(
	defs: BpmnDefinitions,
	fn: (first: BpmnDefinitions) => BpmnDefinitions,
): BpmnDefinitions {
	const view = primaryFirst(defs)
	if (view === defs) return fn(defs)
	const out = fn(view)
	if (out === view) return defs
	const primary = view.processes[0]
	const drawing = view.diagrams[0]
	return {
		...out,
		processes: primary
			? putBack(defs.processes, out.processes, (p) => p.id, primary.id)
			: out.processes,
		diagrams: drawing
			? putBack(defs.diagrams, out.diagrams, diagramKey, diagramKey(drawing))
			: out.diagrams,
	}
}

// ── What an edit leaves alone ─────────────────────────────────────────────────

/** Deep enough for any model the parser builds; a deeper walk means a cycle. */
const MAX_DEPTH = 64

/**
 * The ids of every pool and every lane of every process, at any depth: drawn
 * as shapes, but containers, so never an obstacle, an end of a flow or a
 * member of a select-all.
 */
export function swimlaneIds(defs: BpmnDefinitions): Set<string> {
	return new Set([
		...defs.collaborations.flatMap((c) => c.participants.map((p) => p.id)),
		...defs.processes.flatMap((p) => allLanes(p.laneSet).map((lane) => lane.id)),
	])
}

/**
 * Whether `participant` draws nothing but its own band: it has no
 * `processRef`, or its process is not the {@link primaryProcess}, has no flow
 * element and no lane set, and does not say it is executable (the Flowable
 * Modeler writes partner pools so). Moving or deleting such a pool changes no
 * process anyone runs, so both are safe.
 */
export function isBlackBox(defs: BpmnDefinitions, participant: BpmnParticipant): boolean {
	if (participant.processRef === undefined) return true
	const process = defs.processes.find((p) => p.id === participant.processRef)
	if (!process) return true
	return (
		process !== primaryProcess(defs) &&
		process.flowElements.length === 0 &&
		!process.laneSet &&
		process.isExecutable !== true
	)
}

/** Adds the ids of `elements` and of their sequence flows, at every sub-process depth, to `out`. */
function collectContent(
	elements: readonly BpmnFlowElement[],
	flows: readonly BpmnSequenceFlow[],
	out: Set<string>,
	depth: number,
): void {
	if (depth > MAX_DEPTH) throw new Error("sub-processes nested too deep, or cyclic")
	for (const flow of flows) out.add(flow.id)
	for (const el of elements) {
		out.add(el.id)
		if ("flowElements" in el) collectContent(el.flowElements, el.sequenceFlows, out, depth + 1)
	}
}

/**
 * The nodes, flows, annotations and associations of every process other than
 * the {@link primaryProcess}. The modeling helpers only edit the primary one,
 * so an edit of these would change their drawing and not their model: moves,
 * deletes, resizes, connections and type changes skip them instead.
 */
export function lockedIds(defs: BpmnDefinitions): Set<string> {
	const primary = primaryProcess(defs)
	const locked = new Set<string>()
	for (const process of defs.processes) {
		if (process === primary) continue
		collectContent(process.flowElements, process.sequenceFlows, locked, 0)
		for (const note of process.textAnnotations) locked.add(note.id)
		for (const association of process.associations) locked.add(association.id)
	}
	return locked
}

/**
 * The ids a `move` leaves where they are: every lane (dragging one would lay
 * it over its neighbour), every pool but a black box (its content would stay
 * behind) and the {@link lockedIds}.
 */
export function unmovableIds(defs: BpmnDefinitions): Set<string> {
	const frozen = new Set([
		...defs.processes.flatMap((p) => allLanes(p.laneSet).map((lane) => lane.id)),
		...lockedIds(defs),
	])
	for (const participant of defs.collaborations.flatMap((c) => c.participants)) {
		if (!isBlackBox(defs, participant)) frozen.add(participant.id)
	}
	return frozen
}

/** The leaf lane of `process` whose shape contains `point`, if any. */
export function laneAt(
	defs: BpmnDefinitions,
	process: BpmnProcess,
	point: { x: number; y: number },
): BpmnLane | undefined {
	return leafLanes(process.laneSet).find((lane) => {
		const b = drawn(defs, lane.id)?.shape.bounds
		return (
			b !== undefined &&
			point.x >= b.x &&
			point.x <= right(b) &&
			point.y >= b.y &&
			point.y <= bottom(b)
		)
	})
}

/**
 * Moves every shape, label and waypoint of `plane` at or below `line` down by
 * `height`, in place, except the shapes and edges of the elements in `keep`.
 * What a pool that grows downwards does to the pools and messages below it.
 */
function pushDown(
	plane: BpmnDiPlane,
	line: number,
	height: number,
	keep: ReadonlySet<string>,
): void {
	// Half a pixel: a waypoint written on the edge itself belongs to what is below it.
	const below = (y: number) => y >= line - 0.5
	for (const s of plane.shapes) {
		if (keep.has(s.bpmnElement) || !below(s.bounds.y)) continue
		s.bounds = { ...s.bounds, y: s.bounds.y + height }
		if (s.label?.bounds) s.label.bounds = { ...s.label.bounds, y: s.label.bounds.y + height }
	}
	for (const edge of plane.edges) {
		if (keep.has(edge.bpmnElement)) continue
		edge.waypoints = edge.waypoints.map((p) => (below(p.y) ? { ...p, y: p.y + height } : p))
		const label = edge.label?.bounds
		if (edge.label && label && below(label.y)) edge.label.bounds = { ...label, y: label.y + height }
	}
}

/**
 * Returns a copy of `defs` with a band for the top-level lane `laneId` drawn at
 * the bottom of pool `poolId`: the pool grows by `height`, and every shape,
 * label and waypoint at or below the pool's old bottom edge moves down by as
 * much, so other pools and the messages to them keep their places relative to
 * it. The lane itself must already be in the model. Unchanged when the pool
 * has no shape.
 */
export function insertLaneBand(
	defs: BpmnDefinitions,
	poolId: string,
	laneId: string,
	shapeId: string,
	height = LANE_BAND_HEIGHT,
): BpmnDefinitions {
	const next = structuredClone(defs)
	const found = drawn(next, poolId)
	if (!found) return defs
	const { plane, shape: pool } = found
	const line = bottom(pool.bounds)
	pushDown(plane, line, height, new Set([poolId]))
	const band: BpmnDiShape = {
		id: shapeId,
		bpmnElement: laneId,
		isHorizontal: true,
		bounds: {
			x: pool.bounds.x + POOL_HEADER,
			y: line,
			width: pool.bounds.width - POOL_HEADER,
			height,
		},
		unknownAttributes: {},
	}
	pool.bounds = { ...pool.bounds, height: pool.bounds.height + height }
	// Right after the pool: a lane drawn after the nodes would paint over them.
	plane.shapes.splice(plane.shapes.indexOf(pool) + 1, 0, band)
	return next
}

/** The lane set holding `laneId` directly, and the lane that owns that set (absent: the process's own). */
function siblingsOf(
	process: BpmnProcess,
	laneId: string,
): { set: BpmnLaneSet; parent?: BpmnLane } | undefined {
	if (process.laneSet?.lanes.some((lane) => lane.id === laneId)) return { set: process.laneSet }
	const parent = allLanes(process.laneSet).find((lane) =>
		lane.childLaneSet?.lanes.some((child) => child.id === laneId),
	)
	return parent?.childLaneSet ? { set: parent.childLaneSet, parent } : undefined
}

/**
 * `lanes` in the order they are drawn, top to bottom. The model's order says
 * nothing about it (miwg-C.1.0 lists its middle lane first), so it is only the
 * fallback when one of them has no shape.
 */
function topToBottom(defs: BpmnDefinitions, lanes: readonly BpmnLane[]): BpmnLane[] {
	const drawnAt = lanes.map((lane) => ({ lane, y: drawn(defs, lane.id)?.shape.bounds.y }))
	if (drawnAt.some((entry) => entry.y === undefined)) return [...lanes]
	return drawnAt.sort((a, b) => (a.y ?? 0) - (b.y ?? 0)).map((entry) => entry.lane)
}

/**
 * `lane` and its descendants along its bottom child (when it lies `above` the
 * removed band) or its top one, down to a leaf: the lanes whose bands grow over
 * a removed neighbour. Bounded by the depth of the lane tree, which `allLanes`
 * has checked for loops.
 */
function absorbers(defs: BpmnDefinitions, lane: BpmnLane, above: boolean): BpmnLane[] {
	const chain = [lane]
	for (let at = lane; (at.childLaneSet?.lanes.length ?? 0) > 0; ) {
		const children = topToBottom(defs, at.childLaneSet?.lanes ?? [])
		const next = above ? children.at(-1) : children[0]
		if (!next) break
		chain.push(next)
		at = next
	}
	return chain
}

/** Stretches the shapes of `lanes` over `removed`, a band right below them (`above`) or right above them. */
function growOver(
	defs: BpmnDefinitions,
	lanes: readonly BpmnLane[],
	removed: BpmnBounds,
	above: boolean,
): void {
	for (const lane of lanes) {
		const shape = drawn(defs, lane.id)?.shape
		if (!shape) continue
		const y = above ? shape.bounds.y : removed.y
		shape.bounds = { ...shape.bounds, y, height: shape.bounds.height + removed.height }
	}
}

/**
 * Returns a copy of `defs` without leaf lane `laneId` of the process at
 * `processIndex`. The sibling drawn above takes its band (the one below when it
 * is the top one) along with its nodes, so no node moves; an only child hands both
 * to its parent; the last lane of the process takes the lane set with it and
 * leaves the pool as it is. The lane's shape is deleted. `undefined` when the
 * lane is not in that process or has child lanes.
 */
export function removeLaneBand(
	defs: BpmnDefinitions,
	processIndex: number,
	laneId: string,
): BpmnDefinitions | undefined {
	const next = structuredClone(defs)
	const process = next.processes[processIndex]
	const lane = allLanes(process?.laneSet).find((candidate) => candidate.id === laneId)
	const holder = process === undefined ? undefined : siblingsOf(process, laneId)
	if (!process || !lane || !holder || (lane.childLaneSet?.lanes.length ?? 0) > 0) return undefined

	const order = topToBottom(next, holder.set.lanes)
	const at = order.indexOf(lane)
	const neighbour = order[at - 1] ?? order[at + 1]
	const band = drawn(next, laneId)
	holder.set.lanes.splice(holder.set.lanes.indexOf(lane), 1)

	let heir: BpmnLane | undefined
	if (neighbour) {
		const chain = absorbers(next, neighbour, at > 0)
		heir = chain.at(-1)
		if (band) growOver(next, chain, band.shape.bounds, at > 0)
	} else if (holder.parent) {
		holder.parent.childLaneSet = undefined
		heir = holder.parent
	} else {
		process.laneSet = undefined
	}
	if (band) band.plane.shapes.splice(band.plane.shapes.indexOf(band.shape), 1)

	let result = process
	for (const ref of heir ? lane.flowNodeRefs : []) result = assignLane(result, ref, heir?.id ?? "")
	next.processes[processIndex] = result
	dropAssociationsTo(next, new Set([laneId]))
	return next
}

/**
 * The waypoints of a message flow between a node and a pool (or any two
 * shapes, two pools included), every segment horizontal or vertical, starting
 * on the node's border and ending on the pool's. Vertical when the two share an x range (at the node's centre x kept
 * within it), horizontal when they share a y range (pools side by side), and
 * otherwise down or up from the node, then across into the pool's side. In the
 * direction of the flow: from the node when `nodeSends`, else to it.
 */
export function messageWaypoints(
	node: BpmnBounds,
	pool: BpmnBounds,
	nodeSends: boolean,
): BpmnWaypoint[] {
	const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi)
	const below = pool.y >= bottom(node)
	const toRight = pool.x >= right(node)
	const [left, rightEdge] = [Math.max(node.x, pool.x), Math.min(right(node), right(pool))]
	const [top, bottomEdge] = [Math.max(node.y, pool.y), Math.min(bottom(node), bottom(pool))]
	let points: BpmnWaypoint[]
	if (left <= rightEdge) {
		const x = clamp(node.x + node.width / 2, left, rightEdge)
		points = below
			? [
					{ x, y: bottom(node) },
					{ x, y: pool.y },
				]
			: [
					{ x, y: node.y },
					{ x, y: bottom(pool) },
				]
	} else if (top <= bottomEdge) {
		const y = clamp(node.y + node.height / 2, top, bottomEdge)
		points = toRight
			? [
					{ x: right(node), y },
					{ x: pool.x, y },
				]
			: [
					{ x: node.x, y },
					{ x: right(pool), y },
				]
	} else {
		const x = node.x + node.width / 2
		const y = pool.y + pool.height / 2
		points = [
			{ x, y: below ? bottom(node) : node.y },
			{ x, y },
			{ x: toRight ? pool.x : right(pool), y },
		]
	}
	return nodeSends ? points : points.reverse()
}

/**
 * The waypoints of a message flow from the shape `source` to `target`, either
 * of which may be a pool (`sourceIsPool`, `targetIsPool`). Routed from the
 * node's side when one end is a node and the other a pool: a node's centre
 * picks where the line runs, a pool is too wide to.
 */
export function messageRoute(
	source: BpmnBounds,
	target: BpmnBounds,
	sourceIsPool: boolean,
	targetIsPool: boolean,
): BpmnWaypoint[] {
	return sourceIsPool && !targetIsPool
		? messageWaypoints(target, source, false)
		: messageWaypoints(source, target, true)
}

/** `edge` of message flow `flow` routed afresh between its ends in `shapes`; `edge` when one is not drawn. */
export function rerouteMessage(
	edge: BpmnDiEdge,
	flow: BpmnMessageFlow,
	shapes: readonly BpmnDiShape[],
	pools: ReadonlySet<string>,
): BpmnDiEdge {
	const source = shapes.find((s) => s.bpmnElement === flow.sourceRef)?.bounds
	const target = shapes.find((s) => s.bpmnElement === flow.targetRef)?.bounds
	if (!source || !target) return edge
	const waypoints = messageRoute(
		source,
		target,
		pools.has(flow.sourceRef),
		pools.has(flow.targetRef),
	)
	return { ...edge, waypoints }
}

/**
 * The participant a message flow from or to `id` starts or ends at: `id`
 * itself when it is a pool, else the pool whose process holds the flow node
 * `id` at any sub-process depth. Undefined for a lane, an annotation, a node of
 * a process no pool draws and an unknown id.
 */
export function participantOf(defs: BpmnDefinitions, id: string): BpmnParticipant | undefined {
	const pools = defs.collaborations.flatMap((c) => c.participants)
	const pool = pools.find((p) => p.id === id)
	if (pool) return pool
	const process = defs.processes.find((p) => {
		const content = new Set<string>()
		collectContent(p.flowElements, [], content, 0)
		return content.has(id)
	})
	return process && pools.find((p) => p.processRef === process.id)
}

/** Space a pool drawn around content leaves between the content and its border. */
const POOL_PADDING = 30

/**
 * The bounds of a pool drawn around `content` (shapes and labels): the header
 * strip on the left plus padding on every side. A 300 by 60 pool at the origin
 * for no content.
 */
export function poolAround(content: readonly BpmnBounds[]): BpmnBounds {
	if (content.length === 0) return { x: 0, y: 0, width: 300, height: 60 }
	const x = Math.min(...content.map((b) => b.x)) - POOL_PADDING - POOL_HEADER
	const y = Math.min(...content.map((b) => b.y)) - POOL_PADDING
	return {
		x,
		y,
		width: Math.max(...content.map(right)) + POOL_PADDING - x,
		height: Math.max(...content.map(bottom)) + POOL_PADDING - y,
	}
}

// ── Where an op leaves a node ─────────────────────────────────────────────────

/** Flow elements a lane never lists (core `laneProblems` reports them). */
const DATA_TYPES: ReadonlySet<string> = new Set([
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
 * behind, or `undefined` to refuse the whole op (critique I4).
 *
 * Refused: a flow element of the {@link primaryProcess} whose centre lands in another
 * process's pool (a black box or not: it would be saved in one process and
 * drawn in another), or, when the primary has a pool, outside it. Boundary
 * events are not checked, their host is. With `outward`, a node placed right of
 * the own pool or below it (not off a corner) is taken in rather than refused: a
 * quick-add chain walks off the pool's right edge. Otherwise the own pool and the lanes
 * along its right and bottom edges grow to contain a node that crosses those
 * edges, what lies below moves down by as much, and the lane refs follow the
 * drawing ({@link reassignLanes}); what the op itself moved stays where it put
 * it. Also refused: a black box among `ids` that ends up over the own pool,
 * which would draw the partner over executable nodes. `defs` itself when
 * nothing changes.
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
	// Annotations are left out: a note beside the pool says nothing about the process.
	const types = new Map(primary.flowElements.map((el) => [el.id, el.type]))
	const inside: BpmnBounds[] = []
	for (const id of ids) {
		const type = types.get(id)
		const bounds = type === undefined ? undefined : drawn(defs, id)?.shape.bounds
		if (!bounds) continue
		const centre = centreOf(bounds)
		const ownsIt =
			own !== undefined &&
			(contains(own.bounds, centre) || (outward && besideOrBelow(own.bounds, centre)))
		if (type !== "boundaryEvent") {
			if (pools.some((pool) => !pool.own && contains(pool.bounds, centre))) return undefined
			if (own && !ownsIt) return undefined
		}
		if (ownsIt) inside.push(bounds)
	}
	const frozen = unmovableIds(defs)
	const placed = ids.filter((id) => !frozen.has(id))
	const grown = own && inside.length > 0 ? growPool(defs, own.id, primary.id, inside, placed) : defs
	const ownBounds = own && drawn(grown, own.id)?.shape.bounds
	if (ownBounds) {
		for (const pool of pools) {
			const bounds = !pool.own && placed.includes(pool.id) && drawn(grown, pool.id)?.shape.bounds
			if (bounds && overlaps(bounds, ownBounds)) return undefined
		}
	}
	return reassignLanes(grown, primary.id, ids, created)
}

/**
 * Returns a copy of `defs` in which pool `poolId` of process `processId`, and
 * its lanes on the pool's right or bottom edge, reach {@link poolAround}
 * `content` where `content` crosses that edge. Shapes and waypoints below the
 * pool that are neither the process's own nor among `placed` (what the op
 * moved, already where it wants it) move down by as much, so the pools below
 * keep their distance and their messages. `defs` itself when nothing crosses.
 */
function growPool(
	defs: BpmnDefinitions,
	poolId: string,
	processId: string,
	content: readonly BpmnBounds[],
	placed: readonly string[],
): BpmnDefinitions {
	const old = drawn(defs, poolId)?.shape.bounds
	if (!old) return defs
	const reach = poolAround(content)
	const widen = Math.max(...content.map(right)) > right(old) ? right(reach) - right(old) : 0
	const deepen = Math.max(...content.map(bottom)) > bottom(old) ? bottom(reach) - bottom(old) : 0
	if (widen <= 0 && deepen <= 0) return defs

	const next = structuredClone(defs)
	const found = drawn(next, poolId)
	const process = next.processes.find((p) => p.id === processId)
	if (!found || !process) return defs
	const lanes = allLanes(process.laneSet)
	for (const lane of lanes) {
		const shape = drawn(next, lane.id)?.shape
		if (!shape) continue
		const b = shape.bounds
		shape.bounds = {
			...b,
			width: b.width + (widen > 0 && sameEdge(right(b), right(old)) ? widen : 0),
			height: b.height + (deepen > 0 && sameEdge(bottom(b), bottom(old)) ? deepen : 0),
		}
	}
	if (deepen > 0) {
		const keep = new Set([poolId, ...lanes.map((lane) => lane.id), ...placed])
		collectContent(process.flowElements, process.sequenceFlows, keep, 0)
		for (const note of process.textAnnotations) keep.add(note.id)
		for (const association of process.associations) keep.add(association.id)
		const line = bottom(old)
		// A message with one end staying put and its waypoint there below the line
		// would come off that end; with both ends staying put it stays as it is.
		const loose: BpmnMessageFlow[] = []
		for (const flow of next.collaborations.flatMap((c) => c.messageFlows)) {
			const [from, to] = [keep.has(flow.sourceRef), keep.has(flow.targetRef)]
			if (from && to) keep.add(flow.id)
			if (from === to) continue
			const points = found.plane.edges.find((e) => e.bpmnElement === flow.id)?.waypoints
			const docked = from ? points?.[0] : points?.at(-1)
			if (docked && docked.y >= line - 0.5) loose.push(flow)
		}
		pushDown(found.plane, line, deepen, keep)
		const pools = new Set(next.collaborations.flatMap((c) => c.participants.map((p) => p.id)))
		found.plane.edges = found.plane.edges.map((edge) => {
			const flow = loose.find((f) => f.id === edge.bpmnElement)
			return flow ? rerouteMessage(edge, flow, found.plane.shapes, pools) : edge
		})
	}
	found.shape.bounds = {
		...old,
		width: old.width + Math.max(widen, 0),
		height: old.height + Math.max(deepen, 0),
	}
	return next
}

// ── Deleting pools and lanes ──────────────────────────────────────────────────

/**
 * Drops, in place, the associations of every process and collaboration of
 * `defs` that start or end at a `gone` id, and their edges. A deleted node's
 * go in deleteContent; a deleted swimlane's go here, so the change scripts,
 * which come here directly, drop them too.
 */
function dropAssociationsTo(defs: BpmnDefinitions, gone: ReadonlySet<string>): void {
	const dropped = new Set<string>()
	for (const holder of [...defs.processes, ...defs.collaborations]) {
		const dangling = holder.associations.filter(
			(a) => gone.has(a.sourceRef) || gone.has(a.targetRef),
		)
		if (dangling.length === 0) continue
		for (const a of dangling) dropped.add(a.id)
		holder.associations = holder.associations.filter((a) => !dropped.has(a.id))
	}
	if (dropped.size === 0) return
	for (const diagram of defs.diagrams) {
		diagram.plane.edges = diagram.plane.edges.filter((e) => !dropped.has(e.bpmnElement))
	}
}

/**
 * Whether a delete may take swimlane `id`: a leaf lane of the
 * {@link primaryProcess} (its neighbour takes its band and nodes) or a
 * {@link isBlackBox} pool. The own pool, a pool that draws a process with
 * content, a lane with child lanes and a lane of another process stay
 * (decision U2). `false` for an id that is no pool or lane.
 */
export function canDeleteSwimlane(defs: BpmnDefinitions, id: string): boolean {
	const lane = allLanes(primaryProcess(defs)?.laneSet).find((candidate) => candidate.id === id)
	if (lane) return (lane.childLaneSet?.lanes.length ?? 0) === 0
	const pool = defs.collaborations.flatMap((c) => c.participants).find((p) => p.id === id)
	return pool !== undefined && isBlackBox(defs, pool)
}

/**
 * Returns a copy of `defs` without the black-box pool `poolId`: its
 * participant, its shapes, its message flows and their edges. Its process goes
 * too (decision U3) when no other pool draws it, it holds nothing (no flow
 * element, lane set, annotation or association) and does not say it is
 * executable; so does a diagram whose plane draws that process and nothing
 * else. `undefined` when `poolId` is no pool or not a black box.
 */
export function removeBlackBox(defs: BpmnDefinitions, poolId: string): BpmnDefinitions | undefined {
	const pool = defs.collaborations.flatMap((c) => c.participants).find((p) => p.id === poolId)
	if (!pool || !isBlackBox(defs, pool)) return undefined
	const next = structuredClone(defs)
	const gone = new Set([poolId])
	for (const collaboration of next.collaborations) {
		collaboration.participants = collaboration.participants.filter((p) => p.id !== poolId)
		for (const flow of collaboration.messageFlows) {
			if (flow.sourceRef === poolId || flow.targetRef === poolId) gone.add(flow.id)
		}
		collaboration.messageFlows = collaboration.messageFlows.filter((f) => !gone.has(f.id))
	}
	for (const diagram of next.diagrams) {
		diagram.plane.shapes = diagram.plane.shapes.filter((s) => !gone.has(s.bpmnElement))
		diagram.plane.edges = diagram.plane.edges.filter((e) => !gone.has(e.bpmnElement))
	}
	dropAssociationsTo(next, gone)

	const process = next.processes.find((p) => p.id === pool.processRef)
	const stillDrawn = next.collaborations.some((c) =>
		c.participants.some((p) => p.processRef === process?.id),
	)
	const planes = next.diagrams.filter((d) => d.plane.bpmnElement === process?.id)
	const empty =
		process !== undefined &&
		process.isExecutable !== true &&
		process.flowElements.length === 0 &&
		!process.laneSet &&
		process.textAnnotations.length === 0 &&
		process.associations.length === 0
	const blankPlanes = planes.every((d) => d.plane.shapes.length === 0 && d.plane.edges.length === 0)
	if (process && empty && !stillDrawn && blankPlanes) {
		next.processes = next.processes.filter((p) => p !== process)
		next.diagrams = next.diagrams.filter((d) => !planes.includes(d))
	}
	return next
}

/**
 * Returns `defs` without the swimlanes among `ids` that {@link canDeleteSwimlane}
 * allows, on a document whose primary process is `processes[0]`: lanes deepest
 * first, so a parent selected with all its child lanes goes too, then black
 * boxes. The rest of `ids` is ignored. `defs` itself when none goes.
 */
export function removeSwimlanes(defs: BpmnDefinitions, ids: readonly string[]): BpmnDefinitions {
	const wanted = new Set(ids)
	let next = defs
	// Depth first lists a parent before its children; reversed, children come first.
	for (const lane of allLanes(defs.processes[0]?.laneSet).reverse()) {
		if (wanted.has(lane.id)) next = removeLaneBand(next, 0, lane.id) ?? next
	}
	for (const pool of defs.collaborations.flatMap((c) => c.participants)) {
		if (wanted.has(pool.id)) next = removeBlackBox(next, pool.id) ?? next
	}
	return next
}
