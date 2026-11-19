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
	// Drawn nodes the new path flows into that sit at or left of its anchor, as
	// a lane hand-over column leaves them: they and what follows move right of the path.
	const stragglers: Array<{
		shape: BpmnDiShape
		after: string
		need: number
		down: string[]
		/** For a one-node path into one straggler: the column centre that straggler is stacked on. */
		column?: { id: string; centre: number }
	}> = []
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
				const downstream = reachableDrawn(scope, chain, el.id, byId, shapeOf)
				if (
					downstream.some((id) => {
						const b = shapeOf.get(id)?.bounds
						return b !== undefined && b.x < x0 && !containers.has(id)
					})
				)
					stragglers.push({
						shape,
						after: el.id,
						need,
						down: downstream,
						column: soleExit(scope, chain, shape, byId, shapeOf, downstream),
					})
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
	// Per insertion point, after the global shifts: left-over successors clear the new path.
	for (const { shape, after, need, down, column } of stragglers) {
		const x0 = shape.bounds.x + shape.bounds.width
		let minX = Number.POSITIVE_INFINITY
		for (const id of down) {
			const b = shapeOf.get(id)?.bounds
			if (b && b.x < x0 && !containers.has(id)) minX = Math.min(minX, b.x)
		}
		const target = column ? shapeOf.get(column.id)?.bounds : undefined
		const stacked = column && target ? column.centre - (target.x + target.width / 2) : 0
		const dx = stacked > 0 ? stacked : x0 + need + GAP - minX
		if (!Number.isFinite(minX) || dx <= 0) continue
		const moved = new Set(down)
		for (const id of down) {
			const s = shapeOf.get(id)
			if (!s) continue
			s.bounds.x += dx
			if (s.label?.bounds) s.label.bounds.x += dx
		}
		for (const edge of defs.diagrams.flatMap((d) => d.plane.edges)) {
			const flow = defs.processes
				.flatMap((p) => p.sequenceFlows)
				.find((f) => f.id === edge.bpmnElement)
			if (flow && moved.has(flow.sourceRef) && moved.has(flow.targetRef)) {
				for (const p of edge.waypoints) p.x += dx
				if (edge.label?.bounds) edge.label.bounds.x += dx
			}
		}
		// Pools and lanes grow to hold them.
		for (const s of shapes) {
			const b = s.bounds
			if (
				containers.has(s.bpmnElement) &&
				b.x < x0 &&
				b.x + b.width < x0 + dx + 100 &&
				b.x + b.width > x0
			)
				b.width += dx
		}
		result.shifted.push({ after, dx })
	}
	return result
}

/**
 * A one-node new path whose only exit is a drawn node in another row (a
 * lane hand-over): that node goes under the new node, so the flow stays
 * vertical, as the engine lays such hand-overs out.
 */
function soleExit(
	scope: Scope,
	chain: ReadonlySet<string>,
	anchor: BpmnDiShape,
	byId: ReadonlyMap<string, BpmnFlowElement>,
	shapeOf: ReadonlyMap<string, BpmnDiShape>,
	downstream: readonly string[],
): { id: string; centre: number } | undefined {
	if (chain.size !== 1) return undefined
	const [only] = [...chain]
	const node = only === undefined ? undefined : byId.get(only)
	const exits = scope.flows.filter((f) => f.sourceRef === only && !chain.has(f.targetRef))
	const exit = exits.length === 1 ? exits[0]?.targetRef : undefined
	const b = exit === undefined || !downstream.includes(exit) ? undefined : shapeOf.get(exit)?.bounds
	if (!node || !b) return undefined
	const a = anchor.bounds
	if (b.y < a.y + a.height && b.y + b.height > a.y) return undefined
	return { id: exit as string, centre: a.x + a.width + GAP + sizeOf(node).width / 2 }
}

/**
 * Drawn nodes reached from a new chain's exits, leaving out the ones that
 * lead back into the anchor (a loop's upstream half does not follow the path).
 */
function reachableDrawn(
	scope: Scope,
	chain: ReadonlySet<string>,
	anchor: string,
	byId: ReadonlyMap<string, BpmnFlowElement>,
	shapeOf: ReadonlyMap<string, BpmnDiShape>,
): string[] {
	const upstream = new Set([anchor])
	for (let grew = true; grew; ) {
		grew = false
		for (const f of scope.flows)
			if (upstream.has(f.targetRef) && !upstream.has(f.sourceRef)) {
				upstream.add(f.sourceRef)
				grew = true
			}
	}
	const out: string[] = []
	const seen = new Set<string>()
	const queue = scope.flows
		.filter((f) => chain.has(f.sourceRef) && !chain.has(f.targetRef))
		.map((f) => f.targetRef)
	while (queue.length > 0) {
		const id = queue.shift() ?? ""
		if (seen.has(id) || upstream.has(id) || chain.has(id)) continue
		seen.add(id)
		if (byId.get(id)?.type === "boundaryEvent") continue
		if (shapeOf.has(id)) out.push(id)
		for (const f of scope.flows) if (f.sourceRef === id) queue.push(f.targetRef)
	}
	return out
}
