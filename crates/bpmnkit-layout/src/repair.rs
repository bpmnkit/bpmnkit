//! Twin of `layout/repair.ts`.

use crate::js;
use crate::orthogonal::{route_orthogonal, side_ports, OrthogonalRequest, Port, Side, SideCost};
use crate::types::{Bounds, Waypoint};
use indexmap::{IndexMap, IndexSet};

/// `ConnectionKind`: what a connection is, which decides the sides it may leave and enter by.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ConnectionKind {
    Sequence,
    Message,
    Association,
}

/// `PlaneShape`.
#[derive(Debug, Clone, PartialEq)]
pub struct PlaneShape {
    pub id: String,
    pub bounds: Bounds,
    /// Pools, lanes and groups: drawn around other shapes, so never in the way.
    pub container: bool,
}

/// `PlaneEdge`.
#[derive(Debug, Clone, PartialEq)]
pub struct PlaneEdge {
    pub kind: ConnectionKind,
    pub source_ref: String,
    pub target_ref: String,
    pub waypoints: Vec<Waypoint>,
}

/// Negative: a route running along a shape's outline reads as passing through
/// it, so the box is grown by a pixel rather than shrunk.
const TOLERANCE: f64 = -1.0;
/// A route's own endpoints are shrunk instead: docking on the outline is the point.
const OWN_END_TOLERANCE: f64 = 2.0;

/// `repairRoutes(shapes, edges, related, boundarySide)`: rewrites `waypoints` in place.
///
/// Re-routes every connection on a plane that runs through a shape it has nothing to do
/// with. The layout's own routers place the common cases cheaply; this pass is the
/// guarantee behind them, so it only spends a search on the edges that need one.
pub fn repair_routes(
    shapes: &[PlaneShape],
    edges: &mut [PlaneEdge],
    related: &dyn Fn(&str) -> Vec<String>,
    boundary_side: &dyn Fn(&str) -> Option<Side>,
) {
    // `new Map(entries)`: the last duplicate id wins.
    let mut by_id: IndexMap<&str, &PlaneShape> = IndexMap::new();
    for s in shapes {
        by_id.insert(s.id.as_str(), s);
    }
    let obstacles: Vec<&PlaneShape> = shapes.iter().filter(|s| !s.container).collect();

    for ei in 0..edges.len() {
        let (source_ref, target_ref) = (edges[ei].source_ref.clone(), edges[ei].target_ref.clone());
        let mut exempt: IndexSet<String> = IndexSet::new();
        exempt.insert(source_ref.clone());
        exempt.insert(target_ref.clone());
        for id in related(&source_ref) {
            exempt.insert(id);
        }
        for id in related(&target_ref) {
            exempt.insert(id);
        }
        let blocking: Vec<&PlaneShape> = obstacles
            .iter()
            .copied()
            .filter(|s| !exempt.contains(&s.id))
            .collect();
        let (Some(&source), Some(&target)) = (
            by_id.get(source_ref.as_str()),
            by_id.get(target_ref.as_str()),
        ) else {
            continue;
        };
        if !route_hits(&edges[ei].waypoints, &blocking)
            && !through_own_end(&edges[ei].waypoints, source, target)
        {
            continue;
        }

        let others = SegmentIndex::new(
            edges
                .iter()
                .enumerate()
                .filter(|(j, _)| *j != ei)
                .map(|(_, e)| e.waypoints.as_slice()),
        );
        // A boundary event overlaps its host's outline, so a port of one can sit
        // inside the other; a route docking there would cross its own endpoint.
        let clear_of = |other: &PlaneShape| {
            let b = other.bounds;
            move |port: &Port| !inside(&port.point, &b)
        };
        let from_filter = clear_of(target);
        let to_filter = clear_of(source);
        let crossings = |a: &Waypoint, b: &Waypoint| others.crossings(a, b);
        let kind = edges[ei].kind;
        let route = route_orthogonal(&OrthogonalRequest {
            from: ports(kind, source, target, true, boundary_side(&source_ref))
                .into_iter()
                .filter(|p| from_filter(p))
                .collect(),
            to: ports(kind, target, source, false, boundary_side(&target_ref))
                .into_iter()
                .filter(|p| to_filter(p))
                .collect(),
            obstacles: blocking.iter().map(|s| s.bounds).collect(),
            crossings: Some(&crossings),
            margin: None,
        });
        if let Some(route) = route {
            edges[ei].waypoints = route;
        }
    }
}

