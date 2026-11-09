//! Port of `bpmn/compact.ts` lines 197–240 (`defaultFlows`) and 456–1100: `expand` and
//! its helpers (`compactProblems`, `makeEventDef`, `isConnectorJobType`, `zeebeConfig`,
//! `definedAttributes`, `makeExtensions`, `buildSubContent`, `templateAttributes`,
//! `buildFlowElement`, `buildDiagram`, `expandProcess`).
//!
//! Porter notes:
//! - Errors are TS's messages: `expand: invalid CompactDiagram — p1; p2` (U+2014), the two
//!   `defaultFlows` messages, `Unhandled BPMN element type in expand(): <type>`.
//! - `compactProblems` checks `typeof el.id !== "string" || el.id === ""`: an absent id
//!   deserializes as `""`. `EVENT_TYPES` order is the order listed in the message.
//! - `zeebeConfig`: `inputs = { ...el.inputs }` then `??=` (JsRecord::insert_if_absent).
//!   `isConnectorJobType` is `/^io\.camunda[.:]/`.
//! - `buildFlowElement` runs `assign_event_definition_ids` and `make_conditional_definition`
//!   from `bpmnkit_bpmn`; check the order TS adds extension elements and attributes.
//!   Condition expressions on flows here have EMPTY attributes (`{ text, attributes: {} }`).
//! - `buildDiagram`: `bpmnkit_layout::layout_process(&process, LayoutEngine::Semantic,
//!   &IndexSet::new(), None)`; shapes `<id>_di` with `isExpanded`, `bounds`, `label` only
//!   when the node has label bounds, `isMarkerVisible: true` only on exclusive gateways;
//!   annotations via `pack_annotations` + `add_annotation_shapes`, then the shift into the
//!   positive quadrant (`-Math.min(0, ...xs)`), labels and waypoints moved too (a moved
//!   waypoint drops any other attributes: TS writes `{ x, y }`).
//! - `expand` namespaces: `modeler` when gated or with a platform version;
//!   `modeler:executionPlatform` likewise, `modeler:executionPlatformVersion` only with a
//!   version. No `exporter`. Then `assert_deployable` unless `validate` is `false`.
//! - [`CompactRoots`]: the messages (per name and correlation key), signals (per name),
//!   errors and escalations (per code) the elements name, with `root_definition_id` ids.

use bpmnkit_bpmn::feel_condition::to_feel_condition;
use bpmnkit_bpmn::js::js_number_to_string;
use bpmnkit_bpmn::rest_connector::rest_connector_task_type;
use bpmnkit_bpmn::stable_ids::{assign_event_definition_ids, root_definition_id};
use bpmnkit_bpmn::zeebe::make_conditional_definition;
use bpmnkit_bpmn::{
    Attrs, BpmnActivity, BpmnAdHocSubProcess, BpmnAssociation, BpmnBoundaryEvent, BpmnBounds,
    BpmnConditionExpression, BpmnDataObject, BpmnDataObjectReference, BpmnDataStoreReference,
    BpmnDefinitions, BpmnDiEdge, BpmnDiLabel, BpmnDiPlane, BpmnDiShape, BpmnDiagram,
    BpmnElementType, BpmnError, BpmnEscalation, BpmnEvent, BpmnEventDefinition,
    BpmnEventSubProcess, BpmnFlowElement, BpmnFlowNodeBase, BpmnGateway, BpmnMessage,
    BpmnMessageTask, BpmnMultiInstanceLoopCharacteristics, BpmnProcess, BpmnProcessContents,
    BpmnSequenceFlow, BpmnSignal, BpmnStartEvent, BpmnSubProcess, BpmnTextAnnotation,
    BpmnTransaction, BpmnWaypoint, XmlElement,
};
use bpmnkit_compat::compat::normalize_camunda_version;
use bpmnkit_compat::zeebe::{assert_deployable, AssertOptions};
use bpmnkit_layout::annotations::pack_annotations;
use bpmnkit_layout::auto_layout::add_annotation_shapes;
use bpmnkit_layout::{layout_process, LayoutEngine};
use indexmap::{IndexMap, IndexSet};
use std::borrow::Cow;

use super::types::*;
use crate::js_record::JsRecord;
use crate::TextError;

/// The gateway types that carry a `bpmn:default`.
const DEFAULTABLE: [&str; 3] = ["exclusiveGateway", "inclusiveGateway", "complexGateway"];

/// TS's `defaultFlows`: gateway id → the id of its flow marked `isDefault`.
pub fn default_flows(
    elements: &[CompactElement],
    flows: &[CompactFlow],
) -> Result<IndexMap<String, String>, TextError> {
    let types: IndexMap<&str, &str> = elements
        .iter()
        .map(|e| (e.id.as_str(), e.type_.as_str()))
        .collect();
    let mut defaults: IndexMap<String, String> = IndexMap::new();
    for flow in flows {
        if flow.is_default != Some(true) {
            continue;
        }
        let type_ = types.get(flow.from.as_str());
        if !type_.is_some_and(|t| DEFAULTABLE.contains(t)) {
            let what = match type_ {
                None => format!("unknown element \"{}\"", flow.from),
                Some(t) => format!("a {t}"),
            };
            return Err(TextError::new(format!(
                "flow \"{}\" is marked isDefault but leaves {what}. Only an exclusive, inclusive or complex gateway has a default flow.",
                flow.id
            )));
        }
        if let Some(already) = defaults.get(&flow.from) {
            return Err(TextError::new(format!(
                "gateway \"{}\" marks two flows as default, \"{already}\" and \"{}\". A gateway has at most one.",
                flow.from, flow.id
            )));
        }
        defaults.insert(flow.from.clone(), flow.id.clone());
    }
    Ok(defaults)
}

