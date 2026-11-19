//! Twin of `layout/semantic/graph.ts`.

use crate::hash::{IndexMap, IndexSet};
use bpmnkit_bpmn::model::{BpmnBoundaryEvent, BpmnFlowElement, BpmnSequenceFlow};
use std::cell::RefCell;

/// Flow-node types that end a path (`END_TYPES`), used to score candidate spine edges.
fn is_end_type(kind: &str) -> bool {
    kind == "endEvent"
}

/// `SemanticGraph`. Maps and sets keep JS insertion order; ids borrow from the model.
///
/// Adjacency for one process scope, with cycles broken and ranks assigned.
/// Boundary events are not ranked themselves: they dock onto their host, and an
/// implicit host -> handler edge carries their successors forward instead.
#[derive(Debug, Clone)]
pub struct SemanticGraph<'a> {
    /// Rankable flow nodes, in declaration order. Boundary events excluded.
    pub nodes: Vec<&'a BpmnFlowElement>,
    pub by_id: IndexMap<&'a str, &'a BpmnFlowElement>,
    pub outgoing: IndexMap<&'a str, Vec<&'a BpmnSequenceFlow>>,
    pub incoming: IndexMap<&'a str, Vec<&'a BpmnSequenceFlow>>,
    /// hostId -> boundary events attached to it, in declaration order.
    pub attachers: IndexMap<&'a str, Vec<&'a BpmnBoundaryEvent>>,
    /// Ids of sequence flows that close a cycle; excluded from ranking.
    pub back_edges: IndexSet<&'a str>,
    /// Weakly connected components, each a node-id list in declaration order.
    pub components: Vec<Vec<&'a str>>,
    /// Semantic start node id per component, index-aligned with `components`.
    pub starts: Vec<&'a str>,
    /// Longest-path rank per node id.
    pub ranks: IndexMap<&'a str, i64>,
    /// Lazily built by [`reaches_end`].
    pub end_reach: RefCell<Option<IndexSet<&'a str>>>,
    /// Nodes of the handlers placed on an exception row by [`place_exception_row`].
    pub exception_row: IndexSet<&'a str>,
    /// Stack one-node detours under their sibling target. Off inside pools, where
    /// message routing depends on the pool's shape, and inside containers.
    pub stack_detours: bool,
}

/// `effectiveSource(flow, byId)`: a flow out of a boundary event belongs to the
/// host's position, not the event's.
fn effective_source<'a>(
    flow: &'a BpmnSequenceFlow,
    by_id: &IndexMap<&'a str, &'a BpmnFlowElement>,
) -> &'a str {
    if let Some(BpmnFlowElement::BoundaryEvent(be)) = by_id.get(flow.source_ref.as_str()).copied() {
        return &be.attached_to_ref;
    }
    &flow.source_ref
}

/// `buildSemanticGraph(flowElements, sequenceFlows)`.
pub fn build_semantic_graph<'a>(
    flow_elements: &'a [BpmnFlowElement],
    sequence_flows: &'a [BpmnSequenceFlow],
    stack_detours: bool,
) -> SemanticGraph<'a> {
    let mut by_id: IndexMap<&'a str, &'a BpmnFlowElement> =
        IndexMap::with_capacity_and_hasher(flow_elements.len(), Default::default());
    for el in flow_elements {
        by_id.insert(&el.base().id, el);
    }

    let mut nodes: Vec<&'a BpmnFlowElement> = Vec::with_capacity(flow_elements.len());
    let mut attachers: IndexMap<&'a str, Vec<&'a BpmnBoundaryEvent>> = IndexMap::default();
    for el in flow_elements {
        // A data object has no shape: its references are what a diagram draws.
        if matches!(el, BpmnFlowElement::DataObject(_)) {
            continue;
        }
        if let BpmnFlowElement::BoundaryEvent(be) = el {
            attachers
                .entry(be.attached_to_ref.as_str())
                .or_default()
                .push(be);
        } else {
            nodes.push(el);
        }
    }

    let mut outgoing: IndexMap<&'a str, Vec<&'a BpmnSequenceFlow>> =
        IndexMap::with_capacity_and_hasher(nodes.len(), Default::default());
    let mut incoming: IndexMap<&'a str, Vec<&'a BpmnSequenceFlow>> =
        IndexMap::with_capacity_and_hasher(nodes.len(), Default::default());
    for flow in sequence_flows {
        let from = effective_source(flow, &by_id);
        if !by_id.contains_key(from) || !by_id.contains_key(flow.target_ref.as_str()) {
            continue;
        }
        outgoing.entry(from).or_default().push(flow);
        incoming
            .entry(flow.target_ref.as_str())
            .or_default()
            .push(flow);
    }

    let mut graph = SemanticGraph {
        nodes,
        by_id,
        outgoing,
        incoming,
        attachers,
        back_edges: IndexSet::default(),
        components: Vec::new(),
        starts: Vec::new(),
        ranks: IndexMap::default(),
        end_reach: RefCell::new(None),
        exception_row: IndexSet::default(),
        stack_detours,
    };

    find_components(&mut graph);
    mark_back_edges(&mut graph);
    assign_ranks(&mut graph, &IndexMap::default());
    graph
}

