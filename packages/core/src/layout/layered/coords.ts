import type { Layering } from "./layers.js"

/** How far a node reaches above and below its centre line, labels and docked events included. */
export interface Extent {
	above: number
	below: number
}

/** Clear space between two nodes of one column, and around a dummy. */
const NODE_GAP = 40
const DUMMY_GAP = 20

const key = (a: string, b: string): string => (a < b ? `${a}\u0001${b}` : `${b}\u0001${a}`)

/**
 * Type-1 conflicts (Brandes–Köpf): a non-inner segment crossing an inner one
 * (dummy to dummy) loses its claim to be straight, so long flows stay
 * straight. Boundary segments are never aligned either.
 */
function conflicts(lg: Layering): Set<string> {
	const out = new Set<string>()
	const pos = new Map<string, number>()
	for (const layer of lg.layers) layer.forEach((id, i) => pos.set(id, i))
	for (const segs of lg.pred.values()) {
		for (const s of segs) if (s.bias !== 0) out.add(key(s.from, s.to))
	}
	for (let r = 1; r < lg.layers.length; r++) {
		const prev = lg.layers[r - 1] ?? []
		const layer = lg.layers[r] ?? []
		let k0 = 0
		let scan = 0
		const last = layer[layer.length - 1]
		layer.forEach((v, i) => {
			const inner = lg.dummies.has(v)
				? (lg.pred.get(v) ?? []).find((s) => lg.dummies.has(s.from))?.from
				: undefined
			const k1 = inner !== undefined ? (pos.get(inner) ?? 0) : prev.length
			if (inner === undefined && v !== last) return
			for (const w of layer.slice(scan, i + 1)) {
				for (const s of lg.pred.get(w) ?? []) {
					const p = pos.get(s.from) ?? 0
					if ((p < k0 || k1 < p) && !(lg.dummies.has(s.from) && lg.dummies.has(w))) {
						out.add(key(s.from, w))
					}
				}
			}
			scan = i + 1
			k0 = k1
		})
	}
	return out
}

/** Block roots and alignment chains for one of the four directions. */
function align(
	layers: string[][],
	neighbours: (id: string) => string[],
	blocked: ReadonlySet<string>,
): { root: Map<string, string>; next: Map<string, string> } {
	const root = new Map<string, string>()
	const next = new Map<string, string>()
	const pos = new Map<string, number>()
	for (const layer of layers) {
		layer.forEach((id, i) => {
			root.set(id, id)
			next.set(id, id)
			pos.set(id, i)
		})
	}
	for (const layer of layers) {
		let prevIdx = -1
		for (const v of layer) {
			const ws = neighbours(v).sort((a, b) => (pos.get(a) ?? 0) - (pos.get(b) ?? 0))
			if (ws.length === 0) continue
			const mp = (ws.length - 1) / 2
			for (let i = Math.floor(mp); i <= Math.ceil(mp); i++) {
				const w = ws[i] as string
				const pw = pos.get(w) ?? 0
				if (next.get(v) === v && prevIdx < pw && !blocked.has(key(v, w))) {
					next.set(w, v)
					const r = root.get(w) as string
					root.set(v, r)
					next.set(v, r)
					prevIdx = pw
				}
			}
		}
	}
	return { root, next }
}

/** Pack blocks as tightly as separations allow: longest path over the block graph, then pull back. */
function compact(
	layers: string[][],
	root: Map<string, string>,
	sep: (upper: string, lower: string) => number,
): Map<string, number> {
	const edges = new Map<string, Map<string, number>>()
	const inEdges = new Map<string, Map<string, number>>()
	const roots: string[] = []
	const known = new Set<string>()
	for (const layer of layers) {
		for (const id of layer) {
			const r = root.get(id) as string
			if (!known.has(r)) {
				known.add(r)
				roots.push(r)
				edges.set(r, new Map())
				inEdges.set(r, new Map())
			}
		}
	}
	for (const layer of layers) {
		for (let i = 1; i < layer.length; i++) {
			const u = layer[i - 1] as string
			const v = layer[i] as string
			const ru = root.get(u) as string
			const rv = root.get(v) as string
			const w = Math.max(edges.get(ru)?.get(rv) ?? 0, sep(u, v))
			edges.get(ru)?.set(rv, w)
			inEdges.get(rv)?.set(ru, w)
		}
	}
	const indeg = new Map<string, number>()
	for (const r of roots) indeg.set(r, inEdges.get(r)?.size ?? 0)
	const order = roots.filter((r) => indeg.get(r) === 0)
	for (let i = 0; i < order.length; i++) {
		for (const s of (edges.get(order[i] as string) ?? new Map()).keys()) {
			const left = (indeg.get(s) ?? 0) - 1
			indeg.set(s, left)
			if (left === 0) order.push(s)
		}
	}
	const xs = new Map<string, number>()
	for (const r of order) {
		let x = 0
		for (const [p, w] of inEdges.get(r) ?? []) x = Math.max(x, (xs.get(p) ?? 0) + w)
		xs.set(r, x)
	}
	for (let i = order.length - 1; i >= 0; i--) {
		const r = order[i] as string
		let min = Number.POSITIVE_INFINITY
		for (const [s, w] of edges.get(r) ?? []) min = Math.min(min, (xs.get(s) ?? 0) - w)
		if (min !== Number.POSITIVE_INFINITY) xs.set(r, Math.max(xs.get(r) ?? 0, min))
	}
	const out = new Map<string, number>()
	for (const layer of layers)
		for (const id of layer) out.set(id, xs.get(root.get(id) as string) ?? 0)
	return out
}

