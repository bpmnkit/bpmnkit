import type { BpmnBoundaryEvent, BpmnSequenceFlow } from "../../bpmn/bpmn-model.js"
import type { SemanticGraph } from "../semantic/graph.js"

/** One edge between neighbouring columns: a whole flow, or one piece of a long one. */
export interface Segment {
	from: string
	to: string
	flow: string
	/**
	 * Pull toward the side a boundary event docks on (+0.5 below, -0.5 above),
	 * so its handler orders past the host's own successor. Non-zero segments are
	 * never aligned straight: the flow leaves the event, not the host's centre.
	 */
	bias: number
}

/**
 * A flow drawn as one vertical drop inside a column: `mover` sits right under
 * (`side` 1) or over (-1) `anchor`, in the same column.
 */
export interface Stack {
	flow: string
	mover: string
	anchor: string
	side: number
}

/** A component cut into columns, long flows carried by dummy nodes. */
export interface Layering {
	/** Columns left to right, each top to bottom: node ids and dummy ids. */
	layers: string[][]
	rank: Map<string, number>
	/** Dummy id → the flow it carries. */
	dummies: Map<string, string>
	succ: Map<string, Segment[]>
	pred: Map<string, Segment[]>
	/** Forward flow id → its chain of ids, source (the host for a boundary event) to target. */
	chains: Map<string, string[]>
}

/** Dummy ids cannot clash with element ids: XML ids never hold a NUL. */
const DUMMY = "\u0000"
/** Ordering sweeps: alternating down/up passes; stop early once crossing-free. */
const SWEEPS = 24
const TRANSPOSE_PASSES = 8

/** Forward flows out of `id` within the component (back edges and self-loops excluded). */
function forward(graph: SemanticGraph, inSet: ReadonlySet<string>, id: string): BpmnSequenceFlow[] {
	return (graph.outgoing.get(id) ?? []).filter(
		(f) => !graph.backEdges.has(f.id) && inSet.has(f.targetRef) && f.targetRef !== id,
	)
}

/**
 * Flows that stay inside one column (the P2 rules, as layering constraints):
 * - a one-node detour of a split that feeds the split's other target stacks
 *   under that target and flows up into it;
 * - the first boundary event of a host whose handler has no other way in drops
 *   its handler straight under (or over) the host.
 */
export function stackedFlows(
	graph: SemanticGraph,
	members: string[],
	sideOf: (eventId: string) => number,
): Map<string, Stack> {
	const inSet = new Set(members)
	const stacks = new Map<string, Stack>()
	const moved = new Set<string>()
	const anchored = new Set<string>()
	const take = (stack: Stack): void => {
		const key = `${stack.anchor}\u0001${stack.side}`
		if (moved.has(stack.mover) || moved.has(stack.anchor) || anchored.has(key)) return
		if (anchored.has(`${stack.mover}\u00011`) || anchored.has(`${stack.mover}\u0001-1`)) return
		stacks.set(stack.flow, stack)
		moved.add(stack.mover)
		anchored.add(key)
	}
	for (const id of members) {
		for (const f of forward(graph, inSet, id)) {
			const source = graph.byId.get(f.sourceRef)
			if (source?.type === "boundaryEvent") {
				const into = graph.incoming.get(f.targetRef) ?? []
				const target = graph.byId.get(f.targetRef)
				const host = id
				const first = (graph.attachers.get(host) ?? [])[0]
				if (
					into.length === 1 &&
					first?.id === f.sourceRef &&
					target &&
					!GATEWAYS.has(target.type)
				) {
					take({ flow: f.id, mover: f.targetRef, anchor: host, side: sideOf(f.sourceRef) })
				}
				continue
			}
			const into = graph.incoming.get(id) ?? []
			const out = graph.outgoing.get(id) ?? []
			if (into.length !== 1 || out.length !== 1) continue
			const split = into[0] as BpmnSequenceFlow
			if (graph.backEdges.has(split.id)) continue
			if (graph.byId.get(split.sourceRef)?.type === "boundaryEvent") continue
			const sibling = (graph.outgoing.get(split.sourceRef) ?? []).some(
				(g) => g.targetRef === f.targetRef && g !== split && !graph.backEdges.has(g.id),
			)
			if (sibling) take({ flow: f.id, mover: id, anchor: f.targetRef, side: 1 })
		}
	}
	return stacks
}

