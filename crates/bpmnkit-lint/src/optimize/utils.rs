//! `optimize/utils.ts`: flow index, reachability, model helpers, and the JS string
//! semantics (`trim`, UTF-16 `length` / `slice`, `sort`) TS's messages depend on.

use crate::{Category, Finding, FindingData, Severity};
use bpmnkit_bpmn::{
    BpmnDefinitions, BpmnDiPlane, BpmnEventDefinition, BpmnFlowElement, BpmnFlowNodeBase,
    BpmnProcess, BpmnSequenceFlow,
};
use std::collections::{HashMap, HashSet};

pub use bpmnkit_bpmn::zeebe::{
    read_zeebe_io_mapping, read_zeebe_task_headers, read_zeebe_task_type,
};

// ── model access ────────────────────────────────────────────────────────────

pub fn base_mut(el: &mut BpmnFlowElement) -> &mut BpmnFlowNodeBase {
    use BpmnFlowElement::*;
    match el {
        StartEvent(e) => &mut e.base,
        EndEvent(e) | IntermediateCatchEvent(e) | IntermediateThrowEvent(e) => &mut e.base,
        BoundaryEvent(e) => &mut e.base,
        Task(a) | ServiceTask(a) | ScriptTask(a) | UserTask(a) | BusinessRuleTask(a)
        | ManualTask(a) | CallActivity(a) => &mut a.base,
        SendTask(t) | ReceiveTask(t) => &mut t.base,
        SubProcess(s) => &mut s.base,
        AdHocSubProcess(s) => &mut s.base,
        EventSubProcess(s) => &mut s.base,
        Transaction(s) => &mut s.base,
        ExclusiveGateway(g) | InclusiveGateway(g) | ComplexGateway(g) => &mut g.base,
        ParallelGateway(b) | EventBasedGateway(b) => b,
        DataObject(d) => &mut d.base,
        DataObjectReference(d) => &mut d.base,
        DataStoreReference(d) => &mut d.base,
    }
}

/// `"eventDefinitions" in el`.
pub fn event_definitions(el: &BpmnFlowElement) -> Option<&[BpmnEventDefinition]> {
    use BpmnFlowElement::*;
    match el {
        StartEvent(e) => Some(&e.event_definitions),
        EndEvent(e) | IntermediateCatchEvent(e) | IntermediateThrowEvent(e) => {
            Some(&e.event_definitions)
        }
        BoundaryEvent(e) => Some(&e.event_definitions),
        _ => None,
    }
}

pub fn event_def_type(d: &BpmnEventDefinition) -> &'static str {
    use BpmnEventDefinition::*;
    match d {
        Timer(_) => "timer",
        Error(_) => "error",
        Escalation(_) => "escalation",
        Message(_) => "message",
        Signal(_) => "signal",
        Conditional(_) => "conditional",
        Link(_) => "link",
        Cancel(_) => "cancel",
        Terminate(_) => "terminate",
        Compensate(_) => "compensate",
    }
}

pub fn event_def_id(d: &BpmnEventDefinition) -> Option<&str> {
    use BpmnEventDefinition::*;
    match d {
        Timer(x) => x.id.as_deref(),
        Error(x) => x.id.as_deref(),
        Escalation(x) => x.id.as_deref(),
        Message(x) => x.id.as_deref(),
        Signal(x) => x.id.as_deref(),
        Conditional(x) => x.id.as_deref(),
        Link(x) => x.id.as_deref(),
        Cancel(x) | Terminate(x) => x.id.as_deref(),
        Compensate(x) => x.id.as_deref(),
    }
}

/// `el.name ?? el.id`.
pub fn label(el: &BpmnFlowElement) -> &str {
    let b = el.base();
    b.name.as_deref().unwrap_or(&b.id)
}

/// JS truthiness of an optional string.
pub fn truthy(s: Option<&str>) -> bool {
    s.is_some_and(|s| !s.is_empty())
}

// ── flow graph ──────────────────────────────────────────────────────────────

pub struct FlowIndex<'a> {
    pub by_id: HashMap<&'a str, &'a BpmnFlowElement>,
    pub by_source: HashMap<&'a str, Vec<&'a BpmnSequenceFlow>>,
    pub by_target: HashMap<&'a str, Vec<&'a BpmnSequenceFlow>>,
}

impl<'a> FlowIndex<'a> {
    pub fn outgoing(&self, id: &str) -> &[&'a BpmnSequenceFlow] {
        self.by_source.get(id).map_or(&[], Vec::as_slice)
    }

