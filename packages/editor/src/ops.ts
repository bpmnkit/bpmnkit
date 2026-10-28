/**
 * The editor's operations: what a change *was*, rather than what it produced.
 *
 * `diagram:change` hands out the whole new document, which is all a single
 * editor needs. Sending that over a wire on every keystroke is not: a
 * `moveShapes` op is a few hundred bytes where a serialised `BpmnDefinitions`
 * is hundreds of kilobytes. So every edit also describes itself, and
 * {@link applyOp} turns the description back into the edit.
 *
 * **`applyOp` is the only way the editor performs these edits**, locally as well
 * as on replay. That is deliberate: if the editor composed the modeling calls
 * itself and `applyOp` composed them again, the two could drift, and the whole
 * point is that the same op yields byte-identical XML wherever it runs. Ids are
 * the other half of that promise — creating ops carry a seed rather than
 * inventing ids at random, so a replay mints the same ones (see `id.ts`).
 */
import type {
	BpmnBounds,
	BpmnDefinitions,
	BpmnDiEdge,
	BpmnDiShape,
	BpmnWaypoint,
	DiColor,
} from "@bpmnkit/core"
import { applyAutoLayout } from "@bpmnkit/core"
import { createIdFactory } from "./id.js"
import {
	type Clipboard,
	canEndFlow,
	changeElementType,
	createAnnotation,
	createAnnotationWithLink,
	createBoundaryEvent,
	createConnection,
	createShape,
	deleteElements,
	insertEdgeWaypoint,
	insertShapeOnEdge,
	moveEdgeSegment,
	moveEdgeWaypoint,
	moveShapes,
	pasteElements,
	removeCollinearWaypoints,
	resizeShape,
	updateEdgeEndpoint,
	updateLabel,
	updateLabelPosition,
	updateShapeColor,
} from "./modeling.js"
import {
	type SpaceAxis,
	addLaneBeside,
	addPool,
	lockedIds,
	makeSpace,
	settlePlaced,
	withPrimaryFirst,
} from "./swimlanes.js"
import type { CreateShapeType, PortDir } from "./types.js"

/** One shape's displacement. */
export interface ShapeMove {
	id: string
	dx: number
	dy: number
}

/**
 * A single editor edit.
 *
 * `seed` appears on every op that creates something: it is what makes the new
 * element's id a property of the op rather than of the machine that ran it.
 */