const EVENT_TYPES: [&str; 10] = [
    "timer",
    "error",
    "message",
    "signal",
    "escalation",
    "cancel",
    "terminate",
    "conditional",
    "link",
    "compensate",
];

/// State `compactProblems`'s closures share.
#[derive(Default)]
struct Problems {
    problems: Vec<String>,
    seen: IndexSet<String>,
    /// Every element id, at any depth: what a note may name.
    element_ids: IndexSet<String>,
}

impl Problems {
    fn claim(&mut self, id: &str, what: &str) {
        if self.seen.contains(id) {
            self.problems
                .push(format!("duplicate id \"{id}\" ({what})"));
        }
        self.seen.insert(id.to_owned());
    }

    fn check_scope(&mut self, elements: &[CompactElement], flows: &[CompactFlow], scope: &str) {
        let mut ids: IndexSet<&str> = IndexSet::new();
        for el in elements {
            if el.id.is_empty() {
                self.problems
                    .push(format!("a {} in {scope} has no id", el.type_));
                continue;
            }
            self.claim(&el.id, &el.type_);
            ids.insert(&el.id);
            self.element_ids.insert(el.id.clone());
            if let Some(event_type) = &el.event_type {
                if !EVENT_TYPES.contains(&event_type.as_str()) {
                    self.problems.push(format!(
                        "element \"{}\" has unknown eventType \"{event_type}\" (expected one of {})",
                        el.id,
                        EVENT_TYPES.join(", ")
                    ));
                }
            }
        }
        for el in elements {
            if el.type_ == "boundaryEvent" {
                match &el.attached_to {
                    None => self
                        .problems
                        .push(format!("boundary event \"{}\" has no attachedTo", el.id)),
                    Some(host) if !ids.contains(host.as_str()) => self.problems.push(format!(
                        "boundary event \"{}\" is attached to \"{host}\", which is not an element in {scope}",
                        el.id
                    )),
                    Some(_) => {}
                }
            }
            if let Some(children) = &el.children {
                self.check_scope(
                    &children.elements,
                    &children.flows,
                    &format!("\"{}\"", el.id),
                );
            }
        }
        for flow in flows {
            let label = if flow.id.is_empty() {
                format!("flow from \"{}\" to \"{}\"", flow.from, flow.to)
            } else {
                format!("flow \"{}\"", flow.id)
            };
            if flow.id.is_empty() {
                self.problems.push(format!("{label} has no id"));
            } else {
                self.claim(&flow.id, "sequence flow");
            }
            for end in [&flow.from, &flow.to] {
                if !ids.contains(end.as_str()) {
                    self.problems.push(format!(
                        "{label} references \"{end}\", which is not an element in {scope}"
                    ));
                }
            }
        }
    }
}

/// TS's `compactProblems`: every reason the diagram cannot become valid BPMN.
fn compact_problems(compact: &CompactDiagram) -> Vec<String> {
    let mut state = Problems::default();
    for process in &compact.processes {
        state.claim(&process.id, "process");
        state.check_scope(
            &process.elements,
            &process.flows,
            &format!("process \"{}\"", process.id),
        );
        for note in process.notes.iter().flatten() {
            if !state.element_ids.contains(note.element_id.as_str()) {
                state.problems.push(format!(
                    "a note is on \"{}\", which is not an element in the diagram",
                    note.element_id
                ));
            }
        }
    }
    state.problems
}

/// TS's `makeEventDef`: an empty definition of the named type, or `None`.
pub fn make_event_def(event_type: &str) -> Option<BpmnEventDefinition> {
    use BpmnEventDefinition as D;
    Some(match event_type {
        "timer" => D::Timer(Default::default()),
        "error" => D::Error(Default::default()),
        "message" => D::Message(Default::default()),
        "signal" => D::Signal(Default::default()),
        "escalation" => D::Escalation(Default::default()),
        "cancel" => D::Cancel(Default::default()),
        "terminate" => D::Terminate(Default::default()),
        "conditional" => D::Conditional(Default::default()),
        "link" => D::Link(Default::default()),
        "compensate" => D::Compensate(Default::default()),
        _ => return None,
    })
}

/// TS's `isConnectorJobType`.
pub fn is_connector_job_type(job_type: &str) -> bool {
    job_type
        .strip_prefix("io.camunda")
        .is_some_and(|rest| rest.starts_with(['.', ':']))
}

/// TS's `isRestInputKey`.
fn is_rest_input_key(key: &str) -> bool {
    matches!(
        key,
        "url"
            | "method"
            | "headers"
            | "queryParameters"
            | "body"
            | "connectionTimeoutInSeconds"
            | "readTimeoutInSeconds"
    ) || key.starts_with("authentication.")
}

