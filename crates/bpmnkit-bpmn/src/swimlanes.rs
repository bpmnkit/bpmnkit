//! Twin of `bpmn/swimlanes.ts`: the lane and pool helpers the writers share, so they agree
//! on one set of invariants. Only the helpers the Rust writers use are ported; none of them
//! mutates its input.
//!
//! TS guards every lane-tree walk against a lane object reached twice (`revisitMessage`);
//! owned Rust lane sets cannot alias, so those guards have no counterpart here.

use crate::model::{
    BpmnCollaboration, BpmnDefinitions, BpmnFlowElement, BpmnLane, BpmnLaneSet, BpmnParticipant,
    BpmnProcess, BpmnProcessContents,
};
use crate::Attrs;
use indexmap::{IndexMap, IndexSet};
use std::collections::HashSet;

/// Element types that are not flow nodes: they sit in no lane.
pub const DATA_ELEMENT_TYPES: [&str; 3] =
    ["dataObject", "dataObjectReference", "dataStoreReference"];

/// The namespace of the `primaryProcess` attribute the serializer puts on `<definitions>`.
pub const BPMNKIT_NAMESPACE: &str = "https://bpmnkit.com/schema/bpmn";

/// TS's `LaneSpec`: a lane to build, a leaf when `lanes` is empty.
#[derive(Debug, Clone, Default, PartialEq)]
pub struct LaneSpec {
    pub id: String,
    pub name: Option<String>,
    pub lanes: Vec<LaneSpec>,
}

struct LaneEntry<'a> {
    lane: &'a BpmnLane,
    /// Outermost first.
    ancestors: Vec<&'a BpmnLane>,
    /// Indices from the top-level lane set down to this lane.
    path: Vec<usize>,
}

/// `laneEntries`: every lane of `lane_set`, depth first with each lane's ancestors.
fn lane_entries(lane_set: Option<&BpmnLaneSet>) -> Vec<LaneEntry<'_>> {
    fn visit<'a>(
        set: Option<&'a BpmnLaneSet>,
        ancestors: &[&'a BpmnLane],
        path: &[usize],
        out: &mut Vec<LaneEntry<'a>>,
    ) {
        for (index, lane) in set.into_iter().flat_map(|s| s.lanes.iter()).enumerate() {
            let mut own_path = path.to_vec();
            own_path.push(index);
            out.push(LaneEntry {
                lane,
                ancestors: ancestors.to_vec(),
                path: own_path.clone(),
            });
            let mut inner = ancestors.to_vec();
            inner.push(lane);
            visit(lane.child_lane_set.as_ref(), &inner, &own_path, out);
        }
    }
    let mut entries = Vec::new();
    visit(lane_set, &[], &[], &mut entries);
    entries
}

fn is_leaf(lane: &BpmnLane) -> bool {
    lane.child_lane_set
        .as_ref()
        .is_none_or(|set| set.lanes.is_empty())
}

fn attached_to(element: &BpmnFlowElement) -> Option<&str> {
    match element {
        BpmnFlowElement::BoundaryEvent(event) => Some(&event.attached_to_ref),
        _ => None,
    }
}

/// `boundaryEventIds`: ids of the top-level boundary events attached to `host_id`.
fn boundary_event_ids<'a>(process: &'a BpmnProcess, host_id: &str) -> Vec<&'a str> {
    process
        .contents
        .flow_elements
        .iter()
        .filter(|element| attached_to(element) == Some(host_id))
        .map(|element| element.base().id.as_str())
        .collect()
}

/// `nestedElementIds`: ids of every element nested inside a container, at any depth.
fn nested_element_ids(elements: &[BpmnFlowElement]) -> IndexSet<&str> {
    fn visit<'a>(children: &'a [BpmnFlowElement], ids: &mut IndexSet<&'a str>) {
        for child in children {
            ids.insert(&child.base().id);
            if let Some(contents) = child.contents() {
                visit(&contents.flow_elements, ids);
            }
        }
    }
    let mut ids = IndexSet::new();
    for element in elements {
        if let Some(contents) = element.contents() {
            visit(&contents.flow_elements, &mut ids);
        }
    }
    ids
}

fn has_content(process: &BpmnProcess) -> bool {
    !process.contents.flow_elements.is_empty() || process.lane_set.is_some()
}

