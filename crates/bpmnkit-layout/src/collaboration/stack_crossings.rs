//! Twin of `layout/collaboration/stack-crossings.ts`.
//!
//! Pool order by message-flow crossings.
//!
//! Distance alone (ordering) keeps talking pools close, but on a hub-and-spoke
//! collaboration many orders tie on distance and differ a lot in how often the
//! messages cross each other and the processes they pass. This scores an order on a
//! sketch of the final drawing: every pool stacked at its real height and horizontal
//! offset, each message drawn as riser, run in the gap nearest its midpoint (tracks as
//! the router assigns them), riser. Risers through shapes count too.

use crate::collaboration::crossings::path_crossings;
use crate::collaboration::message_tracks::{assign_tracks, GapRun};
use crate::js;
use crate::types::{Bounds, Waypoint};
use indexmap::IndexMap;

/// `StackPool`.
#[derive(Debug, Clone, Default)]
pub struct StackPool {
    pub height: f64,
    /// Sequence-flow polylines, y measured from the pool's top.
    pub paths: Vec<Vec<Waypoint>>,
    /// Shapes, same frame: a riser through one has to jog round it.
    pub boxes: Vec<Bounds>,
}

/// One end of a message inside its pool.
#[derive(Debug, Clone, Copy)]
pub struct StackEnd {
    pub x: f64,
    pub top: f64,
    pub bottom: f64,
}

/// `StackMessage`: an end with no element (a black box) docks under the other end.
#[derive(Debug, Clone)]
pub struct StackMessage {
    pub from: usize,
    pub to: usize,
    pub from_end: Option<StackEnd>,
    pub to_end: Option<StackEnd>,
}

const GAP: f64 = 30.0;
/// A riser through a shape costs what a crossing does: the router jogs round it (two
/// bends), and an order that sends risers through processes trades crossings for
/// slanted messages.
const JOG_COST: usize = 1;

struct Run {
    a: Waypoint,
    b: Waypoint,
    ax: f64,
    bx: f64,
    gap: Option<usize>,
}

/// `stackCrossings(order, pools, messages)`.
pub fn stack_crossings(order: &[usize], pools: &[StackPool], messages: &[StackMessage]) -> usize {
    let size = order.iter().map(|&i| i + 1).max().unwrap_or(0);
    let mut top: Vec<Option<f64>> = vec![None; size.max(pools.len())];
    let mut gaps: Vec<(f64, f64)> = Vec::new();
    let mut y = 0.0_f64;
    for &index in order {
        if y > 0.0 {
            gaps.push((y - GAP, y));
        }
        top[index] = Some(y);
        y += pools.get(index).map_or(0.0, |p| p.height) + GAP;
    }
    let height_of = |pool: usize| pools.get(pool).map_or(0.0, |p| p.height);

    let mut runs: Vec<Run> = Vec::new();
    for m in messages {
        let (Some(from_top), Some(to_top)) = (
            top.get(m.from).copied().flatten(),
            top.get(m.to).copied().flatten(),
        ) else {
            continue;
        };
        if m.from == m.to {
            continue;
        }
        let (Some(fx), Some(tx)) = (
            m.from_end.or(m.to_end).map(|e| e.x),
            m.to_end.or(m.from_end).map(|e| e.x),
        ) else {
            continue;
        };
        let down = from_top < to_top;
        let end = |t: f64, e: Option<StackEnd>, pool: usize, leaving: bool| -> f64 {
            let low_side = down == leaving;
            match e {
                None => {
                    if low_side {
                        t + height_of(pool)
                    } else {
                        t
                    }
                }
                Some(e) => t + if low_side { e.bottom } else { e.top },
            }
        };
        let sy = end(from_top, m.from_end, m.from, true);
        let ty = end(to_top, m.to_end, m.to, false);
        let mid = (sy + ty) / 2.0;
        let mut gap: Option<usize> = None;
        for (g, &(gtop, gbottom)) in gaps.iter().enumerate() {
            let c = (gtop + gbottom) / 2.0;
            if c < js::min(sy, ty) || c > js::max(sy, ty) {
                continue;
            }
            let better = match gap {
                None => true,
                Some(b) => (c - mid).abs() < ((gaps[b].0 + gaps[b].1) / 2.0 - mid).abs(),
            };
            if better {
                gap = Some(g);
            }
        }
        runs.push(Run {
            a: Waypoint { x: fx, y: sy },
            b: Waypoint { x: tx, y: ty },
            ax: fx,
            bx: tx,
            gap,
        });
    }

    let mut paths: Vec<Vec<Waypoint>> = runs.iter().map(|r| vec![r.a, r.b]).collect();
    let mut by_gap: IndexMap<usize, Vec<usize>> = IndexMap::new();
    for (i, r) in runs.iter().enumerate() {
        if let Some(g) = r.gap {
            by_gap.entry(g).or_default().push(i);
        }
    }
    for (g, list) in &by_gap {
        let Some(&(gtop, gbottom)) = gaps.get(*g) else {
            continue;
        };
        let ys = assign_tracks(
            &list
                .iter()
                .map(|&i| {
                    let r = &runs[i];
                    let from_above = r.a.y < gtop;
                    GapRun {
                        upper: if from_above { r.ax } else { r.bx },
                        lower: if from_above { r.bx } else { r.ax },
                    }
                })
                .collect::<Vec<_>>(),
            gtop,
            gbottom,
        );
        for (k, &i) in list.iter().enumerate() {
            let r = &runs[i];
            paths[i] = match ys.get(k).copied().flatten() {
                None => vec![r.a, Waypoint { x: r.ax, y: r.b.y }],
                Some(ty) => vec![
                    r.a,
                    Waypoint { x: r.ax, y: ty },
                    Waypoint { x: r.bx, y: ty },
                    r.b,
                ],
            };
        }
    }

    let mut n = 0usize;
    let mut drawn: Vec<Vec<Waypoint>> = Vec::new();
    let mut boxes: Vec<Bounds> = Vec::new();
    for &index in order {
        let t = top.get(index).copied().flatten().unwrap_or(0.0);
        if let Some(pool) = pools.get(index) {
            for p in &pool.paths {
                drawn.push(p.iter().map(|q| Waypoint { x: q.x, y: q.y + t }).collect());
            }
            for b in &pool.boxes {
                boxes.push(Bounds { y: b.y + t, ..*b });
            }
        }
    }
    for p in &paths {
        for w in p.windows(2) {
            let (a, b) = (w[0], w[1]);
            if a.x != b.x {
                continue;
            }
            let lo = js::min(a.y, b.y) + 2.0;
            let hi = js::max(a.y, b.y) - 2.0;
            for r in &boxes {
                if a.x > r.x + 1.0 && a.x < r.x + r.width - 1.0 && r.y < hi && lo < r.y + r.height {
                    n += JOG_COST;
                }
            }
        }
    }
    for i in 0..paths.len() {
        for j in (i + 1)..paths.len() {
            n += path_crossings(&paths[i], &paths[j]);
        }
        for d in &drawn {
            n += path_crossings(&paths[i], d);
        }
    }
    n
}

