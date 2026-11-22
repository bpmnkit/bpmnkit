import type {
	BpmnFlowElement,
	BpmnLaneSet,
	BpmnProcess,
	BpmnSequenceFlow,
} from "../../bpmn/bpmn-model.js"
import { placeEdgeLabels } from "../grid/edge-labels.js"
import { layeredPlace } from "../layered/index.js"
import type {
	Bounds,
	GridHint,
	LayoutEdge,
	LayoutHints,
	LayoutNode,
	LayoutResult,
	Waypoint,
} from "../types.js"
import { LABEL_CHAR_WIDTH, LABEL_HEIGHT, LABEL_MIN_WIDTH, SUBPROCESS_PADDING } from "../types.js"
import { assignBands, boundarySide } from "./bands.js"
import { type SemanticGraph, assignRanks, buildSemanticGraph, placeExceptionRow } from "./graph.js"
import { cheaper, laneCost, laneHandoffs, lanePlan } from "./lanes.js"
import { type LaneOptions, externalLabelWidth, place, sizeOf } from "./place.js"
import { routeFlows } from "./route.js"

/** Padding between an expanded sub-process border and its children. */
const SUB_PADDING = SUBPROCESS_PADDING
/** Extra top padding inside a named expanded sub-process, for its title. */
const TITLE_BAND = 28
/** Gap between an event or gateway and its external label. */
const LABEL_OFFSET = 4
/** Step and limit when a blocked external label slides along a stem. */
const LABEL_SLIDE = 10
const MAX_LABEL_SLIDE = 60

const CONTAINER_TYPES = new Set(["subProcess", "adHocSubProcess", "eventSubProcess", "transaction"])

interface Container {
	flowElements?: BpmnFlowElement[]
	sequenceFlows?: BpmnSequenceFlow[]
	laneSet?: BpmnLaneSet
}

/**
 * Lay out a process the way the BPMN reads: ranks carry the flow left to right,
 * semantic bands carry branch meaning up and down, and lane membership wins over
 * both.
 */
export function semanticLayoutProcess(
	process: BpmnProcess,
	collapsed?: ReadonlySet<string>,
	grids?: LayoutHints["grids"],
	inPool = false,
	/** Run the layered (Sugiyama) placement and routing on every lane-free scope. */
	layered = false,
): LayoutResult {
	return semanticLayout(
		process.flowElements,
		process.sequenceFlows,
		process.laneSet,
		collapsed,
		false,
		grids,
		undefined,
		!inPool,
		layered,
	)
}

