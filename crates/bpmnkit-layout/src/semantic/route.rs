//! Twin of `layout/semantic/route.ts`.

use super::bands::BandLayout;
use super::graph::SemanticGraph;
use super::place::H_GAP;
use crate::js;
use crate::orthogonal::{route_orthogonal, side_ports, OrthogonalRequest, Port, SideCost};
use crate::types::{Bounds, LayoutEdge, Waypoint};
use bpmnkit_bpmn::model::BpmnSequenceFlow;
use indexmap::{IndexMap, IndexSet};
use std::cell::Cell;

/// Clearance kept between a routed segment and the shapes it passes.
const ROUTING_MARGIN: f64 = 20.0;
/// Stub length before a boundary-event route turns.
const BOUNDARY_STEM: f64 = 20.0;
/// Shapes may be grazed by this much before a route counts as blocked.
const HIT_TOLERANCE: f64 = 2.0;
/// Crossings a direct route may make before a detour is considered instead.
const CROSSING_TOLERANCE: i64 = 0;
/// How many crossings going around has to save to be worth the extra bends.
const DETOUR_PENALTY: i64 = 0;
/// Vertical spacing between two detours sharing the same stretch of diagram.
const CORRIDOR_SPACING: f64 = 20.0;
/// How many lanes deep a corridor may stack before routes are allowed to share.
const CORRIDOR_LANES: usize = 4;

/// Width of one bucket in the x-axis indexes below.
const INDEX_CELL: f64 = 128.0;

/// Items bucketed by the x-range they cover, so a query for a segment's x-span
/// visits only the shapes and routes near it instead of every one in the
/// diagram. An item spanning several buckets is visited once per query: each
/// query takes a fresh stamp and marks the entries it has seen. The stamps are
/// `Cell`s so a query works through `&self`, as the crossings callback needs.
struct XIndex<T> {
    cells: IndexMap<i64, Vec<usize>>,
    entries: Vec<(T, Cell<u64>)>,
    stamp: Cell<u64>,
}

/// `Math.floor(Math.min(a, b) / INDEX_CELL)` .. `Math.floor(Math.max(a, b) / INDEX_CELL)`,
/// or `None` when the TS loop would not run (NaN bounds).
fn cell_range(min_x: f64, max_x: f64) -> Option<(i64, i64)> {
    let lo = (js::min(min_x, max_x) / INDEX_CELL).floor();
    let hi = (js::max(min_x, max_x) / INDEX_CELL).floor();
    if lo.is_nan() || hi.is_nan() || lo > hi {
        return None;
    }
    Some((lo as i64, hi as i64))
}

impl<T> XIndex<T> {
    fn new() -> Self {
        XIndex {
            cells: IndexMap::new(),
            entries: Vec::new(),
            stamp: Cell::new(0),
        }
    }

    fn insert(&mut self, min_x: f64, max_x: f64, item: T) {
        let entry = self.entries.len();
        self.entries.push((item, Cell::new(0)));
        let Some((lo, hi)) = cell_range(min_x, max_x) else {
            return;
        };
        for c in lo..=hi {
            self.cells.entry(c).or_default().push(entry);
        }
    }

    /// Visit every item whose x-range may overlap [min_x, max_x]; stop early when `visit` returns true.
    fn query(&self, min_x: f64, max_x: f64, mut visit: impl FnMut(&T) -> bool) -> bool {
        let stamp = self.stamp.get() + 1;
        self.stamp.set(stamp);
        let Some((lo, hi)) = cell_range(min_x, max_x) else {
            return false;
        };
        for c in lo..=hi {
            let Some(cell) = self.cells.get(&c) else {
                continue;
            };
            for &e in cell {
                let (item, seen) = &self.entries[e];
                if seen.get() == stamp {
                    continue;
                }
                seen.set(stamp);
                if visit(item) {
                    return true;
                }
            }
        }
        false
    }
}

struct Obstacle<'r> {
    /// Stands in for the object identity TS's `Set<Obstacle>` keys on.
    idx: usize,
    id: &'r str,
    b: Bounds,
}

