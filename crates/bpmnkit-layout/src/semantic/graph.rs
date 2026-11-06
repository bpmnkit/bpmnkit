//! Twin of `layout/semantic/graph.ts`.

use bpmnkit_bpmn::model::{BpmnBoundaryEvent, BpmnFlowElement, BpmnSequenceFlow};
use indexmap::{IndexMap, IndexSet};
use std::cell::RefCell;

/// `SemanticGraph`. Maps and sets keep JS insertion order.
#[derive(Debug, Clone)]
pub struct SemanticGraph<'a> {
    pub nodes: Vec<&'a BpmnFlowElement>,
    pub by_id: IndexMap<String, &'a BpmnFlowElement>,
    pub outgoing: IndexMap<String, Vec<&'a BpmnSequenceFlow>>,
    pub incoming: IndexMap<String, Vec<&'a BpmnSequenceFlow>>,
    pub attachers: IndexMap<String, Vec<&'a BpmnBoundaryEvent>>,
    pub back_edges: IndexSet<String>,
    pub components: Vec<Vec<String>>,
    pub starts: Vec<String>,
    pub ranks: IndexMap<String, i64>,
    /// Lazily built by [`reaches_end`].
    pub end_reach: RefCell<Option<IndexSet<String>>>,
}

/// `buildSemanticGraph(flowElements, sequenceFlows)`.
pub fn build_semantic_graph<'a>(
    flow_elements: &'a [BpmnFlowElement],
    sequence_flows: &'a [BpmnSequenceFlow],
) -> SemanticGraph<'a> {
    let _ = (flow_elements, sequence_flows);
    todo!("port semantic/graph.ts")
}

/// `reachesEnd(graph, id)`.
pub fn reaches_end(graph: &SemanticGraph, id: &str) -> bool {
    let _ = (graph, id);
    todo!("port semantic/graph.ts")
}
