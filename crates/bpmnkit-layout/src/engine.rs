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
}

/// `layoutProcess(process, engine, collapsed, grids)`.
pub fn layout_process(
    process: &BpmnProcess,
    engine: LayoutEngine,
    collapsed: &IndexSet<String>,
    grids: Option<&IndexMap<String, GridHint>>,
) -> LayoutResult {
    match engine {
        LayoutEngine::Grid => crate::grid::engine::grid_layout_flow_nodes(
            &process.contents.flow_elements,
            &process.contents.sequence_flows,
        ),
        LayoutEngine::Semantic => {
            crate::semantic::semantic_layout_process(process, collapsed, grids)
        }
    }
}

/// `layoutFlowNodes(flowNodes, sequenceFlows)`: the grid engine (ascii, proxy, compact).
pub fn layout_flow_nodes(
    flow_nodes: &[BpmnFlowElement],
    sequence_flows: &[BpmnSequenceFlow],
) -> LayoutResult {
    crate::grid::engine::grid_layout_flow_nodes(flow_nodes, sequence_flows)
}
