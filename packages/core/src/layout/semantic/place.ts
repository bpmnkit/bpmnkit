import type { BpmnBoundaryEvent, BpmnFlowElement, BpmnLaneSet } from "../../bpmn/bpmn-model.js"
import type { Bounds, GridHint } from "../types.js"
import {
	ELEMENT_SIZES,
	LABEL_CHAR_WIDTH,
	LABEL_HEIGHT,
	LABEL_MIN_WIDTH,
	LABEL_VERTICAL_OFFSET,
} from "../types.js"
import { type BandLayout, boundarySide } from "./bands.js"
import type { SemanticGraph } from "./graph.js"

/**
 * Geometry constants. Layout may add space beyond these; it never takes any back.
 * Hand-drawn diagrams keep about 50-60 px between neighbouring shapes; wider
 * gaps only where a flow label or a long event label needs the room.
 */
export const H_GAP = 60
export const V_GAP = 60
/**
 * Gap beside a column holding an expanded container. The container's border,
 * its title and the notes on its children crowd that gap, so it keeps more air.
 */
export const CONTAINER_GAP = 100
/** Clear space either side of a flow label inside a column gap. */
const LABEL_MARGIN = 10
/** Gap between an event or gateway and its external label (mirrors `index.ts`). */
const EXTERNAL_LABEL_OFFSET = 4
const GRID_GAP_X = 40
const GRID_GAP_Y = 20
export const COMPONENT_GAP = 80
export const LANE_PADDING = 40
export const BOUNDARY_SIZE = 36

const DEFAULT_SIZE = { width: 100, height: 80 }

const EXTERNAL_LABEL_TYPES = new Set([
	"startEvent",
	"endEvent",
	"intermediateThrowEvent",
	"intermediateCatchEvent",
	"boundaryEvent",
	"exclusiveGateway",
	"parallelGateway",
	"inclusiveGateway",
	"eventBasedGateway",
	"complexGateway",
])

/**
 * Width of the label an event or gateway carries centred below its shape;
 * undefined for types whose name sits inside the shape.
 */
export function externalLabelWidth(type: string, name: string): number | undefined {
	if (!EXTERNAL_LABEL_TYPES.has(type)) return undefined
	return Math.max(name.length * LABEL_CHAR_WIDTH, LABEL_MIN_WIDTH)
}

export interface Placement {
	/** Absolute bounds per flow node, boundary events included. */
	bounds: Map<string, Bounds>
	/** Lane bands in top-to-bottom order, empty when the scope has no lanes. */
	lanes: Array<{ id: string; bounds: Bounds }>
	/**
	 * Mid-x of the empty gutter in front of each rank. Vertical runs belong
	 * here: placement never puts a shape in a gutter, so these lines are clear.
	 */
	gutterX: Map<number, number>
}

export function sizeOf(
	el: BpmnFlowElement,
	childExtent?: Bounds,
): { width: number; height: number } {
	if (childExtent) return { width: childExtent.width, height: childExtent.height }
	return ELEMENT_SIZES[el.type] ?? DEFAULT_SIZE
}

/**
 * Turn ranks and bands into coordinates.
 *
 * Ranks become columns sized by their widest node, bands become rows sized by
 * their tallest. Nodes are centred in both, so any two nodes sharing a band
 * share a centre line and the spine routes as one straight segment.
 */
