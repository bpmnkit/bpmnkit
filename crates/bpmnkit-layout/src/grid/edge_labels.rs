//! Twin of `layout/grid/edge-labels.ts`. Shared by both engines.

use crate::js;
use crate::types::{
    Bounds, LayoutEdge, LayoutNode, Waypoint, LABEL_CHAR_WIDTH, LABEL_HEIGHT, LABEL_MIN_WIDTH,
    LABEL_VERTICAL_OFFSET,
};
use indexmap::{IndexMap, IndexSet};

/// Collision tolerance in pixels: small overlap allowed for rounding.
const LABEL_COLLISION_TOLERANCE: f64 = 2.0;

/// Distance between a source's exit and a label placed beside it.
const LABEL_SOURCE_GAP: f64 = 6.0;

/// Number of slide steps along a segment when searching for clear space.
const LABEL_SLIDE_STEPS: u32 = 10;

fn bounds_overlap(a: &Bounds, b: &Bounds) -> bool {
    !(a.x + a.width + LABEL_COLLISION_TOLERANCE <= b.x
        || b.x + b.width + LABEL_COLLISION_TOLERANCE <= a.x
        || a.y + a.height + LABEL_COLLISION_TOLERANCE <= b.y
        || b.y + b.height + LABEL_COLLISION_TOLERANCE <= a.y)
}

/// `placeEdgeLabels(edges, nodeMap, nearSource)`: collision-aware edge label
/// placement. For each labelled edge, generates candidate positions on the longest
/// segment and picks the first one that doesn't overlap nodes or already-placed
/// labels.
///
/// `near_source` holds edges whose label belongs next to their source (a gateway's
/// branch conditions). These try the first segment, just past the exit, before the
/// usual spots, and only where no other flow runs through the label.
pub fn place_edge_labels(
    edges: &mut [LayoutEdge],
    node_map: &IndexMap<String, &LayoutNode>,
    near_source: &IndexSet<String>,
) {
    let mut occupied: Vec<Bounds> = Vec::new();
    // (edge index, a, b); the edge index stands in for TS's edge identity.
    let mut segments: Vec<(usize, Waypoint, Waypoint)> = Vec::new();
    for (ei, edge) in edges.iter().enumerate() {
        for w in edge.waypoints.windows(2) {
            segments.push((ei, w[0], w[1]));
        }
    }

    // Collect all node bounds as obstacles
    for node in node_map.values() {
        occupied.push(node.bounds);
        if let Some(lb) = node.label_bounds {
            occupied.push(lb);
        }
    }

    for (ei, edge) in edges.iter_mut().enumerate() {
        let label = match &edge.label {
            Some(l) if !l.is_empty() => l,
            _ => continue,
        };

        let label_width = js::max(js::len(label) as f64 * LABEL_CHAR_WIDTH, LABEL_MIN_WIDTH);
        let label_height = LABEL_HEIGHT;

        if near_source.contains(&edge.id) {
            let spot = source_candidates(&edge.waypoints, label_width, label_height)
                .into_iter()
                .find(|c| {
                    !occupied.iter().any(|ob| bounds_overlap(c, ob))
                        && !segments
                            .iter()
                            .any(|(sei, a, b)| *sei != ei && segment_through(a, b, c))
                });
            if let Some(spot) = spot {
                edge.label_bounds = Some(spot);
                occupied.push(spot);
                continue;
            }
        }

        // Find the longest segment
        let (seg_start, seg_end) = find_longest_segment(&edge.waypoints);

        // Generate candidate positions along the segment
        let candidates = generate_label_candidates(seg_start, seg_end, label_width, label_height);

        // Pick the first non-overlapping candidate
        let mut placed = false;
        for candidate in candidates {
            if !occupied.iter().any(|ob| bounds_overlap(&candidate, ob)) {
                edge.label_bounds = Some(candidate);
                occupied.push(candidate);
                placed = true;
                break;
            }
        }

        // Fallback: slide along segment to find clear space
        if !placed {
            let fallback =
                slide_label_along_segment(seg_start, seg_end, label_width, label_height, &occupied);
            if let Some(fb) = fallback {
                edge.label_bounds = Some(fb);
                occupied.push(fb);
            }
            // If no clear position exists, leave label_bounds unset (text preserved in edge.label)
        }
    }
}

