import { associationWaypoints, packAnnotations } from "../layout/annotations.js"
import type { MessageLink } from "../layout/collaboration/alignment.js"
import { alignPools } from "../layout/collaboration/alignment.js"
import { pathCrossings } from "../layout/collaboration/crossings.js"
import type { MessageDock } from "../layout/collaboration/docked-labels.js"
import { flipDockedLabels } from "../layout/collaboration/docked-labels.js"
import { placeMessageFlowLabels } from "../layout/collaboration/message-labels.js"
import { assignTracks } from "../layout/collaboration/message-tracks.js"
import type { PoolLink } from "../layout/collaboration/ordering.js"
import { orderPools } from "../layout/collaboration/ordering.js"
import type { StackMessage, StackPool } from "../layout/collaboration/stack-crossings.js"
import { orderByCrossings } from "../layout/collaboration/stack-crossings.js"
import { collapseCollinear } from "../layout/grid/grid-router.js"
import type { LayoutEngine } from "../layout/layout-engine.js"
import { layoutProcess } from "../layout/layout-engine.js"
import type { Side } from "../layout/orthogonal.js"
import type { ConnectionKind, PlaneEdge, PlaneShape } from "../layout/repair.js"
import { repairRoutes } from "../layout/repair.js"
import { MIN_LANE_HEIGHT } from "../layout/semantic/place.js"
import type { Bounds, LayoutEdge, LayoutHints, LayoutNode, LayoutResult } from "../layout/types.js"
import type {
	BpmnBounds,
	BpmnCollaboration,
	BpmnDefinitions,
	BpmnDiEdge,
	BpmnDiShape,
	BpmnDiagram,
	BpmnFlowElement,
	BpmnLane,
	BpmnLaneSet,
	BpmnProcess,
	BpmnWaypoint,
} from "./bpmn-model.js"

const POOL_HEADER = 30
const LANE_HEADER = 30
const PADDING = 20

/**
 * Lane bands grown to hold the annotations the packer put above or below them:
 * the pool takes the bands' height, so an annotation outside them would hang
 * over the pool's edge. The outermost band on that side grows.
 */
function stretchBands(
	bands: Array<{ id: string; bounds: Bounds }>,
	annotations: Iterable<Bounds>,
): Array<{ id: string; bounds: Bounds }> {
	const out = bands.map((b) => ({ ...b, bounds: { ...b.bounds } }))
	if (out.length === 0) return out
	let top = Math.min(...out.map((b) => b.bounds.y))
	let bottom = Math.max(...out.map((b) => b.bounds.y + b.bounds.height))
	for (const a of annotations) {
		const high = a.y - PADDING
		const low = a.y + a.height + PADDING
		if (low > bottom) {
			for (const b of out)
				if (b.bounds.y + b.bounds.height === bottom) b.bounds.height += low - bottom
			bottom = low
		}
		if (high < top) {
			for (const b of out)
				if (b.bounds.y === top) {
					b.bounds.height += top - high
					b.bounds.y = high
				}
			top = high
		}
	}
	return out
}
const POOL_GAP = 30

type LocalBounds = { x: number; y: number; width: number; height: number }

function contentBbox(
	nodes: LayoutNode[],
	extra?: Iterable<LocalBounds>,
): { minX: number; minY: number; maxX: number; maxY: number } {
	let minX = Number.POSITIVE_INFINITY
	let minY = Number.POSITIVE_INFINITY
	let maxX = Number.NEGATIVE_INFINITY
	let maxY = Number.NEGATIVE_INFINITY
	for (const n of nodes) {
		minX = Math.min(minX, n.bounds.x)
		minY = Math.min(minY, n.bounds.y)
		maxX = Math.max(maxX, n.bounds.x + n.bounds.width)
		maxY = Math.max(maxY, n.bounds.y + n.bounds.height)
		if (n.labelBounds) {
			minX = Math.min(minX, n.labelBounds.x)
			minY = Math.min(minY, n.labelBounds.y)
			maxX = Math.max(maxX, n.labelBounds.x + n.labelBounds.width)
			maxY = Math.max(maxY, n.labelBounds.y + n.labelBounds.height)
		}
	}
	if (extra) {
		for (const b of extra) {
			minX = Math.min(minX, b.x)
			minY = Math.min(minY, b.y)
			maxX = Math.max(maxX, b.x + b.width)
			maxY = Math.max(maxY, b.y + b.height)
		}
	}
	return { minX, minY, maxX, maxY }
}

/**
 * Data elements are never lane members, and the engine stacks them below the
 * bands; growing the pool for them leaves tall empty tails, so only flow nodes
 * count.
 */
const NOT_LANE_MEMBERS = new Set(["dataObject", "dataObjectReference", "dataStoreReference"])

/**
 * Where a laned pool has to end so the nodes no lane claims stay inside it.
 * The engine stacks those nodes below the lane bands, so they are the ones
 * whose top lies at or under `bandBottom`; with none, `bandBottom` itself.
 */
function orphanExtent(nodes: LayoutNode[], bandBottom: number): number {
	const orphans = nodes.filter(
		(node) => node.bounds.y >= bandBottom && !NOT_LANE_MEMBERS.has(node.type),
	)
	if (orphans.length === 0) return bandBottom
	return contentBbox(orphans).maxY + PADDING
}

function nodeToShape(node: LayoutNode, dx: number, dy: number): BpmnDiShape {
	const shape: BpmnDiShape = {
		id: `${node.id}_di`,
		bpmnElement: node.id,
		bounds: {
			x: Math.round(node.bounds.x + dx),
			y: Math.round(node.bounds.y + dy),
			width: Math.round(node.bounds.width),
			height: Math.round(node.bounds.height),
		},
		unknownAttributes: {},
	}
	if (node.isExpanded !== undefined) shape.isExpanded = node.isExpanded
	// The bpmn-js Viewer draws the "X" only when the shape says so; the Modeler
	// assumes it. `keepDiAttributes` lets an explicit value in the source win.
	if (node.type === "exclusiveGateway") shape.isMarkerVisible = true
	if (node.labelBounds) {
		shape.label = {
			bounds: {
				x: Math.round(node.labelBounds.x + dx),
				y: Math.round(node.labelBounds.y + dy),
				width: Math.round(node.labelBounds.width),
				height: Math.round(node.labelBounds.height),
			},
		}
	}
	return shape
}

function edgeToShape(edge: LayoutEdge, dx: number, dy: number): BpmnDiEdge {
	const diEdge: BpmnDiEdge = {
		id: `${edge.id}_di`,
		bpmnElement: edge.id,
		waypoints: edge.waypoints.map((wp) => ({
			x: Math.round(wp.x + dx),
			y: Math.round(wp.y + dy),
		})),
		unknownAttributes: {},
	}
	if (edge.labelBounds) {
		diEdge.label = {
			bounds: {
				x: Math.round(edge.labelBounds.x + dx),
				y: Math.round(edge.labelBounds.y + dy),
				width: Math.round(edge.labelBounds.width),
				height: Math.round(edge.labelBounds.height),
			},
		}
	}
	return diEdge
}

function buildLaneShapes(
	lanes: BpmnLane[],
	nodes: LayoutNode[],
	dx: number,
	dy: number,
	poolY: number,
	poolHeaderWidth: number,
	laneContentWidth: number,
	poolHeight: number,
): BpmnDiShape[] {
	const elemToLane = new Map<string, string>()
	for (const lane of lanes) {
		for (const ref of lane.flowNodeRefs) {
			elemToLane.set(ref, lane.id)
		}
	}

	// Compute per-lane mean Y (after shift) to sort lanes top-to-bottom
	const laneAccum = new Map<string, { sum: number; count: number }>()
	for (const lane of lanes) laneAccum.set(lane.id, { sum: 0, count: 0 })
	for (const node of nodes) {
		const laneId = elemToLane.get(node.id)
		if (!laneId) continue
		const acc = laneAccum.get(laneId)
		if (acc) {
			acc.sum += node.bounds.y + dy
			acc.count++
		}
	}

	const sortedLanes = [...lanes].sort((a, b) => {
		const accA = laneAccum.get(a.id)
		const accB = laneAccum.get(b.id)
		const mA = accA && accA.count > 0 ? accA.sum / accA.count : Number.POSITIVE_INFINITY
		const mB = accB && accB.count > 0 ? accB.sum / accB.count : Number.POSITIVE_INFINITY
		return mA - mB
	})

	// Compute proportional weight per lane: node count × row height, minimum 1 row
	const MIN_LANE_H = 80

	const weights = sortedLanes.map((lane) => {
		const count = nodes.filter((n) => elemToLane.get(n.id) === lane.id).length
		return Math.max(count, 1)
	})
	const totalWeight = weights.reduce((a, b) => a + b, 0)

	// Scale proportionally to poolHeight so all lanes fill the pool exactly
	const scaledHeights = weights.map((w) => Math.round((w / totalWeight) * poolHeight))
	// Fix last lane for rounding drift
	if (scaledHeights.length > 0) {
		scaledHeights[scaledHeights.length - 1] =
			poolHeight - scaledHeights.slice(0, -1).reduce((a, b) => a + b, 0)
	}

	let cumulativeY = 0
	return sortedLanes.map((lane, i) => {
		const laneH = scaledHeights[i] ?? MIN_LANE_H
		const shape: BpmnDiShape = {
			id: `${lane.id}_di`,
			bpmnElement: lane.id,
			isHorizontal: true,
			bounds: {
				x: Math.round(poolHeaderWidth),
				y: Math.round(poolY + cumulativeY),
				width: Math.round(laneContentWidth),
				height: Math.round(laneH),
			},
			unknownAttributes: {},
		}
		cumulativeY += laneH
		return shape
	})
}