export function place(
	graph: SemanticGraph,
	bandLayout: BandLayout,
	sizes: Map<string, { width: number; height: number }>,
	laneSet: BpmnLaneSet | undefined,
	/**
	 * Pack nodes that have no sequence flow at all into a wrapped grid rather
	 * than one row each. Set for the inside of an expanded sub-process, where
	 * such nodes are an unordered set (the tools of an ad-hoc sub-process) and a
	 * single column would both imply an order and grow the container into a
	 * tall strip.
	 */
	packLoose = false,
	/**
	 * Hosts whose title is drawn along their top border — named expanded
	 * sub-processes. Boundary events stay off that border.
	 */
	titled: ReadonlySet<string> = new Set(),
	/** Shape of the `packLoose` grid, when the builder asked for one. */
	grid?: GridHint,
	/**
	 * For expanded containers with a flow inside: the distance from the
	 * container's top to its inner spine. The container is hung so that spine
	 * continues the row's line, and the flow runs straight through it.
	 */
	axes: ReadonlyMap<string, number> = new Map(),
): Placement {
	const bounds = new Map<string, Bounds>()
	const componentOf = new Map<string, number>()
	for (let i = 0; i < graph.components.length; i++) {
		for (const id of graph.components[i] ?? []) componentOf.set(id, i)
	}

	// ── Columns: one per rank, shared across components so flow stays aligned ──
	const colWidth = new Map<number, number>()
	for (const node of graph.nodes) {
		const rank = graph.ranks.get(node.id) ?? 0
		const size = sizes.get(node.id) ?? DEFAULT_SIZE
		colWidth.set(rank, Math.max(colWidth.get(rank) ?? 0, size.width))
	}
	const ranks = [...colWidth.keys()].sort((a, b) => a - b)
	const gaps = columnGaps(graph, sizes, colWidth, ranks)
	const colX = new Map<number, number>()
	const gutterX = new Map<number, number>()
	let x = 0
	for (const [i, rank] of ranks.entries()) {
		const gap = gaps.get(rank) ?? H_GAP
		if (i > 0) x += gap
		colX.set(rank, x)
		gutterX.set(rank, x - gap / 2)
		x += colWidth.get(rank) ?? 0
	}
	const xOf = (id: string): { left: number; right: number; width: number } => {
		const size = sizes.get(id) ?? DEFAULT_SIZE
		const rank = graph.ranks.get(id) ?? 0
		const cw = colWidth.get(rank) ?? size.width
		const left = (colX.get(rank) ?? 0) + (cw - size.width) / 2
		return { left, right: left + size.width, width: size.width }
	}

	// ── Rows: one line per band, laid out per component then stacked ──
	const loose = packLoose ? looseNodes(graph) : []
	const looseSet = new Set(loose)
	let cursorY = 0
	for (let component = 0; component < graph.components.length; component++) {
		const members = (graph.components[component] ?? []).filter((id) => graph.byId.has(id))
		if (members.length === 0) continue
		if (members.length === 1 && looseSet.has(members[0] as string)) {
			// The whole grid takes the place of the first loose node; the rest are in it.
			if (members[0] === loose[0]) cursorY = placeGrid(graph, loose, sizes, cursorY, bounds, grid)
			continue
		}

		const lines = bandLines(graph, bandLayout, members, sizes, xOf, axes, titled)
		let top = Number.POSITIVE_INFINITY
		let bottom = Number.NEGATIVE_INFINITY
		for (const id of members) {
			const line = lines.line.get(bandLayout.bands.get(id) ?? 0) ?? 0
			const extent = lines.extent.get(id)
			if (!extent) continue
			top = Math.min(top, line - extent.above)
			bottom = Math.max(bottom, line + extent.below)
		}
		const dy = cursorY - top
		for (const id of members) {
			const size = sizes.get(id) ?? DEFAULT_SIZE
			const line = lines.line.get(bandLayout.bands.get(id) ?? 0) ?? 0
			const { left } = xOf(id)
			bounds.set(id, {
				x: left,
				y: line + dy - centreOffset(id, size, axes),
				width: size.width,
				height: size.height,
			})
		}

		cursorY = bottom + dy + COMPONENT_GAP
	}

	separateSameCell(graph, bandLayout, bounds)
	const lanes = laneSet ? applyLanes(graph, laneSet, bounds) : []
	dockBoundaryEvents(graph, bounds, titled)
	return { bounds, lanes, gutterX }
}

/**
 * The gap in front of each rank. At least {@link H_GAP}; wider where a flow
 * label sits between two neighbouring columns, or where events' and gateways'
 * labels, centred below shapes narrower than themselves, would meet.
 */
