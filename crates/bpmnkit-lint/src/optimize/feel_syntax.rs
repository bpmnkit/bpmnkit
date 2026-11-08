//! `optimize/feel-syntax.ts`: parse-validates every `=`-prefixed FEEL expression.

use super::utils::*;
use crate::{Category, Finding, Severity};
use bpmnkit_bpmn::{BpmnFlowElement, BpmnProcess, BpmnSequenceFlow};

/// Every flow element, nested ones after their container.
fn walk_elements<'a>(elements: &'a [BpmnFlowElement], out: &mut Vec<&'a BpmnFlowElement>) {
    for el in elements {
        out.push(el);
        if let Some(c) = el.contents() {
            walk_elements(&c.flow_elements, out);
        }
    }
}

/// The given flows, then every nested container's flows.
fn walk_flows<'a>(
    elements: &'a [BpmnFlowElement],
    top_level: &'a [BpmnSequenceFlow],
    out: &mut Vec<&'a BpmnSequenceFlow>,
) {
    out.extend(top_level);
    for el in elements {
        if let Some(c) = el.contents() {
            walk_flows(&c.flow_elements, &c.sequence_flows, out);
        }
    }
}

fn check_feel(
    text: &str,
    element_id: &str,
    process_id: &str,
    surface: &str,
    findings: &mut Vec<Finding>,
) {
    let Some(expr) = js_trim(text).strip_prefix('=') else {
        return;
    };
    let parsed = bpmnkit_feel::parse_partial(expr, &bpmnkit_feel::ParseOptions::default());
    for err in parsed.errors {
        findings.push(finding(
            "feel-syntax/parse-error",
            Category::FeelSyntax,
            Severity::Error,
            format!(
                "Invalid FEEL expression on {surface} of \"{element_id}\": {}",
                err.message
            ),
            "Fix the FEEL syntax — see the error position for the offending token.",
            process_id,
            vec![element_id.to_owned()],
        ));
    }
}

pub fn analyze_feel_syntax(p: &BpmnProcess) -> Vec<Finding> {
    let mut findings = vec![];
    let process_id = p.id.as_str();

    let mut flows = vec![];
    walk_flows(
        &p.contents.flow_elements,
        &p.contents.sequence_flows,
        &mut flows,
    );
    for flow in flows {
        if let Some(c) = flow
            .condition_expression
            .as_ref()
            .filter(|c| !c.text.is_empty())
        {
            check_feel(&c.text, &flow.id, process_id, "condition", &mut findings);
        }
    }

    let mut elements = vec![];
    walk_elements(&p.contents.flow_elements, &mut elements);
    for el in elements {
        let base = el.base();
        let id = base.id.as_str();
        let ext = &base.extension_elements;
        if let Some(io) = read_zeebe_io_mapping(ext) {
            for i in &io.inputs {
                let surface = format!("input \"{}\"", i.target);
                check_feel(&i.source, id, process_id, &surface, &mut findings);
            }
            for o in &io.outputs {
                let surface = format!("output \"{}\"", o.target);
                check_feel(&o.source, id, process_id, &surface, &mut findings);
            }
        }

        let attr = |name: &str, key: &str| {
            ext.iter()
                .find(|e| e.name == name)
                .and_then(|e| e.attr(key))
                .filter(|v| !v.is_empty())
        };
        if let Some(expr) = attr("zeebe:script", "expression") {
            check_feel(expr, id, process_id, "script expression", &mut findings);
        }

        if let BpmnFlowElement::AdHocSubProcess(a) = el {
            if let Some(c) = a
                .completion_condition
                .as_ref()
                .filter(|c| !c.text.is_empty())
            {
                check_feel(
                    &c.text,
                    id,
                    process_id,
                    "completion condition",
                    &mut findings,
                );
            }
            if let Some(v) = attr("zeebe:adHoc", "outputElement") {
                check_feel(v, id, process_id, "outputElement", &mut findings);
            }
            if let Some(v) = attr("zeebe:adHoc", "activeElementsCollection") {
                check_feel(v, id, process_id, "activeElementsCollection", &mut findings);
            }
        }
    }

    findings
}