struct Reserved {
    left: f64,
    right: f64,
    y: f64,
}

type RoutedSegment<'r> = (Waypoint, Waypoint, &'r str, &'r str);

struct RouteContext<'r, 'a> {
    graph: &'r SemanticGraph<'a>,
    bounds: &'r IndexMap<String, Bounds>,
    /// Every shape, indexed by x-range.
    obstacles: XIndex<Obstacle<'r>>,
    /// Mid-x of the clear gutter in front of each rank.
    gutter_x: &'r IndexMap<i64, f64>,
    /// Corridors already taken by detours, so parallel runs stack instead of merging.
    reserved: Vec<Reserved>,
    /// Segments of the edges routed so far, indexed by x-range, to keep new routes
    /// off them; each carries its flow's source and target ids.
    routed: XIndex<RoutedSegment<'r>>,
}

fn centre(b: &Bounds) -> Waypoint {
    Waypoint {
        x: b.x + b.width / 2.0,
        y: b.y + b.height / 2.0,
    }
}

fn wp(x: f64, y: f64) -> Waypoint {
    Waypoint { x, y }
}

/// A clear route and how many routed edges it crosses.
struct Picked {
    waypoints: Vec<Waypoint>,
    crossings: i64,
}

struct Pending<'r> {
    flow: &'r BpmnSequenceFlow,
    source: Bounds,
    target: Bounds,
    source_rank: Option<i64>,
    target_rank: Option<i64>,
    below: bool,
    span: f64,
    /// Best clear route found without a detour, if there was one.
    direct: Option<Picked>,
}

fn is_boundary(graph: &SemanticGraph, id: &str) -> bool {
    graph
        .by_id
        .get(id)
        .is_some_and(|el| el.type_name() == "boundaryEvent")
}