/** Data associations drawn as association edges; only those with an id can have a DI edge. */
function dataAssociations(el: BpmnFlowElement, out: BpmnProcess["associations"]): void {
	for (const a of el.dataInputAssociations ?? []) {
		const source = a.sourceRefs[0]
		if (a.id !== undefined && source !== undefined)
			out.push({ id: a.id, sourceRef: source, targetRef: el.id, unknownAttributes: {} })
	}
	for (const a of el.dataOutputAssociations ?? []) {
		if (a.id !== undefined && a.targetRef !== undefined)
			out.push({ id: a.id, sourceRef: el.id, targetRef: a.targetRef, unknownAttributes: {} })
	}
}

/**
 * A view of `process` whose annotations and associations include those declared
 * inside (nested) sub-processes. The builder stores them on the sub-process
 * element, so packing only the process-level lists left them without a shape
 * or edge. Layout nodes are already flat in diagram space, so one pass suffices.
 */
function withNestedAnnotations(process: BpmnProcess): BpmnProcess {
	const textAnnotations = [...process.textAnnotations]
	const associations = [...process.associations]
	const walk = (elements: BpmnFlowElement[]): void => {
		for (const el of elements) {
			const scope = el as unknown as {
				flowElements?: BpmnFlowElement[]
				textAnnotations?: BpmnProcess["textAnnotations"]
				associations?: BpmnProcess["associations"]
			}
			dataAssociations(el, associations)
			if (scope.textAnnotations) textAnnotations.push(...scope.textAnnotations)
			if (scope.associations) associations.push(...scope.associations)
			if (scope.flowElements) walk(scope.flowElements)
		}
	}
	walk(process.flowElements)
	if (
		textAnnotations.length === process.textAnnotations.length &&
		associations.length === process.associations.length
	) {
		return process
	}
	return { ...process, textAnnotations, associations }
}

/**
 * The lane shapes of a laid-out process, outermost lanes first: the engine's
 * bands when it placed the nodes by lane, each nesting level one header
 * further in with right edges aligned; else top-level bands tiled in
 * proportion to the nodes each lane holds. The outermost lanes start at
 * `frame.left` and span `frame.width`; `frame.top` and `frame.height` are the
 * extent the proportional bands tile. `dx` and `dy` shift layout space onto
 * the plane.
 */
function laneShapesOf(
	lanes: BpmnLane[],
	levels: LaneLevel[],
	laneBands: Array<{ id: string; bounds: Bounds }> | undefined,
	nodes: LayoutNode[],
	dx: number,
	dy: number,
	frame: { left: number; top: number; width: number; height: number },
): BpmnDiShape[] {
	if (!laneBands) {
		return buildLaneShapes(lanes, nodes, dx, dy, frame.top, frame.left, frame.width, frame.height)
	}
	const depthOf = new Map(levels.map((level) => [level.lane.id, level.depth]))
	return laneBands.map((lane) => {
		const inset = (depthOf.get(lane.id) ?? 0) * LANE_HEADER
		return {
			id: `${lane.id}_di`,
			bpmnElement: lane.id,
			isHorizontal: true,
			bounds: {
				x: Math.round(frame.left + inset),
				y: Math.round(lane.bounds.y + dy),
				width: Math.round(frame.width - inset),
				height: Math.round(lane.bounds.height),
			},
			unknownAttributes: {},
		}
	})
}

/** Also used by `expand`, which lays out one process without the pool handling above. */
export function addAnnotationShapes(
	process: BpmnProcess,
	layoutNodes: LayoutNode[],
	annLocalBounds: Map<string, Bounds>,
	allShapes: BpmnDiShape[],
	allEdges: BpmnDiEdge[],
	dx: number,
	dy: number,
): void {
	if (process.textAnnotations.length === 0 && process.associations.length === 0) return

	const nodeById = new Map(layoutNodes.map((n) => [n.id, n]))

	for (const ta of process.textAnnotations) {
		const b = annLocalBounds.get(ta.id)
		if (!b) continue
		allShapes.push({
			id: `${ta.id}_di`,
			bpmnElement: ta.id,
			bounds: {
				x: Math.round(b.x + dx),
				y: Math.round(b.y + dy),
				width: b.width,
				height: b.height,
			},
			unknownAttributes: {},
		})
	}

	for (const assoc of process.associations) {
		// Two annotations: both boxes are packed, so dock edge to edge between them.
		const sourceAnn = annLocalBounds.get(assoc.sourceRef)
		const targetAnn = annLocalBounds.get(assoc.targetRef)
		if (sourceAnn && targetAnn) {
			const { pElem, pAnn } = associationWaypoints(sourceAnn, targetAnn)
			allEdges.push({
				id: `${assoc.id}_di`,
				bpmnElement: assoc.id,
				waypoints: [
					{ x: Math.round(pElem.x + dx), y: Math.round(pElem.y + dy) },
					{ x: Math.round(pAnn.x + dx), y: Math.round(pAnn.y + dy) },
				],
				unknownAttributes: {},
			})
			continue
		}

		const annId = annLocalBounds.has(assoc.sourceRef)
			? assoc.sourceRef
			: annLocalBounds.has(assoc.targetRef)
				? assoc.targetRef
				: undefined

		// An association does not have to involve a text annotation — a data
		// object may be associated with an activity. Both ends are placed, so
		// the same docking works.
		if (!annId) {
			const source = nodeById.get(assoc.sourceRef)
			const target = nodeById.get(assoc.targetRef)
			if (!source || !target) continue
			const { pElem, pAnn } = associationWaypoints(source.bounds, target.bounds)
			allEdges.push({
				id: `${assoc.id}_di`,
				bpmnElement: assoc.id,
				waypoints: [
					{ x: Math.round(pElem.x + dx), y: Math.round(pElem.y + dy) },
					{ x: Math.round(pAnn.x + dx), y: Math.round(pAnn.y + dy) },
				],
				unknownAttributes: {},
			})
			continue
		}

		const elId = annId === assoc.sourceRef ? assoc.targetRef : assoc.sourceRef
		const annB = annLocalBounds.get(annId)
		const elNode = nodeById.get(elId)

		if (!annB || !elNode) continue

		const { pElem, pAnn } = associationWaypoints(elNode.bounds, annB)
		// Shift into diagram space and honour the original sourceRef→targetRef order.
		const shifted = {
			pElem: { x: Math.round(pElem.x + dx), y: Math.round(pElem.y + dy) },
			pAnn: { x: Math.round(pAnn.x + dx), y: Math.round(pAnn.y + dy) },
		}
		const wp1 = assoc.sourceRef === annId ? shifted.pAnn : shifted.pElem
		const wp2 = assoc.sourceRef === annId ? shifted.pElem : shifted.pAnn
		const waypoints: Array<{ x: number; y: number }> = [wp1, wp2]

		allEdges.push({
			id: `${assoc.id}_di`,
			bpmnElement: assoc.id,
			waypoints,
			unknownAttributes: {},
		})
	}
}

const EMPTY_POOL_HEIGHT = 60
/** Sideways step when nudging a message flow out of a shape. */
const MESSAGE_FLOW_STEP = 10
/** Stub a message flow leaves its element by before it may jog sideways. */
const MESSAGE_FLOW_STEM = 20
/** Stagger between the stems of consecutive flows. */
const MESSAGE_FLOW_STEM_STEP = 8
/** Step and reach of that sideways jog. */
const MESSAGE_FLOW_JOG = 20
const MESSAGE_FLOW_MAX_JOG = 2400
const EMPTY_POOL_WIDTH = 300

/** One lane of a lane set, with where it sits in the nesting. */
interface LaneLevel {
	lane: BpmnLane
	/** 0 for a lane directly in the pool, one more per `childLaneSet` level. */
	depth: number
	/** The lane whose `childLaneSet` holds this one; absent at the top level. */
	parentId?: string
	/** True when the lane has no child lanes, so nodes sit in it directly. */
	leaf: boolean
}

/**
 * Every lane of a lane set, each parent before its children (pre-order).
 * Empty for an absent lane set.
 *
 * @throws Error when one lane object occurs twice, as a lane set that contains
 *   itself does; walking it would never end.
 */
function laneLevels(laneSet: BpmnLaneSet | undefined): LaneLevel[] {
	const levels: LaneLevel[] = []
	const seen = new Set<BpmnLane>()
	const walk = (set: BpmnLaneSet, depth: number, parentId?: string): void => {
		for (const lane of set.lanes) {
			if (seen.has(lane)) throw new Error(`Lane ${lane.id} occurs twice in its lane set`)
			seen.add(lane)
			const leaf = (lane.childLaneSet?.lanes.length ?? 0) === 0
			levels.push(parentId === undefined ? { lane, depth, leaf } : { lane, depth, parentId, leaf })
			if (lane.childLaneSet) walk(lane.childLaneSet, depth + 1, lane.id)
		}
	}
	if (laneSet) walk(laneSet, 0)
	return levels
}

/**
 * Width the lane headers take at the left of a pool: one header per nesting
 * level, since each level is inset by one header; 0 without lanes.
 */
function laneHeadersWidth(levels: LaneLevel[]): number {
	if (levels.length === 0) return 0
	return (Math.max(...levels.map((level) => level.depth)) + 1) * LANE_HEADER
}

/**
 * Pool and lane shapes for a laned process with no flow nodes. Each leaf lane
 * gets a band of {@link MIN_LANE_HEIGHT} and each parent spans its children, so
 * every lane keeps DI to draw and to drop into. Lanes come outermost first.
 *
 * @returns the shapes, pool first, and the pool height.
 */