/// Spots on an edge's first segment, just past where it leaves its source: above a
/// horizontal exit, beside a vertical one (right first, then left). The first segment
/// has to be long enough to hold the label.
fn source_candidates(waypoints: &[Waypoint], width: f64, height: f64) -> Vec<Bounds> {
    let (Some(a), Some(b)) = (waypoints.first(), waypoints.get(1)) else {
        return Vec::new();
    };
    let gap = LABEL_SOURCE_GAP;
    let bb = |x, y| Bounds {
        x,
        y,
        width,
        height,
    };
    if (a.y - b.y).abs() < 1.0 {
        if (b.x - a.x).abs() < width + 2.0 * gap {
            return Vec::new();
        }
        let x = if b.x > a.x {
            a.x + gap
        } else {
            a.x - gap - width
        };
        return vec![
            bb(x, a.y - LABEL_SOURCE_GAP / 2.0 - height),
            bb(x, a.y + LABEL_SOURCE_GAP / 2.0),
        ];
    }
    if (b.y - a.y).abs() < height + 2.0 * gap {
        return Vec::new();
    }
    let y = if b.y > a.y {
        a.y + gap
    } else {
        a.y - gap - height
    };
    vec![bb(a.x + gap, y), bb(a.x - gap - width, y)]
}

/// True when the axis-parallel segment a->b passes through the box.
fn segment_through(a: &Waypoint, b: &Waypoint, bx: &Bounds) -> bool {
    js::max(a.x, b.x) > bx.x
        && js::min(a.x, b.x) < bx.x + bx.width
        && js::max(a.y, b.y) > bx.y
        && js::min(a.y, b.y) < bx.y + bx.height
}

fn find_longest_segment(waypoints: &[Waypoint]) -> (Waypoint, Waypoint) {
    let zero = Waypoint { x: 0.0, y: 0.0 };
    let mut best_len = 0.0;
    let mut best_start = waypoints.first().copied().unwrap_or(zero);
    let mut best_end = waypoints
        .get(1)
        .copied()
        .or_else(|| waypoints.first().copied())
        .unwrap_or(zero);

    for i in 1..waypoints.len() {
        let a = waypoints[i - 1];
        let b = waypoints[i];
        let len = (b.x - a.x).abs() + (b.y - a.y).abs();
        if len > best_len {
            best_len = len;
            best_start = a;
            best_end = b;
        }
    }

    (best_start, best_end)
}

fn generate_label_candidates(
    seg_start: Waypoint,
    seg_end: Waypoint,
    label_width: f64,
    label_height: f64,
) -> Vec<Bounds> {
    let mut candidates = Vec::new();
    // Positions along segment: 0.5, 0.25, 0.75, 0.33, 0.67
    let fractions = [0.5, 0.25, 0.75, 0.33, 0.67];
    // Perpendicular offsets: above, below
    let offsets = [-LABEL_VERTICAL_OFFSET - label_height, LABEL_VERTICAL_OFFSET];

    for f in fractions {
        let px = seg_start.x + (seg_end.x - seg_start.x) * f;
        let py = seg_start.y + (seg_end.y - seg_start.y) * f;

        for offset in offsets {
            // Determine perpendicular direction
            let is_horizontal = (seg_end.y - seg_start.y).abs() < 1.0;
            let (lx, ly) = if is_horizontal {
                (px - label_width / 2.0, py + offset)
            } else {
                (px + offset, py - label_height / 2.0)
            };

            candidates.push(Bounds {
                x: lx,
                y: ly,
                width: label_width,
                height: label_height,
            });
        }
    }

    candidates
}

