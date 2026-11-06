//! Twin of `layout/grid/flow-graph.ts`.

use bpmnkit_bpmn::model::{BpmnFlowElement, BpmnSequenceFlow};
use indexmap::{IndexMap, IndexSet};

/// Resolved adjacency for one nesting level of a process.
///
/// TS holds element objects and compares them by identity; here an element is its
/// index into `nodes` (the slice the graph was built from), which keeps that identity
/// even when two elements share an id.
pub struct FlowGraph<'a> {
    pub nodes: &'a [BpmnFlowElement],
    /// Grid-placeable elements: boundary events are excluded (they ride on their host).
    pub elements: Vec<usize>,
    pub by_id: IndexMap<String, usize>,
    pub outgoing: IndexMap<String, Vec<&'a BpmnSequenceFlow>>,
    pub incoming: IndexMap<String, Vec<&'a BpmnSequenceFlow>>,
    /// hostId -> boundary events attached to it, in document order.
    pub attachers: IndexMap<String, Vec<usize>>,
}

impl<'a> FlowGraph<'a> {
    pub fn node(&self, idx: usize) -> &'a BpmnFlowElement {
        &self.nodes[idx]
    }

    pub fn id(&self, idx: usize) -> &str {
        &self.nodes[idx].base().id
    }

    pub fn kind(&self, idx: usize) -> &'static str {
        self.nodes[idx].type_name()
    }

    /// Elements reached by the outgoing flows of `id` that resolve to a known node.
    pub fn outgoing_targets(&self, id: &str) -> Vec<usize> {
        self.outgoing
            .get(id)
            .map(|fs| {
                fs.iter()
                    .filter_map(|f| self.by_id.get(&f.target_ref).copied())
                    .collect()
            })
            .unwrap_or_default()
    }
}

/// `isTaskLike`: bpmn:Task subtypes, used for the "right-align before a task-only
/// fan-out" rule.
pub fn is_task_like(kind: &str) -> bool {
    matches!(
        kind,
        "task"
            | "userTask"
            | "serviceTask"
            | "scriptTask"
            | "sendTask"
            | "receiveTask"
            | "businessRuleTask"
            | "manualTask"
    )
}

/// `buildFlowGraph(flowNodes, sequenceFlows)`.
pub fn build_flow_graph<'a>(
    flow_nodes: &'a [BpmnFlowElement],
    sequence_flows: &'a [BpmnSequenceFlow],
) -> FlowGraph<'a> {
    let mut by_id: IndexMap<String, usize> = IndexMap::new();
    for (i, n) in flow_nodes.iter().enumerate() {
        by_id.insert(n.base().id.clone(), i);
    }

    let mut outgoing: IndexMap<String, Vec<&BpmnSequenceFlow>> = IndexMap::new();
    let mut incoming: IndexMap<String, Vec<&BpmnSequenceFlow>> = IndexMap::new();
    for f in sequence_flows {
        outgoing.entry(f.source_ref.clone()).or_default().push(f);
        incoming.entry(f.target_ref.clone()).or_default().push(f);
    }

    let mut attachers: IndexMap<String, Vec<usize>> = IndexMap::new();
    let mut elements = Vec::new();
    for (i, n) in flow_nodes.iter().enumerate() {
        if let BpmnFlowElement::BoundaryEvent(be) = n {
            attachers
                .entry(be.attached_to_ref.clone())
                .or_default()
                .push(i);
        } else {
            elements.push(i);
        }
    }

    FlowGraph {
        nodes: flow_nodes,
        elements,
        by_id,
        outgoing,
        incoming,
        attachers,
    }
}

fn is_boundary_attached_to(source: Option<&BpmnFlowElement>, el_id: &str) -> bool {
    matches!(source, Some(BpmnFlowElement::BoundaryEvent(be)) if be.attached_to_ref == el_id)
}

/// `hasOtherIncoming`: true iff the element has a "real" predecessor, an incoming
/// flow that is neither a self-loop nor sourced from a boundary event / its own
/// attacher. Elements without one become traversal starting points.
pub fn has_other_incoming(el: usize, graph: &FlowGraph) -> bool {
    let el_id = graph.id(el);
    let Some(flows) = graph.incoming.get(el_id) else {
        return false;
    };
    for f in flows {
        if f.source_ref == el_id {
            continue;
        }
        let source = graph.by_id.get(&f.source_ref).map(|&i| graph.node(i));
        if !matches!(source, Some(BpmnFlowElement::BoundaryEvent(_))) {
            return true;
        }
        if !is_boundary_attached_to(source, el_id) {
            return true;
        }
    }
    false
}

/// `isFutureIncoming`: true iff el is a join (>1 incoming) with at least one
/// not-yet-visited feeder.
pub fn is_future_incoming(el: usize, visited: &IndexSet<String>, graph: &FlowGraph) -> bool {
    let Some(flows) = graph.incoming.get(graph.id(el)) else {
        return false;
    };
    if flows.len() <= 1 {
        return false;
    }
    flows.iter().any(|f| !visited.contains(&f.source_ref))
}

/// `formsLoop`: true iff some unvisited feeder of el is reachable downstream FROM el
/// (a cycle).
pub fn forms_loop(el: usize, visited: &IndexSet<String>, graph: &FlowGraph) -> bool {
    let el_id = graph.id(el);
    let feeders: Vec<&str> = graph
        .incoming
        .get(el_id)
        .map(|fs| {
            fs.iter()
                .map(|f| f.source_ref.as_str())
                .filter(|id| !visited.contains(*id))
                .collect()
        })
        .unwrap_or_default();
    feeders
        .into_iter()
        .any(|feeder| is_reachable(el_id, feeder, graph))
}

fn is_reachable(from_id: &str, target_id: &str, graph: &FlowGraph) -> bool {
    let mut seen: IndexSet<&str> = IndexSet::new();
    let mut stack: Vec<&str> = vec![from_id];
    while let Some(id) = stack.pop() {
        if seen.contains(id) {
            continue;
        }
        seen.insert(id);
        if let Some(fs) = graph.outgoing.get(id) {
            for f in fs {
                if f.target_ref == target_id {
                    return true;
                }
                stack.push(f.target_ref.as_str());
            }
        }
    }
    false
}
