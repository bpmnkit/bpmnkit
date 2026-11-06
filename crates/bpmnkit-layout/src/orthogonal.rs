//! Twin of `layout/orthogonal.ts`.

use crate::js;
use crate::types::{Bounds, Waypoint};
use indexmap::IndexMap;

/// Which side of a shape a route leaves or enters by.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum Side {
    Top,
    Right,
    Bottom,
    Left,
}

impl Side {
    /// `SIDE_DIR[side]`: index into `DIRS`.
    fn dir(self) -> usize {
        match self {
            Side::Top => 0,
            Side::Right => 1,
            Side::Bottom => 2,
            Side::Left => 3,
        }
    }
}

/// `Port`: a point on a shape's border a route may use, with an optional preference cost.
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct Port {
    pub point: Waypoint,
    pub side: Side,
    /// Added to every route through this port, so preferred sides win ties.
    pub cost: Option<f64>,
}

/// `Partial<Record<Side, number>>`.
#[derive(Debug, Clone, Copy, PartialEq, Default)]
pub struct SideCost {
    pub top: Option<f64>,
    pub right: Option<f64>,
    pub bottom: Option<f64>,
    pub left: Option<f64>,
}

impl SideCost {
    fn get(&self, side: Side) -> Option<f64> {
        match side {
            Side::Top => self.top,
            Side::Right => self.right,
            Side::Bottom => self.bottom,
            Side::Left => self.left,
        }
    }
}

/// How many already-routed segments the segment a→b would cut across.
pub type Crossings<'a> = &'a dyn Fn(&Waypoint, &Waypoint) -> f64;

/// `OrthogonalRequest`.
pub struct OrthogonalRequest<'a> {
    pub from: Vec<Port>,
    pub to: Vec<Port>,
    /// Shapes the route must not pass through; the endpoints themselves excluded.
    pub obstacles: Vec<Bounds>,
    pub crossings: Option<Crossings<'a>>,
    /// Clearance kept from obstacles where the route has room for it.
    pub margin: Option<f64>,
}

/// Stub every route leaves a port by before it may turn.
const STUB: f64 = 12.0;
const DEFAULT_MARGIN: f64 = 16.0;
/// A bend costs as much as this much extra length.
const BEND_COST: f64 = 40.0;
/// A crossing costs as much as this much extra length.
const CROSSING_COST: f64 = 160.0;
/// Negative: running along a shape's outline counts as passing through it.
const TOLERANCE: f64 = -1.0;
/// How far around the two endpoints the first, cheaper search looks.
const REGION: f64 = 240.0;

const DIRS: [(i64, i64); 4] = [(0, -1), (1, 0), (0, 1), (-1, 0)];

/// `routeOrthogonal(request)`; `None` where TS returns `null`.
///
/// Obstacle-aware orthogonal routing: a shortest path, with bends and crossings
/// charged as extra length, over the sparse grid of lines that run just clear of
/// every obstacle edge (an orthogonal visibility graph).
pub fn route_orthogonal(request: &OrthogonalRequest) -> Option<Vec<Waypoint>> {
    let margin = request.margin.unwrap_or(DEFAULT_MARGIN);
    let near = near_obstacles(request, REGION);
    search(request, &near, margin).or_else(|| {
        if near.len() < request.obstacles.len() {
            search(request, &request.obstacles, margin)
        } else {
            None
        }
    })
}

fn near_obstacles(request: &OrthogonalRequest, reach: f64) -> Vec<Bounds> {
    let mut min_x = f64::INFINITY;
    let mut min_y = f64::INFINITY;
    let mut max_x = f64::NEG_INFINITY;
    let mut max_y = f64::NEG_INFINITY;
    for port in request.from.iter().chain(request.to.iter()) {
        min_x = js::min(min_x, port.point.x);
        min_y = js::min(min_y, port.point.y);
        max_x = js::max(max_x, port.point.x);
        max_y = js::max(max_y, port.point.y);
    }
    request
        .obstacles
        .iter()
        .filter(|o| {
            o.x < max_x + reach
                && o.x + o.width > min_x - reach
                && o.y < max_y + reach
                && o.y + o.height > min_y - reach
        })
        .copied()
        .collect()
}

fn stub_of(port: &Port) -> Waypoint {
    let (dx, dy) = DIRS[port.side.dir()];
    Waypoint {
        x: port.point.x + dx as f64 * STUB,
        y: port.point.y + dy as f64 * STUB,
    }
}

