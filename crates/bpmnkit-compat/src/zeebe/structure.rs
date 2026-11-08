//! Twin of `zeebe-validate/rules/structure.ts`.

use super::context::{Scope, ZeebeContext};
use crate::compat::pattern::js_trim;
use bpmnkit_bpmn::{
    BpmnDefinitions, BpmnEventDefinition, BpmnFlowElement, BpmnLaneSet, BpmnProcess, BpmnStartEvent,
};
use bpmnkit_xml::XmlElement;
use std::collections::HashSet;

fn event_definitions(node: &BpmnFlowElement) -> &[BpmnEventDefinition] {
    node.event_definitions().unwrap_or(&[])
}

fn is_event_sub_process(node: &BpmnFlowElement) -> bool {
    match node {
        BpmnFlowElement::EventSubProcess(_) => true,
        BpmnFlowElement::SubProcess(s) => s.triggered_by_event == Some(true),
        _ => false,
    }
}

fn is_activity(node: &BpmnFlowElement) -> bool {
    use BpmnFlowElement::*;
    matches!(
        node,
        Task(_)
            | ServiceTask(_)
            | UserTask(_)
            | ScriptTask(_)
            | SendTask(_)
            | ReceiveTask(_)
            | BusinessRuleTask(_)
            | ManualTask(_)
            | CallActivity(_)
            | SubProcess(_)
            | AdHocSubProcess(_)
            | EventSubProcess(_)
            | Transaction(_)
    )
}

fn children(node: &BpmnFlowElement) -> &[BpmnFlowElement] {
    node.contents().map_or(&[], |c| c.flow_elements.as_slice())
}

fn start_events(elements: &[BpmnFlowElement]) -> Vec<&BpmnStartEvent> {
    elements
        .iter()
        .filter_map(|e| match e {
            BpmnFlowElement::StartEvent(s) => Some(s),
            _ => None,
        })
        .collect()
}

fn executable(defs: &BpmnDefinitions) -> HashSet<&str> {
    defs.processes
        .iter()
        .filter(|p| p.is_executable == Some(true))
        .map(|p| p.id.as_str())
        .collect()
}

fn executable_processes(defs: &BpmnDefinitions) -> Vec<&BpmnProcess> {
    defs.processes
        .iter()
        .filter(|p| p.is_executable == Some(true))
        .collect()
}

fn scopes<'a>(ctx: &ZeebeContext<'a>) -> Vec<Scope<'a>> {
    let ids = executable(ctx.defs);
    ctx.scopes
        .iter()
        .filter(|s| ids.contains(s.process_id))
        .copied()
        .collect()
}

/// Nodes of executable processes, with the index of their scope.
fn nodes<'a>(ctx: &ZeebeContext<'a>) -> Vec<(&'a BpmnFlowElement, usize)> {
    let ids = executable(ctx.defs);
    ctx.nodes
        .iter()
        .filter(|n| ids.contains(ctx.scopes[n.scope].process_id))
        .map(|n| (n.node, n.scope))
        .collect()
}

fn descendants<'a>(el: &'a XmlElement, out: &mut Vec<&'a XmlElement>) {
    out.push(el);
    for child in &el.children {
        descendants(child, out);
    }
}

fn local_name(name: &str) -> &str {
    name.split_once(':').map_or(name, |(_, rest)| rest)
}

const MODEL: &str = "http://www.omg.org/spec/BPMN/20100524/MODEL";

/// Whether a verbatim element name is in the BPMN model namespace.
fn is_bpmn(ctx: &ZeebeContext, name: &str) -> bool {
    let prefix = name.split_once(':').map_or("", |(p, _)| p);
    match ctx.defs.namespaces.get(prefix) {
        Some(uri) => uri == MODEL,
        None => prefix == "bpmn",
    }
}

/// BPMN elements BPMN Kit keeps verbatim whose `name` Zeebe's NameLengthValidator checks.
const NAMED: &[&str] = &[
    "dataInput",
    "dataOutput",
    "dataState",
    "dataStore",
    "inputSet",
    "outputSet",
    "interface",
    "operation",
    "resource",
    "resourceParameter",
    "resourceRole",
    "performer",
    "humanPerformer",
    "potentialOwner",
    "correlationKey",
    "correlationProperty",
    "property",
    "lane",
    "laneSet",
    "category",
];

// ---------------------------------------------------------------------------
// A. ids, executable processes, lengths
// ---------------------------------------------------------------------------

const ID_MESSAGE: &str = "Element id must be present and not empty.";
const ID_SUGGESTION: &str = "Give the element a non-empty id.";

