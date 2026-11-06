//! Twin of `layout/semantic/graph.ts`.

use bpmnkit_bpmn::model::{BpmnBoundaryEvent, BpmnFlowElement, BpmnSequenceFlow};
use indexmap::{IndexMap, IndexSet};
use std::cell::RefCell;

/// Flow-node types that end a path (`END_TYPES`), used to score candidate spine edges.
fn is_end_type(kind: &str) -> bool {
    kind == "endEvent"
}

/// `SemanticGraph`. Maps and sets keep JS insertion order.
///
/// Adjacency for one process scope, with cycles broken and ranks assigned.
/// Boundary events are not ranked themselves: they dock onto their host, and an
/// implicit host -> handler edge carries their successors forward instead.
#[derive(Debug, Clone)]
pub struct SemanticGraph<'a> {
    /// Rankable flow nodes, in declaration order. Boundary events excluded.
    pub nodes: Vec<&'a BpmnFlowElement>,
    pub by_id: IndexMap<String, &'a BpmnFlowElement>,
    pub outgoing: IndexMap<String, Vec<&'a BpmnSequenceFlow>>,
    pub incoming: IndexMap<String, Vec<&'a BpmnSequenceFlow>>,
    /// hostId -> boundary events attached to it, in declaration order.
    pub attachers: IndexMap<String, Vec<&'a BpmnBoundaryEvent>>,
    /// Ids of sequence flows that close a cycle; excluded from ranking.
    pub back_edges: IndexSet<String>,
    /// Weakly connected components, each a node-id list in declaration order.
    pub components: Vec<Vec<String>>,
    /// Semantic start node id per component, index-aligned with `components`.
    pub starts: Vec<String>,
    /// Longest-path rank per node id.
    pub ranks: IndexMap<String, i64>,
    /// Lazily built by [`reaches_end`].
    pub end_reach: RefCell<Option<IndexSet<String>>>,
}

/// `effectiveSource(flow, byId)`: a flow out of a boundary event belongs to the
/// host's position, not the event's.
fn effective_source(flow: &BpmnSequenceFlow, by_id: &IndexMap<String, &BpmnFlowElement>) -> String {
    if let Some(BpmnFlowElement::BoundaryEvent(be)) = by_id.get(&flow.source_ref).copied() {
        return be.attached_to_ref.clone();
    }
    flow.source_ref.clone()
}

/// `buildSemanticGraph(flowElements, sequenceFlows)`.
pub fn build_semantic_graph<'a>(
    flow_elements: &'a [BpmnFlowElement],
    sequence_flows: &'a [BpmnSequenceFlow],
) -> SemanticGraph<'a> {
    let mut by_id: IndexMap<String, &'a BpmnFlowElement> = IndexMap::new();
    for el in flow_elements {
        by_id.insert(el.base().id.clone(), el);
    }

    let mut nodes: Vec<&'a BpmnFlowElement> = Vec::new();
    let mut attachers: IndexMap<String, Vec<&'a BpmnBoundaryEvent>> = IndexMap::new();
    for el in flow_elements {
        if let BpmnFlowElement::BoundaryEvent(be) = el {
            attachers
                .entry(be.attached_to_ref.clone())
                .or_default()
                .push(be);
        } else {
            nodes.push(el);
        }
    }

    let mut outgoing: IndexMap<String, Vec<&'a BpmnSequenceFlow>> = IndexMap::new();
    let mut incoming: IndexMap<String, Vec<&'a BpmnSequenceFlow>> = IndexMap::new();
    for flow in sequence_flows {
        let from = effective_source(flow, &by_id);
        if !by_id.contains_key(&from) || !by_id.contains_key(&flow.target_ref) {
            continue;
        }
        outgoing.entry(from).or_default().push(flow);
        incoming
            .entry(flow.target_ref.clone())
            .or_default()
            .push(flow);
    }

    let mut graph = SemanticGraph {
        nodes,
        by_id,
        outgoing,
        incoming,
        attachers,
        back_edges: IndexSet::new(),
        components: Vec::new(),
        starts: Vec::new(),
        ranks: IndexMap::new(),
        end_reach: RefCell::new(None),
    };

    find_components(&mut graph);
    mark_back_edges(&mut graph);
    assign_ranks(&mut graph);
    graph
}

