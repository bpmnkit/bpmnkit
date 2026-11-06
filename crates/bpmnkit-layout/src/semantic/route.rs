//! Twin of `layout/semantic/route.ts`.

use super::bands::BandLayout;
use super::graph::SemanticGraph;
use crate::types::{Bounds, LayoutEdge};
use bpmnkit_bpmn::model::BpmnSequenceFlow;
use indexmap::IndexMap;

/// `routeFlows(graph, flows, bounds, bandLayout, gutterX)`.
pub fn route_flows(
    graph: &SemanticGraph,
    flows: &[BpmnSequenceFlow],
    bounds: &IndexMap<String, Bounds>,
    band_layout: &BandLayout,
    gutter_x: &IndexMap<i64, f64>,
) -> Vec<LayoutEdge> {
    let _ = (graph, flows, bounds, band_layout, gutter_x);
    todo!("port semantic/route.ts")
}
