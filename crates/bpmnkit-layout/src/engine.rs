//! Twin of `layout/layout-engine.ts`.

use crate::types::{GridHint, LayoutResult};
use bpmnkit_bpmn::model::{BpmnFlowElement, BpmnProcess, BpmnSequenceFlow};
use indexmap::{IndexMap, IndexSet};

/// Which layout algorithm to run.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
pub enum LayoutEngine {
    #[default]
    Semantic,
    Grid,
    /// Semantic graph, sizes and labels, but lane-free scopes are placed and routed
    /// Sugiyama-style (see `layered`); experimental.
    Layered,
}

/// `layoutProcess(process, engine, collapsed, grids, inPool)`.
pub fn layout_process(
    process: &BpmnProcess,
    engine: LayoutEngine,
    collapsed: &IndexSet<String>,
    grids: Option<&IndexMap<String, GridHint>>,
    in_pool: bool,
) -> LayoutResult {
    match engine {
        LayoutEngine::Grid => crate::grid::engine::grid_layout_flow_nodes(
            &process.contents.flow_elements,
            &process.contents.sequence_flows,
        ),
        LayoutEngine::Semantic | LayoutEngine::Layered => crate::semantic::semantic_layout_process(
            process,
            collapsed,
            grids,
            in_pool,
            engine == LayoutEngine::Layered,
        ),
    }
}

/// `layoutFlowNodes(flowNodes, sequenceFlows)`: the grid engine (ascii, proxy, compact).
pub fn layout_flow_nodes(
    flow_nodes: &[BpmnFlowElement],
    sequence_flows: &[BpmnSequenceFlow],
) -> LayoutResult {
    crate::grid::engine::grid_layout_flow_nodes(flow_nodes, sequence_flows)
}
