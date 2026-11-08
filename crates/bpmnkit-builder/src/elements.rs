//! Port of `bpmn/bpmn-builder.ts` lines 500–1500: the free helpers all three flow builders
//! share (element factories, event definitions, multi-instance, ad-hoc extensions,
//! embedded forms, join inference, scope finalisation, message hoisting).
//!
//! Porter notes:
//! - Pure helpers return `Result<_, String>` with TS's exact message; the builders record
//!   it in `Shared` (see `shared.rs`). Helpers that only read options never fail.
//! - `make_flow_element` is TS's `makeFlowElement`: `create_flow_element` plus listener
//!   placement checks (`assert_zeebe_placement(bpmn_element_name(type), listener.name)`),
//!   listeners appended after the given extension elements.
//! - TS spreads options (`{...options, extensionElements}`) into `makeFlowElement`, which
//!   reads only name/documentation/extensionElements/executionListeners/taskListeners:
//!   [`FlowElementOptions`] is exactly that.
//! - `buildEventDefinitions` resolves root definitions in `Shared` (errors by code OR name,
//!   messages by name, signals by name, escalations by code) and creates missing ones with
//!   `root_definition_id`. A created `BpmnError` has `name` and `errorCode`; a created
//!   `BpmnMessage` has `name` (+ empty `unknownAttributes`, as TS writes `{}`).
//!   Timer: one definition when ANY of duration/date/cycle is a non-empty string (JS
//!   truthiness: `""` does not count). Error: when errorCode or errorRef is defined (empty
//!   counts). Compensation: when `compensation` is truthy.
//! - `Record<string,string>` options (taskHeaders) are written in
//!   `bpmnkit_bpmn::js::object_entries` order.
//! - `insertJoinGateways` iterates JS Maps: `outCount` and `incoming` in first-seen order,
//!   `splitToFlows` likewise — use `IndexMap`. It mutates `flow.targetRef` of flows found by
//!   identity: keep flow indices, not clones. New join flows get `generate_id("Flow")`.
//! - `traceBackToSplit` is O(n²) in TS (`flows.filter` per step); keep the semantics, an
//!   index is fine.
//! - `hoistMessageSubscriptions` walks `flowElements` recursively (any container), keys
//!   owners by messageRef in first-seen order, compares `correlationKey` attribute values
//!   (an absent attribute is `undefined`, a distinct key), and removes the hoisted
//!   `zeebe:subscription` from each host by identity (`filter(x => x !== sub)`): remove the
//!   first element equal to it at the recorded position, not every equal one.

use bpmnkit_bpmn::element_shape::{create_flow_element, CreateFlowElementOptions};
use bpmnkit_bpmn::ids::generate_id;
use bpmnkit_bpmn::js::{js_number_to_string, object_entries};
use bpmnkit_bpmn::stable_ids::{
    assign_event_definition_ids, assign_stable_flow_ids, root_definition_id,
};
use bpmnkit_bpmn::zeebe::{
    assert_zeebe_placement, bpmn_element_name, make_conditional_definition,
    zeebe_extensions_to_xml_elements, ZeebeAssignmentDefinition, ZeebeCalledDecision,
    ZeebeCalledElement, ZeebeExtensions, ZeebeFormDefinition, ZeebeIoMapping, ZeebeListener,
    ZeebePriorityDefinition, ZeebeProperties, ZeebeSubscription, ZeebeTaskDefinition,
    ZeebeTaskHeaderEntry, ZeebeTaskHeaders, ZeebeTaskSchedule,
};
use bpmnkit_bpmn::{
    Attrs, BpmnConditionExpression, BpmnDefinitions, BpmnElementType, BpmnError, BpmnEscalation,
    BpmnEventDefinition, BpmnFlowElement, BpmnMessage, BpmnMultiInstanceLoopCharacteristics,
    BpmnSequenceFlow, BpmnSignal, XmlElement,
};
use indexmap::{IndexMap, IndexSet};

use crate::options::*;
use crate::shared::Shared;

/// `const EXPORTER_VERSION`: keep in sync with `packages/core/package.json`.
pub(crate) const EXPORTER_VERSION: &str = "0.0.23";

/// What TS's `makeFlowElement` reads off its options argument.
#[derive(Debug, Clone, Default, PartialEq)]
pub(crate) struct FlowElementOptions {
    pub name: Option<String>,
    pub extension_elements: Option<Vec<XmlElement>>,
    pub documentation: Option<String>,
    pub execution_listeners: Option<Vec<ZeebeListener>>,
    pub task_listeners: Option<Vec<ZeebeListener>>,
}

impl From<&ElementOptions> for FlowElementOptions {
    fn from(o: &ElementOptions) -> Self {
        Self {
            name: o.name.clone(),
            documentation: o.documentation.clone(),
            execution_listeners: o.execution_listeners.clone(),
            ..Self::default()
        }
    }
}

/// The `{ extensionElements, completionCondition }` pair of `buildAdHocSubProcessExtensions`.
#[derive(Debug, Clone, Default, PartialEq)]
pub(crate) struct AdHocExtensions {
    pub extension_elements: Vec<XmlElement>,
    pub completion_condition: Option<BpmnConditionExpression>,
}

/// The finished content of a sub-process scope (TS reads `sub._elements`, `sub._flows`,
/// `sub._textAnnotations`, `sub._associations` after `finalizeScope`).
#[derive(Debug, Clone, Default, PartialEq)]
pub(crate) struct ScopeContents {
    pub elements: Vec<BpmnFlowElement>,
    pub flows: Vec<BpmnSequenceFlow>,
    pub text_annotations: Vec<bpmnkit_bpmn::BpmnTextAnnotation>,
    pub associations: Vec<bpmnkit_bpmn::BpmnAssociation>,
}

/// JS truthiness of an optional string: `undefined` and `""` are falsy.
fn truthy(s: &Option<String>) -> bool {
    s.as_deref().is_some_and(|s| !s.is_empty())
}

fn xml(name: &str, attributes: Attrs) -> XmlElement {
    XmlElement {
        name: name.to_owned(),
        attributes,
        children: vec![],
        text: None,
    }
}

// ── Root definitions ────────────────────────────────────────────────────────

/// TS's `canDeclareRoot`: `Ok(false)` when the identical declaration exists, `Ok(true)` to
/// record it, `Err` when it contradicts one (`existing_id` is the id of the definition the
/// label already resolves to) or the id is taken.
pub(crate) fn can_declare_root<'a>(
    kind: &str,
    label: &str,
    id: &str,
    existing_id: Option<&str>,
    all_ids: impl IntoIterator<Item = &'a str>,
) -> Result<bool, String> {
    if let Some(existing) = existing_id {
        if existing == id {
            return Ok(false);
        }
        return Err(format!(
            "{kind} \"{label}\" is already declared as \"{existing}\". Declare it before the events that use it, or name that id instead."
        ));
    }
    if all_ids.into_iter().any(|definition| definition == id) {
        return Err(format!("Duplicate {kind} id \"{id}\"."));
    }
    Ok(true)
}

/// TS's `resolveMessage`: the id of the root message named `message_name`, declared if new.
pub(crate) fn resolve_message(message_name: &str, shared: &mut Shared) -> String {
    if let Some(existing) = shared
        .messages
        .iter()
        .find(|m| m.name.as_deref() == Some(message_name))
    {
        return existing.id.clone();
    }
    let id = root_definition_id(
        "Message",
        message_name,
        shared.messages.iter().map(|m| m.id.as_str()),
    );
    shared.messages.push(BpmnMessage {
        id: id.clone(),
        name: Some(message_name.to_owned()),
        ..BpmnMessage::default()
    });
    id
}

