//! `optimize/feel.ts`: heuristic FEEL complexity, missing conditions and defaults.

use super::utils::*;
use super::ResolvedOptions;
use crate::{Category, Finding, Severity};
use bpmnkit_bpmn::{BpmnFlowElement, BpmnProcess};
use indexmap::IndexMap;

const FEEL_KEYWORD_OPERATORS: [&str; 12] = [
    "and",
    "or",
    "not",
    "if",
    "then",
    "else",
    "instance",
    "of",
    "some",
    "every",
    "satisfies",
    "function",
];

struct FeelScore {
    length: usize,
    nesting_depth: i64,
    operator_count: usize,
    variable_count: usize,
    is_complex: bool,
}

fn score_feel_expression(expr: &str, opts: &ResolvedOptions) -> FeelScore {
    let length = utf16_len(expr);

    let mut depth: i64 = 0;
    let mut nesting_depth: i64 = 0;
    for ch in expr.chars() {
        match ch {
            '(' | '[' => {
                depth += 1;
                nesting_depth = nesting_depth.max(depth);
            }
            ')' | ']' => depth -= 1,
            _ => {}
        }
    }

    // `expr.split(/\W+/).filter(Boolean)`: `\W` is anything but ASCII [A-Za-z0-9_].
    let mut operator_count = 0;
    let mut variables = std::collections::HashSet::new();
    for token in expr
        .split(|c: char| !(c.is_ascii_alphanumeric() || c == '_'))
        .filter(|t| !t.is_empty())
    {
        if FEEL_KEYWORD_OPERATORS.contains(&token) {
            operator_count += 1;
        } else if !token.starts_with(|c: char| c.is_ascii_digit()) {
            variables.insert(token);
        }
    }

    // `/!=|<=|>=|[+\-*/=<>]/g`
    let bytes = expr.as_bytes();
    let mut i = 0;
    while i < bytes.len() {
        let two = bytes.get(i..i + 2);
        if matches!(two, Some(b"!=" | b"<=" | b">=")) {
            operator_count += 1;
            i += 2;
        } else {
            if matches!(bytes[i], b'+' | b'-' | b'*' | b'/' | b'=' | b'<' | b'>') {
                operator_count += 1;
            }
            i += 1;
        }
    }

    let variable_count = variables.len();
    let is_complex = length > opts.feel_length_threshold
        || nesting_depth > opts.feel_nesting_threshold as i64
        || operator_count > opts.feel_operator_threshold
        || variable_count > opts.feel_variable_threshold;
    FeelScore {
        length,
        nesting_depth,
        operator_count,
        variable_count,
        is_complex,
    }
}

const REST_CONNECTOR_TYPE: &str = "io.camunda:http-json:1";

