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

/** Width of a pool's name strip; a top-level lane starts this far right of its pool. */
export const POOL_HEADER = 30

/** Height of a lane band added to a pool. */
export const LANE_BAND_HEIGHT = 120

/** Height of a new partner pool: an empty band, like auto-layout's black box. */
export const BLACK_BOX_HEIGHT = 60

export const right = (b: BpmnBounds) => b.x + b.width

export const bottom = (b: BpmnBounds) => b.y + b.height

export const centreOf = (b: BpmnBounds) => ({ x: b.x + b.width / 2, y: b.y + b.height / 2 })

export const contains = (b: BpmnBounds, p: { x: number; y: number }) =>
	p.x >= b.x && p.x <= right(b) && p.y >= b.y && p.y <= bottom(b)

/** Whether `p` lies right of `b` within its height, or below it within its width. */
export const besideOrBelow = (b: BpmnBounds, p: { x: number; y: number }) =>
	p.x >= b.x && p.y >= b.y && (p.y <= bottom(b) || p.x <= right(b))

/** Whether `a` and `b` share more than an edge. */
export const overlaps = (a: BpmnBounds, b: BpmnBounds) =>
	a.x < right(b) && b.x < right(a) && a.y < bottom(b) && b.y < bottom(a)

/** Half a pixel: an edge written a rounding error away from another is the same edge. */
export const sameEdge = (a: number, b: number) => Math.abs(a - b) < 0.5

/** The plane that draws `elementId`, and its shape there. */
export function drawn(
	defs: BpmnDefinitions,
	elementId: string,
): { plane: BpmnDiPlane; shape: BpmnDiShape } | undefined {
	for (const diagram of defs.diagrams) {
		const shape = diagram.plane.shapes.find((s) => s.bpmnElement === elementId)
		if (shape) return { plane: diagram.plane, shape }
	}
	return undefined
}

// ── Copying what an edit changes ────────────────────────────────────────────────

/** What an edit changes in place, so {@link copyTouched} copies it first. */
interface Touched {
	processes?: readonly BpmnProcess[]
	collaborations?: readonly BpmnCollaboration[]
	diagrams?: readonly BpmnDiagram[]
}

/**
 * A copy of `defs` in which the processes, collaborations and diagrams listed
 * in `touched` are deep copies and every other one is the very object of
 * `defs`. The command stack keeps up to 100 documents, so an edit that copied
 * the whole document would keep 100 copies of the processes it never touched
 * (8b.6). The caller must list everything it changes in place.
 */
export function copyTouched(defs: BpmnDefinitions, touched: Touched): BpmnDefinitions {
	const copy = <T>(items: T[], picked: readonly T[] = []): T[] =>
		items.map((item) => (picked.includes(item) ? structuredClone(item) : item))
	return {
		...defs,
		processes: copy(defs.processes, touched.processes),
		collaborations: copy(defs.collaborations, touched.collaborations),
		diagrams: copy(defs.diagrams, touched.diagrams),
	}
}

/** Whether the plane of `diagram` draws one of `ids`, as a shape or an edge. */
export const drawsAny = (diagram: BpmnDiagram, ids: ReadonlySet<string>) =>
	diagram.plane.shapes.some((s) => ids.has(s.bpmnElement)) ||
	diagram.plane.edges.some((e) => ids.has(e.bpmnElement))

/** The diagrams of `defs` whose plane draws one of `ids`. */
export function diagramsDrawing(defs: BpmnDefinitions, ids: ReadonlySet<string>): BpmnDiagram[] {
	return defs.diagrams.filter((d) => drawsAny(d, ids))
}

// ── The primary process first ───────────────────────────────────────────────────

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
 * When the result would lead {@link primaryProcess} to another process, it
 * names the one `fn` edited in `primaryProcessId`, and otherwise carries no
 * `primaryProcessId` at all: once an edit empties the
 * user's own pool, the document can read like a file whose only content is the
 * partner's, and the pin keeps the next edit where this one went.
 * It is part of the result, so every replica that applies the same edit to the
 * same document (a Drop room, its watchers) keeps the same pin.
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
	// Before `fn`: a change script edits the view in place.
	const edited = primaryProcess(defs)?.id
	const out = fn(view)
	if (out === view) return defs
	const primary = view.processes[0]
	const drawing = view.diagrams[0]
	const placed =
		view === defs
			? out
			: {
					...out,
					processes: primary
						? putBack(defs.processes, out.processes, (p) => p.id, primary.id)
						: out.processes,
					diagrams: drawing
						? putBack(defs.diagrams, out.diagrams, diagramKey, diagramKey(drawing))
						: out.diagrams,
				}
	// Only where the edit made the document point elsewhere, and dropped once it
	// no longer does: the pin is then exactly what the XML carries, so a session
	// and a reload of its file agree whatever the edit history.
	const bare = pinPrimaryProcess(placed, undefined)
	if (edited === undefined || primaryProcess(bare)?.id === edited) return bare
	return pinPrimaryProcess(bare, edited)
}

