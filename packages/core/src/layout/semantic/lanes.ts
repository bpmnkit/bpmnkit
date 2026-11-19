import type { BpmnLane, BpmnLaneSet } from "../../bpmn/bpmn-model.js"
import { pathCrossings } from "../collaboration/crossings.js"
import type { LayoutEdge, LayoutResult } from "../types.js"
import type { SemanticGraph } from "./graph.js"

/** Most lanes whose order is searched exhaustively (n! candidates). */
const MAX_ORDERED_LANES = 6

/** Leaf lane id per flow-node ref, in declaration order; `flat` when no lane nests another. */
export function leafLanes(laneSet: BpmnLaneSet): {
	leaves: string[]
	leafOf: Map<string, string>
	flat: boolean
} {
	const leaves: string[] = []
	const leafOf = new Map<string, string>()
	let flat = true
	const seen = new Set<BpmnLane>()
	const walk = (lanes: BpmnLane[]): void => {
		for (const lane of lanes) {
			// Same guard as the placement's lane tree: a lane set containing itself must throw there, not loop here.
			if (seen.has(lane)) return
			seen.add(lane)
			if (lane.childLaneSet && lane.childLaneSet.lanes.length > 0) {
				flat = false
				walk(lane.childLaneSet.lanes)
				continue
			}
			leaves.push(lane.id)
			for (const ref of lane.flowNodeRefs) if (!leafOf.has(ref)) leafOf.set(ref, lane.id)
		}
	}
	walk(laneSet.lanes)
	return { leaves, leafOf, flat }
}

/** Lane distance summed over every flow that leaves a lane, for a given top-to-bottom order. */
function crossLaneCost(pairs: Array<[string, string]>, pos: Map<string, number>): number {
	let cost = 0
	for (const [a, b] of pairs) cost += Math.abs((pos.get(a) ?? 0) - (pos.get(b) ?? 0))
	return cost
}

/**
 * Top-to-bottom lane order that keeps the flows between lanes short: the
 * declared order unless another order is strictly cheaper (ties keep what the
 * author wrote). Nested lane sets and sets beyond six lanes keep their order.
 */
export function laneOrder(
	graph: SemanticGraph,
	leaves: string[],
	leafOf: ReadonlyMap<string, string>,
	flat: boolean,
): string[] {
	if (!flat || leaves.length < 3 || leaves.length > MAX_ORDERED_LANES) return leaves
	const pairs: Array<[string, string]> = []
	for (const flows of graph.outgoing.values()) {
		for (const f of flows) {
			// A loop or a lane's own end event should not pull the lanes apart.
			if (graph.backEdges.has(f.id) || graph.byId.get(f.targetRef)?.type === "endEvent") continue
			const from = graph.byId.has(f.sourceRef) ? leafOf.get(f.sourceRef) : undefined
			const to = leafOf.get(f.targetRef)
			if (from && to && from !== to) pairs.push([from, to])
		}
	}
	let best = leaves
	let bestCost = crossLaneCost(pairs, new Map(leaves.map((id, i) => [id, i])))
	const rest = (items: string[]): string[][] =>
		items.length <= 1
			? [items]
			: items.flatMap((x, i) =>
					rest([...items.slice(0, i), ...items.slice(i + 1)]).map((r) => [x, ...r]),
				)
	for (const order of rest(leaves)) {
		const cost = crossLaneCost(pairs, new Map(order.map((id, i) => [id, i])))
		if (cost < bestCost) {
			best = order
			bestCost = cost
		}
	}
	return best
}

/**
 * Flows into the lane directly above or below that share their source's
 * column, so the hand-over is a straight vertical run. One per source and
 * direction; the target takes only that flow in, and neither end carries a
 * boundary event (its handler would need the column).
 */
export function laneHandoffs(
	graph: SemanticGraph,
	leafOf: ReadonlyMap<string, string>,
	order: readonly string[],
	/** Only sources with a single way on: plain hand-overs, no splits. */
	plainOnly = false,
): Set<string> {
	const pos = new Map(order.map((id, i) => [id, i]))
	const out = new Set<string>()
	const forwardIn = (id: string): number =>
		(graph.incoming.get(id) ?? []).filter((f) => !graph.backEdges.has(f.id)).length
	for (const node of graph.nodes) {
		const from = leafOf.get(node.id)
		if (from === undefined || graph.attachers.has(node.id)) continue
		const taken = new Set<number>()
		if (plainOnly && (graph.outgoing.get(node.id) ?? []).length !== 1) continue
		for (const flow of graph.outgoing.get(node.id) ?? []) {
			if (graph.backEdges.has(flow.id)) continue
			const to = leafOf.get(flow.targetRef)
			if (to === undefined || graph.attachers.has(flow.targetRef)) continue
			const step = (pos.get(to) ?? 0) - (pos.get(from) ?? 0)
			if (Math.abs(step) !== 1 || taken.has(step) || forwardIn(flow.targetRef) !== 1) continue
			taken.add(step)
			out.add(flow.id)
		}
	}
	return out
}