/// `allLanes`: every lane of `lane_set`, nested ones included, a parent before its children.
pub fn all_lanes(lane_set: Option<&BpmnLaneSet>) -> Vec<&BpmnLane> {
    lane_entries(lane_set)
        .into_iter()
        .map(|entry| entry.lane)
        .collect()
}

/// `leafLanes`: the lanes without child lanes, depth first: the lanes a flow node is
/// assigned to.
pub fn leaf_lanes(lane_set: Option<&BpmnLaneSet>) -> Vec<&BpmnLane> {
    all_lanes(lane_set)
        .into_iter()
        .filter(|lane| is_leaf(lane))
        .collect()
}

/// `laneOf`: the deepest lane of `process` whose refs list `node_id`, so a union-convention
/// ancestor never wins over the leaf.
pub fn lane_of<'a>(process: &'a BpmnProcess, node_id: &str) -> Option<&'a BpmnLane> {
    let mut deepest: Option<LaneEntry> = None;
    for entry in lane_entries(process.lane_set.as_ref()) {
        if !entry.lane.flow_node_refs.iter().any(|r| r == node_id) {
            continue;
        }
        if deepest
            .as_ref()
            .is_none_or(|d| entry.ancestors.len() > d.ancestors.len())
        {
            deepest = Some(entry);
        }
    }
    deepest.map(|entry| entry.lane)
}

/// `followsUnion`: true when one of `ancestors` already repeats a ref of its descendants,
/// i.e. the file follows the union convention and expects it kept.
fn follows_union(ancestors: &[&BpmnLane]) -> bool {
    ancestors.iter().any(|ancestor| {
        let own: HashSet<&str> = ancestor.flow_node_refs.iter().map(String::as_str).collect();
        all_lanes(ancestor.child_lane_set.as_ref())
            .iter()
            .any(|lane| lane.flow_node_refs.iter().any(|r| own.contains(r.as_str())))
    })
}

/// `mapLaneRefs`: each lane's refs replaced by `refs_for(lane, path)`, in place.
fn map_lane_refs(
    lane_set: &mut BpmnLaneSet,
    path: &mut Vec<usize>,
    refs_for: &mut impl FnMut(&BpmnLane, &[usize]) -> Vec<String>,
) {
    for (index, lane) in lane_set.lanes.iter_mut().enumerate() {
        path.push(index);
        lane.flow_node_refs = refs_for(lane, path);
        if let Some(child) = &mut lane.child_lane_set {
            map_lane_refs(child, path, refs_for);
        }
        path.pop();
    }
}

/// `assignLane`: a copy of `process` in which `node_id` and the boundary events attached
/// to it sit in leaf lane `lane_id` and in no other lane. Ancestors of the target receive
/// the node too only when the file already follows the union convention there.
///
/// Errors when `lane_id` is not a lane of `process` or has child lanes, or when `node_id`
/// is a boundary event whose host sits in another leaf lane.
pub fn assign_lane(
    process: &BpmnProcess,
    node_id: &str,
    lane_id: &str,
) -> Result<BpmnProcess, String> {
    let entries = lane_entries(process.lane_set.as_ref());
    let target = entries.iter().find(|entry| entry.lane.id == lane_id);
    let (Some(lane_set), Some(target)) = (&process.lane_set, target) else {
        return Err(format!(
            "Lane \"{lane_id}\" is not declared in process \"{}\"",
            process.id
        ));
    };
    if !is_leaf(target.lane) {
        return Err(format!(
            "Lane \"{lane_id}\" has child lanes; \"{node_id}\" must go in one of its leaf lanes"
        ));
    }

    let element = process
        .contents
        .flow_elements
        .iter()
        .find(|candidate| candidate.base().id == node_id);
    if let Some(host_ref) = element.and_then(attached_to) {
        let host = leaf_lanes(Some(lane_set))
            .into_iter()
            .find(|lane| lane.flow_node_refs.iter().any(|r| r == host_ref));
        if let Some(host) = host.filter(|host| !std::ptr::eq(*host, target.lane)) {
            return Err(format!(
                "Boundary event \"{node_id}\" sits in the lane of its host \"{host_ref}\" (\"{}\"); move the host instead",
                host.id
            ));
        }
    }

    let mut moving: Vec<String> = vec![node_id.to_owned()];
    moving.extend(
        boundary_event_ids(process, node_id)
            .into_iter()
            .map(str::to_owned),
    );
    let moving_ids: HashSet<String> = moving.iter().cloned().collect();
    let mut receivers: Vec<&[usize]> = vec![&target.path];
    if follows_union(&target.ancestors) {
        // An ancestor's path is a prefix of the target's.
        receivers.extend((1..target.path.len()).map(|n| &target.path[..n]));
    }

    let mut next = process.clone();
    if let Some(set) = &mut next.lane_set {
        map_lane_refs(set, &mut Vec::new(), &mut |lane, path| {
            let mut kept: Vec<String> = lane
                .flow_node_refs
                .iter()
                .filter(|r| !moving_ids.contains(*r))
                .cloned()
                .collect();
            if receivers.contains(&path) {
                kept.extend(moving.iter().cloned());
            }
            kept
        });
    }
    Ok(next)
}