/// `findComponents`: weakly connected components, discovered in declaration order.
fn find_components(graph: &mut SemanticGraph) {
    let mut seen: IndexSet<String> = IndexSet::new();
    // Declaration order within the component keeps ties deterministic. Built once:
    // the TS rebuilds the same map per component.
    let mut order: IndexMap<&str, usize> = IndexMap::new();
    for (i, n) in graph.nodes.iter().enumerate() {
        order.insert(n.base().id.as_str(), i);
    }
    let mut components = Vec::new();
    let mut starts = Vec::new();
    for node in &graph.nodes {
        let node_id = &node.base().id;
        if seen.contains(node_id) {
            continue;
        }
        let mut members: Vec<String> = Vec::new();
        let mut stack: Vec<String> = vec![node_id.clone()];
        while let Some(id) = stack.pop() {
            if seen.contains(&id) {
                continue;
            }
            seen.insert(id.clone());
            members.push(id.clone());
            if let Some(out) = graph.outgoing.get(&id) {
                for f in out {
                    stack.push(f.target_ref.clone());
                }
            }
            if let Some(inc) = graph.incoming.get(&id) {
                for f in inc {
                    stack.push(effective_source(f, &graph.by_id));
                }
            }
        }
        members.sort_by_key(|id| order.get(id.as_str()).copied().unwrap_or(0));
        starts.push(pick_start(&members, graph));
        components.push(members);
    }
    graph.components = components;
    graph.starts = starts;
}

/// `pickStart`: a component starts at its earliest declared start event, else its
/// earliest node with no incoming flow, else its earliest declared node.
fn pick_start(members: &[String], graph: &SemanticGraph) -> String {
    let start_event = members.iter().find(|id| {
        matches!(
            graph.by_id.get(id.as_str()).copied(),
            Some(BpmnFlowElement::StartEvent(_))
        )
    });
    // `if (startEvent)`: an empty id is falsy in JS.
    if let Some(s) = start_event {
        if !s.is_empty() {
            return s.clone();
        }
    }
    let source = members
        .iter()
        .find(|id| graph.incoming.get(id.as_str()).is_none_or(|v| v.is_empty()));
    if let Some(s) = source {
        return s.clone();
    }
    members.first().cloned().unwrap_or_default()
}

#[derive(Clone, Copy, PartialEq, Eq)]
enum VisitState {
    Open,
    Done,
}

/// `markBackEdges`: depth-first from each semantic start; an edge onto a node
/// already on the traversal stack closes a cycle and is excluded from ranking.
fn mark_back_edges(graph: &mut SemanticGraph) {
    fn visit(
        outgoing: &IndexMap<String, Vec<&BpmnSequenceFlow>>,
        back_edges: &mut IndexSet<String>,
        state: &mut IndexMap<String, VisitState>,
        id: &str,
    ) {
        state.insert(id.to_string(), VisitState::Open);
        if let Some(flows) = outgoing.get(id) {
            for flow in flows {
                let target = flow.target_ref.as_str();
                match state.get(target).copied() {
                    Some(VisitState::Open) => {
                        back_edges.insert(flow.id.clone());
                    }
                    None => visit(outgoing, back_edges, state, target),
                    Some(VisitState::Done) => {}
                }
            }
        }
        state.insert(id.to_string(), VisitState::Done);
    }

    let mut state: IndexMap<String, VisitState> = IndexMap::new();
    for start in &graph.starts {
        if !start.is_empty() && !state.contains_key(start) {
            visit(&graph.outgoing, &mut graph.back_edges, &mut state, start);
        }
    }
    // Nodes only reachable through a cycle still need a traversal root.
    for node in &graph.nodes {
        let id = &node.base().id;
        if !state.contains_key(id) {
            visit(&graph.outgoing, &mut graph.back_edges, &mut state, id);
        }
    }
}

fn is_gateway_type(kind: &str) -> bool {
    matches!(
        kind,
        "exclusiveGateway"
            | "parallelGateway"
            | "inclusiveGateway"
            | "eventBasedGateway"
            | "complexGateway"
    )
}

/// `isJoin`: true when a node merges more than one path.
fn is_join(graph: &SemanticGraph, id: &str) -> bool {
    graph.incoming.get(id).map_or(0, |v| v.len()) > 1
}

