//! Twin of `layout/layered/index.ts`.

pub mod coords;
pub mod layers;
pub mod route;

use crate::hash::{IndexMap, IndexSet};
use crate::js;
use crate::semantic::bands::boundary_side;
use crate::semantic::graph::SemanticGraph;
use crate::semantic::place::{
    artifact_owners_of, column_gaps, dock_boundary_events, external_label_width, place_artifacts,
    COMPONENT_GAP,
};
use crate::types::{Bounds, LayoutEdge, Waypoint, LABEL_HEIGHT};
use bpmnkit_bpmn::model::BpmnSequenceFlow;
use coords::{y_candidates, Extent};
use layers::{assign_layers, build_layering, order_layers, stacked_flows, Layering};
use route::{
    draw_plan, edge_of, jogs_of, order_tracks, plan_flow, Entry, Exit, Jog, Plan, PlanInput, Router,
};

/// Gap between an event or gateway and its label below; see `semantic/mod.rs`.
const LABEL_OFFSET: f64 = 4.0;
/// How far a docked boundary event hangs past its host's border.
const BOUNDARY_HANG: f64 = 18.0;
/// Spacing between parallel tracks in one gutter.
const TRACK: f64 = 12.0;
/// Gap between loose nodes in their row under the diagram.
const LOOSE_GAP: f64 = 40.0;
const DEFAULT_SIZE: (f64, f64) = (100.0, 80.0);

/// Nominal column pitch, to weigh a flow's horizontal run against its vertical travel.
const PITCH: f64 = 160.0;

/// The candidate whose flows route with the fewest bends; ties go to the more
/// even flow lengths (smallest sum of squares), then the lower one.
fn pick_y<'c>(
    graph: &SemanticGraph,
    lg: &Layering,
    candidates: &'c [IndexMap<String, f64>],
    extent: &dyn Fn(&str) -> Extent,
    height: &dyn Fn(&str) -> f64,
    side_of: &dyn Fn(&str) -> i64,
) -> &'c IndexMap<String, f64> {
    let mut columns: IndexMap<i64, Vec<&str>> = IndexMap::default();
    for (id, &r) in &lg.rank {
        if lg.dummies.contains_key(id) {
            continue;
        }
        columns.entry(r).or_default().push(id);
    }
    let mut flows: IndexMap<&str, &BpmnSequenceFlow> = IndexMap::default();
    for list in graph.outgoing.values() {
        for f in list {
            flows.insert(f.id.as_str(), f);
        }
    }
    let mut best = &candidates[0];
    let mut best_key = [f64::INFINITY, f64::INFINITY, f64::INFINITY];
    for y in candidates {
        let input = PlanInput {
            graph,
            y,
            rank: &lg.rank,
            columns: &columns,
            height,
            side_of,
        };
        let mut bends = 0.0;
        let mut squares = 0.0;
        for (id, chain) in &lg.chains {
            let plan = plan_flow(&input, flows[id.as_str()], chain);
            let n = chain.len();
            if plan.exit == Exit::Stack {
                let d = (plan.ys[1] - plan.ys[0]).abs();
                squares += d * d;
                continue;
            }
            let mut travel = 0.0;
            for i in 0..n - 1 {
                let d = (plan.ys[i + 1] - plan.ys[i]).abs();
                travel += d;
                if d > 0.0 {
                    bends += 2.0;
                }
            }
            if plan.exit != Exit::Right {
                bends += 1.0;
                travel += (plan.ys[0] - y.get(chain[0].as_str()).copied().unwrap_or(0.0)).abs();
            }
            if plan.entry == Entry::Side {
                bends += 1.0;
                travel +=
                    (plan.ys[n - 1] - y.get(chain[n - 1].as_str()).copied().unwrap_or(0.0)).abs();
            }
            let length = (n - 1) as f64 * PITCH + travel;
            squares += length * length;
        }
        let mut lo = f64::INFINITY;
        let mut hi = f64::NEG_INFINITY;
        for (id, &v) in y {
            lo = js::min(lo, v - extent(id).above);
            hi = js::max(hi, v + extent(id).below);
        }
        let key = [bends, squares, hi - lo];
        if key[0] < best_key[0]
            || (key[0] == best_key[0]
                && (key[1] < best_key[1] || (key[1] == best_key[1] && key[2] < best_key[2])))
        {
            best = y;
            best_key = key;
        }
    }
    best
}