/// `specIds`: ids of all lanes in `specs`, and of the leaves among them.
fn spec_ids(specs: &[LaneSpec]) -> Result<(IndexSet<&str>, IndexSet<&str>), String> {
    fn visit<'a>(
        children: &'a [LaneSpec],
        all: &mut IndexSet<&'a str>,
        leaves: &mut IndexSet<&'a str>,
    ) -> Result<(), String> {
        for spec in children {
            // Two leaves with one id would get the same refs and one DI shape between them.
            if !all.insert(&spec.id) {
                return Err(format!("Lane \"{}\" is declared twice", spec.id));
            }
            if spec.lanes.is_empty() {
                leaves.insert(&spec.id);
            } else {
                visit(&spec.lanes, all, leaves)?;
            }
        }
        Ok(())
    }
    let mut all = IndexSet::new();
    let mut leaves = IndexSet::new();
    visit(specs, &mut all, &mut leaves)?;
    Ok((all, leaves))
}

/// `buildLaneSet`: the lane set of `process` from `specs` and `leaf_of` (flow node id to
/// leaf lane id). Refs keep `leaf_of`'s order; a boundary event joins its host's lane when
/// the host is mapped; parent lanes list the union of their descendants' refs. Set ids are
/// `LaneSet_<processId>` and `LaneSet_<laneId>`, with a numeric suffix when in use.
///
/// Errors listing every `leaf_of` entry that names an undeclared lane or a lane with child
/// lanes, or when `specs` declares one id twice.
pub fn build_lane_set(
    process: &BpmnProcess,
    specs: &[LaneSpec],
    leaf_of: &IndexMap<String, String>,
) -> Result<BpmnLaneSet, String> {
    let (all, leaves) = spec_ids(specs)?;
    let mut problems: Vec<String> = Vec::new();
    for (node_id, lane_id) in leaf_of {
        if !all.contains(lane_id.as_str()) {
            problems.push(format!("Lane \"{lane_id}\" is not declared"));
        } else if !leaves.contains(lane_id.as_str()) {
            problems.push(format!(
                "Lane \"{lane_id}\" has child lanes; \"{node_id}\" must go in one of its leaf lanes"
            ));
        }
    }
    if !problems.is_empty() {
        return Err(format!(
            "Invalid lane membership:\n  {}",
            problems.join("\n  ")
        ));
    }

    let host_of: IndexMap<&str, &str> = process
        .contents
        .flow_elements
        .iter()
        .filter_map(|element| attached_to(element).map(|host| (element.base().id.as_str(), host)))
        .collect();
    let mut refs_by_lane: IndexMap<&str, Vec<String>> = IndexMap::new();
    for (node_id, lane_id) in leaf_of {
        if host_of
            .get(node_id.as_str())
            .is_some_and(|host| leaf_of.contains_key(*host))
        {
            continue; // placed together with its host
        }
        let refs = refs_by_lane.entry(lane_id).or_default();
        refs.push(node_id.clone());
        refs.extend(
            boundary_event_ids(process, node_id)
                .into_iter()
                .map(str::to_owned),
        );
    }

    // A lane may be named `LaneSet_<id>` too; the set ids step around every id in use.
    let mut taken: HashSet<String> = HashSet::new();
    taken.insert(process.id.clone());
    taken.extend(all.iter().map(|id| (*id).to_owned()));
    taken.extend(
        process
            .contents
            .flow_elements
            .iter()
            .map(|element| element.base().id.clone()),
    );
    taken.extend(
        process
            .contents
            .sequence_flows
            .iter()
            .map(|flow| flow.id.clone()),
    );
    let mut set_id = |owner: &str, taken: &mut HashSet<String>| {
        fresh_id(
            &format!("LaneSet_{owner}"),
            |n| format!("LaneSet_{owner}_{n}"),
            taken,
        )
    };
    fn to_lane(
        spec: &LaneSpec,
        refs_by_lane: &IndexMap<&str, Vec<String>>,
        taken: &mut HashSet<String>,
        set_id: &mut impl FnMut(&str, &mut HashSet<String>) -> String,
    ) -> BpmnLane {
        let children: Vec<BpmnLane> = spec
            .lanes
            .iter()
            .map(|child| to_lane(child, refs_by_lane, taken, set_id))
            .collect();
        let flow_node_refs = if children.is_empty() {
            refs_by_lane
                .get(spec.id.as_str())
                .cloned()
                .unwrap_or_default()
        } else {
            let union: IndexSet<&String> = children
                .iter()
                .flat_map(|child| child.flow_node_refs.iter())
                .collect();
            union.into_iter().cloned().collect()
        };
        let child_lane_set = (!children.is_empty()).then(|| BpmnLaneSet {
            id: Some(set_id(&spec.id, taken)),
            lanes: children,
            unknown_attributes: Some(Attrs::new()),
            ..BpmnLaneSet::default()
        });
        BpmnLane {
            id: spec.id.clone(),
            name: spec.name.clone(),
            flow_node_refs,
            child_lane_set,
            ..BpmnLane::default()
        }
    }
    let root_id = set_id(&process.id, &mut taken);
    let lanes = specs
        .iter()
        .map(|spec| to_lane(spec, &refs_by_lane, &mut taken, &mut set_id))
        .collect();
    Ok(BpmnLaneSet {
        id: Some(root_id),
        lanes,
        unknown_attributes: Some(Attrs::new()),
        ..BpmnLaneSet::default()
    })
}