fn is_subscription(el: &XmlElement) -> bool {
    el.name == "zeebe:subscription"
}

/// One element carrying a `zeebe:subscription`: where it is (process index, then indices
/// down the nested `flowElements`) and where the subscription sits in its extensions.
struct SubscriptionOwner {
    path: Vec<usize>,
    sub_at: usize,
    sub: XmlElement,
}

fn collect_subscription_owners(
    elements: &[BpmnFlowElement],
    path: &mut Vec<usize>,
    owners: &mut IndexMap<String, Vec<SubscriptionOwner>>,
) {
    for (i, el) in elements.iter().enumerate() {
        path.push(i);
        let sub_at = el
            .base()
            .extension_elements
            .iter()
            .position(is_subscription);
        if let Some(sub_at) = sub_at {
            // `"messageRef" in el && typeof el.messageRef === "string"`, else the first
            // message definition's ref (which may itself be undefined).
            let message_ref = match el.message_ref() {
                Some(r) => Some(r.to_owned()),
                None => el.event_definitions().and_then(|defs| {
                    defs.iter()
                        .find_map(|d| match d {
                            BpmnEventDefinition::Message(m) => Some(m.message_ref.clone()),
                            _ => None,
                        })
                        .flatten()
                }),
            };
            if let Some(message_ref) = message_ref {
                owners
                    .entry(message_ref)
                    .or_default()
                    .push(SubscriptionOwner {
                        path: path.clone(),
                        sub_at,
                        sub: el.base().extension_elements[sub_at].clone(),
                    });
            }
        }
        if let Some(contents) = el.contents() {
            collect_subscription_owners(&contents.flow_elements, path, owners);
        }
        path.pop();
    }
}

fn element_at_mut<'a>(
    elements: &'a mut [BpmnFlowElement],
    path: &[usize],
) -> Option<&'a mut BpmnFlowElement> {
    let (first, rest) = path.split_first()?;
    let el = elements.get_mut(*first)?;
    if rest.is_empty() {
        Some(el)
    } else {
        element_at_mut(&mut el.contents_mut()?.flow_elements, rest)
    }
}

/// TS's `hoistMessageSubscriptions`: moves each element's `zeebe:subscription` onto the
/// `bpmn:message` it refers to, unless the message's users disagree on the key.
pub(crate) fn hoist_message_subscriptions(mut defs: BpmnDefinitions) -> BpmnDefinitions {
    let mut owners: IndexMap<String, Vec<SubscriptionOwner>> = IndexMap::new();
    for (pi, process) in defs.processes.iter().enumerate() {
        let mut path = vec![pi];
        collect_subscription_owners(&process.contents.flow_elements, &mut path, &mut owners);
    }
    for (message_ref, list) in &owners {
        let Some(mi) = defs.messages.iter().position(|m| m.id == *message_ref) else {
            continue;
        };
        let Some(first) = list.first() else { continue };
        let existing = defs.messages[mi]
            .extension_elements
            .as_ref()
            .and_then(|ext| ext.iter().find(|e| is_subscription(e)))
            .cloned();
        let mut keys: IndexSet<Option<&str>> =
            list.iter().map(|o| o.sub.attr("correlationKey")).collect();
        if let Some(existing) = &existing {
            keys.insert(existing.attr("correlationKey"));
        }
        if keys.len() > 1 {
            continue;
        }
        if existing.is_none() {
            defs.messages[mi]
                .extension_elements
                .get_or_insert_with(Vec::new)
                .push(first.sub.clone());
        }
        for owner in list {
            let Some((&pi, rest)) = owner.path.split_first() else {
                continue;
            };
            let Some(process) = defs.processes.get_mut(pi) else {
                continue;
            };
            if let Some(host) = element_at_mut(&mut process.contents.flow_elements, rest) {
                host.base_mut().extension_elements.remove(owner.sub_at);
            }
        }
    }
    defs
}

/// TS's `buildMessageSubscriptionExt`: `[]` for an absent or empty key, unless a message
/// name is set. Zeebe rejects a caught message without a subscription key and none can be
/// inferred, so that case is an error rather than a model that cannot deploy.
pub(crate) fn build_message_subscription_ext(
    method: &str,
    message_name: Option<&str>,
    correlation_key: Option<&str>,
) -> Result<Vec<XmlElement>, String> {
    let Some(key) = correlation_key.filter(|k| !k.is_empty()) else {
        return match message_name.filter(|n| !n.is_empty()) {
            Some(name) => Err(missing_correlation_key(&format!("{method}()"), name)),
            None => Ok(vec![]),
        };
    };
    Ok(zeebe_extensions_to_xml_elements(&ZeebeExtensions {
        subscription: Some(ZeebeSubscription {
            correlation_key: key.to_owned(),
        }),
        ..ZeebeExtensions::default()
    }))
}

fn missing_correlation_key(subject: &str, message_name: &str) -> String {
    format!("{subject}: message \"{message_name}\" needs a correlationKey; Camunda 8 requires a zeebe:subscription correlationKey on a message caught outside a process start event")
}

/// An event sub-process's message start is a catch too: Zeebe needs its correlation key.
pub(crate) fn assert_event_sub_process_subscriptions(
    elements: &[BpmnFlowElement],
) -> Result<(), String> {
    for el in elements {
        let BpmnFlowElement::StartEvent(start) = el else {
            continue;
        };
        let Some(message) = start.event_definitions.iter().find_map(|d| match d {
            BpmnEventDefinition::Message(m) => Some(m),
            _ => None,
        }) else {
            continue;
        };
        if start
            .base
            .extension_elements
            .iter()
            .any(|x| x.name == "zeebe:subscription")
        {
            continue;
        }
        let message_ref = message.message_ref.as_deref().unwrap_or(&start.base.id);
        return Err(missing_correlation_key(
            &format!("eventSubProcess(): start event \"{}\"", start.base.id),
            message_ref,
        ));
    }
    Ok(())
}

