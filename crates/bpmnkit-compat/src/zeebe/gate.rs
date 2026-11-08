//! `assertDeployable`: the Rust twin of `@bpmnkit/core`'s `zeebe-validate/gate.ts`.
//! Refuses a model Zeebe would reject on deploy, or fills documented placeholders
//! first when asked. Messages and fills match TS byte for byte (`conformance/gate/`).

use std::borrow::Cow;
use std::fmt;

use bpmnkit_bpmn::model::{
    BpmnConditionExpression, BpmnError, BpmnEscalation, BpmnEventDefinition, BpmnFlowElement,
    BpmnMessage, BpmnProcessContents, BpmnSequenceFlow, BpmnSignal,
};
use bpmnkit_bpmn::{serialize_bpmn, BpmnDefinitions};
use bpmnkit_spec::zeebe::ZEEBE_LATEST_VERSION;
use bpmnkit_xml::{Attrs, XmlElement};
use serde::Serialize;

use super::{
    is_deployable, local_ref, validate_deployable_xml, ValidateOptions, ZeebeLimits, ZeebeResolver,
    ZEEBE_NS,
};
use crate::finding::{Finding, FindingData, Severity};

/// `AssertDeployableOptions`: the validator's options plus `placeholders`.
#[derive(Default)]
pub struct AssertOptions<'r> {
    /// The Camunda 8 version, e.g. `"8.6"`; defaults to the newest supported.
    pub camunda_version: Option<String>,
    pub resolver: Option<&'r dyn ZeebeResolver>,
    pub limits: ZeebeLimits,
    /// Fill the documented [`PLACEHOLDERS`] instead of refusing (default `false`).
    pub placeholders: bool,
}

/// `PlaceholderField`.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize)]
#[serde(rename_all = "camelCase")]
pub enum PlaceholderField {
    JobType,
    MessageName,
    CorrelationKey,
    SignalName,
    ErrorCode,
    EscalationCode,
    Timer,
    CalledElement,
    DecisionId,
    Condition,
}

impl PlaceholderField {
    /// The TS name, e.g. `jobType`.
    pub const fn as_str(self) -> &'static str {
        match self {
            Self::JobType => "jobType",
            Self::MessageName => "messageName",
            Self::CorrelationKey => "correlationKey",
            Self::SignalName => "signalName",
            Self::ErrorCode => "errorCode",
            Self::EscalationCode => "escalationCode",
            Self::Timer => "timer",
            Self::CalledElement => "calledElement",
            Self::DecisionId => "decisionId",
            Self::Condition => "condition",
        }
    }
}

/// `PlaceholderFill`: one value the gate wrote.
#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PlaceholderFill {
    /// The element that got the value (a flow node, sequence flow or root element).
    pub element_id: String,
    pub field: PlaceholderField,
    pub value: String,
    /// The `zeebe/*` rule the value satisfies.
    pub rule: String,
}

/// One row of [`PLACEHOLDERS`].
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct Placeholder {
    pub field: PlaceholderField,
    /// The value; `<elementId>` stands for the id of the element that gets it.
    pub value: &'static str,
    /// Where it is written.
    pub r#where: &'static str,
}

/// `PLACEHOLDERS`: every placeholder value, by field, as TS documents them.
pub const PLACEHOLDERS: [Placeholder; 10] = [
    Placeholder {
        field: PlaceholderField::JobType,
        value: "placeholder-<elementId>",
        r#where: "zeebe:taskDefinition type of a service task, send task, script task without a script, business rule task without a decision, or message throw/end event without zeebe:publishMessage",
    },
    Placeholder {
        field: PlaceholderField::MessageName,
        value: "placeholder-<elementId>",
        r#where: "name of a message without one; a missing messageRef gets a new message with this id and name",
    },
    Placeholder {
        field: PlaceholderField::CorrelationKey,
        value: "=\"placeholder-<elementId>\"",
        r#where: "correlationKey of zeebe:subscription (added when missing) or zeebe:publishMessage",
    },
    Placeholder {
        field: PlaceholderField::SignalName,
        value: "placeholder-<elementId>",
        r#where: "name of a signal without one; a missing signalRef gets a new signal with this id and name",
    },
    Placeholder {
        field: PlaceholderField::ErrorCode,
        value: "placeholder-<elementId>",
        r#where: "errorCode of the error an error end event throws; a missing errorRef gets a new error with this id and code",
    },
    Placeholder {
        field: PlaceholderField::EscalationCode,
        value: "placeholder-<elementId>",
        r#where: "escalationCode of a thrown escalation; a missing escalationRef gets a new escalation with this id and code",
    },
    Placeholder {
        field: PlaceholderField::Timer,
        value: TIMER,
        r#where: "timeDuration of a timer event definition with no duration, date or cycle",
    },
    Placeholder {
        field: PlaceholderField::CalledElement,
        value: "placeholder-<elementId>",
        r#where: "processId of a call activity's zeebe:calledElement (added when missing)",
    },
    Placeholder {
        field: PlaceholderField::DecisionId,
        value: "placeholder-<elementId>",
        r#where: "decisionId of a business rule task's zeebe:calledDecision",
    },
    Placeholder {
        field: PlaceholderField::Condition,
        value: CONDITION,
        r#where: "condition of a non-default outgoing flow of an exclusive or inclusive gateway, so the flow is never taken",
    },
];