/// `findComponents`: weakly connected components, discovered in declaration order.
fn find_components(graph: &mut SemanticGraph) {
    let mut seen: IndexSet<&str> =
        IndexSet::with_capacity_and_hasher(graph.nodes.len(), Default::default());
    // Declaration order within the component keeps ties deterministic. Built once:
    // the TS rebuilds the same map per component.
    let mut order: IndexMap<&str, usize> =
        IndexMap::with_capacity_and_hasher(graph.nodes.len(), Default::default());
    for (i, n) in graph.nodes.iter().enumerate() {
        order.insert(n.base().id.as_str(), i);
    }
    let mut components = Vec::new();
    let mut starts = Vec::new();
    let mut stack = Vec::new();
    for node in &graph.nodes {
        let node_id = node.base().id.as_str();
        if seen.contains(node_id) {
            continue;
        }
        let mut members = Vec::new();
        stack.push(node_id);
        while let Some(id) = stack.pop() {
            if !seen.insert(id) {
                continue;
            }
            members.push(id);
            if let Some(out) = graph.outgoing.get(id) {
                for f in out {
                    stack.push(f.target_ref.as_str());
                }
            }
            if let Some(inc) = graph.incoming.get(id) {
                for f in inc {
                    stack.push(effective_source(f, &graph.by_id));
                }
            }
        }
        // Keys looked up once rather than per comparison; the sort stays stable.
        let mut keyed: Vec<(usize, &str)> = members
            .iter()
            .map(|&id| (order.get(id).copied().unwrap_or(0), id))
            .collect();
        keyed.sort_by_key(|&(key, _)| key);
        let members: Vec<&str> = keyed.into_iter().map(|(_, id)| id).collect();
        starts.push(pick_start(&members, graph));
        components.push(members);
    }
    graph.components = components;
    graph.starts = starts;
}

/// `pickStart`: a component starts at its earliest declared start event, else its
/// earliest node with no incoming flow, else its earliest declared node.
fn pick_start<'a>(members: &[&'a str], graph: &SemanticGraph<'a>) -> &'a str {
    let start_event = members.iter().find(|id| {
        matches!(
            graph.by_id.get(**id).copied(),
            Some(BpmnFlowElement::StartEvent(_))
        )
    });
    // `if (startEvent)`: an empty id is falsy in JS.
    if let Some(s) = start_event {
        if !s.is_empty() {
            return s;
        }
    }
    let source = members
        .iter()
        .find(|id| graph.incoming.get(**id).is_none_or(|v| v.is_empty()));
    if let Some(s) = source {
        return s;
    }
    members.first().copied().unwrap_or_default()
}

#[derive(Clone, Copy, PartialEq, Eq)]
enum VisitState {
    Open,
    Done,
}

/// `markBackEdges`: depth-first from each semantic start; an edge onto a node
/// already on the traversal stack closes a cycle and is excluded from ranking.
fn mark_back_edges(graph: &mut SemanticGraph) {
    fn visit<'a>(
        outgoing: &IndexMap<&'a str, Vec<&'a BpmnSequenceFlow>>,
        back_edges: &mut IndexSet<&'a str>,
        state: &mut IndexMap<&'a str, VisitState>,
        id: &'a str,
    ) {
        state.insert(id, VisitState::Open);
        if let Some(flows) = outgoing.get(id) {
            for &flow in flows {
                let target = flow.target_ref.as_str();
                match state.get(target).copied() {
                    Some(VisitState::Open) => {
                        back_edges.insert(&flow.id);
                    }
                    None => visit(outgoing, back_edges, state, target),
                    Some(VisitState::Done) => {}
                }
            }
        }
        state.insert(id, VisitState::Done);
    }

    let mut state: IndexMap<&str, VisitState> =
        IndexMap::with_capacity_and_hasher(graph.nodes.len(), Default::default());
    for &start in &graph.starts {
        if !start.is_empty() && !state.contains_key(start) {
            visit(&graph.outgoing, &mut graph.back_edges, &mut state, start);
        }
    }
    // Nodes only reachable through a cycle still need a traversal root.
    for node in &graph.nodes {
        let id = node.base().id.as_str();
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
        graph.by_id.get(flow.source_ref.as_str()).copied(),
        graph.by_id.get(flow.target_ref.as_str()).copied(),
    ) else {
        return false;
    };
    if source.type_name() != target.type_name() || !is_gateway_type(source.type_name()) {
        return false;
    }
    is_join(graph, &source.base().id) && is_join(graph, &target.base().id)
}

