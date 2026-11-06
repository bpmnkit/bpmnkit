//! Twin of `layout/semantic/bands.ts`.

use super::graph::{reaches_end, SemanticGraph};
use crate::hash::{IndexMap, IndexSet};
use bpmnkit_bpmn::model::{
    BpmnBoundaryEvent, BpmnEventDefinition, BpmnFlowElement, BpmnSequenceFlow,
};

/// `BandLayout`: vertical narrative roles for one process scope.
///
/// Band 0 is the spine, the primary path from the start event to an end event.
/// Positive bands sit below it, negative bands above.
#[derive(Debug, Clone, Default)]
pub struct BandLayout<'a> {
    /// node id -> band. 0 is the spine, > 0 below it, < 0 above it.
    pub bands: IndexMap<&'a str, i64>,
    /// Ids of the nodes on the primary path.
    pub spine: IndexSet<&'a str>,
    /// Flow ids that continue the spine and should be routed as one segment.
    pub straight_flows: IndexSet<&'a str>,
}

/// A contiguous run of nodes that leaves the spine and rejoins (or ends).
#[derive(Debug, Clone)]
struct Branch<'a> {
    nodes: Vec<&'a str>,
    side: i64,
    /// How far this branch already is from the spine, in branch hops.
    depth: i64,
    min_rank: i64,
    max_rank: i64,
}

#[derive(Debug, Clone, Copy)]
/// TS also records the branch side here but never reads it.
struct Source<'a> {
    id: &'a str,
    depth: i64,
}

/// `isDefaultFlow(source, flow)`. Only gateways carry `default` in the model.
fn is_default_flow(source: Option<&BpmnFlowElement>, flow: &BpmnSequenceFlow) -> bool {
    let default = match source {
        Some(
            BpmnFlowElement::ExclusiveGateway(g)
            | BpmnFlowElement::InclusiveGateway(g)
            | BpmnFlowElement::ComplexGateway(g),
        ) => g.default.as_deref(),
        _ => None,
    };
    default == Some(flow.id.as_str())
}

/// `boundarySide(event, hostTitled)`: `1` or `-1`.
///
/// Escalation handlers read as "upward" exceptions; everything else reads downward.
/// A titled host sends every handler down: its title is centred on the top border,
/// so nothing docks there. Placement docks the event on the same side.
pub fn boundary_side(event: &BpmnBoundaryEvent, host_titled: bool) -> i64 {
    if host_titled {
        return 1;
    }
    if event
        .event_definitions
        .iter()
        .any(|d| matches!(d, BpmnEventDefinition::Escalation(_)))
    {
        -1
    } else {
        1
    }
}

/// `assignBands(graph, titled)`. `titled` are hosts whose title is drawn along
/// their top border; see [`boundary_side`].
pub fn assign_bands<'a>(graph: &SemanticGraph<'a>, titled: &IndexSet<&str>) -> BandLayout<'a> {
    let mut bands: IndexMap<&'a str, i64> =
        IndexMap::with_capacity_and_hasher(graph.nodes.len(), Default::default());
    let mut spine: IndexSet<&'a str> = IndexSet::default();
    let mut straight_flows: IndexSet<&'a str> = IndexSet::default();
    let mut branches: Vec<Branch<'a>> = Vec::new();

    for &start in &graph.starts {
        if start.is_empty() {
            continue;
        }
        trace_spine(graph, start, &mut spine, &mut straight_flows);
    }
    for &id in &spine {
        bands.insert(id, 0);
    }

    // Branch off the spine first, then off already-placed branches, so a nested
    // alternative always fans farther from the spine than its parent.
    let mut sources: Vec<Source<'a>> = Vec::new();
    for node in &graph.nodes {
        let id = node.base().id.as_str();
        if spine.contains(id) {
            sources.push(Source { id, depth: 0 });
        }
    }

    let mut assigned: IndexSet<&'a str> = spine.clone();
    let mut i = 0;
    while i < sources.len() {
        let source = sources[i];
        for branch in branches_from(graph, &source, &assigned, titled) {
            for &id in &branch.nodes {
                assigned.insert(id);
                sources.push(Source {
                    id,
                    depth: branch.depth,
                });
            }
            branches.push(branch);
        }
        i += 1;
    }

    for (id, band) in compact(&branches) {
        bands.insert(id, band);
    }
    place_unassigned(graph, &mut bands, &assigned);
    reduce_crossings(graph, &mut bands);
    BandLayout {
        bands,
        spine,
        straight_flows,
    }
}

