import type { BpmnBoundaryEvent, BpmnSequenceFlow } from "../../bpmn/bpmn-model.js"
import { boundarySide } from "../semantic/bands.js"
import type { SemanticGraph } from "../semantic/graph.js"
import {
	COMPONENT_GAP,
	artifactOwnersOf,
	columnGaps,
	dockBoundaryEvents,
	externalLabelWidth,
	placeArtifacts,
} from "../semantic/place.js"
import type { Bounds, LayoutEdge } from "../types.js"
import { LABEL_HEIGHT } from "../types.js"
import { type Extent, yCandidates } from "./coords.js"
import { type Layering, assignLayers, buildLayering, orderLayers, stackedFlows } from "./layers.js"
import {
	type Jog,
	type Plan,
	Router,
	drawPlan,
	edgeOf,
	jogsOf,
	orderTracks,
	planFlow,
} from "./route.js"

/** Gap between an event or gateway and its label below; see `semantic/index.ts`. */
const LABEL_OFFSET = 4
/** How far a docked boundary event hangs past its host's border. */
const BOUNDARY_HANG = 18
/** Spacing between parallel tracks in one gutter. */
const TRACK = 12
/** Gap between loose nodes in their row under the diagram. */
const LOOSE_GAP = 40
const DEFAULT_SIZE = { width: 100, height: 80 }

/** Nominal column pitch, to weigh a flow's horizontal run against its vertical travel. */
const PITCH = 160

/**
 * The candidate whose flows route with the fewest bends; ties go to the more
 * even flow lengths (smallest sum of squares), then the lower one.
 */
function pickY(
	graph: SemanticGraph,
	lg: Layering,
	candidates: Map<string, number>[],
	extent: (id: string) => Extent,
	size: (id: string) => { width: number; height: number },
	sideOf: (eventId: string) => number,
): Map<string, number> {
	const columns = new Map<number, string[]>()
	for (const [id, r] of lg.rank) {
		if (lg.dummies.has(id)) continue
		const list = columns.get(r)
		if (list) list.push(id)
		else columns.set(r, [id])
	}
	const flows = new Map<string, BpmnSequenceFlow>()
	for (const list of graph.outgoing.values()) for (const f of list) flows.set(f.id, f)
	let best = candidates[0] as Map<string, number>
	let bestKey: [number, number, number] = [
		Number.POSITIVE_INFINITY,
		Number.POSITIVE_INFINITY,
		Number.POSITIVE_INFINITY,
	]
	for (const y of candidates) {
		const input = {
			graph,
			y,
			rank: lg.rank,
			columns,
			height: (id: string) => size(id).height,
			sideOf,
		}
		let bends = 0
		let squares = 0
		for (const [id, chain] of lg.chains) {
			const plan = planFlow(input, flows.get(id) as BpmnSequenceFlow, chain)
			const n = chain.length
			if (plan.exit === "stack") {
				const d = Math.abs((plan.ys[1] as number) - (plan.ys[0] as number))
				squares += d * d
				continue
			}
			let travel = 0
			for (let i = 0; i + 1 < n; i++) {
				const d = Math.abs((plan.ys[i + 1] as number) - (plan.ys[i] as number))
				travel += d
				if (d > 0) bends += 2
			}
			if (plan.exit !== "right") {
				bends += 1
				travel += Math.abs((plan.ys[0] as number) - (y.get(chain[0] as string) ?? 0))
			}
			if (plan.entry === "side") {
				bends += 1
				travel += Math.abs((plan.ys[n - 1] as number) - (y.get(chain[n - 1] as string) ?? 0))
			}
			const length = (n - 1) * PITCH + travel
			squares += length * length
		}
		let lo = Number.POSITIVE_INFINITY
		let hi = Number.NEGATIVE_INFINITY
		for (const [id, v] of y) {
			lo = Math.min(lo, v - extent(id).above)
			hi = Math.max(hi, v + extent(id).below)
		}
		const key: [number, number, number] = [bends, squares, hi - lo]
		if (
			key[0] < bestKey[0] ||
			(key[0] === bestKey[0] &&
				(key[1] < bestKey[1] || (key[1] === bestKey[1] && key[2] < bestKey[2])))
		) {
			best = y
			bestKey = key
		}
	}
	return best
}