/// TS's `buildEventDefinitions`, always with the shared root lists (every TS call site
/// passes them).
pub(crate) fn build_event_definitions(
    opts: &EventDefinitionOptions,
    shared: &mut Shared,
) -> Vec<BpmnEventDefinition> {
    let mut defs = Vec::new();
    if truthy(&opts.timer_duration) || truthy(&opts.timer_date) || truthy(&opts.timer_cycle) {
        defs.push(BpmnEventDefinition::Timer(
            bpmnkit_bpmn::BpmnTimerEventDefinition {
                time_duration: opts.timer_duration.clone(),
                time_date: opts.timer_date.clone(),
                time_cycle: opts.timer_cycle.clone(),
                ..Default::default()
            },
        ));
    }
    if opts.error_code.is_some() || opts.error_ref.is_some() {
        let code_or_ref = opts
            .error_code
            .as_deref()
            .or(opts.error_ref.as_deref())
            .unwrap_or_default();
        let existing = shared
            .errors
            .iter()
            .find(|e| {
                e.error_code.as_deref() == Some(code_or_ref)
                    || e.name.as_deref() == Some(code_or_ref)
            })
            .map(|e| e.id.clone());
        let error_ref = match existing {
            Some(id) => id,
            None => {
                let id = root_definition_id(
                    "Error",
                    code_or_ref,
                    shared.errors.iter().map(|e| e.id.as_str()),
                );
                shared.errors.push(BpmnError {
                    id: id.clone(),
                    name: Some(code_or_ref.to_owned()),
                    error_code: Some(code_or_ref.to_owned()),
                    ..BpmnError::default()
                });
                id
            }
        };
        defs.push(BpmnEventDefinition::Error(
            bpmnkit_bpmn::BpmnErrorEventDefinition {
                error_ref: Some(error_ref),
                ..Default::default()
            },
        ));
    }
    if let Some(name) = &opts.message_name {
        let message_ref = resolve_message(name, shared);
        defs.push(BpmnEventDefinition::Message(
            bpmnkit_bpmn::BpmnMessageEventDefinition {
                message_ref: Some(message_ref),
                ..Default::default()
            },
        ));
    }
    if let Some(name) = &opts.signal_name {
        let existing = shared
            .signals
            .iter()
            .find(|s| s.name.as_deref() == Some(name.as_str()))
            .map(|s| s.id.clone());
        let signal_ref = match existing {
            Some(id) => id,
            None => {
                let id = root_definition_id(
                    "Signal",
                    name,
                    shared.signals.iter().map(|s| s.id.as_str()),
                );
                shared.signals.push(BpmnSignal {
                    id: id.clone(),
                    name: Some(name.clone()),
                    ..BpmnSignal::default()
                });
                id
            }
        };
        defs.push(BpmnEventDefinition::Signal(
            bpmnkit_bpmn::BpmnSignalEventDefinition {
                signal_ref: Some(signal_ref),
                ..Default::default()
            },
        ));
    }
    if let Some(code) = &opts.escalation_code {
        let existing = shared
            .escalations
            .iter()
            .find(|e| e.escalation_code.as_deref() == Some(code.as_str()))
            .map(|e| e.id.clone());
        let escalation_ref = match existing {
            Some(id) => id,
            None => {
                let id = root_definition_id(
                    "Escalation",
                    code,
                    shared.escalations.iter().map(|e| e.id.as_str()),
                );
                shared.escalations.push(BpmnEscalation {
                    id: id.clone(),
                    name: Some(code.clone()),
                    escalation_code: Some(code.clone()),
                    ..BpmnEscalation::default()
                });
                id
            }
        };
        defs.push(BpmnEventDefinition::Escalation(
            bpmnkit_bpmn::BpmnEscalationEventDefinition {
                escalation_ref: Some(escalation_ref),
                ..Default::default()
            },
        ));
    }
    if opts.compensation == Some(true) {
        defs.push(BpmnEventDefinition::Compensate(
            bpmnkit_bpmn::BpmnCompensateEventDefinition {
                activity_ref: opts.activity_ref.clone(),
                ..Default::default()
            },
        ));
    }
    if let Some(name) = &opts.link_name {
        defs.push(BpmnEventDefinition::Link(
            bpmnkit_bpmn::BpmnLinkEventDefinition {
                name: Some(name.clone()),
                ..Default::default()
            },
        ));
    }
    if let Some(condition) = &opts.condition {
        let events: Option<Vec<String>> = opts
            .condition_variable_events
            .as_ref()
            .map(|e| e.iter().map(|v| v.as_str().to_owned()).collect());
        defs.push(make_conditional_definition(condition, events.as_deref()));
    }
    defs
}

/// TS's `isLinkEvent(element, type)`: `ty` is `IntermediateThrowEvent` or
/// `IntermediateCatchEvent`.
pub(crate) fn is_link_event(element: &BpmnFlowElement, ty: BpmnElementType) -> bool {
    element.element_type() == ty
        && element.event_definitions().is_some_and(|defs| {
            defs.iter()
                .any(|d| matches!(d, BpmnEventDefinition::Link(_)))
        })
}

// ── Element construction ────────────────────────────────────────────────────

/// TS's `makeFlowElement`: an empty element plus listeners, placement-checked.
pub(crate) fn make_flow_element(
    id: &str,
    ty: BpmnElementType,
    options: FlowElementOptions,
) -> Result<BpmnFlowElement, String> {
    let mut el = create_flow_element(
        id,
        ty,
        CreateFlowElementOptions {
            name: options.name,
            documentation: options.documentation,
            extension_elements: options.extension_elements,
        },
    );
    // Placement is checked here, so a listener on an element the schema forbids it on
    // fails at build time, not at deploy time.
    let listeners = zeebe_extensions_to_xml_elements(&ZeebeExtensions {
        execution_listeners: options.execution_listeners,
        task_listeners: options.task_listeners,
        ..ZeebeExtensions::default()
    });
    let owner = bpmn_element_name(el.type_name());
    for listener in listeners {
        assert_zeebe_placement(&owner, &listener.name)?;
        el.base_mut().extension_elements.push(listener);
    }
    Ok(el)
}

/// TS's `buildMultiInstance`.
pub(crate) fn build_multi_instance(
    options: &MultiInstanceOptions,
) -> BpmnMultiInstanceLoopCharacteristics {
    let mut ext_children = Vec::new();
    // Zeebe needs inputCollection, so output-only options emit nothing (as before).
    if let Some(collection) = options.collection.as_deref().filter(|c| !c.is_empty()) {
        let mut attrs = Attrs::new();
        attrs.insert("inputCollection".to_owned(), collection.to_owned());
        for (key, value) in [
            ("inputElement", &options.element_variable),
            ("outputCollection", &options.output_collection),
            ("outputElement", &options.output_element),
        ] {
            if let Some(value) = value.as_deref().filter(|v| !v.is_empty()) {
                attrs.insert(key.to_owned(), value.to_owned());
            }
        }
        ext_children.push(xml("zeebe:loopCharacteristics", attrs));
    }
    BpmnMultiInstanceLoopCharacteristics {
        is_sequential: (options.is_sequential == Some(true)).then_some(true),
        completion_condition: options
            .completion_condition
            .as_deref()
            .filter(|c| !c.is_empty())
            .map(make_condition_expression),
        extension_elements: ext_children,
        ..BpmnMultiInstanceLoopCharacteristics::default()
    }
}

/// TS's `withMultiInstance`: only service/user/script/send/receive/business-rule tasks and
/// call activities take it; `None` leaves `el` as it is.
pub(crate) fn with_multi_instance(
    mut el: BpmnFlowElement,
    mi: Option<&MultiInstanceOptions>,
) -> BpmnFlowElement {
    let Some(mi) = mi else { return el };
    use BpmnFlowElement as E;
    if matches!(
        el,
        E::ServiceTask(_)
            | E::UserTask(_)
            | E::ScriptTask(_)
            | E::SendTask(_)
            | E::ReceiveTask(_)
            | E::BusinessRuleTask(_)
            | E::CallActivity(_)
    ) {
        if let Some(slot) = el.loop_characteristics_mut() {
            *slot = Some(build_multi_instance(mi));
        }
    }
    el
}

/// TS's `buildAdHocLoopCharacteristics`.
pub(crate) fn build_ad_hoc_loop_characteristics(
    lc: &AdHocLoopOptions,
) -> BpmnMultiInstanceLoopCharacteristics {
    let mut attrs = Attrs::new();
    attrs.insert("inputCollection".to_owned(), lc.input_collection.clone());
    for (key, value) in [
        ("inputElement", &lc.input_element),
        ("outputCollection", &lc.output_collection),
        ("outputElement", &lc.output_element),
    ] {
        if let Some(value) = value.as_deref().filter(|v| !v.is_empty()) {
            attrs.insert(key.to_owned(), value.to_owned());
        }
    }
    BpmnMultiInstanceLoopCharacteristics {
        extension_elements: vec![xml("zeebe:loopCharacteristics", attrs)],
        ..BpmnMultiInstanceLoopCharacteristics::default()
    }
}

