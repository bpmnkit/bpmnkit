/**
 * Labels around message flows, placed after the flows are routed.
 *
 * A message flow's name is what the pools say to each other, so it belongs on
 * the flow where nothing else is: the empty band between two pools. And a flow
 * docking under an event runs straight through the name the event carries
 * below itself, so that name moves above the event (or beside it).
 */
import type { BpmnBounds, BpmnDiEdge, BpmnDiShape, BpmnWaypoint } from "../../bpmn/bpmn-model.js"
import { LABEL_CHAR_WIDTH, LABEL_HEIGHT, LABEL_MIN_WIDTH } from "../types.js"

/** Space between a flow and the label beside it. */
const LABEL_GAP = 4
/** How far a label slides along its segment per try. */
const SLIDE_STEP = 10

function overlaps(a: BpmnBounds, b: BpmnBounds): boolean {
	return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
}

function crosses(p: BpmnWaypoint, q: BpmnWaypoint, b: BpmnBounds): boolean {
	return (
		Math.max(p.x, q.x) > b.x &&
		Math.min(p.x, q.x) < b.x + b.width &&
		Math.max(p.y, q.y) > b.y &&
		Math.min(p.y, q.y) < b.y + b.height
	)
}

function edgeThrough(edge: BpmnDiEdge, b: BpmnBounds): boolean {
	return edge.waypoints.slice(1).some((q, i) => {
		const p = edge.waypoints[i]
		return p !== undefined && crosses(p, q, b)
	})
}

export interface MessageLabelInput {
	shapes: BpmnDiShape[]
	edges: BpmnDiEdge[]
	/** Named message flows by id. */
	names: ReadonlyMap<string, string>
	/** Pools, lanes and expanded sub-processes: drawn around content, not obstacles. */
	containers: ReadonlySet<string>
	/** Pools, top to bottom, for the bands between them. */
	pools: ReadonlySet<string>
}

/**
 * Moves an event's name off the message flow docking on it, then gives each
 * named message flow a label in the band between pools when one is free.
 */
export function placeMessageFlowLabels(input: MessageLabelInput): void {
	const { shapes, edges, names, containers, pools } = input
	const messageEdges = edges.filter((e) => names.has(e.bpmnElement))
	if (messageEdges.length === 0) return
	const solids = shapes.filter((s) => !containers.has(s.bpmnElement)).map((s) => s.bounds)
	const labels = (): BpmnBounds[] => [
		...shapes.flatMap((s) => (s.label?.bounds ? [s.label.bounds] : [])),
		...edges.flatMap((e) => (e.label?.bounds ? [e.label.bounds] : [])),
	]
	const free = (b: BpmnBounds, own: BpmnBounds | undefined) =>
		!solids.some((s) => overlaps(s, b)) &&
		!labels().some((l) => l !== own && overlaps(l, b)) &&
		!edges.some((e) => edgeThrough(e, b))

	for (const shape of shapes) {
		const label = shape.label?.bounds
		if (label === undefined || !messageEdges.some((e) => edgeThrough(e, label))) continue
		const s = shape.bounds
		const cx = s.x + s.width / 2
		const spot = [
			{ x: cx - label.width / 2, y: s.y - LABEL_GAP - label.height },
			{ x: s.x + s.width + LABEL_GAP, y: s.y + s.height },
			{ x: s.x - LABEL_GAP - label.width, y: s.y + s.height },
			{ x: s.x + s.width + LABEL_GAP, y: s.y - label.height },
		]
			.map((p) => ({
				x: Math.round(p.x),
				y: Math.round(p.y),
				width: label.width,
				height: label.height,
			}))
			.find((b) => free(b, label))
		if (spot && shape.label) shape.label.bounds = spot
	}

	const poolBounds = shapes
		.filter((s) => pools.has(s.bpmnElement))
		.map((s) => s.bounds)
		.sort((a, b) => a.y - b.y)
	const bands: Array<{ top: number; bottom: number }> = []
	for (let i = 0; i + 1 < poolBounds.length; i++) {
		const above = poolBounds[i]
		const below = poolBounds[i + 1]
		if (above && below && below.y > above.y + above.height)
			bands.push({ top: above.y + above.height, bottom: below.y })
	}

	for (const edge of messageEdges) {
		const name = names.get(edge.bpmnElement) ?? ""
		const width = Math.max(name.length * LABEL_CHAR_WIDTH, LABEL_MIN_WIDTH)
		const height = LABEL_HEIGHT
		const beside = (x: number, y: number) => [
			{ x: Math.round(x + LABEL_GAP), y: Math.round(y - height / 2), width, height },
			{ x: Math.round(x - LABEL_GAP - width), y: Math.round(y - height / 2), width, height },
		]
		const candidates: BpmnBounds[] = []
		const vertical: Array<{ x: number; top: number; bottom: number }> = []
		for (let i = 0; i + 1 < edge.waypoints.length; i++) {
			const p = edge.waypoints[i]
			const q = edge.waypoints[i + 1]
			if (!p || !q || p.x !== q.x) continue
			vertical.push({ x: p.x, top: Math.min(p.y, q.y), bottom: Math.max(p.y, q.y) })
		}
		// In a band first: nothing else is drawn there.
		for (const v of vertical)
			for (const band of bands)
				if (v.top <= band.top && band.bottom <= v.bottom)
					candidates.push(...beside(v.x, (band.top + band.bottom) / 2))
		// Then along the longest run, from its middle outwards.
		vertical.sort((a, b) => b.bottom - b.top - (a.bottom - a.top))
		for (const v of vertical) {
			const mid = (v.top + v.bottom) / 2
			for (let d = 0; d <= (v.bottom - v.top) / 2; d += SLIDE_STEP)
				candidates.push(...beside(v.x, mid + d), ...beside(v.x, mid - d))
		}
		const spot = candidates.find(
			(b) =>
				!solids.some((s) => overlaps(s, b)) &&
				!labels().some((l) => overlaps(l, b)) &&
				!edges.some((e) => e !== edge && edgeThrough(e, b)),
		)
		const chosen = spot ?? candidates[0]
		if (chosen) edge.label = { bounds: chosen }
	}
}
