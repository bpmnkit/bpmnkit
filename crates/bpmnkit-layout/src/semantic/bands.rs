//! Twin of `layout/semantic/bands.ts`.

use super::graph::SemanticGraph;
use bpmnkit_bpmn::model::BpmnBoundaryEvent;
use indexmap::{IndexMap, IndexSet};

/// `BandLayout`.
#[derive(Debug, Clone, Default)]
pub struct BandLayout {
    pub bands: IndexMap<String, i64>,
    pub spine: IndexSet<String>,
    pub straight_flows: IndexSet<String>,
}

/// `boundarySide(event, hostTitled)`: `1` or `-1`.
pub fn boundary_side(event: &BpmnBoundaryEvent, host_titled: bool) -> i64 {
    let _ = (event, host_titled);
    todo!("port semantic/bands.ts")
}

/// `assignBands(graph, titled)`.
pub fn assign_bands(graph: &SemanticGraph, titled: &IndexSet<String>) -> BandLayout {
    let _ = (graph, titled);
    todo!("port semantic/bands.ts")
}