/// TS's `isGatewayType`.
pub(crate) fn is_gateway_type(ty: BpmnElementType) -> bool {
    ty.is_gateway()
}

/// TS's `boundaryHostProblem`: why `withBoundary()` may not attach to `host`. Boundary
/// events attach to activities only, which are exactly the loop-capable types; an unknown
/// host (a cursor `connectTo()` moved outside the scope) is left alone.
pub(crate) fn boundary_host_problem(host: Option<&BpmnFlowElement>) -> Option<String> {
    let host = host?;
    if host.element_type().is_loop_capable() {
        return None;
    }
    if matches!(host, BpmnFlowElement::BoundaryEvent(_)) {
        return Some(
            "withBoundary() cannot attach to a boundary event. It must follow a task or activity element."
                .to_owned(),
        );
    }
    Some(format!(
        "withBoundary() cannot attach to {} \"{}\". It must follow a task or activity element.",
        host.type_name(),
        host.base().id
    ))
}

/// TS's `assertElementIdsUnique`: each builder scope checks only its own ids, but BPMN
/// ids are unique per document.
pub(crate) fn assert_element_ids_unique(
    elements: &[BpmnFlowElement],
    process_id: &str,
) -> Result<(), String> {
    fn walk<'a>(
        scope: &'a [BpmnFlowElement],
        seen: &mut IndexSet<&'a str>,
        process_id: &str,
    ) -> Result<(), String> {
        for element in scope {
            let id = element.base().id.as_str();
            if !seen.insert(id) {
                return Err(format!(
                    "Duplicate element ID \"{id}\" in process \"{process_id}\""
                ));
            }
            if let Some(contents) = element.contents() {
                walk(&contents.flow_elements, seen, process_id)?;
            }
        }
        Ok(())
    }
    walk(elements, &mut IndexSet::new(), process_id)
}

/// TS's `recomputeIncomingOutgoing`. A flow whose endpoint is missing is skipped; with
/// duplicate element ids the LAST one wins (`new Map(elements.map(...))`).
pub(crate) fn recompute_incoming_outgoing(
    elements: &mut [BpmnFlowElement],
    flows: &[BpmnSequenceFlow],
) {
    for el in elements.iter_mut() {
        let base = el.base_mut();
        base.incoming = vec![];
        base.outgoing = vec![];
    }
    let mut index: IndexMap<String, usize> = IndexMap::new();
    for (i, el) in elements.iter().enumerate() {
        index.insert(el.base().id.clone(), i);
    }
    for flow in flows {
        if let Some(&i) = index.get(&flow.source_ref) {
            elements[i].base_mut().outgoing.push(flow.id.clone());
        }
        if let Some(&i) = index.get(&flow.target_ref) {
            elements[i].base_mut().incoming.push(flow.id.clone());
        }
    }
}

/// TS's `buildMappingExtensions` (ioMapping, taskHeaders, properties).
pub(crate) fn build_mapping_extensions(
    io_mapping: Option<&IoMappingOptions>,
    task_headers: Option<&indexmap::IndexMap<String, String>>,
    zeebe_properties: Option<&[bpmnkit_bpmn::zeebe::ZeebePropertyEntry]>,
) -> ZeebeExtensions {
    let mut extensions = ZeebeExtensions::default();
    if let Some(io) = io_mapping {
        extensions.io_mapping = Some(ZeebeIoMapping {
            inputs: io.inputs.clone().unwrap_or_default(),
            outputs: io.outputs.clone().unwrap_or_default(),
        });
    }
    if let Some(headers) = task_headers {
        extensions.task_headers = Some(ZeebeTaskHeaders {
            headers: object_entries(headers)
                .into_iter()
                .map(|(key, value)| ZeebeTaskHeaderEntry {
                    key: key.clone(),
                    value: value.clone(),
                })
                .collect(),
        });
    }
    if let Some(properties) = zeebe_properties {
        extensions.properties = Some(ZeebeProperties {
            properties: properties.to_vec(),
        });
    }
    extensions
}

/// TS's `buildServiceTaskExtensions`.
pub(crate) fn build_service_task_extensions(
    options: &ServiceTaskOptions,
) -> Result<Vec<XmlElement>, String> {
    crate::xsd_guards::assert_retries_option(options.retries.as_deref(), &options.task_type)?;
    let mut extensions = build_mapping_extensions(
        options.io_mapping.as_ref(),
        options.task_headers.as_ref(),
        options.zeebe_properties.as_deref(),
    );
    extensions.task_definition = Some(ZeebeTaskDefinition {
        type_: options.task_type.clone(),
        retries: options.retries.clone(),
    });
    if let Some(agent) = &options.agent_definition {
        extensions.agent_definition = Some(agent.clone());
    }
    if let Some(linked) = &options.linked_resources {
        extensions.linked_resources = Some(linked.clone());
    }
    Ok(zeebe_extensions_to_xml_elements(&extensions))
}

/// TS's `makeConditionExpression`: `xsi:type="bpmn:tFormalExpression"`.
pub(crate) fn make_condition_expression(expression: &str) -> BpmnConditionExpression {
    let mut attributes = Attrs::new();
    attributes.insert("xsi:type".to_owned(), "bpmn:tFormalExpression".to_owned());
    BpmnConditionExpression {
        text: bpmnkit_bpmn::feel_condition::to_feel_condition(expression),
        attributes,
    }
}

/// TS's `buildAdHocSubProcessExtensions`.
pub(crate) fn build_ad_hoc_sub_process_extensions(
    options: Option<&AdHocSubProcessOptions>,
) -> AdHocExtensions {
    let mut zeebe_ext = ZeebeExtensions::default();
    if let Some(o) = options {
        if let Some(definition) = &o.task_definition {
            zeebe_ext.task_definition = Some(definition.clone());
        }
        let mapping = build_mapping_extensions(
            o.io_mapping.as_ref(),
            o.task_headers.as_ref(),
            o.zeebe_properties.as_deref(),
        );
        zeebe_ext.io_mapping = mapping.io_mapping;
        zeebe_ext.task_headers = mapping.task_headers;
        zeebe_ext.properties = mapping.properties;
        if let Some(agent) = &o.agent_definition {
            zeebe_ext.agent_definition = Some(agent.clone());
        }
    }
    let mut extension_elements = zeebe_extensions_to_xml_elements(&zeebe_ext);

    let mut ad_hoc_attrs = Attrs::new();
    if let Some(o) = options {
        for (key, value) in [
            ("activeElementsCollection", &o.active_elements_collection),
            ("outputCollection", &o.output_collection),
            ("outputElement", &o.output_element),
        ] {
            if let Some(value) = value.as_deref().filter(|v| !v.is_empty()) {
                ad_hoc_attrs.insert(key.to_owned(), value.to_owned());
            }
        }
    }
    if !ad_hoc_attrs.is_empty() {
        extension_elements.push(xml("zeebe:adHoc", ad_hoc_attrs));
    }

    AdHocExtensions {
        extension_elements,
        completion_condition: options
            .and_then(|o| o.completion_condition.as_deref())
            .filter(|c| !c.is_empty())
            .map(make_condition_expression),
    }
}