fn id_present(ctx: &mut ZeebeContext) {
    let defs = ctx.defs;
    for process in executable_processes(defs) {
        if process.id.is_empty() {
            ctx.report("id-present", "", ID_MESSAGE.into(), ID_SUGGESTION);
        }
        for form in ctx.zeebe(&process.extension_elements, "userTaskForm") {
            if form.attributes.get("id").is_none_or(|v| v.is_empty()) {
                ctx.report("id-present", &process.id, ID_MESSAGE.into(), ID_SUGGESTION);
            }
        }
    }
    for (node, scope) in nodes(ctx) {
        if node.base().id.is_empty() {
            let id = ctx.scopes[scope].id;
            ctx.report("id-present", id, ID_MESSAGE.into(), ID_SUGGESTION);
        }
    }
    let ids = executable(defs);
    for entry in ctx.flows.clone() {
        let scope = ctx.scopes[entry.scope];
        if entry.flow.id.is_empty() && ids.contains(scope.process_id) {
            ctx.report("id-present", scope.id, ID_MESSAGE.into(), ID_SUGGESTION);
        }
    }
    let root_ids = defs
        .messages
        .iter()
        .map(|m| m.id.as_str())
        .chain(defs.signals.iter().map(|m| m.id.as_str()))
        .chain(defs.escalations.iter().map(|m| m.id.as_str()));
    for id in root_ids {
        if id.is_empty() {
            ctx.report("id-present", "", ID_MESSAGE.into(), ID_SUGGESTION);
        }
    }
}

fn executable_process(ctx: &mut ZeebeContext) {
    if executable_processes(ctx.defs).is_empty() {
        let id = ctx.defs.id.clone();
        ctx.report(
            "executable-process",
            &id,
            "Must contain at least one executable process".into(),
            "Mark the process isExecutable=\"true\".",
        );
    }
}

struct Target {
    owner: String,
    id: Option<String>,
    name: Option<String>,
}

fn target(owner: &str, id: Option<&str>, name: Option<&str>) -> Target {
    Target {
        owner: owner.to_string(),
        id: id.map(str::to_string),
        name: name.map(str::to_string),
    }
}

/// zeebe:property names in extension elements; ids and names of the BPMN
/// elements BPMN Kit keeps verbatim.
fn xml_targets(
    ctx: &ZeebeContext,
    out: &mut Vec<Target>,
    owner: &str,
    trees: &[XmlElement],
    verbatim: bool,
) {
    for tree in trees {
        let mut all = vec![];
        descendants(tree, &mut all);
        for el in all {
            if ctx.is_zeebe(&el.name, "property") {
                out.push(target(
                    owner,
                    None,
                    el.attributes.get("name").map(String::as_str),
                ));
            } else if verbatim && is_bpmn(ctx, &el.name) {
                let name = if NAMED.contains(&local_name(&el.name)) {
                    el.attributes.get("name").map(String::as_str)
                } else {
                    None
                };
                out.push(target(
                    owner,
                    el.attributes.get("id").map(String::as_str),
                    name,
                ));
            }
        }
    }
}

fn lane_set_targets(out: &mut Vec<Target>, owner: &str, set: Option<&BpmnLaneSet>) {
    let Some(set) = set else { return };
    out.push(target(owner, set.id.as_deref(), set.name.as_deref()));
    for lane in &set.lanes {
        out.push(target(&lane.id, Some(&lane.id), lane.name.as_deref()));
        lane_set_targets(out, &lane.id, lane.child_lane_set.as_ref());
    }
}

