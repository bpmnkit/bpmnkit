//! Port of `bpmn/stable-ids.ts`: content-derived ids for sequence flows, root definitions
//! and event definitions, so rebuilding an unchanged model yields the same BPMN.
//!
//! TS keeps two builder-side facts per flow in `WeakMap`/`WeakSet`s keyed by the flow
//! object (its branch id, and whether its id was caller-chosen). Rust has no object
//! identity for a `BpmnSequenceFlow` that moves between vectors, so [`FlowTags`] keys
//! them by flow id instead, and [`assign_stable_flow_ids`] re-keys a branch tag when it
//! renames the flow. The two only part ways when a caller-chosen id equals another
//! flow's id, which is an error either way; source flows of a continued document always
//! precede new ones, so even then the message matches.

use indexmap::{IndexMap, IndexSet};

use crate::model::{BpmnEventDefinition, BpmnFlowElement, BpmnSequenceFlow};
use crate::number::js_trim;
use crate::slug::{slugify, unique_id};

/// Longest id this produces; anything longer is truncated and hashed.
const MAX_ID_LENGTH: usize = 200;

/// Builder-side facts about flows that never reach the XML (TS's `branchIds` and
/// `explicitIds`), keyed by flow id.
#[derive(Debug, Clone, Default, PartialEq)]
pub struct FlowTags {
    branch_ids: IndexMap<String, String>,
    explicit: IndexSet<String>,
}

impl FlowTags {
    /// TS's `setFlowDiscriminatorSource`: tell the flow apart by `branch_id`, not its label.
    pub fn set_flow_discriminator_source(&mut self, flow_id: &str, branch_id: &str) {
        self.branch_ids
            .insert(flow_id.to_owned(), branch_id.to_owned());
    }

    /// TS's `markExplicitFlowId`: the flow's id was chosen by the caller and is kept.
    pub fn mark_explicit_flow_id(&mut self, flow_id: &str) {
        self.explicit.insert(flow_id.to_owned());
    }

    pub fn is_explicit(&self, flow_id: &str) -> bool {
        self.explicit.contains(flow_id)
    }

    pub fn branch_id(&self, flow_id: &str) -> Option<&str> {
        self.branch_ids.get(flow_id).map(String::as_str)
    }
}

/// FNV-1a over UTF-16 code units, base36: a short, stable discriminator.
fn short_hash(text: &str) -> String {
    let mut hash: u32 = 0x811c_9dc5;
    for unit in text.encode_utf16() {
        hash ^= u32::from(unit);
        hash = hash.wrapping_mul(0x0100_0193);
    }
    base36(hash)
}

fn base36(mut n: u32) -> String {
    const DIGITS: &[u8] = b"0123456789abcdefghijklmnopqrstuvwxyz";
    let mut out = vec![];
    loop {
        out.push(DIGITS[(n % 36) as usize]);
        n /= 36;
        if n == 0 {
            break;
        }
    }
    out.reverse();
    String::from_utf8(out).unwrap_or_default()
}

/// Keeps an id an XML NCName: letters, digits, `_` and `-`, never leading with a digit.
fn nc_name(text: &str) -> String {
    let mut cleaned = String::new();
    let mut in_run = false;
    for c in text.chars() {
        if c.is_ascii_alphanumeric() || c == '_' || c == '-' {
            cleaned.push(c);
            in_run = false;
        } else if !in_run {
            cleaned.push('_');
            in_run = true;
        }
    }
    let cleaned = cleaned.trim_start_matches(|c: char| !(c.is_ascii_alphabetic() || c == '_'));
    if cleaned.is_empty() {
        "x".to_owned()
    } else {
        cleaned.to_owned()
    }
}

/// Truncates over-long ids, keeping them distinct with a hash of the whole id. Every id
/// reaching here is built from [`nc_name`] output, so it is ASCII and bytes are UTF-16 units.
fn cap_length(id: String) -> String {
    if id.len() <= MAX_ID_LENGTH {
        return id;
    }
    let suffix = format!("_{}", short_hash(&id));
    format!("{}{suffix}", &id[..MAX_ID_LENGTH - suffix.len()])
}

