/**
 * Pool order by message-flow crossings.
 *
 * Distance alone (ordering.ts) keeps talking pools close, but on a
 * hub-and-spoke collaboration many orders tie on distance and differ a lot in
 * how often the messages cross each other and the processes they pass. This
 * scores an order on a sketch of the final drawing: every pool stacked at its
 * real height and horizontal offset (alignment does not depend on the order),
 * each message drawn as riser, run in the gap nearest its midpoint (tracks as
 * the router assigns them), riser. Risers through shapes count too.
 */
import { pathCrossings } from "./crossings.js"
import { assignTracks } from "./message-tracks.js"

export interface StackPoint {
	x: number
	y: number
}

export interface StackPool {
	height: number
	/** Sequence-flow polylines, y measured from the pool's top. */
	paths: StackPoint[][]
	/** Shapes, same frame: a riser through one has to jog round it. */
	boxes?: Array<{ x: number; y: number; width: number; height: number }>
}

/** One message; an end with no element (a black box) docks under the other end. */
export interface StackMessage {
	from: number
	to: number
	fromEnd?: { x: number; top: number; bottom: number }
	toEnd?: { x: number; top: number; bottom: number }
}

const GAP = 30
/**
 * A riser through a shape costs what a crossing does: the router jogs round
 * it (two bends), and an order that sends risers through processes trades
 * crossings for slanted messages.
 */
const JOG_COST = 1

export function stackCrossings(
	order: readonly number[],
	pools: readonly StackPool[],
	messages: readonly StackMessage[],
): number {
	const top: number[] = []
	const gaps: Array<{ top: number; bottom: number }> = []
	let y = 0
	for (const index of order) {
		if (y > 0) gaps.push({ top: y - GAP, bottom: y })
		top[index] = y
		y += (pools[index]?.height ?? 0) + GAP
	}

	type Run = { a: StackPoint; b: StackPoint; ax: number; bx: number; gap: number }
	const runs: Run[] = []
	for (const m of messages) {
		const fromTop = top[m.from]
		const toTop = top[m.to]
		if (fromTop === undefined || toTop === undefined || m.from === m.to) continue
		const fx = m.fromEnd?.x ?? m.toEnd?.x
		const tx = m.toEnd?.x ?? m.fromEnd?.x
		if (fx === undefined || tx === undefined) continue
		const down = fromTop < toTop
		const end = (t: number, e: StackMessage["fromEnd"], pool: number, leaving: boolean): number => {
			const lowSide = down === leaving
			if (!e) return lowSide ? t + (pools[pool]?.height ?? 0) : t
			return t + (lowSide ? e.bottom : e.top)
		}
		const sy = end(fromTop, m.fromEnd, m.from, true)
		const ty = end(toTop, m.toEnd, m.to, false)
		const mid = (sy + ty) / 2
		let gap = -1
		for (let g = 0; g < gaps.length; g++) {
			const c = ((gaps[g]?.top ?? 0) + (gaps[g]?.bottom ?? 0)) / 2
			if (c < Math.min(sy, ty) || c > Math.max(sy, ty)) continue
			const best = gaps[gap]
			if (gap < 0 || (best && Math.abs(c - mid) < Math.abs((best.top + best.bottom) / 2 - mid)))
				gap = g
		}
		runs.push({ a: { x: fx, y: sy }, b: { x: tx, y: ty }, ax: fx, bx: tx, gap })
	}

	const paths: StackPoint[][] = runs.map((r) => [r.a, r.b])
	const byGap = new Map<number, number[]>()
	runs.forEach((r, i) => {
		if (r.gap < 0) return
		const list = byGap.get(r.gap)
		if (list) list.push(i)
		else byGap.set(r.gap, [i])
	})
	for (const [g, list] of byGap) {
		const gap = gaps[g]
		if (!gap) continue
		const ys = assignTracks(
			list.map((i) => {
				const r = runs[i] as Run
				const fromAbove = r.a.y < gap.top
				return { upper: fromAbove ? r.ax : r.bx, lower: fromAbove ? r.bx : r.ax }
			}),
			gap.top,
			gap.bottom,
		)
		list.forEach((i, k) => {
			const r = runs[i] as Run
			const ty = ys[k]
			paths[i] =
				ty === undefined
					? [r.a, { x: r.ax, y: r.b.y }]
					: [r.a, { x: r.ax, y: ty }, { x: r.bx, y: ty }, r.b]
		})
	}

	let n = 0
	const drawn: StackPoint[][] = []
	const boxes: Array<{ x: number; y: number; width: number; height: number }> = []
	for (const index of order) {
		const t = top[index] ?? 0
		for (const p of pools[index]?.paths ?? []) drawn.push(p.map((q) => ({ x: q.x, y: q.y + t })))
		for (const b of pools[index]?.boxes ?? []) boxes.push({ ...b, y: b.y + t })
	}
	for (const p of paths) {
		for (let i = 1; i < p.length; i++) {
			const a = p[i - 1] as StackPoint
			const b = p[i] as StackPoint
			if (a.x !== b.x) continue
			const lo = Math.min(a.y, b.y) + 2
			const hi = Math.max(a.y, b.y) - 2
			for (const r of boxes)
				if (a.x > r.x + 1 && a.x < r.x + r.width - 1 && r.y < hi && lo < r.y + r.height)
					n += JOG_COST
		}
	}
	for (let i = 0; i < paths.length; i++) {
		const p = paths[i] ?? []
		for (let j = i + 1; j < paths.length; j++) n += pathCrossings(p, paths[j] ?? [])
		for (const d of drawn) n += pathCrossings(p, d)
	}
	return n
}

/**
 * Remove-and-reinsert from `start` on the crossing sketch; the first strictly
 * better move wins, so `start` survives every tie.
 */
export function orderByCrossings(
	start: readonly number[],
	pools: readonly StackPool[],
	messages: readonly StackMessage[],
): number[] {
	let order = [...start]
	let current = stackCrossings(order, pools, messages)
	for (let sweep = 0; sweep < order.length; sweep++) {
		let improved = false
		for (let from = 0; from < order.length; from++) {
			const pool = order[from]
			if (pool === undefined) continue
			const without = [...order.slice(0, from), ...order.slice(from + 1)]
			for (let to = 0; to <= without.length; to++) {
				if (to === from) continue
				const candidate = [...without.slice(0, to), pool, ...without.slice(to)]
				const n = stackCrossings(candidate, pools, messages)
				if (n < current) {
					order = candidate
					current = n
					improved = true
					break
				}
			}
		}
		if (!improved) break
	}
	return order
}