pub fn analyze_feel(p: &BpmnProcess, opts: &ResolvedOptions) -> Vec<Finding> {
    let mut findings = vec![];
    let idx = build_flow_index(p);
    let process_id = p.id.as_str();
    let mut expr_to_flow_ids: IndexMap<String, Vec<String>> = IndexMap::new();

    for flow in &p.contents.sequence_flows {
        // A join (one outgoing flow) makes no decision, so its flow needs no condition.
        if let Some(src) = idx.by_id.get(flow.source_ref.as_str()) {
            let default = match src {
                BpmnFlowElement::ExclusiveGateway(g) | BpmnFlowElement::InclusiveGateway(g) => {
                    Some(g.default.as_deref())
                }
                _ => None,
            };
            if let Some(default_flow_id) = default {
                if idx.outgoing(&src.base().id).len() > 1
                    && flow.condition_expression.is_none()
                    && Some(flow.id.as_str()) != default_flow_id
                {
                    findings.push(finding(
                        "feel/empty-condition",
                        Category::Feel,
                        Severity::Error,
                        format!(
                            "Sequence flow \"{}\" exits a decision gateway without a condition expression.",
                            flow.id
                        ),
                        "Add a FEEL condition expression or mark this flow as the default.",
                        process_id,
                        vec![flow.id.clone()],
                    ));
                }
            }
        }

        if let Some(cond) = &flow.condition_expression {
            let expr = js_trim(&cond.text);
            if !expr.is_empty() {
                expr_to_flow_ids
                    .entry(expr.to_owned())
                    .or_default()
                    .push(flow.id.clone());
            }
            let s = score_feel_expression(&cond.text, opts);
            if s.is_complex {
                findings.push(finding(
                    "feel/complex-condition",
                    Category::Feel,
                    Severity::Warning,
                    format!(
                        "Condition on flow \"{}\" is complex (length={}, nesting={}, operators={}, variables={}).",
                        flow.id, s.length, s.nesting_depth, s.operator_count, s.variable_count
                    ),
                    "Consider extracting complex FEEL expressions into named variables or decision tables.",
                    process_id,
                    vec![flow.id.clone()],
                ));
            }
        }
    }

    for el in &p.contents.flow_elements {
        let gw = match el {
            BpmnFlowElement::ExclusiveGateway(g) | BpmnFlowElement::InclusiveGateway(g) => g,
            _ => continue,
        };
        let outflows = idx.outgoing(&gw.base.id);
        if outflows.len() < 2 || truthy(gw.default.as_deref()) {
            continue;
        }
        let last_flow_id = outflows.last().map(|f| f.id.clone()).unwrap_or_default();
        let gw_id = gw.base.id.clone();
        let pid = process_id.to_owned();
        findings.push(
            finding(
                "feel/missing-default-flow",
                Category::Feel,
                Severity::Warning,
                format!(
                    "Gateway \"{}\" has {} outgoing flows but no default flow set.",
                    gw_id,
                    outflows.len()
                ),
                "Set a default flow to handle unmatched conditions.",
                process_id,
                vec![gw_id.clone()],
            )
            .with_fix(move |defs| {
                let Some(proc) = find_process(defs, &pid) else {
                    return fix_result("Process not found");
                };
                let Some(gw) = find_element(proc, &gw_id) else {
                    return fix_result("Gateway not found");
                };
                if let BpmnFlowElement::ExclusiveGateway(g) | BpmnFlowElement::InclusiveGateway(g) =
                    gw
                {
                    g.default = Some(last_flow_id.clone());
                }
                fix_result(format!(
                    "Set default flow to \"{last_flow_id}\" on gateway \"{gw_id}\""
                ))
            }),
        );
    }

    // Connector tasks' inputs are structured parameters, not authored FEEL.
    for el in &p.contents.flow_elements {
        let BpmnFlowElement::ServiceTask(t) = el else {
            continue;
        };
        let ext = &t.base.extension_elements;
        if read_zeebe_task_type(ext).as_deref() == Some(REST_CONNECTOR_TYPE) {
            continue;
        }
        let Some(io) = read_zeebe_io_mapping(ext) else {
            continue;
        };
        if io
            .inputs
            .iter()
            .any(|i| score_feel_expression(&i.source, opts).is_complex)
        {
            findings.push(finding(
                "feel/complex-io-mapping",
                Category::Feel,
                Severity::Info,
                format!(
                    "IO mapping input source on task \"{}\" is complex.",
                    t.base.id
                ),
                "Consider extracting complex FEEL expressions into intermediate variables.",
                process_id,
                vec![t.base.id.clone()],
            ));
        }
    }

    for (expr, flow_ids) in expr_to_flow_ids {
        if flow_ids.len() >= 2 {
            findings.push(finding(
                "feel/duplicate-expression",
                Category::Feel,
                Severity::Info,
                format!(
                    "FEEL expression \"{}\" appears on {} sequence flows.",
                    utf16_prefix(&expr, 40),
                    flow_ids.len()
                ),
                "Consider extracting repeated FEEL expressions into a shared variable or decision table.",
                process_id,
                flow_ids,
            ));
        }
    }

    findings
}
