//! Twin of `zeebe-validate/rules/gateways.ts`: sections J (gateways), K
//! (multi-instance) and L (sub-processes, ad-hoc).

use super::context::{
    feel_error, feel_failure, is_expression, static_value_message, ScopeKind, ZeebeContext,
};
use crate::compat::pattern::js_trim;
use bpmnkit_bpmn::{BpmnConditionExpression, BpmnEventDefinition, BpmnFlowElement};
use bpmnkit_xml::{Attrs, XmlElement};

fn is_gateway(node: &BpmnFlowElement) -> bool {
    use BpmnFlowElement::*;
    matches!(
        node,
        ExclusiveGateway(_)
            | InclusiveGateway(_)
            | ParallelGateway(_)
            | EventBasedGateway(_)
            | ComplexGateway(_)
    )
}

/// Zeebe reads element text through `getTextContent()`, which trims.
fn expression_text(expression: Option<&BpmnConditionExpression>) -> Option<&str> {
    expression.map(|e| js_trim(&e.text))
}

/// The problem with an expression that must not be static, or `None` when it is fine.
fn non_static_problem(text: &str) -> Option<String> {
    if !is_expression(text) {
        return Some(static_value_message(text));
    }
    feel_error(text).map(|_| feel_failure(text))
}

/// An attribute the way Zeebe's getters see it: an empty value is the same as absent.
fn attr<'e>(attributes: &'e Attrs, name: &str) -> Option<&'e str> {
    attributes
        .get(name)
        .map(String::as_str)
        .filter(|v| !v.is_empty())
}

// J: gateways and sequence flows ---------------------------------------------

fn default_source(ctx: &mut ZeebeContext) {
    for entry in ctx.nodes.clone() {
        let node = entry.node;
        let rule = match node {
            BpmnFlowElement::ExclusiveGateway(_) => "exclusive-default-source",
            BpmnFlowElement::InclusiveGateway(_) => "inclusive-default-source",
            _ => continue,
        };
        let Some(flow) = ctx.flow(node.default_flow()) else {
            continue;
        };
        let id = &node.base().id;
        if flow.flow.source_ref == *id {
            continue;
        }
        ctx.report(
            rule,
            id,
            "Default flow must start at gateway".into(),
            "Make the default flow start at the gateway that declares it.",
        );
    }
}

fn flow_condition(ctx: &mut ZeebeContext) {
    for entry in ctx.flows.clone() {
        let flow = entry.flow;
        let Some(source) = ctx.node(Some(&flow.source_ref)).map(|n| n.node) else {
            continue;
        };
        if flow.condition_expression.is_some() {
            continue;
        }
        let xor = match source {
            BpmnFlowElement::ExclusiveGateway(_) => true,
            BpmnFlowElement::InclusiveGateway(_) => false,
            _ => continue,
        };
        let source_id = &source.base().id;
        if ctx.outgoing(source_id).len() <= 1 || source.default_flow() == Some(flow.id.as_str()) {
            continue;
        }
        ctx.report(
            if xor {
                "exclusive-flow-condition"
            } else {
                "inclusive-flow-condition"
            },
            &flow.id,
            if xor {
                "Must have a condition or be default flow"
            } else {
                "Must have a condition"
            }
            .into(),
            "Add a condition expression to the flow or make it the gateway's default flow.",
        );
    }
}

fn conditional_flow_source(ctx: &mut ZeebeContext) {
    for entry in ctx.nodes.clone() {
        let node = entry.node;
        if matches!(
            node,
            BpmnFlowElement::ExclusiveGateway(_) | BpmnFlowElement::InclusiveGateway(_)
        ) {
            continue;
        }
        let id = &node.base().id;
        if !ctx
            .outgoing(id)
            .iter()
            .any(|f| f.flow.condition_expression.is_some())
        {
            continue;
        }
        ctx.report(
            "conditional-flow-source",
            id,
            "Conditional sequence flows are only supported at exclusive or inclusive gateway"
                .into(),
            "Remove the condition or route the flow through an exclusive or inclusive gateway.",
        );
    }
}

fn condition_expression(ctx: &mut ZeebeContext) {
    for entry in ctx.flows.clone() {
        let flow = entry.flow;
        let Some(text) = expression_text(flow.condition_expression.as_ref()) else {
            continue;
        };
        let Some(problem) = non_static_problem(text) else {
            continue;
        };
        ctx.report(
            "condition-expression",
            &flow.id,
            problem,
            "Write the condition as a FEEL expression that starts with '='.",
        );
    }
}

fn duplicates(values: &[String]) -> Vec<String> {
    let mut seen: Vec<&String> = vec![];
    let mut out: Vec<String> = vec![];
    for v in values {
        if seen.contains(&v) && !out.contains(v) {
            out.push(v.clone());
        }
        seen.push(v);
    }
    out
}

