//! Twin of `layout/collaboration/ordering.ts`.
//!
//! Vertical order of the pools in a collaboration: chosen to minimise how far messages
//! travel vertically. Small collaborations use an exhaustive search; larger ones use
//! repeated remove-and-reinsert.

use crate::hash::{IndexMap, IndexSet};

/// Above this many pools, permuting every order costs more than it is worth.
const EXHAUSTIVE_LIMIT: usize = 8;

/// A full pool of process to cross costs this fraction of one pool step.
const DEPTH_WEIGHT: f64 = 0.5;

/// `PoolLink`: a message-flow relationship between two pools, by index into the input order.
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct PoolLink {
    pub from: usize,
    pub to: usize,
    pub weight: f64,
    /// Where the message leaves inside its pool, 0 at the top to 1 at the bottom.
    /// Absent for pools with no content to cross.
    pub from_depth: Option<f64>,
    pub to_depth: Option<f64>,
}

/// All the links between one pair of pools, pre-summed: `a_above` is the depth cost when
/// pool `a` sits above pool `b`, `a_below` when it sits below.
struct PairCost {
    a: usize,
    b: usize,
    weight: f64,
    a_above: f64,
    a_below: f64,
}

fn pair_costs(links: &[PoolLink]) -> Vec<PairCost> {
    let mut pairs: IndexMap<(usize, usize), PairCost> = IndexMap::default();
    for link in links {
        if link.from == link.to {
            continue;
        }
        let a = link.from.min(link.to);
        let b = link.from.max(link.to);
        let pair = pairs.entry((a, b)).or_insert(PairCost {
            a,
            b,
            weight: 0.0,
            a_above: 0.0,
            a_below: 0.0,
        });
        pair.weight += link.weight;
        // Leaving downward crosses what lies below the element, upward what lies above.
        for (pool, depth) in [(link.from, link.from_depth), (link.to, link.to_depth)] {
            let Some(depth) = depth else { continue };
            let down = link.weight * DEPTH_WEIGHT * (1.0 - depth);
            let up = link.weight * DEPTH_WEIGHT * depth;
            if pool == a {
                pair.a_above += down;
                pair.a_below += up;
            } else {
                pair.a_above += up;
                pair.a_below += down;
            }
        }
    }
    pairs.into_values().collect()
}

/// What an edge pool costs for sitting between two others: one message's pool step.
/// It settles near-ties toward the rim but never stretches the messages further.
const EDGE_PENALTY: f64 = 1.0;

/// How far the messages travel in this order, weighted by how many there are, plus how
/// much of their own pools they cross to get out. The declaration-order term is a
/// tie-break: with nothing to gain from moving, the pools stay where the author put them.
fn cost(order: &[usize], pairs: &[PairCost], edges: &IndexSet<usize>) -> f64 {
    let mut position: Vec<Option<usize>> = Vec::new();
    for (i, &id) in order.iter().enumerate() {
        if position.len() <= id {
            position.resize(id + 1, None);
        }
        position[id] = Some(i);
    }

    let mut total = 0.0;
    for pair in pairs {
        let a = position.get(pair.a).copied().flatten();
        let b = position.get(pair.b).copied().flatten();
        let (Some(a), Some(b)) = (a, b) else { continue };
        total += pair.weight * (a as f64 - b as f64).abs()
            + (if a < b { pair.a_above } else { pair.a_below });
    }

    for id in order.iter().take(order.len().saturating_sub(1)).skip(1) {
        if edges.contains(id) {
            total += EDGE_PENALTY;
        }
    }

    let mut drift = 0.0;
    for (i, &o) in order.iter().enumerate() {
        drift += (o as f64 - i as f64).abs();
    }
    let n = order.len() as f64;
    total + drift / (n * n + 1.0)
}

/// `orderPools(count, links, edges)`: indices into the input order.
///
/// `edges` are pools that read better at the top or bottom of the stack (black boxes).
/// An input with no message flows comes back unchanged.
pub fn order_pools(count: usize, links: &[PoolLink], edges: &IndexSet<usize>) -> Vec<usize> {
    let identity: Vec<usize> = (0..count).collect();
    if count < 3 || links.is_empty() {
        return identity;
    }

    let pairs = pair_costs(links);
    if count <= EXHAUSTIVE_LIMIT {
        exhaustive(identity, &pairs, edges)
    } else {
        refine(identity, &pairs, edges)
    }
}

/// Every order, best first-found wins, so declaration order survives a tie.
fn exhaustive(identity: Vec<usize>, pairs: &[PairCost], edges: &IndexSet<usize>) -> Vec<usize> {
    struct Search<'a> {
        pairs: &'a [PairCost],
        edges: &'a IndexSet<usize>,
        best: Vec<usize>,
        best_cost: f64,
    }

    fn permute(s: &mut Search, prefix: &mut Vec<usize>, rest: &[usize]) {
        if rest.is_empty() {
            let candidate = cost(prefix, s.pairs, s.edges);
            if candidate < s.best_cost {
                s.best = prefix.clone();
                s.best_cost = candidate;
            }
            return;
        }
        for i in 0..rest.len() {
            let mut next_rest = rest.to_vec();
            let next = next_rest.remove(i);
            prefix.push(next);
            permute(s, prefix, &next_rest);
            prefix.pop();
        }
    }

    let mut s = Search {
        pairs,
        edges,
        best_cost: cost(&identity, pairs, edges),
        best: identity.clone(),
    };
    permute(&mut s, &mut Vec::new(), &identity);
    s.best
}

/// Take each pool out and put it back wherever it fits best, repeating until a full
/// sweep changes nothing.
fn refine(identity: Vec<usize>, pairs: &[PairCost], edges: &IndexSet<usize>) -> Vec<usize> {
    let mut order = identity;
    let mut current = cost(&order, pairs, edges);

    for _sweep in 0..order.len() {
        let mut improved = false;
        for from in 0..order.len() {
            let pool = order[from];
            let mut without = order.clone();
            without.remove(from);

            for to in 0..=without.len() {
                if to == from {
                    continue;
                }
                let mut candidate = without.clone();
                candidate.insert(to, pool);
                let candidate_cost = cost(&candidate, pairs, edges);
                if candidate_cost < current {
                    order = candidate;
                    current = candidate_cost;
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
    use serde_json::Value;

    #[test]
    fn matches_ts_oracle() {
        let raw = include_str!("../../tests/fixtures/collaboration/ordering.json");
        let cases: Vec<Value> = serde_json::from_str(raw).unwrap();
        assert!(!cases.is_empty());
        for (n, c) in cases.iter().enumerate() {
            let count = c["count"].as_u64().unwrap() as usize;
            let links: Vec<PoolLink> = c["links"]
                .as_array()
                .unwrap()
                .iter()
                .map(|l| PoolLink {
                    from: l["from"].as_u64().unwrap() as usize,
                    to: l["to"].as_u64().unwrap() as usize,
                    weight: l["weight"].as_f64().unwrap(),
                    from_depth: l.get("fromDepth").and_then(Value::as_f64),
                    to_depth: l.get("toDepth").and_then(Value::as_f64),
                })
                .collect();
            let expected: Vec<usize> = c["expected"]
                .as_array()
                .unwrap()
                .iter()
                .map(|v| v.as_u64().unwrap() as usize)
                .collect();
            assert_eq!(
                order_pools(count, &links, &IndexSet::default()),
                expected,
                "case {n}"
            );
        }
    }
}