/// Grid lines sit on half units, so coordinates are compared after this rounding.
fn half(v: f64) -> f64 {
    js::round(v * 2.0) / 2.0
}

/// Sorted, de-duplicated coordinates.
fn axis(values: &[f64]) -> Vec<f64> {
    let mut sorted: Vec<f64> = values.iter().map(|&v| half(v)).collect();
    sorted.sort_by(|a, b| js::cmp_num(*a, *b));
    let mut out: Vec<f64> = Vec::new();
    for v in sorted {
        // `!==`: NaN never equals the last value, so it is always pushed.
        if out.last() != Some(&v) {
            out.push(v);
        }
    }
    out
}

fn segment_blocked(a: &Waypoint, b: &Waypoint, obstacles: &[Bounds]) -> bool {
    let min_x = js::min(a.x, b.x);
    let max_x = js::max(a.x, b.x);
    let min_y = js::min(a.y, b.y);
    let max_y = js::max(a.y, b.y);
    for o in obstacles {
        if max_x <= o.x + TOLERANCE || o.x + o.width - TOLERANCE <= min_x {
            continue;
        }
        if max_y <= o.y + TOLERANCE || o.y + o.height - TOLERANCE <= min_y {
            continue;
        }
        return true;
    }
    false
}

/// Index of `v` in a sorted array (exact match expected); `-1` when absent.
fn index_of(sorted: &[f64], v: f64) -> i64 {
    let target = half(v);
    let mut lo: i64 = 0;
    let mut hi: i64 = sorted.len() as i64 - 1;
    while lo <= hi {
        let mid = (lo + hi) >> 1;
        let m = sorted[mid as usize];
        if m == target {
            return mid;
        }
        if m < target {
            lo = mid + 1;
        } else {
            hi = mid - 1;
        }
    }
    -1
}

/// First index whose value is greater than `v`.
fn upper(sorted: &[f64], v: f64) -> usize {
    let mut lo = 0usize;
    let mut hi = sorted.len();
    while lo < hi {
        let mid = (lo + hi) >> 1;
        if sorted[mid] <= v {
            lo = mid + 1;
        } else {
            hi = mid;
        }
    }
    lo
}

struct End {
    /// Index into `request.from` (starts) or the port itself (ends).
    index: usize,
    port: Port,
    stub: Waypoint,
}