/// TS's `zeebeConfig`: `(inputs, headers)` as the engine reads them.
fn zeebe_config(el: &CompactElement) -> (JsRecord, JsRecord) {
    let rest = el.job_type.as_deref() == Some(rest_connector_task_type());
    let mut inputs: JsRecord = el
        .inputs
        .iter()
        .flat_map(JsRecord::entries)
        .map(|(k, v)| (k.clone(), v.clone()))
        .collect();
    let mut headers = JsRecord::new();
    for (key, value) in el.task_headers.iter().flat_map(JsRecord::entries) {
        if rest && is_rest_input_key(key) {
            inputs.insert_if_absent(key, value.as_str());
        } else {
            headers.insert(key.as_str(), value.as_str());
        }
    }
    if rest && inputs.get("url").is_some() {
        inputs.insert_if_absent("authentication.type", "noAuth");
    }
    if el.job_type.as_deref().is_some_and(is_connector_job_type)
        && el.result_variable.as_ref().is_some_and(|v| !v.is_empty())
        && el.decision_id.as_deref().is_none_or(str::is_empty)
    {
        if let Some(rv) = &el.result_variable {
            headers.insert_if_absent("resultVariable", rv.as_str());
        }
    }
    (inputs, headers)
}

/// `definedAttributes`: the given attributes without the unset ones, or `None` if none is set.
fn defined_attributes(attributes: &[(&str, &Option<String>)]) -> Option<Attrs> {
    let set: Attrs = attributes
        .iter()
        .filter_map(|(k, v)| v.as_ref().map(|v| ((*k).to_owned(), v.clone())))
        .collect();
    (!set.is_empty()).then_some(set)
}

/// JS truthiness of an optional string.
fn truthy(v: &Option<String>) -> Option<&str> {
    v.as_deref().filter(|s| !s.is_empty())
}

fn xml(name: &str, attributes: &[(&str, &str)], children: Vec<XmlElement>) -> XmlElement {
    XmlElement {
        name: name.to_owned(),
        attributes: attributes
            .iter()
            .map(|(k, v)| ((*k).to_owned(), (*v).to_owned()))
            .collect(),
        children,
        text: None,
    }
}

/// TS's `makeExtensions`: the Zeebe extension elements of a compact element.
pub fn make_extensions(el: &CompactElement) -> Vec<XmlElement> {
    let mut ext: Vec<XmlElement> = Vec::new();
    let (inputs, headers) = zeebe_config(el);
    if let Some(job_type) = truthy(&el.job_type) {
        ext.push(xml("zeebe:taskDefinition", &[("type", job_type)], vec![]));
    }
    if !headers.is_empty() {
        let children = headers
            .entries()
            .into_iter()
            .map(|(k, v)| xml("zeebe:header", &[("key", k), ("value", v)], vec![]))
            .collect();
        ext.push(xml("zeebe:taskHeaders", &[], children));
    }
    if let Some(called) = truthy(&el.called_process) {
        ext.push(xml("zeebe:calledElement", &[("processId", called)], vec![]));
    }
    if el.native_user_task == Some(true) && el.type_ == "userTask" {
        ext.push(xml("zeebe:userTask", &[], vec![]));
    }
    if let Some(form_id) = truthy(&el.form_id) {
        ext.push(xml("zeebe:formDefinition", &[("formId", form_id)], vec![]));
    }
    if let Some(assignment) = defined_attributes(&[
        ("assignee", &el.assignee),
        ("candidateGroups", &el.candidate_groups),
        ("candidateUsers", &el.candidate_users),
    ]) {
        ext.push(XmlElement {
            name: "zeebe:assignmentDefinition".to_owned(),
            attributes: assignment,
            children: vec![],
            text: None,
        });
    }
    if let Some(schedule) = defined_attributes(&[
        ("dueDate", &el.due_date),
        ("followUpDate", &el.follow_up_date),
    ]) {
        ext.push(XmlElement {
            name: "zeebe:taskSchedule".to_owned(),
            attributes: schedule,
            children: vec![],
            text: None,
        });
    }
    if let Some(priority) = &el.priority {
        let text = match priority {
            NumberOrString::Number(n) => js_number_to_string(*n),
            NumberOrString::String(s) => s.clone(),
        };
        ext.push(xml(
            "zeebe:priorityDefinition",
            &[("priority", &text)],
            vec![],
        ));
    }
    if let Some(properties) = el.properties.as_ref().filter(|p| !p.is_empty()) {
        let children = properties
            .entries()
            .into_iter()
            .map(|(k, v)| xml("zeebe:property", &[("name", k), ("value", v)], vec![]))
            .collect();
        ext.push(xml("zeebe:properties", &[], children));
    }
    let result_variable = el.result_variable.as_deref().unwrap_or("result");
    if let Some(decision_id) = truthy(&el.decision_id) {
        ext.push(xml(
            "zeebe:calledDecision",
            &[
                ("decisionId", decision_id),
                ("resultVariable", result_variable),
            ],
            vec![],
        ));
    }
    if let Some(script) = truthy(&el.script) {
        ext.push(xml(
            "zeebe:script",
            &[("expression", script), ("resultVariable", result_variable)],
            vec![],
        ));
    }
    let mut io_mapping: Vec<XmlElement> = inputs
        .entries()
        .into_iter()
        .map(|(target, source)| {
            xml(
                "zeebe:input",
                &[("source", source), ("target", target)],
                vec![],
            )
        })
        .collect();
    if let Some(outputs) = &el.outputs {
        for (target, source) in outputs.entries() {
            io_mapping.push(xml(
                "zeebe:output",
                &[("source", source), ("target", target)],
                vec![],
            ));
        }
    }
    if let (Some(rv), Some(job_type)) = (truthy(&el.result_variable), truthy(&el.job_type)) {
        if truthy(&el.decision_id).is_none()
            && !is_connector_job_type(job_type)
            && el.outputs.as_ref().is_none_or(|o| o.get(rv).is_none())
        {
            // A job worker's result: map its `response` variable to the result variable.
            io_mapping.push(xml(
                "zeebe:output",
                &[("source", "= response"), ("target", rv)],
                vec![],
            ));
        }
    }
    if !io_mapping.is_empty() {
        ext.push(xml("zeebe:ioMapping", &[], io_mapping));
    }
    ext
}