fn event_based_gateway(ctx: &mut ZeebeContext) {
    for entry in ctx.nodes.clone() {
        let node = entry.node;
        if !matches!(node, BpmnFlowElement::EventBasedGateway(_)) {
            continue;
        }
        let id = &node.base().id;
        let outgoing = ctx.outgoing(id);
        if outgoing.len() < 2 {
            ctx.report(
                "event-based-gateway-outgoing",
                id,
                "Event-based gateway must have at least 2 outgoing sequence flows.".into(),
                "Add a second outgoing flow to a catch event.",
            );
        }
        let targets: Vec<Option<&BpmnFlowElement>> = outgoing
            .iter()
            .map(|f| ctx.node(Some(&f.flow.target_ref)).map(|n| n.node))
            .collect();
        let valid = targets.iter().all(|t| match t {
            Some(BpmnFlowElement::IntermediateCatchEvent(e)) => {
                match e.event_definitions.as_slice() {
                    [only] => matches!(
                        only,
                        BpmnEventDefinition::Timer(_)
                            | BpmnEventDefinition::Message(_)
                            | BpmnEventDefinition::Signal(_)
                            | BpmnEventDefinition::Conditional(_)
                    ),
                    _ => false,
                }
            }
            _ => false,
        });
        if !valid {
            ctx.report(
                "event-based-gateway-target",
                id,
                "Event-based gateway must not have an outgoing sequence flow to other elements than message/timer/signal/conditional intermediate catch events.".into(),
                "Route each flow to an intermediate catch event with one message, timer, signal or conditional definition.",
            );
        }
        let mut message_names: Vec<String> = vec![];
        let mut signal_names: Vec<String> = vec![];
        for t in targets.iter().flatten() {
            let BpmnFlowElement::IntermediateCatchEvent(e) = t else {
                continue;
            };
            for def in &e.event_definitions {
                match def {
                    BpmnEventDefinition::Message(m) => {
                        if let Some(name) = ctx
                            .message(m.message_ref.as_deref())
                            .and_then(|m| m.name.as_ref())
                            .filter(|n| !n.is_empty())
                        {
                            message_names.push(name.clone());
                        }
                    }
                    BpmnEventDefinition::Signal(s) => {
                        if let Some(name) = ctx
                            .signal(s.signal_ref.as_deref())
                            .and_then(|s| s.name.as_ref())
                            .filter(|n| !n.is_empty())
                        {
                            signal_names.push(name.clone());
                        }
                    }
                    _ => {}
                }
            }
        }
        for name in duplicates(&message_names) {
            ctx.report(
                "event-based-gateway-duplicate-trigger",
                id,
                format!("Multiple message event definitions with the same name '{name}' are not allowed."),
                "Give each branch of the event-based gateway a different message.",
            );
        }
        for name in duplicates(&signal_names) {
            ctx.report(
                "event-based-gateway-duplicate-trigger",
                id,
                format!("Multiple signal event definitions with the same name '{name}' are not allowed."),
                "Give each branch of the event-based gateway a different signal.",
            );
        }
        // Duplicate conditions are Z60 (event-based-gateway-duplicate-condition, events.ts).
        let shared = outgoing.iter().any(|f| {
            ctx.incoming(&f.flow.target_ref)
                .iter()
                .any(|i| i.flow.source_ref != *id)
        });
        if shared {
            ctx.report(
                "event-based-gateway-target-incoming",
                id,
                "Target elements of an event gateway must not have any additional incoming sequence flows other than that from the event gateway.".into(),
                "Remove the other incoming flows of the catch events behind the gateway.",
            );
        }
    }
}

/// The `eventType` of every listener of an element with exactly one `zeebe:executionListeners`.
fn listener_event_types(ctx: &ZeebeContext, extension_elements: &[XmlElement]) -> Vec<String> {
    let lists = ctx.zeebe(extension_elements, "executionListeners");
    let [only] = lists.as_slice() else {
        return vec![];
    };
    ctx.zeebe_children(Some(only), "executionListener")
        .iter()
        .map(|l| l.attributes.get("eventType").cloned().unwrap_or_default())
        .collect()
}

fn gateway_end_listener(ctx: &mut ZeebeContext) {
    for entry in ctx.nodes.clone() {
        let node = entry.node;
        if !is_gateway(node)
            || !listener_event_types(ctx, &node.base().extension_elements)
                .iter()
                .any(|t| t == "end")
        {
            continue;
        }
        ctx.report(
            "gateway-end-listener",
            &node.base().id,
            "Execution listeners of type 'end' are not supported by gateway element".into(),
            "Use a 'start' execution listener or move the listener to a neighbouring element.",
        );
    }
}