function columnGaps(
	graph: SemanticGraph,
	sizes: Map<string, { width: number; height: number }>,
	colWidth: Map<number, number>,
	ranks: number[],
): Map<number, number> {
	const rankOf = (id: string): number => {
		const el = graph.byId.get(id)
		const host = el?.type === "boundaryEvent" ? (el as BpmnBoundaryEvent).attachedToRef : id
		return graph.ranks.get(host) ?? 0
	}
	const position = new Map(ranks.map((rank, i) => [rank, i]))
	const tall = new Set<number>()
	for (const node of graph.nodes) {
		if ((sizes.get(node.id) ?? DEFAULT_SIZE).height > DEFAULT_SIZE.height) {
			tall.add(graph.ranks.get(node.id) ?? 0)
		}
	}
	const overhang = new Map<number, number>()
	for (const node of graph.nodes) {
		if (!node.name) continue
		const width = externalLabelWidth(node.type, node.name)
		if (width === undefined) continue
		const rank = graph.ranks.get(node.id) ?? 0
		const cw = colWidth.get(rank) ?? (sizes.get(node.id) ?? DEFAULT_SIZE).width
		overhang.set(rank, Math.max(overhang.get(rank) ?? 0, (width - cw) / 2))
	}
	const gaps = new Map<number, number>()
	for (const [i, rank] of ranks.entries()) {
		if (i === 0) continue
		const previous = ranks[i - 1] as number
		const labels = Math.max(0, overhang.get(previous) ?? 0) + Math.max(0, overhang.get(rank) ?? 0)
		const base = tall.has(rank) || tall.has(previous) ? CONTAINER_GAP : H_GAP
		gaps.set(rank, Math.max(base, labels + 2 * EXTERNAL_LABEL_OFFSET + LABEL_MARGIN))
	}
	for (const flows of graph.outgoing.values()) {
		for (const flow of flows) {
			if (!flow.name || graph.backEdges.has(flow.id)) continue
			const target = rankOf(flow.targetRef)
			const at = position.get(target)
			if (at === undefined || at === 0) continue
			// Only a flow between neighbouring columns has nowhere else to put its label.
			if (position.get(rankOf(flow.sourceRef)) !== at - 1) continue
			const need = Math.max(flow.name.length * LABEL_CHAR_WIDTH, LABEL_MIN_WIDTH) + 2 * LABEL_MARGIN
			gaps.set(target, Math.max(gaps.get(target) ?? H_GAP, need))
		}
	}
	return gaps
}

/** How far a node's centre line sits below its top. */
function centreOffset(
	id: string,
	size: { width: number; height: number },
	axes: ReadonlyMap<string, number>,
): number {
	if (size.height <= DEFAULT_SIZE.height) return size.height / 2
	// A tall container carries its inner spine on the row's line; one without an
	// inner flow (a tool grid) hangs from the task line instead.
	return axes.get(id) ?? DEFAULT_SIZE.height / 2
}

interface Extent {
	above: number
	below: number
}

/**
 * Space a node needs above and below its band's line: its shape, the label
 * below an event or gateway, and the boundary events docked on its borders
 * together with their labels.
 */
function extentOf(
	graph: SemanticGraph,
	id: string,
	size: { width: number; height: number },
	axes: ReadonlyMap<string, number>,
	titled: ReadonlySet<string>,
): Extent {
	const offset = centreOffset(id, size, axes)
	let above = offset
	let below = size.height - offset
	const el = graph.byId.get(id)
	if (el?.name && externalLabelWidth(el.type, el.name) !== undefined) {
		below = Math.max(below, size.height / 2 + EXTERNAL_LABEL_OFFSET + LABEL_HEIGHT)
	}
	for (const event of graph.attachers.get(id) ?? []) {
		const reach = BOUNDARY_SIZE / 2 + (event.name ? EXTERNAL_LABEL_OFFSET + LABEL_HEIGHT : 0)
		if (boundarySide(event, titled.has(id)) === -1) above = Math.max(above, offset + reach)
		else below = Math.max(below, size.height - offset + reach)
	}
	return { above, below }
}

/**
 * The y of each band's line, relative to the spine at 0.
 *
 * Bands keep their order, but a band only clears what it actually sits under
 * or over: the shapes above it in its own columns, and those its connecting
 * flows run past. A tall sub-process therefore pushes down only the branches
 * beneath it, not every branch in the diagram.
 */