/// `routeFlows(graph, flows, bounds, bandLayout, gutterX)`: route every sequence flow
/// orthogonally.
///
/// Each edge proposes candidate polylines from most to least desirable and takes
/// the first one that clears every unrelated shape: a straight run along the
/// spine, a turn out of the source's top or bottom for a branch, and a turn in
/// the empty gutter in front of the target's column as the general fallback.
pub fn route_flows(
    graph: &SemanticGraph,
    flows: &[BpmnSequenceFlow],
    bounds: &IndexMap<String, Bounds>,
    band_layout: &BandLayout,
    gutter_x: &IndexMap<i64, f64>,
) -> Vec<LayoutEdge> {
    // TS takes the band layout too but never reads it.
    let _ = band_layout;
    let mut obstacles = XIndex::new();
    for (idx, (id, b)) in bounds.iter().enumerate() {
        obstacles.insert(
            b.x,
            b.x + b.width,
            Obstacle {
                idx,
                id: id.as_str(),
                b: *b,
            },
        );
    }
    let mut ctx = RouteContext {
        graph,
        bounds,
        obstacles,
        gutter_x,
        reserved: Vec::new(),
        routed: XIndex::new(),
    };
    let mut routed: IndexMap<&str, Vec<Waypoint>> = IndexMap::new();
    let mut pending: Vec<Pending> = Vec::new();

    for flow in flows {
        let (Some(source), Some(target)) = (
            bounds.get(&flow.source_ref).copied(),
            bounds.get(&flow.target_ref).copied(),
        ) else {
            continue;
        };

        let from_boundary = is_boundary(graph, &flow.source_ref);
        let source_rank = graph
            .ranks
            .get(if from_boundary {
                host_of(graph, &flow.source_ref)
            } else {
                flow.source_ref.as_str()
            })
            .copied();
        let target_rank = graph.ranks.get(&flow.target_ref).copied();
        let is_back_edge = graph.back_edges.contains(&flow.id);

        let direct = if is_back_edge {
            Vec::new()
        } else if from_boundary {
            from_boundary_candidates(
                &ctx,
                &source,
                bounds.get(host_of(graph, &flow.source_ref)),
                &target,
                target_rank,
            )
        } else {
            forward_candidates(&ctx, &source, &target, source_rank, target_rank)
        };

        let clear = pick(direct, &ctx, &flow.source_ref, &flow.target_ref);
        if let Some(c) = &clear {
            if c.crossings <= CROSSING_TOLERANCE {
                let waypoints = clear.map(|c| c.waypoints).unwrap_or_default();
                commit(&mut ctx, &mut routed, flow, waypoints);
                continue;
            }
        }
        pending.push(Pending {
            flow,
            source,
            target,
            source_rank,
            target_rank,
            below: is_back_edge,
            span: (target.x - source.x).abs(),
            direct: clear,
        });
    }

    // Widest detours claim the outermost corridors, so long routes nest around
    // short ones instead of crossing them.
    pending.sort_by(|a, b| js::cmp_num(b.span, a.span));
    for item in pending {
        let src = item.flow.source_ref.as_str();
        let tgt = item.flow.target_ref.as_str();
        let around = detour(
            &mut ctx,
            &item.source,
            &item.target,
            item.source_rank,
            item.target_rank,
            item.below,
            src,
            tgt,
        );
        // Going around costs bends and length, so it has to save more than one
        // crossing to be worth taking.
        let cost = crossing_count(&around, &ctx, Some(src), Some(tgt)) + DETOUR_PENALTY;
        let chosen = match item.direct {
            Some(d) if d.crossings <= cost => d.waypoints,
            _ => around,
        };
        let waypoints = if blocked(&ctx, &chosen, src, tgt) {
            search_route(&ctx, item.flow, &item.source, &item.target).unwrap_or(chosen)
        } else {
            chosen
        };
        commit(&mut ctx, &mut routed, item.flow, waypoints);
    }

    // Emit in declaration order, whichever pass produced the route.
    let mut edges = Vec::new();
    for flow in flows {
        let Some(waypoints) = routed.get(flow.id.as_str()) else {
            continue;
        };
        edges.push(LayoutEdge {
            id: flow.id.clone(),
            source_ref: flow.source_ref.clone(),
            target_ref: flow.target_ref.clone(),
            waypoints: collapse(waypoints),
            label: flow.name.clone().filter(|n| !n.is_empty()),
            label_bounds: None,
        });
    }
    edges
}

/// Last resort for an edge every candidate route runs through a shape: a full
/// obstacle-aware search. Leaving right and entering left stay preferred, so the
/// result still reads left to right where the diagram has room for it.
fn search_route(
    ctx: &RouteContext,
    flow: &BpmnSequenceFlow,
    source: &Bounds,
    target: &Bounds,
) -> Option<Vec<Waypoint>> {
    let from_boundary = is_boundary(ctx.graph, &flow.source_ref);
    let from: Vec<Port> = if from_boundary {
        // A boundary event never leaves into its host: only the outward side.
        let host = ctx.bounds.get(host_of(ctx.graph, &flow.source_ref));
        let on_top = host.is_some_and(|h| source.y + source.height / 2.0 <= h.y + 1.0);
        side_ports(
            source,
            &SideCost {
                top: Some(if on_top { 0.0 } else { f64::INFINITY }),
                bottom: Some(if on_top { f64::INFINITY } else { 0.0 }),
                left: Some(f64::INFINITY),
                right: Some(f64::INFINITY),
            },
        )
    } else {
        side_ports(
            source,
            &SideCost {
                right: Some(0.0),
                top: Some(20.0),
                bottom: Some(20.0),
                left: Some(80.0),
            },
        )
    };
    let to = side_ports(
        target,
        &SideCost {
            left: Some(0.0),
            top: Some(20.0),
            bottom: Some(20.0),
            right: Some(80.0),
        },
    );
    let mut obstacles = Vec::new();
    for (id, b) in ctx.bounds {
        if *id != flow.source_ref && *id != flow.target_ref {
            obstacles.push(*b);
        }
    }
    let crossings = |a: &Waypoint, b: &Waypoint| crossing_count(&[*a, *b], ctx, None, None) as f64;
    route_orthogonal(&OrthogonalRequest {
        from,
        to,
        obstacles,
        crossings: Some(&crossings),
        margin: None,
    })
}