const TIMER: &str = "PT1H";
const CONDITION: &str = "=false";

/// Filling one kind of value can reveal the next (a new message then needs a subscription).
const MAX_FILL_ROUNDS: usize = 4;

/// `DeployableResult`.
#[derive(Debug, Clone)]
pub struct Deployable<'a> {
    /// The input when nothing was filled, else the filled copy; the input is never mutated.
    pub definitions: Cow<'a, BpmnDefinitions>,
    /// The values filled, in the order they were written; empty unless `placeholders`.
    pub placeholders: Vec<PlaceholderFill>,
    /// Findings below severity `error`.
    pub warnings: Vec<FindingData>,
}

/// `DeployabilityError` (code `deployability-error`): Zeebe would reject the model.
#[derive(Debug, Clone, PartialEq)]
pub struct DeployabilityError {
    /// The findings of severity `error`, in the validator's order.
    pub findings: Vec<FindingData>,
    /// The `major.minor` Camunda version the model was checked for.
    pub camunda_version: String,
    message: String,
}

impl DeployabilityError {
    /// TS's `err.code`.
    pub const CODE: &'static str = "deployability-error";

    /// The message, identical to TS's.
    pub fn message(&self) -> &str {
        &self.message
    }
}

impl fmt::Display for DeployabilityError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str(&self.message)
    }
}

impl std::error::Error for DeployabilityError {}

/// `modeler:executionPlatform` names Camunda 8 ("Camunda Cloud", any case), as
/// `target_camunda_version` reads it: TS's `targetsCamunda8`, the models `export_bpmn`
/// and the builders gate.
pub fn targets_camunda8(definitions: &BpmnDefinitions) -> bool {
    definitions
        .unknown_attributes
        .get("modeler:executionPlatform")
        .is_some_and(|p| p.to_lowercase().contains("cloud"))
}

/// The message of a [`DeployabilityError`]; TS's `deployabilityMessage`.
pub fn deployability_message(camunda_version: &str, errors: &[FindingData]) -> String {
    let mut out = format!(
        "Not deployable on Camunda {camunda_version}: {} error(s)",
        errors.len()
    );
    for f in errors {
        let id = f.element_ids.first().map(String::as_str).unwrap_or("");
        out.push_str(&format!("\n- {id}: {} ({})", f.message, f.id));
    }
    out
}

fn check(definitions: &BpmnDefinitions, options: &AssertOptions) -> Vec<Finding> {
    // The serialized XML, not the model: what is deployed is the XML, so serializer bugs count too.
    validate_deployable_xml(
        &serialize_bpmn(definitions),
        &ValidateOptions {
            camunda_version: options.camunda_version.clone(),
            resolver: options.resolver,
            limits: options.limits,
        },
    )
}

