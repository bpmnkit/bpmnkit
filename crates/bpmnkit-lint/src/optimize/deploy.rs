//! `optimize/deploy.ts`: what Camunda 8 rejects at deployment time, plus connector
//! templates' missing required values.

use super::utils::*;
use super::ConnectorRequirements;
use crate::{Category, Finding, Severity};
use bpmnkit_bpmn::{BpmnEventDefinition, BpmnFlowElement, BpmnMessage, BpmnProcess, XmlElement};
use indexmap::IndexSet;
use std::collections::HashMap;

fn find_ext<'a>(ext: &'a [XmlElement], name: &str) -> Option<&'a XmlElement> {
    ext.iter().find(|e| e.name == name)
}

/// The first message definition's `messageRef`, when there is one.
fn message_def(defs: &[BpmnEventDefinition]) -> Option<Option<&str>> {
    defs.iter().find_map(|d| match d {
        BpmnEventDefinition::Message(m) => Some(m.message_ref.as_deref()),
        _ => None,
    })
}

pub fn analyze_deploy(
    p: &BpmnProcess,
    resolve_connector_requirements: Option<&ConnectorRequirements>,
    messages: &[BpmnMessage],
) -> Vec<Finding> {
    let mut findings = vec![];
    let process_id = p.id.as_str();
    // `new Map(...)`: a later duplicate id wins.
    let message_by_id: HashMap<&str, &BpmnMessage> =
        messages.iter().map(|m| (m.id.as_str(), m)).collect();
    // Camunda reads a catch's key from the element, or from the message it references.
    let has_correlation_key = |ext: &[XmlElement], message_ref: Option<&str>| {
        if truthy(find_ext(ext, "zeebe:subscription").and_then(|s| s.attr("correlationKey"))) {
            return true;
        }
        message_ref
            .and_then(|r| message_by_id.get(r))
            .and_then(|m| m.extension_elements.as_ref())
            .is_some_and(|exts| {
                exts.iter()
                    .any(|e| e.name.ends_with(":subscription") && truthy(e.attr("correlationKey")))
            })
    };
    let mut push = |id: &str, category, message: String, suggestion: String, el: Vec<String>| {
        findings.push(finding(
            id,
            category,
            Severity::Error,
            message,
            suggestion,
            process_id,
            el,
        ));
    };

    if p.is_executable != Some(true) {
        push(
            "deploy/process-not-executable",
            Category::Deploy,
            format!("Process \"{process_id}\" is not marked executable."),
            "Set isExecutable=\"true\" — Camunda 8 refuses to deploy a non-executable process."
                .into(),
            vec![],
        );
    }

    for el in &p.contents.flow_elements {
        let base = el.base();
        let id = &base.id;
        let ext = &base.extension_elements;
        let ty = el.type_name();
        let name = label(el);

        if let Some(defs) = event_definitions(el) {
            let missing = defs.iter().filter(|d| !truthy(event_def_id(d))).count();
            if missing > 0 {
                push(
                    "deploy/event-definition-no-id",
                    Category::Deploy,
                    format!("\"{name}\" has {missing} event definition(s) without an id."),
                    "Give every event definition an id (e.g. <ElementId>_TimerEventDefinition) — Zeebe rejects a definition without one.".into(),
                    vec![id.clone()],
                );
            }
        }

        if matches!(ty, "serviceTask" | "sendTask") && !truthy(read_zeebe_task_type(ext).as_deref())
        {
            push(
                "deploy/service-task-no-type",
                Category::Deploy,
                format!("\"{name}\" ({ty}) has no zeebe:taskDefinition type."),
                "Set a job type — Camunda 8 refuses to deploy a task with no task definition."
                    .into(),
                vec![id.clone()],
            );
        }

        if ty == "businessRuleTask"
            && read_zeebe_task_type(ext).is_none()
            && find_ext(ext, "zeebe:calledDecision").is_none()
        {
            push(
                "deploy/service-task-no-type",
                Category::Deploy,
                format!(
                    "\"{name}\" (businessRuleTask) has neither a zeebe:taskDefinition type nor a zeebe:calledDecision."
                ),
                "Set a decisionId or a job type.".into(),
                vec![id.clone()],
            );
        }

        if ty == "callActivity"
            && !truthy(find_ext(ext, "zeebe:calledElement").and_then(|c| c.attr("processId")))
        {
            push(
                "deploy/call-activity-no-process",
                Category::Deploy,
                format!("Call activity \"{name}\" has no zeebe:calledElement processId."),
                "Set the process id to call.".into(),
                vec![id.clone()],
            );
        }

        if let BpmnFlowElement::StartEvent(s) = el {
            if message_def(&s.event_definitions).is_some_and(|r| !truthy(r)) {
                push(
                    "deploy/message-start-no-name",
                    Category::Deploy,
                    format!("Message start event \"{name}\" has no message name."),
                    "Set a message name — Camunda 8 refuses to deploy an unnamed message reference."
                        .into(),
                    vec![id.clone()],
                );
            }
        }

        // `Some(message_ref)` for a message catch.
        let catch = match el {
            BpmnFlowElement::IntermediateCatchEvent(e) => message_def(&e.event_definitions),
            BpmnFlowElement::BoundaryEvent(e) => message_def(&e.event_definitions),
            BpmnFlowElement::ReceiveTask(t) => t.message_ref.as_deref().map(Some),
            _ => None,
        };
        if let Some(message_ref) = catch {
            if !has_correlation_key(ext, message_ref) {
                push(
                    "deploy/message-catch-no-correlation",
                    Category::Deploy,
                    format!(
                        "Message catch \"{name}\" ({ty}) has no zeebe:subscription correlationKey."
                    ),
                    "Set a correlation key — required for every message catch in Camunda 8.".into(),
                    vec![id.clone()],
                );
            }
        }

        if let Some(resolve) = resolve_connector_requirements {
            let template = base
                .unknown_attributes
                .get("zeebe:modelerTemplate")
                .filter(|t| !t.is_empty());
            if let Some(template_id) = template {
                let mut bound: IndexSet<String> = IndexSet::new();
                if let Some(io) = read_zeebe_io_mapping(ext) {
                    bound.extend(io.inputs.into_iter().map(|i| i.target));
                    bound.extend(io.outputs.into_iter().map(|o| o.target));
                }
                if let Some(h) = read_zeebe_task_headers(ext) {
                    bound.extend(h.headers.into_iter().map(|h| h.key));
                }
                if let Some(props) = find_ext(ext, "zeebe:properties") {
                    for child in &props.children {
                        if let Some(n) = child.attr("name").filter(|n| !n.is_empty()) {
                            bound.insert(n.to_owned());
                        }
                    }
                }
                let keys: Vec<String> = bound.into_iter().collect();
                for key in resolve(template_id, &keys) {
                    push(
                        "connector/missing-required",
                        Category::Connector,
                        format!(
                            "\"{name}\" is missing required connector value \"{key}\" for template \"{template_id}\"."
                        ),
                        format!("Set a value for \"{key}\"."),
                        vec![id.clone()],
                    );
                }
            }
        }
    }

    findings
}