export type EditorOp =
	| {
			kind: "createShape"
			type: CreateShapeType
			bounds: BpmnBounds
			name?: string
			onEdge?: string
			seed: string
	  }
	| {
			kind: "createBoundaryEvent"
			hostId: string
			eventDefType: string | null
			bounds: BpmnBounds
			seed: string
	  }
	| { kind: "createAnnotation"; bounds: BpmnBounds; text?: string; seed: string }
	| {
			kind: "createAnnotationFor"
			sourceId: string
			bounds: BpmnBounds
			sourceBounds: BpmnBounds
			seed: string
	  }
	| {
			kind: "createConnection"
			sourceId: string
			targetId: string
			waypoints: BpmnWaypoint[]
			seed: string
	  }
	/**
	 * A shape and the flow reaching it, as one edit — the "add element" affordance.
	 *
	 * Placement and routing are decided by the editor, from shapes only it can see,
	 * and travel in the op: a replay that recomputed them would need the same
	 * obstacles on screen to land in the same place.
	 */
	| {
			kind: "createConnected"
			sourceId: string
			type: CreateShapeType
			name?: string
			bounds: BpmnBounds
			waypoints: BpmnWaypoint[]
			seed: string
	  }
	| { kind: "paste"; clipboard: Clipboard; offsetX: number; offsetY: number; seed: string }
	/**
	 * Moving the own pool takes its lanes, nodes and the notes inside it along
	 * (`poolHolds`); lanes alone stay where they are (decision U4).
	 */
	| { kind: "move"; moves: ShapeMove[]; onEdge?: { edgeId: string; shapeId: string } }
	/**
	 * The space tool (decision U10): room for `delta` at the line `origin` (an x
	 * for `h`, a y for `v`) on the side `delta` points to. What lies beyond
	 * moves, the pools, lanes and sub-processes the line crosses grow, and the
	 * lane refs follow (`makeSpace`). One undo step.
	 */
	| { kind: "space"; origin: number; axis: SpaceAxis; delta: number }
	| { kind: "resize"; id: string; bounds: BpmnBounds }
	| { kind: "delete"; ids: string[] }
	| { kind: "rename"; id: string; name: string }
	| { kind: "labelPosition"; id: string; bounds: BpmnBounds }
	| { kind: "color"; id: string; color: DiColor }
	| { kind: "changeType"; id: string; type: CreateShapeType }
	| { kind: "reconnect"; edgeId: string; isStart: boolean; port: PortDir }
	| { kind: "insertWaypoint"; edgeId: string; segIdx: number; point: BpmnWaypoint }
	| { kind: "moveWaypoint"; edgeId: string; wpIdx: number; point: BpmnWaypoint }
	| { kind: "moveSegment"; edgeId: string; segIdx: number; isHoriz: boolean; delta: number }
	| { kind: "autoLayout" }
	/**
	 * A pool. The first one wraps the primary process, drawn around its content
	 * (`bounds` only place it when nothing is drawn), with a new collaboration
	 * when the file has none; later ones are black boxes with no `processRef`,
	 * at `bounds`, refused over the own pool. `created`: the participant, then
	 * the collaboration when one was made.
	 */
	| { kind: "addParticipant"; bounds: BpmnBounds; name?: string; seed: string }
	/**
	 * An unnamed lane band `where` `refId`: the own pool or one of its top-level
	 * leaf lanes. The first on a pool without lanes makes two. Refused for nested
	 * lanes and other pools. `created`: the new lane, then the lane over the old
	 * pool and the lane set when made.
	 */
	| { kind: "addLane"; refId: string; where: "above" | "below"; seed: string }
	/**
	 * The escape hatch: a whole document, for edits that have no description.
	 *
	 * `applyChange` takes an arbitrary function — the properties panel uses it —
	 * and a function cannot be replayed. Under a single writer a whole-document
	 * op is still correct, just larger on the wire, so nothing is unreplayable;
	 * it simply costs more.
	 */
	| { kind: "snapshot"; defs: BpmnDefinitions }

/** The result of an op: the new document, and anything it brought into being. */
export interface OpResult {
	defs: BpmnDefinitions
	/** Ids created by this op, in the order they were made. Empty for edits. */
	created: string[]
}

/**
 * Performs an op. The same op, on the same document, anywhere.
 *
 * Edits land in the primary process and on the diagram that draws it, wherever
 * the file lists them (see `withPrimaryFirst`). An op that changes nothing
 * returns `defs` itself.
 */
export function applyOp(defs: BpmnDefinitions, op: EditorOp): OpResult {
	// A snapshot replaces the document; there is nothing in it to reorder.
	if (op.kind === "snapshot") return { defs: op.defs, created: [] }
	let created: string[] = []
	const next = withPrimaryFirst(defs, (first) => {
		// A file without diagram interchange and with nothing to lay out opens
		// without a plane; the first edit that changes something draws one.
		const base =
			first.diagrams.length === 0 && first.processes.length > 0 ? applyAutoLayout(first) : first
		const r = applyEdit(base, op)
		created = r.created
		return r.defs === base ? first : r.defs
	})
	return { defs: next === defs ? defs : withoutFloatNoise(defs, next), created }
}

/**
 * Rounds away the binary noise (`110.20000000000002`) that adding fractional
 * deltas leaves on the DI values `after` changed. Fifteen significant digits
 * keep every value a file can state exactly. A value is compared with the one
 * the shape or edge of the same DI id had in `before`, not by object identity:
 * swimlane edits deep-copy the whole diagram, and a moved shape keeps its label
 * size. What the op left alone keeps its digits, so a file that already carries
 * long decimals exports unchanged where it was not edited.
 */