/// TS's `finalizeAdHocSubProcessEl`: template attributes, contents, loop, completion.
pub(crate) fn finalize_ad_hoc_sub_process_el(
    element: &mut BpmnFlowElement,
    options: Option<&AdHocSubProcessOptions>,
    sub: ScopeContents,
    completion_condition: Option<BpmnConditionExpression>,
) {
    apply_modeler_template(
        element,
        options.and_then(|o| o.modeler_template.as_deref()),
        options.and_then(|o| o.modeler_template_version.as_deref()),
        options.and_then(|o| o.modeler_template_icon.as_deref()),
    );
    let BpmnFlowElement::AdHocSubProcess(ad_hoc) = element else {
        return;
    };
    ad_hoc.contents.flow_elements = sub.elements;
    ad_hoc.contents.sequence_flows = sub.flows;
    ad_hoc.contents.text_annotations = sub.text_annotations;
    ad_hoc.contents.associations = sub.associations;
    if let Some(lc) = options.and_then(|o| o.loop_characteristics.as_ref()) {
        ad_hoc.loop_characteristics = Some(build_ad_hoc_loop_characteristics(lc));
    } else if let Some(mi) = options.and_then(|o| o.multi_instance.as_ref()) {
        ad_hoc.loop_characteristics = Some(build_multi_instance(mi));
    }
    ad_hoc.completion_condition = completion_condition;
    if let Some(cancel) = options.and_then(|o| o.cancel_remaining_instances) {
        ad_hoc.cancel_remaining_instances = Some(cancel);
    }
}

/// `if (options.isForCompensation) el.isForCompensation = true`.
fn flag_compensation(el: &mut BpmnFlowElement, flag: Option<bool>) {
    if flag == Some(true) {
        el.base_mut().is_for_compensation = Some(true);
    }
}

/// TS's `makeServiceTaskEl`.
pub(crate) fn make_service_task_el(
    id: &str,
    options: &ServiceTaskOptions,
) -> Result<BpmnFlowElement, String> {
    let mut unknown_attributes = Attrs::new();
    for (key, value) in [
        ("zeebe:modelerTemplate", &options.modeler_template),
        (
            "zeebe:modelerTemplateVersion",
            &options.modeler_template_version,
        ),
        ("zeebe:modelerTemplateIcon", &options.modeler_template_icon),
    ] {
        if let Some(value) = value.as_deref().filter(|v| !v.is_empty()) {
            unknown_attributes.insert(key.to_owned(), value.to_owned());
        }
    }
    let mut el = make_flow_element(
        id,
        BpmnElementType::ServiceTask,
        FlowElementOptions {
            name: Some(options.name.clone()),
            documentation: options.documentation.clone(),
            extension_elements: Some(build_service_task_extensions(options)?),
            execution_listeners: options.execution_listeners.clone(),
            // Not in ServiceTaskOptions; forwarded so an untyped caller gets the placement error, not a silent drop.
            task_listeners: options.task_listeners.clone(),
        },
    )?;
    el.base_mut().unknown_attributes = unknown_attributes;
    flag_compensation(&mut el, options.is_for_compensation);
    Ok(with_multi_instance(el, options.multi_instance.as_ref()))
}

/// TS's `makeScriptTaskEl`.
pub(crate) fn make_script_task_el(
    id: &str,
    options: &ScriptTaskOptions,
) -> Result<BpmnFlowElement, String> {
    let mut attrs = Attrs::new();
    attrs.insert("expression".to_owned(), options.expression.clone());
    attrs.insert("resultVariable".to_owned(), options.result_variable.clone());
    let mut el = make_flow_element(
        id,
        BpmnElementType::ScriptTask,
        FlowElementOptions {
            name: options.name.clone(),
            documentation: options.documentation.clone(),
            execution_listeners: options.execution_listeners.clone(),
            extension_elements: Some(zeebe_extensions_to_xml_elements(&ZeebeExtensions {
                unknown_elements: Some(vec![xml("zeebe:script", attrs)]),
                ..ZeebeExtensions::default()
            })),
            task_listeners: None,
        },
    )?;
    flag_compensation(&mut el, options.is_for_compensation);
    Ok(with_multi_instance(el, options.multi_instance.as_ref()))
}

/// TS's `applyModelerTemplate` (template, version, icon; each only when non-empty).
pub(crate) fn apply_modeler_template(
    el: &mut BpmnFlowElement,
    template: Option<&str>,
    version: Option<&str>,
    icon: Option<&str>,
) {
    let attrs = &mut el.base_mut().unknown_attributes;
    for (key, value) in [
        ("zeebe:modelerTemplate", template),
        ("zeebe:modelerTemplateVersion", version),
        ("zeebe:modelerTemplateIcon", icon),
    ] {
        if let Some(value) = value.filter(|v| !v.is_empty()) {
            attrs.insert(key.to_owned(), value.to_owned());
        }
    }
}

/// TS's `makeStartEventEl`: the shell; callers add event definitions and `isInterrupting`.
pub(crate) fn make_start_event_el(
    id: &str,
    options: Option<&StartEventOptions>,
) -> Result<BpmnFlowElement, String> {
    let mut ext = ZeebeExtensions::default();
    if let Some(form_id) = options
        .and_then(|o| o.form_id.as_deref())
        .filter(|f| !f.is_empty())
    {
        ext.form_definition = Some(ZeebeFormDefinition::FormId {
            form_id: form_id.to_owned(),
            binding_type: None,
            version_tag: None,
        });
    }
    if let Some(key) = options
        .and_then(|o| o.correlation_key.as_deref())
        .filter(|k| !k.is_empty())
    {
        ext.subscription = Some(ZeebeSubscription {
            correlation_key: key.to_owned(),
        });
    }
    if let Some(properties) = options.and_then(|o| o.zeebe_properties.as_ref()) {
        ext.properties = Some(ZeebeProperties {
            properties: properties.clone(),
        });
    }
    let mut el = make_flow_element(
        id,
        BpmnElementType::StartEvent,
        FlowElementOptions {
            name: options.and_then(|o| o.element.name.clone()),
            documentation: options.and_then(|o| o.element.documentation.clone()),
            execution_listeners: options.and_then(|o| o.element.execution_listeners.clone()),
            extension_elements: Some(zeebe_extensions_to_xml_elements(&ext)),
            task_listeners: None,
        },
    )?;
    if let Some(o) = options {
        apply_modeler_template(
            &mut el,
            o.modeler_template.as_deref(),
            o.modeler_template_version.as_deref(),
            o.modeler_template_icon.as_deref(),
        );
    }
    Ok(el)
}

/// TS's `userTaskFormDefinition`.
pub(crate) fn user_task_form_definition(
    options: Option<&UserTaskOptions>,
) -> Result<Option<ZeebeFormDefinition>, String> {
    let Some(o) = options else { return Ok(None) };
    let set = usize::from(o.form_id.is_some())
        + usize::from(o.form_key.is_some())
        + usize::from(o.external_reference.is_some())
        + usize::from(o.embedded_form.is_some());
    if set > 1 {
        return Err(
            "userTask: set only one of formId, formKey, externalReference or embeddedForm"
                .to_owned(),
        );
    }
    if let Some(form) = &o.embedded_form {
        return Ok(Some(ZeebeFormDefinition::FormKey {
            form_key: format!("camunda-forms:bpmn:{}", form.id),
        }));
    }
    if let Some(form_key) = o.form_key.as_deref().filter(|k| !k.is_empty()) {
        return Ok(Some(ZeebeFormDefinition::FormKey {
            form_key: form_key.to_owned(),
        }));
    }
    if let Some(reference) = o.external_reference.as_deref().filter(|r| !r.is_empty()) {
        return Ok(Some(ZeebeFormDefinition::ExternalReference {
            external_reference: reference.to_owned(),
        }));
    }
    let Some(form_id) = o.form_id.as_deref().filter(|f| !f.is_empty()) else {
        return Ok(None);
    };
    Ok(Some(ZeebeFormDefinition::FormId {
        form_id: form_id.to_owned(),
        binding_type: o.form_binding_type,
        version_tag: o.form_version_tag.clone(),
    }))
}

