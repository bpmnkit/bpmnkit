/**
 * Resizing pools and lanes. See ./swimlanes.ts for the model.
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
	type BandEdge,
	type BandStack,
	bandStack,
	lineOf,
	poolContent,
	pushBelow,
	pushRight,
	redockMessages,
} from "./swimlane-placement.js"
import {
	POOL_HEADER,
	anchors,
	bottom,
	centreOf,
	contains,
	copyTouched,
	diagramsDrawing,
	drawn,
	right,
	sameEdge,
	shapesBeyond,
	straighten,
} from "./swimlanes.js"

// ── Resizing pools and lanes ────────────────────────────────────────────────────

/** The least height of a lane or pool a resize leaves, and the least width right of its header strips. */
export const MIN_BAND = 60

/** The ids of the pools and lanes a `resize` may change ({@link bandStack}). */
export function resizableSwimlanes(defs: BpmnDefinitions): Set<string> {
	const ids = new Set<string>()
	for (const participant of defs.collaborations.flatMap((c) => c.participants)) {
		const stack = bandStack(defs, participant.id)
		if (stack && stack.pool.id === participant.id) {
			ids.add(participant.id)
			for (const lane of stack.lanes) ids.add(lane.id)
		}
	}
	return ids
}

/** What a resize of a band does: the new bounds of every band of the stack, by id. */
interface BandPlan {
	stack: BandStack
	before: Map<string, BpmnBounds>
	after: Map<string, BpmnBounds>
}

/** What the steps of {@link planResize} read and write. */
interface BandWork {
	poolId: string
	/** The bounds of the pool and its lanes as drawn. */
	before: ReadonlyMap<string, BpmnBounds>
	/** Their bounds so far; each step writes here. */
	after: Map<string, BpmnBounds>
	/** The nodes each band holds by centre, by band id: a resize leaves them in it. */
	held: ReadonlyMap<string, readonly BpmnBounds[]>
	/** The bounds of every other pool on the plane. */
	others: readonly BpmnBounds[]
	/** The own pool pushes the pools its right edge reaches; a black box stops at them. */
	pushes: boolean
}

/**
 * Moves the pool's left edge to `left` and its right edge to `rightEdge`, as
 * far as the limits let them: its nodes stay clear of the header strips, every
 * band keeps {@link MIN_BAND} right of its own, and the left edge stops at a
 * pool beside it. The right edge of the own pool does not: {@link resizeSwimlane}
 * pushes the pools beside it instead; a black box's stops too, so widening a
 * partner never shoves the process being edited. Every lane keeps its inset
 * and reaches the pool's right edge.
 */
function resizeAcross(work: BandWork, left: number, rightEdge: number): void {
	const pool = work.before.get(work.poolId)
	if (!pool) return
	const nodes = work.held.get(work.poolId) ?? []
	const inset = Math.max(POOL_HEADER, ...[...work.before.values()].map((b) => b.x - pool.x))
	// The wall by the height before the resize suffices: a pool off a corner the drag grows
	// past is above (moveLine stops the top under it) or below (pushed down with the bottom).
	const beside = work.others.filter((o) => o.y < bottom(pool) && pool.y < bottom(o))
	const leftWall = Math.max(
		Number.NEGATIVE_INFINITY,
		...beside.filter((o) => right(o) <= pool.x + 0.5).map(right),
	)
	const rightWall = work.pushes
		? Number.POSITIVE_INFINITY
		: Math.min(
				Number.POSITIVE_INFINITY,
				...beside.filter((o) => o.x >= right(pool) - 0.5).map((o) => o.x),
			)
	const leftLimit = Math.min(right(pool) - inset - MIN_BAND, ...nodes.map((n) => n.x - inset))
	const x = Math.max(Math.min(left, Math.max(pool.x, leftLimit)), Math.min(pool.x, leftWall))
	const rightLimit = Math.max(x + inset + MIN_BAND, ...nodes.map(right))
	const reach = Math.min(
		Math.max(rightEdge, Math.min(right(pool), rightLimit)),
		Math.max(right(pool), rightWall),
	)
	const dx = x - pool.x
	// Recomputed widths carry float noise on decimal bounds: an unchanged extent writes nothing.
	if (dx === 0 && reach === right(pool)) return
	// Every band of a horizontal stack reaches the pool's right edge, also one drawn a pixel short
	// of it: matching its edge would leave that band behind, off the pool, its refs stale.
	for (const [band, b] of work.before) {
		work.after.set(band, { ...b, x: b.x + dx, width: reach - (b.x + dx) })
	}
}