/// Every id and name Zeebe checks the configured length of, with the element a
/// finding names.
fn length_targets(ctx: &ZeebeContext) -> Vec<Target> {
    let defs = ctx.defs;
    let mut out: Vec<Target> = vec![];
    let ids = executable(defs);
    for process in &defs.processes {
        if !ids.contains(process.id.as_str()) {
            continue;
        }
        out.push(target(
            &process.id,
            Some(&process.id),
            process.name.as_deref(),
        ));
        lane_set_targets(&mut out, &process.id, process.lane_set.as_ref());
        xml_targets(
            ctx,
            &mut out,
            &process.id,
            &process.extension_elements,
            false,
        );
        xml_targets(ctx, &mut out, &process.id, &process.unknown_children, true);
    }
    for scope in scopes(ctx) {
        let contents = match scope.container {
            Some(_) => scope.contents,
            None => defs
                .processes
                .iter()
                .find(|p| p.id == scope.id)
                .map_or(scope.contents, |p| &p.contents),
        };
        let artifact_ids = contents
            .text_annotations
            .iter()
            .map(|a| a.id.as_str())
            .chain(contents.associations.iter().map(|a| a.id.as_str()))
            .chain(contents.groups.iter().map(|a| a.id.as_str()));
        for id in artifact_ids {
            out.push(target(id, Some(id), None));
        }
    }
    for (node, _) in nodes(ctx) {
        let base = node.base();
        out.push(target(&base.id, Some(&base.id), base.name.as_deref()));
        for def in event_definitions(node) {
            out.push(target(&base.id, def.id(), None));
            if let BpmnEventDefinition::Link(l) = def {
                out.push(target(&base.id, None, l.name.as_deref()));
            }
        }
        if let Some(l) = node.loop_characteristics() {
            out.push(target(&base.id, l.id.as_deref(), None));
        }
        for p in &base.properties {
            out.push(target(&base.id, p.id.as_deref(), p.name.as_deref()));
        }
        for a in base
            .data_input_associations
            .iter()
            .chain(&base.data_output_associations)
        {
            out.push(target(&base.id, a.id.as_deref(), None));
        }
        xml_targets(ctx, &mut out, &base.id, &base.extension_elements, false);
        xml_targets(ctx, &mut out, &base.id, &base.unknown_children, true);
    }
    for entry in &ctx.flows {
        if !ids.contains(ctx.scopes[entry.scope].process_id) {
            continue;
        }
        let flow = entry.flow;
        out.push(target(&flow.id, Some(&flow.id), flow.name.as_deref()));
        if let Some(c) = &flow.condition_expression {
            out.push(target(
                &flow.id,
                c.attributes.get("id").map(String::as_str),
                None,
            ));
        }
        xml_targets(ctx, &mut out, &flow.id, &flow.extension_elements, false);
    }
    macro_rules! roots {
        ($list:expr) => {
            for el in $list {
                out.push(target(&el.id, Some(&el.id), el.name.as_deref()));
                xml_targets(
                    ctx,
                    &mut out,
                    &el.id,
                    el.extension_elements.as_deref().unwrap_or(&[]),
                    false,
                );
            }
        };
    }
    roots!(&defs.messages);
    roots!(&defs.errors);
    roots!(&defs.signals);
    roots!(&defs.escalations);
    for c in &defs.collaborations {
        out.push(target(&c.id, Some(&c.id), c.name.as_deref()));
        for p in &c.participants {
            out.push(target(&p.id, Some(&p.id), p.name.as_deref()));
        }
        for f in &c.message_flows {
            out.push(target(&f.id, Some(&f.id), f.name.as_deref()));
        }
        let artifact_ids = c
            .text_annotations
            .iter()
            .map(|a| a.id.as_str())
            .chain(c.associations.iter().map(|a| a.id.as_str()))
            .chain(c.groups.iter().map(|a| a.id.as_str()));
        for id in artifact_ids {
            out.push(target(id, Some(id), None));
        }
    }
    for root in &defs.unknown_children {
        let owner = root.attributes.get("id").unwrap_or(&defs.id);
        xml_targets(ctx, &mut out, owner, std::slice::from_ref(root), true);
    }
    for cat in &defs.categories {
        out.push(target(
            cat.id.as_deref().unwrap_or(""),
            cat.id.as_deref(),
            cat.name.as_deref(),
        ));
        for v in &cat.category_values {
            out.push(target(&v.id, Some(&v.id), None));
        }
    }
    out.push(target(
        &defs.id,
        None,
        defs.unknown_attributes.get("name").map(String::as_str),
    ));
    out
}

/// UTF-16 length, as JS `String.length`.
fn js_len(s: &str) -> usize {
    s.encode_utf16().count()
}

fn lengths(ctx: &mut ZeebeContext) {
    let limits = ctx.limits;
    for t in length_targets(ctx) {
        if t.id
            .as_deref()
            .is_some_and(|id| js_len(id) > limits.max_id_length)
        {
            let max = limits.max_id_length;
            ctx.report(
                "id-length",
                &t.owner,
                format!(
                    "IDs must not be longer than the configured max-id-length of {max} characters."
                ),
                &format!("Shorten the id to at most {max} characters."),
            );
        }
        if t.name
            .as_deref()
            .is_some_and(|n| js_len(n) > limits.max_name_length)
        {
            let max = limits.max_name_length;
            ctx.report(
                "name-length",
                &t.owner,
                format!("Names must not be longer than the configured max-name-length of {max} characters."),
                &format!("Shorten the name to at most {max} characters."),
            );
        }
    }
    for (node, _) in nodes(ctx) {
        let base = node.base();
        for td in ctx.zeebe(&base.extension_elements, "taskDefinition") {
            if let Some(ty) = td.attributes.get("type") {
                let max = limits.max_worker_type_length;
                if js_len(ty) > max {
                    ctx.report(
                        "worker-type-length",
                        &base.id,
                        format!("Worker types must not be longer than the configured max-worker-type-length of {max} characters."),
                        &format!("Shorten the job type to at most {max} characters."),
                    );
                }
            }
        }
    }
}