/// TS's `makeUserTaskEl`; an `embeddedForm` is recorded in `shared.embedded_forms` under
/// the task's id (TS's `embeddedForms.set(el, …)`).
pub(crate) fn make_user_task_el(
    id: &str,
    options: Option<&UserTaskOptions>,
    shared: &mut Shared,
) -> Result<BpmnFlowElement, String> {
    let form_definition = user_task_form_definition(options)?;
    let mut x = match options {
        Some(o) => build_mapping_extensions(
            o.io_mapping.as_ref(),
            o.task_headers.as_ref(),
            o.zeebe_properties.as_deref(),
        ),
        None => ZeebeExtensions::default(),
    };
    if let Some(o) = options {
        x.user_task = o.zeebe_user_task == Some(true);
        if truthy(&o.assignee) || truthy(&o.candidate_groups) || truthy(&o.candidate_users) {
            x.assignment_definition = Some(ZeebeAssignmentDefinition {
                assignee: o.assignee.clone(),
                candidate_groups: o.candidate_groups.clone(),
                candidate_users: o.candidate_users.clone(),
            });
        }
        if truthy(&o.due_date) || truthy(&o.follow_up_date) {
            x.task_schedule = Some(ZeebeTaskSchedule {
                due_date: o.due_date.clone(),
                follow_up_date: o.follow_up_date.clone(),
            });
        }
        if let Some(priority) = o.priority {
            x.priority_definition = Some(ZeebePriorityDefinition {
                priority: js_number_to_string(priority),
            });
        }
    }
    x.form_definition = form_definition;
    let ext = zeebe_extensions_to_xml_elements(&x);
    let mut el = make_flow_element(
        id,
        BpmnElementType::UserTask,
        FlowElementOptions {
            name: options.and_then(|o| o.name.clone()),
            documentation: options.and_then(|o| o.documentation.clone()),
            execution_listeners: options.and_then(|o| o.execution_listeners.clone()),
            task_listeners: options.and_then(|o| o.task_listeners.clone()),
            extension_elements: Some(ext),
        },
    )?;
    if let Some(o) = options {
        apply_modeler_template(
            &mut el,
            o.modeler_template.as_deref(),
            o.modeler_template_version.as_deref(),
            o.modeler_template_icon.as_deref(),
        );
        if let Some(form) = &o.embedded_form {
            shared.embedded_forms.insert(id.to_owned(), form.clone());
        }
        flag_compensation(&mut el, o.is_for_compensation);
    }
    Ok(with_multi_instance(
        el,
        options.and_then(|o| o.multi_instance.as_ref()),
    ))
}

/// TS's `embeddedFormElements`: `zeebe:userTaskForm`s for every embedded form under
/// `elements`, nested containers included, deduped by form id in first-seen order.
pub(crate) fn embedded_form_elements(
    elements: &[BpmnFlowElement],
    shared: &Shared,
) -> Result<Vec<XmlElement>, String> {
    fn visit(
        list: &[BpmnFlowElement],
        shared: &Shared,
        by_id: &mut IndexMap<String, XmlElement>,
    ) -> Result<(), String> {
        for el in list {
            // The side table is keyed by id; only user tasks ever register a form.
            let form = match el {
                BpmnFlowElement::UserTask(task) => shared.embedded_forms.get(&task.base.id),
                _ => None,
            };
            if let Some(form) = form {
                // Two tasks may share a form, but one id can't hold two schemas.
                if let Some(seen) = by_id.get(&form.id) {
                    if seen.text.as_deref() != Some(form.schema.as_str()) {
                        return Err(format!(
                            "embedded form \"{}\" is declared with two different schemas",
                            form.id
                        ));
                    }
                }
                let mut attributes = Attrs::new();
                attributes.insert("id".to_owned(), form.id.clone());
                by_id.insert(
                    form.id.clone(),
                    XmlElement {
                        name: "zeebe:userTaskForm".to_owned(),
                        attributes,
                        children: vec![],
                        text: Some(form.schema.clone()),
                    },
                );
            }
            if let Some(contents) = el.contents() {
                visit(&contents.flow_elements, shared, by_id)?;
            }
        }
        Ok(())
    }
    let mut by_id = IndexMap::new();
    visit(elements, shared, &mut by_id)?;
    Ok(by_id.into_values().collect())
}

/// TS's `makeBusinessRuleTaskEl`.
pub(crate) fn make_business_rule_task_el(
    id: &str,
    options: Option<&BusinessRuleTaskOptions>,
) -> Result<BpmnFlowElement, String> {
    let mut ext = Vec::new();
    if let Some(task_type) = options
        .and_then(|o| o.task_type.as_deref())
        .filter(|t| !t.is_empty())
    {
        ext.extend(zeebe_extensions_to_xml_elements(&ZeebeExtensions {
            task_definition: Some(ZeebeTaskDefinition {
                type_: task_type.to_owned(),
                retries: None,
            }),
            ..ZeebeExtensions::default()
        }));
    }
    if let Some(o) = options {
        if let Some(decision_id) = o.decision_id.as_deref().filter(|d| !d.is_empty()) {
            ext.extend(zeebe_extensions_to_xml_elements(&ZeebeExtensions {
                called_decision: Some(ZeebeCalledDecision {
                    decision_id: decision_id.to_owned(),
                    result_variable: o
                        .result_variable
                        .clone()
                        .unwrap_or_else(|| "result".to_owned()),
                }),
                ..ZeebeExtensions::default()
            }));
        }
    }
    let mut el = make_flow_element(
        id,
        BpmnElementType::BusinessRuleTask,
        FlowElementOptions {
            name: options.and_then(|o| o.name.clone()),
            documentation: options.and_then(|o| o.documentation.clone()),
            execution_listeners: options.and_then(|o| o.execution_listeners.clone()),
            extension_elements: Some(ext),
            task_listeners: None,
        },
    )?;
    flag_compensation(&mut el, options.and_then(|o| o.is_for_compensation));
    Ok(with_multi_instance(
        el,
        options.and_then(|o| o.multi_instance.as_ref()),
    ))
}

/// TS's `makeCallActivityEl`.
pub(crate) fn make_call_activity_el(
    id: &str,
    options: &CallActivityOptions,
) -> Result<BpmnFlowElement, String> {
    // Pick explicitly so a stray taskHeaders from an untyped caller is dropped, not emitted.
    let mut extensions = build_mapping_extensions(
        options.io_mapping.as_ref(),
        None,
        options.zeebe_properties.as_deref(),
    );
    extensions.called_element = Some(ZeebeCalledElement {
        process_id: options.process_id.clone(),
        propagate_all_child_variables: options.propagate_all_child_variables,
        propagate_all_parent_variables: options.propagate_all_parent_variables,
        binding_type: options.binding_type,
        version_tag: options.version_tag.clone(),
    });
    let mut el = make_flow_element(
        id,
        BpmnElementType::CallActivity,
        FlowElementOptions {
            name: options.name.clone(),
            documentation: options.documentation.clone(),
            execution_listeners: options.execution_listeners.clone(),
            extension_elements: Some(zeebe_extensions_to_xml_elements(&extensions)),
            task_listeners: None,
        },
    )?;
    flag_compensation(&mut el, options.is_for_compensation);
    Ok(with_multi_instance(el, options.multi_instance.as_ref()))
}