function bandLines(
	graph: SemanticGraph,
	bandLayout: BandLayout,
	members: string[],
	sizes: Map<string, { width: number; height: number }>,
	xOf: (id: string) => { left: number; right: number; width: number },
	axes: ReadonlyMap<string, number>,
	titled: ReadonlySet<string>,
): { line: Map<number, number>; extent: Map<string, Extent> } {
	const extent = new Map<string, Extent>()
	const byBand = new Map<number, string[]>()
	for (const id of members) {
		extent.set(id, extentOf(graph, id, sizes.get(id) ?? DEFAULT_SIZE, axes, titled))
		const band = bandLayout.bands.get(id) ?? 0
		const list = byBand.get(band)
		if (list) list.push(id)
		else byBand.set(band, [id])
	}
	const line = new Map<number, number>()
	/** Placed boxes: x-range and how far they reach above / below their line. */
	const placed: Array<{ left: number; right: number; top: number; bottom: number }> = []
	const place = (band: number, y: number): void => {
		line.set(band, y)
		for (const id of byBand.get(band) ?? []) {
			const { left, right } = xOf(id)
			const e = extent.get(id) as Extent
			placed.push({ left, right, top: y - e.above, bottom: y + e.below })
		}
	}
	/** Centre x of every node a band's members connect to, so the band clears its own flows. */
	const span = (band: number): { left: number; right: number } => {
		let left = Number.POSITIVE_INFINITY
		let right = Number.NEGATIVE_INFINITY
		const memberSet = new Set(byBand.get(band) ?? [])
		const take = (id: string): void => {
			const el = graph.byId.get(id)
			const host = el?.type === "boundaryEvent" ? (el as BpmnBoundaryEvent).attachedToRef : id
			if (!graph.byId.has(host)) return
			const b = xOf(host)
			const mid = b.left + b.width / 2
			left = Math.min(left, memberSet.has(host) ? b.left : mid)
			right = Math.max(right, memberSet.has(host) ? b.right : mid)
		}
		for (const id of memberSet) {
			take(id)
			for (const f of graph.outgoing.get(id) ?? [])
				if (!graph.backEdges.has(f.id)) take(f.targetRef)
			for (const f of graph.incoming.get(id) ?? [])
				if (!graph.backEdges.has(f.id)) take(f.sourceRef)
		}
		return { left, right }
	}
	const xOverlap = (a: { left: number; right: number }, b: { left: number; right: number }) =>
		a.left < b.right && b.left < a.right

	const bands = [...byBand.keys()]
	if (byBand.has(0)) place(0, 0)
	const below = bands.filter((b) => b > 0).sort((a, b) => a - b)
	const above = bands.filter((b) => b < 0).sort((a, b) => b - a)
	for (const [list, dir] of [
		[below, 1],
		[above, -1],
	] as const) {
		let previous = 0
		for (const band of list) {
			const wide = span(band)
			let y = previous + dir
			for (const box of placed) {
				if (xOverlap(box, wide)) {
					y = dir === 1 ? Math.max(y, box.bottom + V_GAP) : Math.min(y, box.top - V_GAP)
				}
				for (const id of byBand.get(band) ?? []) {
					const b = xOf(id)
					const e = extent.get(id) as Extent
					const reach = { left: b.left - H_GAP / 2, right: b.right + H_GAP / 2 }
					if (!xOverlap(box, reach)) continue
					y =
						dir === 1
							? Math.max(y, box.bottom + V_GAP + e.above)
							: Math.min(y, box.top - V_GAP - e.below)
				}
			}
			place(band, y)
			previous = y
		}
	}
	return { line, extent }
}

/**
 * Nodes with no incoming or outgoing flow, in declaration order — only when
 * there are at least two of them, since one has nothing to be packed with.
 */
function looseNodes(graph: SemanticGraph): string[] {
	const loose = graph.components
		.filter((members) => members.length === 1)
		.map((members) => members[0] as string)
		// A one-node component can still loop on itself; that node has flow.
		.filter(
			(id) =>
				graph.byId.has(id) &&
				(graph.outgoing.get(id) ?? []).length === 0 &&
				(graph.incoming.get(id) ?? []).length === 0,
		)
	return loose.length >= 2 ? loose : []
}

/**
 * Place `ids` row by row in `ceil(sqrt(n))` columns of equal cells, starting at
 * `top`, so the set grows roughly square. A hint can fix the column count and
 * fill column by column instead. Returns the cursor for whatever is stacked below.
 */
