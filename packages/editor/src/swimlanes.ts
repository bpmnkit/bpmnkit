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
	type BpmnDiPlane,
	type BpmnDiShape,
	type BpmnDiagram,
	type BpmnFlowElement,
	type BpmnLane,
	type BpmnLaneSet,
	type BpmnParticipant,
	type BpmnProcess,
	type BpmnSequenceFlow,
	type BpmnWaypoint,
	allLanes,
	assignLane,
	leafLanes,
	primaryProcess,
} from "@bpmnkit/core"

/** Width of a pool's name strip; a top-level lane starts this far right of its pool. */
export const POOL_HEADER = 30

/** Height of a lane band added to a pool. */
export const LANE_BAND_HEIGHT = 120

const right = (b: BpmnBounds) => b.x + b.width
const bottom = (b: BpmnBounds) => b.y + b.height

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
 * `processRef`, or its process is not the {@link primaryProcess} and has no
 * flow element and no lane set (the Flowable Modeler writes partner pools so).
 * Moving such a pool changes its drawing only, so it is safe.
 */
export function isBlackBox(defs: BpmnDefinitions, participant: BpmnParticipant): boolean {
	if (participant.processRef === undefined) return true
	const process = defs.processes.find((p) => p.id === participant.processRef)
	if (!process) return true
	return process !== primaryProcess(defs) && process.flowElements.length === 0 && !process.laneSet
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
	// Half a pixel: a waypoint written on the edge itself belongs to what is below it.
	const below = (y: number) => y >= line - 0.5
	for (const s of plane.shapes) {
		if (s === pool || !below(s.bounds.y)) continue
		s.bounds = { ...s.bounds, y: s.bounds.y + height }
		if (s.label?.bounds) s.label.bounds = { ...s.label.bounds, y: s.label.bounds.y + height }
	}
	for (const edge of plane.edges) {
		edge.waypoints = edge.waypoints.map((p) => (below(p.y) ? { ...p, y: p.y + height } : p))
		const label = edge.label?.bounds
		if (edge.label && label && below(label.y)) edge.label.bounds = { ...label, y: label.y + height }
	}
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
	return next
}

/**
 * The waypoints of a message flow between a node and a pool, every segment
 * horizontal or vertical, starting on the node's border and ending on the
 * pool's. Vertical when the two share an x range (at the node's centre x kept
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