/// `laneForNewNode`: the leaf lane a node newly added to a laned `process` belongs in: its
/// host's lane for a boundary event, else the lane of its first sequence-flow predecessor
/// that has one, else of its first such successor, else the first leaf lane.
pub fn lane_for_new_node<'a>(process: &'a BpmnProcess, node_id: &str) -> Option<&'a BpmnLane> {
    let leaves = leaf_lanes(process.lane_set.as_ref());
    let first = *leaves.first()?;
    let element = process
        .contents
        .flow_elements
        .iter()
        .find(|e| e.base().id == node_id);
    let flows = &process.contents.sequence_flows;
    let neighbours = element
        .and_then(attached_to)
        .into_iter()
        .chain(
            flows
                .iter()
                .filter(|f| f.target_ref == node_id)
                .map(|f| f.source_ref.as_str()),
        )
        .chain(
            flows
                .iter()
                .filter(|f| f.source_ref == node_id)
                .map(|f| f.target_ref.as_str()),
        );
    for neighbour in neighbours {
        if let Some(leaf) = leaves
            .iter()
            .find(|lane| lane.flow_node_refs.iter().any(|r| r == neighbour))
        {
            return Some(leaf);
        }
    }
    Some(first)
}

/// `primaryProcess`: the process a single-process writer edits. The first process, in the
/// participant order of `collaborations[0]`, that is explicitly executable; else the first
/// explicitly executable process; else the pinned `primary_process_id`; else the first
/// process with flow elements or lanes; else, every process being empty, the one whose
/// pool is drawn largest among those not marked `isExecutable="false"`.
pub fn primary_process(defs: &BpmnDefinitions) -> Option<&BpmnProcess> {
    primary_process_pinned(defs, defs.primary_process_id.as_deref())
}