fn slide_label_along_segment(
    seg_start: Waypoint,
    seg_end: Waypoint,
    label_width: f64,
    label_height: f64,
    occupied: &[Bounds],
) -> Option<Bounds> {
    let is_horizontal = (seg_end.y - seg_start.y).abs() < 1.0;

    for step in 0..=LABEL_SLIDE_STEPS {
        let t = step as f64 / LABEL_SLIDE_STEPS as f64;
        let px = seg_start.x + (seg_end.x - seg_start.x) * t;
        let py = seg_start.y + (seg_end.y - seg_start.y) * t;

        let candidate = if is_horizontal {
            Bounds {
                x: px - label_width / 2.0,
                y: py - label_height - LABEL_VERTICAL_OFFSET,
                width: label_width,
                height: label_height,
            }
        } else {
            Bounds {
                x: px - label_width - LABEL_VERTICAL_OFFSET,
                y: py - label_height / 2.0,
                width: label_width,
                height: label_height,
            }
        };

        if !occupied.iter().any(|ob| bounds_overlap(&candidate, ob)) {
            return Some(candidate);
        }
    }

    // No clear position found: skip label placement rather than forcing an overlap
    None
}

#[cfg(test)]
mod tests {
    use super::*;

    fn edge(id: &str, label: Option<&str>, pts: &[(f64, f64)]) -> LayoutEdge {
        LayoutEdge {
            id: id.into(),
            source_ref: "s".into(),
            target_ref: "t".into(),
            waypoints: pts.iter().map(|&(x, y)| Waypoint { x, y }).collect(),
            label: label.map(String::from),
            label_bounds: None,
        }
    }

    #[test]
    fn horizontal_edge_label_goes_above_midpoint() {
        let mut edges = vec![edge("e", Some("yes"), &[(0.0, 100.0), (200.0, 100.0)])];
        place_edge_labels(&mut edges, &IndexMap::new(), &IndexSet::new());
        assert_eq!(
            edges[0].label_bounds,
            Some(Bounds {
                x: 100.0 - 20.0,
                y: 100.0 - 10.0 - 14.0,
                width: 40.0,
                height: 14.0
            })
        );
    }

    #[test]
    fn obstacle_pushes_label_below() {
        let mut edges = vec![edge("e", Some("yes"), &[(0.0, 100.0), (200.0, 100.0)])];
        let node = LayoutNode {
            id: "n".into(),
            bounds: Bounds {
                x: 90.0,
                y: 60.0,
                width: 20.0,
                height: 30.0,
            },
            ..Default::default()
        };
        let mut map = IndexMap::new();
        map.insert("n".to_string(), &node);
        place_edge_labels(&mut edges, &map, &IndexSet::new());
        assert_eq!(
            edges[0].label_bounds.map(|b| (b.x, b.y)),
            Some((80.0, 110.0))
        );
    }

    #[test]
    fn near_source_uses_first_segment() {
        let mut edges = vec![edge(
            "e",
            Some("ok"),
            &[(0.0, 50.0), (150.0, 50.0), (150.0, 400.0)],
        )];
        let ns: IndexSet<String> = ["e".to_string()].into_iter().collect();
        place_edge_labels(&mut edges, &IndexMap::new(), &ns);
        assert_eq!(
            edges[0].label_bounds,
            Some(Bounds {
                x: 6.0,
                y: 50.0 - 3.0 - 14.0,
                width: 40.0,
                height: 14.0
            })
        );
    }

    #[test]
    fn near_source_skipped_when_other_flow_crosses() {
        let mut edges = vec![
            edge(
                "e",
                Some("ok"),
                &[(0.0, 50.0), (150.0, 50.0), (150.0, 400.0)],
            ),
            edge("other", None, &[(20.0, 0.0), (20.0, 100.0)]),
        ];
        let ns: IndexSet<String> = ["e".to_string()].into_iter().collect();
        place_edge_labels(&mut edges, &IndexMap::new(), &ns);
        // falls back to the longest segment (the vertical one)
        let b = edges[0].label_bounds.expect("placed");
        assert!(b.x > 100.0);
    }

    #[test]
    fn unlabelled_edges_untouched() {
        let mut edges = vec![edge("e", Some(""), &[(0.0, 0.0), (100.0, 0.0)])];
        place_edge_labels(&mut edges, &IndexMap::new(), &IndexSet::new());
        assert!(edges[0].label_bounds.is_none());
    }
}