/// TS's `makeExclusiveGatewayEl` / `makeInclusiveGatewayEl` / `makeComplexGatewayEl`
/// (`ty` is one of those three; `defaultFlow` only when non-empty).
pub(crate) fn make_defaultable_gateway_el(
    id: &str,
    ty: BpmnElementType,
    options: Option<&GatewayOptions>,
) -> Result<BpmnFlowElement, String> {
    let mut el = make_flow_element(
        id,
        ty,
        options
            .map(|o| FlowElementOptions::from(&o.element))
            .unwrap_or_default(),
    )?;
    if let Some(default_flow) = options
        .and_then(|o| o.default_flow.as_deref())
        .filter(|f| !f.is_empty())
    {
        if let Some(slot) = el.default_flow_mut() {
            *slot = Some(default_flow.to_owned());
        }
    }
    Ok(el)
}

fn message_task_el(
    id: &str,
    ty: BpmnElementType,
    options: Option<&MessageTaskOptions>,
    extension_elements: Option<Vec<XmlElement>>,
    shared: &mut Shared,
) -> Result<BpmnFlowElement, String> {
    let mut flow_options = options
        .map(|o| FlowElementOptions::from(&o.element))
        .unwrap_or_default();
    flow_options.extension_elements = extension_elements;
    let mut el = make_flow_element(id, ty, flow_options)?;
    flag_compensation(&mut el, options.and_then(|o| o.element.is_for_compensation));
    if let Some(name) = options
        .and_then(|o| o.message_name.as_deref())
        .filter(|n| !n.is_empty())
    {
        let message_ref = resolve_message(name, shared);
        match &mut el {
            BpmnFlowElement::SendTask(t) | BpmnFlowElement::ReceiveTask(t) => {
                t.message_ref = Some(message_ref);
            }
            _ => {}
        }
    }
    Ok(with_multi_instance(
        el,
        options.and_then(|o| o.multi_instance.as_ref()),
    ))
}

/// `sendTask()` of all three builders: element, compensation flag, message, multi-instance.
pub(crate) fn make_send_task_el(
    id: &str,
    options: Option<&MessageTaskOptions>,
    shared: &mut Shared,
) -> Result<BpmnFlowElement, String> {
    message_task_el(id, BpmnElementType::SendTask, options, None, shared)
}

/// `receiveTask()` of all three builders: as [`make_send_task_el`] plus the subscription.
pub(crate) fn make_receive_task_el(
    id: &str,
    options: Option<&MessageTaskOptions>,
    shared: &mut Shared,
) -> Result<BpmnFlowElement, String> {
    let ext = build_message_subscription_ext(
        "receiveTask",
        options.and_then(|o| o.message_name.as_deref()),
        options.and_then(|o| o.correlation_key.as_deref()),
    )?;
    message_task_el(id, BpmnElementType::ReceiveTask, options, Some(ext), shared)
}

/// `manualTask()` / `task()` of all three builders (`ty` is `ManualTask` or `Task`).
pub(crate) fn make_plain_task_el(
    id: &str,
    ty: BpmnElementType,
    options: Option<&ElementOptions>,
) -> Result<BpmnFlowElement, String> {
    let mut el = make_flow_element(
        id,
        ty,
        options.map(FlowElementOptions::from).unwrap_or_default(),
    )?;
    flag_compensation(&mut el, options.and_then(|o| o.is_for_compensation));
    Ok(el)
}

/// `endEvent()` of all three builders, minus the cursor: definitions only when options
/// are given.
pub(crate) fn make_end_event_el(
    id: &str,
    options: Option<&EndEventOptions>,
    shared: &mut Shared,
) -> Result<BpmnFlowElement, String> {
    let mut el = make_flow_element(
        id,
        BpmnElementType::EndEvent,
        options
            .map(|o| FlowElementOptions::from(&o.element))
            .unwrap_or_default(),
    )?;
    if let (Some(o), Some(defs)) = (options, el.event_definitions_mut()) {
        *defs = build_event_definitions(&EventDefinitionOptions::from(o), shared);
    }
    Ok(el)
}

/// `intermediateThrowEvent()` of all three builders, minus the cursor.
pub(crate) fn make_intermediate_throw_event_el(
    id: &str,
    options: Option<&IntermediateThrowEventOptions>,
    shared: &mut Shared,
) -> Result<BpmnFlowElement, String> {
    let mut el = make_flow_element(
        id,
        BpmnElementType::IntermediateThrowEvent,
        options
            .map(|o| FlowElementOptions::from(&o.element))
            .unwrap_or_default(),
    )?;
    if let (Some(o), Some(defs)) = (options, el.event_definitions_mut()) {
        *defs = build_event_definitions(&EventDefinitionOptions::from(o), shared);
    }
    Ok(el)
}

/// `intermediateCatchEvent()` of all three builders, minus the cursor (subscription
/// extension from `correlationKey`, definitions only when options are given).
pub(crate) fn make_intermediate_catch_event_el(
    id: &str,
    options: Option<&IntermediateCatchEventOptions>,
    shared: &mut Shared,
) -> Result<BpmnFlowElement, String> {
    let mut flow_options = options
        .map(|o| FlowElementOptions::from(&o.element))
        .unwrap_or_default();
    flow_options.extension_elements = Some(build_message_subscription_ext(
        "intermediateCatchEvent",
        options.and_then(|o| o.message_name.as_deref()),
        options.and_then(|o| o.correlation_key.as_deref()),
    )?);
    let mut el = make_flow_element(id, BpmnElementType::IntermediateCatchEvent, flow_options)?;
    if let (Some(o), Some(defs)) = (options, el.event_definitions_mut()) {
        *defs = build_event_definitions(&EventDefinitionOptions::from(o), shared);
    }
    Ok(el)
}

/// TS's `resolveBoundaryEventArgs`: refuses an empty `attachedTo` with TS's
/// `ValidationError` message.
pub(crate) fn resolve_boundary_event_args(
    id: &str,
    options: &BoundaryEventOptions,
) -> Result<(), String> {
    if options.attached_to.is_empty() {
        return Err(format!(
            "boundaryEvent(\"{id}\") requires the id of the activity it attaches to. Pass it as options.attachedTo, as boundaryEvent(\"{id}\", hostId, options), or use withBoundary() to attach to the preceding activity. See agent-cards/bpmn.md#traps."
        ));
    }
    Ok(())
}

/// `boundaryEvent()` of all three builders, minus the cursor: resolves the args, builds the
/// element with `attachedToRef`, `cancelActivity` and definitions.
pub(crate) fn make_boundary_event_el(
    id: &str,
    options: &BoundaryEventOptions,
    shared: &mut Shared,
) -> Result<BpmnFlowElement, String> {
    resolve_boundary_event_args(id, options)?;
    let mut flow_options = FlowElementOptions::from(&options.element);
    flow_options.extension_elements = Some(build_message_subscription_ext(
        "boundaryEvent",
        options.message_name.as_deref(),
        options.correlation_key.as_deref(),
    )?);
    let mut el = make_flow_element(id, BpmnElementType::BoundaryEvent, flow_options)?;
    if let BpmnFlowElement::BoundaryEvent(boundary) = &mut el {
        boundary.attached_to_ref = options.attached_to.clone();
        boundary.cancel_activity = options.cancel_activity;
        boundary.event_definitions =
            build_event_definitions(&EventDefinitionOptions::from(options), shared);
    }
    Ok(el)
}