/// `orderByCrossings(start, pools, messages)`: remove-and-reinsert from `start` on
/// the crossing sketch; the first strictly better move wins, so `start` survives
/// every tie.
pub fn order_by_crossings(
    start: &[usize],
    pools: &[StackPool],
    messages: &[StackMessage],
) -> Vec<usize> {
    let mut order: Vec<usize> = start.to_vec();
    let mut current = stack_crossings(&order, pools, messages);
    for _sweep in 0..order.len() {
        let mut improved = false;
        for from in 0..order.len() {
            let Some(&pool) = order.get(from) else {
                continue;
            };
            let without: Vec<usize> = order[..from]
                .iter()
                .chain(order[from + 1..].iter())
                .copied()
                .collect();
            for to in 0..=without.len() {
                if to == from {
                    continue;
                }
                let mut candidate: Vec<usize> = without[..to].to_vec();
                candidate.push(pool);
                candidate.extend_from_slice(&without[to..]);
                let n = stack_crossings(&candidate, pools, messages);
                if n < current {
                    order = candidate;
                    current = n;
                    improved = true;
                    break;
                }
            }
        }
        if !improved {
            break;
        }
    }
    order
}

#[cfg(test)]
mod tests {
    use super::*;

    fn fixture() -> (Vec<StackPool>, Vec<StackMessage>) {
        // Pool 0 talks to 1 and 2; both run a flow across their whole width at
        // mid-height. Stacked 0, 1, 2 the message to 2 passes through 1 and crosses
        // its flow; with 0 in the middle nothing crosses.
        let flow = vec![Waypoint { x: 0.0, y: 40.0 }, Waypoint { x: 400.0, y: 40.0 }];
        let pools = vec![
            StackPool {
                height: 80.0,
                ..Default::default()
            },
            StackPool {
                height: 80.0,
                paths: vec![flow.clone()],
                boxes: vec![],
            },
            StackPool {
                height: 80.0,
                paths: vec![flow],
                boxes: vec![],
            },
        ];
        let end = |x: f64| {
            Some(StackEnd {
                x,
                top: 20.0,
                bottom: 60.0,
            })
        };
        let messages = vec![
            StackMessage {
                from: 0,
                to: 1,
                from_end: end(100.0),
                to_end: end(100.0),
            },
            StackMessage {
                from: 0,
                to: 2,
                from_end: end(300.0),
                to_end: end(300.0),
            },
        ];
        (pools, messages)
    }

    #[test]
    fn counts_a_message_crossing_the_process_it_passes() {
        let (pools, messages) = fixture();
        assert_eq!(stack_crossings(&[0, 1, 2], &pools, &messages), 1);
        assert_eq!(stack_crossings(&[1, 0, 2], &pools, &messages), 0);
    }

    #[test]
    fn moves_pools_until_nothing_crosses_and_keeps_a_start_that_cannot_improve() {
        let (pools, messages) = fixture();
        let moved = order_by_crossings(&[0, 1, 2], &pools, &messages);
        assert_eq!(stack_crossings(&moved, &pools, &messages), 0);
        assert_eq!(
            order_by_crossings(&[1, 0, 2], &pools, &messages),
            vec![1, 0, 2]
        );
    }
}
