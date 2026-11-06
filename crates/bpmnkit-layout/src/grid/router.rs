//! Twin of `layout/grid/grid-router.ts`.

use super::grid::Grid;
use crate::hash::IndexMap;
use crate::js;
use crate::types::{Bounds, Waypoint, GRID_CELL_HEIGHT, GRID_CELL_WIDTH};

/// Child grid dimensions of an expanded subprocess.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct GridDims {
    pub rows: usize,
    pub cols: usize,
}

/// `RoutableNode`: routing endpoint, absolute bounds plus grid position.
#[derive(Debug, Clone)]
pub struct RoutableNode<'a> {
    pub id: &'a str,
    pub bounds: Bounds,
    pub row: i64,
    pub col: i64,
    /// Child grid dims when this node is an expanded subprocess.
    pub child_grid: Option<GridDims>,
    /// For boundary events: the host's child grid (if the host is expanded).
    pub host_child_grid: Option<GridDims>,
}

const H: f64 = GRID_CELL_HEIGHT; // 140
const W: f64 = GRID_CELL_WIDTH; // 150
const HALF_H: f64 = H / 2.0; // 70
const HALF_W: f64 = W / 2.0; // 75
const TASK_HALF_HEIGHT: f64 = 40.0;
const BOUNDARY_STEM: f64 = 20.0;

#[derive(Clone, Copy)]
enum Dir {
    T,
    R,
    B,
    L,
}

fn mid(b: &Bounds) -> Waypoint {
    Waypoint {
        x: b.x + b.width / 2.0,
        y: b.y + b.height / 2.0,
    }
}

fn dock(point: Waypoint, rect: &Bounds, dir: Dir) -> Waypoint {
    match dir {
        Dir::T => Waypoint {
            x: point.x,
            y: rect.y,
        },
        Dir::B => Waypoint {
            x: point.x,
            y: rect.y + rect.height,
        },
        Dir::L => Waypoint {
            x: rect.x,
            y: point.y,
        },
        Dir::R => Waypoint {
            x: rect.x + rect.width,
            y: point.y,
        },
    }
}

fn source_grid_of(node: &RoutableNode) -> Option<GridDims> {
    node.child_grid.or(node.host_child_grid)
}

fn sign(v: i64) -> f64 {
    match v.cmp(&0) {
        std::cmp::Ordering::Less => -1.0,
        std::cmp::Ordering::Equal => 0.0,
        std::cmp::Ordering::Greater => 1.0,
    }
}

fn wp(x: f64, y: f64) -> Waypoint {
    Waypoint { x, y }
}

