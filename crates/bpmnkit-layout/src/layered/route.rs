//! Twin of `layout/layered/route.ts`: plans, jogs, tracks, loops.

use crate::hash::{IndexMap, IndexSet};
use crate::js::{self, cmp_num};
use crate::orthogonal::{route_orthogonal, side_ports, OrthogonalRequest, SideCost};
use crate::semantic::graph::SemanticGraph;
use crate::types::{Bounds, LayoutEdge, Waypoint};
use bpmnkit_bpmn::model::{BpmnFlowElement, BpmnSequenceFlow};

/// Clearance of a boundary handler's stem and of a loop corridor from the shapes it passes.
const STEM: f64 = 20.0;
/// Spacing between parallel loop corridors.
const LOOP_STEP: f64 = 10.0;

fn is_gateway(kind: &str) -> bool {
    matches!(
        kind,
        "exclusiveGateway"
            | "parallelGateway"
            | "inclusiveGateway"
            | "eventBasedGateway"
            | "complexGateway"
    )
}

/// Where a flow leaves its source: right: out of the source's right side; side: a
/// split's top or bottom; event / stem: out of a boundary event.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Exit {
    Right,
    Side,
    Event,
    Stem,
    Stack,
}

/// Where a flow enters its target: left: into the target's left side; side: into
/// a join's top or bottom.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Entry {
    Left,
    Side,
}

/// How one forward flow runs, decided on centre lines before any x exists:
/// `ys[i]` is the line it follows through chain element `i`, and every change
/// of line between two columns is a jog on a track in the gutter between them.
#[derive(Debug, Clone)]
pub struct Plan<'f> {
    pub flow: &'f BpmnSequenceFlow,
    pub chain: Vec<String>,
    pub ranks: Vec<i64>,
    pub ys: Vec<f64>,
    pub exit: Exit,
    pub entry: Entry,
}

/// A vertical run in the gutter in front of column `gutter`.
#[derive(Debug, Clone)]
pub struct Jog {
    pub flow: String,
    pub gutter: i64,
    pub from: f64,
    pub to: f64,
}

pub struct PlanInput<'x, 'a> {
    pub graph: &'x SemanticGraph<'a>,
    /// Centre y of every chain element (nodes and dummies).
    pub y: &'x IndexMap<String, f64>,
    pub rank: &'x IndexMap<String, i64>,
    /// Real nodes per column, for clear-column checks.
    pub columns: &'x IndexMap<i64, Vec<&'x str>>,
    pub height: &'x dyn Fn(&str) -> f64,
    /// +1 when the boundary event docks below its host, -1 above.
    pub side_of: &'x dyn Fn(&str) -> i64,
}

fn type_of<'a>(graph: &SemanticGraph<'a>, id: &str) -> &'a str {
    graph.by_id.get(id).map_or("", |el| el.type_name())
}

fn is_boundary(graph: &SemanticGraph, id: &str) -> bool {
    matches!(
        graph.by_id.get(id).copied(),
        Some(BpmnFlowElement::BoundaryEvent(_))
    )
}

fn forward_count(graph: &SemanticGraph, id: &str, out: bool) -> usize {
    let flows = if out {
        graph.outgoing.get(id)
    } else {
        graph.incoming.get(id)
    };
    flows.map_or(0, |v| {
        v.iter()
            .filter(|f| !graph.back_edges.contains(f.id.as_str()))
            .count()
    })
}

/// No other node of column `rank` sits between the two lines.
fn column_clear(input: &PlanInput, rank: i64, this: &str, y1: f64, y2: f64) -> bool {
    let lo = js::min(y1, y2);
    let hi = js::max(y1, y2);
    for id in input.columns.get(&rank).map_or(&[][..], |v| v.as_slice()) {
        if *id == this {
            continue;
        }
        let y = input.y.get(*id).copied().unwrap_or(0.0);
        let h = (input.height)(id) / 2.0;
        if y + h > lo && y - h < hi {
            return false;
        }
    }
    true
}