const GATEWAYS = new Set([
	"exclusiveGateway",
	"parallelGateway",
	"inclusiveGateway",
	"eventBasedGateway",
	"complexGateway",
])

/** Kahn order over forward flows; ties keep declaration order. */
function topoOrder(graph: SemanticGraph, members: string[], inSet: ReadonlySet<string>): string[] {
	const indeg = new Map<string, number>()
	for (const id of members) indeg.set(id, 0)
	for (const id of members) {
		for (const f of forward(graph, inSet, id))
			indeg.set(f.targetRef, (indeg.get(f.targetRef) ?? 0) + 1)
	}
	const queue = members.filter((id) => indeg.get(id) === 0)
	const order: string[] = []
	for (let i = 0; i < queue.length; i++) {
		const id = queue[i] as string
		order.push(id)
		for (const f of forward(graph, inSet, id)) {
			const left = (indeg.get(f.targetRef) ?? 0) - 1
			indeg.set(f.targetRef, left)
			if (left === 0) queue.push(f.targetRef)
		}
	}
	return order
}

/**
 * Longest-path columns, then a local network-simplex move: a node with more
 * flows out than in slides right up to its nearest successor (a second start
 * event, a split feeding a far join), one with more in than out slides left.
 * Total flow length only shrinks, which keeps long dummy chains rare.
 */
export function assignLayers(
	graph: SemanticGraph,
	members: string[],
	stacks: ReadonlyMap<string, Stack>,
): Map<string, number> {
	const inSet = new Set(members)
	const order = topoOrder(graph, members, inSet)
	const step = (f: BpmnSequenceFlow): number => (stacks.has(f.id) ? 0 : 1)
	const preds = new Map<string, BpmnSequenceFlow[]>()
	for (const id of members) preds.set(id, [])
	for (const id of members) {
		for (const f of forward(graph, inSet, id)) preds.get(f.targetRef)?.push(f)
	}
	const sourceOf = (f: BpmnSequenceFlow): string => {
		const s = graph.byId.get(f.sourceRef)
		return s?.type === "boundaryEvent" ? (s as BpmnBoundaryEvent).attachedToRef : f.sourceRef
	}
	const rank = new Map<string, number>()
	for (const id of members) rank.set(id, 0)
	for (const id of order) {
		const r = rank.get(id) ?? 0
		for (const f of forward(graph, inSet, id)) {
			if ((rank.get(f.targetRef) ?? 0) < r + step(f)) rank.set(f.targetRef, r + step(f))
		}
	}
	for (let pass = 0; pass < 8; pass++) {
		let changed = false
		for (const id of order) {
			const ins = preds.get(id) ?? []
			const outs = forward(graph, inSet, id)
			const r = rank.get(id) ?? 0
			if (outs.length > ins.length) {
				let hi = Number.POSITIVE_INFINITY
				for (const f of outs) hi = Math.min(hi, (rank.get(f.targetRef) ?? 0) - step(f))
				if (hi > r) {
					rank.set(id, hi)
					changed = true
				}
			} else if (ins.length > outs.length && ins.length > 0) {
				let lo = 0
				for (const f of ins) lo = Math.max(lo, (rank.get(sourceOf(f)) ?? 0) + step(f))
				if (lo < r) {
					rank.set(id, lo)
					changed = true
				}
			}
		}
		if (!changed) break
	}
	let min = Number.POSITIVE_INFINITY
	for (const id of members) min = Math.min(min, rank.get(id) ?? 0)
	if (Number.isFinite(min) && min !== 0) {
		for (const id of members) rank.set(id, (rank.get(id) ?? 0) - min)
	}
	return rank
}

/**
 * Build the columns with dummy nodes, seeded in depth-first discovery order
 * from the component's start so the first branch starts on top.
 */
