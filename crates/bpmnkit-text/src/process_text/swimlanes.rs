//! Port of `bpmn/process-text.ts`'s `readLanes`, `clashOwner`, `keepBoundariesWithHosts`,
//! `fillLanes`, `readPools`, `messageEnds` and `readMessages`: the `lane`, `pool` and `msg`
//! lines as compact lanes, participants and message flows.
//!
//! TS shares lane objects between maps and mutates them; here lanes are a `Vec` and the
//! maps hold indices into it.

use bpmnkit_bpmn::slug::unique_id;
use bpmnkit_bpmn::swimlanes::message_end_problem;
use indexmap::{IndexMap, IndexSet};

use super::assemble::problem;
use super::reader::{Reader, WrittenRef};
use super::tokens::{name_from_id, Edge, Node};
use super::ProcessTextProblem;
use crate::compact::{CompactElement, CompactLane, CompactMessageFlow, CompactParticipant};

/// A lane being read: every one has a member list, possibly empty.
struct Lane {
    id: String,
    name: Option<String>,
    members: Vec<String>,
}

/// `clashOwner`: what an id already in use names, for a problem.
fn clash_owner<'a>(
    id: &str,
    nodes: &IndexMap<String, Node>,
    mut lane_ids: impl Iterator<Item = &'a str>,
) -> &'static str {
    if nodes.contains_key(id) {
        "a node's"
    } else if lane_ids.any(|lane| lane == id) {
        "a lane's"
    } else {
        "already used"
    }
}

/// `readLanes`: the `lane` lines as compact lanes, in the order first written. A lane
/// written twice gathers both lines' members; a node listed in two lanes stays in the later
/// one. Members that are not top-level nodes are left out: while streaming silently, since
/// they may yet be declared.
pub(crate) fn read_lanes(
    reader: &Reader,
    nodes: &IndexMap<String, Node>,
    child_nodes: &[Node],
    taken: &mut IndexSet<String>,
    final_: bool,
    problems: &mut Vec<ProcessTextProblem>,
) -> Vec<CompactLane> {
    let mut lanes: Vec<Lane> = Vec::new();
    let mut by_written: IndexMap<&str, usize> = IndexMap::new();
    let mut lane_of_node: IndexMap<String, usize> = IndexMap::new();
    let mut listed_on: IndexMap<String, u32> = IndexMap::new();
    for line in &reader.lanes {
        let lane = match by_written.get(line.written.as_str()) {
            Some(&index) => {
                if let Some(name) = &line.name {
                    lanes[index].name = Some(name.clone());
                }
                index
            }
            None => {
                let mut id = line.written.clone();
                if taken.contains(&id) {
                    id = unique_id(&format!("{}_lane", line.written), taken);
                    let owner = clash_owner(
                        &line.written,
                        nodes,
                        lanes.iter().map(|lane| lane.id.as_str()),
                    );
                    problems.push(problem(
                        line.line,
                        format!(
                            "lane {}: the id is {owner}; wrote the lane as \"{id}\"",
                            line.written
                        ),
                    ));
                } else {
                    taken.insert(id.clone());
                }
                let name = if line.unnamed {
                    None
                } else {
                    Some(
                        line.name
                            .clone()
                            .unwrap_or_else(|| name_from_id(&line.written)),
                    )
                };
                lanes.push(Lane {
                    id,
                    name,
                    members: Vec::new(),
                });
                by_written.insert(&line.written, lanes.len() - 1);
                lanes.len() - 1
            }
        };
        for r in &line.members {
            let id = reader.resolve(r);
            if !nodes.contains_key(&id) {
                let container = child_nodes
                    .iter()
                    .find(|child| child.element.id == id)
                    .and_then(|child| child.inside.as_deref());
                if let Some(container) = container {
                    problems.push(problem(
                        line.line,
                        format!(
                            "lane {}: \"{}\" is inside \"{container}\", and a lane holds only top-level nodes; left out",
                            line.written, r.written
                        ),
                    ));
                } else if final_ {
                    problems.push(problem(
                        line.line,
                        format!(
                            "lane {}: \"{}\" is not a node of the diagram; left out",
                            line.written, r.written
                        ),
                    ));
                }
                continue;
            }
            let before = lane_of_node.get(&id).copied();
            if before == Some(lane) {
                continue;
            }
            if let Some(before) = before {
                lanes[before].members.retain(|member| *member != id);
                problems.push(problem(
                    line.line,
                    format!(
                        "lane {}: \"{}\" is already in lane {}; moved it to {}",
                        line.written, r.written, lanes[before].id, lanes[lane].id
                    ),
                ));
            }
            lanes[lane].members.push(id.clone());
            lane_of_node.insert(id.clone(), lane);
            listed_on.insert(id, line.line);
        }
    }
    keep_boundaries_with_hosts(&mut lanes, &mut lane_of_node, nodes, &listed_on, problems);
    lanes
        .into_iter()
        .map(|lane| CompactLane {
            id: lane.id,
            name: lane.name,
            members: Some(lane.members),
            lanes: None,
        })
        .collect()
}