fn sequence_flow(f: &CompactFlow) -> BpmnSequenceFlow {
    BpmnSequenceFlow {
        id: f.id.clone(),
        name: f.name.clone(),
        source_ref: f.from.clone(),
        target_ref: f.to.clone(),
        condition_expression: f.condition.as_ref().filter(|c| !c.is_empty()).map(|c| {
            BpmnConditionExpression {
                text: to_feel_condition(c),
                attributes: Attrs::new(),
            }
        }),
        ..BpmnSequenceFlow::default()
    }
}

/// `incoming`/`outgoing` flow ids per element id, in flow order.
type FlowIds<'a> = IndexMap<&'a str, Vec<String>>;

fn flow_maps(flows: &[CompactFlow]) -> (FlowIds<'_>, FlowIds<'_>) {
    let mut incoming: IndexMap<&str, Vec<String>> = IndexMap::new();
    let mut outgoing: IndexMap<&str, Vec<String>> = IndexMap::new();
    for f in flows {
        outgoing.entry(&f.from).or_default().push(f.id.clone());
        incoming.entry(&f.to).or_default().push(f.id.clone());
    }
    (incoming, outgoing)
}

/// TS's `buildSubContent`.
fn build_sub_content(
    children: Option<&CompactChildren>,
    mut roots: Option<&mut CompactRoots>,
) -> Result<BpmnProcessContents, TextError> {
    let Some(children) = children.filter(|c| !c.elements.is_empty()) else {
        return Ok(BpmnProcessContents::default());
    };
    let (inc, out) = flow_maps(&children.flows);
    let defaults = default_flows(&children.elements, &children.flows)?;
    let mut flow_elements = Vec::with_capacity(children.elements.len());
    for child in &children.elements {
        flow_elements.push(build_flow_element(
            child,
            inc.get(child.id.as_str()).cloned().unwrap_or_default(),
            out.get(child.id.as_str()).cloned().unwrap_or_default(),
            defaults.get(&child.id).map(String::as_str),
            roots.as_deref_mut(),
        )?);
    }
    Ok(BpmnProcessContents {
        flow_elements,
        sequence_flows: children.flows.iter().map(sequence_flow).collect(),
        text_annotations: vec![],
        associations: vec![],
        groups: vec![],
    })
}

/// TS's `templateAttributes`.
fn template_attributes(el: &CompactElement) -> IndexMap<String, String> {
    let mut attrs = IndexMap::new();
    if let Some(template) = &el.modeler_template {
        attrs.insert("zeebe:modelerTemplate".to_owned(), template.id.clone());
        if let Some(version) = template.version {
            attrs.insert(
                "zeebe:modelerTemplateVersion".to_owned(),
                js_number_to_string(version),
            );
        }
    }
    attrs
}

/// The `loopCharacteristics` TS builds from `multiInstance`.
fn multi_instance_loop(el: &CompactElement) -> Option<BpmnMultiInstanceLoopCharacteristics> {
    let mi = el.multi_instance.as_ref()?;
    let mut attributes = Attrs::new();
    attributes.insert("inputCollection".to_owned(), mi.collection.clone());
    for (key, value) in [
        ("inputElement", &mi.element),
        ("outputCollection", &mi.output_collection),
        ("outputElement", &mi.output_element),
    ] {
        if let Some(v) = value.as_ref().filter(|v| !v.is_empty()) {
            attributes.insert(key.to_owned(), v.clone());
        }
    }
    Some(BpmnMultiInstanceLoopCharacteristics {
        is_sequential: (mi.sequential == Some(true)).then_some(true),
        completion_condition: mi
            .completion_condition
            .as_ref()
            .filter(|c| !c.is_empty())
            .map(|c| BpmnConditionExpression {
                text: to_feel_condition(c),
                attributes: Attrs::from_iter([(
                    "xsi:type".to_owned(),
                    "bpmn:tFormalExpression".to_owned(),
                )]),
            }),
        extension_elements: vec![XmlElement {
            name: "zeebe:loopCharacteristics".to_owned(),
            attributes,
            children: vec![],
            text: None,
        }],
        ..BpmnMultiInstanceLoopCharacteristics::default()
    })
}