    pub fn incoming(&self, id: &str) -> &[&'a BpmnSequenceFlow] {
        self.by_target.get(id).map_or(&[], Vec::as_slice)
    }
}

pub fn build_flow_index(p: &BpmnProcess) -> FlowIndex<'_> {
    let mut idx = FlowIndex {
        by_id: HashMap::new(),
        by_source: HashMap::new(),
        by_target: HashMap::new(),
    };
    for el in &p.contents.flow_elements {
        idx.by_id.insert(&el.base().id, el);
    }
    for flow in &p.contents.sequence_flows {
        idx.by_source
            .entry(&flow.source_ref)
            .or_default()
            .push(flow);
        idx.by_target
            .entry(&flow.target_ref)
            .or_default()
            .push(flow);
    }
    idx
}

/// `reachableFrom`, over a source → targets adjacency.
pub fn reachable_from<'a>(
    start_ids: &[&'a str],
    successors: &HashMap<&'a str, Vec<&'a str>>,
) -> HashSet<&'a str> {
    let mut visited: HashSet<&str> = start_ids.iter().copied().collect();
    let mut queue: Vec<&str> = start_ids.to_vec();
    let mut head = 0;
    while head < queue.len() {
        let current = queue[head];
        head += 1;
        for &t in successors.get(current).map_or(&[][..], Vec::as_slice) {
            if visited.insert(t) {
                queue.push(t);
            }
        }
    }
    visited
}

pub fn is_gateway(type_name: &str) -> bool {
    matches!(
        type_name,
        "exclusiveGateway"
            | "inclusiveGateway"
            | "complexGateway"
            | "parallelGateway"
            | "eventBasedGateway"
    )
}

// ── mutation helpers ────────────────────────────────────────────────────────

pub fn find_process<'a>(defs: &'a mut BpmnDefinitions, id: &str) -> Option<&'a mut BpmnProcess> {
    defs.processes.iter_mut().find(|p| p.id == id)
}

pub fn find_di_plane<'a>(defs: &'a mut BpmnDefinitions, id: &str) -> Option<&'a mut BpmnDiPlane> {
    defs.diagrams
        .iter_mut()
        .map(|d| &mut d.plane)
        .find(|p| p.bpmn_element == id)
}

pub fn find_element<'a>(p: &'a mut BpmnProcess, id: &str) -> Option<&'a mut BpmnFlowElement> {
    p.contents
        .flow_elements
        .iter_mut()
        .find(|e| e.base().id == id)
}

// ── findings ────────────────────────────────────────────────────────────────

pub fn finding(
    id: impl Into<String>,
    category: Category,
    severity: Severity,
    message: impl Into<String>,
    suggestion: impl Into<String>,
    process_id: &str,
    element_ids: Vec<String>,
) -> Finding {
    Finding::new(FindingData {
        id: id.into(),
        category,
        severity,
        message: message.into(),
        suggestion: suggestion.into(),
        process_id: process_id.to_owned(),
        element_ids,
        produces: None,
        consumes: None,
        bpmnlint_rule: None,
    })
}

pub fn fix_result(description: impl Into<String>) -> crate::ApplyFixResult {
    crate::ApplyFixResult {
        description: description.into(),
        generated: None,
    }
}

// ── JS string semantics ─────────────────────────────────────────────────────

/// JS `WhiteSpace` + `LineTerminator` (what `String.prototype.trim` and `\s` match).
pub fn is_js_space(c: char) -> bool {
    matches!(
        c,
        '\t' | '\n' | '\u{0B}' | '\u{0C}' | '\r' | ' ' | '\u{A0}' | '\u{1680}' | '\u{2000}'
            ..='\u{200A}'
                | '\u{2028}'
                | '\u{2029}'
                | '\u{202F}'
                | '\u{205F}'
                | '\u{3000}'
                | '\u{FEFF}'
    )
}

pub fn js_trim(s: &str) -> &str {
    s.trim_matches(is_js_space)
}

/// JS `length`: UTF-16 code units.
pub fn utf16_len(s: &str) -> usize {
    s.encode_utf16().count()
}

/// JS `s.slice(0, n)` on UTF-16 code units (a split surrogate pair becomes U+FFFD).
pub fn utf16_prefix(s: &str, n: usize) -> String {
    let units: Vec<u16> = s.encode_utf16().take(n).collect();
    String::from_utf16_lossy(&units)
}

/// JS `Array.prototype.sort()` on strings: by UTF-16 code units.
pub fn js_sort(v: &mut [String]) {
    v.sort_by(|a, b| a.encode_utf16().cmp(b.encode_utf16()));
}