// ---------------------------------------------------------------------------
// B. supported elements and event definitions
// ---------------------------------------------------------------------------

/// Flow elements Zeebe rejects, by BPMN Kit type or verbatim XML name, with Zeebe's class name.
fn unsupported(name: &str) -> Option<&'static str> {
    match name {
        "complexGateway" => Some("ComplexGateway"),
        "transaction" => Some("Transaction"),
        "implicitThrowEvent" => Some("ImplicitThrowEvent"),
        "callChoreography" => Some("CallChoreography"),
        "choreographyTask" => Some("ChoreographyTask"),
        "subChoreography" => Some("SubChoreography"),
        _ => None,
    }
}

fn unsupported_message(ty: &str) -> String {
    format!("Elements of type '{ty}' are currently not supported. Please refer to the documentation for a list of supported elements: https://docs.camunda.io/docs/components/modeler/bpmn/bpmn-coverage/")
}

fn element_type(ctx: &mut ZeebeContext) {
    for (node, _) in nodes(ctx) {
        if let Some(ty) = unsupported(node.type_name()) {
            ctx.report(
                "element-type",
                &node.base().id,
                unsupported_message(ty),
                "Use an element Zeebe supports.",
            );
        }
    }
    // Flow elements BPMN Kit does not model stay verbatim in the container's unknown children.
    let defs = ctx.defs;
    for scope in scopes(ctx) {
        let unknown: &[XmlElement] = match scope.container {
            Some(c) => &c.base().unknown_children,
            None => defs
                .processes
                .iter()
                .find(|p| p.id == scope.id)
                .map_or(&[], |p| p.unknown_children.as_slice()),
        };
        for el in unknown {
            if let Some(ty) = unsupported(local_name(&el.name)) {
                if el.name.starts_with("bpmn:") || !el.name.contains(':') {
                    let id = el.attributes.get("id").map_or(scope.id, String::as_str);
                    ctx.report(
                        "element-type",
                        id,
                        unsupported_message(ty),
                        "Use an element Zeebe supports.",
                    );
                }
            }
        }
    }
}

const SUPPORTED_DEFINITIONS: &[&str] = &[
    "message",
    "timer",
    "error",
    "terminate",
    "signal",
    "link",
    "escalation",
    "compensate",
    "conditional",
];

fn event_definition_type(ctx: &mut ZeebeContext) {
    for (node, _) in nodes(ctx) {
        for def in event_definitions(node) {
            if !SUPPORTED_DEFINITIONS.contains(&def.type_name()) {
                ctx.report(
                    "event-definition-type",
                    &node.base().id,
                    "Event definition of this type is not supported".into(),
                    "Use an event definition Zeebe supports.",
                );
            }
        }
    }
}

const ESP_START_TYPES: &[&str] = &[
    "timer",
    "message",
    "error",
    "signal",
    "escalation",
    "conditional",
];
const NON_INTERRUPTING_TYPES: &[&str] =
    &["message", "timer", "signal", "escalation", "conditional"];
const NON_INTERRUPTING: &str = "Non-Interrupting event of this type is not allowed";

/// Zeebe validates the first start event of an event sub-process (`SubProcessValidator`).
fn event_sub_process_start(ctx: &mut ZeebeContext) {
    for (node, _) in nodes(ctx) {
        if !is_event_sub_process(node) {
            continue;
        }
        let Some(start) = start_events(children(node)).into_iter().next() else {
            continue;
        };
        for def in &start.event_definitions {
            let ty = def.type_name();
            if !ESP_START_TYPES.contains(&ty) {
                ctx.report(
                    "event-sub-process-start-type",
                    &node.base().id,
                    "Start events in event subprocesses must be one of: message, timer, error, signal, escalation or conditional".into(),
                    "Give the event sub-process start event a message, timer, error, signal, escalation or conditional definition.",
                );
            }
            if start.is_interrupting == Some(false) && !NON_INTERRUPTING_TYPES.contains(&ty) {
                ctx.report(
                    "non-interrupting-type",
                    &node.base().id,
                    NON_INTERRUPTING.into(),
                    "Make the start event interrupting, or use a message, timer, signal, escalation or conditional trigger.",
                );
            }
        }
    }
}

