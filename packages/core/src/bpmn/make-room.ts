import { sizeOf } from "../layout/semantic/place.js"
import type {
	BpmnDefinitions,
	BpmnDiShape,
	BpmnFlowElement,
	BpmnSequenceFlow,
} from "./bpmn-model.js"
import { isContainerType } from "./element-shape.js"

/** Horizontal space left per inserted node, on top of its width. */
const GAP = 50

/** What {@link makeRoom} moved. */
export interface MakeRoomResult {
	/** A copy of the input with the shifted shapes; the input is not changed. */
	definitions: BpmnDefinitions
	/** One entry per insertion point: the node new ones follow, and how far right the rest moved. */
	shifted: Array<{ after: string; dx: number }>
}

interface Scope {
	elements: BpmnFlowElement[]
	flows: BpmnSequenceFlow[]
}

function* scopes(elements: BpmnFlowElement[], flows: BpmnSequenceFlow[]): Generator<Scope> {
	yield { elements, flows }
	for (const el of elements) {
		const inner = el as unknown as {
			flowElements?: BpmnFlowElement[]
			sequenceFlows?: BpmnSequenceFlow[]
		}
		if (inner.flowElements) yield* scopes(inner.flowElements, inner.sequenceFlows ?? [])
	}
}

/**
 * Makes space for nodes inserted into a path of a laid-out diagram, the way a
 * modeler's "make space" does: every shape right of the node a new path leaves
 * from moves right by the width the new nodes need on their longest path, less
 * the room already free on that row; pools, lanes and expanded
 * sub-processes spanning that point grow by as much. Run it before
 * {@link placeNewShapes}, which then finds room next to the anchor instead of
 * drawing the new nodes over the old ones.
 *
 * Only new nodes on a path count (reached by sequence flows from a drawn node
 * that is not a boundary event): an exception path hangs below its task and
 * needs no horizontal room.
 */
export function makeRoom(input: BpmnDefinitions): MakeRoomResult {
	const defs = structuredClone(input)
	const result: MakeRoomResult = { definitions: defs, shifted: [] }
	const shapes = defs.diagrams.flatMap((d) => d.plane.shapes)
	const shapeOf = new Map(shapes.map((s) => [s.bpmnElement, s]))
	if (shapes.length === 0) return result

	// Shapes that may contain others: they grow across the insertion point instead of moving.
	const containers = new Set<string>()
	for (const c of defs.collaborations) for (const p of c.participants) containers.add(p.id)
	for (const process of defs.processes) {
		const lanes = (set: typeof process.laneSet): void => {
			for (const lane of set?.lanes ?? []) {
				containers.add(lane.id)
				lanes(lane.childLaneSet)
			}
		}
		lanes(process.laneSet)
		for (const scope of scopes(process.flowElements, process.sequenceFlows))
			for (const el of scope.elements) if (isContainerType(el.type)) containers.add(el.id)
	}

	const anchors: Array<{ shape: BpmnDiShape; after: string; dx: number }> = []
	for (const process of defs.processes) {
		for (const scope of scopes(process.flowElements, process.sequenceFlows)) {
			const byId = new Map(scope.elements.map((e) => [e.id, e]))
			const isNew = (id: string) => {
				const el = byId.get(id)
				return el !== undefined && !shapeOf.has(id) && el.type !== "boundaryEvent"
			}
			for (const el of scope.elements) {
				const shape = shapeOf.get(el.id)
				if (shape === undefined || el.type === "boundaryEvent") continue
				// The new nodes reachable from this drawn node through new nodes only.
				const chain = new Set<string>()
				const queue = scope.flows
					.filter((f) => f.sourceRef === el.id && isNew(f.targetRef))
					.map((f) => f.targetRef)
				while (queue.length > 0) {
					const id = queue.shift() ?? ""
					if (chain.has(id)) continue
					chain.add(id)
					for (const f of scope.flows)
						if (f.sourceRef === id && isNew(f.targetRef)) queue.push(f.targetRef)
				}
				if (chain.size === 0) continue
				// Branches of a new split stack vertically: only the longest path needs width.
				const memo = new Map<string, number>()
				const longest = (id: string, seen: Set<string>): number => {
					const known = memo.get(id)
					if (known !== undefined) return known
					if (seen.has(id)) return 0
					seen.add(id)
					const node = byId.get(id)
					let next = 0
					for (const f of scope.flows)
						if (f.sourceRef === id && chain.has(f.targetRef))
							next = Math.max(next, longest(f.targetRef, seen))
					seen.delete(id)
					const width = (node ? sizeOf(node).width + GAP : 0) + next
					memo.set(id, width)
					return width
				}
				let need = 0
				for (const f of scope.flows)
					if (f.sourceRef === el.id && chain.has(f.targetRef))
						need = Math.max(need, longest(f.targetRef, new Set()))
				// Room already free on the anchor's row counts: a shape only moves as far as it must.
				const x0 = shape.bounds.x + shape.bounds.width
				const top = shape.bounds.y - 20
				const bottom = shape.bounds.y + shape.bounds.height + 20
				let nextX = Number.POSITIVE_INFINITY
				for (const s of shapes) {
					const b = s.bounds
					if (s === shape || containers.has(s.bpmnElement) || b.x < x0) continue
					if (b.y + b.height > top && b.y < bottom) nextX = Math.min(nextX, b.x)
				}
				const dx = Math.max(0, need + GAP - (nextX - x0))
				if (dx === 0) continue
				anchors.push({ shape, after: el.id, dx })
			}
		}
	}

	// Rightmost first, so a later shift carries the earlier one along instead of splitting it.
	anchors.sort((a, b) => b.shape.bounds.x - a.shape.bounds.x)
	for (const { shape, after, dx } of anchors) {
		const x0 = shape.bounds.x + shape.bounds.width
		for (const s of shapes) {
			const b = s.bounds
			if (b.x >= x0) {
				b.x += dx
				if (s.label?.bounds) s.label.bounds.x += dx
			} else if (b.x + b.width > x0 && containers.has(s.bpmnElement)) {
				// A pool, lane or expanded sub-process spanning the insertion point.
				b.width += dx
			} else if (s.label?.bounds && s.label.bounds.x >= x0) {
				s.label.bounds.x += dx
			}
		}
		for (const edge of defs.diagrams.flatMap((d) => d.plane.edges)) {
			for (const p of edge.waypoints) if (p.x >= x0) p.x += dx
			if (edge.label?.bounds && edge.label.bounds.x >= x0) edge.label.bounds.x += dx
		}
		result.shifted.push({ after, dx })
	}
	return result
}