/**
 * Moves the band edges of `line` ({@link lineOf}), drawn at `from`, to `to`,
 * as far as the limits let them: a band that shrinks keeps {@link MIN_BAND}
 * and its nodes, and the pool's top stops at a pool above it. Growing down is
 * not clamped. An edge drawn off `from` lands on the new line too.
 */
function moveLine(work: BandWork, edges: readonly BandEdge[], from: number, to: number): void {
	if (sameEdge(from, to)) return
	const on = (side: BandEdge[1]) =>
		edges.flatMap(([band, s]): [string, BpmnBounds][] => {
			const b = work.after.get(band)
			return s === side && b ? [[band, b]] : []
		})
	const [tops, bottoms] = [on("top"), on("bottom")]
	let line = to
	if (to < from) {
		for (const [band, b] of bottoms) {
			const floor = Math.max(b.y + MIN_BAND, ...(work.held.get(band) ?? []).map(bottom))
			line = Math.max(line, Math.min(from, floor))
		}
		const pool = tops.find(([band]) => band === work.poolId)?.[1]
		if (pool) {
			const above = work.others.filter(
				(o) => o.x < right(pool) && pool.x < right(o) && bottom(o) <= pool.y + 0.5,
			)
			line = Math.max(
				line,
				Math.min(from, Math.max(Number.NEGATIVE_INFINITY, ...above.map(bottom))),
			)
		}
	} else {
		for (const [band, b] of tops) {
			const ceiling = Math.min(bottom(b) - MIN_BAND, ...(work.held.get(band) ?? []).map((n) => n.y))
			line = Math.min(line, Math.max(from, ceiling))
		}
	}
	// Clamped back: rewriting the heights from `from` would only add float noise.
	if (line === from) return
	for (const [band, b] of tops) work.after.set(band, { ...b, y: line, height: bottom(b) - line })
	for (const [band, b] of bottoms) work.after.set(band, { ...b, height: line - b.y })
}

/**
 * Where the edges of band `id` (a pool or a lane) may go on their way to
 * `requested`, moved one at a time. A left or right edge is the pool's
 * ({@link resizeAcross}). A top or bottom edge is a line ({@link lineOf},
 * {@link moveLine}): every band edge on it moves with it, so a lane's shared
 * edge moves its neighbour's and an outer edge the pool's, at any nesting
 * depth.
 *
 * Clamped, so the drag does the closest legal thing: no node changes band, so
 * no lane ref goes stale. An edge already past a limit stays
 * where it is. `undefined` when `id` may not be resized.
 */
function planResize(
	defs: BpmnDefinitions,
	id: string,
	requested: BpmnBounds,
): BandPlan | undefined {
	const stack = bandStack(defs, id)
	if (!stack) return undefined
	const { plane, pool } = stack
	const shapeOf = new Map(plane.shapes.map((s) => [s.bpmnElement, s.bounds]))
	const before = new Map<string, BpmnBounds>()
	for (const band of [pool.id, ...stack.lanes.map((lane) => lane.id)]) {
		const bounds = shapeOf.get(band)
		if (bounds) before.set(band, bounds)
	}
	const poolBefore = before.get(pool.id)
	const old = before.get(id)
	if (!poolBefore || !old) return undefined

	const nodes = (stack.process?.flowElements ?? []).flatMap((el) => {
		const bounds = shapeOf.get(el.id)
		return bounds ? [{ id: el.id, bounds }] : []
	})
	const refs = new Map(stack.lanes.map((lane) => [lane.id, lane.flowNodeRefs]))
	// A centre on a shared edge lies in both bands (Divide can cut through a node row): only the
	// band whose lane lists the node holds it, else neither could move the edge off the row.
	const holds = (band: string, b: BpmnBounds, n: (typeof nodes)[number]) => {
		const c = centreOf(n.bounds)
		if (!contains(b, c)) return false
		return (c.y !== b.y && c.y !== bottom(b)) || (refs.get(band)?.includes(n.id) ?? true)
	}
	const work: BandWork = {
		poolId: pool.id,
		before,
		after: new Map(before),
		held: new Map(
			[...before].map(([band, b]) => [
				band,
				nodes.filter((n) => holds(band, b, n)).map((n) => n.bounds),
			]),
		),
		others: defs.collaborations
			.flatMap((c) => c.participants)
			.flatMap((p) => (p.id === pool.id ? [] : (shapeOf.get(p.id) ?? []))),
		pushes: stack.process !== undefined,
	}
	resizeAcross(
		work,
		// The deltas first, so an unchanged edge gives back the pool's exact value.
		poolBefore.x + (requested.x - old.x),
		right(poolBefore) + (right(requested) - right(old)),
	)
	moveLine(work, lineOf(defs, stack, id, "top"), old.y, requested.y)
	moveLine(work, lineOf(defs, stack, id, "bottom"), bottom(old), bottom(requested))
	return { stack, before, after: work.after }
}