export function semanticLayout(
	flowElements: BpmnFlowElement[],
	sequenceFlows: BpmnSequenceFlow[],
	laneSet?: BpmnLaneSet,
	/** Sub-processes drawn collapsed: their contents go on a plane of their own. */
	collapsed: ReadonlySet<string> = new Set(),
	/** True for the contents of an expanded sub-process; see `place`'s `packLoose`. */
	inContainer = false,
	/** Tool-grid hints, by container id; applied to the containers in this scope and below. */
	grids?: LayoutHints["grids"],
	/** The hint for this scope's own grid, when it is a hinted container's interior. */
	grid?: GridHint,
	/** Slot data references under the activity they are wired to. */
	slotArtifacts = false,
	/** See {@link semanticLayoutProcess}. */
	layered = false,
): LayoutResult {
	if (flowElements.length === 0) return { nodes: [], edges: [] }

	const graph = buildSemanticGraph(flowElements, sequenceFlows, slotArtifacts)

	// Children first: an expanded sub-process is sized by what it contains, while
	// a collapsed one stays activity-sized and its contents move to their own plane.
	const childResults = new Map<string, LayoutResult>()
	const planes: Array<{ elementId: string; result: LayoutResult }> = []
	const sizes = new Map<string, { width: number; height: number }>()
	const axes = new Map<string, number>()
	for (const el of graph.nodes) {
		const child = childLayoutOf(el, collapsed, grids, layered)
		if (!child) {
			sizes.set(el.id, sizeOf(el))
			continue
		}
		if (collapsed.has(el.id)) {
			planes.push({ elementId: el.id, result: child.result })
			planes.push(...(child.result.planes ?? []))
			sizes.set(el.id, sizeOf(el))
		} else {
			childResults.set(el.id, child.result)
			planes.push(...(child.result.planes ?? []))
			sizes.set(el.id, child.size)
			if (child.axis !== undefined) axes.set(el.id, child.axis)
		}
	}

	// A named expanded sub-process draws its title along its top border.
	const titled = new Set(
		[...childResults.keys()].filter((id) => graph.byId.get(id)?.name !== undefined),
	)
	if (layered && useLayered(graph, laneSet, inContainer, grid)) {
		const placed = layeredPlace(graph, sequenceFlows, sizes, titled, slotArtifacts)
		return finish(
			graph,
			flowElements,
			placed.bounds,
			placed.edges,
			(id) => placed.row.get(id) ?? 0,
			[],
			childResults,
			planes,
			collapsed,
		)
	}
	const laneInfo = laneSet ? lanePlan(graph, laneSet) : undefined
	const run = (handoffs: Set<string>, laneOpts: LaneOptions = {}): LayoutResult => {
		graph.handoffs = handoffs
		assignRanks(graph)
		// finish() moves the children, and a laned scope is laid out twice
		const children = laneSet ? structuredClone(childResults) : childResults
		const plainSides = new Map<string, 1 | -1>()
		let bandLayout = assignBands(graph, titled, plainSides)
		// Lanes decide a handler's row themselves, so the exception row is for lane-free scopes.
		if (
			!laneSet &&
			placeExceptionRow(graph, bandLayout.bands, (event, host) =>
				boundarySide(event, titled.has(host)),
			)
		) {
			bandLayout = assignBands(graph, titled, plainSides)
		}
		const { bounds, lanes, gutterX } = place(
			graph,
			bandLayout,
			sizes,
			laneSet,
			inContainer,
			titled,
			grid,
			axes,
			slotArtifacts,
			laneOpts,
		)
		const edges = routeFlows(graph, sequenceFlows, bounds, bandLayout, gutterX)
		return finish(
			graph,
			flowElements,
			bounds,
			edges,
			(id) => bandLayout.bands.get(id) ?? 0,
			lanes,
			children,
			planes,
			collapsed,
		)
	}
	// Nested lane sets keep the placement they always had.
	if (!laneSet || !laneInfo || !laneInfo.flat) return run(graph.handoffs)
	// The layout as it always was comes first and wins ties: a refinement is kept
	// only when it is strictly cheaper (see `laneCost`).
	const orders: Array<readonly string[] | undefined> = [undefined]
	if (laneInfo.order) orders.push(laneInfo.order)
	const legacy = run(new Set())
	const legacyCost = laneCost(legacy)
	let best = legacy
	let bestCost = legacyCost
	const none = new Set<string>()
	for (const order of orders) {
		const lanes = order ?? laneInfo.declared
		const variants: Array<[Set<string>, LaneOptions]> = [
			[none, { order, compact: true }],
			[none, { order, compact: true, byLane: true }],
			[laneHandoffs(graph, laneInfo.leafOf, lanes, true), { order, compact: true, byLane: true }],
			[laneHandoffs(graph, laneInfo.leafOf, lanes), { order, compact: true, byLane: true }],
		]
		if (order) variants.unshift([none, { order }])
		for (const [h, opts] of variants) {
			if (h !== none && h.size === 0) continue
			const result = run(h, opts)
			const cost = laneCost(result)
			// Must not lose to the old layout anywhere; among those that do not, the cheapest in order.
			if (cheaper(cost, legacyCost) && lexicographicallyLess(cost, bestCost)) {
				best = result
				bestCost = cost
			}
		}
	}
	return best
}

function lexicographicallyLess(a: readonly number[], b: readonly number[]): boolean {
	for (let i = 0; i < a.length; i++) {
		if ((a[i] as number) !== (b[i] as number)) return (a[i] as number) < (b[i] as number)
	}
	return false
}

/**
 * The layered engine covers scopes without lanes and without a packed tool
 * grid; lanes stay with the semantic placement until lane-aware ordering lands.
 */
function useLayered(
	graph: SemanticGraph,
	laneSet: BpmnLaneSet | undefined,
	inContainer: boolean,
	grid: GridHint | undefined,
): boolean {
	if (laneSet || grid) return false
	const flowless = graph.components.filter(
		(c) =>
			c.length === 1 &&
			(graph.outgoing.get(c[0] as string) ?? []).length === 0 &&
			(graph.incoming.get(c[0] as string) ?? []).length === 0,
	).length
	if (inContainer && flowless >= 2) return false
	return graph.components.length > flowless
}

