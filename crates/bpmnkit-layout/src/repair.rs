//! Twin of `layout/repair.ts`.

use crate::hash::IndexMap;
use crate::js;
use crate::orthogonal::{route_orthogonal, side_ports, OrthogonalRequest, Port, Side, SideCost};
use crate::types::{Bounds, Waypoint};

/// `ConnectionKind`: what a connection is, which decides the sides it may leave and enter by.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ConnectionKind {
    Sequence,
    Message,
    Association,
}

/// `PlaneShape`.
#[derive(Debug, Clone, PartialEq)]
pub struct PlaneShape<'a> {
    pub id: &'a str,
    pub bounds: Bounds,
    /// Pools, lanes and groups: drawn around other shapes, so never in the way.
    pub container: bool,
}

/// `PlaneEdge`.
#[derive(Debug, Clone, PartialEq)]
pub struct PlaneEdge<'a> {
    pub kind: ConnectionKind,
    pub source_ref: &'a str,
    pub target_ref: &'a str,
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
pub fn repair_routes<'r>(
    shapes: &[PlaneShape],
    edges: &mut [PlaneEdge],
    related: &dyn Fn(&str) -> Vec<&'r str>,
    boundary_side: &dyn Fn(&str) -> Option<Side>,
) {
    // `new Map(entries)`: the last duplicate id wins.
    let mut by_id: IndexMap<&str, &PlaneShape> =
        IndexMap::with_capacity_and_hasher(shapes.len(), Default::default());
    for s in shapes {
        by_id.insert(s.id, s);
    }
    let obstacles: Vec<&PlaneShape> = shapes.iter().filter(|s| !s.container).collect();

    for ei in 0..edges.len() {
        let edge = &edges[ei];
        let (source_ref, target_ref) = (edge.source_ref, edge.target_ref);
        let (Some(&source), Some(&target)) = (by_id.get(source_ref), by_id.get(target_ref)) else {
            continue;
        };
        // A handful of ids: a linear scan beats hashing every obstacle's id.
        let mut exempt: Vec<&str> = vec![source_ref, target_ref];
        let related_source = related(source_ref);
        let related_target = related(target_ref);
        exempt.extend(related_source.iter().chain(related_target.iter()).copied());
        let blocks = |s: &PlaneShape| !exempt.contains(&s.id);
        if !route_hits(&edge.waypoints, &obstacles, &blocks)
            && !through_own_end(&edge.waypoints, source, target)
        {
            continue;
        }
        let blocking: Vec<Bounds> = obstacles
            .iter()
            .filter(|s| blocks(s))
            .map(|s| s.bounds)
            .collect();

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
        let kind = edge.kind;
        let route = route_orthogonal(&OrthogonalRequest {
            from: ports(kind, source, target, true, boundary_side(source_ref))
                .into_iter()
                .filter(|p| from_filter(p))
                .collect(),
            to: ports(kind, target, source, false, boundary_side(target_ref))
                .into_iter()
                .filter(|p| to_filter(p))
                .collect(),
            obstacles: blocking,
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

/// True when any segment passes through the interior of one of `shapes` that `blocks`.
fn route_hits(
    waypoints: &[Waypoint],
    shapes: &[&PlaneShape],
    blocks: &dyn Fn(&PlaneShape) -> bool,
) -> bool {
    let mut min_x = f64::INFINITY;
    let mut min_y = f64::INFINITY;
    let mut max_x = f64::NEG_INFINITY;
    let mut max_y = f64::NEG_INFINITY;
    for w in waypoints {
        min_x = js::min(min_x, w.x);
        min_y = js::min(min_y, w.y);
        max_x = js::max(max_x, w.x);
        max_y = js::max(max_y, w.y);
    }
    for s in shapes {
        // The box `segment_hits` clips against: one wholly to a side of the
        // route's bounding box clips every segment away (NaN never skips).
        let b = &s.bounds;
        if max_x < b.x + TOLERANCE
            || min_x > b.x + b.width - TOLERANCE
            || max_y < b.y + TOLERANCE
            || min_y > b.y + b.height - TOLERANCE
        {
            continue;
        }
        for w in waypoints.windows(2) {
            if segment_hits(&w[0], &w[1], b, TOLERANCE) && blocks(s) {
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

/// One indexed segment, endpoints in route order.
#[derive(Clone, Copy)]
struct Segment {
    a: Waypoint,
    b: Waypoint,
}

impl Segment {
    /// The bounding-box test that keeps only segments a properly crossing one
    /// could be, against the query's box.
    fn near(&self, min_x: f64, max_x: f64, min_y: f64, max_y: f64) -> bool {
        let (x1, y1, x2, y2) = (self.a.x, self.a.y, self.b.x, self.b.y);
        !(js::max(x1, x2) < min_x
            || js::min(x1, x2) > max_x
            || js::max(y1, y2) < min_y
            || js::min(y1, y2) > max_y)
    }
}

/// Every segment of a set of routes, so the search's many crossing queries each
/// look only at the segments that could cross them. The search asks about axis-
/// parallel steps, and two parallel segments never properly cross, so a
/// horizontal step only needs the vertical segments (sorted by x, found by binary
/// search on the step's x-range) and a vertical step the horizontal ones (sorted
/// by y). Everything else — diagonals, and anything with coordinates too large
/// for the parallel argument — is checked against every segment.
struct SegmentIndex {
    /// Horizontal segments, by y.
    horizontal: Vec<Segment>,
    /// Vertical segments, by x.
    vertical: Vec<Segment>,
    other: Vec<Segment>,
}

/// Coordinates this small keep every product in `properly_cross` finite, which
/// is what makes two parallel segments' sides compare equal.
const SAFE: f64 = 1e150;

fn safe(p: &Waypoint) -> bool {
    p.x.abs() < SAFE && p.y.abs() < SAFE
}

#[derive(Clone, Copy, PartialEq, Eq)]
enum Direction {
    Horizontal,
    Vertical,
    Other,
}

fn direction(a: &Waypoint, b: &Waypoint) -> Direction {
    if !safe(a) || !safe(b) {
        Direction::Other
    } else if a.y == b.y {
        Direction::Horizontal
    } else if a.x == b.x {
        Direction::Vertical
    } else {
        Direction::Other
    }
}

/// The run of `sorted` whose `key` lies in `[lo, hi]`.
fn key_range(sorted: &[Segment], key: impl Fn(&Segment) -> f64, lo: f64, hi: f64) -> &[Segment] {
    let start = sorted.partition_point(|s| key(s) < lo);
    let end = sorted.partition_point(|s| key(s) <= hi);
    &sorted[start..end.max(start)]
}

impl SegmentIndex {
    fn new<'a>(routes: impl Iterator<Item = &'a [Waypoint]>) -> Self {
        let mut idx = SegmentIndex {
            horizontal: Vec::new(),
            vertical: Vec::new(),
            other: Vec::new(),
        };
        for wps in routes {
            for w in wps.windows(2) {
                let segment = Segment { a: w[0], b: w[1] };
                match direction(&w[0], &w[1]) {
                    Direction::Horizontal => idx.horizontal.push(segment),
                    Direction::Vertical => idx.vertical.push(segment),
                    Direction::Other => idx.other.push(segment),
                }
            }
        }
        // Safe coordinates are finite, so these orders are total.
        idx.horizontal.sort_by(|p, q| js::cmp_num(p.a.y, q.a.y));
        idx.vertical.sort_by(|p, q| js::cmp_num(p.a.x, q.a.x));
        idx
    }

    /// How many indexed segments the segment a->b properly crosses.
    fn crossings(&self, a: &Waypoint, b: &Waypoint) -> f64 {
        let min_x = js::min(a.x, b.x);
        let max_x = js::max(a.x, b.x);
        let min_y = js::min(a.y, b.y);
        let max_y = js::max(a.y, b.y);
        let mut count = 0;
        let mut scan = |segments: &[Segment]| {
            for s in segments {
                if s.near(min_x, max_x, min_y, max_y) && properly_cross(a, b, &s.a, &s.b) {
                    count += 1;
                }
            }
        };
        match direction(a, b) {
            Direction::Horizontal => {
                scan(key_range(&self.vertical, |s| s.a.x, min_x, max_x));
            }
            Direction::Vertical => {
                scan(key_range(&self.horizontal, |s| s.a.y, min_y, max_y));
            }
            Direction::Other => {
                scan(&self.horizontal);
                scan(&self.vertical);
            }
        }
        scan(&self.other);
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
