//! Twin of `layout/collaboration/message-tracks.ts`.
//!
//! Horizontal tracks for the message flows that cross one gap between pools.
//!
//! A slanted message runs down from the pool above, along the gap, and on down into the
//! pool below. Two such runs cross when one's riser lands inside the other's horizontal
//! stretch on the wrong side of it, so the order of the tracks decides the crossings, not
//! just their spacing. Runs whose stretches do not overlap share a track, which leaves
//! more room between the others.

use crate::js;

/// `GapRun`: one message flow in a gap: x where it comes in from above and leaves below.
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct GapRun {
    pub upper: f64,
    pub lower: f64,
}

/// Stretches closer than this on one track would read as one line.
const TRACK_CLEARANCE: f64 = 10.0;

/// `assignTracks(runs, top, bottom)`: the y of each run's horizontal stretch inside the
/// gap from `top` to `bottom`, or `None` for a vertical run, which needs no track.
pub fn assign_tracks(runs: &[GapRun], top: f64, bottom: f64) -> Vec<Option<f64>> {
    let lo: Vec<f64> = runs.iter().map(|r| js::min(r.upper, r.lower)).collect();
    let hi: Vec<f64> = runs.iter().map(|r| js::max(r.upper, r.lower)).collect();
    let slanted: Vec<usize> = (0..runs.len()).filter(|&i| hi[i] - lo[i] >= 1.0).collect();
    let inside = |x: f64, j: usize| -> bool { x > lo[j] + 1.0 && x < hi[j] - 1.0 };

    // below[i] holds every run that must sit below run i: i's riser from above
    // lands inside it, or its riser from below lands inside i.
    let mut below: Vec<Vec<usize>> = vec![Vec::new(); runs.len()];
    let mut blockers: Vec<i64> = vec![0; runs.len()];
    for &i in &slanted {
        for &j in &slanted {
            if i == j {
                continue;
            }
            if inside(runs[i].upper, j) || inside(runs[j].lower, i) {
                below[i].push(j);
                blockers[j] += 1;
            }
        }
    }

    // Topological order, leftmost first among the free; a cycle cannot be
    // satisfied, so the leftmost remaining run breaks it.
    let key = |a: usize, b: usize| -> std::cmp::Ordering {
        js::cmp_num(lo[a], lo[b])
            .then_with(|| js::cmp_num(hi[a], hi[b]))
            .then_with(|| a.cmp(&b))
    };
    let mut order: Vec<usize> = Vec::new();
    let mut left: Vec<usize> = slanted.clone();
    while !left.is_empty() {
        let mut free: Vec<usize> = left.iter().copied().filter(|&i| blockers[i] == 0).collect();
        free.sort_by(|a, b| key(*a, *b));
        let next = match free.first() {
            Some(&n) => n,
            None => {
                let mut all = left.clone();
                all.sort_by(|a, b| key(*a, *b));
                all[0]
            }
        };
        left.retain(|&i| i != next);
        order.push(next);
        for &j in &below[next] {
            blockers[j] -= 1;
        }
    }

    let mut track: Vec<Option<usize>> = vec![None; runs.len()];
    let mut tracks: Vec<Vec<(f64, f64)>> = Vec::new();
    for &i in &order {
        let mut t = 0usize;
        for &p in &order {
            if p == i {
                break;
            }
            if below[p].contains(&i) {
                t = t.max(track[p].unwrap_or(0) + 1);
            }
        }
        let a = lo[i] - TRACK_CLEARANCE;
        let b = hi[i] + TRACK_CLEARANCE;
        while tracks
            .get(t)
            .is_some_and(|row| row.iter().any(|&(x1, x2)| x1 < b && a < x2))
        {
            t += 1;
        }
        track[i] = Some(t);
        while tracks.len() <= t {
            tracks.push(Vec::new());
        }
        tracks[t].push((lo[i], hi[i]));
    }

    let count = tracks.len();
    track
        .iter()
        .map(|t| t.map(|t| js::round(top + ((t + 1) as f64 * (bottom - top)) / (count + 1) as f64)))
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    fn run(upper: f64, lower: f64) -> GapRun {
        GapRun { upper, lower }
    }

    #[test]
    fn orders_overlapping_runs_so_no_riser_crosses_another_run() {
        // A comes down at 100 and leaves at 300; B comes down at 200 and leaves at
        // 400. Leftmost-first stacking puts A on top, and B's upper riser then
        // crosses A's run; with B on top neither riser meets the other run.
        let ys = assign_tracks(&[run(100.0, 300.0), run(200.0, 400.0)], 0.0, 60.0);
        assert!(ys[1].unwrap() < ys[0].unwrap());
    }

    #[test]
    fn lets_runs_that_do_not_overlap_share_one_track_and_skips_vertical_ones() {
        let ys = assign_tracks(
            &[run(100.0, 200.0), run(300.0, 400.0), run(500.0, 500.0)],
            0.0,
            60.0,
        );
        assert_eq!(ys, vec![Some(30.0), Some(30.0), None]);
    }
}