/// `feedsSibling`: a one-node detour of a split that leads straight into the
/// split's other target shares that target's column. True for the detour's
/// flow into that target.
fn feeds_sibling(graph: &SemanticGraph, flow: &BpmnSequenceFlow) -> bool {
    if !graph.stack_detours {
        return false;
    }
    let into = graph
        .incoming
        .get(flow.source_ref.as_str())
        .map_or(&[][..], |v| v.as_slice());
    let out = graph
        .outgoing
        .get(flow.source_ref.as_str())
        .map_or(&[][..], |v| v.as_slice());
    if into.len() != 1 || out.len() != 1 {
        return false;
    }
    let split = into[0];
    if graph
        .by_id
        .get(split.source_ref.as_str())
        .is_some_and(|el| el.type_name() == "boundaryEvent")
    {
        return false;
    }
    if graph.back_edges.contains(split.id.as_str()) || graph.back_edges.contains(flow.id.as_str()) {
        return false;
    }
    graph
        .outgoing
        .get(split.source_ref.as_str())
        .is_some_and(|fs| {
            fs.iter().any(|f| {
                f.target_ref == flow.target_ref
                    && !std::ptr::eq(*f, split)
                    && !graph.back_edges.contains(f.id.as_str())
            })
        })
}

/// `isDetour`: `id` is a detour stacked under its sibling target.
pub fn is_detour(graph: &SemanticGraph, id: &str) -> bool {
    match graph.outgoing.get(id) {
        Some(out) if out.len() == 1 => feeds_sibling(graph, out[0]),
        _ => false,
    }
}

/// `entersDetour`: `flow` enters a detour; the spine takes the sibling instead.
pub fn enters_detour(graph: &SemanticGraph, flow: &BpmnSequenceFlow) -> bool {
    is_detour(graph, &flow.target_ref)
}

/// `HandlerEntry`.
struct HandlerEntry<'a> {
    host: &'a str,
    /// The side the event docks on: -1 top, 1 bottom.
    side: i64,
    flows: Vec<&'a BpmnSequenceFlow>,
}

/// `handlerEntries`: the entry flows of each boundary event's handler, in host
/// then event order. Only a handler entered by that flow alone is listed.
fn handler_entries<'a>(
    graph: &SemanticGraph<'a>,
    side_of: &dyn Fn(&BpmnBoundaryEvent, &str) -> i64,
) -> Vec<HandlerEntry<'a>> {
    let mut entries = Vec::new();
    for (&host, events) in &graph.attachers {
        for event in events {
            let flows: Vec<&'a BpmnSequenceFlow> = graph
                .outgoing
                .get(host)
                .map(|v| v.as_slice())
                .unwrap_or(&[])
                .iter()
                .copied()
                .filter(|f| {
                    f.source_ref == event.base.id
                        && !graph.back_edges.contains(f.id.as_str())
                        && graph
                            .incoming
                            .get(f.target_ref.as_str())
                            .map_or(0, |v| v.len())
                            == 1
                })
                .collect();
            if flows.is_empty() {
                continue;
            }
            entries.push(HandlerEntry {
                host,
                side: side_of(event, host),
                flows,
            });
        }
    }
    entries
}

/// `chainOf`: the nodes only `entry` leads to.
fn chain_of<'a>(graph: &SemanticGraph<'a>, entry: &'a str) -> IndexSet<&'a str> {
    let mut chain: IndexSet<&'a str> = IndexSet::default();
    chain.insert(entry);
    let mut stack = vec![entry];
    while let Some(id) = stack.pop() {
        for f in graph.outgoing.get(id).map(|v| v.as_slice()).unwrap_or(&[]) {
            let t = f.target_ref.as_str();
            if graph.back_edges.contains(f.id.as_str()) || chain.contains(t) {
                continue;
            }
            if graph.incoming.get(t).map_or(0, |v| v.len()) != 1 {
                continue;
            }
            chain.insert(t);
            stack.push(t);
        }
    }
    chain
}