/// The forward edges [`inversions`] weighs, with their ranks: neither changes
/// while bands are traded.
struct RankedEdge<'a> {
    x1: i64,
    host: &'a str,
    x2: i64,
    target: &'a str,
}

fn ranked_edges<'a>(graph: &SemanticGraph<'a>) -> Vec<RankedEdge<'a>> {
    let mut edges = Vec::new();
    for (&host, flows) in &graph.outgoing {
        for flow in flows {
            if graph.back_edges.contains(flow.id.as_str()) {
                continue;
            }
            // A boundary event has no rank of its own; it travels with its host.
            edges.push(RankedEdge {
                x1: graph.ranks.get(host).copied().unwrap_or(0),
                host,
                x2: graph
                    .ranks
                    .get(flow.target_ref.as_str())
                    .copied()
                    .unwrap_or(0),
                target: &flow.target_ref,
            });
        }
    }
    edges
}

/// `inversions`: two edges cross when their rank spans overlap and their
/// endpoints swap order vertically on the way across. Counting those inversions
/// estimates the crossings a band assignment will produce, without routing anything.
fn inversions(ranked: &[RankedEdge], bands: &IndexMap<&str, i64>) -> i64 {
    struct E {
        x1: i64,
        y1: i64,
        x2: i64,
        y2: i64,
    }
    let edges: Vec<E> = ranked
        .iter()
        .map(|e| E {
            x1: e.x1,
            y1: bands.get(e.host).copied().unwrap_or(0),
            x2: e.x2,
            y2: bands.get(e.target).copied().unwrap_or(0),
        })
        .collect();

    let mut count = 0;
    for i in 0..edges.len() {
        let a = &edges[i];
        for b in &edges[i + 1..] {
            // Only edges travelling over the same ranks can cross.
            if a.x1.min(a.x2) >= b.x1.max(b.x2) {
                continue;
            }
            if b.x1.min(b.x2) >= a.x1.max(a.x2) {
                continue;
            }
            let left = (a.y1 - b.y1).signum();
            let right = (a.y2 - b.y2).signum();
            if left != 0 && right != 0 && left != right {
                count += 1;
            }
        }
    }
    count
}

/// `reduceCrossings`: swap neighbouring bands where doing so untangles the edges
/// between them.
///
/// Compaction picks a band from where a branch starts and how far from the spine
/// it belongs, which says nothing about the edges running past it: two branches
/// that leave in one order and rejoin in the other end up crossing. Trading two
/// neighbouring bands keeps each on its own side of the spine, so the narrative
/// survives while the crossings drop.
fn reduce_crossings<'a>(graph: &SemanticGraph<'a>, bands: &mut IndexMap<&'a str, i64>) {
    let distinct: IndexSet<i64> = bands.values().copied().collect();
    let mut levels: Vec<i64> = distinct.into_iter().filter(|b| *b != 0).collect();
    levels.sort();
    if levels.len() < 2 {
        return;
    }

    let ranked = ranked_edges(graph);
    let mut best = inversions(&ranked, bands);
    for _sweep in 0..levels.len() {
        let mut improved = false;
        let mut i = 0;
        while i + 1 < levels.len() {
            let lower = levels[i];
            let upper = levels[i + 1];
            i += 1;
            // Only bands on the same side of the spine may trade places.
            if lower.signum() != upper.signum() {
                continue;
            }

            let mut moved: IndexMap<&'a str, i64> = IndexMap::default();
            for (&id, band) in bands.iter() {
                if *band == lower {
                    moved.insert(id, upper);
                } else if *band == upper {
                    moved.insert(id, lower);
                }
            }
            if moved.is_empty() {
                continue;
            }

            let mut previous: IndexMap<&'a str, i64> = IndexMap::default();
            for (&id, band) in &moved {
                previous.insert(id, bands.get(id).copied().unwrap_or(0));
                bands.insert(id, *band);
            }

            let candidate = inversions(&ranked, bands);
            if candidate < best {
                best = candidate;
                improved = true;
            } else {
                for (id, band) in previous {
                    bands.insert(id, band);
                }
            }
        }
        if !improved {
            break;
        }
    }
}