const ICE_TYPES: &[&str] = &["message", "timer", "signal", "link", "conditional"];
const BOUNDARY_TYPES: &[&str] = &[
    "timer",
    "message",
    "error",
    "signal",
    "escalation",
    "compensate",
    "conditional",
];
const END_TYPES: &[&str] = &[
    "error",
    "message",
    "terminate",
    "signal",
    "escalation",
    "compensate",
];

fn event_types(ctx: &mut ZeebeContext) {
    for (node, _) in nodes(ctx) {
        let id = &node.base().id;
        match node {
            BpmnFlowElement::IntermediateCatchEvent(e) => {
                if let [only] = e.event_definitions.as_slice() {
                    if !ICE_TYPES.contains(&only.type_name()) {
                        ctx.report(
                            "intermediate-catch-type",
                            id,
                            "Event definition must be one of: message, timer, signal, link or conditional".into(),
                            "Use a message, timer, signal, link or conditional catch event.",
                        );
                    }
                }
            }
            BpmnFlowElement::BoundaryEvent(e) => {
                for def in &e.event_definitions {
                    if !BOUNDARY_TYPES.contains(&def.type_name()) {
                        ctx.report(
                            "boundary-type",
                            id,
                            "Boundary events must be one of: timer, message, error, signal, escalation, conditional".into(),
                            "Use a timer, message, error, signal, escalation, compensation or conditional boundary event.",
                        );
                    }
                }
            }
            BpmnFlowElement::EndEvent(e) => {
                for def in &e.event_definitions {
                    if !END_TYPES.contains(&def.type_name()) {
                        ctx.report(
                            "end-event-type",
                            id,
                            "End events must be one of: none, error, message, terminate, signal, escalation or compensation".into(),
                            "Use a none, error, message, terminate, signal, escalation or compensation end event.",
                        );
                    }
                }
            }
            _ => {}
        }
    }
}

fn boundary_events(ctx: &mut ZeebeContext) {
    for (node, _) in nodes(ctx) {
        let BpmnFlowElement::BoundaryEvent(b) = node else {
            continue;
        };
        let interrupting = b.cancel_activity != Some(false);
        for def in &b.event_definitions {
            if matches!(def, BpmnEventDefinition::Escalation(_)) {
                let host = ctx.node(Some(&b.attached_to_ref)).map(|n| n.node);
                let supported = matches!(
                    host,
                    Some(
                        BpmnFlowElement::SubProcess(_)
                            | BpmnFlowElement::EventSubProcess(_)
                            | BpmnFlowElement::AdHocSubProcess(_)
                            | BpmnFlowElement::Transaction(_)
                            | BpmnFlowElement::CallActivity(_)
                    )
                );
                if !supported {
                    ctx.report(
                        "escalation-boundary-host",
                        &b.base.id,
                        "An escalation boundary event should only be attached to a subprocess, or a call activity.".into(),
                        "Attach the escalation boundary event to a sub-process or a call activity.",
                    );
                }
            }
            if !interrupting && !NON_INTERRUPTING_TYPES.contains(&def.type_name()) {
                ctx.report(
                    "non-interrupting-type",
                    &b.base.id,
                    NON_INTERRUPTING.into(),
                    "Make the boundary event interrupting, or use a message, timer, signal, escalation or conditional trigger.",
                );
            }
        }
    }
}

// ---------------------------------------------------------------------------
// C. start events and duplicate triggers per scope (ModelUtil)
// ---------------------------------------------------------------------------

/// Each value that occurs more than once, in first-occurrence order.
fn duplicates<T: PartialEq + Clone>(values: &[T]) -> Vec<T> {
    let mut out: Vec<T> = vec![];
    for (i, v) in values.iter().enumerate() {
        let first = values.iter().position(|x| x == v) == Some(i);
        if !first && !out.contains(v) {
            out.push(v.clone());
        }
    }
    out
}

fn process_start_events(ctx: &mut ZeebeContext) {
    for process in executable_processes(ctx.defs) {
        let starts = start_events(&process.contents.flow_elements);
        if starts.is_empty() {
            ctx.report(
                "process-start-event",
                &process.id,
                "Must have at least one start event".into(),
                "Add a start event to the process.",
            );
        } else if starts
            .iter()
            .filter(|s| s.event_definitions.is_empty())
            .count()
            > 1
        {
            ctx.report(
                "multiple-none-start",
                &process.id,
                "Multiple none start events are not allowed".into(),
                "Keep one none start event and give the others a trigger.",
            );
        }
    }
}

