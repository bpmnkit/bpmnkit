//! Twin of `layout/grid/edge-labels.ts`. Shared by both engines.

use crate::types::{LayoutEdge, LayoutNode};
use indexmap::{IndexMap, IndexSet};

/// `placeEdgeLabels(edges, nodeMap, nearSource)`: sets `label_bounds` on labelled edges.
pub fn place_edge_labels(
    edges: &mut [LayoutEdge],
    node_map: &IndexMap<String, &LayoutNode>,
    near_source: &IndexSet<String>,
) {
    let _ = (edges, node_map, near_source);
    todo!("port grid/edge-labels.ts")
}