/** Nodes, labels and children of a placed and routed scope. */
function finish(
	graph: SemanticGraph,
	flowElements: BpmnFlowElement[],
	bounds: Map<string, Bounds>,
	edges: LayoutEdge[],
	rowOf: (id: string) => number,
	lanes: Array<{ id: string; bounds: Bounds }>,
	childResults: Map<string, LayoutResult>,
	planes: Array<{ elementId: string; result: LayoutResult }>,
	collapsed: ReadonlySet<string>,
): LayoutResult {
	const besideStem = boundaryLabels(graph, bounds)

	const nodes: LayoutNode[] = []
	for (const el of flowElements) {
		const b = bounds.get(el.id)
		if (!b) continue
		const node: LayoutNode = {
			id: el.id,
			type: el.type,
			bounds: b,
			layer: graph.ranks.get(el.id) ?? 0,
			position: rowOf(el.id),
			gridRow: rowOf(el.id),
		}
		if (el.name) {
			node.label = el.name
			const labelBounds = besideStem.get(el.id) ?? externalLabel(el.type, el.name, b)
			if (labelBounds) node.labelBounds = labelBounds
		}
		if (childResults.has(el.id)) node.isExpanded = true
		else if (collapsed.has(el.id)) node.isExpanded = false
		nodes.push(node)
	}

	// Drop the children in, translated into their parent's interior.
	for (const [parentId, child] of childResults) {
		const parent = bounds.get(parentId)
		if (!parent) continue
		const extent = extentOf(child)
		if (!extent) continue
		const named = graph.byId.get(parentId)?.name !== undefined
		const dx = parent.x + SUB_PADDING - extent.x
		const dy = parent.y + SUB_PADDING + (named ? TITLE_BAND : 0) - extent.y
		for (const node of child.nodes) {
			node.bounds = shift(node.bounds, dx, dy)
			if (node.labelBounds) node.labelBounds = shift(node.labelBounds, dx, dy)
			nodes.push(node)
		}
		for (const edge of child.edges) {
			edge.waypoints = edge.waypoints.map((wp) => ({ x: wp.x + dx, y: wp.y + dy }))
			if (edge.labelBounds) edge.labelBounds = shift(edge.labelBounds, dx, dy)
			edges.push(edge)
		}
	}

	const result: LayoutResult = { nodes, edges }
	if (lanes.length > 0) result.lanes = lanes
	if (planes.length > 0) result.planes = planes
	clearExternalLabels(nodes, edges)
	// A gateway's branch labels read as the answer to its question, so they go
	// right at its exit rather than halfway along the flow.
	const gateways = new Set(nodes.filter((n) => n.type.endsWith("Gateway")).map((n) => n.id))
	placeEdgeLabels(
		edges,
		new Map(nodes.map((n) => [n.id, n])),
		new Set(edges.filter((e) => gateways.has(e.sourceRef)).map((e) => e.id)),
	)
	return result
}

/** Lay out a container's children and report the size its border needs. */
function childLayoutOf(
	el: BpmnFlowElement,
	collapsed: ReadonlySet<string>,
	grids: LayoutHints["grids"],
	layered: boolean,
): {
	result: LayoutResult
	size: { width: number; height: number }
	/** Distance from the container's top to its inner spine, when it has a flow. */
	axis?: number
} | null {
	if (!CONTAINER_TYPES.has(el.type)) return null
	const container = el as unknown as Container
	if (!container.flowElements || container.flowElements.length === 0) return null

	const result = semanticLayout(
		container.flowElements,
		container.sequenceFlows ?? [],
		container.laneSet,
		collapsed,
		// A collapsed container's contents go on a plane of their own, laid out
		// like any top-level scope.
		!collapsed.has(el.id),
		grids,
		grids?.get(el.id),
		false,
		layered,
	)
	const extent = extentOf(result)
	if (!extent) return null

	const titleBand = el.name !== undefined ? TITLE_BAND : 0
	// The inner spine is band 0; its first node sets the line the parent row continues.
	const spineNode =
		result.edges.length > 0
			? result.nodes.find((n) => n.position === 0 && n.type !== "boundaryEvent")
			: undefined
	const size = {
		width: extent.width + 2 * SUB_PADDING,
		height: extent.height + 2 * SUB_PADDING + titleBand,
	}
	if (!spineNode) return { result, size }
	const axis = spineNode.bounds.y + spineNode.bounds.height / 2 - extent.y + SUB_PADDING + titleBand
	return { result, size, axis }
}