function emptyLanedPool(
	participantId: string,
	levels: LaneLevel[],
	poolY: number,
): { shapes: BpmnDiShape[]; height: number } {
	const span = new Map<string, { top: number; bottom: number }>()
	let top = 0
	for (const level of levels) {
		if (!level.leaf) continue
		span.set(level.lane.id, { top, bottom: top + MIN_LANE_HEIGHT })
		top += MIN_LANE_HEIGHT
	}
	// Reversed pre-order reaches every child before its parent.
	for (const level of [...levels].reverse()) {
		const own = span.get(level.lane.id)
		if (level.parentId === undefined || !own) continue
		const parent = span.get(level.parentId)
		span.set(
			level.parentId,
			parent
				? { top: Math.min(parent.top, own.top), bottom: Math.max(parent.bottom, own.bottom) }
				: own,
		)
	}

	const shapes: BpmnDiShape[] = [
		{
			id: `${participantId}_di`,
			bpmnElement: participantId,
			isHorizontal: true,
			bounds: { x: 0, y: poolY, width: EMPTY_POOL_WIDTH, height: top },
			unknownAttributes: {},
		},
	]
	const ordered = [...levels].sort(
		(a, b) =>
			a.depth - b.depth || (span.get(a.lane.id)?.top ?? 0) - (span.get(b.lane.id)?.top ?? 0),
	)
	for (const { lane, depth } of ordered) {
		const band = span.get(lane.id)
		if (!band) continue
		const inset = POOL_HEADER + depth * LANE_HEADER
		shapes.push({
			id: `${lane.id}_di`,
			bpmnElement: lane.id,
			isHorizontal: true,
			bounds: {
				x: inset,
				y: poolY + band.top,
				width: EMPTY_POOL_WIDTH - inset,
				height: band.bottom - band.top,
			},
			unknownAttributes: {},
		})
	}
	return { shapes, height: top }
}

/**
 * Sub-processes the source diagram draws collapsed. A collapsed sub-process
 * keeps its activity shape on the parent plane and carries its contents on a
 * plane of its own, so the layout must not inline them.
 *
 * Either marker counts: an explicit `isExpanded="false"` on the shape, or the
 * presence of a separate plane for that sub-process.
 */
function collapsedSubProcesses(defs: BpmnDefinitions): Set<string> {
	const containers = new Set<string>()
	const walk = (elements: BpmnFlowElement[]): void => {
		for (const el of elements) {
			const sub = el as unknown as { flowElements?: BpmnFlowElement[] }
			if (sub.flowElements) {
				containers.add(el.id)
				walk(sub.flowElements)
			}
		}
	}
	for (const process of defs.processes) walk(process.flowElements)

	const collapsed = new Set<string>()
	for (const diagram of defs.diagrams) {
		if (containers.has(diagram.plane.bpmnElement)) collapsed.add(diagram.plane.bpmnElement)
		for (const shape of diagram.plane.shapes) {
			if (shape.isExpanded === false && containers.has(shape.bpmnElement)) {
				collapsed.add(shape.bpmnElement)
			}
		}
	}
	return collapsed
}

/** One `BPMNDiagram` per collapsed sub-process, its contents laid out at the origin. */
function childPlaneDiagrams(
	planes: Array<{ elementId: string; result: LayoutResult }>,
	defs: BpmnDefinitions,
	collapsed: ReadonlySet<string>,
): BpmnDiagram[] {
	const existing = new Map(defs.diagrams.map((d) => [d.plane.bpmnElement, d]))
	const diagrams: BpmnDiagram[] = []
	const emitted = new Set(planes.map((plane) => plane.elementId))

	// A collapsed sub-process that holds nothing still owns its plane; dropping it
	// would lose the drill-down target the source diagram declared.
	for (const [elementId, diagram] of existing) {
		if (!collapsed.has(elementId) || emitted.has(elementId)) continue
		diagrams.push({
			id: diagram.id,
			plane: { id: diagram.plane.id, bpmnElement: elementId, shapes: [], edges: [] },
		})
	}

	for (const plane of planes) {
		const { minX, minY } = contentBbox(plane.result.nodes)
		if (!Number.isFinite(minX)) continue
		const dx = PADDING - minX
		const dy = PADDING - minY
		const previous = existing.get(plane.elementId)
		diagrams.push({
			id: previous?.id ?? `BPMNDiagram_${plane.elementId}`,
			plane: {
				id: previous?.plane.id ?? `BPMNPlane_${plane.elementId}`,
				bpmnElement: plane.elementId,
				shapes: plane.result.nodes.map((node) => nodeToShape(node, dx, dy)),
				edges: plane.result.edges.map((edge) => edgeToShape(edge, dx, dy)),
			},
		})
	}

	return diagrams
}

/** Vertical bands between pools — clear ground for a message flow to cross in. */
function poolBands(
	shapes: BpmnDiShape[],
	participantIds: ReadonlySet<string>,
): Array<{ top: number; bottom: number }> {
	const pools = shapes
		.filter((s) => participantIds.has(s.bpmnElement))
		.map((s) => ({ top: s.bounds.y, bottom: s.bounds.y + s.bounds.height }))
		.sort((a, b) => a.top - b.top)

	const gaps: Array<{ top: number; bottom: number }> = []
	for (let i = 0; i + 1 < pools.length; i++) {
		const above = pools[i]
		const below = pools[i + 1]
		if (above && below && below.top > above.bottom) {
			gaps.push({ top: above.bottom, bottom: below.top })
		}
	}
	return gaps
}

/** True when a vertical run at `x` between two heights would cross a shape. */
function columnBlocked(
	x: number,
	fromY: number,
	toY: number,
	obstacles: BpmnBounds[],
	own: BpmnBounds[],
): boolean {
	const top = Math.min(fromY, toY)
	const bottom = Math.max(fromY, toY)
	return obstacles.some(
		(o) => !own.includes(o) && o.x < x && x < o.x + o.width && o.y < bottom && top < o.y + o.height,
	)
}

/**
 * Shift a vertical run sideways until it misses every shape it would otherwise
 * pass through. The run has to stay on the element it docks onto, so the search
 * is bounded by that element's own width.
 */
function clearColumn(
	x: number,
	fromY: number,
	toY: number,
	obstacles: BpmnBounds[],
	own: BpmnBounds[],
	dock: BpmnBounds,
): number {
	if (!columnBlocked(x, fromY, toY, obstacles, own)) return x
	const limit = Math.floor(dock.width / 2)
	for (let step = MESSAGE_FLOW_STEP; step <= limit; step += MESSAGE_FLOW_STEP) {
		if (!columnBlocked(x + step, fromY, toY, obstacles, own)) return x + step
		if (!columnBlocked(x - step, fromY, toY, obstacles, own)) return x - step
	}
	return x
}

/**
 * One vertical leg of a message flow, from its dock to the crossing band.
 *
 * A straight drop is used when the column is clear. Otherwise the leg leaves
 * the element by a short stem and jogs sideways to a column that is clear for
 * the rest of the descent — the same move a modeller makes by hand, and the
 * only way past a shape sitting directly below the dock.
 */
function messageFlowLeg(
	dockX: number,
	fromY: number,
	toY: number,
	obstacles: BpmnBounds[],
	own: BpmnBounds[],
	dock: BpmnBounds,
	/** Staggers the stem so two flows jogging side by side do not share a line. */
	stemOffset = 0,
	/** Labels: missed when a nudge on the dock can, otherwise crossed. */
	labels: BpmnBounds[] = [],
): { points: BpmnWaypoint[]; blocked: boolean } {
	const withLabels = [...obstacles, ...labels]
	const tidy = clearColumn(dockX, fromY, toY, withLabels, own, dock)
	if (!columnBlocked(tidy, fromY, toY, withLabels, own)) {
		return {
			points: [
				{ x: tidy, y: fromY },
				{ x: tidy, y: toY },
			],
			blocked: false,
		}
	}
	const straight = clearColumn(dockX, fromY, toY, obstacles, own, dock)
	if (!columnBlocked(straight, fromY, toY, obstacles, own)) {
		return {
			points: [
				{ x: straight, y: fromY },
				{ x: straight, y: toY },
			],
			blocked: false,
		}
	}

	const down = toY > fromY
	const stem = MESSAGE_FLOW_STEM + stemOffset
	const stemY = down ? fromY + stem : fromY - stem
	const rowBlocked = (x: number): boolean =>
		obstacles.some(
			(o) =>
				!own.includes(o) &&
				o.x < Math.max(dockX, x) &&
				Math.min(dockX, x) < o.x + o.width &&
				o.y < stemY &&
				stemY < o.y + o.height,
		)

	for (let offset = MESSAGE_FLOW_JOG; offset <= MESSAGE_FLOW_MAX_JOG; offset += MESSAGE_FLOW_JOG) {
		for (const candidate of [dockX + offset, dockX - offset]) {
			if (rowBlocked(candidate)) continue
			if (columnBlocked(candidate, stemY, toY, obstacles, own)) continue
			return {
				points: [
					{ x: dockX, y: fromY },
					{ x: dockX, y: stemY },
					{ x: candidate, y: stemY },
					{ x: candidate, y: toY },
				],
				blocked: false,
			}
		}
	}

	return {
		points: [
			{ x: straight, y: fromY },
			{ x: straight, y: toY },
		],
		blocked: true,
	}
}

/**
 * Pick where a message flow crosses between pools and how each of its two legs
 * gets there.
 *
 * Bands are tried nearest-first: the gaps between pools are clear ground, so a
 * route that reaches one has nothing left to cross. Each leg is checked over
 * its own stretch rather than the whole run, which is what lets a flow slip
 * past shapes on the far side of the band.
 */