function withoutFloatNoise(before: BpmnDefinitions, after: BpmnDefinitions): BpmnDefinitions {
	const kept = new Set<object>()
	const shapesBefore = new Map<string, BpmnDiShape>()
	const edgesBefore = new Map<string, BpmnDiEdge>()
	for (const diagram of before.diagrams) {
		for (const item of [...diagram.plane.shapes, ...diagram.plane.edges]) kept.add(item)
		for (const shape of diagram.plane.shapes) shapesBefore.set(shape.id, shape)
		for (const edge of diagram.plane.edges) edgesBefore.set(edge.id, edge)
	}
	const clean = (v: number, old: number | undefined) => (v === old ? v : Number(v.toPrecision(15)))
	const box = (b: BpmnBounds, old: BpmnBounds | undefined): BpmnBounds => ({
		...b,
		x: clean(b.x, old?.x),
		y: clean(b.y, old?.y),
		width: clean(b.width, old?.width),
		height: clean(b.height, old?.height),
	})
	const point = (p: BpmnWaypoint, old: BpmnWaypoint | undefined): BpmnWaypoint => ({
		...p,
		x: clean(p.x, old?.x),
		y: clean(p.y, old?.y),
	})
	let changed = false
	const diagrams = after.diagrams.map((diagram) => {
		const { plane } = diagram
		// A diagram the op did not touch stays the same object: edits share what they leave alone.
		if ([...plane.shapes, ...plane.edges].every((item) => kept.has(item))) return diagram
		changed = true
		const shapes = plane.shapes.map((shape) => {
			if (kept.has(shape)) return shape
			const old = shapesBefore.get(shape.id)
			const label = shape.label?.bounds
				? { ...shape.label, bounds: box(shape.label.bounds, old?.label?.bounds) }
				: shape.label
			return { ...shape, bounds: box(shape.bounds, old?.bounds), ...(label ? { label } : {}) }
		})
		const edges = plane.edges.map((edge) => {
			if (kept.has(edge)) return edge
			const old = edgesBefore.get(edge.id)
			const label = edge.label?.bounds
				? { ...edge.label, bounds: box(edge.label.bounds, old?.label?.bounds) }
				: edge.label
			const waypoints = edge.waypoints.map((p, i) => point(p, old?.waypoints[i]))
			return { ...edge, waypoints, ...(label ? { label } : {}) }
		})
		return { ...diagram, plane: { ...plane, shapes, edges } }
	})
	return changed ? { ...after, diagrams } : after
}

/** Nothing happened: what an edit returns when it refuses the whole op. */
const refused = (defs: BpmnDefinitions): OpResult => ({ defs, created: [] })

/**
 * `r` once `settlePlaced` has kept the shapes `placed` inside the own pool and
 * their lane refs in step with the drawing; {@link refused} when it will not.
 */
function settled(
	before: BpmnDefinitions,
	r: OpResult,
	placed: readonly string[],
	created: boolean,
	outward = false,
): OpResult {
	if (r.defs === before) return r
	const next = settlePlaced(r.defs, placed, created, outward)
	return next ? { defs: next, created: r.created } : refused(before)
}