pub fn plan_flow<'f>(input: &PlanInput, flow: &'f BpmnSequenceFlow, chain: &[String]) -> Plan<'f> {
    let graph = input.graph;
    let ranks: Vec<i64> = chain
        .iter()
        .map(|id| input.rank.get(id.as_str()).copied().unwrap_or(0))
        .collect();
    let mut ys: Vec<f64> = chain
        .iter()
        .map(|id| input.y.get(id.as_str()).copied().unwrap_or(0.0))
        .collect();
    let n = chain.len();
    let src = chain[0].as_str();
    let tgt = chain[n - 1].as_str();
    let mut exit = Exit::Right;
    if n == 2 && ranks[0] == ranks[1] {
        return Plan {
            flow,
            chain: chain.to_vec(),
            ranks,
            ys,
            exit: Exit::Stack,
            entry: Entry::Side,
        };
    }
    if is_boundary(graph, &flow.source_ref) {
        let side = (input.side_of)(&flow.source_ref) as f64;
        let port = ys[0] + side * ((input.height)(src) / 2.0 + 18.0);
        let next = ys[1];
        if side * (next - port) >= STEM && column_clear(input, ranks[0], src, port, next) {
            exit = Exit::Event;
            ys[0] = next;
        } else {
            exit = Exit::Stem;
            ys[0] = port + side * STEM;
        }
    } else if is_gateway(type_of(graph, src))
        && forward_count(graph, src, true) > 1
        && ys[1] != ys[0]
        && column_clear(input, ranks[0], src, ys[0], ys[1])
    {
        exit = Exit::Side;
        ys[0] = ys[1];
    }
    let mut entry = Entry::Left;
    if n > 1
        && is_gateway(type_of(graph, tgt))
        && forward_count(graph, tgt, false) > 1
        && ys[n - 2] != ys[n - 1]
        && column_clear(input, ranks[n - 1], tgt, ys[n - 2], ys[n - 1])
    {
        entry = Entry::Side;
        ys[n - 1] = ys[n - 2];
    }
    Plan {
        flow,
        chain: chain.to_vec(),
        ranks,
        ys,
        exit,
        entry,
    }
}

pub fn jogs_of(plan: &Plan) -> Vec<Jog> {
    let mut jogs = Vec::new();
    for i in 0..plan.ys.len().saturating_sub(1) {
        let from = plan.ys[i];
        let to = plan.ys[i + 1];
        if from != to && plan.ranks[i] != plan.ranks[i + 1] {
            jogs.push(Jog {
                flow: plan.flow.id.clone(),
                gutter: plan.ranks[i + 1],
                from,
                to,
            });
        }
    }
    jogs
}

fn within(y: f64, a: f64, b: f64) -> bool {
    y > js::min(a, b) && y < js::max(a, b)
}

/// Crossings when `a` takes the track left of `b`.
fn cost(a: &Jog, b: &Jog) -> i32 {
    i32::from(within(a.to, b.from, b.to)) + i32::from(within(b.from, a.from, a.to))
}

/// Order one gutter's jogs left to right: from top-down sorted entry lines,
/// swap neighbours while that saves crossings.
pub fn order_tracks(jogs: Vec<Jog>) -> Vec<Jog> {
    let mut out = jogs;
    // `a.from - b.from || a.to - b.to`: the second key breaks ties of the first.
    out.sort_by(|a, b| cmp_num(a.from, b.from).then_with(|| cmp_num(a.to, b.to)));
    for _pass in 0..out.len() {
        let mut swapped = false;
        for i in 0..out.len().saturating_sub(1) {
            if cost(&out[i + 1], &out[i]) < cost(&out[i], &out[i + 1]) {
                out.swap(i, i + 1);
                swapped = true;
            }
        }
        if !swapped {
            break;
        }
    }
    out
}