pub struct LayeredPlacement<'a> {
    pub bounds: IndexMap<&'a str, Bounds>,
    pub edges: Vec<LayoutEdge>,
    /// 0 for nodes on their component start's line, 1 elsewhere.
    pub row: IndexMap<&'a str, i64>,
}

/// `layeredPlace(graph, flows, sizes, titled, slotArtifacts)`.
///
/// Sugiyama layout of one lane-free scope: columns by longest path with a
/// network-simplex pull, dummy nodes for long flows, median/transpose ordering,
/// Brandes–Köpf centre lines and orthogonal routing with one track per jog in
/// each gutter. Boundary events dock as in the semantic engine; loops run in
/// corridors past both ends.
pub fn layered_place<'a>(
    graph: &mut SemanticGraph<'a>,
    flows: &'a [BpmnSequenceFlow],
    sizes: &IndexMap<&str, (f64, f64)>,
    titled: &IndexSet<&str>,
    slot_artifacts: bool,
) -> LayeredPlacement<'a> {
    let size = |id: &str| -> (f64, f64) { sizes.get(id).copied().unwrap_or(DEFAULT_SIZE) };
    // Every boundary event's side, so the closures below do not hold the graph
    // while placement writes its ranks.
    let mut sides: IndexMap<&str, i64> = IndexMap::default();
    for events in graph.attachers.values() {
        for event in events {
            sides.insert(
                event.base.id.as_str(),
                boundary_side(event, titled.contains(event.attached_to_ref.as_str())),
            );
        }
    }
    let side_of = |event_id: &str| -> i64 { sides[event_id] };
    let mut extents: IndexMap<&'a str, Extent> = IndexMap::default();
    for node in &graph.nodes {
        let base = node.base();
        let h = size(&base.id).1;
        let label = base
            .name
            .as_deref()
            .filter(|n| !n.is_empty())
            .and_then(|name| external_label_width(node.type_name(), name));
        extents.insert(
            base.id.as_str(),
            Extent {
                above: h / 2.0,
                below: h / 2.0
                    + if label.is_some() {
                        LABEL_OFFSET + LABEL_HEIGHT
                    } else {
                        0.0
                    },
            },
        );
    }
    for (&host, events) in &graph.attachers {
        let h = size(host).1;
        let Some(ext) = extents.get_mut(host) else {
            continue;
        };
        for event in events {
            let named = event.base.name.as_deref().is_some_and(|n| !n.is_empty());
            let reach = h / 2.0
                + BOUNDARY_HANG
                + if named {
                    LABEL_OFFSET + LABEL_HEIGHT
                } else {
                    0.0
                };
            if side_of(&event.base.id) > 0 {
                ext.below = js::max(ext.below, reach);
            } else {
                ext.above = js::max(ext.above, reach);
            }
        }
    }
    let extent = |id: &str| -> Extent {
        extents.get(id).copied().unwrap_or(Extent {
            above: 0.0,
            below: 0.0,
        })
    };
    let height = |id: &str| -> f64 { size(id).1 };
    let bias_of = |flow: &BpmnSequenceFlow| -> f64 {
        sides
            .get(flow.source_ref.as_str())
            .map_or(0.0, |&s| s as f64 * 0.5)
    };
    let has_flow = |graph: &SemanticGraph, id: &str| -> bool {
        graph.outgoing.get(id).is_some_and(|v| !v.is_empty())
            || graph.incoming.get(id).is_some_and(|v| !v.is_empty())
    };

    // Columns, order and centre lines, per component, stacked top to bottom.
    let owners = if slot_artifacts {
        artifact_owners_of(graph)
    } else {
        IndexMap::default()
    };
    let mut loose: Vec<&'a str> = Vec::new();
    let mut parts: Vec<Layering> = Vec::new();
    let mut y: IndexMap<String, f64> = IndexMap::default();
    let mut row: IndexMap<&'a str, i64> = IndexMap::default();
    graph.ranks.clear();
    let mut cursor = 0.0;
    for c in 0..graph.components.len() {
        let members: Vec<&'a str> = graph.components[c]
            .iter()
            .copied()
            .filter(|id| graph.by_id.contains_key(id))
            .collect();
        if members.is_empty() {
            continue;
        }
        if members.len() == 1 && !has_flow(graph, members[0]) {
            if !owners.contains_key(members[0]) {
                loose.push(members[0]);
            }
            continue;
        }
        let start = graph.starts.get(c).copied().unwrap_or(members[0]);
        let stacks = stacked_flows(graph, &members, &side_of);
        let rank = assign_layers(graph, &members, &stacks);
        let mut lg = build_layering(graph, &members, start, &rank, &bias_of);
        order_layers(&mut lg, &stacks);
        let candidates = y_candidates(&lg, &extent);
        let ys = pick_y(graph, &lg, &candidates, &extent, &height, &side_of);
        let mut top = f64::INFINITY;
        let mut bottom = f64::NEG_INFINITY;
        for (id, &v) in ys {
            top = js::min(top, v - extent(id).above);
            bottom = js::max(bottom, v + extent(id).below);
        }
        let dy = cursor - top;
        for (id, &v) in ys {
            y.insert(id.clone(), js::round(v + dy));
        }
        for (id, &r) in &lg.rank {
            if lg.dummies.contains_key(id) {
                continue;
            }
            if let Some((&key, _)) = graph.by_id.get_key_value(id.as_str()) {
                graph.ranks.insert(key, r);
            }
        }
        let spine = y.get(start).copied();
        for &id in &members {
            row.insert(id, if y.get(id).copied() == spine { 0 } else { 1 });
        }
        cursor = js::round(bottom + dy) + COMPONENT_GAP;
        parts.push(lg);
    }
    let graph: &SemanticGraph<'a> = graph;

    // Routes on centre lines: which flows jog in which gutter.
    let mut columns: IndexMap<i64, Vec<&'a str>> = IndexMap::default();
    for node in &graph.nodes {
        let id = node.base().id.as_str();
        let Some(&r) = graph.ranks.get(id) else {
            continue;
        };
        columns.entry(r).or_default().push(id);
    }
    let mut rank_of: IndexMap<String, i64> = IndexMap::default();
    for lg in &parts {
        for (id, &r) in &lg.rank {
            rank_of.insert(id.clone(), r);
        }
    }
    let mut chain_of: IndexMap<&str, &Vec<String>> = IndexMap::default();
    for lg in &parts {
        for (flow, chain) in &lg.chains {
            chain_of.insert(flow, chain);
        }
    }
    let input = PlanInput {
        graph,
        y: &y,
        rank: &rank_of,
        columns: &columns,
        height: &height,
        side_of: &side_of,
    };
    let mut plans: Vec<Plan> = Vec::new();
    for flow in flows {
        if let Some(chain) = chain_of.get(flow.id.as_str()) {
            plans.push(plan_flow(&input, flow, chain));
        }
    }
    let mut gutters: IndexMap<i64, Vec<Jog>> = IndexMap::default();
    for plan in &plans {
        for jog in jogs_of(plan) {
            gutters.entry(jog.gutter).or_default().push(jog);
        }
    }

    // Column x: widest node, gaps wide enough for labels and tracks.
    let mut col_width: IndexMap<i64, f64> = IndexMap::default();
    for (&r, ids) in &columns {
        for id in ids {
            let w = js::max(col_width.get(&r).copied().unwrap_or(0.0), size(id).0);
            col_width.insert(r, w);
        }
    }
    let mut ranks: Vec<i64> = col_width.keys().copied().collect();
    ranks.sort();
    let gaps = column_gaps(graph, sizes, &col_width, &ranks);
    let mut col_x: IndexMap<i64, f64> = IndexMap::default();
    let mut x = 0.0;
    for (i, r) in ranks.iter().enumerate() {
        if i > 0 {
            let tracks = gutters.get(r).map_or(0, |g| g.len());
            x += js::max(
                gaps.get(r).copied().unwrap_or(0.0),
                (tracks + 1) as f64 * TRACK,
            );
        }
        col_x.insert(*r, x);
        x += col_width.get(r).copied().unwrap_or(0.0);
    }
    let mut bounds: IndexMap<&'a str, Bounds> = IndexMap::default();
    for (&r, ids) in &columns {
        for &id in ids {
            let s = size(id);
            bounds.insert(
                id,
                Bounds {
                    x: col_x.get(&r).copied().unwrap_or(0.0)
                        + (col_width.get(&r).copied().unwrap_or(0.0) - s.0) / 2.0,
                    y: y.get(id).copied().unwrap_or(0.0) - s.1 / 2.0,
                    width: s.0,
                    height: s.1,
                },
            );
        }
    }
    let mut track: IndexMap<String, f64> = IndexMap::default();
    for (&g, jogs) in &gutters {
        let i = ranks.iter().position(|&r| r == g);
        let Some(prev) = i.and_then(|i| i.checked_sub(1)).map(|p| ranks[p]) else {
            continue;
        };
        let left =
            col_x.get(&prev).copied().unwrap_or(0.0) + col_width.get(&prev).copied().unwrap_or(0.0);
        let width = col_x.get(&g).copied().unwrap_or(0.0) - left;
        let ordered = order_tracks(jogs.clone());
        let total = ordered.len();
        for (k, jog) in ordered.iter().enumerate() {
            track.insert(
                format!("{}\u{1}{}", jog.flow, g),
                js::round(left + (width * (k + 1) as f64) / (total + 1) as f64),
            );
        }
    }

    // Docked events, loose nodes and slotted artifacts.
    dock_boundary_events(graph, &mut bounds, titled);
    let mut lx = 0.0;
    for &id in &loose {
        let s = size(id);
        bounds.insert(
            id,
            Bounds {
                x: lx,
                y: cursor,
                width: s.0,
                height: s.1,
            },
        );
        lx += s.0 + LOOSE_GAP;
    }
    place_artifacts(graph, &owners, &mut bounds);

    // Draw: forward flows on their tracks, then loops around them.
    let mut router = Router::new(graph, &bounds);
    let mut routes: IndexMap<&str, Vec<Waypoint>> = IndexMap::default();
    for plan in &plans {
        let drawn = draw_plan(plan, &bounds, &|flow, g| {
            track
                .get(&format!("{flow}\u{1}{g}"))
                .copied()
                .unwrap_or(0.0)
        });
        let points = router.settle(plan.flow, drawn);
        router.commit(&points);
        routes.insert(plan.flow.id.as_str(), points);
    }
    for flow in flows {
        if routes.contains_key(flow.id.as_str())
            || !bounds.contains_key(flow.source_ref.as_str())
            || !bounds.contains_key(flow.target_ref.as_str())
        {
            continue;
        }
        let Some(points) = router.loop_route(flow) else {
            continue;
        };
        router.commit(&points);
        routes.insert(flow.id.as_str(), points);
    }
    let mut edges: Vec<LayoutEdge> = Vec::new();
    for flow in flows {
        if let Some(points) = routes.get(flow.id.as_str()) {
            edges.push(edge_of(flow, points));
        }
    }
    LayeredPlacement { bounds, edges, row }
}