/// `keepBoundariesWithHosts`: moves a boundary event a lane line put apart from its host
/// into the host's lane. Layout draws it on the host's border, so any other lane would claim
/// a node it does not contain.
fn keep_boundaries_with_hosts(
    lanes: &mut [Lane],
    lane_of_node: &mut IndexMap<String, usize>,
    nodes: &IndexMap<String, Node>,
    listed_on: &IndexMap<String, u32>,
    problems: &mut Vec<ProcessTextProblem>,
) {
    for lane in 0..lanes.len() {
        for id in lanes[lane].members.clone() {
            let Some(host) = nodes
                .get(&id)
                .and_then(|node| node.element.attached_to.as_deref())
            else {
                continue;
            };
            let Some(&host_lane) = lane_of_node.get(host).filter(|&&h| h != lane) else {
                continue;
            };
            lanes[lane].members.retain(|member| *member != id);
            lanes[host_lane].members.push(id.clone());
            lane_of_node.insert(id.clone(), host_lane);
            problems.push(problem(
                listed_on.get(&id).copied().unwrap_or(0),
                format!(
                    "lane {}: \"{id}\" is a boundary event on \"{host}\"; put it in {host}'s lane {}",
                    lanes[lane].id, lanes[host_lane].id
                ),
            ));
        }
    }
}

/// `fillLanes`: puts every node no lane names in a neighbour's lane: a boundary event in
/// its host's, anything else in its first predecessor's, else its first successor's, else
/// the first lane. Join gateways and end events the parser added are such nodes, so they
/// land beside what they connect.
pub(crate) fn fill_lanes(
    lanes: &mut [CompactLane],
    nodes: &IndexMap<String, Node>,
    edges: &[Edge],
    fixes: &mut Vec<String>,
) {
    let mut lane_of: IndexMap<String, usize> = IndexMap::new();
    for (index, lane) in lanes.iter().enumerate() {
        for id in lane.members.iter().flatten() {
            lane_of.insert(id.clone(), index);
        }
    }
    let mut put = |id: &str,
                   lane: usize,
                   lanes: &mut [CompactLane],
                   lane_of: &mut IndexMap<String, usize>| {
        lanes[lane]
            .members
            .get_or_insert_with(Vec::new)
            .push(id.to_owned());
        lane_of.insert(id.to_owned(), lane);
        fixes.push(format!(
            "put \"{id}\", which no lane named, in lane {}",
            lanes[lane].id
        ));
    };
    let unassigned = |lane_of: &IndexMap<String, usize>| -> Vec<String> {
        nodes
            .keys()
            .filter(|id| !lane_of.contains_key(*id))
            .cloned()
            .collect()
    };
    // The lane of the first edge end on `side` whose other end is `id`.
    let by_neighbour = |id: &str, from_side: bool, lane_of: &IndexMap<String, usize>| {
        edges.iter().find_map(|edge| {
            let (this, other) = if from_side {
                (&edge.to, &edge.from)
            } else {
                (&edge.from, &edge.to)
            };
            (this == id).then(|| lane_of.get(other).copied()).flatten()
        })
    };
    // Each pass places at least one node or stops, so this ends within nodes.len() passes.
    for _ in 0..=nodes.len() {
        let mut placed = false;
        for id in unassigned(&lane_of) {
            let host = nodes
                .get(&id)
                .and_then(|node| node.element.attached_to.as_deref());
            let lane = match host {
                Some(host) => lane_of.get(host).copied(),
                None => by_neighbour(&id, true, &lane_of),
            };
            if let Some(lane) = lane {
                put(&id, lane, lanes, &mut lane_of);
                placed = true;
            }
        }
        if placed {
            continue;
        }
        for id in unassigned(&lane_of) {
            if let Some(lane) = by_neighbour(&id, false, &lane_of) {
                put(&id, lane, lanes, &mut lane_of);
                placed = true;
                break;
            }
        }
        if !placed {
            break;
        }
    }
    if !lanes.is_empty() {
        for id in unassigned(&lane_of) {
            put(&id, 0, lanes, &mut lane_of);
        }
    }
}

/// `readPools`: the `pool` lines as black-box participants, keyed by the id they were
/// written with.
pub(crate) fn read_pools(
    reader: &Reader,
    nodes: &IndexMap<String, Node>,
    lanes: &[CompactLane],
    taken: &mut IndexSet<String>,
    problems: &mut Vec<ProcessTextProblem>,
) -> IndexMap<String, CompactParticipant> {
    let mut pools: IndexMap<String, CompactParticipant> = IndexMap::new();
    for line in &reader.pools {
        if let Some(known) = pools.get_mut(&line.written) {
            if let Some(name) = &line.name {
                known.name = Some(name.clone());
            }
            continue;
        }
        let mut id = line.written.clone();
        if taken.contains(&id) {
            id = unique_id(&format!("{}_pool", line.written), taken);
            let owner = clash_owner(
                &line.written,
                nodes,
                lanes.iter().map(|lane| lane.id.as_str()),
            );
            problems.push(problem(
                line.line,
                format!(
                    "pool {}: the id is {owner}; wrote the pool as \"{id}\"",
                    line.written
                ),
            ));
        } else {
            taken.insert(id.clone());
        }
        pools.insert(
            line.written.clone(),
            CompactParticipant {
                id,
                name: line.name.clone(),
                process_id: None,
            },
        );
    }
    pools
}

