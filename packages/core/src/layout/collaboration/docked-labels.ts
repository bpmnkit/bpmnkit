/**
 * Labels that sit where a message flow docks.
 *
 * The process layout puts an event's or gateway's name below it by default,
 * before any message flow exists. A message that then docks on that same side
 * runs straight through the name. Mirroring the label to the far side of its
 * element keeps both readable, as long as nothing already sits there.
 */
import type { BpmnBounds, BpmnDiEdge, BpmnDiShape } from "../../bpmn/bpmn-model.js"

/** One end of a message flow: the element it docks on and where. */
export interface MessageDock {
	element: string
	y: number
}

const overlaps = (a: BpmnBounds, b: BpmnBounds): boolean =>
	a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height

function edgeHits(edge: BpmnDiEdge, r: BpmnBounds): boolean {
	const points = edge.waypoints
	for (let i = 1; i < points.length; i++) {
		const p = points[i - 1]
		const q = points[i]
		if (!p || !q) continue
		if (
			Math.max(p.x, q.x) > r.x &&
			Math.min(p.x, q.x) < r.x + r.width &&
			Math.max(p.y, q.y) > r.y &&
			Math.min(p.y, q.y) < r.y + r.height
		)
			return true
	}
	return false
}

/**
 * Move each docked element's label to the side no message docks on. An
 * element docked on both sides, or whose far side is taken by a shape, a label
 * or an edge, keeps its label where it is.
 */
export function flipDockedLabels(
	shapes: BpmnDiShape[],
	edges: readonly BpmnDiEdge[],
	docks: readonly MessageDock[],
	containers: ReadonlySet<string>,
): void {
	const byElement = new Map(shapes.map((s) => [s.bpmnElement, s]))
	const sides = new Map<string, Set<"top" | "bottom">>()
	for (const dock of docks) {
		const shape = byElement.get(dock.element)
		if (!shape) continue
		const b = shape.bounds
		const side =
			Math.abs(dock.y - b.y) <= 1
				? "top"
				: Math.abs(dock.y - (b.y + b.height)) <= 1
					? "bottom"
					: undefined
		if (!side) continue
		const set = sides.get(dock.element) ?? new Set()
		set.add(side)
		sides.set(dock.element, set)
	}

	for (const [element, set] of sides) {
		if (set.size !== 1) continue
		const shape = byElement.get(element)
		const label = shape?.label?.bounds
		if (!shape || !label) continue
		const b = shape.bounds
		const below = label.y >= b.y + b.height - 1
		const above = label.y + label.height <= b.y + 1
		const docked = set.has("bottom") ? "bottom" : "top"
		if (!((docked === "bottom" && below) || (docked === "top" && above))) continue

		const y = below
			? b.y - (label.y - (b.y + b.height)) - label.height
			: b.y + b.height + (b.y - (label.y + label.height))
		const spot: BpmnBounds = { x: label.x, y, width: label.width, height: label.height }
		const taken =
			shapes.some(
				(s) =>
					s !== shape &&
					!containers.has(s.bpmnElement) &&
					(overlaps(s.bounds, spot) || (s.label?.bounds ? overlaps(s.label.bounds, spot) : false)),
			) || edges.some((e) => edgeHits(e, spot))
		if (!taken) label.y = y
	}
}