/**
 * Cost of a laned layout, lower is better, compared term by term (a refinement must not lose in any): flows
 * through a shape that is not theirs, crossings between flows, bends, how far
 * the happy path strays from its mean row, area.
 */
export function laneCost(result: LayoutResult): [number, number, number, number, number, number] {
	const nodes = new Map(result.nodes.map((n) => [n.id, n.bounds]))
	let through = 0
	let bends = 0
	for (const e of result.edges) {
		bends += Math.max(0, e.waypoints.length - 2)
		for (let i = 1; i < e.waypoints.length; i++) {
			const p = e.waypoints[i - 1] as { x: number; y: number }
			const q = e.waypoints[i] as { x: number; y: number }
			for (const [id, b] of nodes) {
				if (id === e.sourceRef || id === e.targetRef) continue
				if (
					Math.max(p.x, q.x) > b.x + 1 &&
					Math.min(p.x, q.x) < b.x + b.width - 1 &&
					Math.max(p.y, q.y) > b.y + 1 &&
					Math.min(p.y, q.y) < b.y + b.height - 1
				)
					through++
			}
		}
	}
	let crossings = 0
	for (let i = 0; i < result.edges.length; i++)
		for (let j = i + 1; j < result.edges.length; j++)
			crossings += pathCrossings(
				(result.edges[i] as LayoutEdge).waypoints,
				(result.edges[j] as LayoutEdge).waypoints,
			)
	let right = 0
	let bottom = 0
	for (const b of nodes.values()) {
		right = Math.max(right, b.x + b.width)
		bottom = Math.max(bottom, b.y + b.height)
	}
	return [through, crossings, bends, happyAxisDev(result), lengthCV(result), right * bottom]
}

/** True when `a` is no worse than `b` in any term and better in at least one. */
export function cheaper(a: readonly number[], b: readonly number[]): boolean {
	let better = false
	for (let i = 0; i < a.length; i++) {
		if ((a[i] as number) > (b[i] as number)) return false
		if ((a[i] as number) < (b[i] as number)) better = true
	}
	return better
}

/**
 * Spread of the rows the first-declared forward path from each start event
 * visits, the way `pnpm layout:score` measures it: lanes in an order that
 * puts the happy path's lanes together score lower.
 */
function happyAxisDev(result: LayoutResult): number {
	const centreY = new Map(result.nodes.map((n) => [n.id, n.bounds.y + n.bounds.height / 2]))
	const devs: number[] = []
	for (const start of result.nodes.filter((n) => n.type === "startEvent")) {
		const seen = new Set([start.id])
		let cur = start.id
		for (;;) {
			const next = result.edges.find((e) => e.sourceRef === cur && !seen.has(e.targetRef))
			if (!next) break
			seen.add(next.targetRef)
			cur = next.targetRef
		}
		const ys = [...seen].map((id) => centreY.get(id)).filter((y): y is number => y !== undefined)
		const mean = ys.reduce((a, b) => a + b, 0) / Math.max(1, ys.length)
		devs.push(Math.sqrt(ys.reduce((a, y) => a + (y - mean) ** 2, 0) / Math.max(1, ys.length)))
	}
	return Math.round(devs.reduce((a, b) => a + b, 0) / Math.max(1, devs.length))
}

/** Lane membership, declared order and the cheaper top-to-bottom order, when there is one. */
export function lanePlan(
	graph: SemanticGraph,
	laneSet: BpmnLaneSet,
): {
	leafOf: Map<string, string>
	order: string[] | undefined
	declared: string[]
	flat: boolean
} {
	const { leaves, leafOf, flat } = leafLanes(laneSet)
	const order = laneOrder(graph, leaves, leafOf, flat)
	return { leafOf, order: flat && order !== leaves ? order : undefined, declared: leaves, flat }
}

/** Coefficient of variation of the flows' path lengths, to two decimals. */
function lengthCV(result: LayoutResult): number {
	const lengths = result.edges.map((e) => {
		let sum = 0
		for (let i = 1; i < e.waypoints.length; i++) {
			const p = e.waypoints[i - 1] as { x: number; y: number }
			const q = e.waypoints[i] as { x: number; y: number }
			sum += Math.abs(p.x - q.x) + Math.abs(p.y - q.y)
		}
		return sum
	})
	const mean = lengths.reduce((a, b) => a + b, 0) / Math.max(1, lengths.length)
	const sd = Math.sqrt(
		lengths.reduce((a, l) => a + (l - mean) ** 2, 0) / Math.max(1, lengths.length),
	)
	return Math.round((100 * sd) / Math.max(1, mean)) / 100
}
