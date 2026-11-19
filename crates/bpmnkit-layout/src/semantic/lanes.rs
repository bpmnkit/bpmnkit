//! Twin of `layout/semantic/lanes.ts`.

use super::graph::SemanticGraph;
use crate::collaboration::crossings::path_crossings;
use crate::hash::{IndexMap, IndexSet};
use crate::js;
use crate::types::LayoutResult;
use bpmnkit_bpmn::model::{BpmnLane, BpmnLaneSet};

/// Most lanes whose order is searched exhaustively (n! candidates).
const MAX_ORDERED_LANES: usize = 6;

/// `leafLanes` result: leaf lane id per flow-node ref, in declaration order.
pub struct LeafLanes<'a> {
    pub leaves: Vec<&'a str>,
    pub leaf_of: IndexMap<&'a str, &'a str>,
    /// No lane nests another.
    pub flat: bool,
}

/// `leafLanes(laneSet)`. The TS seen-guard against a lane set containing itself
/// has no counterpart: owned lane sets cannot alias.
pub fn leaf_lanes(lane_set: &BpmnLaneSet) -> LeafLanes<'_> {
    let mut out = LeafLanes {
        leaves: Vec::new(),
        leaf_of: IndexMap::default(),
        flat: true,
    };
    fn walk<'a>(lanes: &'a [BpmnLane], out: &mut LeafLanes<'a>) {
        for lane in lanes {
            if let Some(child) = lane
                .child_lane_set
                .as_ref()
                .filter(|set| !set.lanes.is_empty())
            {
                out.flat = false;
                walk(&child.lanes, out);
                continue;
            }
            out.leaves.push(lane.id.as_str());
            for r in &lane.flow_node_refs {
                out.leaf_of
                    .entry(r.as_str())
                    .or_insert_with(|| lane.id.as_str());
            }
        }
    }
    walk(&lane_set.lanes, &mut out);
    out
}

/// Lane distance summed over every flow that leaves a lane, for a top-to-bottom
/// order given as the position of each lane (by index into the declared leaves).
fn cross_lane_cost(pairs: &[(usize, usize)], pos: &[usize]) -> usize {
    pairs.iter().map(|&(a, b)| pos[a].abs_diff(pos[b])).sum()
}

/// `rest(items)`: all permutations, in the lexicographic-by-array order the TS builds them.
fn permutations(items: &[usize]) -> Vec<Vec<usize>> {
    if items.len() <= 1 {
        return vec![items.to_vec()];
    }
    let mut out = Vec::new();
    for (i, &x) in items.iter().enumerate() {
        let mut others = items.to_vec();
        others.remove(i);
        for mut r in permutations(&others) {
            r.insert(0, x);
            out.push(r);
        }
    }
    out
}

/// `laneOrder`: top-to-bottom lane order that keeps the flows between lanes
/// short: the declared order unless another order is strictly cheaper. `None`
/// stands for the declared order (the TS returns `leaves` itself).
pub fn lane_order<'a>(
    graph: &SemanticGraph,
    leaves: &[&'a str],
    leaf_of: &IndexMap<&str, &str>,
    flat: bool,
) -> Option<Vec<&'a str>> {
    if !flat || leaves.len() < 3 || leaves.len() > MAX_ORDERED_LANES {
        return None;
    }
    let index_of = |lane: &str| leaves.iter().position(|l| *l == lane);
    let mut pairs: Vec<(usize, usize)> = Vec::new();
    for flows in graph.outgoing.values() {
        for f in flows {
            // A loop or a lane's own end event should not pull the lanes apart.
            if graph.back_edges.contains(f.id.as_str())
                || graph
                    .by_id
                    .get(f.target_ref.as_str())
                    .is_some_and(|el| el.type_name() == "endEvent")
            {
                continue;
            }
            let from = if graph.by_id.contains_key(f.source_ref.as_str()) {
                leaf_of.get(f.source_ref.as_str()).copied()
            } else {
                None
            };
            let to = leaf_of.get(f.target_ref.as_str()).copied();
            if let (Some(from), Some(to)) = (from, to) {
                if from != to {
                    if let (Some(a), Some(b)) = (index_of(from), index_of(to)) {
                        pairs.push((a, b));
                    }
                }
            }
        }
    }
    let position = |order: &[usize]| -> Vec<usize> {
        let mut pos = vec![0; leaves.len()];
        for (i, &id) in order.iter().enumerate() {
            pos[id] = i;
        }
        pos
    };
    let declared: Vec<usize> = (0..leaves.len()).collect();
    let mut best: Option<Vec<usize>> = None;
    let mut best_cost = cross_lane_cost(&pairs, &position(&declared));
    for order in permutations(&declared) {
        let cost = cross_lane_cost(&pairs, &position(&order));
        if cost < best_cost {
            best = Some(order);
            best_cost = cost;
        }
    }
    best.map(|o| o.into_iter().map(|i| leaves[i]).collect())
}

