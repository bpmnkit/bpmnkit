//! Twin of `layout/annotations.ts`.

use crate::types::{AnnotationSide, Bounds, LayoutEdge, LayoutNode, Waypoint};
use bpmnkit_bpmn::model::BpmnProcess;
use indexmap::IndexMap;

/// `packAnnotations(process, layoutNodes, layoutEdges, sides)`: bounds per annotation id.
pub fn pack_annotations(
    process: &BpmnProcess,
    layout_nodes: &[LayoutNode],
    layout_edges: &[LayoutEdge],
    sides: Option<&IndexMap<String, AnnotationSide>>,
) -> IndexMap<String, Bounds> {
    let _ = (process, layout_nodes, layout_edges, sides);
    todo!("port layout/annotations.ts")
}

/// `associationWaypoints(elementBounds, annotationBounds)`: `(pElem, pAnn)`.
pub fn association_waypoints(element: &Bounds, annotation: &Bounds) -> (Waypoint, Waypoint) {
    let _ = (element, annotation);
    todo!("port layout/annotations.ts")
}
