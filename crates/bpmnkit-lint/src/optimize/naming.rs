//! `optimize/naming.ts`: Camunda's naming conventions.

use super::utils::*;
use super::ResolvedOptions;
use crate::{Category, Finding, Severity};
use bpmnkit_bpmn::BpmnProcess;

const TASK_TYPES: [&str; 8] = [
    "serviceTask",
    "userTask",
    "businessRuleTask",
    "scriptTask",
    "sendTask",
    "receiveTask",
    "manualTask",
    "callActivity",
];
const SUBPROCESS_TYPES: [&str; 3] = ["subProcess", "adHocSubProcess", "transaction"];
const DECISION_GATEWAY_TYPES: [&str; 2] = ["exclusiveGateway", "inclusiveGateway"];

pub fn analyze_naming(p: &BpmnProcess, _opts: &ResolvedOptions) -> Vec<Finding> {
    let mut findings = vec![];
    let process_id = p.id.as_str();
    let idx = build_flow_index(p);
    let mut push = |id: &str, severity, message: String, suggestion: String, ids: Vec<String>| {
        findings.push(finding(
            id,
            Category::Naming,
            severity,
            message,
            suggestion,
            process_id,
            ids,
        ));
    };

    for el in &p.contents.flow_elements {
        let id = el.base().id.as_str();
        let ty = el.type_name();
        let name = el.base().name.as_deref().filter(|n| !n.is_empty());

        if TASK_TYPES.contains(&ty) && name.is_none() {
            push(
                "naming/unlabeled-task",
                Severity::Warning,
                format!("Task \"{id}\" ({ty}) has no name."),
                "Name tasks using \"Verb Object\" form, e.g. \"Verify Invoice\", \"Send Notification\", \"Approve Request\".".into(),
                vec![id.to_owned()],
            );
        }
        if SUBPROCESS_TYPES.contains(&ty) && name.is_none() {
            push(
                "naming/unlabeled-subprocess",
                Severity::Info,
                format!("Sub-process \"{id}\" ({ty}) has no name."),
                "Name sub-processes using \"Object + nominalized verb\" form, e.g. \"Invoice Processing\", \"Order Fulfillment\".".into(),
                vec![id.to_owned()],
            );
        }
        if ty == "startEvent" && name.is_none() {
            push(
                "naming/unlabeled-start-event",
                Severity::Info,
                format!("Start event \"{id}\" has no name."),
                "Name start events using \"Object + past participle\", e.g. \"Order Received\", \"Payment Initiated\".".into(),
                vec![id.to_owned()],
            );
        }
        if ty == "endEvent" && name.is_none() {
            push(
                "naming/unlabeled-end-event",
                Severity::Info,
                format!("End event \"{id}\" has no name."),
                "Name end events using \"Object + state\", e.g. \"Order Fulfilled\", \"Payment Failed\", \"Request Rejected\".".into(),
                vec![id.to_owned()],
            );
        }

        if !DECISION_GATEWAY_TYPES.contains(&ty) {
            continue;
        }
        let outflows = idx.outgoing(id);
        let is_split = outflows.len() >= 2;
        let is_join = idx.incoming(id).len() >= 2;

        if is_split {
            match name {
                None => push(
                    "naming/split-gateway-no-label",
                    Severity::Warning,
                    format!("Gateway \"{id}\" ({ty}, split) has no name."),
                    "Label split gateways as a yes/no question, e.g. \"Invoice valid?\", \"Order approved?\".".into(),
                    vec![id.to_owned()],
                ),
                Some(n) if !js_trim(n).ends_with('?') => push(
                    "naming/gateway-not-a-question",
                    Severity::Info,
                    format!(
                        "Gateway \"{id}\" is named \"{n}\" — split gateways should be phrased as questions."
                    ),
                    format!("Rephrase as a question, e.g. \"{}?\"", js_trim(n)),
                    vec![id.to_owned()],
                ),
                Some(_) => {}
            }
            for flow in outflows {
                if flow.name.as_deref().is_none_or(str::is_empty) {
                    push(
                        "naming/missing-flow-condition",
                        Severity::Warning,
                        format!(
                            "Sequence flow \"{}\" from split gateway \"{id}\" has no condition label.",
                            flow.id
                        ),
                        "Label each outgoing flow with the condition answer, e.g. \"Yes\", \"No\", \"Approved\", \"Rejected\".".into(),
                        vec![id.to_owned(), flow.id.clone()],
                    );
                }
            }
        }

        if let Some(n) = name.filter(|_| is_join && !is_split) {
            push(
                "naming/join-gateway-labeled",
                Severity::Info,
                format!(
                    "Gateway \"{id}\" (join) is named \"{n}\" — join gateways should not have labels."
                ),
                "Remove the label from join-only gateways; their semantics are implicit.".into(),
                vec![id.to_owned()],
            );
        }
    }

    findings
}