/// One end of a `msg` line, resolved.
#[derive(Clone, Copy)]
enum MessageEnd<'a> {
    Pool(&'a str),
    Node(&'a str, &'a CompactElement),
}

/// `messageEnds`: resolves the two ends of a `msg` line. An id that names both a node and a
/// pool (the pool was renamed `<id>_pool`) means whichever makes one end a node and the
/// other a pool; when both ends are such ids, a node sends to a pool.
fn message_ends<'a>(
    reader: &Reader,
    nodes: &'a IndexMap<String, Node>,
    pools: &'a IndexMap<String, CompactParticipant>,
    from: &WrittenRef,
    to: &WrittenRef,
) -> (Option<MessageEnd<'a>>, Option<MessageEnd<'a>>) {
    let candidates = |r: &WrittenRef| {
        let pool = pools.get(&r.written).map(|pool| MessageEnd::Pool(&pool.id));
        let node = nodes
            .get_key_value(&reader.resolve(r))
            .map(|(id, node)| MessageEnd::Node(id, &node.element));
        (pool, node)
    };
    let (a_pool, a_node) = candidates(from);
    let (b_pool, b_node) = candidates(to);
    match (a_pool, a_node, b_pool, b_node) {
        (Some(_), Some(_), Some(_), Some(_)) => (a_node, b_pool),
        (Some(_), Some(_), _, _) => (
            if b_pool.is_some() && b_node.is_none() {
                a_node
            } else {
                a_pool
            },
            b_pool.or(b_node),
        ),
        (_, _, Some(_), Some(_)) => (
            a_pool.or(a_node),
            if a_pool.is_some() && a_node.is_none() {
                b_node
            } else {
                b_pool
            },
        ),
        _ => (a_pool.or(a_node), b_pool.or(b_node)),
    }
}

/// `readMessages`: the `msg` lines as message flows. One end is a node of the process and
/// the other a pool: the process's own pool has no line, so a message inside it would be a
/// sequence flow drawn the wrong way.
pub(crate) fn read_messages(
    reader: &Reader,
    nodes: &IndexMap<String, Node>,
    pools: &IndexMap<String, CompactParticipant>,
    taken: &mut IndexSet<String>,
    final_: bool,
    problems: &mut Vec<ProcessTextProblem>,
) -> Vec<CompactMessageFlow> {
    let mut flows: Vec<CompactMessageFlow> = Vec::new();
    let mut seen: IndexSet<String> = IndexSet::new();
    let mut number = 0u32;
    for line in &reader.messages {
        let what = format!("msg {} > {}", line.from.written, line.to.written);
        let mut refuse = |reason: &str| {
            problems.push(problem(line.line, format!("{what}: {reason}; left out")));
        };
        let (from, to) = message_ends(reader, nodes, pools, &line.from, &line.to);
        let (Some(from), Some(to)) = (from, to) else {
            let missing = if from.is_none() {
                &line.from.written
            } else {
                &line.to.written
            };
            if final_ {
                refuse(&format!("\"{missing}\" is not a node or a pool"));
            }
            continue;
        };
        let (source, target) = match (from, to) {
            (MessageEnd::Pool(_), MessageEnd::Pool(_)) => {
                refuse("both ends are pools; one end must be a node of the process");
                continue;
            }
            (MessageEnd::Node(..), MessageEnd::Node(..)) => {
                refuse(
                    "both ends are in this process; a message goes to or comes from a pool line",
                );
                continue;
            }
            (MessageEnd::Node(source, element), MessageEnd::Pool(target)) => {
                let trigger = element.event_type.as_deref();
                if let Some(reason) = message_end_problem(&element.type_, trigger, true) {
                    refuse(&reason);
                    continue;
                }
                (source, target)
            }
            (MessageEnd::Pool(source), MessageEnd::Node(target, element)) => {
                let trigger = element.event_type.as_deref();
                if let Some(reason) = message_end_problem(&element.type_, trigger, false) {
                    refuse(&reason);
                    continue;
                }
                (source, target)
            }
        };
        if !seen.insert(format!("{source}>{target}")) {
            continue;
        }
        let id = loop {
            number += 1;
            let id = format!("MessageFlow_{number}");
            if !taken.contains(&id) {
                break id;
            }
        };
        taken.insert(id.clone());
        flows.push(CompactMessageFlow {
            id,
            source: source.to_owned(),
            target: target.to_owned(),
            name: line.name.clone(),
        });
    }
    flows
}