fn ports(
    kind: ConnectionKind,
    own: &PlaneShape,
    other: &PlaneShape,
    leaving: bool,
    boundary: Option<Side>,
) -> Vec<Port> {
    if let Some(boundary) = boundary {
        return side_ports(
            &own.bounds,
            &SideCost {
                top: Some(if boundary == Side::Top {
                    0.0
                } else {
                    f64::INFINITY
                }),
                bottom: Some(if boundary == Side::Bottom {
                    0.0
                } else {
                    f64::INFINITY
                }),
                left: Some(f64::INFINITY),
                right: Some(f64::INFINITY),
            },
        );
    }
    if own.container {
        // A pool docks under whatever it talks to rather than at its own centre.
        let ob = &other.bounds;
        let x = js::min(
            js::max(ob.x + ob.width / 2.0, own.bounds.x + 40.0),
            own.bounds.x + own.bounds.width - 10.0,
        );
        return vec![
            Port {
                point: Waypoint { x, y: own.bounds.y },
                side: Side::Top,
                cost: None,
            },
            Port {
                point: Waypoint {
                    x,
                    y: own.bounds.y + own.bounds.height,
                },
                side: Side::Bottom,
                cost: None,
            },
        ];
    }
    match kind {
        ConnectionKind::Message => side_ports(
            &own.bounds,
            &SideCost {
                left: Some(60.0),
                right: Some(60.0),
                ..SideCost::default()
            },
        ),
        ConnectionKind::Association => side_ports(&own.bounds, &SideCost::default()),
        ConnectionKind::Sequence => {
            if leaving {
                side_ports(
                    &own.bounds,
                    &SideCost {
                        right: Some(0.0),
                        top: Some(20.0),
                        bottom: Some(20.0),
                        left: Some(80.0),
                    },
                )
            } else {
                side_ports(
                    &own.bounds,
                    &SideCost {
                        left: Some(0.0),
                        top: Some(20.0),
                        bottom: Some(20.0),
                        right: Some(80.0),
                    },
                )
            }
        }
    }
}

/// A route may touch its own endpoints only at their outline: one that docks on
/// the far side of its target, say, cuts straight across the shape to get there.
fn through_own_end(waypoints: &[Waypoint], source: &PlaneShape, target: &PlaneShape) -> bool {
    for w in waypoints.windows(2) {
        let (a, b) = (&w[0], &w[1]);
        for end in [source, target] {
            if !end.container && segment_hits(a, b, &end.bounds, OWN_END_TOLERANCE) {
                return true;
            }
        }
    }
    false
}

fn inside(p: &Waypoint, b: &Bounds) -> bool {
    p.x > b.x && p.x < b.x + b.width && p.y > b.y && p.y < b.y + b.height
}

/// True when any segment passes through the interior of one of `shapes`.
fn route_hits(waypoints: &[Waypoint], shapes: &[&PlaneShape]) -> bool {
    for w in waypoints.windows(2) {
        for s in shapes {
            if segment_hits(&w[0], &w[1], &s.bounds, TOLERANCE) {
                return true;
            }
        }
    }
    false
}