/// `placeUnassigned`: give the nodes no traversal reached (a scope entered only
/// through a loop, say) a band of their own rather than dropping them on the
/// spine, where they would land on top of whatever already occupies their rank.
fn place_unassigned<'a>(
    graph: &SemanticGraph<'a>,
    bands: &mut IndexMap<&'a str, i64>,
    assigned: &IndexSet<&'a str>,
) {
    // TS keys cells by the string `${rank}:${band}`; the pair is the same key.
    let mut taken: IndexSet<(i64, i64)> = IndexSet::default();
    for node in &graph.nodes {
        let id = node.base().id.as_str();
        if !assigned.contains(id) {
            continue;
        }
        taken.insert((
            graph.ranks.get(id).copied().unwrap_or(0),
            bands.get(id).copied().unwrap_or(0),
        ));
    }

    for node in &graph.nodes {
        let id = node.base().id.as_str();
        if assigned.contains(id) {
            continue;
        }
        let rank = graph.ranks.get(id).copied().unwrap_or(0);

        // Start from whatever this node is connected to, so it lands near it.
        let mut preferred = 0;
        let neighbours = graph
            .outgoing
            .get(id)
            .into_iter()
            .flatten()
            .map(|f| f.target_ref.as_str())
            .chain(
                graph
                    .incoming
                    .get(id)
                    .into_iter()
                    .flatten()
                    .map(|f| f.source_ref.as_str()),
            );
        for neighbour in neighbours {
            if !assigned.contains(neighbour) {
                continue;
            }
            preferred = bands.get(neighbour).copied().unwrap_or(0);
            break;
        }

        let mut band = preferred;
        for step in 0..=(graph.nodes.len() as i64) {
            band = preferred
                + if step % 2 == 0 {
                    step / 2
                } else {
                    -(step + 1) / 2
                };
            if !taken.contains(&(rank, band)) {
                break;
            }
        }
        bands.insert(id, band);
        taken.insert((rank, band));
    }
}

/// `traceSpine`: the spine is picked one edge at a time: prefer a target that can
/// still reach an end event, then the gateway's default flow, then declaration
/// order. That stops a dead-end alternative from becoming the main narrative just
/// because it was declared first.
fn trace_spine<'a>(
    graph: &SemanticGraph<'a>,
    start: &'a str,
    spine: &mut IndexSet<&'a str>,
    straight_flows: &mut IndexSet<&'a str>,
) {
    let mut current: &'a str = start;
    while spine.insert(current) {
        let candidates: Vec<&'a BpmnSequenceFlow> = graph
            .outgoing
            .get(current)
            .into_iter()
            .flatten()
            .copied()
            .filter(|f| {
                !graph.back_edges.contains(f.id.as_str()) && !spine.contains(f.target_ref.as_str())
            })
            .collect();
        if candidates.is_empty() {
            return;
        }

        let source = graph.by_id.get(current).copied();
        struct Scored<'f> {
            flow: &'f BpmnSequenceFlow,
            index: usize,
            handler: i64,
            ends: i64,
            is_default: i64,
        }
        let mut scored: Vec<Scored> = candidates
            .iter()
            .enumerate()
            .map(|(index, flow)| Scored {
                flow,
                index,
                // A handler path leaving a boundary event is an exception, never the
                // narrative: it only continues the spine if nothing else can.
                handler: if flow.source_ref == current { 0 } else { 1 },
                ends: if reaches_end(graph, &flow.target_ref) {
                    0
                } else {
                    1
                },
                is_default: if is_default_flow(source, flow) { 0 } else { 1 },
            })
            .collect();
        scored.sort_by(|a, b| {
            a.handler
                .cmp(&b.handler)
                .then_with(|| a.ends.cmp(&b.ends))
                .then_with(|| a.is_default.cmp(&b.is_default))
                .then_with(|| a.index.cmp(&b.index))
        });

        let Some(next) = scored.first() else {
            return;
        };
        straight_flows.insert(&next.flow.id);
        current = &next.flow.target_ref;
    }
}

/// `branchesFrom`: collect the alternatives leaving one node, its non-spine
/// sequence flows plus the handler paths of any boundary event attached to it.
fn branches_from<'a>(
    graph: &SemanticGraph<'a>,
    source: &Source<'a>,
    assigned: &IndexSet<&'a str>,
    titled: &IndexSet<&str>,
) -> Vec<Branch<'a>> {
    let mut out: Vec<Branch<'a>> = Vec::new();
    let node = graph.by_id.get(source.id).copied();

    let alternatives: Vec<&'a BpmnSequenceFlow> = graph
        .outgoing
        .get(source.id)
        .into_iter()
        .flatten()
        .copied()
        .filter(|f| {
            !graph.back_edges.contains(f.id.as_str()) && !assigned.contains(f.target_ref.as_str())
        })
        .collect();

    // A gateway with a default flow keeps its alternatives on one side; without
    // one they alternate below / above / farther below / farther above.
    let has_default = alternatives.iter().any(|f| is_default_flow(node, f));
    let mut below = 0;
    let mut above = 0;
    for (i, flow) in alternatives.iter().enumerate() {
        let handler = handler_side_of(graph, source.id, flow, titled);
        let side = if let Some(h) = handler {
            h
        } else if has_default || i % 2 == 0 {
            1
        } else {
            -1
        };
        let step = if side == 1 {
            below += 1;
            below
        } else {
            above += 1;
            above
        };
        if let Some(branch) = follow(graph, &flow.target_ref, side, source.depth + step, assigned) {
            out.push(branch);
        }
    }
    out
}