/// `connectElements(source, target, grid, shift, expandedRowsByRow)`: orthogonal
/// waypoints between two grid-placed nodes. Port of bpmn-auto-layout's
/// connectElements (lib/utils/layoutUtil.js:52), with the level shift applied
/// consistently (upstream drops it for subprocess children).
pub fn connect_elements<T: Clone + PartialEq>(
    source: &RoutableNode,
    target: &RoutableNode,
    grid: &Grid<T>,
    shift: (f64, f64),
    expanded_rows_by_row: &IndexMap<i64, usize>,
) -> Vec<Waypoint> {
    let s_mid = mid(&source.bounds);
    let t_mid = mid(&target.bounds);
    let d_x = target.col - source.col;
    let d_y = target.row - source.row;
    let cell_top = |row: i64| -> f64 { row as f64 * H + shift.1 };
    let cell_left = |col: i64| -> f64 { col as f64 * W + shift.0 };
    let src_grid = source_grid_of(source);

    // Self-loop
    if d_x == 0 && d_y == 0 && source.id == target.id {
        let loop_x = cell_left(source.col)
            + match src_grid {
                Some(g) => (g.cols as f64 + 1.0) * W,
                None => W,
            };
        let top_y = cell_top(source.row);
        return vec![
            dock(s_mid, &source.bounds, Dir::R),
            wp(loop_x, s_mid.y),
            wp(loop_x, top_y),
            wp(t_mid.x, top_y),
            dock(t_mid, &target.bounds, Dir::T),
        ];
    }

    // Back-edge (loop closing leftwards)
    if d_x < 0 {
        if s_mid.y >= t_mid.y {
            let extra_rows = match src_grid {
                Some(g) => g.rows as f64 + 1.0,
                None => 1.0 + expanded_rows_by_row.get(&source.row).copied().unwrap_or(0) as f64,
            };
            let down_y = cell_top(source.row) + extra_rows * H;
            return vec![
                dock(s_mid, &source.bounds, Dir::B),
                wp(s_mid.x, down_y),
                wp(t_mid.x, down_y),
                dock(t_mid, &target.bounds, Dir::B),
            ];
        }
        let up_y = s_mid.y - HALF_H;
        return vec![
            dock(s_mid, &source.bounds, Dir::T),
            wp(s_mid.x, up_y),
            wp(t_mid.x, up_y),
            dock(t_mid, &target.bounds, Dir::T),
        ];
    }

    // Same row, forward
    if d_y == 0 {
        if is_direct_path_blocked(source, target, grid) {
            let extra_rows = match src_grid {
                Some(g) => g.rows as f64 + 1.0,
                None => 1.0,
            };
            let under_y = cell_top(source.row) + extra_rows * H;
            return vec![
                dock(s_mid, &source.bounds, Dir::B),
                wp(s_mid.x, under_y),
                wp(t_mid.x, under_y),
                dock(t_mid, &target.bounds, Dir::B),
            ];
        }
        let mut first = dock(s_mid, &source.bounds, Dir::R);
        let mut last = dock(t_mid, &target.bounds, Dir::L);
        // Expanded boxes dock at header height, not box middle
        if source.child_grid.is_some() {
            first.y = source.bounds.y + TASK_HALF_HEIGHT;
        }
        if target.child_grid.is_some() {
            last.y = target.bounds.y + TASK_HALF_HEIGHT;
        }
        if first.y != last.y {
            // header-height correction created a step: resolve with an L
            return collapse_collinear(&[first, wp(last.x, first.y), last]);
        }
        return vec![first, last];
    }

    // Same column, vertical
    if d_x == 0 {
        if is_direct_path_blocked(source, target, grid) {
            let y_off = -sign(d_y) * HALF_H;
            return vec![
                dock(s_mid, &source.bounds, Dir::R),
                wp(s_mid.x + HALF_W, s_mid.y),
                wp(s_mid.x + HALF_W, t_mid.y + y_off),
                wp(t_mid.x, t_mid.y + y_off),
                dock(
                    t_mid,
                    &target.bounds,
                    if y_off > 0.0 { Dir::B } else { Dir::T },
                ),
            ];
        }
        return vec![
            dock(s_mid, &source.bounds, if d_y > 0 { Dir::B } else { Dir::T }),
            dock(t_mid, &target.bounds, if d_y > 0 { Dir::T } else { Dir::B }),
        ];
    }

    // Diagonal forward: try the single-bend route
    if let Some(direct) = direct_manhattan(source, target, grid, d_y) {
        return direct;
    }

    // Fallback: 6-point S-route
    let y_off = -sign(d_y) * HALF_H;
    vec![
        dock(s_mid, &source.bounds, Dir::R),
        wp(s_mid.x + HALF_W, s_mid.y),
        wp(s_mid.x + HALF_W, t_mid.y + y_off),
        wp(t_mid.x - HALF_W, t_mid.y + y_off),
        wp(t_mid.x - HALF_W, t_mid.y),
        dock(t_mid, &target.bounds, Dir::L),
    ]
}

fn direct_manhattan<T: Clone + PartialEq>(
    source: &RoutableNode,
    target: &RoutableNode,
    grid: &Grid<T>,
    d_y: i64,
) -> Option<Vec<Waypoint>> {
    let s_mid = mid(&source.bounds);
    let t_mid = mid(&target.bounds);
    if d_y > 0 {
        // bend at (targetRow, sourceCol): down, then right
        let count = grid
            .get_elements_in_range((source.row, source.col), (target.row, source.col))
            .len()
            + grid
                .get_elements_in_range((target.row, source.col), (target.row, target.col))
                .len();
        if count > 2 {
            return None;
        }
        return Some(vec![
            dock(s_mid, &source.bounds, Dir::B),
            wp(s_mid.x, t_mid.y),
            dock(t_mid, &target.bounds, Dir::L),
        ]);
    }
    // bend at (sourceRow, targetCol): right, then up
    let count = grid
        .get_elements_in_range((source.row, source.col), (source.row, target.col))
        .len()
        + grid
            .get_elements_in_range((source.row, target.col), (target.row, target.col))
            .len();
    if count > 2 {
        return None;
    }
    Some(vec![
        dock(s_mid, &source.bounds, Dir::R),
        wp(t_mid.x, s_mid.y),
        dock(t_mid, &target.bounds, Dir::B),
    ])
}