fn primary_process_pinned<'a>(
    defs: &'a BpmnDefinitions,
    pin: Option<&str>,
) -> Option<&'a BpmnProcess> {
    let by_id = |id: &str| defs.processes.iter().find(|process| process.id == id);
    for participant in defs
        .collaborations
        .first()
        .into_iter()
        .flat_map(|c| &c.participants)
    {
        let process = participant.process_ref.as_deref().and_then(by_id);
        if let Some(process) = process.filter(|p| p.is_executable == Some(true)) {
            return Some(process);
        }
    }
    defs.processes
        .iter()
        .find(|process| process.is_executable == Some(true))
        .or_else(|| pin.and_then(by_id))
        // An empty process is a partner's; picking it would mark the real one
        // non-executable in pool_laned_processes, and Flowable would deploy nothing.
        .or_else(|| defs.processes.iter().find(|p| has_content(p)))
        .or_else(|| emptied_primary(defs))
}

/// `emptiedPrimary`: once an edit empties the user's process, only the drawing tells it
/// from an empty partner, which is a thin band. Without pool DI, document order decides.
fn emptied_primary(defs: &BpmnDefinitions) -> Option<&BpmnProcess> {
    let runnable: Vec<&BpmnProcess> = defs
        .processes
        .iter()
        .filter(|process| process.is_executable != Some(false))
        .collect();
    let candidates: Vec<&BpmnProcess> = if runnable.is_empty() {
        defs.processes.iter().collect()
    } else {
        runnable
    };
    let mut area: IndexMap<&str, f64> = IndexMap::new();
    for diagram in &defs.diagrams {
        for shape in &diagram.plane.shapes {
            area.insert(
                &shape.bpmn_element,
                shape.bounds.width * shape.bounds.height,
            );
        }
    }
    let pool_area = |process: &BpmnProcess| -> f64 {
        let mut largest = 0.0_f64;
        for participant in defs.collaborations.iter().flat_map(|c| &c.participants) {
            if participant.process_ref.as_deref() != Some(process.id.as_str()) {
                continue;
            }
            largest = largest.max(area.get(participant.id.as_str()).copied().unwrap_or(0.0));
        }
        largest
    };
    let mut best = *candidates.first()?;
    for candidate in candidates {
        if pool_area(candidate) > pool_area(best) {
            best = candidate;
        }
    }
    Some(best)
}

/// `withBpmnkitNamespace`: `namespaces` with [`BPMNKIT_NAMESPACE`] declared, and its
/// prefix: the one already declared, else `bpmnkit`, else the first free `bpmnkit<n>`.
pub fn with_bpmnkit_namespace(namespaces: &Attrs) -> (Attrs, String) {
    if let Some(declared) = namespaces
        .iter()
        .find(|(prefix, uri)| !prefix.is_empty() && *uri == BPMNKIT_NAMESPACE)
        .map(|(prefix, _)| prefix.clone())
    {
        return (namespaces.clone(), declared);
    }
    let mut prefix = "bpmnkit".to_owned();
    let mut n = 2;
    while namespaces.contains_key(&prefix) {
        prefix = format!("bpmnkit{n}");
        n += 1;
    }
    let mut with = namespaces.clone();
    with.insert(prefix.clone(), BPMNKIT_NAMESPACE.to_owned());
    (with, prefix)
}

/// `pinnedPrimaryToWrite`: the `primary_process_id` a file must carry, or `None` when the
/// file alone already leads [`primary_process`] there, so a document nobody emptied stays
/// byte-identical.
pub fn pinned_primary_to_write(defs: &BpmnDefinitions) -> Option<&str> {
    let pinned = defs.primary_process_id.as_deref()?;
    if !defs.processes.iter().any(|process| process.id == pinned) {
        return None;
    }
    let unpinned = primary_process_pinned(defs, None).map(|process| process.id.as_str());
    (unpinned != Some(pinned)).then_some(pinned)
}