function messageFlowRoute(
	src: BpmnBounds,
	tgt: BpmnBounds,
	srcIsPool: boolean,
	tgtIsPool: boolean,
	gaps: Array<{ top: number; bottom: number }>,
	obstacles: BpmnBounds[],
	stemOffset: number,
	/** Containers holding an endpoint: a route out of one has to cross it. */
	containers: BpmnBounds[] = [],
	/** Shape labels, which a leg sidesteps only when that costs no bend. */
	labels: BpmnBounds[] = [],
	/** Snap docks a rounding apart onto one x. */
	snap = true,
): { source: BpmnWaypoint[]; target: BpmnWaypoint[]; gap: number } {
	const srcBelow = src.y + src.height / 2 > tgt.y + tgt.height / 2
	const sy = srcBelow ? src.y : src.y + src.height
	const ty = srcBelow ? tgt.y + tgt.height : tgt.y
	// The endpoints themselves, plus any expanded sub-process they sit inside:
	// leaving an element means crossing the border of whatever contains it, so
	// treating that border as an obstacle would leave the route no way out.
	const own = [src, tgt, ...containers]
	const midpoint = (sy + ty) / 2
	const low = Math.min(sy, ty)
	const high = Math.max(sy, ty)

	const srcX = Math.round(src.x + src.width / 2)
	const centreX = Math.round(tgt.x + tgt.width / 2)
	// Centres a rounding apart are meant to line up: a 1 px jog would cost the
	// message two bends for nothing.
	const tgtX = snap && Math.abs(centreX - srcX) <= 1 ? srcX : centreX
	const build = (
		bandY: number,
	): { source: BpmnWaypoint[]; target: BpmnWaypoint[]; blocked: boolean } => {
		const source = messageFlowLeg(srcX, sy, bandY, obstacles, own, src, stemOffset, labels)
		const target = messageFlowLeg(tgtX, ty, bandY, obstacles, own, tgt, stemOffset, labels)
		// A pool has no position of its own to respect: dock it under whatever it
		// is talking to, so the flow drops straight instead of fanning into the
		// pool's centre along with every other flow.
		if (tgtIsPool && !srcIsPool) {
			const x = source.points[source.points.length - 1]?.x ?? 0
			return {
				source: source.points,
				target: [
					{ x, y: ty },
					{ x, y: bandY },
				],
				blocked: source.blocked,
			}
		}
		if (srcIsPool && !tgtIsPool) {
			const x = target.points[target.points.length - 1]?.x ?? 0
			return {
				source: [
					{ x, y: sy },
					{ x, y: bandY },
				],
				target: target.points,
				blocked: target.blocked,
			}
		}
		return {
			source: source.points,
			target: target.points,
			blocked: source.blocked || target.blocked,
		}
	}

	const candidates = gaps
		.map((gap, index) => ({ index, y: (gap.top + gap.bottom) / 2 }))
		.filter((candidate) => candidate.y >= low && candidate.y <= high)
		.sort((a, b) => Math.abs(a.y - midpoint) - Math.abs(b.y - midpoint))

	for (const candidate of candidates) {
		const route = build(candidate.y)
		if (!route.blocked) return { source: route.source, target: route.target, gap: candidate.index }
	}

	const fallback = candidates[0]
	const route = build(fallback?.y ?? midpoint)
	return { source: route.source, target: route.target, gap: fallback?.index ?? -1 }
}

/** Two routes of one message flow that draw the same line. */
function sameRoute(
	a: { source: BpmnWaypoint[]; target: BpmnWaypoint[]; gap: number },
	b: { source: BpmnWaypoint[]; target: BpmnWaypoint[]; gap: number },
): boolean {
	const same = (p: BpmnWaypoint[], q: BpmnWaypoint[]): boolean =>
		p.length === q.length && p.every((w, i) => w.x === q[i]?.x && w.y === q[i]?.y)
	return a.gap === b.gap && same(a.source, b.source) && same(a.target, b.target)
}

/**
 * Give every pool the width of the widest, lanes included. Pools already share
 * x 0, so only the right edges move; a lane grows with its pool when it ends
 * where the pool did.
 */
function uniformPoolFrame(
	shapes: BpmnDiShape[],
	collab: BpmnCollaboration,
	defs: BpmnDefinitions,
): void {
	const participantIds = new Set(collab.participants.map((p) => p.id))
	const laneIds = new Set(
		defs.processes.flatMap((p) => laneLevels(p.laneSet).map((level) => level.lane.id)),
	)
	const pools = shapes.filter((s) => participantIds.has(s.bpmnElement))
	const right = (b: BpmnBounds): number => b.x + b.width
	const widest = pools.reduce((max, s) => Math.max(max, right(s.bounds)), EMPTY_POOL_WIDTH)
	for (const pool of pools) {
		const edge = right(pool.bounds)
		if (edge >= widest) continue
		const top = pool.bounds.y
		const bottom = top + pool.bounds.height
		for (const lane of shapes) {
			const b = lane.bounds
			if (!laneIds.has(lane.bpmnElement) || right(b) !== edge) continue
			if (b.y >= top && b.y + b.height <= bottom) b.width = widest - b.x
		}
		pool.bounds.width = widest - pool.bounds.x
	}
}

/**
 * Apply auto-layout to all processes in a BpmnDefinitions, replacing the
 * diagram interchange (BPMNDi) with freshly computed positions.
 *
 * - Handles plain processes (no collaboration) and collaborations with pools.
 * - When pools have lanes, lane shapes are tiled vertically around the process content.
 */
/** Every element id in a collaboration mapped to the index of the pool holding it. */
function poolOwners(defs: BpmnDefinitions, collab: BpmnCollaboration): Map<string, number> {
	const owners = new Map<string, number>()
	const processById = new Map(defs.processes.map((p) => [p.id, p]))

	for (let index = 0; index < collab.participants.length; index++) {
		const participant = collab.participants[index]
		if (!participant) continue
		owners.set(participant.id, index)
		const process = participant.processRef ? processById.get(participant.processRef) : undefined
		if (!process) continue

		const walk = (elements: BpmnFlowElement[]): void => {
			for (const element of elements) {
				owners.set(element.id, index)
				const container = element as unknown as { flowElements?: BpmnFlowElement[] }
				if (container.flowElements?.length) walk(container.flowElements)
			}
		}
		walk(process.flowElements)
	}

	return owners
}

/**
 * The pools as the crossing sketch sees them: each at its aligned offset with
 * its sequence flows and shapes, plus every message between them.
 */
function stackSketch(
	collab: BpmnCollaboration,
	participantPools: Array<{ participantId: string; process?: BpmnProcess }>,
	layoutOf: Map<BpmnProcess, LayoutResult>,
): { pools: StackPool[]; messages: StackMessage[] } {
	const layouts = participantPools.map(
		(p): LayoutResult => (p.process && layoutOf.get(p.process)) || { nodes: [], edges: [] },
	)
	const offsets = alignPools(
		participantPools.length,
		layouts.map(contentWidth),
		messageLinks(collab, participantPools, layouts),
	)
	const ends = new Map<string, { pool: number; x: number; top: number; bottom: number }>()
	const pools: StackPool[] = layouts.map((layout, index) => {
		if (layout.nodes.length === 0) return { height: EMPTY_POOL_HEIGHT, paths: [] }
		const { minX, minY, maxY } = contentBbox(layout.nodes)
		const lanes = laneLevels(participantPools[index]?.process?.laneSet)
		const dx = (offsets[index] ?? 0) + POOL_HEADER + laneHeadersWidth(lanes) + PADDING - minX
		const dy = PADDING - minY
		for (const node of layout.nodes) {
			ends.set(node.id, {
				pool: index,
				x: Math.round(node.bounds.x + node.bounds.width / 2 + dx),
				top: node.bounds.y + dy,
				bottom: node.bounds.y + node.bounds.height + dy,
			})
		}
		return {
			height: poolHeightOf(maxY - minY),
			paths: layout.edges.map((e) => e.waypoints.map((w) => ({ x: w.x + dx, y: w.y + dy }))),
			boxes: layout.nodes.map((n) => ({ ...n.bounds, x: n.bounds.x + dx, y: n.bounds.y + dy })),
		}
	})
	const poolIndex = new Map(participantPools.map((p, i) => [p.participantId, i]))
	const messages: StackMessage[] = []
	for (const flow of collab.messageFlows) {
		const a = ends.get(flow.sourceRef)
		const b = ends.get(flow.targetRef)
		const from = a?.pool ?? poolIndex.get(flow.sourceRef)
		const to = b?.pool ?? poolIndex.get(flow.targetRef)
		if (from === undefined || to === undefined) continue
		const message: StackMessage = { from, to }
		if (a) message.fromEnd = a
		if (b) message.toEnd = b
		messages.push(message)
	}
	return { pools, messages }
}

/**
 * Message flows as pool-to-pool relationships, one per flow, each carrying how
 * deep inside its pool the message leaves and arrives.
 */
function poolLinks(
	collab: BpmnCollaboration,
	owners: Map<string, number>,
	depth: (elementId: string) => number | undefined,
): PoolLink[] {
	const links: PoolLink[] = []
	for (const flow of collab.messageFlows) {
		const from = owners.get(flow.sourceRef)
		const to = owners.get(flow.targetRef)
		if (from === undefined || to === undefined || from === to) continue
		const link: PoolLink = { from, to, weight: 1 }
		const fromDepth = depth(flow.sourceRef)
		const toDepth = depth(flow.targetRef)
		if (fromDepth !== undefined) link.fromDepth = fromDepth
		if (toDepth !== undefined) link.toDepth = toDepth
		links.push(link)
	}
	return links
}

/** Each laid-out element's vertical position within its own process, 0 top to 1 bottom. */
function depthIndex(layouts: Iterable<LayoutResult>): Map<string, number> {
	const depths = new Map<string, number>()
	for (const layout of layouts) {
		if (layout.nodes.length === 0) continue
		const { minY, maxY } = contentBbox(layout.nodes)
		const height = maxY - minY
		if (height <= 0) continue
		for (const node of layout.nodes) {
			depths.set(node.id, (node.bounds.y + node.bounds.height / 2 - minY) / height)
		}
	}
	return depths
}