function extentOf(result: LayoutResult): Bounds | null {
	let minX = Number.POSITIVE_INFINITY
	let minY = Number.POSITIVE_INFINITY
	let maxX = Number.NEGATIVE_INFINITY
	let maxY = Number.NEGATIVE_INFINITY
	const consider = (b: Bounds): void => {
		minX = Math.min(minX, b.x)
		minY = Math.min(minY, b.y)
		maxX = Math.max(maxX, b.x + b.width)
		maxY = Math.max(maxY, b.y + b.height)
	}
	for (const node of result.nodes) {
		consider(node.bounds)
		if (node.labelBounds) consider(node.labelBounds)
	}
	for (const edge of result.edges) {
		for (const wp of edge.waypoints) consider({ x: wp.x, y: wp.y, width: 0, height: 0 })
	}
	if (!Number.isFinite(minX)) return null
	return { x: minX, y: minY, width: maxX - minX, height: maxY - minY }
}

function shift(b: Bounds, dx: number, dy: number): Bounds {
	return { x: b.x + dx, y: b.y + dy, width: b.width, height: b.height }
}

/**
 * Labels for named boundary events, beside the event's exit stem rather than
 * centred on it.
 *
 * A boundary event's flows leave its outward side at the centre, so a label
 * centred below (or above) the event is crossed by its own exit edge. Labels
 * sit on the outward side, outside the host, in the gaps between the stems of
 * the events docked on that border: each gap holds at most one label, and the
 * gaps beyond the first and last stem are unbounded. A label takes the gap on
 * its left if it fits there, else the one on its right. When neither fits, it
 * goes beyond the outermost stem on its nearer side, past the labels already
 * there. Every label stays on one line in the one row next to the host:
 * routing does not see labels, and anything farther out would reach the turn
 * a route takes just past a stem.
 */
function boundaryLabels(graph: SemanticGraph, bounds: Map<string, Bounds>): Map<string, Bounds> {
	const labels = new Map<string, Bounds>()
	for (const [hostId, events] of graph.attachers) {
		const host = bounds.get(hostId)
		if (!host) continue
		const docked = events
			.map((event) => ({ event, b: bounds.get(event.id) }))
			.filter((d): d is { event: (typeof events)[number]; b: Bounds } => d.b !== undefined)
		for (const onTop of [true, false]) {
			// Same side test the router uses to pick the exit direction.
			const side = docked
				.filter(({ b }) => b.y + b.height / 2 <= host.y + 1 === onTop)
				.sort((p, q) => p.b.x - q.b.x)
			const stems = side.map(({ b }) => b.x + b.width / 2)
			/** How far labels beyond the first / last stem already reach. */
			const outer = {
				left: (stems[0] ?? 0) - LABEL_OFFSET,
				right: (stems[stems.length - 1] ?? 0) + LABEL_OFFSET,
			}
			/** Labels that fit no gap, placed past the outer labels once those are known. */
			const spill = { left: [] as Array<() => void>, right: [] as Array<() => void> }
			const place = (b: Bounds, x: number, width: number): Bounds => ({
				x,
				y: onTop ? b.y - LABEL_OFFSET - LABEL_HEIGHT : b.y + b.height + LABEL_OFFSET,
				width,
				height: LABEL_HEIGHT,
			})
			let leftGapTaken = false
			side.forEach(({ event, b }, i) => {
				const stem = stems[i] as number
				const name = event.name
				if (!name) {
					leftGapTaken = false
					return
				}
				const previous = stems[i - 1] ?? Number.NEGATIVE_INFINITY
				const next = stems[i + 1] ?? Number.POSITIVE_INFINITY
				const leftRoom = leftGapTaken ? 0 : stem - previous - 2 * LABEL_OFFSET
				const rightRoom = next - stem - 2 * LABEL_OFFSET
				const full = Math.max(name.length * LABEL_CHAR_WIDTH, LABEL_MIN_WIDTH)
				leftGapTaken = false
				if (leftRoom >= full) {
					const x = stem - LABEL_OFFSET - full
					if (i === 0) outer.left = x - LABEL_OFFSET
					labels.set(event.id, place(b, x, full))
					return
				}
				if (rightRoom >= full) {
					if (i === side.length - 1) outer.right = stem + 2 * LABEL_OFFSET + full
					labels.set(event.id, place(b, stem + LABEL_OFFSET, full))
					leftGapTaken = true
					return
				}
				// Neither gap holds it: beyond the outermost stem no stem crosses it.
				if (i < side.length / 2) {
					spill.left.push(() => {
						outer.left -= full
						labels.set(event.id, place(b, outer.left, full))
						outer.left -= LABEL_OFFSET
					})
				} else {
					spill.right.push(() => {
						labels.set(event.id, place(b, outer.right, full))
						outer.right += full + LABEL_OFFSET
					})
				}
			})
			// Nearest stems first, so the order outward matches the order of the events.
			for (const put of spill.left.reverse()) put()
			for (const put of spill.right) put()
		}
	}
	return labels
}

