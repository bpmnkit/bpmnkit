import type { BpmnBoundaryEvent, BpmnSequenceFlow } from "../../bpmn/bpmn-model.js"
import { routeOrthogonal, sidePorts } from "../orthogonal.js"
import type { SemanticGraph } from "../semantic/graph.js"
import type { Bounds, LayoutEdge, Waypoint } from "../types.js"

/** Clearance of a boundary handler's stem and of a loop corridor from the shapes it passes. */
const STEM = 20
/** Spacing between parallel loop corridors. */
const LOOP_STEP = 10

const GATEWAYS = new Set([
	"exclusiveGateway",
	"parallelGateway",
	"inclusiveGateway",
	"eventBasedGateway",
	"complexGateway",
])

/**
 * How one forward flow runs, decided on centre lines before any x exists:
 * `ys[i]` is the line it follows through chain element `i`, and every change
 * of line between two columns is a jog on a track in the gutter between them.
 */
export interface Plan {
	flow: BpmnSequenceFlow
	chain: string[]
	ranks: number[]
	ys: number[]
	/** right: out of the source's right side; side: a split's top or bottom; event / stem: out of a boundary event. */
	exit: "right" | "side" | "event" | "stem" | "stack"
	/** left: into the target's left side; side: into a join's top or bottom. */
	entry: "left" | "side"
}

/** A vertical run in the gutter in front of column `gutter`. */
export interface Jog {
	flow: string
	gutter: number
	from: number
	to: number
}

export interface PlanInput {
	graph: SemanticGraph
	/** Centre y of every chain element (nodes and dummies). */
	y: Map<string, number>
	rank: Map<string, number>
	/** Real nodes per column, for clear-column checks. */
	columns: Map<number, string[]>
	height: (id: string) => number
	/** +1 when the boundary event docks below its host, -1 above. */
	sideOf: (eventId: string) => number
}

function forwardCount(graph: SemanticGraph, id: string, out: boolean): number {
	const flows = (out ? graph.outgoing.get(id) : graph.incoming.get(id)) ?? []
	return flows.filter((f) => !graph.backEdges.has(f.id)).length
}

/** No other node of column `rank` sits between the two lines. */
function columnClear(
	input: PlanInput,
	rank: number,
	self: string,
	y1: number,
	y2: number,
): boolean {
	const lo = Math.min(y1, y2)
	const hi = Math.max(y1, y2)
	for (const id of input.columns.get(rank) ?? []) {
		if (id === self) continue
		const y = input.y.get(id) ?? 0
		const h = input.height(id) / 2
		if (y + h > lo && y - h < hi) return false
	}
	return true
}

export function planFlow(input: PlanInput, flow: BpmnSequenceFlow, chain: string[]): Plan {
	const { graph } = input
	const ranks = chain.map((id) => input.rank.get(id) ?? 0)
	const ys = chain.map((id) => input.y.get(id) ?? 0)
	const n = chain.length
	const src = chain[0] as string
	const tgt = chain[n - 1] as string
	let exit: Plan["exit"] = "right"
	const event = graph.byId.get(flow.sourceRef)
	if (n === 2 && ranks[0] === ranks[1]) {
		return { flow, chain, ranks, ys, exit: "stack", entry: "side" }
	}
	if (event?.type === "boundaryEvent") {
		const side = input.sideOf(flow.sourceRef)
		const port = (ys[0] as number) + side * (input.height(src) / 2 + 18)
		const next = ys[1] as number
		if (side * (next - port) >= STEM && columnClear(input, ranks[0] as number, src, port, next)) {
			exit = "event"
			ys[0] = next
		} else {
			exit = "stem"
			ys[0] = port + side * STEM
		}
	} else if (
		GATEWAYS.has(graph.byId.get(src)?.type ?? "") &&
		forwardCount(graph, src, true) > 1 &&
		ys[1] !== ys[0] &&
		columnClear(input, ranks[0] as number, src, ys[0] as number, ys[1] as number)
	) {
		exit = "side"
		ys[0] = ys[1] as number
	}
	let entry: Plan["entry"] = "left"
	if (
		n > 1 &&
		GATEWAYS.has(graph.byId.get(tgt)?.type ?? "") &&
		forwardCount(graph, tgt, false) > 1 &&
		ys[n - 2] !== ys[n - 1] &&
		columnClear(input, ranks[n - 1] as number, tgt, ys[n - 2] as number, ys[n - 1] as number)
	) {
		entry = "side"
		ys[n - 1] = ys[n - 2] as number
	}
	return { flow, chain, ranks, ys, exit, entry }
}