/**
 * The bounds a `resize` of pool or lane `id` to `requested` gives it, after
 * the clamps of {@link resizeSwimlane}: what a drag preview shows. `undefined`
 * when `id` is not a pool or lane a resize may change.
 */
export function swimlaneResizeBounds(
	defs: BpmnDefinitions,
	id: string,
	requested: BpmnBounds,
): BpmnBounds | undefined {
	return planResize(defs, id, requested)?.after.get(id)
}

/**
 * Returns a copy of `defs` with pool or lane `id` resized towards `requested`:
 * a black box, or the own pool of the {@link primaryProcess} or one of its
 * lanes, horizontal only. A change in x or width applies to the pool and every
 * lane; a top or bottom edge moves every band edge on it, so the bands still
 * tile the pool, the lane beside gives or takes what the resized one takes or
 * gives, and an outer edge grows or shrinks the pool and its outer lanes.
 * Clamped, never refused, so no node changes band (no lane ref goes stale)
 * and nothing moves but the bands. A pool growing down pushes
 * what is below it down, one shrinking from its bottom pulls the same up by
 * as much, as far as the shapes above leave room ({@link roomAbove}), and the
 * own pool widening pushes the pools beside it right ({@link pushRight}), as
 * {@link growPool} does, where a black box stops at them; messages docked on the pool
 * are re-docked. Only the diagram that draws the pool is copied. `defs`
 * itself when `id` may not be resized or nothing changes.
 */
export function resizeSwimlane(
	defs: BpmnDefinitions,
	id: string,
	requested: BpmnBounds,
): BpmnDefinitions {
	const plan = planResize(defs, id, requested)
	if (!plan) return defs
	const { stack, before, after } = plan
	const same = (a: BpmnBounds, b: BpmnBounds) =>
		a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height
	if ([...after].every(([band, b]) => same(b, before.get(band) ?? b))) return defs

	const next = copyTouched(defs, { diagrams: diagramsDrawing(defs, new Set([stack.pool.id])) })
	const found = drawn(next, stack.pool.id)
	const oldPool = before.get(stack.pool.id)
	const newPool = after.get(stack.pool.id)
	if (!found || !oldPool || !newPool) return defs
	const { plane } = found
	const deepen = bottom(newPool) - bottom(oldPool)
	const keep = poolContent(stack.process, stack.pool.id, stack.lanes)
	// A shrink pulls up what a grow by as much would have pushed, as far as the shapes above let it.
	const shift =
		deepen < 0 ? -Math.min(-deepen, roomAbove(defs, plane, bottom(oldPool), keep, after)) : deepen
	const kinked = shift !== 0 ? pushBelow(defs, next, plane, bottom(oldPool), shift, keep) : []
	for (const shape of plane.shapes) {
		const bounds = after.get(shape.bpmnElement)
		if (bounds) shape.bounds = bounds
	}
	straighten(defs, plane, kinked)
	if (stack.process) pushRight(defs, next, plane, oldPool, newPool, keep)
	if (!same(newPool, oldPool)) redockMessages(next, plane, stack.pool.id)
	return next
}

/**
 * How far up what {@link pushBelow} moves from `line` on `plane` (all but
 * `keep`) may go before it lands on a shape that stays: the least gap between
 * one of them and a staying shape above it in its columns. A staying shape is
 * any other one, `keep` included, so the shrunk pool's annotations that now
 * hang below it count too; a band in `bands` (the shrunk pool and its lanes)
 * counts at its new bounds there. 0 when one of them already starts under a
 * staying shape's bottom.
 */
function roomAbove(
	defs: BpmnDefinitions,
	plane: BpmnDiPlane,
	line: number,
	keep: ReadonlySet<string>,
	bands: ReadonlyMap<string, BpmnBounds>,
): number {
	const moving = shapesBeyond(plane, "v", line, 1, keep, anchors(defs))
	const stays = plane.shapes
		.filter((s) => !moving.has(s.bpmnElement))
		.map((s) => bands.get(s.bpmnElement) ?? s.bounds)
	let room = Number.POSITIVE_INFINITY
	// Every moving shape against every staying one, O(n²): one resize on planes
	// of a few hundred shapes. Sorting by x would make it O(n log n) if needed.
	for (const s of plane.shapes) {
		if (!moving.has(s.bpmnElement)) continue
		const m = s.bounds
		for (const k of stays) {
			if (k.y < m.y && k.x < right(m) && m.x < right(k)) room = Math.min(room, m.y - bottom(k))
		}
	}
	return Math.max(0, room)
}