fn search(request: &OrthogonalRequest, obstacles: &[Bounds], margin: f64) -> Option<Vec<Waypoint>> {
    let clear_ends = |ports: &[Port]| -> Vec<End> {
        ports
            .iter()
            .enumerate()
            .map(|(index, port)| End {
                index,
                port: *port,
                stub: stub_of(port),
            })
            .filter(|e| !segment_blocked(&e.port.point, &e.stub, &request.obstacles))
            .collect()
    };
    let starts = clear_ends(&request.from);
    let ends = clear_ends(&request.to);
    if starts.is_empty() || ends.is_empty() {
        return None;
    }

    let mut xs_raw: Vec<f64> = Vec::new();
    let mut ys_raw: Vec<f64> = Vec::new();
    for e in starts.iter().chain(ends.iter()) {
        xs_raw.push(e.stub.x);
        ys_raw.push(e.stub.y);
    }
    for o in obstacles {
        xs_raw.push(o.x - margin);
        xs_raw.push(o.x + o.width + margin);
        ys_raw.push(o.y - margin);
        ys_raw.push(o.y + o.height + margin);
    }
    let xs = axis(&xs_raw);
    let ys = axis(&ys_raw);
    let nx = xs.len();
    let ny = ys.len();

    // Blocked grid steps: h_blocked[j * nx + i] is the step (i, j) → (i + 1, j),
    // v_blocked[j * nx + i] the step (i, j) → (i, j + 1). Every obstacle marks the
    // steps that would pass through it, so no step is tested against every shape.
    let mut h_blocked = vec![false; nx * ny];
    let mut v_blocked = vec![false; nx * ny];
    for o in &request.obstacles {
        let left = o.x + TOLERANCE;
        let right = o.x + o.width - TOLERANCE;
        let top = o.y + TOLERANCE;
        let bottom = o.y + o.height - TOLERANCE;
        // `<=` is false for NaN, so a NaN obstacle falls through as in TS.
        if right <= left || bottom <= top {
            continue;
        }
        let i_from = upper(&xs, left).saturating_sub(1);
        let j_from = upper(&ys, top).saturating_sub(1);
        let mut j = upper(&ys, top);
        while j < ny && ys[j] < bottom {
            let mut i = i_from;
            while i + 1 < nx && xs[i] < right {
                h_blocked[j * nx + i] = true;
                i += 1;
            }
            j += 1;
        }
        let mut i = upper(&xs, left);
        while i < nx && xs[i] < right {
            let mut j = j_from;
            while j + 1 < ny && ys[j] < bottom {
                v_blocked[j * nx + i] = true;
                j += 1;
            }
            i += 1;
        }
    }

    let mut goal: IndexMap<usize, f64> = IndexMap::new();
    for e in &ends {
        let i = index_of(&xs, e.stub.x);
        let j = index_of(&ys, e.stub.y);
        if i < 0 || j < 0 {
            continue;
        }
        // The final move runs into the target, opposite to the port's outward side.
        let inward = (e.port.side.dir() + 2) % 4;
        let key = (j as usize * nx + i as usize) * 4 + inward;
        let cost = e.port.cost.unwrap_or(0.0) + STUB;
        let prior = goal.get(&key).copied().unwrap_or(f64::INFINITY);
        goal.insert(key, js::min(prior, cost));
    }
    if goal.is_empty() {
        return None;
    }

    let goal_points: Vec<Waypoint> = ends.iter().map(|e| e.stub).collect();
    let heuristic = |x: f64, y: f64| -> f64 {
        let mut best = f64::INFINITY;
        for p in &goal_points {
            best = js::min(best, (p.x - x).abs() + (p.y - y).abs());
        }
        best
    };

    let states = nx * ny * 4;
    let mut dist = vec![f64::INFINITY; states];
    let mut prev = vec![-1i64; states];
    let mut heap = MinHeap::default();

    for e in &starts {
        let i = index_of(&xs, e.stub.x);
        let j = index_of(&ys, e.stub.y);
        if i < 0 || j < 0 {
            continue;
        }
        let state = (j as usize * nx + i as usize) * 4 + e.port.side.dir();
        let cost = e.port.cost.unwrap_or(0.0) + STUB;
        if cost < dist[state] {
            dist[state] = cost;
            // TS stores `request.from.indexOf(port)`: the first port equal by
            // identity, which is this port's own index.
            prev[state] = -2 - e.index as i64;
            heap.push(state, cost + heuristic(e.stub.x, e.stub.y));
        }
    }

    let mut best: i64 = -1;
    let mut best_cost = f64::INFINITY;
    while heap.size() > 0 {
        let (state, priority) = heap.pop();
        if priority >= best_cost {
            break;
        }
        let d = dist[state];
        let dir = state & 3;
        let cell = state >> 2;
        let i = cell % nx;
        let j = (cell - i) / nx;
        let x = xs[i];
        let y = ys[j];
        if d + heuristic(x, y) < priority - 1e-6 {
            continue;
        }

        // Arrive at a goal stub: finish, turning in if needed.
        for final_dir in 0..4 {
            let Some(&extra) = goal.get(&(cell * 4 + final_dir)) else {
                continue;
            };
            if final_dir == (dir + 2) % 4 {
                continue;
            }
            let total = d + extra + if final_dir == dir { 0.0 } else { BEND_COST };
            if total < best_cost {
                best_cost = total;
                best = state as i64;
            }
        }

        for (nd, &(dx, dy)) in DIRS.iter().enumerate() {
            if nd == (dir + 2) % 4 {
                continue;
            }
            let ni = i as i64 + dx;
            let nj = j as i64 + dy;
            if ni < 0 || nj < 0 || ni >= nx as i64 || nj >= ny as i64 {
                continue;
            }
            let (ni, nj) = (ni as usize, nj as usize);
            let blocked = if dx != 0 {
                h_blocked[j * nx + i.min(ni)]
            } else {
                v_blocked[j.min(nj) * nx + i]
            };
            if blocked {
                continue;
            }
            let nxv = xs[ni];
            let nyv = ys[nj];
            let mut cost = d + (nxv - x).abs() + (nyv - y).abs();
            if nd != dir {
                cost += BEND_COST;
            }
            if let Some(crossings) = request.crossings {
                cost += CROSSING_COST * crossings(&Waypoint { x, y }, &Waypoint { x: nxv, y: nyv });
            }
            let next = (nj * nx + ni) * 4 + nd;
            if cost < dist[next] {
                dist[next] = cost;
                prev[next] = state as i64;
                heap.push(next, cost + heuristic(nxv, nyv));
            }
        }
    }
    if best < 0 {
        return None;
    }

    // Walk back to the start stub, then add the ports at either end.
    let mut points: Vec<Waypoint> = Vec::new();
    let mut state = best as usize;
    let start_port: Option<&Port>;
    loop {
        let cell = state >> 2;
        let i = cell % nx;
        let j = (cell - i) / nx;
        points.push(Waypoint { x: xs[i], y: ys[j] });
        let p = prev[state];
        if p <= -2 {
            start_port = request.from.get((-2 - p) as usize);
            break;
        }
        state = p as usize;
    }
    points.reverse();
    let start_port = start_port?;
    let last = *points.last()?;
    // The path ends on a grid point, which is the stub rounded like the axes; an
    // exact comparison would miss every stub at a fractional coordinate.
    let end_port = ends
        .iter()
        .find(|e| half(e.stub.x) == last.x && half(e.stub.y) == last.y)?;
    let mut all = Vec::with_capacity(points.len() + 2);
    all.push(start_port.point);
    all.extend(points);
    all.push(end_port.port.point);
    Some(simplify(&all))
}