fn is_direct_path_blocked<T: Clone + PartialEq>(
    source: &RoutableNode,
    target: &RoutableNode,
    grid: &Grid<T>,
) -> bool {
    // Each range is counted only when there is movement along that axis,
    // otherwise a same-row edge would double-count its target and always block.
    let mut total = 0;
    if target.col != source.col {
        total += grid
            .get_elements_in_range((source.row, source.col), (source.row, target.col))
            .len();
    }
    if target.row != source.row {
        total += grid
            .get_elements_in_range((source.row, target.col), (target.row, target.col))
            .len();
    }
    total > 2
}

/// `ensureExitBottom(be, waypoints)`: force an edge to leave through a boundary
/// event's bottom docking point.
pub fn ensure_exit_bottom(be: &Bounds, waypoints: &[Waypoint]) -> Vec<Waypoint> {
    if waypoints.is_empty() {
        return waypoints.to_vec();
    }
    let exit = wp(be.x + be.width / 2.0, be.y + be.height);
    let stem_y = exit.y + BOUNDARY_STEM;
    let rest = &waypoints[1..];
    let rejoin = rest.first().copied().unwrap_or(exit);
    let mut pts = vec![exit, wp(exit.x, stem_y), wp(rejoin.x, stem_y)];
    pts.extend_from_slice(rest);
    collapse_collinear(&pts)
}

/// `collapseCollinear`: drop points on a straight run; rounds coordinates.
pub fn collapse_collinear(waypoints: &[Waypoint]) -> Vec<Waypoint> {
    let mut out: Vec<Waypoint> = Vec::new();
    for w in waypoints {
        let p = wp(js::round(w.x), js::round(w.y));
        let n = out.len();
        let b = out.last().copied();
        let a = if n >= 2 { Some(out[n - 2]) } else { None };
        if let Some(b) = b {
            if b.x == p.x && b.y == p.y {
                continue;
            }
        }
        if let (Some(a), Some(b)) = (a, b) {
            if (a.x == b.x && b.x == p.x) || (a.y == b.y && b.y == p.y) {
                out[n - 1] = p;
                continue;
            }
        }
        out.push(p);
    }
    out
}

#[cfg(test)]
mod tests {
    use super::*;

    fn pts(v: &[(f64, f64)]) -> Vec<Waypoint> {
        v.iter().map(|&(x, y)| wp(x, y)).collect()
    }

    #[test]
    fn collapses_straight_runs_and_duplicates() {
        let out = collapse_collinear(&pts(&[
            (0.0, 0.0),
            (10.0, 0.0),
            (10.0, 0.0),
            (20.0, 0.0),
            (20.0, 30.0),
            (20.0, 60.0),
        ]));
        assert_eq!(out, pts(&[(0.0, 0.0), (20.0, 0.0), (20.0, 60.0)]));
    }

    #[test]
    fn rounds_halves_toward_positive_infinity() {
        let out = collapse_collinear(&pts(&[(-2.5, 0.4), (2.5, 7.5)]));
        assert_eq!(out, pts(&[(-2.0, 0.0), (3.0, 8.0)]));
    }

    #[test]
    fn short_inputs_pass_through() {
        assert!(collapse_collinear(&[]).is_empty());
        assert_eq!(collapse_collinear(&pts(&[(1.0, 2.0)])), pts(&[(1.0, 2.0)]));
    }

    #[test]
    fn exit_bottom_adds_stem() {
        let be = Bounds {
            x: 100.0,
            y: 100.0,
            width: 36.0,
            height: 36.0,
        };
        let out = ensure_exit_bottom(&be, &pts(&[(118.0, 136.0), (300.0, 200.0)]));
        assert_eq!(
            out,
            pts(&[
                (118.0, 136.0),
                (118.0, 156.0),
                (300.0, 156.0),
                (300.0, 200.0)
            ])
        );
    }
}
