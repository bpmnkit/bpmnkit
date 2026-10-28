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
	type BpmnLane,
	type BpmnLaneSet,
	type BpmnProcess,
	type BpmnWaypoint,
	allLanes,
	assignLane,
	leafLanes,
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
