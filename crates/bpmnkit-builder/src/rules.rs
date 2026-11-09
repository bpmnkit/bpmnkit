//! TS's `builder-rules.ts`: the builder's Camunda 8 rules, said in the builder's terms
//! (the option or call that fixes the model) before the deploy gate runs. They read the
//! built model, which TS and Rust build identically, so the messages match byte for byte.
//! Walk order is the model's: processes, then each scope's elements in order, descending
//! into sub-processes after the element itself.

use bpmnkit_bpmn::model::{BpmnEventDefinition, BpmnFlowElement, BpmnSequenceFlow};
use bpmnkit_bpmn::BpmnDefinitions;
use bpmnkit_xml::XmlElement;

fn zeebe<'a>(extensions: &'a [XmlElement], name: &str) -> Option<&'a XmlElement> {
    extensions
        .iter()
        .find(|x| x.name.strip_prefix("zeebe:") == Some(name))
}

/// Zeebe reads a value without a leading `=` as a static string.
fn is_static(value: Option<&str>) -> Option<&str> {
    value.filter(|v| !v.is_empty() && !v.starts_with('='))
}

fn static_feel(field: &str, value: &str, element_id: &str) -> String {
    format!(
        "{field} \"{value}\" of \"{element_id}\" is a static value; Camunda 8 needs a FEEL expression here, e.g. \"={value}\""
    )
}

fn has_message_definition(el: &BpmnFlowElement) -> bool {
    el.event_definitions().is_some_and(|d| {
        d.iter()
            .any(|d| matches!(d, BpmnEventDefinition::Message(_)))
    })
}

/// The label of a send task or message throw/end event.
fn message_job_label(el: &BpmnFlowElement) -> Option<&'static str> {
    match el {
        BpmnFlowElement::SendTask(_) => Some("Send task"),
        BpmnFlowElement::EndEvent(_) if has_message_definition(el) => Some("Message end event"),
        BpmnFlowElement::IntermediateThrowEvent(_) if has_message_definition(el) => {
            Some("Message throw event")
        }
        _ => None,
    }
}

fn has_message_implementation(el: &BpmnFlowElement) -> bool {
    let ext = &el.base().extension_elements;
    if zeebe(ext, "taskDefinition").is_some() || zeebe(ext, "publishMessage").is_some() {
        return true;
    }
    el.event_definitions().is_some_and(|defs| {
        defs.iter().any(|d| match d {
            BpmnEventDefinition::Message(m) => m
                .extension_elements
                .as_deref()
                .is_some_and(|x| zeebe(x, "publishMessage").is_some()),
            _ => false,
        })
    })
}

fn message_ref_of(el: &BpmnFlowElement) -> Option<&str> {
    if let BpmnFlowElement::SendTask(t) | BpmnFlowElement::ReceiveTask(t) = el {
        return t.message_ref.as_deref();
    }
    el.event_definitions()?.iter().find_map(|d| match d {
        BpmnEventDefinition::Message(m) => Some(m.message_ref.as_deref()),
        _ => None,
    })?
}