/// `handlerSideOf`: the side a flow inherits when it leaves a boundary event of this host.
fn handler_side_of(
    graph: &SemanticGraph,
    host_id: &str,
    flow: &BpmnSequenceFlow,
    titled: &IndexSet<&str>,
) -> Option<i64> {
    if flow.source_ref == host_id {
        return None;
    }
    let event = graph
        .attachers
        .get(host_id)
        .into_iter()
        .flatten()
        .find(|e| e.base.id == flow.source_ref)?;
    Some(boundary_side(event, titled.contains(host_id)))
}

/// `follow`: follow a branch forward until it rejoins placed flow or runs out.
///
/// A branch reserves its complete span, out to the rank it rejoins at, not just
/// the ranks its own nodes occupy, because the edge back to the join still has
/// to travel along that band. Reserving only the nodes lets a second branch share
/// the band and be crossed by the first one's last edge.
fn follow<'a>(
    graph: &SemanticGraph<'a>,
    entry: &'a str,
    side: i64,
    depth: i64,
    assigned: &IndexSet<&'a str>,
) -> Option<Branch<'a>> {
    let mut nodes: Vec<&'a str> = Vec::new();
    let mut local: IndexSet<&'a str> = IndexSet::default();
    let mut current: Option<&'a str> = Some(entry);
    let mut min_rank = i64::MAX;
    let mut max_rank = i64::MIN;

    while let Some(cur) = current.take() {
        if assigned.contains(cur) || local.contains(cur) {
            break;
        }
        nodes.push(cur);
        local.insert(cur);
        let rank = graph.ranks.get(cur).copied().unwrap_or(0);
        min_rank = min_rank.min(rank);
        max_rank = max_rank.max(rank);
        let next = graph.outgoing.get(cur).into_iter().flatten().find(|f| {
            !graph.back_edges.contains(f.id.as_str())
                && !assigned.contains(f.target_ref.as_str())
                && !local.contains(f.target_ref.as_str())
        });
        current = next.map(|f| f.target_ref.as_str());
    }

    let last = *nodes.last()?;

    // The walk stops before the node the branch rejoins at, because that node is
    // already placed. Reserve out to it anyway: the edge back into it still
    // travels along this band.
    for flow in graph.outgoing.get(last).into_iter().flatten() {
        if graph.back_edges.contains(flow.id.as_str()) {
            continue;
        }
        max_rank = max_rank.max(
            graph
                .ranks
                .get(flow.target_ref.as_str())
                .copied()
                .unwrap_or(max_rank),
        );
    }

    Some(Branch {
        nodes,
        side,
        depth,
        min_rank,
        max_rank,
    })
}

/// `compact`: pack branches into physical bands. A band reservation covers the
/// ranks the branch spans, so two branches that never overlap horizontally can
/// share one band; overlapping narratives cannot.
fn compact<'a>(branches: &[Branch<'a>]) -> IndexMap<&'a str, i64> {
    let mut bands: IndexMap<&'a str, i64> = IndexMap::default();

    for side in [1i64, -1] {
        let mut mine: Vec<&Branch> = branches.iter().filter(|b| b.side == side).collect();
        mine.sort_by(|a, b| {
            a.min_rank
                .cmp(&b.min_rank)
                .then_with(|| a.depth.cmp(&b.depth))
        });
        // physical level (1-based) -> rank intervals already reserved on it.
        let mut reserved: Vec<Vec<(i64, i64)>> = Vec::new();

        for branch in mine {
            let mut level = 0;
            loop {
                if level >= reserved.len() {
                    reserved.push(vec![(branch.min_rank, branch.max_rank)]);
                    break;
                }
                let slots = &mut reserved[level];
                let overlaps = slots
                    .iter()
                    .any(|(from, to)| branch.min_rank <= *to && *from <= branch.max_rank);
                if !overlaps {
                    slots.push((branch.min_rank, branch.max_rank));
                    break;
                }
                level += 1;
            }
            for &id in &branch.nodes {
                bands.insert(id, side * (level as i64 + 1));
            }
        }
    }

    bands
}