/** Width of a laid-out process, ignoring where in space it happens to sit. */
function contentWidth(layout: LayoutResult): number {
	if (layout.nodes.length === 0) return 0
	const { minX, maxX } = contentBbox(layout.nodes)
	return maxX - minX
}

/**
 * Message flows expressed as the x centres of the two elements they connect,
 * measured inside each pool's own content so alignment can shift pools freely.
 */
function messageLinks(
	collab: BpmnCollaboration | undefined,
	pools: Array<{ participantId?: string; process?: BpmnProcess }>,
	layouts: LayoutResult[],
): MessageLink[] {
	if (!collab) return []

	const centres = new Map<string, { pool: number; x: number }>()
	for (let index = 0; index < pools.length; index++) {
		const layout = layouts[index]
		const pool = pools[index]
		if (!layout || !pool?.participantId || layout.nodes.length === 0) continue
		const { minX } = contentBbox(layout.nodes)
		const elemX = POOL_HEADER + laneHeadersWidth(laneLevels(pool.process?.laneSet)) + PADDING
		for (const node of layout.nodes) {
			centres.set(node.id, {
				pool: index,
				x: elemX + node.bounds.x + node.bounds.width / 2 - minX,
			})
		}
	}

	const links: MessageLink[] = []
	for (const flow of collab.messageFlows) {
		const from = centres.get(flow.sourceRef)
		const to = centres.get(flow.targetRef)
		if (!from || !to || from.pool === to.pool) continue
		links.push({ fromPool: from.pool, toPool: to.pool, fromX: from.x, toX: to.x })
	}
	return links
}

/**
 * Every element inside a collaboration mapped to the element that would contain
 * it on a plane: its sub-process, or the participant of its process. Following
 * the chain finds the nearest ancestor a collapsed scope leaves visible.
 */
function ancestorIndex(defs: BpmnDefinitions, collab: BpmnCollaboration): Map<string, string> {
	const parents = new Map<string, string>()
	const processById = new Map(defs.processes.map((p) => [p.id, p]))

	for (const participant of collab.participants) {
		const process = participant.processRef ? processById.get(participant.processRef) : undefined
		if (!process) continue

		const walk = (elements: BpmnFlowElement[], parent: string): void => {
			for (const element of elements) {
				parents.set(element.id, parent)
				const container = element as unknown as { flowElements?: BpmnFlowElement[] }
				if (container.flowElements?.length) walk(container.flowElements, element.id)
			}
		}
		walk(process.flowElements, participant.id)
	}

	return parents
}

/**
 * Replace every diagram-interchange position in `defs` with a computed layout.
 *
 * @param engine - Which process layout algorithm to run. Defaults to `semantic`;
 *   `grid` runs the older cell-grid walk and is used to compare the two.
 * @param hints - Tool-grid shapes and annotation sides the builder collected;
 *   they steer placement only and are not written to `defs`.
 */
/**
 * Translation (0-9 px per axis) that puts the most shape origins on the 10 px
 * grid. A pure shift keeps every distance, so no other aesthetic moves; ties
 * keep the unshifted position.
 */
function gridPhase(nodes: LayoutNode[], dx: number, dy: number): { x: number; y: number } {
	const on = (v: number, t: number): boolean => (Math.round(v) + t) % 10 === 0
	let best = { x: 0, y: 0 }
	let bestN = -1
	for (let ty = 0; ty < 10; ty++) {
		for (let tx = 0; tx < 10; tx++) {
			let n = 0
			for (const node of nodes) {
				if (on(node.bounds.x + dx, tx) && on(node.bounds.y + dy, ty)) n++
			}
			if (n > bestN) {
				bestN = n
				best = { x: tx, y: ty }
			}
		}
	}
	return best
}

/**
 * A lane-less pool's height: content plus padding, to the nearest 10 px, so
 * the pools below start on the grid whatever order they are stacked in.
 */
function poolHeightOf(contentHeight: number): number {
	return Math.round((contentHeight + 2 * PADDING) / 10) * 10
}

/**
 * Vertical shift (-4..5 px, inside the pool's padding) that puts the most
 * shapes on the 10 px grid; the smallest shift wins a tie.
 */
function poolGridPhase(nodes: LayoutNode[], dx: number, dy: number): number {
	const on = (v: number): boolean => Math.round(v) % 10 === 0
	let best = 0
	let bestN = -1
	for (const t of [0, -1, 1, -2, 2, -3, 3, -4, 4, 5]) {
		let n = 0
		for (const node of nodes) if (on(node.bounds.x + dx) && on(node.bounds.y + dy + t)) n++
		if (n > bestN) {
			bestN = n
			best = t
		}
	}
	return best
}

export function applyAutoLayout(
	defs: BpmnDefinitions,
	engine: LayoutEngine = "semantic",
	hints?: LayoutHints,
): BpmnDefinitions {
	const nearest: PoolOrdering = { useSketch: false, sketchDiffers: false }
	const laidOut = layoutDefinitions(defs, engine, hints, nearest)
	if (!nearest.sketchDiffers) return laidOut
	// The sketch only estimates; the drawn result decides. The crossing order
	// wins only when it crosses less without bending or slanting more.
	const crossing = layoutDefinitions(defs, engine, hints, {
		useSketch: true,
		sketchDiffers: true,
	})
	const a = messageScore(laidOut)
	const b = messageScore(crossing)
	const better =
		b.crossings < a.crossings &&
		b.bends <= a.bends &&
		b.slanted <= a.slanted &&
		b.labelsCrossed <= a.labelsCrossed &&
		b.onGrid >= a.onGrid
	return better ? crossing : laidOut
}

/** Which pool order a layout pass uses, and whether the two candidates differ. */
interface PoolOrdering {
	/** Stack the pools by the crossing sketch instead of message distance. */
	useSketch: boolean
	/** Set by the pass: the crossing sketch prefers another order. */
	sketchDiffers: boolean
}

/**
 * What a pool order changes in a laid-out diagram: message-flow crossings
 * (with anything), message bends and slanted messages, labels an edge runs
 * through, and shapes on the 10 px grid (pools stacked at other heights shift
 * whole processes off it).
 */
function messageScore(defs: BpmnDefinitions): {
	crossings: number
	bends: number
	slanted: number
	labelsCrossed: number
	onGrid: number
} {
	const ids = new Set(defs.collaborations.flatMap((c) => c.messageFlows.map((f) => f.id)))
	const plane = defs.diagrams[0]?.plane
	const edges = plane?.edges ?? []
	const shapes = plane?.shapes ?? []
	const messages = edges.filter((e) => ids.has(e.bpmnElement))
	const others = edges.filter((e) => !ids.has(e.bpmnElement))
	let crossings = 0
	let bends = 0
	let slanted = 0
	for (let i = 0; i < messages.length; i++) {
		const path = messages[i]?.waypoints ?? []
		for (let j = i + 1; j < messages.length; j++)
			crossings += pathCrossings(path, messages[j]?.waypoints ?? [])
		for (const other of others) crossings += pathCrossings(path, other.waypoints)
		bends += Math.max(0, path.length - 2)
		if (path.length > 2) slanted++
	}
	const labels = [...shapes, ...edges].flatMap((item) =>
		item.label?.bounds ? [{ owner: item.bpmnElement, bounds: item.label.bounds }] : [],
	)
	const labelsCrossed = labels.filter((label) =>
		edges.some((e) => e.bpmnElement !== label.owner && pathThrough(e.waypoints, label.bounds)),
	).length
	const onGrid = shapes.filter((s) => s.bounds.x % 10 === 0 && s.bounds.y % 10 === 0).length
	return { crossings, bends, slanted, labelsCrossed, onGrid }
}

/** Does an orthogonal polyline pass through the inside of `r` (1 px in from its outline)? */
function pathThrough(points: BpmnWaypoint[], r: BpmnBounds): boolean {
	for (let i = 1; i < points.length; i++) {
		const p = points[i - 1]
		const q = points[i]
		if (!p || !q) continue
		if (
			Math.max(p.x, q.x) > r.x + 1 &&
			Math.min(p.x, q.x) < r.x + r.width - 1 &&
			Math.max(p.y, q.y) > r.y + 1 &&
			Math.min(p.y, q.y) < r.y + r.height - 1
		)
			return true
	}
	return false
}