/// `documentIdList`: every id the document uses, once per use, so an id listed twice is a
/// clash.
pub fn document_id_list(defs: &BpmnDefinitions) -> Vec<&str> {
    fn visit<'a>(scope: &'a BpmnProcessContents, ids: &mut Vec<&'a str>) {
        ids.extend(scope.flow_elements.iter().map(|e| e.base().id.as_str()));
        ids.extend(scope.sequence_flows.iter().map(|f| f.id.as_str()));
        ids.extend(scope.text_annotations.iter().map(|a| a.id.as_str()));
        ids.extend(scope.associations.iter().map(|a| a.id.as_str()));
        ids.extend(scope.groups.iter().map(|g| g.id.as_str()));
        for element in &scope.flow_elements {
            if let Some(contents) = element.contents() {
                visit(contents, ids);
            }
        }
    }
    let mut ids: Vec<&str> = Vec::new();
    if !defs.id.is_empty() {
        ids.push(&defs.id);
    }
    ids.extend(defs.messages.iter().map(|r| r.id.as_str()));
    ids.extend(defs.errors.iter().map(|r| r.id.as_str()));
    ids.extend(defs.signals.iter().map(|r| r.id.as_str()));
    ids.extend(defs.escalations.iter().map(|r| r.id.as_str()));
    for process in &defs.processes {
        ids.push(&process.id);
        visit(&process.contents, &mut ids);
        let lanes = all_lanes(process.lane_set.as_ref());
        let sets = process
            .lane_set
            .iter()
            .chain(lanes.iter().filter_map(|lane| lane.child_lane_set.as_ref()));
        for set in sets {
            if let Some(id) = set.id.as_deref().filter(|id| !id.is_empty()) {
                ids.push(id);
            }
        }
        ids.extend(lanes.iter().map(|lane| lane.id.as_str()));
    }
    for collaboration in &defs.collaborations {
        ids.push(&collaboration.id);
        ids.extend(collaboration.participants.iter().map(|p| p.id.as_str()));
        ids.extend(collaboration.message_flows.iter().map(|f| f.id.as_str()));
        ids.extend(collaboration.text_annotations.iter().map(|a| a.id.as_str()));
        ids.extend(collaboration.associations.iter().map(|a| a.id.as_str()));
        ids.extend(collaboration.groups.iter().map(|g| g.id.as_str()));
    }
    ids
}

/// `duplicateIds`: every repeated use in [`document_id_list`].
pub fn duplicate_ids(defs: &BpmnDefinitions) -> Vec<&str> {
    let mut seen: HashSet<&str> = HashSet::new();
    document_id_list(defs)
        .into_iter()
        .filter(|id| !seen.insert(id))
        .collect()
}

/// `freshId`: `first` when free, else the first free `nth(2)`, `nth(3)`, …; claims it in
/// `taken`.
pub fn fresh_id(first: &str, nth: impl Fn(usize) -> String, taken: &mut HashSet<String>) -> String {
    let mut id = first.to_owned();
    let mut n = 2;
    while taken.contains(&id) && n <= taken.len() + 2 {
        id = nth(n);
        n += 1;
    }
    taken.insert(id.clone());
    id
}

/// `poolLanedProcesses`: "lanes imply a pool". When any process has a lane set or any
/// collaboration exists, `collaborations[0]` exists (id `Collaboration_1` unless taken) and
/// every process with content is referenced by a participant (`Participant_<processId>`,
/// named after the process, else its id). A process pooled here that is not the
/// [`primary_process`] and has no `isExecutable` gets `false`, because Flowable reads an
/// absent attribute as executable.
pub fn pool_laned_processes(mut defs: BpmnDefinitions) -> BpmnDefinitions {
    let has_lanes = defs.processes.iter().any(|p| p.lane_set.is_some());
    if !has_lanes && defs.collaborations.is_empty() {
        return defs;
    }
    let pooled: HashSet<Option<&str>> = defs
        .collaborations
        .iter()
        .flat_map(|c| c.participants.iter().map(|p| p.process_ref.as_deref()))
        .collect();
    let unpooled: Vec<usize> = (0..defs.processes.len())
        .filter(|&i| {
            let process = &defs.processes[i];
            has_content(process) && !pooled.contains(&Some(process.id.as_str()))
        })
        .collect();
    if unpooled.is_empty() && !defs.collaborations.is_empty() {
        return defs;
    }

    let mut taken: HashSet<String> = document_id_list(&defs)
        .into_iter()
        .map(str::to_owned)
        .collect();
    let first = match defs.collaborations.first() {
        Some(_) => None,
        None => Some(BpmnCollaboration {
            id: fresh_id(
                "Collaboration_1",
                |n| format!("Collaboration_{n}"),
                &mut taken,
            ),
            ..BpmnCollaboration::default()
        }),
    };
    let added: Vec<BpmnParticipant> = unpooled
        .iter()
        .map(|&i| {
            let process = &defs.processes[i];
            BpmnParticipant {
                id: fresh_id(
                    &format!("Participant_{}", process.id),
                    |n| format!("Participant_{}_{n}", process.id),
                    &mut taken,
                ),
                name: Some(process.name.clone().unwrap_or_else(|| process.id.clone())),
                process_ref: Some(process.id.clone()),
                ..BpmnParticipant::default()
            }
        })
        .collect();

    let primary = primary_process(&defs).map(|p| p as *const BpmnProcess);
    let partners: Vec<usize> = unpooled
        .into_iter()
        .filter(|&i| Some(&defs.processes[i] as *const BpmnProcess) != primary)
        .collect();
    if let Some(first) = first {
        defs.collaborations.insert(0, first);
    }
    defs.collaborations[0].participants.extend(added);
    for i in partners {
        let process = &mut defs.processes[i];
        if process.is_executable.is_none() {
            process.is_executable = Some(false);
        }
    }
    defs
}