function placeGrid(
	graph: SemanticGraph,
	ids: string[],
	sizes: Map<string, { width: number; height: number }>,
	top: number,
	bounds: Map<string, Bounds>,
	hint?: GridHint,
): number {
	const columns = hint?.columns ?? Math.ceil(Math.sqrt(ids.length))
	const rows = Math.ceil(ids.length / columns)
	const byColumn = hint?.fill === "column"
	let cellWidth = 0
	let cellHeight = 0
	let labelled = false
	for (const id of ids) {
		const size = sizes.get(id) ?? DEFAULT_SIZE
		// An event's or gateway's label is centred below it and can be wider than the
		// shape; the cell holds it so neighbouring columns' labels never meet.
		const el = graph.byId.get(id)
		const label = el?.name ? externalLabelWidth(el.type, el.name) : undefined
		if (label !== undefined) labelled = true
		cellWidth = Math.max(cellWidth, size.width, label ?? 0)
		cellHeight = Math.max(cellHeight, size.height)
	}
	// Loose nodes carry no flows, so the routing gutters are not needed between
	// them; only a label below a cell needs vertical room.
	const gapX = GRID_GAP_X
	const gapY = GRID_GAP_Y + (labelled ? LABEL_VERTICAL_OFFSET + LABEL_HEIGHT : 0)
	ids.forEach((id, i) => {
		const size = sizes.get(id) ?? DEFAULT_SIZE
		const column = byColumn ? Math.floor(i / rows) : i % columns
		const row = byColumn ? i % rows : Math.floor(i / columns)
		bounds.set(id, {
			x: column * (cellWidth + gapX) + (cellWidth - size.width) / 2,
			y: top + row * (cellHeight + gapY) + (cellHeight - size.height) / 2,
			width: size.width,
			height: size.height,
		})
	})
	return top + rows * (cellHeight + gapY) - gapY + COMPONENT_GAP
}

/**
 * Two nodes can land in the same rank and band — a parallel split whose
 * branches were compacted onto one band, for instance. Push the later ones
 * down in declaration order until the cell is clear.
 */
function separateSameCell(
	graph: SemanticGraph,
	bandLayout: BandLayout,
	bounds: Map<string, Bounds>,
): void {
	const componentOf = new Map<string, number>()
	for (let i = 0; i < graph.components.length; i++) {
		for (const id of graph.components[i] ?? []) componentOf.set(id, i)
	}

	// Scoped per component: components occupy their own vertical space already,
	// so two nodes sharing a rank and band across components do not collide.
	const cells = new Map<string, string[]>()
	for (const node of graph.nodes) {
		const rank = graph.ranks.get(node.id) ?? 0
		const band = bandLayout.bands.get(node.id) ?? 0
		const key = `${componentOf.get(node.id) ?? 0}:${rank}:${band}`
		const list = cells.get(key)
		if (list) list.push(node.id)
		else cells.set(key, [node.id])
	}

	for (const ids of cells.values()) {
		if (ids.length < 2) continue
		let offset = 0
		for (const id of ids) {
			const b = bounds.get(id)
			if (!b) continue
			b.y += offset
			offset += b.height + V_GAP
		}
	}
}

/**
 * Move every node into the lane it belongs to, then size the lanes to their
 * content. Ranks are untouched, so left-to-right flow survives the shift.
 *
 * Nested lane sets keep both levels: leaf lanes take a band each, and an
 * ancestor lane spans the bands of its descendants.
 */