/// `sharesRank`: nested joins of one gateway type may share a rank and connect
/// vertically; joins of different types keep their forward step, because the
/// change of gateway is itself part of the story.
fn shares_rank(graph: &SemanticGraph, flow: &BpmnSequenceFlow) -> bool {
    let (Some(source), Some(target)) = (
        graph.by_id.get(&flow.source_ref).copied(),
        graph.by_id.get(&flow.target_ref).copied(),
    ) else {
        return false;
    };
    if source.type_name() != target.type_name() || !is_gateway_type(source.type_name()) {
        return false;
    }
    is_join(graph, &source.base().id) && is_join(graph, &target.base().id)
}

/// `assignRanks`: longest-path ranks over the acyclic remainder.
fn assign_ranks(graph: &mut SemanticGraph) {
    let mut ranks: IndexMap<String, i64> = IndexMap::new();
    for node in &graph.nodes {
        ranks.insert(node.base().id.clone(), 0);
    }

    // Longest path: relax every edge until no rank grows. |V| passes suffice
    // because the remaining graph is acyclic.
    for _pass in 0..graph.nodes.len() + 1 {
        let mut changed = false;
        for node in &graph.nodes {
            let id = &node.base().id;
            let rank = ranks.get(id).copied().unwrap_or(0);
            if let Some(flows) = graph.outgoing.get(id) {
                for flow in flows {
                    if graph.back_edges.contains(&flow.id) {
                        continue;
                    }
                    let step = if shares_rank(graph, flow) { 0 } else { 1 };
                    let target = ranks.get(&flow.target_ref).copied().unwrap_or(0);
                    if target < rank + step {
                        ranks.insert(flow.target_ref.clone(), rank + step);
                        changed = true;
                    }
                }
            }
        }
        if !changed {
            break;
        }
    }

    // Normalize each component so its start sits at rank 0.
    for members in &graph.components {
        let min = members
            .iter()
            .map(|id| ranks.get(id).copied().unwrap_or(0))
            .min();
        let Some(min) = min else { continue };
        if min == 0 {
            continue;
        }
        for id in members {
            let r = ranks.get(id).copied().unwrap_or(0) - min;
            ranks.insert(id.clone(), r);
        }
    }
    graph.ranks = ranks;
}

/// `reachesEnd(graph, id)`: true when an end event is reachable from `id`
/// without traversing a back edge. A node other than `id` itself that has no
/// outgoing flow also ends the path.
///
/// The reverse reachability set is computed once per graph, so repeated calls
/// from the spine tracer stay O(1) instead of re-walking the graph each time.
pub fn reaches_end(graph: &SemanticGraph, id: &str) -> bool {
    if let Some(node) = graph.by_id.get(id) {
        if is_end_type(node.type_name()) {
            return true;
        }
    }
    if graph.end_reach.borrow().is_none() {
        let reach = build_end_reach(graph);
        *graph.end_reach.borrow_mut() = Some(reach);
    }
    let cache = graph.end_reach.borrow();
    let Some(end_reach) = cache.as_ref() else {
        return false;
    };
    if let Some(flows) = graph.outgoing.get(id) {
        for flow in flows {
            if !graph.back_edges.contains(&flow.id) && end_reach.contains(&flow.target_ref) {
                return true;
            }
        }
    }
    false
}

/// `buildEndReach`: every node from which a path along non-back edges reaches an
/// end event or a node with no outgoing flow (both inclusive), by one reverse walk.
fn build_end_reach(graph: &SemanticGraph) -> IndexSet<String> {
    let mut reach: IndexSet<String> = IndexSet::new();
    let mut stack: Vec<String> = Vec::new();
    for node in graph.by_id.values() {
        let id = &node.base().id;
        let out = graph.outgoing.get(id);
        if is_end_type(node.type_name()) || out.is_none_or(|o| o.is_empty()) {
            reach.insert(id.clone());
            stack.push(id.clone());
        }
    }
    while let Some(id) = stack.pop() {
        if let Some(flows) = graph.incoming.get(&id) {
            for flow in flows {
                if graph.back_edges.contains(&flow.id) {
                    continue;
                }
                let from = effective_source(flow, &graph.by_id);
                if !reach.contains(&from) {
                    reach.insert(from.clone());
                    stack.push(from);
                }
            }
        }
    }
    reach
}