// K: multi-instance -----------------------------------------------------------

fn multi_instance(ctx: &mut ZeebeContext) {
    for entry in ctx.nodes.clone() {
        let node = entry.node;
        let Some(loop_) = node.loop_characteristics() else {
            continue;
        };
        let id = &node.base().id;
        let configs = ctx.zeebe(&loop_.extension_elements, "loopCharacteristics");
        if configs.len() != 1 {
            ctx.report(
                "multi-instance-loop-characteristics",
                id,
                "Must have exactly one 'zeebe:loopCharacteristics' extension element".into(),
                "Add a single zeebe:loopCharacteristics element to the multi-instance loop.",
            );
        }
        for config in configs {
            let input = attr(&config.attributes, "inputCollection");
            if input.is_none() {
                ctx.report(
                    "multi-instance-input-collection",
                    id,
                    "Attribute 'inputCollection' must be present and not empty".into(),
                    "Set inputCollection to the FEEL expression of the collection to iterate.",
                );
            }
            let output_collection = attr(&config.attributes, "outputCollection");
            let output_element = attr(&config.attributes, "outputElement");
            if output_collection.is_some() && output_element.is_none() {
                ctx.report(
                    "multi-instance-output-pair",
                    id,
                    "Attribute 'outputElement' must be present if the attribute 'outputCollection' is set".into(),
                    "Set outputElement or remove outputCollection.",
                );
            } else if output_element.is_some() && output_collection.is_none() {
                ctx.report(
                    "multi-instance-output-pair",
                    id,
                    "Attribute 'outputCollection' must be present if the attribute 'outputElement' is set".into(),
                    "Set outputCollection or remove outputElement.",
                );
            }
            // A missing inputCollection is Zeebe's "Expected expression but not found." (Z168), not ours.
            for value in [input, output_element].into_iter().flatten() {
                let Some(problem) = non_static_problem(value) else {
                    continue;
                };
                ctx.report(
                    "multi-instance-expression",
                    id,
                    problem,
                    "Write the value as a FEEL expression that starts with '='.",
                );
            }
        }
        // The completion condition may be static; only a '=' expression is parsed.
        if let Some(completion) = expression_text(loop_.completion_condition.as_ref()) {
            if is_expression(completion) && feel_error(completion).is_some() {
                ctx.report(
                    "multi-instance-expression",
                    id,
                    feel_failure(completion),
                    "Fix the FEEL syntax of the completion condition.",
                );
            }
        }
    }
}

fn before_all_listener(ctx: &mut ZeebeContext) {
    let check = |ctx: &mut ZeebeContext,
                 id: &str,
                 type_: &str,
                 extension_elements: &[XmlElement],
                 multi: bool| {
        if multi
            || !listener_event_types(ctx, extension_elements)
                .iter()
                .any(|t| t == "beforeAll")
        {
            return;
        }
        ctx.report(
            "before-all-listener",
            id,
            format!("Execution listeners with event type 'beforeAll' are only supported on multi-instance activities and are not valid on '{type_}'"),
            "Remove the beforeAll listener or make the activity multi-instance.",
        );
    };
    let defs = ctx.defs;
    for process in &defs.processes {
        check(
            ctx,
            &process.id,
            "process",
            &process.extension_elements,
            false,
        );
    }
    for entry in ctx.nodes.clone() {
        let node = entry.node;
        // Zeebe has one `subProcess` type for embedded and event sub-processes.
        let type_ = match node {
            BpmnFlowElement::EventSubProcess(_) => "subProcess",
            other => other.type_name(),
        };
        check(
            ctx,
            &node.base().id,
            type_,
            &node.base().extension_elements,
            node.loop_characteristics().is_some(),
        );
    }
}

// L: sub-processes and ad-hoc ---------------------------------------------------

fn sub_process_start(ctx: &mut ZeebeContext) {
    for scope in ctx.scopes.clone() {
        let Some(container) = scope.container else {
            continue;
        };
        let id = &container.base().id;
        let starts: Vec<&BpmnFlowElement> = scope
            .contents
            .flow_elements
            .iter()
            .filter(|n| matches!(n, BpmnFlowElement::StartEvent(_)))
            .collect();
        if starts.len() != 1 && scope.kind != ScopeKind::AdHocSubProcess {
            ctx.report(
                "sub-process-start-event",
                id,
                "Must have exactly one start event".into(),
                "Give the sub-process exactly one start event.",
            );
        }
        if let Some(BpmnFlowElement::StartEvent(first)) = starts.first() {
            if scope.kind != ScopeKind::EventSubProcess && !first.event_definitions.is_empty() {
                ctx.report(
                    "sub-process-start-none",
                    id,
                    "Start events in subprocesses must be of type none".into(),
                    "Use a none start event inside an embedded sub-process.",
                );
            }
        }
    }
}

