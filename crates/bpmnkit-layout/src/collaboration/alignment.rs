//! Twin of `layout/collaboration/alignment.ts`.
//!
//! Horizontal alignment between the pools of a collaboration. Sliding a whole process
//! sideways costs nothing (the pool grows with it), and a message that leaves straight
//! down crosses far less than one that wanders across two pools first.

use crate::js;
use std::cmp::Ordering;

/// `MessageLink`: one message flow, as the two element centres it connects.
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct MessageLink {
    pub from_pool: usize,
    pub to_pool: usize,
    /// x centre of the source element within its pool's content.
    pub from_x: f64,
    /// x centre of the target element within its pool's content.
    pub to_x: f64,
}

/// `a - b || c - d` as a sort comparator: the second term applies when the first is 0 or NaN.
fn cmp_or(first: f64, second: f64) -> Ordering {
    if first == 0.0 || first.is_nan() {
        js::cmp_num(second, 0.0)
    } else {
        js::cmp_num(first, 0.0)
    }
}

/// `alignPools(count, widths, links)`: x offset per pool.
///
/// The widest pool anchors the diagram and the rest slide to meet it, largest first, so
/// the biggest process never moves to chase a small one. Offsets are normalised to keep
/// every pool at or right of the origin.
pub fn align_pools(count: usize, widths: &[f64], links: &[MessageLink]) -> Vec<f64> {
    let mut offsets = vec![0.0_f64; count];
    if count < 2 || links.is_empty() {
        return offsets;
    }

    let width_of = |i: usize| widths.get(i).copied().unwrap_or(0.0);
    let mut order: Vec<usize> = (0..count).collect();
    order.sort_by(|&a, &b| cmp_or(width_of(b) - width_of(a), a as f64 - b as f64));

    let mut placed: Vec<usize> = Vec::new();
    let Some(&anchor) = order.first() else {
        return offsets;
    };
    placed.push(anchor);

    for &pool in order.iter().skip(1) {
        let connected: Vec<&MessageLink> = links
            .iter()
            .filter(|link| {
                (link.from_pool == pool && placed.contains(&link.to_pool))
                    || (link.to_pool == pool && placed.contains(&link.from_pool))
            })
            .collect();
        if connected.is_empty() {
            placed.push(pool);
            continue;
        }

        // Every connected message suggests the shift that would make it vertical;
        // staying put is always in the running.
        let mut candidates: Vec<f64> = vec![0.0];
        let mut add = |c: f64| {
            // Set semantics (SameValueZero): 0 equals -0, NaN equals NaN.
            if !candidates
                .iter()
                .any(|&e| e == c || (e.is_nan() && c.is_nan()))
            {
                candidates.push(c);
            }
        };
        for link in &connected {
            let (mine, theirs, other) = sides(link, pool);
            add(theirs + offsets.get(other).copied().unwrap_or(0.0) - mine);
        }

        let mut best = 0.0;
        let mut best_cost = f64::INFINITY;
        let mut sorted = candidates;
        sorted.sort_by(|&a, &b| cmp_or(a.abs() - b.abs(), a - b));
        for candidate in sorted {
            let mut cost = 0.0;
            for link in &connected {
                let (mine, theirs, other) = sides(link, pool);
                cost += (mine + candidate - (theirs + offsets.get(other).copied().unwrap_or(0.0)))
                    .abs();
            }
            if cost < best_cost {
                best_cost = cost;
                best = candidate;
            }
        }

        offsets[pool] = js::round(best);
        placed.push(pool);
    }

    let min = offsets.iter().fold(f64::INFINITY, |m, &o| js::min(m, o));
    if min == 0.0 {
        offsets
    } else {
        offsets.into_iter().map(|offset| offset - min).collect()
    }
}

/// `(mine, theirs, otherPool)` of `link` seen from `pool`.
fn sides(link: &MessageLink, pool: usize) -> (f64, f64, usize) {
    if link.from_pool == pool {
        (link.from_x, link.to_x, link.to_pool)
    } else {
        (link.to_x, link.from_x, link.from_pool)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::Value;

    fn link(f: usize, t: usize, fx: f64, tx: f64) -> MessageLink {
        MessageLink {
            from_pool: f,
            to_pool: t,
            from_x: fx,
            to_x: tx,
        }
    }

    #[test]
    fn matches_ts_oracle() {
        let raw = include_str!("../../tests/fixtures/collaboration/alignment.json");
        let cases: Vec<Value> = serde_json::from_str(raw).unwrap();
        assert!(!cases.is_empty());
        for (n, c) in cases.iter().enumerate() {
            let count = c["count"].as_u64().unwrap() as usize;
            let widths: Vec<f64> = c["widths"]
                .as_array()
                .unwrap()
                .iter()
                .map(|v| v.as_f64().unwrap())
                .collect();
            let links: Vec<MessageLink> = c["links"]
                .as_array()
                .unwrap()
                .iter()
                .map(|l| {
                    link(
                        l["fromPool"].as_u64().unwrap() as usize,
                        l["toPool"].as_u64().unwrap() as usize,
                        l["fromX"].as_f64().unwrap(),
                        l["toX"].as_f64().unwrap(),
                    )
                })
                .collect();
            let expected: Vec<f64> = c["expected"]
                .as_array()
                .unwrap()
                .iter()
                .map(|v| v.as_f64().unwrap())
                .collect();
            assert_eq!(align_pools(count, &widths, &links), expected, "case {n}");
        }
    }
}