/// `laneHandoffs`: flows into the lane directly above or below that share their
/// source's column, so the hand-over is a straight vertical run. One per source
/// and direction; the target takes only that flow in, and neither end carries a
/// boundary event. `plain_only`: only sources with a single way on.
pub fn lane_handoffs<'a>(
    graph: &SemanticGraph<'a>,
    leaf_of: &IndexMap<&str, &str>,
    order: &[&str],
    plain_only: bool,
) -> IndexSet<&'a str> {
    let pos: IndexMap<&str, i64> = order
        .iter()
        .enumerate()
        .map(|(i, id)| (*id, i as i64))
        .collect();
    let mut out: IndexSet<&'a str> = IndexSet::default();
    let forward_in = |id: &str| -> usize {
        graph.incoming.get(id).map_or(0, |v| {
            v.iter()
                .filter(|f| !graph.back_edges.contains(f.id.as_str()))
                .count()
        })
    };
    for node in &graph.nodes {
        let id = node.base().id.as_str();
        let Some(from) = leaf_of.get(id).copied() else {
            continue;
        };
        if graph.attachers.contains_key(id) {
            continue;
        }
        let mut taken: Vec<i64> = Vec::new();
        let flows = graph.outgoing.get(id).map_or(&[][..], |v| v.as_slice());
        if plain_only && flows.len() != 1 {
            continue;
        }
        for flow in flows {
            if graph.back_edges.contains(flow.id.as_str()) {
                continue;
            }
            let Some(to) = leaf_of.get(flow.target_ref.as_str()).copied() else {
                continue;
            };
            if graph.attachers.contains_key(flow.target_ref.as_str()) {
                continue;
            }
            let step = pos.get(to).copied().unwrap_or(0) - pos.get(from).copied().unwrap_or(0);
            if step.abs() != 1 || taken.contains(&step) || forward_in(&flow.target_ref) != 1 {
                continue;
            }
            taken.push(step);
            out.insert(flow.id.as_str());
        }
    }
    out
}

/// `laneCost`, lower is better, compared term by term (a refinement must not
/// lose in any): flows through a shape that is not theirs, crossings between
/// flows, bends, how far the happy path strays from its mean row, flow-length
/// spread, area.
pub fn lane_cost(result: &LayoutResult) -> [f64; 6] {
    let mut through = 0usize;
    let mut bends = 0usize;
    for e in &result.edges {
        bends += e.waypoints.len().saturating_sub(2);
        for w in e.waypoints.windows(2) {
            let (p, q) = (&w[0], &w[1]);
            for n in &result.nodes {
                if n.id == e.source_ref || n.id == e.target_ref {
                    continue;
                }
                let b = &n.bounds;
                if js::max(p.x, q.x) > b.x + 1.0
                    && js::min(p.x, q.x) < b.x + b.width - 1.0
                    && js::max(p.y, q.y) > b.y + 1.0
                    && js::min(p.y, q.y) < b.y + b.height - 1.0
                {
                    through += 1;
                }
            }
        }
    }
    let mut crossings = 0usize;
    for i in 0..result.edges.len() {
        for j in (i + 1)..result.edges.len() {
            crossings += path_crossings(&result.edges[i].waypoints, &result.edges[j].waypoints);
        }
    }
    let mut right = 0.0f64;
    let mut bottom = 0.0f64;
    for n in &result.nodes {
        right = js::max(right, n.bounds.x + n.bounds.width);
        bottom = js::max(bottom, n.bounds.y + n.bounds.height);
    }
    [
        through as f64,
        crossings as f64,
        bends as f64,
        happy_axis_dev(result),
        length_cv(result),
        right * bottom,
    ]
}