fn ad_hoc_structure(ctx: &mut ZeebeContext) {
    for scope in ctx.scopes.clone() {
        let Some(container) = scope.container else {
            continue;
        };
        if scope.kind != ScopeKind::AdHocSubProcess {
            continue;
        }
        let id = &container.base().id;
        let elements = &scope.contents.flow_elements;
        if elements.is_empty() && scope.contents.sequence_flows.is_empty() {
            ctx.report(
                "ad-hoc-activity",
                id,
                "Must have at least one activity.".into(),
                "Add at least one activity to the ad-hoc sub-process.",
            );
        }
        if elements
            .iter()
            .any(|n| matches!(n, BpmnFlowElement::StartEvent(_)))
        {
            ctx.report(
                "ad-hoc-start-event",
                id,
                "Must not contain a start event.".into(),
                "Remove the start event from the ad-hoc sub-process.",
            );
        }
        if elements
            .iter()
            .any(|n| matches!(n, BpmnFlowElement::EndEvent(_)))
        {
            ctx.report(
                "ad-hoc-end-event",
                id,
                "Must not contain an end event.".into(),
                "Remove the end event from the ad-hoc sub-process.",
            );
        }
    }
}

fn ad_hoc_extensions(ctx: &mut ZeebeContext) {
    for entry in ctx.nodes.clone() {
        let BpmnFlowElement::AdHocSubProcess(node) = entry.node else {
            continue;
        };
        let id = &node.base.id;
        let ext = &node.base.extension_elements;
        let ad_hocs = ctx.zeebe(ext, "adHoc");
        if !ctx.zeebe(ext, "taskDefinition").is_empty() {
            if node.cancel_remaining_instances == Some(false) {
                ctx.report(
                    "ad-hoc-agent-cancel-remaining",
                    id,
                    "Must not define cancelRemainingInstances in combination with zeebe:taskDefinition.".into(),
                    "Remove cancelRemainingInstances or the task definition.",
                );
            }
            if node.completion_condition.is_some() {
                ctx.report(
                    "ad-hoc-agent-completion-condition",
                    id,
                    "Must not define completionCondition in combination with zeebe:taskDefinition."
                        .into(),
                    "Remove the completion condition or the task definition.",
                );
            }
            if let Some(first) = ad_hocs.first() {
                if attr(&first.attributes, "activeElementsCollection").is_some() {
                    ctx.report(
                        "ad-hoc-agent-active-elements",
                        id,
                        "Must not define activeElementsCollection in combination with zeebe:taskDefinition.".into(),
                        "Remove activeElementsCollection or the task definition.",
                    );
                }
            }
        }
        for ad_hoc in &ad_hocs {
            let element = attr(&ad_hoc.attributes, "outputElement");
            let collection = attr(&ad_hoc.attributes, "outputCollection");
            if element.is_none() != collection.is_none() {
                ctx.report(
                    "ad-hoc-output-pair",
                    id,
                    format!(
                        "OutputElement and OutputCollection must both be set, or neither of them set. outputElement:{} and outputCollection:{}.",
                        element.unwrap_or("null"),
                        collection.unwrap_or("null")
                    ),
                    "Set both outputElement and outputCollection or neither.",
                );
            }
        }
        let mut values: Vec<Option<&str>> =
            vec![expression_text(node.completion_condition.as_ref())];
        for a in &ad_hocs {
            values.push(attr(&a.attributes, "activeElementsCollection"));
            values.push(attr(&a.attributes, "outputElement"));
        }
        for value in values.into_iter().flatten() {
            let Some(problem) = non_static_problem(value) else {
                continue;
            };
            ctx.report(
                "ad-hoc-expression",
                id,
                problem,
                "Write the value as a FEEL expression that starts with '='.",
            );
        }
        if ad_hocs.len() > 1 {
            ctx.report(
                "duplicate-ad-hoc-extension",
                id,
                "Must have exactly one 'zeebe:adHoc' extension element when exists. Please check process definition XML and retain only one extension element.".into(),
                "Keep a single zeebe:adHoc extension element.",
            );
        }
    }
}

pub(super) fn check(ctx: &mut ZeebeContext) {
    default_source(ctx);
    flow_condition(ctx);
    conditional_flow_source(ctx);
    condition_expression(ctx);
    event_based_gateway(ctx);
    gateway_end_listener(ctx);
    multi_instance(ctx);
    before_all_listener(ctx);
    sub_process_start(ctx);
    ad_hoc_structure(ctx);
    ad_hoc_extensions(ctx);
}