/// TS's `assertExplicitFlowIdsUnique`: a caller-chosen flow id must not be the id of any
/// other element or flow in the process, nested sub-processes included.
pub fn assert_explicit_flow_ids_unique(
    elements: &[BpmnFlowElement],
    flows: &[BpmnSequenceFlow],
    tags: &FlowTags,
) -> Result<(), String> {
    struct Walk<'a> {
        owners: IndexMap<&'a str, Vec<(usize, String)>>,
        explicit: Vec<(usize, &'a BpmnSequenceFlow)>,
        next: usize,
    }
    impl<'a> Walk<'a> {
        fn add(&mut self, id: &'a str, label: String) -> usize {
            let owner = self.next;
            self.next += 1;
            self.owners.entry(id).or_default().push((owner, label));
            owner
        }
        fn walk(
            &mut self,
            elements: &'a [BpmnFlowElement],
            flows: &'a [BpmnSequenceFlow],
            tags: &FlowTags,
        ) {
            for element in elements {
                let id = &element.base().id;
                self.add(id, format!("element \"{id}\""));
                if let Some(contents) = element.contents() {
                    self.walk(&contents.flow_elements, &contents.sequence_flows, tags);
                }
            }
            for flow in flows {
                let owner = self.add(
                    &flow.id,
                    format!("the flow {} -> {}", flow.source_ref, flow.target_ref),
                );
                if tags.is_explicit(&flow.id) {
                    self.explicit.push((owner, flow));
                }
            }
        }
    }
    let mut w = Walk {
        owners: IndexMap::new(),
        explicit: vec![],
        next: 0,
    };
    w.walk(elements, flows, tags);
    for (owner, flow) in &w.explicit {
        let other = w
            .owners
            .get(flow.id.as_str())
            .and_then(|list| list.iter().find(|(o, _)| o != owner));
        if let Some((_, label)) = other {
            return Err(format!(
                "Flow id \"{}\" ({} -> {}) is already used by {label}. Pick a different flowId().",
                flow.id, flow.source_ref, flow.target_ref
            ));
        }
    }
    Ok(())
}

/// The id a flow gets when it is the only one between its two endpoints.
fn base_id(flow: &BpmnSequenceFlow) -> String {
    cap_length(format!(
        "Flow_{}_{}",
        nc_name(&flow.source_ref),
        nc_name(&flow.target_ref)
    ))
}

/// What tells two flows between the same endpoints apart: branch name, then condition.
fn discriminator(flow: &BpmnSequenceFlow, tags: &FlowTags) -> Option<String> {
    let source = tags.branch_id(&flow.id).or(flow.name.as_deref());
    if let Some(source) = source {
        if !js_trim(source).is_empty() {
            return Some(nc_name(&slugify(source)));
        }
    }
    let condition = flow.condition_expression.as_ref().map(|c| c.text.as_str());
    if let Some(condition) = condition {
        if !js_trim(condition).is_empty() {
            return Some(format!("c{}", short_hash(condition)));
        }
    }
    None
}