/// Drop duplicate points and the middle of straight runs.
fn simplify(points: &[Waypoint]) -> Vec<Waypoint> {
    let mut out: Vec<Waypoint> = Vec::new();
    for &p in points {
        if let Some(last) = out.last() {
            if last.x == p.x && last.y == p.y {
                continue;
            }
        }
        out.push(p);
        while out.len() >= 3 {
            let n = out.len();
            let (a, b, c) = (out[n - 3], out[n - 2], out[n - 1]);
            if (a.x == b.x && b.x == c.x) || (a.y == b.y && b.y == c.y) {
                out.remove(n - 2);
            } else {
                break;
            }
        }
    }
    out
}

/// Binary min-heap of states keyed by priority; the TS sift order, not `BinaryHeap`'s.
#[derive(Default)]
struct MinHeap {
    items: Vec<usize>,
    keys: Vec<f64>,
}

impl MinHeap {
    fn size(&self) -> usize {
        self.items.len()
    }

    fn push(&mut self, item: usize, key: f64) {
        let mut i = self.items.len();
        self.items.push(item);
        self.keys.push(key);
        while i > 0 {
            let parent = (i - 1) >> 1;
            if self.keys[parent] <= key {
                break;
            }
            self.items[i] = self.items[parent];
            self.keys[i] = self.keys[parent];
            i = parent;
        }
        self.items[i] = item;
        self.keys[i] = key;
    }

    fn pop(&mut self) -> (usize, f64) {
        let top = (self.items[0], self.keys[0]);
        let last_item = self.items.pop().unwrap_or(0);
        let last_key = self.keys.pop().unwrap_or(0.0);
        let n = self.items.len();
        if n > 0 {
            let mut i = 0;
            loop {
                let l = 2 * i + 1;
                if l >= n {
                    break;
                }
                let r = l + 1;
                let c = if r < n && self.keys[r] < self.keys[l] {
                    r
                } else {
                    l
                };
                if self.keys[c] >= last_key {
                    break;
                }
                self.items[i] = self.items[c];
                self.keys[i] = self.keys[c];
                i = c;
            }
            self.items[i] = last_item;
            self.keys[i] = last_key;
        }
        top
    }
}

/// `sidePorts(b, cost)`: the four side-centre ports of a rectangle, each charged
/// `cost[side]` when given; ports with a non-finite cost are dropped.
pub fn side_ports(b: &Bounds, cost: &SideCost) -> Vec<Port> {
    let cx = b.x + b.width / 2.0;
    let cy = b.y + b.height / 2.0;
    let ports = [
        (Waypoint { x: cx, y: b.y }, Side::Top),
        (
            Waypoint {
                x: b.x + b.width,
                y: cy,
            },
            Side::Right,
        ),
        (
            Waypoint {
                x: cx,
                y: b.y + b.height,
            },
            Side::Bottom,
        ),
        (Waypoint { x: b.x, y: cy }, Side::Left),
    ];
    ports
        .into_iter()
        .map(|(point, side)| Port {
            point,
            side,
            cost: cost.get(side),
        })
        .filter(|port| port.cost.is_none_or(f64::is_finite))
        .collect()
}
