//! `optimize/patterns.ts`: error handling, SLAs, data and modelling anti-patterns.

use super::utils::*;
use crate::{Category, Finding, Severity};
use bpmnkit_bpmn::{BpmnEventDefinition, BpmnFlowElement, BpmnProcess};
use indexmap::{IndexMap, IndexSet};
use std::collections::{HashMap, HashSet};

/// hostId → event-definition types of the boundary events attached to it.
fn index_boundary_types(p: &BpmnProcess) -> HashMap<&str, HashSet<&'static str>> {
    let mut index: HashMap<&str, HashSet<&'static str>> = HashMap::new();
    for el in &p.contents.flow_elements {
        if let BpmnFlowElement::BoundaryEvent(b) = el {
            let types = index.entry(&b.attached_to_ref).or_default();
            types.extend(b.event_definitions.iter().map(event_def_type));
        }
    }
    index
}

fn eat_digits(s: &[u8], mut i: usize) -> Option<usize> {
    let start = i;
    while i < s.len() && s[i].is_ascii_digit() {
        i += 1;
    }
    (i > start).then_some(i)
}

/// `-?\d+(?:\.\d+)?`, plus `(?:[eE][+-]?\d+)?` when `exponent`; the end index.
fn eat_number(s: &[u8], mut i: usize, exponent: bool) -> Option<usize> {
    if s.get(i) == Some(&b'-') {
        i += 1;
    }
    i = eat_digits(s, i)?;
    if s.get(i) == Some(&b'.') {
        if let Some(j) = eat_digits(s, i + 1) {
            i = j;
        }
    }
    if exponent && matches!(s.get(i), Some(b'e' | b'E')) {
        let mut j = i + 1;
        if matches!(s.get(j), Some(b'+' | b'-')) {
            j += 1;
        }
        if let Some(k) = eat_digits(s, j) {
            i = k;
        }
    }
    Some(i)
}

/// `"[^"]*"`, `'[^']*'` (when `single`), a number, or `true|false|null` (any case).
fn eat_literal(s: &[u8], i: usize, single: bool, exponent: bool) -> Option<usize> {
    match s.get(i)? {
        &q @ (b'"' | b'\'') if q == b'"' || single => {
            let end = s[i + 1..].iter().position(|&c| c == q)?;
            Some(i + 1 + end + 1)
        }
        b'-' | b'0'..=b'9' => eat_number(s, i, exponent),
        _ => ["true", "false", "null"].iter().find_map(|w| {
            s.get(i..i + w.len())
                .filter(|t| t.eq_ignore_ascii_case(w.as_bytes()))
                .map(|_| i + w.len())
        }),
    }
}

fn skip_space(s: &str, mut i: usize) -> usize {
    while let Some(c) = s[i..].chars().next().filter(|&c| is_js_space(c)) {
        i += c.len_utf8();
    }
    i
}

/// Whether a condition's text holds only literals, as TS's two regexes decide.
fn is_literal_only_condition(text: &str) -> bool {
    // `/^\s*=\s*/`
    let lead = skip_space(text, 0);
    let expr = match text[lead..].strip_prefix('=') {
        Some(rest) => &rest[skip_space(rest, 0)..],
        None => text,
    };
    let expr = js_trim(expr);
    let s = expr.as_bytes();
    if eat_literal(s, 0, true, true) == Some(s.len()) {
        return true;
    }
    // `/^\[(?:\s*(?:"[^"]*"|-?\d+(?:\.\d+)?|true|false|null)\s*,?\s*)*\]$/i`
    if s.first() != Some(&b'[') {
        return false;
    }
    let mut i = 1;
    loop {
        if i + 1 == s.len() && s[i] == b']' {
            return true;
        }
        i = skip_space(expr, i);
        let Some(j) = eat_literal(s, i, false, false) else {
            return false;
        };
        i = skip_space(expr, j);
        if s.get(i) == Some(&b',') {
            i = skip_space(expr, i + 1);
        }
    }
}