/// TS's `assignStableFlowIds`: replaces generated flow ids in one scope with ids derived
/// from the flows, and rewrites gateway `default`s that name them. `preserve` holds ids
/// of flows the builder did not create (a continued document's).
pub fn assign_stable_flow_ids(
    elements: &mut [BpmnFlowElement],
    flows: &mut [BpmnSequenceFlow],
    tags: &mut FlowTags,
    preserve: Option<&IndexSet<String>>,
) -> Result<(), String> {
    let is_fixed = |flow: &BpmnSequenceFlow, tags: &FlowTags| {
        tags.is_explicit(&flow.id) || preserve.is_some_and(|p| p.contains(&flow.id))
    };
    let mut taken: IndexSet<String> = IndexSet::new();
    let mut owners: IndexMap<String, String> = IndexMap::new();
    for element in elements.iter() {
        let id = &element.base().id;
        taken.insert(id.clone());
        owners.insert(id.clone(), format!("element \"{id}\""));
    }
    for flow in flows.iter() {
        if !is_fixed(flow, tags) {
            continue;
        }
        if tags.is_explicit(&flow.id) && taken.contains(&flow.id) {
            let owner = owners.get(&flow.id).map_or("another flow", String::as_str);
            return Err(format!(
                "Flow id \"{}\" ({} -> {}) is already used by {owner}. Pick a different flowId().",
                flow.id, flow.source_ref, flow.target_ref
            ));
        }
        taken.insert(flow.id.clone());
        owners.insert(
            flow.id.clone(),
            format!("the flow {} -> {}", flow.source_ref, flow.target_ref),
        );
    }

    let renamable: Vec<usize> = (0..flows.len())
        .filter(|&i| !is_fixed(&flows[i], tags))
        .collect();
    if renamable.is_empty() {
        return Ok(());
    }

    let mut by_base: IndexMap<String, Vec<usize>> = IndexMap::new();
    for &i in &renamable {
        by_base.entry(base_id(&flows[i])).or_default().push(i);
    }

    let mut renamed: IndexMap<String, String> = IndexMap::new();
    for (base, group) in &by_base {
        for &i in group {
            let qualifier = if group.len() > 1 {
                discriminator(&flows[i], tags)
            } else {
                None
            };
            let candidate = match qualifier {
                None => base.clone(),
                Some(q) => cap_length(format!("{base}_{q}")),
            };
            let id = unique_id(&candidate, &mut taken);
            let flow = &mut flows[i];
            if id != flow.id {
                renamed.insert(flow.id.clone(), id.clone());
                if let Some(branch) = tags.branch_ids.shift_remove(&flow.id) {
                    tags.branch_ids.insert(id.clone(), branch);
                }
            }
            flow.id = id;
        }
    }

    if renamed.is_empty() {
        return Ok(());
    }
    for element in elements.iter_mut() {
        if let Some(slot) = element.default_flow_mut() {
            if let Some(replacement) = slot.as_ref().and_then(|d| renamed.get(d)) {
                *slot = Some(replacement.clone());
            }
        }
    }
    Ok(())
}

/// TS's `rootDefinitionId`: a message/error/signal/escalation id from the name or code it
/// is looked up by, deduped against `existing` ids of the same kind.
pub fn root_definition_id<'a>(
    prefix: &str,
    source: &str,
    existing: impl IntoIterator<Item = &'a str>,
) -> String {
    let mut taken: IndexSet<String> = existing.into_iter().map(str::to_owned).collect();
    unique_id(
        &cap_length(format!("{prefix}_{}", nc_name(&slugify(source)))),
        &mut taken,
    )
}

/// TS's `eventDefinitionId`: `<owner>_<Kind>EventDefinition`, numbered when an event holds
/// several of one kind, never reusing a sibling's id.
pub fn event_definition_id(owner_id: &str, defs: &[BpmnEventDefinition], index: usize) -> String {
    let Some(def) = defs.get(index) else {
        return format!("{}_EventDefinition", nc_name(owner_id));
    };
    let ty = def.type_name();
    let kind = format!("{}{}", ty[..1].to_uppercase(), &ty[1..]);
    let base = format!("{}_{kind}EventDefinition", nc_name(owner_id));
    let taken: IndexSet<&str> = defs.iter().filter_map(BpmnEventDefinition::id).collect();
    let same_kind = defs[..=index]
        .iter()
        .filter(|d| d.type_name() == ty)
        .count();
    let mut candidate = if same_kind > 1 {
        format!("{base}_{same_kind}")
    } else {
        base.clone()
    };
    let mut n = same_kind + 1;
    while taken.contains(candidate.as_str()) {
        candidate = format!("{base}_{n}");
        n += 1;
    }
    candidate
}

/// TS's `assignEventDefinitionIds`: every id-less definition gets [`event_definition_id`].
/// Runs in order, so a later definition sees the ids given to earlier ones.
pub fn assign_event_definition_ids(owner_id: &str, defs: &mut [BpmnEventDefinition]) {
    for i in 0..defs.len() {
        if defs[i].id().is_none() {
            let id = event_definition_id(owner_id, defs, i);
            *defs[i].id_mut() = Some(id);
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn short_hash_is_fnv1a_base36() {
        // FNV-1a of "" is the offset basis.
        assert_eq!(short_hash(""), base36(0x811c_9dc5));
    }

    #[test]
    fn nc_name_strips_leading_non_letters() {
        assert_eq!(nc_name("1-2 a b"), "_a_b");
        assert_eq!(nc_name("123"), "x");
        assert_eq!(nc_name("_ok"), "_ok");
    }
}
