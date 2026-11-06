//! Twin of `layout/grid/grid-engine.ts`.

use crate::types::LayoutResult;
use bpmnkit_bpmn::model::{BpmnFlowElement, BpmnSequenceFlow};

/// `gridLayoutFlowNodes(flowNodes, sequenceFlows)`.
pub fn grid_layout_flow_nodes(
    flow_nodes: &[BpmnFlowElement],
    sequence_flows: &[BpmnSequenceFlow],
) -> LayoutResult {
    let _ = (flow_nodes, sequence_flows);
    todo!("port grid/grid-engine.ts")
}