/// `assignRanks`: longest-path ranks over the acyclic remainder. `steps`
/// overrides the one-rank step of individual flows. Ranks are reset in place, as
/// the TS does, so keys of non-node targets keep their earlier values.
fn assign_ranks<'a>(graph: &mut SemanticGraph<'a>, steps: &IndexMap<&str, i64>) {
    let mut ranks: IndexMap<&'a str, i64> = std::mem::take(&mut graph.ranks);
    for node in &graph.nodes {
        ranks.insert(&node.base().id, 0);
    }

    // The edges each pass relaxes, in the order it relaxes them, with their step:
    // neither depends on the ranks, so they are worked out once. A node's rank is
    // read per edge rather than once per node; only a self-loop could tell the
    // two apart, and a self-loop is always a back edge.
    // Ranks are addressed by their position in `ranks`: keys are only ever
    // appended, so a position stays valid once known. A target outside `nodes`
    // gets its key (and position) the first time an edge raises it.
    struct Relax<'a> {
        source: usize,
        target_id: &'a str,
        target: Option<usize>,
        step: i64,
    }
    let mut relax: Vec<Relax> = Vec::new();
    for node in &graph.nodes {
        let id = node.base().id.as_str();
        if let Some(flows) = graph.outgoing.get(id) {
            let Some(source) = ranks.get_index_of(id) else {
                continue;
            };
            for flow in flows {
                if graph.back_edges.contains(flow.id.as_str()) {
                    continue;
                }
                let step = if shares_rank(graph, flow) || feeds_sibling(graph, flow) {
                    0
                } else {
                    steps.get(flow.id.as_str()).copied().unwrap_or(1)
                };
                relax.push(Relax {
                    source,
                    target_id: &flow.target_ref,
                    target: ranks.get_index_of(flow.target_ref.as_str()),
                    step,
                });
            }
        }
    }

    // Longest path: relax every edge until no rank grows. |V| passes suffice
    // because the remaining graph is acyclic.
    for _pass in 0..graph.nodes.len() + 1 {
        let mut changed = false;
        for edge in &mut relax {
            let rank = ranks[edge.source];
            if edge.target.is_none() {
                edge.target = ranks.get_index_of(edge.target_id);
            }
            let target = edge.target.map_or(0, |t| ranks[t]);
            if target < rank + edge.step {
                match edge.target {
                    Some(t) => ranks[t] = rank + edge.step,
                    None => {
                        edge.target = Some(ranks.insert_full(edge.target_id, rank + edge.step).0);
                    }
                }
                changed = true;
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
            ranks.insert(id, r);
        }
    }
    graph.ranks = ranks;
}