/**
 * Move an event's or gateway's label off the flows that leave or pass it.
 *
 * The label starts centred below the shape, where a branch leaving through the
 * bottom would cut through it. It then tries above, and beside the vertical
 * stems on either side, keeping the first spot clear of every flow, shape and
 * label; with none clear it stays below.
 */
function clearExternalLabels(nodes: LayoutNode[], edges: LayoutEdge[]): void {
	const segments: Array<[Waypoint, Waypoint]> = []
	for (const edge of edges) {
		for (let i = 0; i + 1 < edge.waypoints.length; i++) {
			segments.push([edge.waypoints[i] as Waypoint, edge.waypoints[i + 1] as Waypoint])
		}
	}
	const contains = (outer: Bounds, inner: Bounds): boolean =>
		outer.x <= inner.x &&
		outer.y <= inner.y &&
		outer.x + outer.width >= inner.x + inner.width &&
		outer.y + outer.height >= inner.y + inner.height
	const labels = nodes.filter((n) => n.labelBounds).map((n) => n.labelBounds as Bounds)
	for (const node of nodes) {
		const label = node.labelBounds
		if (!label || node.type === "boundaryEvent") continue
		const clear = (b: Bounds): boolean =>
			!segments.some(([p, q]) => segmentCuts(p, q, b)) &&
			!nodes.some(
				(other) =>
					other !== node && !contains(other.bounds, node.bounds) && overlapsBox(other.bounds, b),
			) &&
			!labels.some((other) => other !== label && overlapsBox(other, b))
		if (clear(label)) continue
		const b = node.bounds
		const cx = b.x + b.width / 2
		const below = b.y + b.height + LABEL_OFFSET
		const above = b.y - LABEL_OFFSET - label.height
		const beside = 2 * LABEL_OFFSET
		const candidates: Bounds[] = [
			{ ...label, y: above },
			{ ...label, x: cx + beside, y: below },
			{ ...label, x: cx - beside - label.width, y: below },
			{ ...label, x: cx + beside, y: above },
			{ ...label, x: cx - beside - label.width, y: above },
		]
		// Still blocked, usually by a task beside the gateway: slide the label
		// along the stem until it is past that neighbour.
		for (let slide = LABEL_SLIDE; slide <= MAX_LABEL_SLIDE; slide += LABEL_SLIDE) {
			for (const [dx, y] of [
				[cx + beside, below + slide],
				[cx - beside - label.width, below + slide],
				[cx + beside, above - slide],
				[cx - beside - label.width, above - slide],
			] as const) {
				candidates.push({ ...label, x: dx, y })
			}
		}
		const spot = candidates.find(clear)
		if (spot) {
			label.x = spot.x
			label.y = spot.y
		}
	}
}

function overlapsBox(a: Bounds, b: Bounds): boolean {
	return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
}

/** True when the axis-parallel segment p→q runs through the box. */
function segmentCuts(p: Waypoint, q: Waypoint, b: Bounds): boolean {
	return (
		Math.max(p.x, q.x) > b.x &&
		Math.min(p.x, q.x) < b.x + b.width &&
		Math.max(p.y, q.y) > b.y &&
		Math.min(p.y, q.y) < b.y + b.height
	)
}

/** Events and gateways carry their name outside the shape; activities do not. */
function externalLabel(type: string, name: string, bounds: Bounds): Bounds | undefined {
	const width = externalLabelWidth(type, name)
	if (width === undefined) return undefined
	return {
		x: bounds.x + bounds.width / 2 - width / 2,
		y: bounds.y + bounds.height + LABEL_OFFSET,
		width,
		height: LABEL_HEIGHT,
	}
}

export type { Placement } from "./place.js"