/**
 * Brandes–Köpf centre lines (the cross-column axis here is y): the balanced
 * mean, then the four aligned variants, each kept only while it holds every
 * column's spacing. The caller picks one by how the flows would route.
 */
export function yCandidates(lg: Layering, extent: (id: string) => Extent): Map<string, number>[] {
	const blocked = conflicts(lg)
	const gap = (a: string, b: string): number =>
		lg.dummies.has(a) || lg.dummies.has(b) ? DUMMY_GAP : NODE_GAP
	const runs: Map<string, number>[] = []
	for (const up of [true, false]) {
		const vertical = up ? lg.layers : [...lg.layers].reverse()
		for (const leftFirst of [true, false]) {
			const layers = leftFirst ? vertical.map((l) => [...l]) : vertical.map((l) => [...l].reverse())
			const neighbours = (id: string): string[] =>
				up ? (lg.pred.get(id) ?? []).map((s) => s.from) : (lg.succ.get(id) ?? []).map((s) => s.to)
			const { root } = align(layers, neighbours, blocked)
			const sep = (u: string, v: string): number =>
				(leftFirst ? extent(u).below + extent(v).above : extent(u).above + extent(v).below) +
				gap(u, v)
			const ys = compact(layers, root, sep)
			if (!leftFirst) for (const [id, y] of ys) ys.set(id, -y)
			runs.push(ys)
		}
	}
	const span = (ys: Map<string, number>): [number, number] => {
		let lo = Number.POSITIVE_INFINITY
		let hi = Number.NEGATIVE_INFINITY
		for (const [id, y] of ys) {
			lo = Math.min(lo, y - extent(id).above)
			hi = Math.max(hi, y + extent(id).below)
		}
		return [lo, hi]
	}
	let smallest = 0
	let width = Number.POSITIVE_INFINITY
	runs.forEach((ys, i) => {
		const [lo, hi] = span(ys)
		if (hi - lo < width) {
			width = hi - lo
			smallest = i
		}
	})
	const [minS, maxS] = span(runs[smallest] as Map<string, number>)
	runs.forEach((ys, i) => {
		const [lo, hi] = span(ys)
		const delta = i % 2 === 0 ? minS - lo : maxS - hi
		for (const [id, y] of ys) ys.set(id, y + delta)
	})
	const balanced = new Map<string, number>()
	for (const id of (runs[0] as Map<string, number>).keys()) {
		const v = runs.map((ys) => ys.get(id) ?? 0).sort((a, b) => a - b)
		balanced.set(id, Math.round(((v[1] as number) + (v[2] as number)) / 2))
	}
	return [balanced, ...runs].filter((ys) => separated(lg, ys, extent, gap))
}

/** True when every column keeps its order and spacing (the balanced mean can break it). */
function separated(
	lg: Layering,
	ys: Map<string, number>,
	extent: (id: string) => Extent,
	gap: (a: string, b: string) => number,
): boolean {
	for (const layer of lg.layers) {
		for (let i = 1; i < layer.length; i++) {
			const u = layer[i - 1] as string
			const v = layer[i] as string
			const need = extent(u).below + extent(v).above + gap(u, v)
			if ((ys.get(v) ?? 0) - (ys.get(u) ?? 0) < need - 0.5) return false
		}
	}
	return true
}