function layoutDefinitions(
	defs: BpmnDefinitions,
	engine: LayoutEngine,
	hints: LayoutHints | undefined,
	ordering: PoolOrdering,
): BpmnDefinitions {
	if (defs.processes.length === 0) return defs

	const collab = defs.collaborations[0]

	// Build processId → participantId map
	const processToParticipant = new Map<string, string>()
	if (collab) {
		for (const p of collab.participants) {
			if (p.processRef) processToParticipant.set(p.processRef, p.id)
		}
	}

	const allShapes: BpmnDiShape[] = []
	const allEdges: BpmnDiEdge[] = []
	const childPlanes: Array<{ elementId: string; result: LayoutResult }> = []
	const collapsed = collapsedSubProcesses(defs)
	let poolY = 0

	// Walk the pools in declaration order so a black-box participant keeps its
	// place in the stack; processes no participant references follow.
	const processById = new Map(defs.processes.map((p) => [p.id, p]))
	const pools: Array<{ participantId?: string; process?: BpmnProcess }> = []
	/** Layouts computed early, for ordering; reused rather than run twice. */
	const layoutOf = new Map<BpmnProcess, LayoutResult>()
	if (collab) {
		const participantPools = collab.participants.map((participant) => ({
			participantId: participant.id,
			process: participant.processRef ? processById.get(participant.processRef) : undefined,
		}))
		// Pools that exchange messages read better next to each other, so the
		// stack follows the message flows rather than the declaration order.
		for (const pool of participantPools) {
			if (pool.process && !layoutOf.has(pool.process)) {
				layoutOf.set(
					pool.process,
					layoutProcess(pool.process, engine, collapsed, hints?.grids, true),
				)
			}
		}
		const depths = depthIndex(layoutOf.values())
		const contentOf = (pool: { process?: BpmnProcess }): LayoutNode[] =>
			(pool.process && layoutOf.get(pool.process)?.nodes) || []
		const nearest = orderPools(
			participantPools.length,
			poolLinks(collab, poolOwners(defs, collab), (id) => depths.get(id)),
			new Set(participantPools.flatMap((pool, i) => (contentOf(pool).length > 0 ? [] : [i]))),
		)
		let order = nearest
		if (participantPools.length >= 3 && collab.messageFlows.length > 0) {
			const sketch = stackSketch(collab, participantPools, layoutOf)
			const fewer = orderByCrossings(nearest, sketch.pools, sketch.messages)
			ordering.sketchDiffers = fewer.some((pool, i) => pool !== nearest[i])
			if (ordering.useSketch) order = fewer
		}
		for (const index of order) {
			const pool = participantPools[index]
			if (pool) pools.push(pool)
		}
		for (const process of defs.processes) {
			if (!processToParticipant.has(process.id)) pools.push({ process })
		}
	} else {
		for (const process of defs.processes) pools.push({ process })
	}

	// Lay every pool out first: alignment needs to see all of them before any
	// geometry is committed.
	const layouts = pools.map((pool) =>
		pool.process
			? (layoutOf.get(pool.process) ??
				layoutProcess(
					pool.process,
					engine,
					collapsed,
					hints?.grids,
					pool.participantId !== undefined,
				))
			: { nodes: [], edges: [] },
	)
	const alignment = alignPools(
		pools.length,
		layouts.map((layout) => contentWidth(layout)),
		messageLinks(collab, pools, layouts),
	)

	/** Root processes that are not the primary one, each on a plane of its own. */
	const rootPlanes: Array<{ elementId: string; shapes: BpmnDiShape[]; edges: BpmnDiEdge[] }> = []
	const primaryProcessId = defs.processes[0]?.id

	for (let poolIndex = 0; poolIndex < pools.length; poolIndex++) {
		const pool = pools[poolIndex]
		if (!pool) continue
		const { participantId, process } = pool
		const lanes = process?.laneSet?.lanes ?? []
		const hasLanes = lanes.length > 0
		const levels = laneLevels(process?.laneSet)
		const headersWidth = laneHeadersWidth(levels)

		const result: LayoutResult = layouts[poolIndex] ?? { nodes: [], edges: [] }
		const alignDx = alignment[poolIndex] ?? 0

		// A participant with no process, or one whose process has no flow nodes,
		// is a black box: it still needs a pool of its own to dock message flows
		// onto, and to stay visible at all. One whose process holds annotations
		// is not: it takes the content path below, so the pool is sized around them
		// and they get shapes instead of being dropped.
		const annotationsOnlyPool =
			participantId !== undefined && process !== undefined && process.textAnnotations.length > 0
		if (result.nodes.length === 0 && !annotationsOnlyPool) {
			// A process can be nothing but annotations; they still belong on the plane.
			if (!participantId && process && process.textAnnotations.length > 0) {
				const annOnly = packAnnotations(process, [])
				const bbox = contentBbox([], annOnly.values())
				addAnnotationShapes(
					process,
					[],
					annOnly,
					allShapes,
					allEdges,
					PADDING - bbox.minX,
					PADDING - bbox.minY,
				)
				continue
			}
			// Lanes with nothing in them still need bands, or they have no DI at all.
			if (participantId && hasLanes) {
				const empty = emptyLanedPool(participantId, levels, poolY)
				allShapes.push(...empty.shapes)
				poolY += empty.height + POOL_GAP
				continue
			}
			if (participantId) {
				const shape: BpmnDiShape = {
					id: `${participantId}_di`,
					bpmnElement: participantId,
					isHorizontal: true,
					bounds: { x: 0, y: poolY, width: EMPTY_POOL_WIDTH, height: EMPTY_POOL_HEIGHT },
					unknownAttributes: {},
				}
				allShapes.push(shape)
				poolY += EMPTY_POOL_HEIGHT + POOL_GAP
			}
			continue
		}
		childPlanes.push(...(result.planes ?? []))

		// The engine reports lane bands when it placed nodes by lane membership;
		// they replace the proportional tiling below.
		const engineLanes = result.lanes

		// Pre-compute annotation positions in layout space so they're included in the bbox
		const annProcess = process ? withNestedAnnotations(process) : undefined
		const annBounds = annProcess
			? packAnnotations(annProcess, result.nodes, result.edges, hints?.annotationSides)
			: new Map<string, Bounds>()

		const { minX, minY, maxX, maxY } = contentBbox(result.nodes, annBounds.values())
		const contentW = maxX - minX
		const contentH = maxY - minY

		// Engine lane bands already stack the content vertically, so the pool
		// aligns to the band space rather than to the content bounding box —
		// otherwise the shapes drift out of the lanes drawn around them.
		const laneBands =
			hasLanes && engineLanes ? stretchBands(engineLanes, annBounds.values()) : undefined
		// Bands arrive outermost first and nested lanes overlap their parent, so the
		// pool spans their extent rather than the first band or the sum of heights.
		const bandTop = laneBands ? Math.min(...laneBands.map((lane) => lane.bounds.y)) : 0
		const bandHeight = laneBands
			? Math.max(...laneBands.map((lane) => lane.bounds.y + lane.bounds.height)) - bandTop
			: 0

		// Below any pools already stacked; poolY is 0 without a collaboration.
		const processTop = process?.id === primaryProcessId ? poolY : 0
		let dx: number
		let dy: number
		if (participantId) {
			const elemX = POOL_HEADER + headersWidth + PADDING
			dx = elemX - minX + alignDx
			dy = laneBands ? poolY - bandTop : poolY + PADDING - minY
			// x is the message alignment's to keep, and lane bands fix y; otherwise
			// a few px of the padding put the most shapes on the 10 px grid.
			if (!laneBands) dy += poolGridPhase(result.nodes, dx, dy)
		} else {
			// A process outside any pool draws its lanes on the plane itself (bpmn-js
			// imports lane DI under a process root), header at x 0, so the content
			// clears the lane headers the way it does in a pool.
			// A layout pass must not invent a participant to hold them.
			dx = headersWidth + PADDING - minX
			dy = laneBands ? processTop - bandTop : processTop + PADDING - minY
			const phase = gridPhase(result.nodes, dx, dy)
			dx += phase.x
			dy += phase.y
		}
		/** Lanes of a process outside any pool, drawn straight on its plane. */
		const bareLanes =
			!participantId && hasLanes
				? laneShapesOf(lanes, levels, laneBands, result.nodes, dx, dy, {
						left: 0,
						top: processTop,
						width: headersWidth + contentW + 2 * PADDING,
						height: laneBands ? bandHeight : contentH + 2 * PADDING,
					})
				: []

		// Only the primary process shares the root plane; any other root process
		// owns one, instead of being stacked on top of the first at the origin.
		if (!participantId && process && process.id !== primaryProcessId) {
			const shapes: BpmnDiShape[] = []
			const edges: BpmnDiEdge[] = []
			for (const node of result.nodes) shapes.push(nodeToShape(node, dx, dy))
			for (const edge of result.edges) edges.push(edgeToShape(edge, dx, dy))
			addAnnotationShapes(annProcess ?? process, result.nodes, annBounds, shapes, edges, dx, dy)
			shapes.push(...bareLanes)
			rootPlanes.push({ elementId: process.id, shapes, edges })
			continue
		}

		for (const node of result.nodes) allShapes.push(nodeToShape(node, dx, dy))
		for (const edge of result.edges) allEdges.push(edgeToShape(edge, dx, dy))
		if (process) {
			addAnnotationShapes(
				annProcess ?? process,
				result.nodes,
				annBounds,
				allShapes,
				allEdges,
				dx,
				dy,
			)
		}
		allShapes.push(...bareLanes)

		if (participantId) {
			const innerW = headersWidth + contentW + 2 * PADDING + alignDx
			// Lanes must tile the pool exactly, so the pool takes their height, and
			// grows past them only for nodes no lane claims, which the engine
			// places below the bands.
			const innerH = laneBands
				? Math.max(bandHeight, orphanExtent(result.nodes, bandTop + bandHeight) - bandTop)
				: poolHeightOf(contentH)

			allShapes.push({
				id: `${participantId}_di`,
				bpmnElement: participantId,
				isHorizontal: true,
				bounds: { x: 0, y: poolY, width: POOL_HEADER + innerW, height: innerH },
				unknownAttributes: {},
			})

			if (hasLanes) {
				allShapes.push(
					...laneShapesOf(lanes, levels, laneBands, result.nodes, dx, dy, {
						left: POOL_HEADER,
						top: poolY,
						width: innerW,
						height: innerH,
					}),
				)
			}

			poolY += innerH + POOL_GAP
		}
	}

	// One frame for every pool: the stack reads as one diagram rather than a
	// ragged column, black boxes included.
	if (collab) uniformPoolFrame(allShapes, collab, defs)

	const repair = routeRepair(defs)
	if (collab && collab.messageFlows.length > 0) {
		const shapeByElement = new Map(allShapes.map((s) => [s.bpmnElement, s.bounds]))
		// An endpoint inside a collapsed sub-process has no shape on this plane;
		// the message docks on the nearest ancestor that does.
		const visibleAncestors = ancestorIndex(defs, collab)
		const resolve = (id: string): string => {
			let current: string | undefined = id
			while (current !== undefined && !shapeByElement.has(current)) {
				current = visibleAncestors.get(current)
			}
			return current ?? id
		}
		const participantIds = new Set(collab.participants.map((p) => p.id))
		const laneIds = new Set(
			defs.processes.flatMap((p) => laneLevels(p.laneSet).map((level) => level.lane.id)),
		)
		// Pools and lanes are containers; message flows cross them by design. It is
		// the elements inside that a route has to miss.
		const inside = allShapes.filter(
			(s) => !participantIds.has(s.bpmnElement) && !laneIds.has(s.bpmnElement),
		)
		const obstacles = inside.map((s) => s.bounds)
		// Labels are worth a sideways nudge on the dock, never a jog: a riser
		// through a name is hard to read, but two extra bends read worse.
		const labels = inside.flatMap((s) => (s.label?.bounds ? [s.label.bounds] : []))
		const poolGaps = poolBands(allShapes, participantIds)

		type Route = { source: BpmnWaypoint[]; target: BpmnWaypoint[]; gap: number }
		/**
		 * Each message flow routed twice: `tidy` lines up docks a rounding apart
		 * and nudges a riser off element labels; `plain` does neither. A nudge is
		 * local and can push a riser across another message's run, so a flow keeps
		 * its tidy route only where that adds no crossing (see below).
		 */
		const candidates: Array<{ id: string; from: string; to: string; tidy: Route; plain: Route }> =
			[]
		const containersOf = (id: string): BpmnBounds[] => {
			const out: BpmnBounds[] = []
			let parent = visibleAncestors.get(id)
			while (parent !== undefined) {
				const bounds = shapeByElement.get(parent)
				if (bounds) out.push(bounds)
				parent = visibleAncestors.get(parent)
			}
			return out
		}

		const labelByElement = new Map(
			allShapes.flatMap((s) => (s.label?.bounds ? [[s.bpmnElement, s.label.bounds] as const] : [])),
		)
		/** An endpoint's own label: the message starts or ends right beside it. */
		const labelOf = (id: string): BpmnBounds[] => {
			const label = labelByElement.get(id)
			return label ? [label] : []
		}

		let stemOffset = 0
		for (const mf of collab.messageFlows) {
			const sourceRef = resolve(mf.sourceRef)
			const targetRef = resolve(mf.targetRef)
			const src = shapeByElement.get(sourceRef)
			const tgt = shapeByElement.get(targetRef)
			if (!src || !tgt) continue
			const route = (tidy: boolean): Route =>
				messageFlowRoute(
					src,
					tgt,
					participantIds.has(sourceRef),
					participantIds.has(targetRef),
					poolGaps,
					obstacles,
					stemOffset,
					[
						...containersOf(sourceRef),
						...containersOf(targetRef),
						...(tidy ? [...labelOf(sourceRef), ...labelOf(targetRef)] : []),
					],
					tidy ? labels : [],
					tidy,
				)
			candidates.push({
				id: mf.id,
				from: sourceRef,
				to: targetRef,
				tidy: route(true),
				plain: route(false),
			})
			stemOffset = (stemOffset + MESSAGE_FLOW_STEM_STEP) % (MESSAGE_FLOW_STEM_STEP * 4)
		}

		const endX = (points: BpmnWaypoint[]): number => points[points.length - 1]?.x ?? 0
		const copy = (points: BpmnWaypoint[]): BpmnWaypoint[] => points.map((p) => ({ ...p }))
		/** The finished waypoints of every message flow, tidy where `tidy[i]`. */
		const place = (tidy: readonly boolean[]): BpmnWaypoint[][] => {
			const runs = candidates.map((c, i) => {
				const r = tidy[i] ? c.tidy : c.plain
				return { source: copy(r.source), target: copy(r.target), gap: r.gap }
			})
			// Flows sharing a gap get their own line inside it, so parallel runs do
			// not pile onto one row and cross every other flow's riser.
			const perGap = new Map<number, typeof runs>()
			for (const run of runs) {
				const list = perGap.get(run.gap)
				if (list) list.push(run)
				else perGap.set(run.gap, [run])
			}
			for (const [index, list] of perGap) {
				const gap = poolGaps[index]
				if (!gap) continue
				// The gap is clear ground, so moving the crossing inside it cannot
				// introduce a collision; the track order decides the crossings.
				const fromAbove = (run: (typeof runs)[number]): boolean => (run.source[0]?.y ?? 0) < gap.top
				const ys = assignTracks(
					list.map((run) => ({
						upper: fromAbove(run) ? endX(run.source) : endX(run.target),
						lower: fromAbove(run) ? endX(run.target) : endX(run.source),
					})),
					gap.top,
					gap.bottom,
				)
				for (let i = 0; i < list.length; i++) {
					const run = list[i]
					const y = ys[i]
					if (!run || y === undefined) continue
					const last = run.source[run.source.length - 1]
					const lastTarget = run.target[run.target.length - 1]
					if (last) last.y = y
					if (lastTarget) lastTarget.y = y
				}
			}
			return runs.map((run) => collapseCollinear([...run.source, ...[...run.target].reverse()]))
		}

		// Start from the plain routes and take each tidy one that adds no
		// crossing with the other messages or the flows already drawn, so the
		// tidying can never cost a crossing. Scored after the final route repair,
		// which reroutes a message still running through a shape.
		const crossingsOf = (paths: BpmnWaypoint[][]): number => {
			const drawn: BpmnDiEdge[] = allEdges.map((e) => ({
				...e,
				waypoints: e.waypoints.map((w) => ({ ...w })),
			}))
			const messages: BpmnDiEdge[] = candidates.map((c, i) => ({
				id: `${c.id}_di`,
				bpmnElement: c.id,
				waypoints: copy(paths[i] ?? []),
				unknownAttributes: {},
			}))
			repair(allShapes, [...drawn, ...messages])
			let n = 0
			for (let i = 0; i < messages.length; i++) {
				const path = messages[i]?.waypoints ?? []
				for (let j = i + 1; j < messages.length; j++)
					n += pathCrossings(path, messages[j]?.waypoints ?? [])
				for (const other of drawn) n += pathCrossings(path, other.waypoints)
			}
			return n
		}
		const tidy = candidates.map(() => false)
		let paths = place(tidy)
		let best = crossingsOf(paths)
		for (let i = 0; i < candidates.length; i++) {
			const c = candidates[i]
			if (!c || sameRoute(c.tidy, c.plain)) continue
			tidy[i] = true
			const trial = place(tidy)
			const n = crossingsOf(trial)
			if (n <= best) {
				best = n
				paths = trial
			} else tidy[i] = false
		}

		const docks: MessageDock[] = []
		for (let i = 0; i < candidates.length; i++) {
			const run = candidates[i]
			const waypoints = paths[i]
			if (!run || !waypoints) continue
			allEdges.push({ id: `${run.id}_di`, bpmnElement: run.id, waypoints, unknownAttributes: {} })
			docks.push(
				{ element: run.from, y: waypoints[0]?.y ?? 0 },
				{ element: run.to, y: waypoints[waypoints.length - 1]?.y ?? 0 },
			)
		}
		flipDockedLabels(
			allShapes,
			allEdges,
			docks,
			new Set([
				...participantIds,
				...laneIds,
				...allShapes.filter((s) => s.isExpanded === true).map((s) => s.bpmnElement),
			]),
		)
	}

	repair(allShapes, allEdges)
	if (collab && collab.messageFlows.length > 0) {
		const pools = new Set(collab.participants.map((p) => p.id))
		placeMessageFlowLabels({
			shapes: allShapes,
			edges: allEdges,
			names: new Map(
				collab.messageFlows.flatMap((f) =>
					f.name?.trim() ? [[f.id, f.name.trim()] as const] : [],
				),
			),
			containers: new Set([
				...pools,
				...defs.processes.flatMap((p) => (p.laneSet?.lanes ?? []).map((lane) => lane.id)),
				...allShapes.filter((s) => s.isExpanded === true).map((s) => s.bpmnElement),
			]),
			pools,
		})
	}
	for (const plane of rootPlanes) repair(plane.shapes, plane.edges)

	const planeBpmnElement = collab?.id ?? defs.processes[0]?.id ?? "plane"
	// The primary plane keeps the ids of the source diagram that drew the same
	// element. The first diagram is the fallback only while no other plane
	// reuses it: a root or sub-process plane keeps its own source diagram, and
	// two diagrams with one id lose a plane to any reader that resolves by id.
	const claimed = new Set<string>([
		...rootPlanes.map((plane) => plane.elementId),
		...childPlanes.map((plane) => plane.elementId),
		...collapsed,
	])
	const firstDiagram = defs.diagrams[0]
	const existingDiagram =
		defs.diagrams.find((d) => d.plane.bpmnElement === planeBpmnElement) ??
		(firstDiagram && !claimed.has(firstDiagram.plane.bpmnElement) ? firstDiagram : undefined)

	return {
		...defs,
		diagrams: keepDiAttributes(defs.diagrams, [
			{
				id: existingDiagram?.id ?? "BPMNDiagram_1",
				plane: {
					id: existingDiagram?.plane.id ?? "BPMNPlane_1",
					bpmnElement: planeBpmnElement,
					shapes: allShapes,
					edges: allEdges,
				},
			},
			...rootPlanes.map((plane) => {
				const previous = defs.diagrams.find((d) => d.plane.bpmnElement === plane.elementId)
				return {
					id: previous?.id ?? `BPMNDiagram_${plane.elementId}`,
					plane: {
						id: previous?.plane.id ?? `BPMNPlane_${plane.elementId}`,
						bpmnElement: plane.elementId,
						shapes: plane.shapes,
						edges: plane.edges,
					},
				}
			}),
			...childPlaneDiagrams(childPlanes, defs, collapsed),
		]),
	}
}