fn message_names(ctx: &ZeebeContext, defs: &[&BpmnEventDefinition]) -> Vec<String> {
    defs.iter()
        .filter_map(|d| match d {
            BpmnEventDefinition::Message(m) => ctx
                .message(m.message_ref.as_deref())
                .and_then(|m| m.name.clone())
                .filter(|n| !n.is_empty()),
            _ => None,
        })
        .collect()
}

fn signal_names(ctx: &ZeebeContext, defs: &[&BpmnEventDefinition]) -> Vec<String> {
    defs.iter()
        .filter_map(|d| match d {
            BpmnEventDefinition::Signal(s) => ctx
                .signal(s.signal_ref.as_deref())
                .and_then(|s| s.name.clone())
                .filter(|n| !n.is_empty()),
            _ => None,
        })
        .collect()
}

fn link_names(defs: &[&BpmnEventDefinition]) -> Vec<String> {
    defs.iter()
        .filter_map(|d| match d {
            BpmnEventDefinition::Link(l) => l.name.clone().filter(|n| !n.is_empty()),
            _ => None,
        })
        .collect()
}

/// `ModelUtil.verifyNoDuplicatedEventDefinition`: message, signal and link names.
fn verify_names(
    ctx: &mut ZeebeContext,
    rule: &str,
    owner: &str,
    definitions: &[&BpmnEventDefinition],
) {
    for name in duplicates(&message_names(ctx, definitions)) {
        ctx.report(
            rule,
            owner,
            format!(
                "Multiple message event definitions with the same name '{name}' are not allowed."
            ),
            "Use a different message for each of these events.",
        );
    }
    for name in duplicates(&signal_names(ctx, definitions)) {
        ctx.report(
            rule,
            owner,
            format!(
                "Multiple signal event definitions with the same name '{name}' are not allowed."
            ),
            "Use a different signal for each of these events.",
        );
    }
    for name in duplicates(&link_names(definitions)) {
        ctx.report(
            rule,
            owner,
            format!("Multiple intermediate catch link event definitions with the same name '{name}' are not allowed."),
            "Give each link catch event a unique name.",
        );
    }
}

/// `ModelUtil.verifyNoDuplicatedErrorHandler` and its escalation twin.
fn verify_handlers(ctx: &mut ZeebeContext, owner: &str, defs: &[&BpmnEventDefinition]) {
    // `None` is a definition whose reference does not resolve; the inner `None` is a missing code.
    let error_refs: Vec<Option<Option<String>>> = defs
        .iter()
        .filter_map(|d| match d {
            BpmnEventDefinition::Error(e) => Some(
                ctx.error(e.error_ref.as_deref())
                    .map(|x| x.error_code.clone()),
            ),
            _ => None,
        })
        .collect();
    let escalation_refs: Vec<Option<Option<String>>> = defs
        .iter()
        .filter_map(|d| match d {
            BpmnEventDefinition::Escalation(e) => Some(
                ctx.escalation(e.escalation_ref.as_deref())
                    .map(|x| x.escalation_code.clone()),
            ),
            _ => None,
        })
        .collect();
    handlers(ctx, owner, "error", &error_refs);
    handlers(ctx, owner, "escalation", &escalation_refs);
}

fn handlers(ctx: &mut ZeebeContext, owner: &str, word: &str, refs: &[Option<Option<String>>]) {
    if refs.is_empty() {
        return;
    }
    let catch_all = format!("The same scope can not contain more than one {word} catch event without {word} code. An {word} catch event without {word} code catches all {word}s.");
    let rule = if word == "error" {
        "duplicate-error-catch"
    } else {
        "duplicate-escalation-catch"
    };
    let suggestion = format!("Give each {word} catch event of the scope a different {word} code.");
    if refs.iter().filter(|r| r.is_none()).count() > 1 {
        ctx.report(rule, owner, catch_all.clone(), &suggestion);
    }
    let codes: Vec<Option<String>> = refs.iter().flatten().cloned().collect();
    let mut seen: Vec<&Option<String>> = vec![];
    for code in &codes {
        if seen.contains(&code) {
            continue;
        }
        seen.push(code);
        if codes.iter().filter(|c| *c == code).count() < 2 {
            continue;
        }
        let message = match code {
            None => catch_all.clone(),
            Some(code) => format!("Multiple {word} catch events with the same {word} code '{code}' are not supported on the same scope."),
        };
        ctx.report(rule, owner, message, &suggestion);
    }
}