// ── What an edit leaves alone ───────────────────────────────────────────────────

/** Deep enough for any model the parser builds; a deeper walk means a cycle. */
export const MAX_DEPTH = 64

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
export function collectContent(
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
 * it over its neighbour, decision U4), every pool but a black box and the own
 * pool of the {@link primaryProcess}, which takes what it holds along
 * ({@link poolHolds}; a partner's content would stay behind), and the
 * {@link lockedIds}.
 */
export function unmovableIds(defs: BpmnDefinitions): Set<string> {
	const primary = primaryProcess(defs)
	const frozen = new Set([
		...defs.processes.flatMap((p) => allLanes(p.laneSet).map((lane) => lane.id)),
		...lockedIds(defs),
	])
	for (const participant of defs.collaborations.flatMap((c) => c.participants)) {
		const own = primary !== undefined && participant.processRef === primary.id
		if (!own && !isBlackBox(defs, participant)) frozen.add(participant.id)
	}
	return frozen
}

/**
 * What a move of pool `poolId` takes along when it is the own pool of the
 * {@link primaryProcess} (critique 8c.2): its lanes, every element and flow of
 * the process at any sub-process depth, and the annotations of the process and
 * of the collaborations whose centre lies inside the pool. A note beside the
 * pool stays, as it may be about another pool. Empty for any other pool.
 */
export function poolHolds(defs: BpmnDefinitions, poolId: string): string[] {
	const pool = defs.collaborations.flatMap((c) => c.participants).find((p) => p.id === poolId)
	// The pool first: a move asks this for every id it moves.
	const primary = pool?.processRef === undefined ? undefined : primaryProcess(defs)
	if (!primary || pool?.processRef !== primary.id) return []
	const held = new Set(allLanes(primary.laneSet).map((lane) => lane.id))
	collectContent(primary.flowElements, primary.sequenceFlows, held, 0)
	const bounds = drawn(defs, poolId)?.shape.bounds
	const notes = [
		...primary.textAnnotations,
		...defs.collaborations.flatMap((c) => c.textAnnotations),
	]
	for (const note of notes) {
		const b = drawn(defs, note.id)?.shape.bounds
		if (bounds && b && contains(bounds, centreOf(b))) held.add(note.id)
	}
	return [...held]
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
 * For every element of `defs` that must move with another when a band opens
 * under it, the top-level shape it follows, by element id: a boundary event
 * follows its host, and whatever an expanded sub-process holds (nodes, flows,
 * notes, associations, at any depth) follows the top-level sub-process, so a
 * container straddling the line is not torn from its children.
 */
export function anchors(defs: BpmnDefinitions): Map<string, string> {
	const anchor = new Map<string, string>()
	const hosts = new Map<string, string>()
	const walk = (
		elements: readonly BpmnFlowElement[],
		top: string | undefined,
		depth: number,
	): void => {
		if (depth > MAX_DEPTH) throw new Error("sub-processes nested too deep, or cyclic")
		for (const el of elements) {
			if (top !== undefined) anchor.set(el.id, top)
			if (el.type === "boundaryEvent") hosts.set(el.id, el.attachedToRef)
			if (!("flowElements" in el)) continue
			const owner = top ?? el.id
			for (const inner of [...el.sequenceFlows, ...el.textAnnotations, ...el.associations]) {
				anchor.set(inner.id, owner)
			}
			walk(el.flowElements, owner, depth + 1)
		}
	}
	for (const process of defs.processes) walk(process.flowElements, undefined, 0)
	// A nested host has its container as anchor, a top-level one is its own.
	for (const [event, host] of hosts) anchor.set(event, anchor.get(host) ?? host)
	return anchor
}

/**
 * The source and target of every sequence flow, association and message flow
 * of `defs`, at any sub-process depth, by flow id: what an edge's first and
 * last waypoint are docked on.
 */
export function edgeEnds(defs: BpmnDefinitions): Map<string, readonly [string, string]> {
	const ends = new Map<string, readonly [string, string]>()
	const add = (flows: readonly { id: string; sourceRef: string; targetRef: string }[]) => {
		for (const f of flows) ends.set(f.id, [f.sourceRef, f.targetRef])
	}
	const walk = (elements: readonly BpmnFlowElement[], depth: number): void => {
		if (depth > MAX_DEPTH) throw new Error("sub-processes nested too deep, or cyclic")
		for (const el of elements) {
			if (!("flowElements" in el)) continue
			add(el.sequenceFlows)
			add(el.associations)
			walk(el.flowElements, depth + 1)
		}
	}
	for (const process of defs.processes) {
		add(process.sequenceFlows)
		add(process.associations)
		walk(process.flowElements, 0)
	}
	for (const collaboration of defs.collaborations) {
		add(collaboration.messageFlows)
		add(collaboration.associations)
	}
	for (const [id, pair] of dataAssociationEnds(defs)) ends.set(id, pair)
	return ends
}

/**
 * The drawn ends of every data association of `defs`, at any sub-process
 * depth, by association id: an input runs from its source to the node that
 * holds it, an output from that node to its target. An input's own target is
 * the node's property placeholder, which has no shape, so the node stands in.
 */
export function dataAssociationEnds(defs: BpmnDefinitions): Map<string, readonly [string, string]> {
	const ends = new Map<string, readonly [string, string]>()
	const walk = (elements: readonly BpmnFlowElement[], depth: number): void => {
		if (depth > MAX_DEPTH) throw new Error("sub-processes nested too deep, or cyclic")
		for (const el of elements) {
			if ("dataInputAssociations" in el) {
				for (const a of el.dataInputAssociations ?? []) {
					const source = a.sourceRefs[0]
					if (a.id && source) ends.set(a.id, [source, el.id])
				}
			}
			if ("dataOutputAssociations" in el) {
				for (const a of el.dataOutputAssociations ?? []) {
					if (a.id && a.targetRef) ends.set(a.id, [el.id, a.targetRef])
				}
			}
			if ("flowElements" in el) walk(el.flowElements, depth + 1)
		}
	}
	for (const process of defs.processes) walk(process.flowElements, 0)
	return ends
}

/** A direction to make room in: `h` moves what is right (or left) of a vertical line, `v` what is below (or above) a horizontal one. */
export type SpaceAxis = "h" | "v"

/** One axis of bounds and points, so one walk serves both directions. */
interface Along {
	/** Where `b` starts on the axis, and how far it reaches along it. */
	start(b: BpmnBounds): number
	size(b: BpmnBounds): number
	/** Where `p` lies on the axis. */
	at(p: { x: number; y: number }): number
	/** `b` moved along the axis by `d`. */
	shift(b: BpmnBounds, d: number): BpmnBounds
	/** `p` moved along the axis by `d`. */
	shiftPoint<P extends { x: number; y: number }>(p: P, d: number): P
	/** `b` starting at `start` and reaching `size` along the axis. */
	span(b: BpmnBounds, start: number, size: number): BpmnBounds
}

export const ALONG: Record<SpaceAxis, Along> = {
	h: {
		start: (b) => b.x,
		size: (b) => b.width,
		at: (p) => p.x,
		shift: (b, d) => ({ ...b, x: b.x + d }),
		shiftPoint: (p, d) => ({ ...p, x: p.x + d }),
		span: (b, start, size) => ({ ...b, x: start, width: size }),
	},
	v: {
		start: (b) => b.y,
		size: (b) => b.height,
		at: (p) => p.y,
		shift: (b, d) => ({ ...b, y: b.y + d }),
		shiftPoint: (p, d) => ({ ...p, y: p.y + d }),
		span: (b, start, size) => ({ ...b, y: start, height: size }),
	},
}

/**
 * Whether a coordinate lies at or past `line` on `side` of it: after it for a
 * positive `side`. Half a pixel: what is written on the line itself is beyond it.
 */
function beyondLine(line: number, side: 1 | -1): (c: number) => boolean {
	return (c) => (side > 0 ? c >= line - 0.5 : c <= line + 0.5)
}

/**
 * The ids of the shapes of `plane` that {@link pushBeyond} moves: those not
 * in `keep` whose centre along `axis`, or their anchor's (`anchor`), lies
 * beyond `line` on `side` ({@link beyondLine}).
 */
export function shapesBeyond(
	plane: BpmnDiPlane,
	axis: SpaceAxis,
	line: number,
	side: 1 | -1,
	keep: ReadonlySet<string>,
	anchor: ReadonlyMap<string, string>,
): Set<string> {
	const a = ALONG[axis]
	const beyond = beyondLine(line, side)
	const middle = (b: BpmnBounds) => a.start(b) + a.size(b) / 2
	const before = new Map(plane.shapes.map((s) => [s.bpmnElement, s.bounds]))
	const goes = (s: BpmnDiShape) => {
		const host = before.get(anchor.get(s.bpmnElement) ?? "")
		return beyond(middle(host ?? s.bounds))
	}
	return new Set(
		plane.shapes.filter((s) => !keep.has(s.bpmnElement) && goes(s)).map((s) => s.bpmnElement),
	)
}

/**
 * Moves every shape whose centre lies beyond `line` by `delta` along `axis`,
 * in place, with its label, and every waypoint and edge label of `plane`
 * beyond it, except the shapes and edges of the elements in `keep`. Beyond
 * means at or past the line on `side`, by default the direction of `delta`:
 * below it for a positive `v`, left of it for a negative `h`. An edge's first and last
 * waypoint go with the drawn shape they are docked on (`ends`), so an end on
 * the line stays on a shape that stays; on a shape in `keep`, which grows from
 * its edge on this side of the line instead, they go by the line unless they
 * sit on that edge. By centre, so a node straddling the line moves with the
 * band its centre (and its lane ref) is in; what has an anchor (`anchors`:
 * boundary events, a sub-process's content) goes whole with its anchor, by
 * the anchor's centre before the move. What a pool that grows downwards does
 * to the pools and messages below it, what a lane band inserted at `line`
 * does to the lanes and nodes below it, and what the space tool does. `side`
 * picks the other side of the line for a pull: a positive `side` with a
 * negative `delta` moves what is below the line up, what a pool that shrinks
 * from its bottom does. An edge the push would kink (a segment drawn
 * horizontal or vertical left askew: a node straddling the line, or ends on
 * either side of it joined straight) moves whole when both its ends went, as
 * a pool carries its flows; one with a single end moved is returned in
 * `kinked`, for the caller to re-route with {@link straighten} once the shapes
 * in `keep` have grown: routed now, it would go round their old bounds.
 * `ends` are the edges' docked shapes ({@link edgeEnds} of `defs`). Returns
 * the ids of the shapes it moved, and those edges.
 */
export function pushBeyond(
	plane: BpmnDiPlane,
	axis: SpaceAxis,
	line: number,
	delta: number,
	keep: ReadonlySet<string>,
	anchor: ReadonlyMap<string, string>,
	defs: BpmnDefinitions,
	side: 1 | -1 = delta > 0 ? 1 : -1,
): { moved: Set<string>; kinked: Kinked[] } {
	const ends = edgeEnds(defs)
	const a = ALONG[axis]
	const beyond = beyondLine(line, side)
	const middle = (b: BpmnBounds) => a.start(b) + a.size(b) / 2
	const before = new Map(plane.shapes.map((s) => [s.bpmnElement, s.bounds]))
	/** Whether the anchor of `id` goes; `undefined` when `id` has no drawn anchor. */
	const anchorGoes = (id: string) => {
		const b = before.get(anchor.get(id) ?? "")
		return b && beyond(middle(b))
	}
	const moved = shapesBeyond(plane, axis, line, side, keep, anchor)
	for (const s of plane.shapes) {
		if (!moved.has(s.bpmnElement)) continue
		s.bounds = a.shift(s.bounds, delta)
		if (s.label?.bounds) s.label.bounds = a.shift(s.label.bounds, delta)
	}
	/** Whether a waypoint at `c` docked on `id` goes; `undefined` when `id` is not drawn. */
	const dockGoes = (id: string | undefined, c: number) => {
		const b = before.get(id ?? "")
		if (!b || id === undefined) return undefined
		// The edge a shape in `keep` grows from stays: its top for a downward push.
		const fixed = side > 0 ? a.start(b) : a.start(b) + a.size(b)
		return keep.has(id) ? beyond(c) && !sameEdge(c, fixed) : moved.has(id)
	}
	const kinked: Kinked[] = []
	for (const edge of plane.edges) {
		if (keep.has(edge.bpmnElement)) continue
		const whole = anchorGoes(edge.bpmnElement)
		const [source, target] = ends.get(edge.bpmnElement) ?? []
		const was = { waypoints: edge.waypoints, label: edge.label?.bounds }
		const last = was.waypoints.length - 1
		const goes = was.waypoints.map((p, k) => {
			const docked = k === 0 ? source : k === last ? target : undefined
			return whole ?? dockGoes(docked, a.at(p)) ?? beyond(a.at(p))
		})
		edge.waypoints = was.waypoints.map((p, k) => (goes[k] ? a.shiftPoint(p, delta) : p))
		const label = was.label
		if (edge.label && label && (whole ?? beyond(a.start(label)))) {
			edge.label.bounds = a.shift(label, delta)
		}
		if (whole !== undefined || !askew(was.waypoints, edge.waypoints)) continue
		if (goes[0] === true && goes[last] === true) {
			edge.waypoints = was.waypoints.map((p) => a.shiftPoint(p, delta))
			if (edge.label && label) edge.label.bounds = a.shift(label, delta)
		} else kinked.push({ id: edge.bpmnElement, ends: ends.get(edge.bpmnElement), ...was })
	}
	return { moved, kinked }
}

/**
 * An edge {@link pushBeyond} kinked with a single end moved: its id, the
 * shapes it is docked on, and its waypoints and label before the push.
 */
export interface Kinked {
	id: string
	ends: readonly [string, string] | undefined
	waypoints: BpmnWaypoint[]
	label: BpmnBounds | undefined
}

/** Whether a segment of `before` drawn horizontal or vertical runs askew in `after`, the same edge pushed. */
function askew(before: readonly BpmnWaypoint[], after: readonly BpmnWaypoint[]): boolean {
	const straight = (p: BpmnWaypoint, q: BpmnWaypoint) =>
		Math.abs(p.x - q.x) < 1 || Math.abs(p.y - q.y) < 1
	return after.some((q, k) => {
		const [p, was, wasNext] = [after[k - 1], before[k - 1], before[k]]
		return p && was && wasNext ? straight(was, wasNext) && !straight(p, q) : false
	})
}

/**
 * Routes afresh, in place, the edges {@link pushBeyond} kinked on `plane` of
 * `defs` between their ends as `plane` now draws them, as the move op does: a
 * message flow by `rerouteMessage`, any other edge around the shapes but
 * swimlanes. Called once the shapes that grow from the line have their new
 * bounds. An edge with an end not drawn keeps its pushed waypoints: there is
 * nothing to route to, and the end that is drawn stays on its shape.
 */
export function straighten(
	defs: BpmnDefinitions,
	plane: BpmnDiPlane,
	kinked: readonly Kinked[],
): void {
	if (kinked.length === 0) return
	const flows = new Map(defs.collaborations.flatMap((c) => c.messageFlows).map((f) => [f.id, f]))
	const pools = new Set(defs.collaborations.flatMap((c) => c.participants.map((p) => p.id)))
	const swimlanes = swimlaneIds(defs)
	const boundsOf = new Map(plane.shapes.map((s) => [s.bpmnElement, s.bounds]))
	for (const { id, ends, waypoints, label } of kinked) {
		// By id: a caller may have replaced the edge object since the push.
		const edge = plane.edges.find((e) => e.bpmnElement === id)
		if (!edge) continue
		const flow = flows.get(id)
		if (flow) {
			const before = {
				...edge,
				waypoints,
				...(edge.label ? { label: { ...edge.label, bounds: label } } : {}),
			}
			const routed = rerouteMessage(before, flow, plane.shapes, pools)
			if (routed !== before) Object.assign(edge, routed)
			continue
		}
		const [source = "", target = ""] = ends ?? []
		const [from, to] = [boundsOf.get(source), boundsOf.get(target)]
		if (!from || !to) continue
		const obstacles = plane.shapes
			.filter((s) => ![source, target].includes(s.bpmnElement) && !swimlanes.has(s.bpmnElement))
			.map((s) => s.bounds)
		edge.waypoints = computeWaypointsAvoiding(from, to, obstacles)
	}
}

/**
 * Returns a copy of `defs` with a {@link LANE_BAND_HEIGHT} band for the
 * top-level lane `laneId` drawn across pool `poolId` at `at`, an edge between
 * two of its top-level lanes or one of its own (by default its bottom edge):
 * the pool grows by the band, and every shape whose centre is at or below `at`
 * (`pushBeyond`), lanes and other pools included, moves down by as much, with
 * labels and waypoints, so nothing changes band and the pools below keep their
 * messages. The lane itself must already be in the model. Only the diagram
 * that draws the pool is copied. Unchanged when the pool has no shape.
 */
export function insertLaneBand(
	defs: BpmnDefinitions,
	poolId: string,
	laneId: string,
	shapeId: string,
	at?: number,
): BpmnDefinitions {
	const next = copyTouched(defs, { diagrams: diagramsDrawing(defs, new Set([poolId])) })
	const found = drawn(next, poolId)
	if (!found) return defs
	const { plane, shape: pool } = found
	const height = LANE_BAND_HEIGHT
	const line = at ?? bottom(pool.bounds)
	const { kinked } = pushBeyond(plane, "v", line, height, new Set([poolId]), anchors(defs), defs)
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
	straighten(defs, plane, kinked)
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
export function topToBottom(defs: BpmnDefinitions, lanes: readonly BpmnLane[]): BpmnLane[] {
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
 * leaves the pool as it is. The lane's shape is deleted. Only that process and
 * the diagrams that draw its lanes are copied. `undefined` when the lane is not
 * in that process or has child lanes.
 */
export function removeLaneBand(
	defs: BpmnDefinitions,
	processIndex: number,
	laneId: string,
): BpmnDefinitions | undefined {
	const owner = defs.processes[processIndex]
	if (!owner) return undefined
	const bands = new Set(allLanes(owner.laneSet).map((candidate) => candidate.id))
	const next = copyTouched(defs, { processes: [owner], diagrams: diagramsDrawing(defs, bands) })
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
	return dropAssociationsTo(next, new Set([laneId]))
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
	// The label goes where the route goes, keeping its offset from the spot
	// `edgeLabelBounds` picks, as a translated edge's label keeps its own.
	const label = edge.label?.bounds
	const from = label && edgeLabelBounds(edge.waypoints)
	const to = label && edgeLabelBounds(waypoints)
	if (!edge.label || !label || !from || !to) return { ...edge, waypoints }
	const bounds = { ...label, x: label.x + to.x - from.x, y: label.y + to.y - from.y }
	return { ...edge, waypoints, label: { ...edge.label, bounds } }
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
export const POOL_PADDING = 30

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

// ── Deleting pools and lanes ────────────────────────────────────────────────────

/**
 * Returns `defs` without the associations of every process and collaboration
 * that start or end at a `gone` id, and their edges; only what holds one is
 * copied. A deleted node's go in deleteContent; a deleted swimlane's go here,
 * so the change scripts, which come here directly, drop them too. `defs`
 * itself when none does.
 */
export function dropAssociationsTo(
	defs: BpmnDefinitions,
	gone: ReadonlySet<string>,
): BpmnDefinitions {
	const dropped = new Set<string>()
	const prune = <T extends { associations: BpmnAssociation[] }>(holder: T): T => {
		const kept = holder.associations.filter((a) => !gone.has(a.sourceRef) && !gone.has(a.targetRef))
		if (kept.length === holder.associations.length) return holder
		for (const a of holder.associations) if (!kept.includes(a)) dropped.add(a.id)
		return { ...holder, associations: kept }
	}
	const processes = defs.processes.map(prune)
	const collaborations = defs.collaborations.map(prune)
	if (dropped.size === 0) return defs
	return {
		...defs,
		processes,
		collaborations,
		diagrams: defs.diagrams.map((d) =>
			d.plane.edges.some((e) => dropped.has(e.bpmnElement))
				? {
						...d,
						plane: { ...d.plane, edges: d.plane.edges.filter((e) => !dropped.has(e.bpmnElement)) },
					}
				: d,
		),
	}
}