/// `assertDeployable`: the model to deploy (the input, or a filled copy), or every
/// reason Zeebe would reject it.
pub fn assert_deployable<'a>(
    definitions: &'a BpmnDefinitions,
    options: &AssertOptions,
) -> Result<Deployable<'a>, DeployabilityError> {
    let version = crate::compat::normalize_camunda_version(options.camunda_version.as_deref())
        .map(|v| v.as_str())
        .unwrap_or(ZEEBE_LATEST_VERSION);
    let mut result = Cow::Borrowed(definitions);
    let mut findings = check(definitions, options);
    let mut fills = vec![];
    if options.placeholders && !is_deployable(&findings) {
        let mut copy = definitions.clone();
        let mut round = 0;
        while round < MAX_FILL_ROUNDS && !is_deployable(&findings) {
            let added = fill_placeholders(&mut copy, &findings);
            if added.is_empty() {
                break;
            }
            fills.extend(added);
            findings = check(&copy, options);
            round += 1;
        }
        if !fills.is_empty() {
            result = Cow::Owned(copy);
        }
    }
    let (errors, warnings): (Vec<FindingData>, Vec<FindingData>) = findings
        .into_iter()
        .map(|f| f.data)
        .partition(|f| f.severity == Severity::Error);
    if !errors.is_empty() {
        return Err(DeployabilityError {
            message: deployability_message(version, &errors),
            findings: errors,
            camunda_version: version.to_string(),
        });
    }
    Ok(Deployable {
        definitions: result,
        placeholders: fills,
        warnings,
    })
}

// ---------------------------------------------------------------------------
// Filling
// ---------------------------------------------------------------------------

fn placeholder(id: &str) -> String {
    format!("placeholder-{id}")
}

fn blank(v: Option<&str>) -> bool {
    v.is_none_or(|v| v.trim().is_empty())
}

fn attr_blank(el: &XmlElement, name: &str) -> bool {
    blank(el.attr(name))
}

/// The first flow node with the id, depth first, as TS's index finds it, and whether it
/// sits directly in a process.
fn find_node<'a>(
    elements: &'a mut [BpmnFlowElement],
    id: &str,
    top: bool,
) -> Option<(&'a mut BpmnFlowElement, bool)> {
    for el in elements.iter_mut() {
        if el.base().id == id {
            return Some((el, top));
        }
        if let Some(c) = el.contents_mut() {
            if let Some(found) = find_node(&mut c.flow_elements, id, false) {
                return Some(found);
            }
        }
    }
    None
}

/// The first sequence flow with the id: a scope's nested scopes come before its own flows.
fn find_flow<'a>(
    contents: &'a mut BpmnProcessContents,
    id: &str,
) -> Option<&'a mut BpmnSequenceFlow> {
    for el in contents.flow_elements.iter_mut() {
        if let Some(c) = el.contents_mut() {
            if let Some(f) = find_flow(c, id) {
                return Some(f);
            }
        }
    }
    contents.sequence_flows.iter_mut().find(|f| f.id == id)
}

struct Filler {
    fills: Vec<PlaceholderFill>,
    namespaces: Attrs,
    /// The prefix new zeebe:* elements get: the model's own one for the Zeebe namespace.
    prefix: String,
    /// The rule of the finding being filled.
    rule: String,
}

impl Filler {
    fn new(defs: &BpmnDefinitions) -> Self {
        let prefix = defs
            .namespaces
            .iter()
            .find(|(_, uri)| uri.as_str() == ZEEBE_NS)
            .map(|(p, _)| p.clone())
            .unwrap_or_else(|| "zeebe".to_string());
        Self {
            fills: vec![],
            namespaces: defs.namespaces.clone(),
            prefix,
            rule: String::new(),
        }
    }

    fn record(&mut self, element_id: &str, field: PlaceholderField, value: &str) {
        self.fills.push(PlaceholderFill {
            element_id: element_id.to_string(),
            field,
            value: value.to_string(),
            rule: self.rule.clone(),
        });
    }

    fn is_zeebe(&self, name: &str, local: &str) -> bool {
        let Some((prefix, rest)) = name.split_once(':') else {
            return false;
        };
        rest == local
            && match self.namespaces.get(prefix) {
                Some(uri) => uri == ZEEBE_NS,
                None => prefix == "zeebe",
            }
    }

    fn count(&self, elements: &[XmlElement], local: &str) -> usize {
        elements
            .iter()
            .filter(|x| self.is_zeebe(&x.name, local))
            .count()
    }

    fn element(&self, local: &str, attributes: &[(&str, String)]) -> XmlElement {
        let mut el = XmlElement::new(format!("{}:{local}", self.prefix));
        for (k, v) in attributes {
            el.attributes.insert((*k).to_string(), v.clone());
        }
        el
    }