/// Record a chosen route so later edges can steer around it.
fn commit<'r>(
    ctx: &mut RouteContext<'r, '_>,
    routed: &mut IndexMap<&'r str, Vec<Waypoint>>,
    flow: &'r BpmnSequenceFlow,
    waypoints: Vec<Waypoint>,
) {
    for pair in waypoints.windows(2) {
        let (a, b) = (pair[0], pair[1]);
        ctx.routed.insert(
            js::min(a.x, b.x),
            js::max(a.x, b.x),
            (a, b, flow.source_ref.as_str(), flow.target_ref.as_str()),
        );
    }
    routed.insert(flow.id.as_str(), waypoints);
}

fn host_of<'g>(graph: &'g SemanticGraph, event_id: &'g str) -> &'g str {
    for (host_id, events) in &graph.attachers {
        if events.iter().any(|e| e.base.id == event_id) {
            return host_id;
        }
    }
    event_id
}

/// First candidate that crosses no shape other than its own endpoints.
fn pick(
    candidates: Vec<Vec<Waypoint>>,
    ctx: &RouteContext,
    source_id: &str,
    target_id: &str,
) -> Option<Picked> {
    let mut best: Option<Picked> = None;
    for candidate in candidates {
        // An expanded container legitimately holds its children's routes, so only
        // the two endpoints are exempt from the obstacle check.
        if blocked(ctx, &candidate, source_id, target_id) {
            continue;
        }
        let crossings = crossing_count(&candidate, ctx, Some(source_id), Some(target_id));
        if crossings == 0 {
            return Some(Picked {
                waypoints: candidate,
                crossings,
            });
        }
        if best.as_ref().is_none_or(|b| crossings < b.crossings) {
            best = Some(Picked {
                waypoints: candidate,
                crossings,
            });
        }
    }
    best
}

/// `Math.sign`: keeps ±0 and NaN, unlike [`f64::signum`].
fn sign(v: f64) -> f64 {
    if v > 0.0 {
        1.0
    } else if v < 0.0 {
        -1.0
    } else {
        v
    }
}

/// Proper intersection between two segments — touching endpoints do not count.
fn intersects(p: &Waypoint, q: &Waypoint, r: &Waypoint, t: &Waypoint) -> bool {
    let side = |o: &Waypoint, a: &Waypoint, b: &Waypoint| {
        sign((a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x))
    };
    side(p, q, r) != side(p, q, t) && side(r, t, p) != side(r, t, q)
}

/// How many already-routed edges a candidate would cut across, or run along:
/// a stretch drawn on top of an unrelated flow reads as one line and hides
/// where either goes. Flows sharing an endpoint may merge, as a join's do.
fn crossing_count(
    waypoints: &[Waypoint],
    ctx: &RouteContext,
    source_id: Option<&str>,
    target_id: Option<&str>,
) -> i64 {
    let mut count = 0;
    for pair in waypoints.windows(2) {
        let (a, b) = (&pair[0], &pair[1]);
        ctx.routed
            .query(js::min(a.x, b.x), js::max(a.x, b.x), |(c, d, from, to)| {
                if intersects(a, b, c, d) {
                    count += 1;
                } else if source_id.is_some()
                    && Some(*from) != source_id
                    && Some(*to) != target_id
                    && collinear_overlap(a, b, c, d)
                {
                    // Worse than a clean crossing: the reader cannot tell the two apart.
                    count += 2;
                }
                false
            });
    }
    count
}