/// `messageEndProblem`: why an element of `type_` cannot be the `side` end of a message
/// flow (`source` when `as_source`), or `None` when it can. `trigger` is an event's first
/// event definition (`"message"`, `"timer"`, …).
pub fn message_end_problem(type_: &str, trigger: Option<&str>, as_source: bool) -> Option<String> {
    const MESSAGE_EVENTS: [&str; 5] = [
        "startEvent",
        "endEvent",
        "intermediateCatchEvent",
        "intermediateThrowEvent",
        "boundaryEvent",
    ];
    if type_.ends_with("Gateway") {
        return Some("a gateway cannot send or receive a message".to_owned());
    }
    if DATA_ELEMENT_TYPES.contains(&type_) {
        return Some("a data object or store cannot send or receive a message".to_owned());
    }
    let refused = if as_source {
        match type_ {
            "startEvent" => Some("a start event cannot send a message"),
            "intermediateCatchEvent" | "boundaryEvent" => {
                Some("a catch event cannot send a message")
            }
            _ => None,
        }
    } else {
        match type_ {
            "endEvent" => Some("an end event cannot receive a message"),
            "intermediateThrowEvent" => Some("a throw event cannot receive a message"),
            _ => None,
        }
    };
    if let Some(refused) = refused {
        return Some(refused.to_owned());
    }
    // A timer or a signal waits for, or sends, something else; only a plain event can be
    // made a message one.
    match trigger {
        Some(trigger) if MESSAGE_EVENTS.contains(&type_) && trigger != "message" => Some(format!(
            "a {trigger} event cannot {} a message",
            if as_source { "send" } else { "receive" }
        )),
        _ => None,
    }
}