/// `cheaper(a, b)`: true when `a` is no worse than `b` in any term and better in at least one.
pub fn cheaper(a: &[f64], b: &[f64]) -> bool {
    let mut better = false;
    for i in 0..a.len() {
        if a[i] > b[i] {
            return false;
        }
        if a[i] < b[i] {
            better = true;
        }
    }
    better
}

/// `happyAxisDev`: spread of the rows the first-declared forward path from each
/// start event visits.
fn happy_axis_dev(result: &LayoutResult) -> f64 {
    let centre_y: IndexMap<&str, f64> = result
        .nodes
        .iter()
        .map(|n| (n.id.as_str(), n.bounds.y + n.bounds.height / 2.0))
        .collect();
    let mut devs: Vec<f64> = Vec::new();
    for start in result.nodes.iter().filter(|n| n.kind == "startEvent") {
        let mut seen: IndexSet<&str> = IndexSet::default();
        seen.insert(start.id.as_str());
        let mut cur = start.id.as_str();
        while let Some(next) = result
            .edges
            .iter()
            .find(|e| e.source_ref == cur && !seen.contains(e.target_ref.as_str()))
        {
            seen.insert(next.target_ref.as_str());
            cur = next.target_ref.as_str();
        }
        let ys: Vec<f64> = seen
            .iter()
            .filter_map(|id| centre_y.get(id).copied())
            .collect();
        let len = js::max(1.0, ys.len() as f64);
        let mean = ys.iter().fold(0.0, |a, b| a + b) / len;
        devs.push((ys.iter().fold(0.0, |a, y| a + (y - mean) * (y - mean)) / len).sqrt());
    }
    js::round(devs.iter().fold(0.0, |a, b| a + b) / js::max(1.0, devs.len() as f64))
}

/// `lanePlan` result: lane membership, declared order and the cheaper order, when there is one.
pub struct LanePlan<'a> {
    pub leaf_of: IndexMap<&'a str, &'a str>,
    pub order: Option<Vec<&'a str>>,
    pub declared: Vec<&'a str>,
    pub flat: bool,
}

pub fn lane_plan<'a>(graph: &SemanticGraph, lane_set: &'a BpmnLaneSet) -> LanePlan<'a> {
    let LeafLanes {
        leaves,
        leaf_of,
        flat,
    } = leaf_lanes(lane_set);
    let order = lane_order(graph, &leaves, &leaf_of, flat);
    LanePlan {
        leaf_of,
        order: if flat { order } else { None },
        declared: leaves,
        flat,
    }
}

/// `lengthCV`: coefficient of variation of the flows' path lengths, to two decimals.
fn length_cv(result: &LayoutResult) -> f64 {
    let lengths: Vec<f64> = result
        .edges
        .iter()
        .map(|e| {
            let mut sum = 0.0;
            for w in e.waypoints.windows(2) {
                sum += (w[0].x - w[1].x).abs() + (w[0].y - w[1].y).abs();
            }
            sum
        })
        .collect();
    let len = js::max(1.0, lengths.len() as f64);
    let mean = lengths.iter().fold(0.0, |a, b| a + b) / len;
    let sd = (lengths.iter().fold(0.0, |a, l| a + (l - mean) * (l - mean)) / len).sqrt();
    js::round((100.0 * sd) / js::max(1.0, mean)) / 100.0
}