/// `placeExceptionRow`: re-rank so a boundary handler starts in its host's own
/// column and its flow drops straight down (or up) from the event, onto a row
/// the handlers of the spine share. Returns true when ranks changed and bands
/// must be assigned again.
pub fn place_exception_row<'a>(
    graph: &mut SemanticGraph<'a>,
    bands: &IndexMap<&'a str, i64>,
    side_of: &dyn Fn(&BpmnBoundaryEvent, &str) -> i64,
) -> bool {
    let entries = handler_entries(graph, side_of);
    if entries.is_empty() {
        return false;
    }
    let mut component_of: IndexMap<&str, usize> = IndexMap::default();
    for (i, members) in graph.components.iter().enumerate() {
        for &id in members {
            component_of.insert(id, i);
        }
    }
    let mut chains: IndexMap<&'a str, IndexSet<&'a str>> = IndexMap::default();
    let mut handler_nodes: IndexSet<&'a str> = IndexSet::default();
    for entry in &entries {
        for flow in &entry.flows {
            let chain = chain_of(graph, flow.target_ref.as_str());
            for &id in &chain {
                handler_nodes.insert(id);
            }
            chains.insert(flow.target_ref.as_str(), chain);
        }
    }
    let band = |id: &str| -> i64 { bands.get(id).copied().unwrap_or(0) };
    let mut busy = vec![false; entries.len()];
    for (k, entry) in entries.iter().enumerate() {
        let host_rank = graph.ranks.get(entry.host).copied();
        let sibling = graph.nodes.iter().any(|n| {
            let id = n.base().id.as_str();
            id != entry.host
                && !handler_nodes.contains(id)
                && graph.ranks.get(id).copied() == host_rank
                && component_of.get(id).copied() == component_of.get(entry.host).copied()
                && (band(id) - band(entry.host)) * entry.side > 0
        });
        if sibling || band(entry.host) != 0 {
            busy[k] = true;
        }
    }

    let mut steps: IndexMap<&str, i64> = IndexMap::default();
    for (k, entry) in entries.iter().enumerate() {
        for flow in &entry.flows {
            steps.insert(flow.id.as_str(), if busy[k] { 1 } else { 0 });
        }
    }
    if busy.iter().filter(|b| **b).count() == entries.len() {
        return false;
    }
    let last_rank = |graph: &SemanticGraph, chain: &IndexSet<&str>| -> i64 {
        chain
            .iter()
            .map(|id| graph.ranks.get(id).copied().unwrap_or(0))
            .max()
            .unwrap_or(i64::MIN)
    };

    // Entries that keep their old step because they would collide on the row.
    let mut demoted = vec![false; entries.len()];
    for _round in 0..=entries.len() {
        assign_ranks(graph, &steps);
        let mut order: Vec<usize> = (0..entries.len()).collect();
        order.sort_by_key(|&k| graph.ranks.get(entries[k].host).copied().unwrap_or(0));
        // Per row and side: the first rank no earlier handler occupies.
        let mut free: IndexMap<(i64, i64, i64), f64> = IndexMap::default();
        let mut last: IndexMap<(i64, i64, i64), usize> = IndexMap::default();
        let mut changed = false;
        for &k in &order {
            if busy[k] {
                continue;
            }
            let entry = &entries[k];
            let key = (
                component_of.get(entry.host).copied().unwrap_or(0) as i64,
                band(entry.host),
                entry.side,
            );
            let from = free.get(&key).copied().unwrap_or(f64::NEG_INFINITY);
            if !demoted[k] && from > graph.ranks.get(entry.host).copied().unwrap_or(0) as f64 {
                // An earlier handler on the row holds this host's column.
                let mut demote = |j: usize, demoted: &mut Vec<bool>| {
                    demoted[j] = true;
                    for flow in &entries[j].flows {
                        steps.insert(flow.id.as_str(), 1);
                    }
                };
                demote(k, &mut demoted);
                if let Some(&before) = last.get(&key) {
                    if entries[before].host != entry.host && !demoted[before] {
                        demote(before, &mut demoted);
                    }
                }
                changed = true;
                break;
            }
            last.insert(key, k);
            let mut end = f64::NEG_INFINITY;
            for flow in &entry.flows {
                let lr = chains
                    .get(flow.target_ref.as_str())
                    .map_or(i64::MIN, |c| last_rank(graph, c));
                let lr = if lr == i64::MIN {
                    f64::NEG_INFINITY
                } else {
                    lr as f64
                };
                end = end.max(lr);
            }
            free.insert(key, from.max(end + 1.0));
        }
        if !changed {
            break;
        }
    }
    if !(0..entries.len()).any(|k| !busy[k] && !demoted[k]) {
        return false;
    }
    // Demoted handlers still sit on the row, one column right of their host.
    for (k, entry) in entries.iter().enumerate() {
        if busy[k] {
            continue;
        }
        for flow in &entry.flows {
            if let Some(chain) = chains.get(flow.target_ref.as_str()) {
                for &id in chain {
                    graph.exception_row.insert(id);
                }
            }
        }
    }
    true
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
            if !graph.back_edges.contains(flow.id.as_str())
                && end_reach.contains(flow.target_ref.as_str())
            {
                return true;
            }
        }
    }
    false
}

/// `buildEndReach`: every node from which a path along non-back edges reaches an
/// end event or a node with no outgoing flow (both inclusive), by one reverse walk.
fn build_end_reach<'a>(graph: &SemanticGraph<'a>) -> IndexSet<&'a str> {
    let mut reach: IndexSet<&'a str> = IndexSet::default();
    let mut stack: Vec<&'a str> = Vec::new();
    for node in graph.by_id.values() {
        let id = node.base().id.as_str();
        let out = graph.outgoing.get(id);
        if is_end_type(node.type_name()) || out.is_none_or(|o| o.is_empty()) {
            reach.insert(id);
            stack.push(id);
        }
    }
    while let Some(id) = stack.pop() {
        if let Some(flows) = graph.incoming.get(id) {
            for &flow in flows {
                if graph.back_edges.contains(flow.id.as_str()) {
                    continue;
                }
                let from = effective_source(flow, &graph.by_id);
                if reach.insert(from) {
                    stack.push(from);
                }
            }
        }
    }
    reach
}