/// `collaborationProblems`: everything about the collaborations of `defs` that a modeler
/// would refuse or open broken, one message per finding. Empty without collaborations.
pub fn collaboration_problems(defs: &BpmnDefinitions) -> Vec<String> {
    if defs.collaborations.is_empty() {
        return Vec::new();
    }
    let participants: Vec<&BpmnParticipant> = defs
        .collaborations
        .iter()
        .flat_map(|c| &c.participants)
        .collect();
    let mut problems: Vec<String> = Vec::new();

    // Every id in the document, not only pools and message flows: two processes may each
    // declare the same lane, and a node may share a pool's id, which would also make the
    // owning pool of a message-flow end ambiguous.
    for id in duplicate_ids(defs) {
        problems.push(format!("Duplicate element ID \"{id}\""));
    }

    let process_ids: HashSet<&str> = defs.processes.iter().map(|p| p.id.as_str()).collect();
    let mut claimed: IndexMap<&str, &str> = IndexMap::new();
    for participant in &participants {
        let Some(process_id) = participant.process_ref.as_deref() else {
            continue;
        };
        if !process_ids.contains(process_id) {
            problems.push(format!(
                "Participant \"{}\" references process \"{process_id}\", which this diagram does not contain",
                participant.id
            ));
            continue;
        }
        if let Some(owner) = claimed.get(process_id) {
            problems.push(format!(
                "Participants \"{owner}\" and \"{}\" both reference process \"{process_id}\"; a process belongs to one pool",
                participant.id
            ));
        }
        claimed.insert(process_id, &participant.id);
    }

    let owning = participant_index(&participants, &defs.processes);
    let message_ids: HashSet<&str> = defs.messages.iter().map(|m| m.id.as_str()).collect();
    for flow in defs.collaborations.iter().flat_map(|c| &c.message_flows) {
        for (role, end) in [("source", &flow.source_ref), ("target", &flow.target_ref)] {
            if !owning.contains_key(end.as_str()) {
                problems.push(format!(
                    "Message flow \"{}\" names {role} \"{end}\", which is not a participant or a flow node in one",
                    flow.id
                ));
            }
        }
        let from = owning.get(flow.source_ref.as_str());
        let to = owning.get(flow.target_ref.as_str());
        if let (Some(from), Some(to)) = (from, to) {
            if from == to {
                problems.push(format!(
                    "Message flow \"{}\" starts and ends in participant \"{from}\"; a message flow crosses pools, a sequence flow stays inside one",
                    flow.id
                ));
            }
        }
        if let Some(message_ref) = &flow.message_ref {
            if !message_ids.contains(message_ref.as_str()) {
                problems.push(format!(
                    "Message flow \"{}\" references message \"{message_ref}\", which this diagram does not declare",
                    flow.id
                ));
            }
        }
    }

    for process in &defs.processes {
        if has_content(process) && !claimed.contains_key(process.id.as_str()) {
            problems.push(format!(
                "Process \"{}\" has content but no participant; once a diagram has a collaboration, every process with content needs a pool",
                process.id
            ));
        }
    }
    problems
}

/// `participantIndex`: every participant id and every flow node id (nested ones included)
/// mapped to its owning participant.
fn participant_index<'a>(
    participants: &[&'a BpmnParticipant],
    processes: &'a [BpmnProcess],
) -> IndexMap<&'a str, &'a str> {
    let mut index: IndexMap<&str, &str> = IndexMap::new();
    let mut by_process: IndexMap<&str, &str> = IndexMap::new();
    for participant in participants {
        index.insert(&participant.id, &participant.id);
        if let Some(process_ref) = &participant.process_ref {
            by_process.insert(process_ref, &participant.id);
        }
    }
    for process in processes {
        let Some(&owner) = by_process.get(process.id.as_str()) else {
            continue;
        };
        for element in &process.contents.flow_elements {
            index.insert(&element.base().id, owner);
        }
        for id in nested_element_ids(&process.contents.flow_elements) {
            index.insert(id, owner);
        }
    }
    index
}

#[cfg(test)]
mod tests {
    use super::*;

    fn lane(id: &str, refs: &[&str], children: Vec<BpmnLane>) -> BpmnLane {
        BpmnLane {
            id: id.to_owned(),
            flow_node_refs: refs.iter().map(|r| (*r).to_owned()).collect(),
            child_lane_set: (!children.is_empty()).then(|| BpmnLaneSet {
                lanes: children,
                ..BpmnLaneSet::default()
            }),
            ..BpmnLane::default()
        }
    }

    #[test]
    fn assign_lane_moves_into_the_leaf_and_keeps_a_union_parent() {
        let process = BpmnProcess {
            id: "p".to_owned(),
            lane_set: Some(BpmnLaneSet {
                lanes: vec![
                    lane(
                        "parent",
                        &["a"],
                        vec![lane("left", &["a"], vec![]), lane("right", &[], vec![])],
                    ),
                    lane("other", &["b"], vec![]),
                ],
                ..BpmnLaneSet::default()
            }),
            ..BpmnProcess::default()
        };
        let moved = assign_lane(&process, "b", "right").unwrap();
        let refs = |id: &str| {
            all_lanes(moved.lane_set.as_ref())
                .into_iter()
                .find(|l| l.id == id)
                .unwrap()
                .flow_node_refs
                .clone()
        };
        assert_eq!(refs("right"), ["b"]);
        assert_eq!(refs("parent"), ["a", "b"]);
        assert!(refs("other").is_empty());
        assert_eq!(lane_of(&moved, "b").unwrap().id, "right");
        assert!(assign_lane(&process, "b", "parent").is_err());
    }
}
