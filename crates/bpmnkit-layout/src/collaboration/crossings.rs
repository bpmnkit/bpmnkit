//! Twin of `layout/collaboration/crossings.ts`.
//!
//! Crossings between orthogonal polylines, counted the way `pnpm layout:score`
//! counts them: a horizontal and a vertical segment meeting strictly inside
//! both, with 1 px of slack, so a shared dock or a touching corner is no
//! crossing. Collinear overlaps are not crossings either.

use crate::js;
use crate::types::Waypoint;

fn segments_cross(a: &Waypoint, b: &Waypoint, c: &Waypoint, d: &Waypoint) -> bool {
    let first_flat = (a.y - b.y).abs() < 0.5;
    let second_flat = (c.y - d.y).abs() < 0.5;
    if first_flat == second_flat {
        return false;
    }
    let (h1, h2, v1, v2) = if first_flat {
        (a, b, c, d)
    } else {
        (c, d, a, b)
    };
    let x = v1.x;
    let y = h1.y;
    x > js::min(h1.x, h2.x) + 1.0
        && x < js::max(h1.x, h2.x) - 1.0
        && y > js::min(v1.y, v2.y) + 1.0
        && y < js::max(v1.y, v2.y) - 1.0
}

/// `pathCrossings(a, b)`: how many times polyline `a` crosses polyline `b`.
pub fn path_crossings(a: &[Waypoint], b: &[Waypoint]) -> usize {
    let mut n = 0;
    for p in a.windows(2) {
        for r in b.windows(2) {
            if segments_cross(&p[0], &p[1], &r[0], &r[1]) {
                n += 1;
            }
        }
    }
    n
}

#[cfg(test)]
mod tests {
    use super::*;

    fn w(x: f64, y: f64) -> Waypoint {
        Waypoint { x, y }
    }

    #[test]
    fn counts_a_riser_through_a_run_not_a_shared_dock_or_a_touching_corner() {
        let run = [w(0.0, 50.0), w(100.0, 50.0)];
        assert_eq!(path_crossings(&run, &[w(50.0, 0.0), w(50.0, 100.0)]), 1);
        assert_eq!(path_crossings(&run, &[w(100.0, 50.0), w(100.0, 100.0)]), 0);
        assert_eq!(path_crossings(&run, &[w(50.0, 50.0), w(50.0, 100.0)]), 0);
        assert_eq!(path_crossings(&run, &[w(20.0, 50.0), w(80.0, 50.0)]), 0);
    }
}