/// The scope rule ProcessValidator and SubProcessValidator apply to the process
/// and to every sub-process: duplicate triggers among the start events of the
/// scope's direct event sub-processes.
fn scope_duplicates(ctx: &mut ZeebeContext) {
    for scope in scopes(ctx) {
        let esp_starts: Vec<&BpmnEventDefinition> = scope
            .contents
            .flow_elements
            .iter()
            .filter(|e| is_event_sub_process(e))
            .flat_map(|esp| start_events(children(esp)))
            .flat_map(|s| s.event_definitions.iter())
            .collect();
        verify_names(
            ctx,
            "duplicate-event-sub-process-trigger",
            scope.id,
            &esp_starts,
        );
        verify_handlers(ctx, scope.id, &esp_starts);
    }
}

fn process_start_duplicates(ctx: &mut ZeebeContext) {
    for process in executable_processes(ctx.defs) {
        let defs: Vec<&BpmnEventDefinition> = start_events(&process.contents.flow_elements)
            .into_iter()
            .flat_map(|s| s.event_definitions.iter())
            .collect();
        let signals: Vec<&BpmnEventDefinition> = defs
            .iter()
            .copied()
            .filter(|d| matches!(d, BpmnEventDefinition::Signal(_)))
            .collect();
        verify_names(ctx, "duplicate-signal-start", &process.id, &signals);
        // Start events referring to the same message count once here; MessageValidator reports those.
        let mut referred: Vec<Option<&str>> = vec![];
        let mut messages: Vec<&BpmnEventDefinition> = vec![];
        for d in defs {
            let BpmnEventDefinition::Message(m) = d else {
                continue;
            };
            let message = ctx.message(m.message_ref.as_deref()).map(|m| m.id.as_str());
            if referred.contains(&message) {
                continue;
            }
            referred.push(message);
            messages.push(d);
        }
        verify_names(ctx, "duplicate-message-start", &process.id, &messages);
    }
}

fn conditions(starts: &[&BpmnStartEvent]) -> Vec<String> {
    starts
        .iter()
        .flat_map(|s| s.event_definitions.iter())
        .filter_map(|d| match d {
            BpmnEventDefinition::Conditional(c) => c.condition.clone(),
            _ => None,
        })
        .collect()
}

fn conditional_starts(ctx: &mut ZeebeContext) {
    for process in executable_processes(ctx.defs) {
        let starts = start_events(&process.contents.flow_elements);
        for text in duplicates(&conditions(&starts)) {
            ctx.report(
                "duplicate-conditional-start",
                &process.id,
                format!("Duplicate condition expression '{text}' found in conditional start events of process '{}'. Condition expressions for conditional start events must be unique within a process.", process.id),
                "Give each conditional start event a different condition.",
            );
        }
        let esp_starts: Vec<&BpmnStartEvent> = process
            .contents
            .flow_elements
            .iter()
            .filter(|e| is_event_sub_process(e))
            .flat_map(|esp| start_events(children(esp)))
            .collect();
        for text in duplicates(&conditions(&esp_starts)) {
            ctx.report(
                "duplicate-event-sub-process-condition",
                &process.id,
                format!("Duplicate condition expression '{text}' found in conditional start events of event subprocesses in process '{}'. Condition expressions for conditional start events in event subprocesses must be unique within a process.", process.id),
                "Give each conditional event sub-process start a different condition.",
            );
        }
    }
}

/// ActivityValidator: the boundary events attached to each activity from the same scope.
fn boundary_duplicates(ctx: &mut ZeebeContext) {
    for (node, scope) in nodes(ctx) {
        if !is_activity(node) {
            continue;
        }
        let id = &node.base().id;
        let contents = ctx.scopes[scope].contents;
        let defs: Vec<&BpmnEventDefinition> = contents
            .flow_elements
            .iter()
            .filter(|e| matches!(e, BpmnFlowElement::BoundaryEvent(b) if b.attached_to_ref == *id))
            .flat_map(|e| event_definitions(e).iter())
            .collect();
        verify_names(ctx, "duplicate-boundary-trigger", id, &defs);
        verify_handlers(ctx, id, &defs);
    }
}

const PROCESS_SINGLE_EXTENSIONS: [&str; 3] = ["versionTag", "jobPriorityDefinition", "case"];