/// The polyline of a planned flow, once columns and tracks have x positions.
pub fn draw_plan(
    plan: &Plan,
    bounds: &IndexMap<&str, Bounds>,
    track_x: &dyn Fn(&str, i64) -> f64,
) -> Vec<Waypoint> {
    let src = bounds[plan.chain[0].as_str()];
    let tgt = bounds[plan.chain[plan.chain.len() - 1].as_str()];
    let ys = &plan.ys;
    let n = ys.len();
    let mut pts: Vec<Waypoint> = Vec::new();
    let cx = |b: &Bounds| b.x + b.width / 2.0;
    let cy = |b: &Bounds| b.y + b.height / 2.0;
    if plan.exit == Exit::Stack {
        let from = bounds
            .get(plan.flow.source_ref.as_str())
            .copied()
            .unwrap_or(src);
        let down = cy(&tgt) > cy(&from);
        let a = Waypoint {
            x: cx(&from),
            y: if down { from.y + from.height } else { from.y },
        };
        let b = Waypoint {
            x: cx(&tgt),
            y: if down { tgt.y } else { tgt.y + tgt.height },
        };
        if a.x == b.x {
            return vec![a, b];
        }
        let mid = (a.y + b.y) / 2.0;
        return vec![
            a,
            Waypoint { x: a.x, y: mid },
            Waypoint { x: b.x, y: mid },
            b,
        ];
    }
    match plan.exit {
        Exit::Right => pts.push(Waypoint {
            x: src.x + src.width,
            y: ys[0],
        }),
        Exit::Side => {
            pts.push(Waypoint {
                x: cx(&src),
                y: if ys[0] > cy(&src) {
                    src.y + src.height
                } else {
                    src.y
                },
            });
            pts.push(Waypoint {
                x: cx(&src),
                y: ys[0],
            });
        }
        _ => {
            let ev = bounds[plan.flow.source_ref.as_str()];
            pts.push(Waypoint {
                x: cx(&ev),
                y: if ys[0] > cy(&ev) {
                    ev.y + ev.height
                } else {
                    ev.y
                },
            });
            pts.push(Waypoint {
                x: cx(&ev),
                y: ys[0],
            });
        }
    }
    for i in 0..n.saturating_sub(1) {
        if ys[i] == ys[i + 1] {
            continue;
        }
        let x = track_x(&plan.flow.id, plan.ranks[i + 1]);
        pts.push(Waypoint { x, y: ys[i] });
        pts.push(Waypoint { x, y: ys[i + 1] });
    }
    if plan.entry == Entry::Left {
        pts.push(Waypoint {
            x: tgt.x,
            y: ys[n - 1],
        });
    } else {
        pts.push(Waypoint {
            x: cx(&tgt),
            y: ys[n - 1],
        });
        pts.push(Waypoint {
            x: cx(&tgt),
            y: if ys[n - 1] > cy(&tgt) {
                tgt.y + tgt.height
            } else {
                tgt.y
            },
        });
    }
    collapse(&pts)
}

fn collapse(points: &[Waypoint]) -> Vec<Waypoint> {
    let mut out: Vec<Waypoint> = Vec::new();
    for &p in points {
        if let Some(last) = out.last().copied() {
            if last.x == p.x && last.y == p.y {
                continue;
            }
            if out.len() >= 2 {
                let prev = out[out.len() - 2];
                if (prev.x == last.x && last.x == p.x) || (prev.y == last.y && last.y == p.y) {
                    let at = out.len() - 1;
                    out[at] = p;
                    continue;
                }
            }
        }
        out.push(p);
    }
    out
}

fn seg_hits(a: &Waypoint, b: &Waypoint, o: &Bounds) -> bool {
    let x1 = js::min(a.x, b.x);
    let x2 = js::max(a.x, b.x);
    let y1 = js::min(a.y, b.y);
    let y2 = js::max(a.y, b.y);
    x2 > o.x + 1.0 && x1 < o.x + o.width - 1.0 && y2 > o.y + 1.0 && y1 < o.y + o.height - 1.0
}

fn crosses(a: &Waypoint, b: &Waypoint, c: &Waypoint, d: &Waypoint) -> bool {
    let h1 = a.y == b.y;
    let h2 = c.y == d.y;
    if h1 == h2 {
        return false;
    }
    let ((p, q), (r, s)) = if h1 {
        ((a, b), (c, d))
    } else {
        ((c, d), (a, b))
    };
    r.x > js::min(p.x, q.x)
        && r.x < js::max(p.x, q.x)
        && p.y > js::min(r.y, s.y)
        && p.y < js::max(r.y, s.y)
}

pub struct Loop {
    left: f64,
    right: f64,
    y: f64,
}