/// True when two axis-parallel segments lie on one line and share more than a point.
fn collinear_overlap(a: &Waypoint, b: &Waypoint, c: &Waypoint, d: &Waypoint) -> bool {
    let shared = |p: f64, q: f64, r: f64, t: f64| {
        js::min(js::max(p, q), js::max(r, t)) - js::max(js::min(p, q), js::min(r, t))
            > HIT_TOLERANCE
    };
    if (a.x - b.x).abs() < 1.0 && (c.x - d.x).abs() < 1.0 && (a.x - c.x).abs() < 1.0 {
        return shared(a.y, b.y, c.y, d.y);
    }
    if (a.y - b.y).abs() < 1.0 && (c.y - d.y).abs() < 1.0 && (a.y - c.y).abs() < 1.0 {
        return shared(a.x, b.x, c.x, d.x);
    }
    false
}

/// True when the segment a→b passes through `o`, grazing allowed up to HIT_TOLERANCE.
fn segment_hits(a: &Waypoint, b: &Waypoint, o: &Bounds) -> bool {
    let min_x = js::min(a.x, b.x) + HIT_TOLERANCE;
    let max_x = js::max(a.x, b.x) - HIT_TOLERANCE;
    let min_y = js::min(a.y, b.y) + HIT_TOLERANCE;
    let max_y = js::max(a.y, b.y) - HIT_TOLERANCE;
    if max_x <= o.x || o.x + o.width <= min_x {
        return false;
    }
    if max_y <= o.y || o.y + o.height <= min_y {
        return false;
    }
    true
}

/// How many shapes a route passes through, its own endpoints excepted.
fn hit_count(
    ctx: &RouteContext,
    waypoints: &[Waypoint],
    source_id: &str,
    target_id: &str,
) -> usize {
    let mut hit: IndexSet<usize> = IndexSet::new();
    for pair in waypoints.windows(2) {
        let (a, b) = (&pair[0], &pair[1]);
        ctx.obstacles
            .query(js::min(a.x, b.x), js::max(a.x, b.x), |o| {
                if o.id != source_id && o.id != target_id && segment_hits(a, b, &o.b) {
                    hit.insert(o.idx);
                }
                false
            });
    }
    hit.len()
}

/// True when any segment of the route passes through a shape other than its endpoints.
fn blocked(ctx: &RouteContext, waypoints: &[Waypoint], source_id: &str, target_id: &str) -> bool {
    for pair in waypoints.windows(2) {
        let (a, b) = (&pair[0], &pair[1]);
        let hit = ctx
            .obstacles
            .query(js::min(a.x, b.x), js::max(a.x, b.x), |o| {
                o.id != source_id && o.id != target_id && segment_hits(a, b, &o.b)
            });
        if hit {
            return true;
        }
    }
    false
}

/// `ctx.gutterX.get(sourceRank + 1) ?? source.x + source.width + H_GAP / 2`.
fn behind_x(ctx: &RouteContext, source: &Bounds, source_rank: Option<i64>) -> f64 {
    let fallback = source.x + source.width + H_GAP / 2.0;
    match source_rank {
        Some(rank) => ctx.gutter_x.get(&(rank + 1)).copied().unwrap_or(fallback),
        None => fallback,
    }
}

/// `ctx.gutterX.get(targetRank ?? 0) ?? target.x - H_GAP / 2`.
fn front_x(ctx: &RouteContext, target: &Bounds, target_rank: Option<i64>) -> f64 {
    ctx.gutter_x
        .get(&target_rank.unwrap_or(0))
        .copied()
        .unwrap_or(target.x - H_GAP / 2.0)
}