    /// A job type on a node that has no implementation at all.
    fn add_job_type(&mut self, node: &mut BpmnFlowElement, others: usize) {
        let ext = &node.base().extension_elements;
        if others > 0 || self.count(ext, "taskDefinition") > 0 {
            return;
        }
        let id = node.base().id.clone();
        let value = placeholder(&id);
        let el = self.element("taskDefinition", &[("type", value.clone())]);
        node.base_mut().extension_elements.push(el);
        self.record(&id, PlaceholderField::JobType, &value);
    }

    /// Sets `attribute` on every `zeebe:<local>` of `elements` where it is blank.
    fn set_blank(
        &mut self,
        elements: &mut [XmlElement],
        local: &str,
        attribute: &str,
        element_id: &str,
        field: PlaceholderField,
        value: &str,
    ) {
        for el in elements.iter_mut() {
            if !self.is_zeebe(&el.name, local) || !attr_blank(el, attribute) {
                continue;
            }
            el.attributes
                .insert(attribute.to_string(), value.to_string());
            self.record(element_id, field, value);
        }
    }

    /// The message a node references, created when the reference does not resolve. A message
    /// a node catches gets its subscription here, keyed on the node.
    fn message(
        &mut self,
        messages: &mut Vec<BpmnMessage>,
        node_id: &str,
        reference: Option<&str>,
        subscribe: bool,
    ) -> Option<String> {
        if reference.is_some_and(|r| messages.iter().any(|m| m.id == local_ref(r))) {
            return None;
        }
        let id = placeholder(node_id);
        if !messages.iter().any(|m| m.id == id) {
            let mut message = BpmnMessage {
                id: id.clone(),
                name: Some(id.clone()),
                ..BpmnMessage::default()
            };
            self.record(node_id, PlaceholderField::MessageName, &id);
            if subscribe {
                let key = format!("=\"{id}\"");
                message.extension_elements = Some(vec![
                    self.element("subscription", &[("correlationKey", key.clone())])
                ]);
                self.record(node_id, PlaceholderField::CorrelationKey, &key);
            }
            messages.push(message);
        }
        Some(id)
    }