export function jogsOf(plan: Plan): Jog[] {
	const jogs: Jog[] = []
	for (let i = 0; i + 1 < plan.ys.length; i++) {
		const from = plan.ys[i] as number
		const to = plan.ys[i + 1] as number
		if (from !== to && plan.ranks[i] !== plan.ranks[i + 1])
			jogs.push({ flow: plan.flow.id, gutter: plan.ranks[i + 1] as number, from, to })
	}
	return jogs
}

const within = (y: number, a: number, b: number): boolean =>
	y > Math.min(a, b) && y < Math.max(a, b)

/** Crossings when `a` takes the track left of `b`. */
function cost(a: Jog, b: Jog): number {
	return (within(a.to, b.from, b.to) ? 1 : 0) + (within(b.from, a.from, a.to) ? 1 : 0)
}

/**
 * Order one gutter's jogs left to right: from top-down sorted entry lines,
 * swap neighbours while that saves crossings.
 */
export function orderTracks(jogs: Jog[]): Jog[] {
	const out = [...jogs].sort((a, b) => a.from - b.from || a.to - b.to)
	for (let pass = 0; pass < out.length; pass++) {
		let swapped = false
		for (let i = 0; i + 1 < out.length; i++) {
			const a = out[i] as Jog
			const b = out[i + 1] as Jog
			if (cost(b, a) < cost(a, b)) {
				out[i] = b
				out[i + 1] = a
				swapped = true
			}
		}
		if (!swapped) break
	}
	return out
}

/** The polyline of a planned flow, once columns and tracks have x positions. */
export function drawPlan(
	plan: Plan,
	bounds: Map<string, Bounds>,
	trackX: (flow: string, gutter: number) => number,
): Waypoint[] {
	const src = bounds.get(plan.chain[0] as string) as Bounds
	const tgt = bounds.get(plan.chain[plan.chain.length - 1] as string) as Bounds
	const ys = plan.ys
	const n = ys.length
	const pts: Waypoint[] = []
	const cx = (b: Bounds): number => b.x + b.width / 2
	const cy = (b: Bounds): number => b.y + b.height / 2
	if (plan.exit === "stack") {
		const from = bounds.get(plan.flow.sourceRef) ?? src
		const down = cy(tgt) > cy(from)
		const a = { x: cx(from), y: down ? from.y + from.height : from.y }
		const b = { x: cx(tgt), y: down ? tgt.y : tgt.y + tgt.height }
		if (a.x === b.x) return [a, b]
		const mid = (a.y + b.y) / 2
		return [a, { x: a.x, y: mid }, { x: b.x, y: mid }, b]
	}
	if (plan.exit === "right") {
		pts.push({ x: src.x + src.width, y: ys[0] as number })
	} else if (plan.exit === "side") {
		pts.push({ x: cx(src), y: (ys[0] as number) > cy(src) ? src.y + src.height : src.y })
		pts.push({ x: cx(src), y: ys[0] as number })
	} else {
		const ev = bounds.get(plan.flow.sourceRef) as Bounds
		pts.push({ x: cx(ev), y: (ys[0] as number) > cy(ev) ? ev.y + ev.height : ev.y })
		pts.push({ x: cx(ev), y: ys[0] as number })
	}
	for (let i = 0; i + 1 < n; i++) {
		if (ys[i] === ys[i + 1]) continue
		const x = trackX(plan.flow.id, plan.ranks[i + 1] as number)
		pts.push({ x, y: ys[i] as number }, { x, y: ys[i + 1] as number })
	}
	if (plan.entry === "left") {
		pts.push({ x: tgt.x, y: ys[n - 1] as number })
	} else {
		pts.push({ x: cx(tgt), y: ys[n - 1] as number })
		pts.push({ x: cx(tgt), y: (ys[n - 1] as number) > cy(tgt) ? tgt.y + tgt.height : tgt.y })
	}
	return collapse(pts)
}