/// TS's `makeDataElement` (`ty` is one of the three data types; `data_ref` is the
/// `dataObjectRef` / `dataStoreRef`).
pub(crate) fn make_data_element(
    id: &str,
    ty: BpmnElementType,
    data_ref: Option<&str>,
    options: Option<&DataElementOptions>,
) -> BpmnFlowElement {
    let mut el = create_flow_element(
        id,
        ty,
        CreateFlowElementOptions {
            name: options.and_then(|o| o.name.clone()),
            ..CreateFlowElementOptions::default()
        },
    );
    let collection = options.and_then(|o| o.is_collection) == Some(true);
    match &mut el {
        // BPMN20.xsd allows isCollection on the data object only; a reference asking for it
        // marks its target instead (`Scope::add_data_object_reference`).
        BpmnFlowElement::DataObjectReference(d) => {
            d.data_object_ref = data_ref.map(str::to_owned);
        }
        BpmnFlowElement::DataStoreReference(d) => d.data_store_ref = data_ref.map(str::to_owned),
        BpmnFlowElement::DataObject(d) if collection => d.is_collection = Some(true),
        _ => {}
    }
    el
}

/// TS's `recordToolGrid`.
pub(crate) fn record_tool_grid(
    shared: &mut Shared,
    id: &str,
    options: Option<&AdHocSubProcessOptions>,
) -> Result<(), String> {
    let Some(grid) = options.and_then(|o| o.tool_grid) else {
        return Ok(());
    };
    if let Some(columns) = grid.columns {
        let positive_integer = columns.is_finite() && columns.fract() == 0.0 && columns > 0.0;
        if !positive_integer {
            return Err(format!(
                "adHocSubProcess(\"{id}\"): toolGrid.columns must be a positive integer, got {}",
                js_number_to_string(columns)
            ));
        }
    }
    shared.grids.insert(id.to_owned(), grid.to_hint());
    Ok(())
}

// ── Scope finalisation ──────────────────────────────────────────────────────

/// TS's `insertJoinGateways`.
pub(crate) fn insert_join_gateways(
    elements: &mut Vec<BpmnFlowElement>,
    flows: &mut Vec<BpmnSequenceFlow>,
) {
    use BpmnElementType as T;
    // Complex gateways are not here: TS never infers a join for them.
    let is_splittable = |ty: T| {
        matches!(
            ty,
            T::ExclusiveGateway | T::ParallelGateway | T::InclusiveGateway | T::EventBasedGateway
        )
    };

    let mut element_types: IndexMap<String, T> = IndexMap::new();
    for el in elements.iter() {
        element_types.insert(el.base().id.clone(), el.element_type());
    }

    let mut out_count: IndexMap<String, usize> = IndexMap::new();
    for flow in flows.iter() {
        *out_count.entry(flow.source_ref.clone()).or_insert(0) += 1;
    }
    let mut split_gateways: IndexSet<String> = IndexSet::new();
    for (id, count) in &out_count {
        if let Some(&ty) = element_types.get(id) {
            if is_splittable(ty) && *count >= 2 {
                split_gateways.insert(id.clone());
            }
        }
    }
    if split_gateways.is_empty() {
        return;
    }

    // Indices, not clones: TS mutates the flow objects it finds here.
    let mut incoming: IndexMap<String, Vec<usize>> = IndexMap::new();
    for (i, flow) in flows.iter().enumerate() {
        incoming.entry(flow.target_ref.clone()).or_default().push(i);
    }

    for (target_id, in_flows) in &incoming {
        if in_flows.len() < 2 {
            continue;
        }
        let mut split_to_flows: IndexMap<String, Vec<usize>> = IndexMap::new();
        for &fi in in_flows {
            if let Some(split) = trace_back_to_split(&flows[fi].source_ref, &split_gateways, flows)
            {
                split_to_flows.entry(split).or_default().push(fi);
            }
        }
        for (split_id, converging) in &split_to_flows {
            if converging.len() < 2 {
                continue;
            }
            let Some(&gw_type) = element_types.get(split_id) else {
                continue;
            };
            // eventBasedGateway is split-only; converge through an XOR join instead
            let join_type = if gw_type == T::EventBasedGateway {
                T::ExclusiveGateway
            } else {
                gw_type
            };
            if element_types.get(target_id) == Some(&join_type) {
                continue;
            }
            let join_id = format!("{split_id}_join");
            if element_types.contains_key(&join_id) {
                continue;
            }
            // No listeners, so `makeFlowElement(.., {})` cannot fail here.
            elements.push(create_flow_element(
                &join_id,
                join_type,
                CreateFlowElementOptions::default(),
            ));
            element_types.insert(join_id.clone(), join_type);
            for &fi in converging {
                flows[fi].target_ref = join_id.clone();
            }
            flows.push(BpmnSequenceFlow {
                id: generate_id("Flow"),
                source_ref: join_id,
                target_ref: target_id.clone(),
                ..BpmnSequenceFlow::default()
            });
        }
    }
}

/// TS's `finalizeScope`: event-definition ids, joins, stable flow ids, incoming/outgoing.
pub(crate) fn finalize_scope(
    elements: &mut Vec<BpmnFlowElement>,
    flows: &mut Vec<BpmnSequenceFlow>,
    shared: &mut Shared,
) -> Result<(), String> {
    for el in elements.iter_mut() {
        let id = el.base().id.clone();
        if let Some(defs) = el.event_definitions_mut() {
            assign_event_definition_ids(&id, defs);
        }
    }
    insert_join_gateways(elements, flows);
    assign_stable_flow_ids(elements, flows, &mut shared.flow_tags, None)?;
    recompute_incoming_outgoing(elements, flows);
    Ok(())
}

/// TS's `traceBackToSplit`.
pub(crate) fn trace_back_to_split(
    node_id: &str,
    split_gateways: &IndexSet<String>,
    flows: &[BpmnSequenceFlow],
) -> Option<String> {
    let mut visited: IndexSet<&str> = IndexSet::new();
    let mut current = node_id;
    while !current.is_empty() {
        if !visited.insert(current) {
            return None;
        }
        if split_gateways.contains(current) {
            return Some(current.to_owned());
        }
        let mut in_flows = flows.iter().filter(|f| f.target_ref == current);
        let prev = in_flows.next()?;
        if in_flows.next().is_some() {
            return None;
        }
        current = &prev.source_ref;
    }
    None
}

/// TS's `mergeRootDefinitions`: appends the definitions of `incoming` whose id is new.
pub(crate) fn merge_root_definitions<T: Clone>(
    into: &mut Vec<T>,
    incoming: &[T],
    id_of: impl Fn(&T) -> &str,
) {
    let mut present: IndexSet<String> = into.iter().map(|d| id_of(d).to_owned()).collect();
    for definition in incoming {
        if !present.insert(id_of(definition).to_owned()) {
            continue;
        }
        into.push(definition.clone());
    }
}

// Child module because `elements` is crate-private: an integration test cannot reach it.
#[cfg(test)]
#[path = "../tests/oracle/elements_unit.rs"]
mod tests;