    fn fill(&mut self, defs: &mut BpmnDefinitions, f: &FindingData) {
        self.rule = f.id.clone();
        let id = f.element_ids.first().cloned().unwrap_or_default();
        let BpmnDefinitions {
            processes,
            messages,
            signals,
            errors,
            escalations,
            ..
        } = defs;
        let mut node = None;
        for p in processes.iter_mut() {
            if let Some(found) = find_node(&mut p.contents.flow_elements, &id, true) {
                node = Some(found);
                break;
            }
        }
        let rule = f.id.strip_prefix("zeebe/").unwrap_or(&f.id);
        match rule {
            "service-task-definition" => {
                if let Some((n @ BpmnFlowElement::ServiceTask(_), _)) = node {
                    self.add_job_type(n, 0);
                }
            }
            "script-task-implementation"
            | "send-task-implementation"
            | "business-rule-task-implementation" => {
                let (ty, other) = match rule {
                    "script-task-implementation" => ("scriptTask", "script"),
                    "send-task-implementation" => ("sendTask", "publishMessage"),
                    _ => ("businessRuleTask", "calledDecision"),
                };
                if let Some((n, _)) = node.filter(|(n, _)| n.type_name() == ty) {
                    let others = self.count(&n.base().extension_elements, other);
                    self.add_job_type(n, others);
                }
            }
            "message-throw-implementation" => {
                if let Some((n, _)) = node {
                    let publish = n
                        .event_definitions()
                        .unwrap_or(&[])
                        .iter()
                        .map(|d| match d {
                            BpmnEventDefinition::Message(m) => self.count(
                                m.extension_elements.as_deref().unwrap_or(&[]),
                                "publishMessage",
                            ),
                            _ => 0,
                        })
                        .sum();
                    self.add_job_type(n, publish);
                }
            }
            "task-definition-type" => {
                if let Some((n, _)) = node {
                    let value = placeholder(&id);
                    let ext = &mut n.base_mut().extension_elements;
                    self.set_blank(
                        ext,
                        "taskDefinition",
                        "type",
                        &id,
                        PlaceholderField::JobType,
                        &value,
                    );
                }
            }
            "message-reference" | "message-throw-reference" => {
                if let Some((n, top)) = node {
                    let subscribe =
                        rule == "message-reference" && !(top && n.type_name() == "startEvent");
                    for d in n.event_definitions_mut().into_iter().flatten() {
                        if let BpmnEventDefinition::Message(m) = d {
                            if let Some(r) =
                                self.message(messages, &id, m.message_ref.as_deref(), subscribe)
                            {
                                m.message_ref = Some(r);
                            }
                        }
                    }
                }
            }
            "receive-task-message" | "send-task-message" => {
                if let Some((BpmnFlowElement::SendTask(t) | BpmnFlowElement::ReceiveTask(t), _)) =
                    node
                {
                    let subscribe = rule == "receive-task-message";
                    if let Some(r) =
                        self.message(messages, &id, t.message_ref.as_deref(), subscribe)
                    {
                        t.message_ref = Some(r);
                    }
                }
            }
            "message-name" => {
                if let Some(m) = messages.iter_mut().find(|m| m.id == id) {
                    if blank(m.name.as_deref()) {
                        let value = placeholder(&id);
                        m.name = Some(value.clone());
                        self.record(&id, PlaceholderField::MessageName, &value);
                    }
                }
            }
            "message-subscription" => {
                if let Some(m) = messages.iter_mut().find(|m| m.id == id) {
                    let ext = m.extension_elements.get_or_insert_with(Vec::new);
                    if self.count(ext, "subscription") == 0 {
                        let value = format!("=\"{}\"", placeholder(&id));
                        ext.push(
                            self.element("subscription", &[("correlationKey", value.clone())]),
                        );
                        self.record(&id, PlaceholderField::CorrelationKey, &value);
                    }
                }
            }
            "subscription-correlation-key" => {
                if let Some(m) = messages.iter_mut().find(|m| m.id == id) {
                    if let Some(ext) = m.extension_elements.as_mut() {
                        let value = format!("=\"{}\"", placeholder(&id));
                        self.set_blank(
                            ext,
                            "subscription",
                            "correlationKey",
                            &id,
                            PlaceholderField::CorrelationKey,
                            &value,
                        );
                    }
                }
            }
            "publish-message-correlation-key" => {
                if let Some((n, _)) = node {
                    let value = format!("=\"{}\"", placeholder(&id));
                    self.set_blank(
                        &mut n.base_mut().extension_elements,
                        "publishMessage",
                        "correlationKey",
                        &id,
                        PlaceholderField::CorrelationKey,
                        &value,
                    );
                    for d in n.event_definitions_mut().into_iter().flatten() {
                        if let BpmnEventDefinition::Message(m) = d {
                            if let Some(ext) = m.extension_elements.as_mut() {
                                self.set_blank(
                                    ext,
                                    "publishMessage",
                                    "correlationKey",
                                    &id,
                                    PlaceholderField::CorrelationKey,
                                    &value,
                                );
                            }
                        }
                    }
                }
            }
            "signal-reference" => {
                if let Some((n, _)) = node {
                    for d in n.event_definitions_mut().into_iter().flatten() {
                        let BpmnEventDefinition::Signal(s) = d else {
                            continue;
                        };
                        if let Some(r) = s.signal_ref.as_deref() {
                            if signals.iter().any(|x| x.id == local_ref(r)) {
                                continue;
                            }
                        }
                        let sid = placeholder(&id);
                        if !signals.iter().any(|x| x.id == sid) {
                            signals.push(BpmnSignal {
                                id: sid.clone(),
                                name: Some(sid.clone()),
                                ..BpmnSignal::default()
                            });
                            self.record(&id, PlaceholderField::SignalName, &sid);
                        }
                        s.signal_ref = Some(sid);
                    }
                }
            }
            "signal-name" => {
                if let Some(s) = signals.iter_mut().find(|s| s.id == id) {
                    if blank(s.name.as_deref()) {
                        let value = placeholder(&id);
                        s.name = Some(value.clone());
                        self.record(&id, PlaceholderField::SignalName, &value);
                    }
                }
            }
            "error-end-reference" | "error-code" => {
                if let Some((n, _)) = node {
                    for d in n.event_definitions_mut().into_iter().flatten() {
                        let BpmnEventDefinition::Error(e) = d else {
                            continue;
                        };
                        let code = placeholder(&id);
                        let existing = e
                            .error_ref
                            .as_deref()
                            .and_then(|r| errors.iter_mut().find(|x| x.id == local_ref(r)));
                        match existing {
                            None => {
                                if !errors.iter().any(|x| x.id == code) {
                                    errors.push(BpmnError {
                                        id: code.clone(),
                                        name: Some(code.clone()),
                                        error_code: Some(code.clone()),
                                        ..BpmnError::default()
                                    });
                                    self.record(&id, PlaceholderField::ErrorCode, &code);
                                }
                                e.error_ref = Some(code);
                            }
                            Some(error) if blank(error.error_code.as_deref()) => {
                                error.error_code = Some(code.clone());
                                self.record(&id, PlaceholderField::ErrorCode, &code);
                            }
                            Some(_) => {}
                        }
                    }
                }
            }
            "escalation-throw-reference" => {
                if let Some((n, _)) = node {
                    for d in n.event_definitions_mut().into_iter().flatten() {
                        let BpmnEventDefinition::Escalation(e) = d else {
                            continue;
                        };
                        if let Some(r) = e.escalation_ref.as_deref() {
                            if escalations.iter().any(|x| x.id == local_ref(r)) {
                                continue;
                            }
                        }
                        let code = placeholder(&id);
                        if !escalations.iter().any(|x| x.id == code) {
                            escalations.push(BpmnEscalation {
                                id: code.clone(),
                                name: Some(code.clone()),
                                escalation_code: Some(code.clone()),
                                ..BpmnEscalation::default()
                            });
                            self.record(&id, PlaceholderField::EscalationCode, &code);
                        }
                        e.escalation_ref = Some(code);
                    }
                }
            }
            "escalation-code" => {
                if let Some(e) = escalations.iter_mut().find(|e| e.id == id) {
                    if blank(e.escalation_code.as_deref()) {
                        let value = placeholder(&id);
                        e.escalation_code = Some(value.clone());
                        self.record(&id, PlaceholderField::EscalationCode, &value);
                    }
                }
            }
            "timer-one-value" | "intermediate-timer-value" => {
                if let Some((n, _)) = node {
                    for d in n.event_definitions_mut().into_iter().flatten() {
                        let BpmnEventDefinition::Timer(t) = d else {
                            continue;
                        };
                        if t.time_duration.is_some()
                            || t.time_date.is_some()
                            || t.time_cycle.is_some()
                        {
                            continue;
                        }
                        t.time_duration = Some(TIMER.to_string());
                        self.record(&id, PlaceholderField::Timer, TIMER);
                    }
                }
            }
            "call-activity-called-element" => {
                if let Some((n @ BpmnFlowElement::CallActivity(_), _)) = node {
                    if self.count(&n.base().extension_elements, "calledElement") == 0 {
                        let value = placeholder(&id);
                        let el = self.element("calledElement", &[("processId", value.clone())]);
                        n.base_mut().extension_elements.push(el);
                        self.record(&id, PlaceholderField::CalledElement, &value);
                    }
                }
            }
            "called-element-process-id" => {
                if let Some((n, _)) = node {
                    let value = placeholder(&id);
                    self.set_blank(
                        &mut n.base_mut().extension_elements,
                        "calledElement",
                        "processId",
                        &id,
                        PlaceholderField::CalledElement,
                        &value,
                    );
                }
            }
            "called-decision-attributes" => {
                if let Some((n, _)) = node {
                    let value = placeholder(&id);
                    self.set_blank(
                        &mut n.base_mut().extension_elements,
                        "calledDecision",
                        "decisionId",
                        &id,
                        PlaceholderField::DecisionId,
                        &value,
                    );
                }
            }
            "exclusive-flow-condition" | "inclusive-flow-condition" => {
                let flow = processes
                    .iter_mut()
                    .find_map(|p| find_flow(&mut p.contents, &id));
                if let Some(flow) = flow {
                    if flow.condition_expression.is_none() {
                        let mut attributes = Attrs::new();
                        attributes.insert("xsi:type".into(), "bpmn:tFormalExpression".into());
                        flow.condition_expression = Some(BpmnConditionExpression {
                            text: CONDITION.to_string(),
                            attributes,
                        });
                        self.record(&id, PlaceholderField::Condition, CONDITION);
                    }
                }
            }
            _ => {}
        }
    }
}

/// Fills what the error findings ask for, in the findings' order; mutates `defs`.
fn fill_placeholders(defs: &mut BpmnDefinitions, findings: &[Finding]) -> Vec<PlaceholderFill> {
    let mut filler = Filler::new(defs);
    for f in findings {
        if f.data.severity == Severity::Error {
            filler.fill(defs, &f.data);
        }
    }
    filler.fills
}