function collapse(points: Waypoint[]): Waypoint[] {
	const out: Waypoint[] = []
	for (const p of points) {
		const last = out[out.length - 1]
		if (last && last.x === p.x && last.y === p.y) continue
		const prev = out[out.length - 2]
		if (
			last &&
			prev &&
			((prev.x === last.x && last.x === p.x) || (prev.y === last.y && last.y === p.y))
		) {
			out[out.length - 1] = p
			continue
		}
		out.push(p)
	}
	return out
}

function segHits(a: Waypoint, b: Waypoint, o: Bounds): boolean {
	const x1 = Math.min(a.x, b.x)
	const x2 = Math.max(a.x, b.x)
	const y1 = Math.min(a.y, b.y)
	const y2 = Math.max(a.y, b.y)
	return x2 > o.x + 1 && x1 < o.x + o.width - 1 && y2 > o.y + 1 && y1 < o.y + o.height - 1
}

function crosses(a: Waypoint, b: Waypoint, c: Waypoint, d: Waypoint): boolean {
	const h1 = a.y === b.y
	const h2 = c.y === d.y
	if (h1 === h2) return false
	const [h, v] = h1
		? [
				[a, b],
				[c, d],
			]
		: [
				[c, d],
				[a, b],
			]
	const [p, q] = h as [Waypoint, Waypoint]
	const [r, s] = v as [Waypoint, Waypoint]
	return (
		r.x > Math.min(p.x, q.x) &&
		r.x < Math.max(p.x, q.x) &&
		p.y > Math.min(r.y, s.y) &&
		p.y < Math.max(r.y, s.y)
	)
}

/** Shapes a flow may touch: its ends, and the host of a boundary source. */
function endsOf(graph: SemanticGraph, flow: BpmnSequenceFlow): Set<string> {
	const ends = new Set([flow.sourceRef, flow.targetRef])
	const source = graph.byId.get(flow.sourceRef)
	if (source?.type === "boundaryEvent") ends.add((source as BpmnBoundaryEvent).attachedToRef)
	return ends
}

export class Router {
	private readonly segments: Array<[Waypoint, Waypoint]> = []
	private readonly loops: Array<{ left: number; right: number; y: number }> = []

	constructor(
		private readonly graph: SemanticGraph,
		private readonly bounds: Map<string, Bounds>,
	) {}

	commit(points: Waypoint[]): void {
		for (let i = 0; i + 1 < points.length; i++) {
			this.segments.push([points[i] as Waypoint, points[i + 1] as Waypoint])
		}
	}

	private hits(points: Waypoint[], ends: ReadonlySet<string>): boolean {
		for (const [id, b] of this.bounds) {
			if (ends.has(id)) continue
			for (let i = 0; i + 1 < points.length; i++) {
				if (segHits(points[i] as Waypoint, points[i + 1] as Waypoint, b)) return true
			}
		}
		return false
	}

	private crossings(points: Waypoint[]): number {
		let n = 0
		for (let i = 0; i + 1 < points.length; i++) {
			for (const [c, d] of this.segments) {
				if (crosses(points[i] as Waypoint, points[i + 1] as Waypoint, c, d)) n++
			}
		}
		return n
	}

	/** Keep a clear route; replace one through a shape with an obstacle-aware search. */
	settle(flow: BpmnSequenceFlow, points: Waypoint[]): Waypoint[] {
		const ends = endsOf(this.graph, flow)
		if (!this.hits(points, ends)) return points
		const found = this.search(flow, ends)
		return found ?? points
	}

