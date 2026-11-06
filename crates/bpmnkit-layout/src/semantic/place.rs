//! Twin of `layout/semantic/place.ts`.

use super::bands::BandLayout;
use super::graph::SemanticGraph;
use crate::types::{Bounds, GridHint, LaneBand};
use bpmnkit_bpmn::model::{BpmnFlowElement, BpmnLaneSet};
use indexmap::{IndexMap, IndexSet};

pub const H_GAP: f64 = 60.0;
pub const V_GAP: f64 = 60.0;
pub const CONTAINER_GAP: f64 = 100.0;
pub const COMPONENT_GAP: f64 = 80.0;
pub const LANE_PADDING: f64 = 40.0;
pub const BOUNDARY_SIZE: f64 = 36.0;

/// `Placement`.
#[derive(Debug, Clone, Default)]
pub struct Placement {
    pub bounds: IndexMap<String, Bounds>,
    pub lanes: Vec<LaneBand>,
    /// Keyed by rank.
    pub gutter_x: IndexMap<i64, f64>,
}

/// `externalLabelWidth(type, name)`.
pub fn external_label_width(kind: &str, name: &str) -> Option<f64> {
    let _ = (kind, name);
    todo!("port semantic/place.ts")
}

/// `sizeOf(el, childExtent)`: `(width, height)`.
pub fn size_of(el: &BpmnFlowElement, child_extent: Option<&Bounds>) -> (f64, f64) {
    let _ = (el, child_extent);
    todo!("port semantic/place.ts")
}

/// `place(graph, bandLayout, sizes, laneSet, packLoose, titled, grid, axes)`.
#[allow(clippy::too_many_arguments)]
pub fn place(
    graph: &SemanticGraph,
    band_layout: &BandLayout,
    sizes: &IndexMap<String, (f64, f64)>,
    lane_set: Option<&BpmnLaneSet>,
    pack_loose: bool,
    titled: &IndexSet<String>,
    grid: Option<&GridHint>,
    axes: &IndexMap<String, f64>,
) -> Placement {
    let _ = (
        graph,
        band_layout,
        sizes,
        lane_set,
        pack_loose,
        titled,
        grid,
        axes,
    );
    todo!("port semantic/place.ts")
}