function applyLanes(
	graph: SemanticGraph,
	laneSet: BpmnLaneSet,
	bounds: Map<string, Bounds>,
): Array<{ id: string; bounds: Bounds }> {
	const tree = laneTree(laneSet)
	if (tree.length === 0) return []

	const leaves: LaneNode[] = []
	const collectLeaves = (nodes: LaneNode[]): void => {
		for (const node of nodes) {
			if (node.children.length > 0) collectLeaves(node.children)
			else leaves.push(node)
		}
	}
	collectLeaves(tree)

	const laneOf = new Map<string, LaneNode>()
	for (const leaf of leaves) {
		for (const ref of leaf.refs) laneOf.set(ref, leaf)
	}
	// A data object or store is never a lane member (BPMN lanes hold flow nodes), so it
	// follows the first laned activity wired to it; otherwise it lands below the
	// lanes, outside the pool.
	const dataHome = new Map<string, string>()
	const follow = (ref: string, lane: LaneNode, activity: string): void => {
		if (laneOf.has(ref)) return
		laneOf.set(ref, lane)
		dataHome.set(ref, activity)
	}
	for (const node of graph.nodes) {
		const lane = laneOf.get(node.id)
		if (!lane) continue
		for (const a of node.dataInputAssociations ?? []) {
			for (const ref of a.sourceRefs) follow(ref, lane, node.id)
		}
		for (const a of node.dataOutputAssociations ?? []) {
			if (a.targetRef !== undefined) follow(a.targetRef, lane, node.id)
		}
	}

	const members = new Map<string, string[]>()
	for (const leaf of leaves) members.set(leaf.id, [])
	const orphans: string[] = []
	for (const node of graph.nodes) {
		const lane = laneOf.get(node.id)
		const list = lane ? members.get(lane.id) : undefined
		if (list) list.push(node.id)
		else orphans.push(node.id)
	}

	placeDataUnderActivities(members, dataHome, bounds)

	let minX = Number.POSITIVE_INFINITY
	let maxX = Number.NEGATIVE_INFINITY
	for (const b of bounds.values()) {
		minX = Math.min(minX, b.x)
		maxX = Math.max(maxX, b.x + b.width)
	}
	if (!Number.isFinite(minX)) return []

	const width = maxX - minX + 2 * LANE_PADDING
	const left = minX - LANE_PADDING
	const span = new Map<string, { top: number; bottom: number }>()
	let top = 0

	for (const leaf of leaves) {
		const own = (members.get(leaf.id) ?? [])
			.map((n) => bounds.get(n))
			.filter((b): b is Bounds => b !== undefined)
		let height = 2 * LANE_PADDING + BOUNDARY_SIZE
		if (own.length > 0) {
			const lowest = Math.min(...own.map((b) => b.y))
			height = Math.max(...own.map((b) => b.y + b.height)) - lowest + 2 * LANE_PADDING
			const shift = top + LANE_PADDING - lowest
			for (const b of own) b.y += shift
		}
		span.set(leaf.id, { top, bottom: top + height })
		top += height
	}

	// Unclaimed nodes keep a band of their own rather than being attributed to a
	// lane they are not a member of.
	if (orphans.length > 0) {
		const own = orphans.map((n) => bounds.get(n)).filter((b): b is Bounds => b !== undefined)
		if (own.length > 0) {
			const shift = top + LANE_PADDING - Math.min(...own.map((b) => b.y))
			for (const b of own) b.y += shift
		}
	}

	const slots: Array<{ id: string; bounds: Bounds }> = []
	const emit = (nodes: LaneNode[]): { top: number; bottom: number } | null => {
		let extent: { top: number; bottom: number } | null = null
		for (const node of nodes) {
			const own = node.children.length > 0 ? emit(node.children) : (span.get(node.id) ?? null)
			if (!own) continue
			if (node.children.length > 0) span.set(node.id, own)
			slots.push({
				id: node.id,
				bounds: { x: left, y: own.top, width, height: own.bottom - own.top },
			})
			extent = extent
				? { top: Math.min(extent.top, own.top), bottom: Math.max(extent.bottom, own.bottom) }
				: own
		}
		return extent
	}
	emit(tree)

	// Outermost first, so a parent lane is drawn behind the lanes it contains.
	return slots.sort((a, b) => b.bounds.height - a.bounds.height || a.bounds.y - b.bounds.y)
}

/**
 * Puts each lane's data objects and stores in a row under the lane's flow nodes,
 * each centred below the activity it is wired to, so the lane grows by one row
 * instead of stretching to wherever the data was ranked.
 */
