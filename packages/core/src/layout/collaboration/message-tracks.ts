/**
 * Horizontal tracks for the message flows that cross one gap between pools.
 *
 * A slanted message runs down from the pool above, along the gap, and on down
 * into the pool below. Two such runs cross when one's riser lands inside the
 * other's horizontal stretch on the wrong side of it, so the order of the
 * tracks decides the crossings, not just their spacing. Runs whose stretches
 * do not overlap share a track, which leaves more room between the others.
 */

/** One message flow in a gap: x where it comes in from above and leaves below. */
export interface GapRun {
	upper: number
	lower: number
}

/** Stretches closer than this on one track would read as one line. */
const TRACK_CLEARANCE = 10

/**
 * The y of each run's horizontal stretch inside the gap from `top` to
 * `bottom`, or undefined for a vertical run, which needs no track.
 */
export function assignTracks(
	runs: readonly GapRun[],
	top: number,
	bottom: number,
): Array<number | undefined> {
	const lo = runs.map((r) => Math.min(r.upper, r.lower))
	const hi = runs.map((r) => Math.max(r.upper, r.lower))
	const slanted = runs.flatMap((_, i) => ((hi[i] ?? 0) - (lo[i] ?? 0) >= 1 ? [i] : []))
	const inside = (x: number, j: number): boolean => x > (lo[j] ?? 0) + 1 && x < (hi[j] ?? 0) - 1

	// below[i] holds every run that must sit below run i: i's riser from above
	// lands inside it, or its riser from below lands inside i.
	const below = new Map<number, number[]>(slanted.map((i) => [i, []]))
	const blockers = new Map<number, number>(slanted.map((i) => [i, 0]))
	for (const i of slanted) {
		for (const j of slanted) {
			if (i === j) continue
			const run = runs[i]
			if (!run) continue
			if (inside(run.upper, j) || inside(runs[j]?.lower ?? 0, i)) {
				below.get(i)?.push(j)
				blockers.set(j, (blockers.get(j) ?? 0) + 1)
			}
		}
	}

	// Topological order, leftmost first among the free; a cycle cannot be
	// satisfied, so the leftmost remaining run breaks it.
	const key = (a: number, b: number): number =>
		(lo[a] ?? 0) - (lo[b] ?? 0) || (hi[a] ?? 0) - (hi[b] ?? 0) || a - b
	const order: number[] = []
	const left = new Set(slanted)
	while (left.size > 0) {
		const free = [...left].filter((i) => (blockers.get(i) ?? 0) === 0).sort(key)
		const next = free[0] ?? [...left].sort(key)[0]
		if (next === undefined) break
		left.delete(next)
		order.push(next)
		for (const j of below.get(next) ?? []) blockers.set(j, (blockers.get(j) ?? 0) - 1)
	}

	const track: number[] = []
	const tracks: Array<Array<[number, number]>> = []
	for (const i of order) {
		let t = 0
		for (const p of order) {
			if (p === i) break
			if ((below.get(p) ?? []).includes(i)) t = Math.max(t, (track[p] ?? 0) + 1)
		}
		const a = (lo[i] ?? 0) - TRACK_CLEARANCE
		const b = (hi[i] ?? 0) + TRACK_CLEARANCE
		while ((tracks[t] ?? []).some(([x1, x2]) => x1 < b && a < x2)) t++
		track[i] = t
		while (tracks.length <= t) tracks.push([])
		tracks[t]?.push([lo[i] ?? 0, hi[i] ?? 0])
	}

	const count = tracks.length
	return runs.map((_, i) => {
		const t = track[i]
		return t === undefined ? undefined : Math.round(top + ((t + 1) * (bottom - top)) / (count + 1))
	})
}
