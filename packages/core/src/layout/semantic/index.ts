import type {
	BpmnFlowElement,
	BpmnLaneSet,
	BpmnProcess,
	BpmnSequenceFlow,
} from "../../bpmn/bpmn-model.js"
import { placeEdgeLabels } from "../grid/edge-labels.js"
import type { Bounds, LayoutEdge, LayoutNode, LayoutResult } from "../types.js"
import { LABEL_CHAR_WIDTH, LABEL_HEIGHT, LABEL_MIN_WIDTH, SUBPROCESS_PADDING } from "../types.js"
import { assignBands } from "./bands.js"
import { type SemanticGraph, buildSemanticGraph } from "./graph.js"
import { place, sizeOf } from "./place.js"
import { routeFlows } from "./route.js"

/** Padding between an expanded sub-process border and its children. */
const SUB_PADDING = SUBPROCESS_PADDING
/** Extra top padding inside a named expanded sub-process, for its title. */
const TITLE_BAND = 28
/** Gap between an event or gateway and its external label. */
const LABEL_OFFSET = 4

const CONTAINER_TYPES = new Set(["subProcess", "adHocSubProcess", "eventSubProcess", "transaction"])
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
): LayoutResult {
	return semanticLayout(process.flowElements, process.sequenceFlows, process.laneSet, collapsed)
}

export function semanticLayout(
	flowElements: BpmnFlowElement[],
	sequenceFlows: BpmnSequenceFlow[],
	laneSet?: BpmnLaneSet,
	/** Sub-processes drawn collapsed: their contents go on a plane of their own. */
	collapsed: ReadonlySet<string> = new Set(),
): LayoutResult {
	if (flowElements.length === 0) return { nodes: [], edges: [] }

	const graph = buildSemanticGraph(flowElements, sequenceFlows)

	// Children first: an expanded sub-process is sized by what it contains, while
	// a collapsed one stays activity-sized and its contents move to their own plane.
	const childResults = new Map<string, LayoutResult>()
	const planes: Array<{ elementId: string; result: LayoutResult }> = []
	const sizes = new Map<string, { width: number; height: number }>()
	for (const el of graph.nodes) {
		const child = childLayoutOf(el, collapsed)
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
		}
	}

	// A named expanded sub-process draws its title along its top border.
	const titled = new Set(
		[...childResults.keys()].filter((id) => graph.byId.get(id)?.name !== undefined),
	)
	const bandLayout = assignBands(graph, titled)
	const { bounds, lanes, gutterX } = place(graph, bandLayout, sizes, laneSet, titled)
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
			position: bandLayout.bands.get(el.id) ?? 0,
			gridRow: bandLayout.bands.get(el.id) ?? 0,
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

	const edges = routeFlows(graph, sequenceFlows, bounds, bandLayout, gutterX)

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
	placeEdgeLabels(edges, new Map(nodes.map((n) => [n.id, n])))
	return result
}

/** Lay out a container's children and report the size its border needs. */
function childLayoutOf(
	el: BpmnFlowElement,
	collapsed: ReadonlySet<string>,
): { result: LayoutResult; size: { width: number; height: number } } | null {
	if (!CONTAINER_TYPES.has(el.type)) return null
	const container = el as unknown as Container
	if (!container.flowElements || container.flowElements.length === 0) return null

	const result = semanticLayout(
		container.flowElements,
		container.sequenceFlows ?? [],
		container.laneSet,
		collapsed,
	)
	const extent = extentOf(result)
	if (!extent) return null

	const titleBand = el.name !== undefined ? TITLE_BAND : 0
	return {
		result,
		size: {
			width: extent.width + 2 * SUB_PADDING,
			height: extent.height + 2 * SUB_PADDING + titleBand,
		},
	}
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
 * wraps into the wider free gap if that still holds its longest word at a
 * readable width; otherwise it goes beyond the outermost stem on its nearer
 * side, a row farther from the host than the labels already there.
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
			const first = stems[0] ?? 0
			const last = stems[stems.length - 1] ?? 0
			/** Labels already beyond the first / last stem, each a row of its own. */
			const outer = { left: 0, right: 0 }
			const place = (b: Bounds, x: number, width: number, height: number, row = 0): Bounds => {
				const offset = LABEL_OFFSET + row * (LABEL_HEIGHT + LABEL_OFFSET)
				return {
					x,
					y: onTop ? b.y - offset - height : b.y + b.height + offset,
					width,
					height,
				}
			}
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
					if (i === 0) outer.left++
					labels.set(event.id, place(b, stem - LABEL_OFFSET - full, full, LABEL_HEIGHT))
					return
				}
				if (rightRoom >= full) {
					if (i === side.length - 1) outer.right++
					labels.set(event.id, place(b, stem + LABEL_OFFSET, full, LABEL_HEIGHT))
					leftGapTaken = true
					return
				}
				const onRight = rightRoom > leftRoom
				const room = onRight ? rightRoom : leftRoom
				const longestWord = Math.max(...name.split(/\s+/).map((w) => w.length * LABEL_CHAR_WIDTH))
				if (room >= Math.max(longestWord, LABEL_MIN_WIDTH)) {
					const height = wrappedLines(name, room) * LABEL_HEIGHT
					const x = onRight ? stem + LABEL_OFFSET : stem - LABEL_OFFSET - room
					labels.set(event.id, place(b, x, room, height))
					leftGapTaken = onRight
					return
				}
				// No gap here is readable: beyond the outermost stem nothing crosses it.
				const toLeft = i < side.length / 2
				const row = toLeft ? outer.left++ : outer.right++
				const x = toLeft ? first - LABEL_OFFSET - full : last + LABEL_OFFSET
				labels.set(event.id, place(b, x, full, LABEL_HEIGHT, row))
			})
		}
	}
	return labels
}

/**
 * Lines `text` takes when wrapped at word boundaries to `width`. Callers keep
 * `width` at least as wide as the longest word, as the renderers need.
 */
function wrappedLines(text: string, width: number): number {
	const perLine = Math.max(1, Math.floor(width / LABEL_CHAR_WIDTH))
	let lines = 1
	let used = 0
	for (const word of text.split(/\s+/).filter((w) => w.length > 0)) {
		const need = used === 0 ? word.length : used + 1 + word.length
		if (need <= perLine) {
			used = need
			continue
		}
		lines++
		used = word.length
	}
	return lines
}

/** Events and gateways carry their name outside the shape; activities do not. */
function externalLabel(type: string, name: string, bounds: Bounds): Bounds | undefined {
	if (!EXTERNAL_LABEL_TYPES.has(type)) return undefined
	const width = Math.max(name.length * LABEL_CHAR_WIDTH, LABEL_MIN_WIDTH)
	return {
		x: bounds.x + bounds.width / 2 - width / 2,
		y: bounds.y + bounds.height + LABEL_OFFSET,
		width,
		height: LABEL_HEIGHT,
	}
}

export type { Placement } from "./place.js"