/// TS's `CompactRoots`: the root elements `expand` writes for the names and codes elements
/// carry, one message per name and correlation key, one signal per name, one error or
/// escalation per code. Ids are made as the builder makes them (`Message_<name>`).
#[derive(Debug, Clone, Default)]
pub struct CompactRoots {
    pub messages: Vec<BpmnMessage>,
    pub errors: Vec<BpmnError>,
    pub signals: Vec<BpmnSignal>,
    pub escalations: Vec<BpmnEscalation>,
}

fn subscription_key(m: &BpmnMessage) -> Option<&str> {
    m.extension_elements
        .iter()
        .flatten()
        .find(|x| x.name == "zeebe:subscription")
        .and_then(|x| x.attributes.get("correlationKey"))
        .map(String::as_str)
}

impl CompactRoots {
    /// The id of the message named `name` with `correlation_key`, created when missing.
    pub fn message(&mut self, name: &str, correlation_key: Option<&str>) -> String {
        if let Some(found) = self
            .messages
            .iter()
            .find(|m| m.name.as_deref() == Some(name) && subscription_key(m) == correlation_key)
        {
            return found.id.clone();
        }
        let id = root_definition_id("Message", name, self.messages.iter().map(|m| m.id.as_str()));
        let extension_elements = correlation_key.map(|key| {
            let mut ext = XmlElement::new("zeebe:subscription");
            ext.attributes
                .insert("correlationKey".to_owned(), key.to_owned());
            vec![ext]
        });
        self.messages.push(BpmnMessage {
            id: id.clone(),
            name: Some(name.to_owned()),
            extension_elements,
            ..BpmnMessage::default()
        });
        id
    }

    /// The id of the signal named `name`, created when missing.
    pub fn signal(&mut self, name: &str) -> String {
        if let Some(found) = self
            .signals
            .iter()
            .find(|x| x.name.as_deref() == Some(name))
        {
            return found.id.clone();
        }
        let id = root_definition_id("Signal", name, self.signals.iter().map(|x| x.id.as_str()));
        self.signals.push(BpmnSignal {
            id: id.clone(),
            name: Some(name.to_owned()),
            ..BpmnSignal::default()
        });
        id
    }

    /// The id of the error with `code`, created when missing.
    pub fn error(&mut self, code: &str) -> String {
        if let Some(found) = self
            .errors
            .iter()
            .find(|x| x.error_code.as_deref() == Some(code))
        {
            return found.id.clone();
        }
        let id = root_definition_id("Error", code, self.errors.iter().map(|x| x.id.as_str()));
        self.errors.push(BpmnError {
            id: id.clone(),
            name: Some(code.to_owned()),
            error_code: Some(code.to_owned()),
            ..BpmnError::default()
        });
        id
    }

    /// The id of the escalation with `code`, created when missing.
    pub fn escalation(&mut self, code: &str) -> String {
        if let Some(found) = self
            .escalations
            .iter()
            .find(|x| x.escalation_code.as_deref() == Some(code))
        {
            return found.id.clone();
        }
        let id = root_definition_id(
            "Escalation",
            code,
            self.escalations.iter().map(|x| x.id.as_str()),
        );
        self.escalations.push(BpmnEscalation {
            id: id.clone(),
            name: Some(code.to_owned()),
            escalation_code: Some(code.to_owned()),
            ..BpmnEscalation::default()
        });
        id
    }
}

/// TS's `eventDefinitionOf`: the element's event definition with the names, codes and
/// times it carries.
fn event_definition_of(
    el: &CompactElement,
    roots: Option<&mut CompactRoots>,
) -> Option<BpmnEventDefinition> {
    use BpmnEventDefinition as D;
    let made = el
        .event_type
        .as_deref()
        .filter(|t| !t.is_empty())
        .and_then(make_event_def)?;
    let key = truthy(&el.correlation_key);
    Some(match made {
        D::Timer(mut t) => {
            t.time_duration = truthy(&el.timer_duration).map(str::to_owned);
            t.time_date = truthy(&el.timer_date).map(str::to_owned);
            t.time_cycle = truthy(&el.timer_cycle).map(str::to_owned);
            D::Timer(t)
        }
        D::Conditional(_) if el.condition.is_some() => {
            make_conditional_definition(el.condition.as_deref().unwrap_or_default(), None)
        }
        D::Link(mut l) if el.link_name.is_some() => {
            l.name = el.link_name.clone();
            D::Link(l)
        }
        D::Message(mut m) => {
            if let (Some(roots), Some(name)) = (roots, truthy(&el.message_name)) {
                m.message_ref = Some(roots.message(name, key));
            }
            D::Message(m)
        }
        D::Signal(mut x) => {
            if let (Some(roots), Some(name)) = (roots, truthy(&el.signal_name)) {
                x.signal_ref = Some(roots.signal(name));
            }
            D::Signal(x)
        }
        D::Error(mut x) => {
            if let (Some(roots), Some(code)) = (roots, truthy(&el.error_code)) {
                x.error_ref = Some(roots.error(code));
            }
            D::Error(x)
        }
        D::Escalation(mut x) => {
            if let (Some(roots), Some(code)) = (roots, truthy(&el.escalation_code)) {
                x.escalation_ref = Some(roots.escalation(code));
            }
            D::Escalation(x)
        }
        other => other,
    })
}