fn process_extensions(ctx: &mut ZeebeContext) {
    for process in executable_processes(ctx.defs) {
        for local in PROCESS_SINGLE_EXTENSIONS {
            // zeebe:jobPriorityDefinition and zeebe:case exist from 8.10, the version of the case marker rule.
            if local != "versionTag" && !ctx.applies("case-marker") {
                continue;
            }
            if ctx.zeebe(&process.extension_elements, local).len() > 1 {
                ctx.report(
                    "duplicate-process-extension",
                    &process.id,
                    format!("Must have exactly one 'zeebe:{local}' extension element when exists. Please check process definition XML and retain only one extension element."),
                    &format!("Keep a single zeebe:{local} on the process."),
                );
            }
        }
    }
}

fn misplaced_case(ctx: &mut ZeebeContext, owner: &str, ty: &str, ext: &[XmlElement]) {
    if !ctx.zeebe(ext, "case").is_empty() {
        ctx.report(
            "case-marker",
            owner,
            format!("The case marker 'zeebe:case' is only allowed on a process, but was found on '{ty}'"),
            "Move zeebe:case to the process.",
        );
    }
}

fn case_marker(ctx: &mut ZeebeContext) {
    let defs = ctx.defs;
    for process in executable_processes(defs) {
        for c in ctx.zeebe(&process.extension_elements, "case") {
            let title = c.attributes.get("title");
            if title.is_none_or(|t| js_trim(t).is_empty()) {
                ctx.report(
                    "case-marker",
                    &process.id,
                    "Attribute 'title' must be present and not empty".into(),
                    "Set the case title to a variable name.",
                );
            } else if title.is_some_and(|t| t.starts_with('=')) {
                ctx.report(
                    "case-marker",
                    &process.id,
                    "Attribute 'title' must be a variable name, not an expression".into(),
                    "Set the case title to a variable name without '='.",
                );
            }
        }
    }
    for (node, _) in nodes(ctx) {
        let ty = match node {
            BpmnFlowElement::EventSubProcess(_) => "subProcess",
            other => other.type_name(),
        };
        let base = node.base();
        misplaced_case(ctx, &base.id, ty, &base.extension_elements);
    }
    let ids = executable(defs);
    for entry in ctx.flows.clone() {
        if ids.contains(ctx.scopes[entry.scope].process_id) {
            misplaced_case(
                ctx,
                &entry.flow.id,
                "sequenceFlow",
                &entry.flow.extension_elements,
            );
        }
    }
    for m in &defs.messages {
        misplaced_case(
            ctx,
            &m.id,
            "message",
            m.extension_elements.as_deref().unwrap_or(&[]),
        );
    }
    for e in &defs.errors {
        misplaced_case(
            ctx,
            &e.id,
            "error",
            e.extension_elements.as_deref().unwrap_or(&[]),
        );
    }
    for s in &defs.signals {
        misplaced_case(
            ctx,
            &s.id,
            "signal",
            s.extension_elements.as_deref().unwrap_or(&[]),
        );
    }
    for e in &defs.escalations {
        misplaced_case(
            ctx,
            &e.id,
            "escalation",
            e.extension_elements.as_deref().unwrap_or(&[]),
        );
    }
}

/// Z26, from the message's side (MessageValidator): one message may start at most
/// one top-level start event across every process of the file, executable or not.
fn shared_start_message(ctx: &mut ZeebeContext) {
    let defs = ctx.defs;
    for message in &defs.messages {
        let mut count = 0;
        for process in &defs.processes {
            for el in &process.contents.flow_elements {
                if let BpmnFlowElement::StartEvent(s) = el {
                    for def in &s.event_definitions {
                        if let BpmnEventDefinition::Message(m) = def {
                            if ctx
                                .message(m.message_ref.as_deref())
                                .is_some_and(|found| std::ptr::eq(found, message))
                            {
                                count += 1;
                            }
                        }
                    }
                }
            }
        }
        if count > 1 {
            ctx.report(
                "duplicate-message-start",
                &message.id,
                "A message cannot be referred by more than one start event".into(),
                "Give each message start event its own message.",
            );
        }
    }
}

pub(super) fn check(ctx: &mut ZeebeContext) {
    id_present(ctx);
    executable_process(ctx);
    lengths(ctx);
    element_type(ctx);
    event_definition_type(ctx);
    event_sub_process_start(ctx);
    event_types(ctx);
    boundary_events(ctx);
    process_start_events(ctx);
    scope_duplicates(ctx);
    process_start_duplicates(ctx);
    shared_start_message(ctx);
    conditional_starts(ctx);
    boundary_duplicates(ctx);
    process_extensions(ctx);
    case_marker(ctx);
}