export function buildLayering(
	graph: SemanticGraph,
	members: string[],
	start: string,
	rank: Map<string, number>,
	biasOf: (flow: BpmnSequenceFlow) => number,
): Layering {
	const inSet = new Set(members)
	let maxRank = 0
	for (const id of members) maxRank = Math.max(maxRank, rank.get(id) ?? 0)
	const layers: string[][] = []
	for (let r = 0; r <= maxRank; r++) layers.push([])
	const lg: Layering = {
		layers,
		rank: new Map(rank),
		dummies: new Map(),
		succ: new Map(),
		pred: new Map(),
		chains: new Map(),
	}
	const seen = new Set<string>()
	const put = (id: string): void => {
		layers[lg.rank.get(id) ?? 0]?.push(id)
		lg.succ.set(id, [])
		lg.pred.set(id, [])
	}
	const link = (from: string, to: string, flow: string, bias: number): void => {
		const seg: Segment = { from, to, flow, bias }
		lg.succ.get(from)?.push(seg)
		lg.pred.get(to)?.push(seg)
	}
	const visit = (id: string): void => {
		seen.add(id)
		put(id)
		for (const f of forward(graph, inSet, id)) {
			const r0 = lg.rank.get(id) ?? 0
			const r1 = lg.rank.get(f.targetRef) ?? 0
			const chain = [id]
			for (let r = r0 + 1; r < r1; r++) {
				const d = `${DUMMY}${f.id}${DUMMY}${r}`
				lg.rank.set(d, r)
				lg.dummies.set(d, f.id)
				put(d)
				chain.push(d)
			}
			chain.push(f.targetRef)
			lg.chains.set(f.id, chain)
			if (!seen.has(f.targetRef)) visit(f.targetRef)
		}
	}
	const roots = [
		start,
		...members.filter((id) => (graph.incoming.get(id) ?? []).length === 0),
		...members,
	]
	for (const id of roots) if (inSet.has(id) && !seen.has(id)) visit(id)
	// Link after discovery so every endpoint has its lists.
	for (const id of members) {
		for (const f of forward(graph, inSet, id)) {
			const chain = lg.chains.get(f.id) ?? []
			if (
				chain.length === 2 &&
				lg.rank.get(chain[0] as string) === lg.rank.get(chain[1] as string)
			) {
				continue
			}
			for (let i = 0; i + 1 < chain.length; i++) {
				link(chain[i] as string, chain[i + 1] as string, f.id, i === 0 ? biasOf(f) : 0)
			}
		}
	}
	return lg
}

function positions(layers: string[][]): Map<string, number> {
	const pos = new Map<string, number>()
	for (const layer of layers) layer.forEach((id, i) => pos.set(id, i))
	return pos
}

/** Crossings between column `r` and `r + 1`, straight-line model. */
function crossingsAt(lg: Layering, pos: Map<string, number>, r: number): number {
	const pairs: Array<[number, number]> = []
	for (const id of lg.layers[r] ?? []) {
		for (const s of lg.succ.get(id) ?? []) pairs.push([pos.get(s.from) ?? 0, pos.get(s.to) ?? 0])
	}
	let n = 0
	for (let i = 0; i < pairs.length; i++) {
		const [a1, b1] = pairs[i] as [number, number]
		for (let j = i + 1; j < pairs.length; j++) {
			const [a2, b2] = pairs[j] as [number, number]
			if ((a1 < a2 && b1 > b2) || (a1 > a2 && b1 < b2)) n++
		}
	}
	return n
}

export function totalCrossings(lg: Layering): number {
	const pos = positions(lg.layers)
	let n = 0
	for (let r = 0; r + 1 < lg.layers.length; r++) n += crossingsAt(lg, pos, r)
	return n
}

/** Gansner's weighted median of neighbour positions; -1 when there are none. */
function medianValue(values: number[]): number {
	const p = [...values].sort((a, b) => a - b)
	const n = p.length
	if (n === 0) return -1
	const m = Math.floor(n / 2)
	if (n % 2 === 1) return p[m] as number
	if (n === 2) return ((p[0] as number) + (p[1] as number)) / 2
	const left = (p[m - 1] as number) - (p[0] as number)
	const right = (p[n - 1] as number) - (p[m] as number)
	if (left + right === 0) return ((p[m - 1] as number) + (p[m] as number)) / 2
	return ((p[m - 1] as number) * right + (p[m] as number) * left) / (left + right)
}