/// TS's `buildFlowElement`. `default_flow` is the id of the outgoing flow marked default;
/// `roots`, when given, receives the messages, signals, errors and escalations the element
/// names (without it the names and codes are not written).
pub fn build_flow_element(
    el: &CompactElement,
    incoming: Vec<String>,
    outgoing: Vec<String>,
    default_flow: Option<&str>,
    mut roots: Option<&mut CompactRoots>,
) -> Result<BpmnFlowElement, TextError> {
    let base = BpmnFlowNodeBase {
        id: el.id.clone(),
        name: el.name.clone(),
        documentation: el.documentation.clone(),
        incoming,
        outgoing,
        extension_elements: make_extensions(el),
        unknown_attributes: template_attributes(el),
        ..BpmnFlowNodeBase::default()
    };
    let event_def = event_definition_of(el, roots.as_deref_mut());
    let mut event_defs: Vec<BpmnEventDefinition> = event_def.into_iter().collect();
    // Zeebe rejects an id-less definition at deploy time; the builder derives the same ids.
    assign_event_definition_ids(&el.id, &mut event_defs);
    let sub_content = build_sub_content(el.children.as_ref(), roots.as_deref_mut())?;
    let loop_characteristics = multi_instance_loop(el);

    let Some(type_) = el.element_type() else {
        return Err(TextError::new(format!(
            "Unhandled BPMN element type in expand(): {}",
            el.type_
        )));
    };
    let activity = |base: BpmnFlowNodeBase| BpmnActivity {
        base,
        loop_characteristics: loop_characteristics.clone(),
    };
    let gateway = |base: BpmnFlowNodeBase| BpmnGateway {
        base,
        default: default_flow.map(str::to_owned),
    };
    use BpmnElementType as T;
    use BpmnFlowElement as E;
    Ok(match type_ {
        T::StartEvent => E::StartEvent(BpmnStartEvent {
            base,
            event_definitions: event_defs,
            // An event sub-process's start: `false` lets the scope go on.
            is_interrupting: (el.interrupting == Some(false)).then_some(false),
        }),
        T::EndEvent => E::EndEvent(BpmnEvent {
            base,
            event_definitions: event_defs,
        }),
        T::IntermediateCatchEvent => E::IntermediateCatchEvent(BpmnEvent {
            base,
            event_definitions: event_defs,
        }),
        T::IntermediateThrowEvent => E::IntermediateThrowEvent(BpmnEvent {
            base,
            event_definitions: event_defs,
        }),
        T::BoundaryEvent => E::BoundaryEvent(BpmnBoundaryEvent {
            base,
            attached_to_ref: el.attached_to.clone().unwrap_or_default(),
            cancel_activity: Some(el.interrupting != Some(false)),
            event_definitions: event_defs,
        }),
        T::ServiceTask => E::ServiceTask(activity(base)),
        T::ScriptTask => E::ScriptTask(activity(base)),
        T::UserTask => E::UserTask(activity(base)),
        T::BusinessRuleTask => E::BusinessRuleTask(activity(base)),
        T::CallActivity => E::CallActivity(activity(base)),
        T::SendTask => E::SendTask(BpmnMessageTask {
            base,
            message_ref: None,
            loop_characteristics,
        }),
        T::ReceiveTask => E::ReceiveTask(BpmnMessageTask {
            base,
            message_ref: match (roots, truthy(&el.message_name)) {
                (Some(roots), Some(name)) => Some(roots.message(name, truthy(&el.correlation_key))),
                _ => None,
            },
            loop_characteristics,
        }),
        T::ManualTask => E::ManualTask(activity(base)),
        T::Task => E::Task(activity(base)),
        T::SubProcess => E::SubProcess(BpmnSubProcess {
            base,
            triggered_by_event: None,
            loop_characteristics,
            contents: sub_content,
        }),
        T::AdHocSubProcess => E::AdHocSubProcess(BpmnAdHocSubProcess {
            base,
            contents: sub_content,
            ..BpmnAdHocSubProcess::default()
        }),
        T::EventSubProcess => E::EventSubProcess(BpmnEventSubProcess {
            base,
            contents: sub_content,
        }),
        T::Transaction => E::Transaction(BpmnTransaction {
            base,
            loop_characteristics: None,
            contents: sub_content,
        }),
        T::ExclusiveGateway => E::ExclusiveGateway(gateway(base)),
        T::ParallelGateway => E::ParallelGateway(base),
        T::InclusiveGateway => E::InclusiveGateway(gateway(base)),
        T::EventBasedGateway => E::EventBasedGateway(base),
        T::ComplexGateway => E::ComplexGateway(gateway(base)),
        // Data elements are not sequence-flow participants; they carry a reference
        // instead, and dropping that reference is what made them round-trip as bare
        // tasks before.
        T::DataObject => E::DataObject(BpmnDataObject {
            base,
            is_collection: el.is_collection,
        }),
        T::DataObjectReference => E::DataObjectReference(BpmnDataObjectReference {
            base,
            data_object_ref: el.data_object_ref.clone(),
            is_collection: el.is_collection,
        }),
        T::DataStoreReference => E::DataStoreReference(BpmnDataStoreReference {
            base,
            data_store_ref: el.data_store_ref.clone(),
        }),
    })
}

