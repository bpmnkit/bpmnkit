/**
 * Crossings between orthogonal polylines, counted the way `pnpm layout:score`
 * counts them: a horizontal and a vertical segment meeting strictly inside
 * both, with 1 px of slack, so a shared dock or a touching corner is no
 * crossing. Collinear overlaps are not crossings either.
 */

export interface CrossingPoint {
	x: number
	y: number
}

function segmentsCross(
	a: CrossingPoint,
	b: CrossingPoint,
	c: CrossingPoint,
	d: CrossingPoint,
): boolean {
	const firstFlat = Math.abs(a.y - b.y) < 0.5
	const secondFlat = Math.abs(c.y - d.y) < 0.5
	if (firstFlat === secondFlat) return false
	const [h1, h2, v1, v2] = firstFlat ? [a, b, c, d] : [c, d, a, b]
	const x = v1.x
	const y = h1.y
	return (
		x > Math.min(h1.x, h2.x) + 1 &&
		x < Math.max(h1.x, h2.x) - 1 &&
		y > Math.min(v1.y, v2.y) + 1 &&
		y < Math.max(v1.y, v2.y) - 1
	)
}

/** How many times polyline `a` crosses polyline `b`. */
export function pathCrossings(a: readonly CrossingPoint[], b: readonly CrossingPoint[]): number {
	let n = 0
	for (let i = 1; i < a.length; i++) {
		const p = a[i - 1]
		const q = a[i]
		if (!p || !q) continue
		for (let j = 1; j < b.length; j++) {
			const r = b[j - 1]
			const s = b[j]
			if (r && s && segmentsCross(p, q, r, s)) n++
		}
	}
	return n
}