pub fn analyze_patterns(p: &BpmnProcess) -> Vec<Finding> {
    let mut findings = vec![];
    let process_id = p.id.as_str();
    let idx = build_flow_index(p);
    let boundary_types = index_boundary_types(p);
    let has_boundary = |id: &str, ty: &str| boundary_types.get(id).is_some_and(|t| t.contains(ty));
    let elements = &p.contents.flow_elements;
    let mut push =
        |id: &str, severity, message: String, suggestion: &str, element_ids: Vec<String>| {
            findings.push(finding(
                id,
                Category::Pattern,
                severity,
                message,
                suggestion,
                process_id,
                element_ids,
            ));
        };

    // Rule 1: HTTP/REST service task without error boundary
    for el in elements {
        let BpmnFlowElement::ServiceTask(t) = el else {
            continue;
        };
        let job = read_zeebe_task_type(&t.base.extension_elements)
            .unwrap_or_default()
            .to_lowercase();
        if (job.contains("http") || job.contains("rest")) && !has_boundary(&t.base.id, "error") {
            push(
                "pattern/http-no-error-boundary",
                Severity::Error,
                format!(
                    "Service task \"{}\" calls an HTTP connector but has no error boundary event.",
                    label(el)
                ),
                "Add an error boundary event to handle network failures (timeouts, non-2xx responses).",
                vec![t.base.id.clone()],
            );
        }
    }

    // Rule 2: Exclusive gateway without default flow
    for el in elements {
        let BpmnFlowElement::ExclusiveGateway(g) = el else {
            continue;
        };
        if idx.outgoing(&g.base.id).len() <= 1 {
            continue;
        }
        if g.default.is_none() {
            push(
                "pattern/gateway-no-default-flow",
                Severity::Warning,
                format!(
                    "Exclusive gateway \"{}\" has no default sequence flow.",
                    label(el)
                ),
                "Add a default flow to ensure the process does not get stuck when no condition matches.",
                vec![g.base.id.clone()],
            );
        }
    }

    // Rule 3: Sub-process without error boundary
    for el in elements {
        if !matches!(
            el,
            BpmnFlowElement::SubProcess(_)
                | BpmnFlowElement::AdHocSubProcess(_)
                | BpmnFlowElement::Transaction(_)
        ) {
            continue;
        }
        let id = &el.base().id;
        if !has_boundary(id, "error") {
            push(
                "pattern/subprocess-no-error-boundary",
                Severity::Warning,
                format!("Sub-process \"{}\" has no error boundary event.", label(el)),
                "Add an error boundary event to catch unhandled errors thrown inside the sub-process.",
                vec![id.clone()],
            );
        }
    }

    // Rule 4: Call activity with no error propagation
    for el in elements {
        let BpmnFlowElement::CallActivity(a) = el else {
            continue;
        };
        if !has_boundary(&a.base.id, "error") {
            push(
                "pattern/call-activity-no-error-boundary",
                Severity::Error,
                format!(
                    "Call activity \"{}\" has no error boundary event.",
                    label(el)
                ),
                "Add an error boundary event to handle errors propagated from the called process.",
                vec![a.base.id.clone()],
            );
        }
    }

    // Rule 5: Parallel branches writing the same variable
    for el in elements {
        let BpmnFlowElement::ParallelGateway(g) = el else {
            continue;
        };
        let outflows = idx.outgoing(&g.id);
        if outflows.len() < 2 {
            continue;
        }
        let mut seen: IndexMap<String, usize> = IndexMap::new();
        for flow in outflows {
            let mut unique: IndexSet<String> = IndexSet::new();
            if let Some(branch) = idx.by_id.get(flow.target_ref.as_str()) {
                if let Some(io) = read_zeebe_io_mapping(&branch.base().extension_elements) {
                    for out in io.outputs {
                        let t = js_trim(&out.target);
                        if !t.is_empty() {
                            unique.insert(t.to_owned());
                        }
                    }
                }
            }
            for t in unique {
                *seen.entry(t).or_default() += 1;
            }
        }
        let conflicts: Vec<&str> = seen
            .iter()
            .filter(|(_, &c)| c > 1)
            .map(|(v, _)| v.as_str())
            .collect();
        if !conflicts.is_empty() {
            push(
                "pattern/parallel-variable-conflict",
                Severity::Error,
                format!(
                    "Parallel branches from gateway \"{}\" both write to: {}.",
                    label(el),
                    conflicts.join(", ")
                ),
                "Last writer wins — result is non-deterministic. Use distinct variable names per branch.",
                vec![g.id.clone()],
            );
        }
    }

    // Rule 6: User task without timer boundary
    for el in elements {
        let BpmnFlowElement::UserTask(t) = el else {
            continue;
        };
        if !has_boundary(&t.base.id, "timer") {
            push(
                "pattern/user-task-no-timer",
                Severity::Warning,
                format!("User task \"{}\" has no timer boundary event.", label(el)),
                "Add a timer boundary to enforce an SLA and prevent tasks from waiting indefinitely.",
                vec![t.base.id.clone()],
            );
        }
    }

    // Rule 7: Service task output mapping with no result variable
    for el in elements {
        let BpmnFlowElement::ServiceTask(t) = el else {
            continue;
        };
        let ext = &t.base.extension_elements;
        if read_zeebe_task_type(ext).is_none() {
            continue;
        }
        let has_outputs = read_zeebe_io_mapping(ext).is_some_and(|io| !io.outputs.is_empty());
        if !has_outputs {
            push(
                "pattern/service-task-no-output",
                Severity::Warning,
                format!(
                    "Service task \"{}\" has no output variable mapping.",
                    label(el)
                ),
                "Map the job result to process variables so downstream tasks can consume it.",
                vec![t.base.id.clone()],
            );
        }
    }

    // Rule 8: Error boundary leading directly to end event (catch-and-swallow)
    for el in elements {
        let BpmnFlowElement::BoundaryEvent(b) = el else {
            continue;
        };
        if !b
            .event_definitions
            .iter()
            .any(|d| matches!(d, BpmnEventDefinition::Error(_)))
        {
            continue;
        }
        let swallows = idx.outgoing(&b.base.id).iter().any(|f| {
            idx.by_id
                .get(f.target_ref.as_str())
                .is_some_and(|t| t.type_name() == "endEvent")
        });
        if swallows {
            push(
                "pattern/catch-and-swallow",
                Severity::Warning,
                format!(
                    "Error boundary on \"{}\" leads directly to an end event — error is silently consumed.",
                    b.attached_to_ref
                ),
                "Add error logging, compensation, or re-throw the error rather than swallowing it silently.",
                vec![b.base.id.clone()],
            );
        }
    }

    // Rule 9: Exclusive gateway with only one outgoing flow
    for el in elements {
        let BpmnFlowElement::ExclusiveGateway(g) = el else {
            continue;
        };
        // Several ways in and one out is a join, which is what a join should look like.
        if idx.incoming(&g.base.id).len() > 1 {
            continue;
        }
        if idx.outgoing(&g.base.id).len() == 1 {
            push(
                "pattern/gateway-single-outgoing",
                Severity::Warning,
                format!(
                    "Exclusive gateway \"{}\" has only one outgoing flow and is a pass-through.",
                    label(el)
                ),
                "Remove this gateway and connect its source directly to its target.",
                vec![g.base.id.clone()],
            );
        }
    }

    // Rule 10: Undocumented process start variables
    for el in elements {
        let BpmnFlowElement::StartEvent(s) = el else {
            continue;
        };
        if !s.event_definitions.is_empty() || !idx.incoming(&s.base.id).is_empty() {
            continue;
        }
        let has_doc = s
            .base
            .documentation
            .as_deref()
            .is_some_and(|d| !js_trim(d).is_empty());
        if !has_doc {
            push(
                "pattern/start-no-documentation",
                Severity::Warning,
                format!(
                    "Start event \"{}\" has no documentation describing expected input variables.",
                    label(el)
                ),
                "Add documentation listing the process input variables so callers know the expected contract.",
                vec![s.base.id.clone()],
            );
        }
    }

    // Rule 11: Timer boundary with duration 0
    for el in elements {
        let BpmnFlowElement::BoundaryEvent(b) = el else {
            continue;
        };
        for def in &b.event_definitions {
            let BpmnEventDefinition::Timer(t) = def else {
                continue;
            };
            let dur = t.time_duration.as_deref().map(js_trim).unwrap_or_default();
            if matches!(dur, "PT0S" | "P0D" | "PT0M" | "PT0H" | "0" | "P0") {
                push(
                    "pattern/timer-duration-zero",
                    Severity::Error,
                    format!(
                        "Timer boundary on \"{}\" has a duration of zero — it will fire immediately.",
                        b.attached_to_ref
                    ),
                    "Set a meaningful duration (e.g. PT1H for 1 hour) to avoid instant firing.",
                    vec![b.base.id.clone()],
                );
            }
        }
    }

    // Rule 12: Boundary event with no outgoing flow
    for el in elements {
        let BpmnFlowElement::BoundaryEvent(b) = el else {
            continue;
        };
        if idx.outgoing(&b.base.id).is_empty() {
            push(
                "pattern/boundary-no-outgoing",
                Severity::Error,
                format!(
                    "Boundary event on \"{}\" has no outgoing sequence flow.",
                    b.attached_to_ref
                ),
                "Connect the boundary event to a handler task or end event.",
                vec![b.base.id.clone()],
            );
        }
    }

    // Rule 13: Empty text annotation
    for ann in &p.contents.text_annotations {
        if ann
            .text
            .as_deref()
            .map(js_trim)
            .unwrap_or_default()
            .is_empty()
        {
            push(
                "pattern/empty-annotation",
                Severity::Info,
                format!("Text annotation \"{}\" is empty.", ann.id),
                "Fill in the annotation or remove it to keep the diagram clean.",
                vec![ann.id.clone()],
            );
        }
    }

    // Rule 14: Duplicate job type across multiple service tasks
    let mut job_type_counts: IndexMap<String, Vec<String>> = IndexMap::new();
    for el in elements {
        let BpmnFlowElement::ServiceTask(t) = el else {
            continue;
        };
        if let Some(job) = read_zeebe_task_type(&t.base.extension_elements) {
            if !js_trim(&job).is_empty() {
                job_type_counts
                    .entry(job)
                    .or_default()
                    .push(t.base.id.clone());
            }
        }
    }
    for (job, ids) in job_type_counts {
        if ids.len() < 2 {
            continue;
        }
        push(
            "pattern/duplicate-job-type",
            Severity::Info,
            format!("Job type \"{job}\" is used by {} service tasks.", ids.len()),
            "Verify this is intentional — the same worker will handle all these tasks. Consider distinct job types if behaviors differ.",
            ids,
        );
    }

    // Rule 15: FEEL condition using only literal values
    let mut checked: HashSet<&str> = HashSet::new();
    for flow in &p.contents.sequence_flows {
        if !checked.insert(&flow.id) {
            continue;
        }
        let Some(cond) = flow.condition_expression.as_ref().map(|c| js_trim(&c.text)) else {
            continue;
        };
        if cond.is_empty() || !is_literal_only_condition(cond) {
            continue;
        }
        let mut ids = vec![flow.id.clone()];
        if let Some(src) = idx.by_id.get(flow.source_ref.as_str()) {
            ids.push(src.base().id.clone());
        }
        push(
            "pattern/literal-condition",
            Severity::Info,
            format!(
                "Sequence flow \"{}\" has a condition that only references literal values: `{cond}`",
                flow.name.as_deref().unwrap_or(&flow.id)
            ),
            "A literal condition never changes at runtime. Replace with a variable reference or remove the condition.",
            ids,
        );
    }

    findings
}

#[cfg(test)]
mod tests {
    use super::is_literal_only_condition as lit;

    #[test]
    fn literal_conditions_match_ts_regexes() {
        for yes in [
            "= true",
            "=TRUE",
            "42",
            "-1.5e3",
            "\"a\"",
            "'b'",
            "null",
            "[1, 2, 3]",
            "[\"a\",\"b\",]",
            "[]",
            "[12]",
            "= [true null]",
        ] {
            assert!(lit(yes), "{yes}");
        }
        for no in [
            "= x", "1.", "[ ]", "[,1]", "[1,,2]", "['a']", "[1e3]", "= x > 1", "truex",
        ] {
            assert!(!lit(no), "{no}");
        }
    }
}