/// TS's `buildDiagram`.
fn build_diagram(process_id: &str, process: &BpmnProcess) -> BpmnDiagram {
    let layout = layout_process(process, LayoutEngine::Semantic, &IndexSet::new(), None);
    let bounds = |b: &bpmnkit_layout::Bounds| BpmnBounds {
        x: b.x,
        y: b.y,
        width: b.width,
        height: b.height,
    };
    let mut shapes: Vec<BpmnDiShape> = layout
        .nodes
        .iter()
        .map(|n| BpmnDiShape {
            id: format!("{}_di", n.id),
            bpmn_element: n.id.clone(),
            // The bpmn-js Viewer draws the "X" only when the shape says so.
            is_marker_visible: (n.kind == "exclusiveGateway").then_some(true),
            is_expanded: n.is_expanded,
            is_horizontal: None,
            bounds: bounds(&n.bounds),
            label: n.label_bounds.as_ref().map(|l| BpmnDiLabel {
                bounds: Some(bounds(l)),
                unknown_attributes: None,
            }),
            unknown_attributes: Attrs::new(),
        })
        .collect();
    let mut edges: Vec<BpmnDiEdge> = layout
        .edges
        .iter()
        .map(|e| BpmnDiEdge {
            id: format!("{}_di", e.id),
            bpmn_element: e.id.clone(),
            waypoints: e
                .waypoints
                .iter()
                .map(|w| BpmnWaypoint {
                    x: w.x,
                    y: w.y,
                    unknown_attributes: None,
                })
                .collect(),
            label: None,
            unknown_attributes: Attrs::new(),
        })
        .collect();
    if !process.contents.text_annotations.is_empty() {
        // An annotation may sit above the topmost shape; the plane keeps to the positive
        // quadrant.
        let placed = pack_annotations(process, &layout.nodes, &layout.edges, None);
        add_annotation_shapes(
            process,
            &layout.nodes,
            &placed,
            &mut shapes,
            &mut edges,
            0.0,
            0.0,
        );
        let dx = -shapes.iter().fold(0.0_f64, |m, s| m.min(s.bounds.x));
        let dy = -shapes.iter().fold(0.0_f64, |m, s| m.min(s.bounds.y));
        if dx != 0.0 || dy != 0.0 {
            for shape in &mut shapes {
                shape.bounds = BpmnBounds {
                    x: shape.bounds.x + dx,
                    y: shape.bounds.y + dy,
                    ..shape.bounds.clone()
                };
                if let Some(label) = shape.label.as_ref().and_then(|l| l.bounds.as_ref()) {
                    let moved = BpmnBounds {
                        x: label.x + dx,
                        y: label.y + dy,
                        ..label.clone()
                    };
                    shape.label = Some(BpmnDiLabel {
                        bounds: Some(moved),
                        unknown_attributes: None,
                    });
                }
            }
            for edge in &mut edges {
                edge.waypoints = edge
                    .waypoints
                    .iter()
                    .map(|w| BpmnWaypoint {
                        x: w.x + dx,
                        y: w.y + dy,
                        unknown_attributes: None,
                    })
                    .collect();
            }
        }
    }
    BpmnDiagram {
        id: format!("BPMNDiagram_{process_id}"),
        plane: BpmnDiPlane {
            id: format!("BPMNPlane_{process_id}"),
            bpmn_element: process_id.to_owned(),
            shapes,
            edges,
            unknown_attributes: None,
        },
        unknown_attributes: None,
        unknown_children: vec![],
    }
}

/// TS's `expandProcess`.
fn expand_process(
    compact: &CompactProcess,
    roots: &mut CompactRoots,
) -> Result<(BpmnProcess, BpmnDiagram), TextError> {
    let (incoming, outgoing) = flow_maps(&compact.flows);
    let defaults = default_flows(&compact.elements, &compact.flows)?;
    let mut flow_elements = Vec::with_capacity(compact.elements.len());
    for el in &compact.elements {
        flow_elements.push(build_flow_element(
            el,
            incoming.get(el.id.as_str()).cloned().unwrap_or_default(),
            outgoing.get(el.id.as_str()).cloned().unwrap_or_default(),
            defaults.get(&el.id).map(String::as_str),
            Some(roots),
        )?);
    }
    let sequence_flows: Vec<BpmnSequenceFlow> = compact.flows.iter().map(sequence_flow).collect();

    // Ids as the builder's `annotate` makes them, numbered per element.
    let mut text_annotations = Vec::new();
    let mut associations = Vec::new();
    let mut noted: IndexMap<&str, u32> = IndexMap::new();
    for note in compact.notes.iter().flatten() {
        let n = noted.entry(&note.element_id).or_insert(0);
        *n += 1;
        let id = format!("TextAnnotation_{}_{n}", note.element_id);
        text_annotations.push(BpmnTextAnnotation {
            id: id.clone(),
            text: Some(note.text.clone()),
            ..BpmnTextAnnotation::default()
        });
        associations.push(BpmnAssociation {
            id: format!("Association_{}_{n}", note.element_id),
            source_ref: note.element_id.clone(),
            target_ref: id,
            association_direction: Some("None".to_owned()),
            ..BpmnAssociation::default()
        });
    }

    let process = BpmnProcess {
        id: compact.id.clone(),
        name: compact.name.clone(),
        documentation: compact.documentation.clone(),
        is_executable: Some(true),
        contents: BpmnProcessContents {
            flow_elements,
            sequence_flows,
            text_annotations,
            associations,
            groups: vec![],
        },
        ..BpmnProcess::default()
    };
    let diagram = build_diagram(&compact.id, &process);
    Ok((process, diagram))
}