/** Performs an edit on a document whose primary process and its diagram come first. */
function applyEdit(defs: BpmnDefinitions, op: Exclude<EditorOp, { kind: "snapshot" }>): OpResult {
	switch (op.kind) {
		case "createShape": {
			const r = createShape(defs, op.type, op.bounds, op.name, createIdFactory(op.seed))
			if (r.defs === defs) return refused(defs)
			// Dropping a shape onto a flow splices it into that flow.
			const next = op.onEdge ? insertShapeOnEdge(r.defs, op.onEdge, r.id) : r.defs
			return settled(defs, { defs: next, created: [r.id] }, [r.id], true)
		}
		case "createBoundaryEvent": {
			const r = createBoundaryEvent(
				defs,
				op.hostId,
				op.eventDefType,
				op.bounds,
				true,
				createIdFactory(op.seed),
			)
			if (r.defs === defs) return refused(defs)
			return settled(defs, { defs: r.defs, created: [r.id] }, [r.id], true)
		}
		case "createAnnotation": {
			const r = createAnnotation(defs, op.bounds, op.text, createIdFactory(op.seed))
			return { defs: r.defs, created: [r.id] }
		}
		case "createAnnotationFor": {
			const r = createAnnotationWithLink(
				defs,
				op.bounds,
				op.sourceId,
				op.sourceBounds,
				undefined,
				createIdFactory(op.seed),
			)
			if (r.defs === defs) return refused(defs)
			return { defs: r.defs, created: [r.annotationId, r.associationId] }
		}
		case "createConnection": {
			const r = createConnection(
				defs,
				op.sourceId,
				op.targetId,
				op.waypoints,
				createIdFactory(op.seed),
			)
			return { defs: r.defs, created: r.defs === defs ? [] : [r.id] }
		}
		case "createConnected": {
			// Refused whole: a shape without the flow that was its reason would be half an edit.
			if (!canEndFlow(defs, op.sourceId)) return { defs, created: [] }
			// One factory for both halves, so the pair of ids is one sequence.
			const ids = createIdFactory(op.seed)
			const shape = createShape(defs, op.type, op.bounds, op.name, ids)
			const flow = createConnection(shape.defs, op.sourceId, shape.id, op.waypoints, ids)
			if (shape.defs === defs) return refused(defs)
			// Placed by the editor beside its source, which may sit at the pool's edge: the pool grows.
			const result = { defs: flow.defs, created: [shape.id, flow.id] }
			return settled(defs, result, [shape.id], true, true)
		}
		case "paste": {
			const r = pasteElements(defs, op.clipboard, op.offsetX, op.offsetY, createIdFactory(op.seed))
			return settled(defs, { defs: r.defs, created: r.topLevelIds }, r.topLevelIds, true)
		}
		case "move": {
			// A drag snapped back to where it started: moveShapes would still copy what it cascades.
			if (!op.onEdge && op.moves.every((m) => m.dx === 0 && m.dy === 0)) return refused(defs)
			const moved = moveShapes(defs, op.moves)
			if (moved === defs) return refused(defs)
			const next = op.onEdge ? insertShapeOnEdge(moved, op.onEdge.edgeId, op.onEdge.shapeId) : moved
			const ids = op.moves.map((m) => m.id)
			return settled(defs, { defs: next, created: [] }, ids, false)
		}
		case "space": {
			const r = makeSpace(defs, op.axis, op.origin, op.delta)
			if (!r) return refused(defs)
			// Only nodes whose drawing already disagreed with their refs change lane; growth is the
			// point of the op, so a node past the pool's edge (`outward`) is taken in, not refused.
			return settled(defs, { defs: r.defs, created: [] }, r.moved, false, true)
		}
		case "resize":
			return { defs: resizeShape(defs, op.id, op.bounds), created: [] }
		case "delete":
			return { defs: deleteElements(defs, op.ids), created: [] }
		case "rename":
			return { defs: updateLabel(defs, op.id, op.name), created: [] }
		// A partner's node is drawn only; its drawing is the partner's too (lockedIds).
		case "labelPosition":
			if (lockedIds(defs).has(op.id)) return refused(defs)
			return { defs: updateLabelPosition(defs, op.id, op.bounds), created: [] }
		case "color":
			if (lockedIds(defs).has(op.id)) return refused(defs)
			return { defs: updateShapeColor(defs, op.id, op.color), created: [] }
		case "changeType":
			return { defs: changeElementType(defs, op.id, op.type), created: [] }
		case "reconnect":
			return { defs: updateEdgeEndpoint(defs, op.edgeId, op.isStart, op.port), created: [] }
		// Every waypoint edit tidies the route afterwards, so a drag that leaves
		// three points in a line does not leave the middle one behind.
		case "insertWaypoint":
			return {
				defs: removeCollinearWaypoints(
					insertEdgeWaypoint(defs, op.edgeId, op.segIdx, op.point),
					op.edgeId,
				),
				created: [],
			}
		case "moveWaypoint":
			return {
				defs: removeCollinearWaypoints(
					moveEdgeWaypoint(defs, op.edgeId, op.wpIdx, op.point),
					op.edgeId,
				),
				created: [],
			}
		case "moveSegment":
			return {
				defs: removeCollinearWaypoints(
					moveEdgeSegment(defs, op.edgeId, op.segIdx, op.isHoriz, op.delta),
					op.edgeId,
				),
				created: [],
			}
		case "autoLayout":
			return { defs: applyAutoLayout(defs), created: [] }
		case "addParticipant":
			return addPool(defs, op.bounds, op.name, createIdFactory(op.seed)) ?? refused(defs)
		case "addLane":
			return addLaneBeside(defs, op.refId, op.where, createIdFactory(op.seed)) ?? refused(defs)
	}
}
