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
pub fn repair_routes<'r>(
    shapes: &[PlaneShape],
    edges: &mut [PlaneEdge],
    related: &dyn Fn(&str) -> Vec<&'r str>,
    boundary_side: &dyn Fn(&str) -> Option<Side>,
) {
    // `new Map(entries)`: the last duplicate id wins.
    let mut by_id: IndexMap<&str, &PlaneShape> = IndexMap::default();
    for s in shapes {
        by_id.insert(s.id.as_str(), s);
    }
    let obstacles: Vec<&PlaneShape> = shapes.iter().filter(|s| !s.container).collect();

    for ei in 0..edges.len() {
        let edge = &edges[ei];
        let (source_ref, target_ref) = (edge.source_ref.as_str(), edge.target_ref.as_str());
        let (Some(&source), Some(&target)) = (by_id.get(source_ref), by_id.get(target_ref)) else {
            continue;
        };
        // A handful of ids: a linear scan beats hashing every obstacle's id.
        let mut exempt: Vec<&str> = vec![source_ref, target_ref];
        let related_source = related(source_ref);
        let related_target = related(target_ref);
        exempt.extend(related_source.iter().chain(related_target.iter()).copied());
        let blocks = |s: &PlaneShape| !exempt.contains(&s.id.as_str());
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
    for w in waypoints.windows(2) {
        for s in shapes {
            if segment_hits(&w[0], &w[1], &s.bounds, TOLERANCE) && blocks(s) {
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
    /// First cell of each segment, by segment index / 4.
    first_cell: Vec<i64>,
    /// Buckets per [`Direction`]: a horizontal query skips the horizontal
    /// segments and a vertical one the vertical, since two parallel segments
    /// never properly cross.
    cells: [IndexMap<i64, Vec<usize>>; 3],
}

/// Coordinates this small keep every product in `properly_cross` finite, which
/// is what makes two parallel segments' sides compare equal.
const SAFE: f64 = 1e150;

fn safe(p: &Waypoint) -> bool {
    p.x.abs() < SAFE && p.y.abs() < SAFE
}

/// Which bucket set a segment goes in.
#[derive(Clone, Copy, PartialEq, Eq)]
enum Direction {
    Horizontal = 0,
    Vertical = 1,
    Other = 2,
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

impl SegmentIndex {
    fn new<'a>(routes: impl Iterator<Item = &'a [Waypoint]>) -> Self {
        let mut idx = SegmentIndex {
            coords: Vec::new(),
            first_cell: Vec::new(),
            cells: Default::default(),
        };
        for wps in routes {
            for w in wps.windows(2) {
                let (a, b) = (&w[0], &w[1]);
                let index = idx.coords.len();
                idx.coords.extend([a.x, a.y, b.x, b.y]);
                let lo = (js::min(a.x, b.x) / CELL).floor() as i64;
                let hi = (js::max(a.x, b.x) / CELL).floor() as i64;
                idx.first_cell.push(lo);
                let cells = &mut idx.cells[direction(a, b) as usize];
                for c in lo..=hi {
                    cells.entry(c).or_default().push(index);
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
        let c = &self.coords;
        let mut count = 0;
        let parallel = match direction(a, b) {
            Direction::Horizontal => Some(Direction::Horizontal),
            Direction::Vertical => Some(Direction::Vertical),
            Direction::Other => None,
        };
        for (d, cells) in self.cells.iter().enumerate() {
            if parallel.is_some_and(|p| p as usize == d) {
                continue;
            }
            for cell in lo..=hi {
                let Some(list) = cells.get(&cell) else {
                    continue;
                };
                for &i in list {
                    // A segment spans consecutive cells, so it was already counted
                    // in the previous cell exactly when it starts before this one
                    // and this is not the first cell visited.
                    if cell > lo && self.first_cell[i / 4] < cell {
                        continue;
                    }
                    let (x1, y1, x2, y2) = (c[i], c[i + 1], c[i + 2], c[i + 3]);
                    if js::max(x1, x2) < min_x || js::min(x1, x2) > max_x {
                        continue;
                    }
                    if js::max(y1, y2) < min_y || js::min(y1, y2) > max_y {
                        continue;
                    }
                    if properly_cross(a, b, &Waypoint { x: x1, y: y1 }, &Waypoint { x: x2, y: y2 })
                    {
                        count += 1;
                    }
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