/// Candidates for a normal forward flow, best first: a straight spine segment,
/// a branch leaving through the source's top or bottom, then the gutter turn.
fn forward_candidates(
    ctx: &RouteContext,
    source: &Bounds,
    target: &Bounds,
    source_rank: Option<i64>,
    target_rank: Option<i64>,
) -> Vec<Vec<Waypoint>> {
    let from = centre(source);
    let to = centre(target);
    let right_of = target.x >= source.x + source.width;

    if (from.y - to.y).abs() < 1.0 && right_of {
        return vec![vec![
            wp(source.x + source.width, from.y),
            wp(target.x, to.y),
        ]];
    }

    // A tall container hangs from the task line, so the other end's centre falls
    // within its height: dock there and the flow stays straight.
    if right_of {
        let in_target = from.y > target.y && from.y < target.y + target.height;
        let in_source = to.y > source.y && to.y < source.y + source.height;
        if in_target || in_source {
            // Both centres inside each other: the smaller shape's line is the row's.
            let y = if in_target && (!in_source || source.height <= target.height) {
                from.y
            } else {
                to.y
            };
            return vec![vec![wp(source.x + source.width, y), wp(target.x, y)]];
        }
    }

    // Same column, different band: drop straight between the two.
    if source_rank.is_some() && source_rank == target_rank {
        let down = to.y > from.y;
        return vec![vec![
            wp(
                from.x,
                if down {
                    source.y + source.height
                } else {
                    source.y
                },
            ),
            wp(
                to.x,
                if down {
                    target.y
                } else {
                    target.y + target.height
                },
            ),
        ]];
    }

    if !right_of {
        return Vec::new();
    }

    let down = to.y > from.y;
    let gutter = front_x(ctx, target, target_rank);
    let behind = behind_x(ctx, source, source_rank);
    let mut candidates = vec![
        // Branch: leave through the side facing the target band, then run in.
        vec![
            wp(
                from.x,
                if down {
                    source.y + source.height
                } else {
                    source.y
                },
            ),
            wp(from.x, to.y),
            wp(target.x, to.y),
        ],
        // Gutter turn in front of the target: out of the right edge, across, in.
        vec![
            wp(source.x + source.width, from.y),
            wp(gutter, from.y),
            wp(gutter, to.y),
            wp(target.x, to.y),
        ],
    ];

    // Turning in the gutter right behind the source instead reaches the target
    // band early; which of the two crosses less depends on what is already
    // routed, so both are offered.
    if (behind - gutter).abs() > 1.0 {
        candidates.push(vec![
            wp(source.x + source.width, from.y),
            wp(behind, from.y),
            wp(behind, to.y),
            wp(target.x, to.y),
        ]);
    }

    candidates
}

/// A boundary event leaves through its outward side, never into its host.
///
/// The side is where the event is docked, not where the target lies: lanes can
/// put a handler above a host whose event sits on its bottom border. A target
/// behind the docked side is reached around the stem, not straight at it.
fn from_boundary_candidates(
    ctx: &RouteContext,
    source: &Bounds,
    host: Option<&Bounds>,
    target: &Bounds,
    target_rank: Option<i64>,
) -> Vec<Vec<Waypoint>> {
    let from = centre(source);
    let to = centre(target);
    // Same side test as searchRoute and the label placement.
    let down = match host {
        None => to.y >= from.y,
        Some(h) => from.y > h.y + 1.0,
    };
    let exit_y = if down {
        source.y + source.height
    } else {
        source.y
    };
    let stem = if down {
        exit_y + BOUNDARY_STEM
    } else {
        exit_y - BOUNDARY_STEM
    };
    let ahead = if down { to.y >= exit_y } else { to.y <= exit_y };

    if ahead && (from.x - to.x).abs() < 1.0 {
        return vec![vec![
            wp(from.x, exit_y),
            wp(
                to.x,
                if down {
                    target.y
                } else {
                    target.y + target.height
                },
            ),
        ]];
    }

    if target.x >= from.x {
        let gutter = front_x(ctx, target, target_rank);
        let around = vec![
            wp(from.x, exit_y),
            wp(from.x, stem),
            wp(gutter, stem),
            wp(gutter, to.y),
            wp(target.x, to.y),
        ];
        // The gutter can already carry another flow's vertical run; beside it is clear.
        let beside: Vec<Vec<Waypoint>> = [-1.0, 1.0]
            .iter()
            .map(|side| {
                around
                    .iter()
                    .enumerate()
                    .map(|(i, p)| {
                        if i == 2 || i == 3 {
                            wp(gutter + (side * CORRIDOR_SPACING) / 2.0, p.y)
                        } else {
                            *p
                        }
                    })
                    .collect()
            })
            .collect();
        let mut out = Vec::new();
        if ahead {
            out.push(vec![
                wp(from.x, exit_y),
                wp(from.x, to.y),
                wp(target.x, to.y),
            ]);
        }
        out.push(around);
        out.extend(beside);
        return out;
    }

    vec![vec![
        wp(from.x, exit_y),
        wp(from.x, stem),
        wp(target.x + target.width, stem),
        wp(target.x + target.width, to.y),
    ]]
}