/// TS's `ExpandOptions`. The default gates: a compact diagram is written for Camunda 8.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ExpandOptions {
    /// Refuse a diagram Zeebe would reject on deploy (default `true`). `false` for an
    /// unfinished diagram or one not meant for Camunda 8; the result is then not marked as
    /// Camunda 8 unless the diagram names an `execution_platform_version`.
    pub validate: bool,
    /// Fill the documented placeholders instead of refusing (default `false`).
    pub placeholders: bool,
    /// The Camunda 8 version to check for; defaults to the diagram's
    /// `execution_platform_version`.
    pub camunda_version: Option<String>,
}

impl Default for ExpandOptions {
    fn default() -> Self {
        Self {
            validate: true,
            placeholders: false,
            camunda_version: None,
        }
    }
}

impl ExpandOptions {
    /// `{ validate: false }`: no gate, for previews and models not meant for Camunda 8.
    pub fn ungated() -> Self {
        Self {
            validate: false,
            ..Self::default()
        }
    }
}

/// TS's `expand`: a full model with an auto-generated layout, refused by
/// `assert_deployable` (as [`TextError::deployability`]) unless `options.validate` is
/// `false`.
pub fn expand(
    compact: &CompactDiagram,
    options: &ExpandOptions,
) -> Result<BpmnDefinitions, TextError> {
    let problems = compact_problems(compact);
    if !problems.is_empty() {
        return Err(TextError::new(format!(
            "expand: invalid CompactDiagram \u{2014} {}",
            problems.join("; ")
        )));
    }
    let mut roots = CompactRoots::default();
    let mut processes = Vec::new();
    let mut diagrams = Vec::new();
    for cp in &compact.processes {
        let (process, diagram) = expand_process(cp, &mut roots)?;
        processes.push(process);
        diagrams.push(diagram);
    }
    let platform = compact.execution_platform_version.as_ref();
    // Gated output is Camunda 8 output: marking it so makes `export_bpmn`'s "auto" agree.
    let camunda8 = options.validate || platform.is_some();
    let mut namespaces = Attrs::new();
    for (k, v) in [
        ("bpmn", "http://www.omg.org/spec/BPMN/20100524/MODEL"),
        ("bpmndi", "http://www.omg.org/spec/BPMN/20100524/DI"),
        ("dc", "http://www.omg.org/spec/DD/20100524/DC"),
        ("di", "http://www.omg.org/spec/DD/20100524/DI"),
        ("zeebe", "http://camunda.org/schema/zeebe/1.0"),
    ] {
        namespaces.insert(k.to_owned(), v.to_owned());
    }
    let mut unknown_attributes = Attrs::new();
    if camunda8 {
        namespaces.insert(
            "modeler".to_owned(),
            "http://camunda.org/schema/modeler/1.0".to_owned(),
        );
        unknown_attributes.insert(
            "modeler:executionPlatform".to_owned(),
            "Camunda Cloud".to_owned(),
        );
    }
    if let Some(platform) = platform {
        unknown_attributes.insert(
            "modeler:executionPlatformVersion".to_owned(),
            platform.clone(),
        );
    }
    let definitions = BpmnDefinitions {
        id: compact.id.clone(),
        target_namespace: "http://bpmn.io/schema/bpmn".to_owned(),
        namespaces,
        unknown_attributes,
        errors: roots.errors,
        escalations: roots.escalations,
        messages: roots.messages,
        signals: roots.signals,
        processes,
        diagrams,
        ..BpmnDefinitions::default()
    };
    if !options.validate {
        return Ok(definitions);
    }
    let camunda_version = normalize_camunda_version(
        options
            .camunda_version
            .as_deref()
            .or(platform.map(String::as_str)),
    )
    .map(|v| v.as_str().to_string());
    let assert_options = AssertOptions {
        camunda_version,
        placeholders: options.placeholders,
        ..AssertOptions::default()
    };
    let filled = match assert_deployable(&definitions, &assert_options)?.definitions {
        Cow::Owned(filled) => Some(filled),
        Cow::Borrowed(_) => None,
    };
    Ok(filled.unwrap_or(definitions))
}