fn element_problem(
    el: &BpmnFlowElement,
    flows: &[BpmnSequenceFlow],
    defs: &BpmnDefinitions,
    placeholders: bool,
) -> Option<String> {
    let id = el.base().id.as_str();

    if let (false, BpmnFlowElement::ExclusiveGateway(g) | BpmnFlowElement::InclusiveGateway(g)) =
        (placeholders, el)
    {
        let outgoing: Vec<&BpmnSequenceFlow> =
            flows.iter().filter(|f| f.source_ref == id).collect();
        if outgoing.len() > 1 {
            let kind = if matches!(el, BpmnFlowElement::ExclusiveGateway(_)) {
                "exclusive"
            } else {
                "inclusive"
            };
            for flow in outgoing {
                if flow.condition_expression.is_some() || g.default.as_deref() == Some(&flow.id) {
                    continue;
                }
                return Some(format!(
                    "Flow \"{}\" leaves {kind} gateway \"{id}\" without a condition: give its branch .condition(\"=<FEEL>\") or .defaultFlow(); Camunda 8 needs one when a gateway has several outgoing flows",
                    flow.id
                ));
            }
        }
    }

    if let Some(label) = message_job_label(el) {
        if !placeholders && !has_message_implementation(el) {
            return Some(format!(
                "{label} \"{id}\" needs a taskType: Camunda 8 hands the message to a job worker of that type (zeebe:taskDefinition)"
            ));
        }
    }

    if let BpmnFlowElement::AdHocSubProcess(sub) = el {
        let ext = &sub.base.extension_elements;
        let ad_hoc = zeebe(ext, "adHoc");
        let attr = |name: &str| {
            ad_hoc
                .and_then(|a| a.attributes.get(name))
                .map(String::as_str)
        };
        if zeebe(ext, "taskDefinition").is_some() {
            let forbidden = if attr("activeElementsCollection").is_some() {
                Some("activeElementsCollection")
            } else if sub.completion_condition.is_some() {
                Some("completionCondition")
            } else if sub.cancel_remaining_instances == Some(false) {
                Some("cancelRemainingInstances: false")
            } else {
                None
            };
            if let Some(forbidden) = forbidden {
                return Some(format!(
                    "Ad-hoc sub-process \"{id}\" has a taskDefinition (an AI agent) and {forbidden}; Camunda 8 refuses that combination: remove {forbidden}, the agent job decides which tools run and when it is done"
                ));
            }
        }
        match (attr("outputElement"), attr("outputCollection")) {
            (None, Some(_)) => {
                return Some(format!(
                    "Ad-hoc sub-process \"{id}\" sets outputCollection without outputElement: set both, or neither"
                ))
            }
            (Some(_), None) => {
                return Some(format!(
                    "Ad-hoc sub-process \"{id}\" sets outputElement without outputCollection: set both, or neither"
                ))
            }
            _ => {}
        }
        if let Some(active) = is_static(attr("activeElementsCollection")) {
            return Some(static_feel("activeElementsCollection", active, id));
        }
    }

    if let Some(message_ref) = message_ref_of(el) {
        let own = zeebe(&el.base().extension_elements, "subscription");
        let shared = defs
            .messages
            .iter()
            .find(|m| m.id == message_ref)
            .and_then(|m| m.extension_elements.as_deref())
            .and_then(|x| zeebe(x, "subscription"));
        let key = own
            .or(shared)
            .and_then(|s| s.attributes.get("correlationKey"))
            .map(String::as_str);
        if let Some(key) = is_static(key) {
            return Some(static_feel("correlationKey", key, id));
        }
    }

    if let Some(lc) = el.loop_characteristics() {
        let collection = zeebe(&lc.extension_elements, "loopCharacteristics")
            .and_then(|l| l.attributes.get("inputCollection"))
            .map(String::as_str);
        if let Some(collection) = is_static(collection) {
            return Some(static_feel(
                "Multi-instance inputCollection",
                collection,
                id,
            ));
        }
    }

    None
}

fn scope_problem(
    elements: &[BpmnFlowElement],
    flows: &[BpmnSequenceFlow],
    defs: &BpmnDefinitions,
    placeholders: bool,
) -> Option<String> {
    for el in elements {
        if let Some(problem) = element_problem(el, flows, defs, placeholders) {
            return Some(problem);
        }
        if let Some(contents) = el.contents() {
            if let Some(problem) = scope_problem(
                &contents.flow_elements,
                &contents.sequence_flows,
                defs,
                placeholders,
            ) {
                return Some(problem);
            }
        }
    }
    None
}

/// TS's `camunda8BuilderProblem`: the first Camunda 8 builder rule the model breaks.
/// With `placeholders`, the gaps a placeholder fills (job types, conditions) are left to
/// the gate.
pub(crate) fn camunda8_builder_problem(
    defs: &BpmnDefinitions,
    placeholders: bool,
) -> Option<String> {
    defs.processes.iter().find_map(|p| {
        scope_problem(
            &p.contents.flow_elements,
            &p.contents.sequence_flows,
            defs,
            placeholders,
        )
    })
}
