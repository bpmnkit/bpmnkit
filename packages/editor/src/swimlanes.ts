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

// ── Copying what an edit changes ──────────────────────────────────────────────

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
function copyTouched(defs: BpmnDefinitions, touched: Touched): BpmnDefinitions {
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
const drawsAny = (diagram: BpmnDiagram, ids: ReadonlySet<string>) =>
	diagram.plane.shapes.some((s) => ids.has(s.bpmnElement)) ||
	diagram.plane.edges.some((e) => ids.has(e.bpmnElement))

/** The diagrams of `defs` whose plane draws one of `ids`. */
function diagramsDrawing(defs: BpmnDefinitions, ids: ReadonlySet<string>): BpmnDiagram[] {
	return defs.diagrams.filter((d) => drawsAny(d, ids))
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
	const { primaryProcessId: _held, ...bare } = placed
	if (edited === undefined || primaryProcess(bare)?.id === edited) return bare
	return { ...bare, primaryProcessId: edited }
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
function anchors(defs: BpmnDefinitions): Map<string, string> {
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

const ALONG: Record<SpaceAxis, Along> = {
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
function shapesBeyond(
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
function pushBeyond(
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
interface Kinked {
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
function straighten(defs: BpmnDefinitions, plane: BpmnDiPlane, kinked: readonly Kinked[]): void {
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
function redockMessages(next: BpmnDefinitions, plane: BpmnDiPlane, poolId: string): void {
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
function pushRight(
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
function poolContent(
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
function pushBelow(
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

// ── Resizing pools and lanes ──────────────────────────────────────────────────

/** The least height of a lane or pool a resize leaves, and the least width right of its header strips. */
export const MIN_BAND = 60

/** What a resize of a pool or one of its lanes works on. */
interface BandStack {
	/** The plane that draws the pool. */
	plane: BpmnDiPlane
	pool: BpmnParticipant
	/** The pool's lanes, at every depth; none for a black box. */
	lanes: BpmnLane[]
	/** The process drawn inside the pool: the primary one, or none for a black box. */
	process?: BpmnProcess
}

/**
 * The pool `id` is, or whose lane it is, when a resize may change it: a black
 * box, or the own pool of the {@link primaryProcess} and its lanes, drawn
 * horizontally on one plane. Partner pools with content are locked, and lanes
 * without a pool and vertical pools are left out: the bands are laid out
 * horizontally only.
 */
function bandStack(defs: BpmnDefinitions, id: string): BandStack | undefined {
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

/** A band's top or bottom edge, as `[band id, side]`. */
type BandEdge = [string, "top" | "bottom"]

/**
 * The band edges that are one line with `id`'s edge on `side`, `id`'s among
 * them: a parent's top and its first child's, a parent's bottom and its last
 * child's, a lane's bottom and the next sibling's top, at every depth. By the
 * lane tree and the drawn order, not by matching coordinates: a modeler file
 * may draw a lane a pixel off its pool's edge (miwg-C.10.0), and a match
 * would then move the pool without its lane.
 */
function lineOf(
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
 * no lane ref goes stale (critique I9). An edge already past a limit stays
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
 * Clamped, never refused, so no node changes band (critique I9: no lane ref
 * goes stale) and nothing moves but the bands. A pool growing down pushes
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
	// ponytail: every moving shape against every staying one, O(n²); sort by x if large planes lag.
	for (const s of plane.shapes) {
		if (!moving.has(s.bpmnElement)) continue
		const m = s.bounds
		for (const k of stays) {
			if (k.y < m.y && k.x < right(m) && m.x < right(k)) room = Math.min(room, m.y - bottom(k))
		}
	}
	return Math.max(0, room)
}

// ── Making space ──────────────────────────────────────────────────────────────

/**
 * The host of every boundary event at any sub-process depth, by event id: the
 * space tool moves a node by its own centre, but an event goes with its host.
 * A sub-process's content goes by its own centre, unlike {@link anchors}:
 * a sub-process the line crosses grows, and its content beyond the line moves.
 */
function hostAnchors(defs: BpmnDefinitions): Map<string, string> {
	const hosts = new Map<string, string>()
	const walk = (elements: readonly BpmnFlowElement[], depth: number): void => {
		if (depth > MAX_DEPTH) throw new Error("sub-processes nested too deep, or cyclic")
		for (const el of elements) {
			if (el.type === "boundaryEvent") hosts.set(el.id, el.attachedToRef)
			if ("flowElements" in el) walk(el.flowElements, depth + 1)
		}
	}
	for (const process of defs.processes) walk(process.flowElements, 0)
	return hosts
}

/** What a `space` op made: the new document, and the shapes it moved. */
export interface Spaced {
	defs: BpmnDefinitions
	moved: string[]
}

/**
 * The `space` op (decision U10), on the plane that draws the
 * {@link primaryProcess}: room for `delta` along `axis` at `line` (an x for
 * `h`, a y for `v`), on the side `delta` points to, as the space tool makes
 * it. What lies beyond the line moves by `delta`, at any process, drawing only
 * ({@link pushBeyond}: by centre, waypoints beyond it shift, so routes keep
 * their bends). The pools, lanes and expanded sub-processes the line crosses
 * grow by as much, from their edge on this side of the line: pools and lanes
 * widen for `h` (a pool takes its lanes along, so they keep reaching its
 * header strip), the lane chain and pool the line crosses deepen for `v`, and
 * a band that ends on the line grows too, so the bands still tile. No node
 * changes band. Only the diagram is copied. `undefined`, refused, for a
 * `delta` of 0, when the line crosses a pool or lane drawn vertically (the
 * bands are laid out horizontally only; a vertical one the line passes moves
 * whole or stays), and when nothing lies beyond the line.
 */
export function makeSpace(
	defs: BpmnDefinitions,
	axis: SpaceAxis,
	line: number,
	delta: number,
): Spaced | undefined {
	const index = diagramIndexOf(defs, primaryProcess(defs))
	const source = defs.diagrams[index]
	if (delta === 0 || !source) return undefined
	const swimlanes = swimlaneIds(defs)
	const shapes = source.plane.shapes
	const a = ALONG[axis]
	const crossed = (b: BpmnBounds) => {
		const [start, end] = [a.start(b), a.start(b) + a.size(b)]
		return delta > 0
			? start < line - 0.5 && end >= line - 0.5
			: end > line + 0.5 && start <= line + 0.5
	}
	const growing = shapes.filter(
		(s) => (swimlanes.has(s.bpmnElement) || s.isExpanded === true) && crossed(s.bounds),
	)
	// Stretching a vertical pool or lane would lay its bands out the wrong way; one the line
	// passes moves whole or stays, like any shape.
	if (growing.some((s) => swimlanes.has(s.bpmnElement) && s.isHorizontal === false))
		return undefined
	const grows = new Set(growing.map((s) => s.bpmnElement))
	if (axis === "h") {
		for (const pool of defs.collaborations.flatMap((c) => c.participants)) {
			if (!grows.has(pool.id)) continue
			const process = defs.processes.find((p) => p.id === pool.processRef)
			for (const lane of allLanes(process?.laneSet)) grows.add(lane.id)
		}
	}
	const next = copyTouched(defs, { diagrams: [source] })
	const plane = next.diagrams[index]?.plane
	if (!plane) return undefined
	// A host that grows stretches from the line, so its events go by their own centre: the one
	// on its far edge moves with that edge, the one on its near edge stays.
	const hosts = hostAnchors(defs)
	for (const [event, host] of hosts) if (grows.has(host)) hosts.delete(event)
	const { moved, kinked } = pushBeyond(plane, axis, line, delta, grows, hosts, defs)
	if (moved.size === 0 && grows.size === 0) return undefined
	for (const s of plane.shapes) {
		if (!grows.has(s.bpmnElement)) continue
		const [start, size] = [a.start(s.bounds), a.size(s.bounds)]
		s.bounds =
			delta > 0
				? a.span(s.bounds, start, size + delta)
				: a.span(s.bounds, start + delta, size - delta)
	}
	straighten(defs, plane, kinked)
	return { defs: next, moved: [...moved] }
}

// ── Creating pools and lanes ──────────────────────────────────────────────────

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
 * `poolBoundsFor`) on a plane that then draws the collaboration (critique X8).
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

/** The participant of `process` in `defs`, if one draws it. */
function poolOf(defs: BpmnDefinitions, process: BpmnProcess): BpmnParticipant | undefined {
	return defs.collaborations.flatMap((c) => c.participants).find((p) => p.processRef === process.id)
}

/**
 * The `addParticipant` op, on a document whose primary process is
 * `processes[0]` drawn on `diagrams[0]`. When that process has no drawn pool
 * it gets one ({@link poolPrimary}), named `name`, around its content: `bounds`
 * only place the pool of a process with nothing drawn. Otherwise a black box
 * named `name`, with no `processRef` (decision U8), is drawn at `bounds`
 * ({@link addBlackBox}); refused when that overlaps the own pool, as a black
 * box moved there is (critique I4). `created`: the participant, then the
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
 * lanes the first add makes two (decision U5): the one asked for and one over
 * the whole old pool holding every node ({@link addFirstLane}). Existing lane
 * refs never change, as the band goes in at an edge and what is below moves
 * by it. `created`: the new lane, then the lane that took the old pool and the
 * new lane set when made. `undefined`, refused, for a child lane, a lane with
 * child lanes (nested lane editing is out of v1, critique I8), any other pool
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
 * The `addLane` op with a `count`, "Divide into lanes" (decision U6), on a
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
 * primary process with no lanes yet (decision U6; dividing a lane would make
 * child lanes, out of v1).
 */
export function canDivideLanes(defs: BpmnDefinitions, poolId: string): boolean {
	const process = primaryProcess(defs)
	const own = process && poolOf(defs, process)
	return (
		own?.id === poolId && canAddLane(defs, poolId) && (process?.laneSet?.lanes.length ?? 0) === 0
	)
}

// ── Deleting pools and lanes ──────────────────────────────────────────────────

/**
 * Returns `defs` without the associations of every process and collaboration
 * that start or end at a `gone` id, and their edges; only what holds one is
 * copied. A deleted node's go in deleteContent; a deleted swimlane's go here,
 * so the change scripts, which come here directly, drop them too. `defs`
 * itself when none does.
 */
function dropAssociationsTo(defs: BpmnDefinitions, gone: ReadonlySet<string>): BpmnDefinitions {
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
	const gone = new Set([poolId])
	for (const flow of defs.collaborations.flatMap((c) => c.messageFlows)) {
		if (flow.sourceRef === poolId || flow.targetRef === poolId) gone.add(flow.id)
	}
	// Only what held the pool or its messages is copied (8b.6).
	let next: BpmnDefinitions = {
		...defs,
		collaborations: defs.collaborations.map((c) =>
			c.participants.some((p) => gone.has(p.id)) || c.messageFlows.some((f) => gone.has(f.id))
				? {
						...c,
						participants: c.participants.filter((p) => !gone.has(p.id)),
						messageFlows: c.messageFlows.filter((f) => !gone.has(f.id)),
					}
				: c,
		),
		diagrams: defs.diagrams.map((d) =>
			drawsAny(d, gone)
				? {
						...d,
						plane: {
							...d.plane,
							shapes: d.plane.shapes.filter((s) => !gone.has(s.bpmnElement)),
							edges: d.plane.edges.filter((e) => !gone.has(e.bpmnElement)),
						},
					}
				: d,
		),
	}
	next = dropAssociationsTo(next, gone)

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