function placeDataUnderActivities(
	members: Map<string, string[]>,
	dataHome: Map<string, string>,
	bounds: Map<string, Bounds>,
): void {
	for (const ids of members.values()) {
		const flow = ids.filter((id) => !dataHome.has(id)).map((id) => bounds.get(id))
		const homeX = (id: string) => bounds.get(dataHome.get(id) ?? "")?.x ?? 0
		const data = ids.filter((id) => dataHome.has(id)).sort((a, b) => homeX(a) - homeX(b))
		if (data.length === 0 || flow.length === 0) continue
		const bottom = Math.max(...flow.map((b) => (b ? b.y + b.height : 0)))
		let right = Number.NEGATIVE_INFINITY
		for (const id of data) {
			const b = bounds.get(id)
			const home = bounds.get(dataHome.get(id) ?? "")
			if (!b || !home) continue
			b.x = Math.max(home.x + home.width / 2 - b.width / 2, right + H_GAP / 2)
			b.y = bottom + V_GAP / 2
			right = b.x + b.width
		}
	}
}

interface LaneNode {
	id: string
	refs: string[]
	children: LaneNode[]
}

function laneTree(laneSet: BpmnLaneSet): LaneNode[] {
	return laneSet.lanes.map((lane) => ({
		id: lane.id,
		refs: lane.flowNodeRefs,
		children: lane.childLaneSet ? laneTree(lane.childLaneSet) : [],
	}))
}

/**
 * Dock boundary events on their host's edge — escalation on top, everything
 * else on the bottom — spread along it. Events sharing a side are ordered by
 * how far out from that border their handler ended up, then how far it runs —
 * farthest first, so outer slots serve outer paths and the routes nest.
 * The side comes from {@link boundarySide}, the rule that also placed the
 * handler's band, so a handler is never routed around its own host.
 */
function dockBoundaryEvents(
	graph: SemanticGraph,
	bounds: Map<string, Bounds>,
	titled: ReadonlySet<string>,
): void {
	for (const [hostId, events] of graph.attachers) {
		const host = bounds.get(hostId)
		if (!host) continue

		const sides = new Map<"top" | "bottom", BpmnBoundaryEvent[]>()
		for (const event of events) {
			const side = boundarySide(event, titled.has(hostId)) === -1 ? "top" : "bottom"
			const list = sides.get(side)
			if (list) list.push(event)
			else sides.set(side, [event])
		}

		for (const [side, list] of sides) {
			const ordered = [...list].sort(
				(a, b) =>
					handlerDepth(graph, bounds, hostId, host, side, b.id) -
						handlerDepth(graph, bounds, hostId, host, side, a.id) ||
					handlerReach(graph, b.id) - handlerReach(graph, a.id),
			)
			const n = ordered.length
			for (let i = 0; i < n; i++) {
				const event = ordered[i]
				if (!event) continue
				bounds.set(event.id, {
					x: host.x + ((i + 1) * host.width) / (n + 1) - BOUNDARY_SIZE / 2,
					y: (side === "top" ? host.y : host.y + host.height) - BOUNDARY_SIZE / 2,
					width: BOUNDARY_SIZE,
					height: BOUNDARY_SIZE,
				})
			}
		}
	}
}

/**
 * How far out from the docked border the handler of a boundary event sits,
 * measured on the final positions (after lanes, which can reorder handlers
 * against their bands). Negative when the handler lies behind the border.
 *
 * Each handler leaves its event straight out and turns toward its target, so
 * the event docked outermost has to serve the farthest handler; otherwise its
 * turn cuts across the stems of the events docked inside it.
 */
function handlerDepth(
	graph: SemanticGraph,
	bounds: Map<string, Bounds>,
	hostId: string,
	host: Bounds,
	side: "top" | "bottom",
	eventId: string,
): number {
	let depth = Number.NEGATIVE_INFINITY
	// Flows out of a boundary event are keyed by its host (see graph.ts).
	for (const flow of graph.outgoing.get(hostId) ?? []) {
		if (flow.sourceRef !== eventId) continue
		const target = bounds.get(flow.targetRef)
		if (!target) continue
		const centre = target.y + target.height / 2
		depth = Math.max(depth, side === "top" ? host.y - centre : centre - (host.y + host.height))
	}
	return Number.isFinite(depth) ? depth : 0
}

/** How far the handler of a boundary event runs, in ranks. */
function handlerReach(graph: SemanticGraph, eventId: string): number {
	let reach = 0
	for (const [, flows] of graph.outgoing) {
		for (const flow of flows) {
			if (flow.sourceRef !== eventId) continue
			reach = Math.max(reach, graph.ranks.get(flow.targetRef) ?? 0)
		}
	}
	return reach
}