/// The universal fallback: leave through the gutter behind the source, cross in
/// the nearest horizontal corridor that clears every shape between the two
/// columns, and come back through the gutter in front of the target. Used for
/// feedback edges and for any forward edge whose direct routes are blocked.
#[allow(clippy::too_many_arguments)]
fn detour(
    ctx: &mut RouteContext,
    source: &Bounds,
    target: &Bounds,
    source_rank: Option<i64>,
    target_rank: Option<i64>,
    // A loop reads as a loop when it runs clear of the flow it repeats.
    is_loop: bool,
    source_id: &str,
    target_id: &str,
) -> Vec<Waypoint> {
    let from = centre(source);
    let to = centre(target);
    let drop_x = behind_x(ctx, source, source_rank);
    let rise_x = front_x(ctx, target, target_rank);
    let left = js::min(js::min(js::min(drop_x, rise_x), from.x), to.x);
    let right = js::max(js::max(js::max(drop_x, rise_x), from.x), to.x);
    // A loop leaves the band it repeats: below by convention, but above when the
    // space below is busy and the space above is not. Anything else takes the
    // nearest clear corridor, whichever side that is on.
    let middle = (from.y + to.y) / 2.0;
    let bottom = js::max(source.y + source.height, target.y + target.height);
    let top = js::min(source.y, target.y);
    let options = if is_loop {
        vec![
            corridor(ctx, left, right, middle, Some(bottom), None),
            corridor(ctx, left, right, middle, None, Some(top)),
        ]
    } else {
        vec![corridor(ctx, left, right, middle, None, None)]
    };

    let mut base = options[0];
    if is_loop {
        let mut fewest = i64::MAX;
        for &option in &options {
            let crossings = crossing_count(&[wp(left, option), wp(right, option)], ctx, None, None);
            if crossings < fewest {
                fewest = crossings;
                base = option;
            }
        }
    }

    let goes_down = base > middle;
    let corridor_y = reserve(ctx, left, right, base, if goes_down { 1.0 } else { -1.0 });

    // Each end faces the corridor on its own: a corridor between the two runs
    // below one shape and above the other, and docking on the far side would
    // cut straight across the shape.
    let exit_y = if corridor_y > from.y {
        source.y + source.height
    } else {
        source.y
    };
    let entry_y = if corridor_y > to.y {
        target.y + target.height
    } else {
        target.y
    };

    // Leaving through the source's own top or bottom keeps the route out of the
    // horizontal corridor its neighbours flow along; the gutter variant is the
    // fallback for when that vertical is occupied.
    let straight_out = vec![
        wp(from.x, exit_y),
        wp(from.x, corridor_y),
        wp(to.x, corridor_y),
        wp(to.x, entry_y),
    ];
    let via_gutter = vec![
        wp(source.x + source.width, from.y),
        wp(drop_x, from.y),
        wp(drop_x, corridor_y),
        wp(rise_x, corridor_y),
        wp(rise_x, to.y),
        wp(target.x, to.y),
    ];

    if let Some(chosen) = pick(
        vec![straight_out.clone(), via_gutter.clone()],
        ctx,
        source_id,
        target_id,
    ) {
        return chosen.waypoints;
    }

    // Neither is clear: keep whichever grazes fewer shapes.
    if hit_count(ctx, &straight_out, source_id, target_id)
        <= hit_count(ctx, &via_gutter, source_id, target_id)
    {
        straight_out
    } else {
        via_gutter
    }
}