/**
 * Layout recomputes geometry only: bounds, waypoints, label bounds, and the
 * `isExpanded` / `isHorizontal` that describe them. Everything else the source
 * diagram said carries over by `bpmnElement` (DI ids, gateway markers, colours
 * and other vendor attributes, diagram names and label styles), as a plain
 * parse and export would keep it.
 */
function keepDiAttributes(source: BpmnDiagram[], laidOut: BpmnDiagram[]): BpmnDiagram[] {
	// Diagrams match by the element their plane draws; `id` is optional in DI,
	// and matching on an empty one would hand every diagram the first one's
	// attributes and label styles (duplicate XML ids).
	const diagramByElement = new Map<string, BpmnDiagram>()
	const diagramById = new Map<string, BpmnDiagram>()
	const shapeByElement = new Map<string, BpmnDiShape>()
	const edgeByElement = new Map<string, BpmnDiEdge>()
	const sourceIds = new Set<string>()
	for (const diagram of source) {
		const element = diagram.plane.bpmnElement
		if (element && !diagramByElement.has(element)) diagramByElement.set(element, diagram)
		if (diagram.id && !diagramById.has(diagram.id)) diagramById.set(diagram.id, diagram)
		for (const shape of diagram.plane.shapes) {
			if (!shapeByElement.has(shape.bpmnElement)) shapeByElement.set(shape.bpmnElement, shape)
			sourceIds.add(shape.id)
		}
		for (const edge of diagram.plane.edges) {
			if (!edgeByElement.has(edge.bpmnElement)) edgeByElement.set(edge.bpmnElement, edge)
			sourceIds.add(edge.id)
		}
	}

	// A source id is reused only once, so a malformed source with two shapes
	// for one element cannot produce duplicate ids. A generated `X_di` may
	// already be the source id of another element (one renamed from `X`), so
	// generated ids steer clear of every source id.
	const used = new Set<string>()
	// An empty source id means the source omitted it; that is not one to keep.
	const keepId = (generated: string, previous: string | undefined): string => {
		if (previous && !used.has(previous)) {
			used.add(previous)
			return previous
		}
		// Checked even when `generated` equals a previous id already taken (two
		// source shapes sharing `X_di`): that id is in use, so it is not free.
		let id = generated
		for (let n = 2; sourceIds.has(id) || used.has(id); n++) id = `${generated}_${n}`
		used.add(id)
		return id
	}
	const keepLabel = <T extends BpmnDiShape | BpmnDiEdge>(item: T, previous: T): T => {
		const attrs = previous.label?.unknownAttributes
		if (!attrs) return item
		// When layout gives the element no label bounds, the label still carries
		// its style; BPMN DI allows a `BPMNLabel` without bounds.
		return { ...item, label: { ...item.label, unknownAttributes: { ...attrs } } }
	}

	return laidOut.map((diagram) => {
		const previousDiagram =
			(diagram.plane.bpmnElement && diagramByElement.get(diagram.plane.bpmnElement)) ||
			(diagram.id ? diagramById.get(diagram.id) : undefined)
		const shapes = diagram.plane.shapes.map((shape) => {
			const previous = shapeByElement.get(shape.bpmnElement)
			if (!previous) return { ...shape, id: keepId(shape.id, undefined) }
			const kept: BpmnDiShape = {
				...shape,
				id: keepId(shape.id, previous.id),
				unknownAttributes: { ...previous.unknownAttributes },
			}
			// Layout sets the marker only on exclusive gateways; a source value on
			// any other shape is stale (left from an element whose type changed).
			if (shape.isMarkerVisible !== undefined && previous.isMarkerVisible !== undefined)
				kept.isMarkerVisible = previous.isMarkerVisible
			return keepLabel(kept, previous)
		})
		const edges = diagram.plane.edges.map((edge) => {
			const previous = edgeByElement.get(edge.bpmnElement)
			if (!previous) return { ...edge, id: keepId(edge.id, undefined) }
			const kept: BpmnDiEdge = {
				...edge,
				id: keepId(edge.id, previous.id),
				unknownAttributes: { ...previous.unknownAttributes },
			}
			return keepLabel(kept, previous)
		})
		const plane = { ...diagram.plane, shapes, edges }
		const planeAttrs = previousDiagram?.plane.unknownAttributes
		if (planeAttrs) plane.unknownAttributes = { ...planeAttrs }

		const result: BpmnDiagram = { ...diagram, plane }
		if (previousDiagram?.unknownAttributes)
			result.unknownAttributes = { ...previousDiagram.unknownAttributes }
		if (previousDiagram?.unknownChildren)
			result.unknownChildren = structuredClone(previousDiagram.unknownChildren)
		return result
	})
}