/** Sort one column by the median of its neighbours in the fixed column; isolated nodes keep their slot. */
function reorder(lg: Layering, r: number, down: boolean, pos: Map<string, number>): void {
	const layer = lg.layers[r] ?? []
	const value = new Map<string, number>()
	for (const id of layer) {
		const segs = (down ? lg.pred.get(id) : lg.succ.get(id)) ?? []
		const vals = segs.map((s) =>
			down ? (pos.get(s.from) ?? 0) + s.bias : (pos.get(s.to) ?? 0) - s.bias,
		)
		value.set(id, medianValue(vals))
	}
	const movable = layer
		.filter((id) => (value.get(id) ?? -1) >= 0)
		.sort((a, b) => (value.get(a) ?? 0) - (value.get(b) ?? 0))
	let k = 0
	const next = layer.map((id) => ((value.get(id) ?? -1) >= 0 ? (movable[k++] as string) : id))
	lg.layers[r] = next
	next.forEach((id, i) => pos.set(id, i))
}

/** Crossings among the flows of `u` and `v` (in that order) toward both neighbouring columns. */
function pairCrossings(lg: Layering, pos: Map<string, number>, u: string, v: string): number {
	let n = 0
	const count = (a: number[], b: number[]): void => {
		for (const pu of a) for (const pv of b) if (pu > pv) n++
	}
	const from = (id: string): number[] => (lg.pred.get(id) ?? []).map((s) => pos.get(s.from) ?? 0)
	const to = (id: string): number[] => (lg.succ.get(id) ?? []).map((s) => pos.get(s.to) ?? 0)
	count(from(u), from(v))
	count(to(u), to(v))
	return n
}

/** Swap neighbours while that removes crossings. */
function transpose(lg: Layering, pos: Map<string, number>): void {
	for (let pass = 0; pass < TRANSPOSE_PASSES; pass++) {
		let improved = false
		for (const layer of lg.layers) {
			for (let i = 0; i + 1 < layer.length; i++) {
				const u = layer[i] as string
				const v = layer[i + 1] as string
				if (pairCrossings(lg, pos, v, u) < pairCrossings(lg, pos, u, v)) {
					layer[i] = v
					layer[i + 1] = u
					pos.set(v, i)
					pos.set(u, i + 1)
					improved = true
				}
			}
		}
		if (!improved) break
	}
}

/** Put every stacked mover right under (or over) its anchor again. */
function glue(lg: Layering, stacks: ReadonlyMap<string, Stack>, pos: Map<string, number>): void {
	for (const stack of stacks.values()) {
		const layer = lg.layers[lg.rank.get(stack.anchor) ?? -1]
		if (!layer || lg.rank.get(stack.mover) !== lg.rank.get(stack.anchor)) continue
		layer.splice(layer.indexOf(stack.mover), 1)
		const at = layer.indexOf(stack.anchor)
		layer.splice(stack.side > 0 ? at + 1 : at, 0, stack.mover)
		layer.forEach((id, i) => pos.set(id, i))
	}
}

/** Median sweeps with transpose; keeps the order with the fewest crossings seen. */
export function orderLayers(lg: Layering, stacks: ReadonlyMap<string, Stack>): void {
	const pos = positions(lg.layers)
	glue(lg, stacks, pos)
	let best = lg.layers.map((l) => [...l])
	let bestCount = totalCrossings(lg)
	for (let iter = 0; iter < SWEEPS && bestCount > 0; iter++) {
		if (iter % 2 === 0) {
			for (let r = 1; r < lg.layers.length; r++) reorder(lg, r, true, pos)
		} else {
			for (let r = lg.layers.length - 2; r >= 0; r--) reorder(lg, r, false, pos)
		}
		transpose(lg, pos)
		glue(lg, stacks, pos)
		const count = totalCrossings(lg)
		if (count < bestCount) {
			bestCount = count
			best = lg.layers.map((l) => [...l])
		}
	}
	lg.layers = best
}
