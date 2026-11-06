//! Twin of `layout/overlap.ts` (`assertNoOverlap`).

use crate::hash::IndexSet;
use crate::types::{Bounds, LayoutResult};

struct Item {
    id: String,
    kind: &'static str,
    bounds: Bounds,
}

/// `assertNoOverlap(result)`: `Err` carries the message TS throws.
///
/// No two element bounding boxes may overlap and no element may overlap a label.
/// Label-vs-label overlaps are allowed when both labels belong to a node and an
/// edge connected to that node.
pub fn assert_no_overlap(result: &LayoutResult) -> Result<(), String> {
    let mut all: Vec<Item> = Vec::new();

    for node in &result.nodes {
        // Boundary events intentionally overlap their host activity — skip them.
        if node.kind == "boundaryEvent" {
            continue;
        }
        all.push(Item {
            id: node.id.clone(),
            kind: "element",
            bounds: node.bounds,
        });
        if let Some(lb) = node.label_bounds {
            all.push(Item {
                id: format!("{}-label", node.id),
                kind: "label",
                bounds: lb,
            });
        }
    }

    // Track which nodes are connected to which edges
    let mut edge_endpoints: IndexSet<String> = IndexSet::default();
    for edge in &result.edges {
        if let Some(lb) = edge.label_bounds {
            all.push(Item {
                id: format!("{}-label", edge.id),
                kind: "label",
                bounds: lb,
            });
        }
        edge_endpoints.insert(format!("{}:{}", edge.id, edge.source_ref));
        edge_endpoints.insert(format!("{}:{}", edge.id, edge.target_ref));
    }

    for i in 0..all.len() {
        for j in (i + 1)..all.len() {
            let a = &all[i];
            let b = &all[j];

            // Skip label-to-same-element overlap checks (labels belong to their element)
            if strip_label(&a.id) == strip_label(&b.id) {
                continue;
            }

            // Skip label-vs-label overlaps between a node and its connected edge
            if a.kind == "label"
                && b.kind == "label"
                && are_connected_labels(&a.id, &b.id, &edge_endpoints)
            {
                continue;
            }

            if bounds_overlap(&a.bounds, &b.bounds) {
                // Check if one is a sub-process containing the other
                if is_contained_within(&a.bounds, &b.bounds)
                    || is_contained_within(&b.bounds, &a.bounds)
                {
                    continue;
                }
                return Err(format!(
                    "Layout overlap detected: {} \"{}\" overlaps with {} \"{}\"",
                    a.kind, a.id, b.kind, b.id
                ));
            }
        }
    }
    Ok(())
}

/// `id.replace("-label", "")`: JS replaces the first occurrence only.
fn strip_label(id: &str) -> String {
    id.replacen("-label", "", 1)
}

fn are_connected_labels(id_a: &str, id_b: &str, edge_endpoints: &IndexSet<String>) -> bool {
    let base_a = strip_label(id_a);
    let base_b = strip_label(id_b);
    edge_endpoints.contains(&format!("{base_a}:{base_b}"))
        || edge_endpoints.contains(&format!("{base_b}:{base_a}"))
}

/// Two bounding boxes overlap (exclusive of touching edges).
fn bounds_overlap(a: &Bounds, b: &Bounds) -> bool {
    a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y
}

fn is_contained_within(inner: &Bounds, outer: &Bounds) -> bool {
    inner.x >= outer.x
        && inner.y >= outer.y
        && inner.x + inner.width <= outer.x + outer.width
        && inner.y + inner.height <= outer.y + outer.height
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::{LayoutEdge, LayoutNode};

    fn node(id: &str, kind: &str, x: f64, y: f64) -> LayoutNode {
        LayoutNode {
            id: id.into(),
            kind: kind.into(),
            bounds: Bounds {
                x,
                y,
                width: 100.0,
                height: 80.0,
            },
            ..Default::default()
        }
    }

    #[test]
    fn disjoint_and_touching_pass() {
        let r = LayoutResult {
            nodes: vec![node("a", "task", 0.0, 0.0), node("b", "task", 100.0, 0.0)],
            ..Default::default()
        };
        assert_eq!(assert_no_overlap(&r), Ok(()));
    }

    #[test]
    fn overlap_message_matches_ts() {
        let r = LayoutResult {
            nodes: vec![node("a", "task", 0.0, 0.0), node("b", "task", 50.0, 10.0)],
            ..Default::default()
        };
        assert_eq!(
            assert_no_overlap(&r),
            Err("Layout overlap detected: element \"a\" overlaps with element \"b\"".to_string())
        );
    }

    #[test]
    fn boundary_events_and_containment_are_skipped() {
        let mut inner = node("c", "task", 10.0, 10.0);
        inner.bounds.width = 20.0;
        inner.bounds.height = 20.0;
        let r = LayoutResult {
            nodes: vec![
                node("a", "subProcess", 0.0, 0.0),
                inner,
                node("be", "boundaryEvent", 50.0, 10.0),
            ],
            ..Default::default()
        };
        assert_eq!(assert_no_overlap(&r), Ok(()));
    }

    #[test]
    fn connected_labels_may_overlap() {
        let lb = Bounds {
            x: 0.0,
            y: 0.0,
            width: 30.0,
            height: 14.0,
        };
        let mut a = node("a", "task", 500.0, 0.0);
        a.label_bounds = Some(lb);
        let r = LayoutResult {
            nodes: vec![a],
            edges: vec![LayoutEdge {
                id: "f".into(),
                source_ref: "a".into(),
                target_ref: "z".into(),
                label_bounds: Some(lb),
                ..Default::default()
            }],
            ..Default::default()
        };
        assert_eq!(assert_no_overlap(&r), Ok(()));
    }
}