/**
 * The final pass over a finished plane: any connection still running through a
 * shape it is unrelated to gets an obstacle-aware route. Relatedness is what a
 * route may touch — its endpoints, the scopes and pools holding them, and a
 * boundary event's host (or a host's boundary events).
 */
function routeRepair(defs: BpmnDefinitions): (shapes: BpmnDiShape[], edges: BpmnDiEdge[]) => void {
	const parent = new Map<string, string>()
	const attachedTo = new Map<string, string>()
	const attachers = new Map<string, string[]>()
	const connections = new Map<string, { kind: ConnectionKind; source: string; target: string }>()
	const containers = new Set<string>()

	const participantOf = new Map<string, string>()
	for (const collab of defs.collaborations) {
		for (const participant of collab.participants) {
			containers.add(participant.id)
			if (participant.processRef) participantOf.set(participant.processRef, participant.id)
		}
		for (const flow of collab.messageFlows) {
			connections.set(flow.id, { kind: "message", source: flow.sourceRef, target: flow.targetRef })
		}
		for (const a of collab.associations ?? []) {
			connections.set(a.id, { kind: "association", source: a.sourceRef, target: a.targetRef })
		}
		for (const group of collab.groups ?? []) containers.add(group.id)
	}

	const walk = (elements: BpmnFlowElement[], owner: string | undefined): void => {
		for (const element of elements) {
			if (owner) parent.set(element.id, owner)
			if (element.type === "boundaryEvent") {
				attachedTo.set(element.id, element.attachedToRef)
				const list = attachers.get(element.attachedToRef)
				if (list) list.push(element.id)
				else attachers.set(element.attachedToRef, [element.id])
			}
			const scope = element as unknown as {
				flowElements?: BpmnFlowElement[]
				sequenceFlows?: Array<{ id: string; sourceRef: string; targetRef: string }>
				associations?: BpmnProcess["associations"]
			}
			for (const flow of scope.sequenceFlows ?? []) {
				connections.set(flow.id, {
					kind: "sequence",
					source: flow.sourceRef,
					target: flow.targetRef,
				})
			}
			// A sub-process's associations are drawn on the same plane as the
			// process's own (withNestedAnnotations), so they need the same repair.
			for (const a of scope.associations ?? []) {
				connections.set(a.id, { kind: "association", source: a.sourceRef, target: a.targetRef })
			}
			if (scope.flowElements) walk(scope.flowElements, element.id)
		}
	}
	for (const process of defs.processes) {
		const owner = participantOf.get(process.id)
		walk(process.flowElements, owner)
		for (const flow of process.sequenceFlows ?? []) {
			connections.set(flow.id, { kind: "sequence", source: flow.sourceRef, target: flow.targetRef })
		}
		for (const a of process.associations ?? []) {
			connections.set(a.id, { kind: "association", source: a.sourceRef, target: a.targetRef })
		}
		for (const group of process.groups ?? []) containers.add(group.id)
		for (const level of laneLevels(process.laneSet)) containers.add(level.lane.id)
	}

	const related = (id: string): string[] => {
		const out: string[] = [...(attachers.get(id) ?? [])]
		const host = attachedTo.get(id)
		if (host) out.push(host)
		for (let p = parent.get(id); p !== undefined; p = parent.get(p)) out.push(p)
		return out
	}

	return (shapes, edges) => {
		if (edges.length === 0) return
		const onPlane = new Map(shapes.map((s) => [s.bpmnElement, s.bounds]))
		const visible = (id: string): string => {
			let current: string | undefined = id
			while (current !== undefined && !onPlane.has(current)) current = parent.get(current)
			return current ?? id
		}
		const planeShapes: PlaneShape[] = shapes.map((s) => ({
			id: s.bpmnElement,
			bounds: s.bounds,
			container: containers.has(s.bpmnElement),
		}))
		const planeEdges: Array<PlaneEdge & { di: BpmnDiEdge }> = []
		for (const di of edges) {
			const connection = connections.get(di.bpmnElement)
			if (!connection) continue
			planeEdges.push({
				kind: connection.kind,
				sourceRef: visible(connection.source),
				targetRef: visible(connection.target),
				waypoints: di.waypoints,
				di,
			})
		}
		const boundarySide = (id: string): Side | undefined => {
			const host = attachedTo.get(id)
			const own = onPlane.get(id)
			const hostBounds = host ? onPlane.get(host) : undefined
			if (!own || !hostBounds) return undefined
			return own.y + own.height / 2 <= hostBounds.y + 1 ? "top" : "bottom"
		}
		repairRoutes(planeShapes, planeEdges, related, boundarySide)
		for (const edge of planeEdges) {
			if (edge.waypoints !== edge.di.waypoints) {
				edge.di.waypoints = edge.waypoints.map((wp) => ({
					x: Math.round(wp.x),
					y: Math.round(wp.y),
				}))
			}
		}
	}
}