/// Liang-Barsky clip against the box shrunk by `tolerance`; handles diagonals too.
fn segment_hits(a: &Waypoint, b: &Waypoint, bx: &Bounds, tolerance: f64) -> bool {
    let x1 = bx.x + tolerance;
    let y1 = bx.y + tolerance;
    let x2 = bx.x + bx.width - tolerance;
    let y2 = bx.y + bx.height - tolerance;
    if x2 <= x1 || y2 <= y1 {
        return false;
    }
    let dx = b.x - a.x;
    let dy = b.y - a.y;
    let p = [-dx, dx, -dy, dy];
    let q = [a.x - x1, x2 - a.x, a.y - y1, y2 - a.y];
    let mut t0 = 0.0;
    let mut t1 = 1.0;
    for i in 0..4 {
        let pi = p[i];
        let qi = q[i];
        if pi == 0.0 {
            if qi <= 0.0 {
                return false;
            }
            continue;
        }
        let t = qi / pi;
        if pi < 0.0 {
            if t > t1 {
                return false;
            }
            if t > t0 {
                t0 = t;
            }
        } else {
            if t < t0 {
                return false;
            }
            if t < t1 {
                t1 = t;
            }
        }
    }
    t1 - t0 > 1e-9
}

/// Width of one bucket of the segment index.
const CELL: f64 = 128.0;

/// Every segment of a set of routes, flattened and bucketed by x so the search's
/// many crossing queries each touch only the segments nearby.
struct SegmentIndex {
    coords: Vec<f64>,
    cells: IndexMap<i64, Vec<usize>>,
}

impl SegmentIndex {
    fn new<'a>(routes: impl Iterator<Item = &'a [Waypoint]>) -> Self {
        let mut idx = SegmentIndex {
            coords: Vec::new(),
            cells: IndexMap::new(),
        };
        for wps in routes {
            for w in wps.windows(2) {
                let (a, b) = (&w[0], &w[1]);
                let index = idx.coords.len();
                idx.coords.extend([a.x, a.y, b.x, b.y]);
                let lo = (js::min(a.x, b.x) / CELL).floor() as i64;
                let hi = (js::max(a.x, b.x) / CELL).floor() as i64;
                for c in lo..=hi {
                    idx.cells.entry(c).or_default().push(index);
                }
            }
        }
        idx
    }

    /// How many indexed segments the segment a->b properly crosses.
    fn crossings(&self, a: &Waypoint, b: &Waypoint) -> f64 {
        let min_x = js::min(a.x, b.x);
        let max_x = js::max(a.x, b.x);
        let min_y = js::min(a.y, b.y);
        let max_y = js::max(a.y, b.y);
        let lo = (min_x / CELL).floor() as i64;
        let hi = (max_x / CELL).floor() as i64;
        let mut seen: Option<IndexSet<usize>> = if hi > lo { Some(IndexSet::new()) } else { None };
        let c = &self.coords;
        let mut count = 0;
        for cell in lo..=hi {
            let Some(list) = self.cells.get(&cell) else {
                continue;
            };
            for &i in list {
                if let Some(seen) = seen.as_mut() {
                    if !seen.insert(i) {
                        continue;
                    }
                }
                let (x1, y1, x2, y2) = (c[i], c[i + 1], c[i + 2], c[i + 3]);
                if js::max(x1, x2) < min_x || js::min(x1, x2) > max_x {
                    continue;
                }
                if js::max(y1, y2) < min_y || js::min(y1, y2) > max_y {
                    continue;
                }
                if properly_cross(a, b, &Waypoint { x: x1, y: y1 }, &Waypoint { x: x2, y: y2 }) {
                    count += 1;
                }
            }
        }
        count as f64
    }
}

/// `Math.sign`: keeps ±0 and NaN.
fn sign(x: f64) -> f64 {
    if x > 0.0 {
        1.0
    } else if x < 0.0 {
        -1.0
    } else {
        x
    }
}

fn properly_cross(p: &Waypoint, q: &Waypoint, r: &Waypoint, t: &Waypoint) -> bool {
    let side = |o: &Waypoint, a: &Waypoint, b: &Waypoint| -> f64 {
        sign((a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x))
    };
    let s1 = side(p, q, r);
    let s2 = side(p, q, t);
    let s3 = side(r, t, p);
    let s4 = side(r, t, q);
    s1 != 0.0 && s2 != 0.0 && s3 != 0.0 && s4 != 0.0 && s1 != s2 && s3 != s4
}