pub struct Router<'g, 'a, 'b> {
    graph: &'g SemanticGraph<'a>,
    bounds: &'b IndexMap<&'a str, Bounds>,
    segments: Vec<(Waypoint, Waypoint)>,
    loops: Vec<Loop>,
}

impl<'g, 'a, 'b> Router<'g, 'a, 'b> {
    pub fn new(graph: &'g SemanticGraph<'a>, bounds: &'b IndexMap<&'a str, Bounds>) -> Self {
        Router {
            graph,
            bounds,
            segments: Vec::new(),
            loops: Vec::new(),
        }
    }

    pub fn commit(&mut self, points: &[Waypoint]) {
        for pair in points.windows(2) {
            self.segments.push((pair[0], pair[1]));
        }
    }

    /// Shapes a flow may touch: its ends, and the host of a boundary source.
    fn ends(&self, flow: &'a BpmnSequenceFlow) -> IndexSet<&'a str> {
        let mut ends: IndexSet<&'a str> = IndexSet::default();
        ends.insert(flow.source_ref.as_str());
        ends.insert(flow.target_ref.as_str());
        if let Some(BpmnFlowElement::BoundaryEvent(be)) =
            self.graph.by_id.get(flow.source_ref.as_str()).copied()
        {
            ends.insert(be.attached_to_ref.as_str());
        }
        ends
    }

    fn hits(&self, points: &[Waypoint], ends: &IndexSet<&str>) -> bool {
        for (id, b) in self.bounds {
            if ends.contains(id) {
                continue;
            }
            for pair in points.windows(2) {
                if seg_hits(&pair[0], &pair[1], b) {
                    return true;
                }
            }
        }
        false
    }

    fn crossings(&self, points: &[Waypoint]) -> usize {
        let mut n = 0;
        for pair in points.windows(2) {
            for (c, d) in &self.segments {
                if crosses(&pair[0], &pair[1], c, d) {
                    n += 1;
                }
            }
        }
        n
    }

    /// Keep a clear route; replace one through a shape with an obstacle-aware search.
    pub fn settle(&self, flow: &'a BpmnSequenceFlow, points: Vec<Waypoint>) -> Vec<Waypoint> {
        let ends = self.ends(flow);
        if !self.hits(&points, &ends) {
            return points;
        }
        self.search(flow, &ends).unwrap_or(points)
    }

    fn search(&self, flow: &BpmnSequenceFlow, ends: &IndexSet<&str>) -> Option<Vec<Waypoint>> {
        let source = self.bounds.get(flow.source_ref.as_str())?;
        let target = self.bounds.get(flow.target_ref.as_str())?;
        let mut from = side_ports(
            source,
            &SideCost {
                right: Some(0.0),
                top: Some(20.0),
                bottom: Some(20.0),
                left: Some(80.0),
            },
        );
        if let Some(BpmnFlowElement::BoundaryEvent(be)) =
            self.graph.by_id.get(flow.source_ref.as_str()).copied()
        {
            let host = self.bounds.get(be.attached_to_ref.as_str());
            let on_top = host.is_some_and(|h| source.y + source.height / 2.0 <= h.y + 1.0);
            let (top, bottom) = if on_top {
                (0.0, f64::INFINITY)
            } else {
                (f64::INFINITY, 0.0)
            };
            from = side_ports(
                source,
                &SideCost {
                    top: Some(top),
                    bottom: Some(bottom),
                    left: Some(f64::INFINITY),
                    right: Some(f64::INFINITY),
                },
            );
        }
        let obstacles: Vec<Bounds> = self
            .bounds
            .iter()
            .filter(|(id, _)| !ends.contains(**id))
            .map(|(_, b)| *b)
            .collect();
        let crossings = |a: &Waypoint, b: &Waypoint| self.crossings(&[*a, *b]) as f64;
        route_orthogonal(&OrthogonalRequest {
            from,
            to: side_ports(
                target,
                &SideCost {
                    left: Some(0.0),
                    top: Some(20.0),
                    bottom: Some(20.0),
                    right: Some(80.0),
                },
            ),
            obstacles,
            crossings: Some(&crossings),
            margin: None,
        })
    }

    /// A flow back to an earlier column: out of the source's bottom (or top),
    /// along the nearest clear corridor past both ends, into the target's
    /// bottom (or top). The side with fewer crossings wins, then the shorter.
    pub fn loop_route(&mut self, flow: &'a BpmnSequenceFlow) -> Option<Vec<Waypoint>> {
        let source = *self.bounds.get(flow.source_ref.as_str())?;
        let target = *self.bounds.get(flow.target_ref.as_str())?;
        let ends = self.ends(flow);
        let sx = source.x + source.width / 2.0;
        let tx = target.x + target.width / 2.0;
        if flow.source_ref == flow.target_ref {
            let right = source.x + source.width;
            let y = source.y + source.height + STEM;
            return Some(vec![
                Waypoint {
                    x: right,
                    y: source.y + source.height / 2.0,
                },
                Waypoint {
                    x: right + STEM,
                    y: source.y + source.height / 2.0,
                },
                Waypoint { x: right + STEM, y },
                Waypoint { x: sx, y },
                Waypoint {
                    x: sx,
                    y: source.y + source.height,
                },
            ]);
        }
        let mut sides: Vec<f64> = vec![1.0, -1.0];
        if let Some(BpmnFlowElement::BoundaryEvent(be)) =
            self.graph.by_id.get(flow.source_ref.as_str()).copied()
        {
            let host = self.bounds.get(be.attached_to_ref.as_str());
            let on_top = host.is_some_and(|h| source.y + source.height / 2.0 <= h.y + 1.0);
            sides = vec![if on_top { -1.0 } else { 1.0 }];
        }
        let left = js::min(sx, tx);
        let right = js::max(sx, tx);
        struct Best {
            points: Vec<Waypoint>,
            crossings: usize,
            length: f64,
            y: f64,
        }
        let mut best: Option<Best> = None;
        for side in sides {
            let edge_of = |b: &Bounds| if side > 0.0 { b.y + b.height } else { b.y };
            let start = if side > 0.0 {
                js::max(edge_of(&source), edge_of(&target))
            } else {
                js::min(edge_of(&source), edge_of(&target))
            };
            let mut candidates = vec![start + side * STEM];
            for (id, b) in self.bounds {
                if ends.contains(id) || b.x > right || b.x + b.width < left {
                    continue;
                }
                let e = edge_of(b) + side * STEM;
                if side * (e - start) > 0.0 {
                    candidates.push(e);
                }
            }
            candidates.sort_by(|a, b| cmp_num(side * (a - b), 0.0));
            for c in candidates {
                let mut y = c;
                while self
                    .loops
                    .iter()
                    .any(|l| (l.y - y).abs() < LOOP_STEP && l.left < right && left < l.right)
                {
                    y += side * LOOP_STEP;
                }
                let points = vec![
                    Waypoint {
                        x: sx,
                        y: edge_of(&source),
                    },
                    Waypoint { x: sx, y },
                    Waypoint { x: tx, y },
                    Waypoint {
                        x: tx,
                        y: edge_of(&target),
                    },
                ];
                if self.hits(&points, &ends) {
                    continue;
                }
                let crossings = self.crossings(&points);
                let length = (y - edge_of(&source)).abs() + (y - edge_of(&target)).abs();
                if best.as_ref().is_none_or(|b| {
                    crossings < b.crossings || (crossings == b.crossings && length < b.length)
                }) {
                    best = Some(Best {
                        points,
                        crossings,
                        length,
                        y,
                    });
                }
                break;
            }
        }
        let Some(best) = best else {
            return self.search(flow, &ends);
        };
        self.loops.push(Loop {
            left,
            right,
            y: best.y,
        });
        Some(best.points)
    }
}

pub fn edge_of(flow: &BpmnSequenceFlow, waypoints: &[Waypoint]) -> LayoutEdge {
    LayoutEdge {
        id: flow.id.clone(),
        source_ref: flow.source_ref.clone(),
        target_ref: flow.target_ref.clone(),
        waypoints: collapse(waypoints),
        label: flow.name.clone().filter(|n| !n.is_empty()),
        label_bounds: None,
    }
}