export interface LayeredPlacement {
	bounds: Map<string, Bounds>
	edges: LayoutEdge[]
	/** 0 for nodes on their component start's line, 1 elsewhere. */
	row: Map<string, number>
}

/**
 * Sugiyama layout of one lane-free scope: columns by longest path with a
 * network-simplex pull, dummy nodes for long flows, median/transpose ordering,
 * Brandes–Köpf centre lines and orthogonal routing with one track per jog in
 * each gutter. Boundary events dock as in the semantic engine; loops run in
 * corridors past both ends.
 */
export function layeredPlace(
	graph: SemanticGraph,
	flows: BpmnSequenceFlow[],
	sizes: Map<string, { width: number; height: number }>,
	titled: ReadonlySet<string>,
	slotArtifacts: boolean,
): LayeredPlacement {
	const size = (id: string): { width: number; height: number } => sizes.get(id) ?? DEFAULT_SIZE
	const sideOf = (eventId: string): number => {
		const event = graph.byId.get(eventId) as BpmnBoundaryEvent
		return boundarySide(event, titled.has(event.attachedToRef))
	}
	const extents = new Map<string, Extent>()
	for (const node of graph.nodes) {
		const h = size(node.id).height
		const label = node.name ? externalLabelWidth(node.type, node.name) : undefined
		extents.set(node.id, {
			above: h / 2,
			below: h / 2 + (label !== undefined ? LABEL_OFFSET + LABEL_HEIGHT : 0),
		})
	}
	for (const [host, events] of graph.attachers) {
		const ext = extents.get(host)
		if (!ext) continue
		const h = size(host).height
		for (const event of events) {
			const reach = h / 2 + BOUNDARY_HANG + (event.name ? LABEL_OFFSET + LABEL_HEIGHT : 0)
			if (sideOf(event.id) > 0) ext.below = Math.max(ext.below, reach)
			else ext.above = Math.max(ext.above, reach)
		}
	}
	const extent = (id: string): Extent => extents.get(id) ?? { above: 0, below: 0 }
	const biasOf = (flow: BpmnSequenceFlow): number =>
		graph.byId.get(flow.sourceRef)?.type === "boundaryEvent" ? sideOf(flow.sourceRef) * 0.5 : 0
	const hasFlow = (id: string): boolean =>
		(graph.outgoing.get(id) ?? []).length > 0 || (graph.incoming.get(id) ?? []).length > 0

	// ── Columns, order and centre lines, per component, stacked top to bottom ──
	const owners = slotArtifacts ? artifactOwnersOf(graph) : new Map<string, string>()
	const loose: string[] = []
	const parts: Layering[] = []
	const y = new Map<string, number>()
	const row = new Map<string, number>()
	graph.ranks.clear()
	let cursor = 0
	graph.components.forEach((all, c) => {
		const members = all.filter((id) => graph.byId.has(id))
		if (members.length === 0) return
		if (members.length === 1 && !hasFlow(members[0] as string)) {
			if (!owners.has(members[0] as string)) loose.push(members[0] as string)
			return
		}
		const start = graph.starts[c] ?? (members[0] as string)
		const stacks = stackedFlows(graph, members, sideOf)
		const rank = assignLayers(graph, members, stacks)
		const lg = buildLayering(graph, members, start, rank, biasOf)
		orderLayers(lg, stacks)
		const ys = pickY(graph, lg, yCandidates(lg, extent), extent, size, sideOf)
		let top = Number.POSITIVE_INFINITY
		let bottom = Number.NEGATIVE_INFINITY
		for (const [id, v] of ys) {
			top = Math.min(top, v - extent(id).above)
			bottom = Math.max(bottom, v + extent(id).below)
		}
		const dy = cursor - top
		for (const [id, v] of ys) y.set(id, Math.round(v + dy))
		for (const [id, r] of lg.rank) if (!lg.dummies.has(id)) graph.ranks.set(id, r)
		const spine = y.get(start)
		for (const id of members) row.set(id, y.get(id) === spine ? 0 : 1)
		cursor = Math.round(bottom + dy) + COMPONENT_GAP
		parts.push(lg)
	})

	// ── Routes on centre lines: which flows jog in which gutter ──
	const columns = new Map<number, string[]>()
	for (const node of graph.nodes) {
		const r = graph.ranks.get(node.id)
		if (r === undefined) continue
		const list = columns.get(r)
		if (list) list.push(node.id)
		else columns.set(r, [node.id])
	}
	const rankOf = new Map<string, number>()
	for (const lg of parts) for (const [id, r] of lg.rank) rankOf.set(id, r)
	const plans: Plan[] = []
	const chainOf = new Map<string, string[]>()
	for (const lg of parts) for (const [flow, chain] of lg.chains) chainOf.set(flow, chain)
	const input = { graph, y, rank: rankOf, columns, height: (id: string) => size(id).height, sideOf }
	for (const flow of flows) {
		const chain = chainOf.get(flow.id)
		if (chain) plans.push(planFlow(input, flow, chain))
	}
	const gutters = new Map<number, Jog[]>()
	for (const plan of plans) {
		for (const jog of jogsOf(plan)) {
			const list = gutters.get(jog.gutter)
			if (list) list.push(jog)
			else gutters.set(jog.gutter, [jog])
		}
	}

	// ── Column x: widest node, gaps wide enough for labels and tracks ──
	const colWidth = new Map<number, number>()
	for (const [r, ids] of columns) {
		for (const id of ids) colWidth.set(r, Math.max(colWidth.get(r) ?? 0, size(id).width))
	}
	const ranks = [...colWidth.keys()].sort((a, b) => a - b)
	const gaps = columnGaps(graph, sizes, colWidth, ranks)
	const colX = new Map<number, number>()
	let x = 0
	for (const [i, r] of ranks.entries()) {
		if (i > 0) {
			const tracks = (gutters.get(r) ?? []).length
			x += Math.max(gaps.get(r) ?? 0, (tracks + 1) * TRACK)
		}
		colX.set(r, x)
		x += colWidth.get(r) ?? 0
	}
	const bounds = new Map<string, Bounds>()
	for (const [r, ids] of columns) {
		for (const id of ids) {
			const s = size(id)
			bounds.set(id, {
				x: (colX.get(r) ?? 0) + ((colWidth.get(r) ?? 0) - s.width) / 2,
				y: (y.get(id) ?? 0) - s.height / 2,
				width: s.width,
				height: s.height,
			})
		}
	}
	const track = new Map<string, number>()
	for (const [g, jogs] of gutters) {
		const i = ranks.indexOf(g)
		const prev = ranks[i - 1]
		if (prev === undefined) continue
		const left = (colX.get(prev) ?? 0) + (colWidth.get(prev) ?? 0)
		const width = (colX.get(g) ?? 0) - left
		orderTracks(jogs).forEach((jog, k, all) => {
			track.set(`${jog.flow}\u0001${g}`, Math.round(left + (width * (k + 1)) / (all.length + 1)))
		})
	}

	// ── Docked events, loose nodes and slotted artifacts ──
	dockBoundaryEvents(graph, bounds, titled)
	let lx = 0
	for (const id of loose) {
		const s = size(id)
		bounds.set(id, { x: lx, y: cursor, width: s.width, height: s.height })
		lx += s.width + LOOSE_GAP
	}
	placeArtifacts(graph, owners, bounds)

	// ── Draw: forward flows on their tracks, then loops around them ──
	const router = new Router(graph, bounds)
	const routes = new Map<string, ReturnType<typeof drawPlan>>()
	for (const plan of plans) {
		const points = router.settle(
			plan.flow,
			drawPlan(plan, bounds, (flow, g) => track.get(`${flow}\u0001${g}`) ?? 0),
		)
		router.commit(points)
		routes.set(plan.flow.id, points)
	}
	for (const flow of flows) {
		if (routes.has(flow.id) || !bounds.has(flow.sourceRef) || !bounds.has(flow.targetRef)) continue
		const points = router.loop(flow)
		if (!points) continue
		router.commit(points)
		routes.set(flow.id, points)
	}
	const edges: LayoutEdge[] = []
	for (const flow of flows) {
		const points = routes.get(flow.id)
		if (points) edges.push(edgeOf(flow, points))
	}
	return { bounds, edges, row }
}