	private search(flow: BpmnSequenceFlow, ends: ReadonlySet<string>): Waypoint[] | null {
		const source = this.bounds.get(flow.sourceRef)
		const target = this.bounds.get(flow.targetRef)
		if (!source || !target) return null
		const event = this.graph.byId.get(flow.sourceRef)
		let from = sidePorts(source, { right: 0, top: 20, bottom: 20, left: 80 })
		if (event?.type === "boundaryEvent") {
			const host = this.bounds.get((event as BpmnBoundaryEvent).attachedToRef)
			const onTop = host !== undefined && source.y + source.height / 2 <= host.y + 1
			from = sidePorts(source, {
				top: onTop ? 0 : Number.POSITIVE_INFINITY,
				bottom: onTop ? Number.POSITIVE_INFINITY : 0,
				left: Number.POSITIVE_INFINITY,
				right: Number.POSITIVE_INFINITY,
			})
		}
		const obstacles: Bounds[] = []
		for (const [id, b] of this.bounds) if (!ends.has(id)) obstacles.push(b)
		return routeOrthogonal({
			from,
			to: sidePorts(target, { left: 0, top: 20, bottom: 20, right: 80 }),
			obstacles,
			crossings: (a, b) => this.crossings([a, b]),
		})
	}

	/**
	 * A flow back to an earlier column: out of the source's bottom (or top),
	 * along the nearest clear corridor past both ends, into the target's
	 * bottom (or top). The side with fewer crossings wins, then the shorter.
	 */
	loop(flow: BpmnSequenceFlow): Waypoint[] | null {
		const source = this.bounds.get(flow.sourceRef)
		const target = this.bounds.get(flow.targetRef)
		if (!source || !target) return null
		const ends = endsOf(this.graph, flow)
		const sx = source.x + source.width / 2
		const tx = target.x + target.width / 2
		if (flow.sourceRef === flow.targetRef) {
			const right = source.x + source.width
			const y = source.y + source.height + STEM
			return [
				{ x: right, y: source.y + source.height / 2 },
				{ x: right + STEM, y: source.y + source.height / 2 },
				{ x: right + STEM, y },
				{ x: sx, y },
				{ x: sx, y: source.y + source.height },
			]
		}
		const event = this.graph.byId.get(flow.sourceRef)
		let sides = [1, -1]
		if (event?.type === "boundaryEvent") {
			const host = this.bounds.get((event as BpmnBoundaryEvent).attachedToRef)
			const onTop = host !== undefined && source.y + source.height / 2 <= host.y + 1
			sides = [onTop ? -1 : 1]
		}
		const left = Math.min(sx, tx)
		const right = Math.max(sx, tx)
		let best: { points: Waypoint[]; crossings: number; length: number; y: number } | null = null
		for (const side of sides) {
			const edgeOf = (b: Bounds): number => (side > 0 ? b.y + b.height : b.y)
			const start =
				side > 0
					? Math.max(edgeOf(source), edgeOf(target))
					: Math.min(edgeOf(source), edgeOf(target))
			const candidates = [start + side * STEM]
			for (const [id, b] of this.bounds) {
				if (ends.has(id) || b.x > right || b.x + b.width < left) continue
				const e = edgeOf(b) + side * STEM
				if (side * (e - start) > 0) candidates.push(e)
			}
			candidates.sort((a, b) => side * (a - b))
			for (const c of candidates) {
				let y = c
				while (
					this.loops.some((l) => Math.abs(l.y - y) < LOOP_STEP && l.left < right && left < l.right)
				) {
					y += side * LOOP_STEP
				}
				const points = [
					{ x: sx, y: edgeOf(source) },
					{ x: sx, y },
					{ x: tx, y },
					{ x: tx, y: edgeOf(target) },
				]
				if (this.hits(points, ends)) continue
				const crossings = this.crossings(points)
				const length = Math.abs(y - edgeOf(source)) + Math.abs(y - edgeOf(target))
				if (
					!best ||
					crossings < best.crossings ||
					(crossings === best.crossings && length < best.length)
				) {
					best = { points, crossings, length, y }
				}
				break
			}
		}
		if (!best) return this.search(flow, ends)
		this.loops.push({ left, right, y: best.y })
		return best.points
	}
}

export function edgeOf(flow: BpmnSequenceFlow, waypoints: Waypoint[]): LayoutEdge {
	const edge: LayoutEdge = {
		id: flow.id,
		sourceRef: flow.sourceRef,
		targetRef: flow.targetRef,
		waypoints: collapse(waypoints),
	}
	if (flow.name) edge.label = flow.name
	return edge
}