/// Keep parallel detours apart: step away from the flow until this stretch of
/// corridor is free, so two long routes stack instead of merging into one line.
fn reserve(ctx: &mut RouteContext, left: f64, right: f64, base: f64, direction: f64) -> f64 {
    let hits_shape = |ctx: &RouteContext, candidate: f64| -> bool {
        ctx.obstacles.query(left, right, |o| {
            let b = &o.b;
            b.x + b.width > left
                && b.x < right
                && b.y - HIT_TOLERANCE < candidate
                && candidate < b.y + b.height + HIT_TOLERANCE
        })
    };

    let mut y = base;
    let mut free = base;
    for _ in 0..CORRIDOR_LANES {
        if !hits_shape(ctx, y) {
            free = y;
            let taken = ctx
                .reserved
                .iter()
                .any(|r| r.left < right && left < r.right && (r.y - y).abs() < CORRIDOR_SPACING);
            if !taken {
                break;
            }
        }
        y += direction * CORRIDOR_SPACING;
    }
    // Sharing a corridor with another route is a lesser evil than running the
    // route through a shape, so fall back to the last line that was clear.
    if hits_shape(ctx, y) {
        y = free;
    }
    ctx.reserved.push(Reserved { left, right, y });
    y
}

/// A horizontal line between `left` and `right` that misses every shape, chosen
/// as close to `preferred_y` as possible so detours stay local instead of
/// sweeping around the whole diagram. `floor` / `ceiling`: only consider
/// corridors below / above that line.
fn corridor(
    ctx: &RouteContext,
    left: f64,
    right: f64,
    preferred_y: f64,
    floor: Option<f64>,
    ceiling: Option<f64>,
) -> f64 {
    let mut spans: Vec<(f64, f64)> = Vec::new();
    ctx.obstacles.query(left, right, |o| {
        let b = &o.b;
        if b.x + b.width > left && b.x < right {
            spans.push((b.y - ROUTING_MARGIN, b.y + b.height + ROUTING_MARGIN));
        }
        false
    });
    if spans.is_empty() {
        return preferred_y;
    }
    spans.sort_by(|a, b| js::cmp_num(a.0, b.0));

    // Merge the blocked bands, then take the gap centre nearest the preference.
    let mut merged: Vec<(f64, f64)> = Vec::new();
    for span in spans {
        match merged.last_mut() {
            Some(last) if span.0 <= last.1 => last.1 = js::max(last.1, span.1),
            _ => merged.push(span),
        }
    }

    let mut options: Vec<f64> = Vec::new();
    if let Some(first) = merged.first() {
        options.push(first.0 - ROUTING_MARGIN);
    }
    if let Some(last) = merged.last() {
        options.push(last.1 + ROUTING_MARGIN);
    }
    for pair in merged.windows(2) {
        options.push((pair[0].1 + pair[1].0) / 2.0);
    }

    let mut allowed: Vec<f64> = match floor {
        None => options.clone(),
        Some(f) => options.iter().copied().filter(|&y| y > f).collect(),
    };
    if let Some(c) = ceiling {
        allowed.retain(|&y| y < c);
    }
    let usable = if !allowed.is_empty() {
        allowed
    } else {
        options
    };
    let mut best = usable.first().copied().unwrap_or(preferred_y);
    for &option in &usable {
        if (option - preferred_y).abs() < (best - preferred_y).abs() {
            best = option;
        }
    }
    best
}

/// Drop duplicate points and mid-points that sit on a straight run.
fn collapse(waypoints: &[Waypoint]) -> Vec<Waypoint> {
    let mut out: Vec<Waypoint> = Vec::new();
    for &p in waypoints {
        if let Some(last) = out.last() {
            if last.x == p.x && last.y == p.y {
                continue;
            }
        }
        out.push(p);
    }
    let mut i = out.len() as i64 - 2;
    while i > 0 {
        let k = i as usize;
        let (prev, cur, next) = (out[k - 1], out[k], out[k + 1]);
        let collinear =
            (prev.x == cur.x && cur.x == next.x) || (prev.y == cur.y && cur.y == next.y);
        if collinear {
            out.remove(k);
        }
        i -= 1;
    }
    out
}
