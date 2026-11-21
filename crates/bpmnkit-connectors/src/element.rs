//! Applying an element template to one element of a parsed model: port of
//! `apply-element.ts` + `deployability.ts`. See [`apply_template_to_element`].

use crate::apply::{resolve_bindings, Accumulator, ApplyOptions, Problem, ProblemKind};
use crate::error::Error;
use crate::jsval::js_string;
use crate::template::ElementTemplate;
use bpmnkit_bpmn::js::object_entries;
use bpmnkit_bpmn::zeebe::{
    bpmn_element_name, is_zeebe_placement_allowed, zeebe_extensions_to_xml_elements, BindingType,
    ZeebeAdHoc, ZeebeAgentDefinition, ZeebeAssignmentDefinition, ZeebeCalledDecision,
    ZeebeCalledElement, ZeebeExtensions, ZeebeFormDefinition, ZeebeIoMapping, ZeebeIoMappingEntry,
    ZeebePriorityDefinition, ZeebeProperties, ZeebePropertyEntry, ZeebeTaskDefinition,
    ZeebeTaskHeaderEntry, ZeebeTaskHeaders, ZeebeTaskSchedule,
};
use bpmnkit_bpmn::{
    parse_bpmn, retype_element, serialize_bpmn, BpmnDefinitions, BpmnElementType,
    BpmnEventDefinition, BpmnFlowElement, BpmnMessage, BpmnMessageEventDefinition, XmlElement,
};
use bpmnkit_compat::compat::normalize_camunda_version;
use bpmnkit_compat::finding::Severity;
use bpmnkit_compat::zeebe::{validate_deployable_xml, ValidateOptions};
use bpmnkit_spec::zeebe::ZEEBE_LATEST_VERSION;
use indexmap::IndexMap;
use std::collections::{HashMap, HashSet};
use std::sync::OnceLock;

/// The one `elementType.eventDefinition` this toolkit writes.
pub const APPLIED_EVENT_DEFINITION: &str = "bpmn:MessageEventDefinition";

/// Options of [`apply_template_to_element`].
#[derive(Debug, Clone)]
pub struct ApplyToModelOptions {
    /// Leave out properties carrying only the template's default (hidden and required ones are
    /// always written). Re-applying replaces extensions wholesale, so an earlier default does
    /// not survive.
    pub omit_defaults: bool,
    /// Check the applied element with Zeebe's deploy rules and report each error as a
    /// `not-deployable` problem (default `true`). Only the applied element (and the message it
    /// references) is checked.
    pub validate: bool,
    /// The Camunda 8 version to check for. Default: the model's
    /// `modeler:executionPlatformVersion`, else the newest.
    pub camunda_version: Option<String>,
}

impl Default for ApplyToModelOptions {
    fn default() -> Self {
        Self {
            omit_defaults: false,
            validate: true,
            camunda_version: None,
        }
    }
}

/// The result of [`apply_template_to_element`].
#[derive(Debug, Clone)]
pub struct ApplyToElementResult {
    /// The model with the template applied: a copy, the input is never mutated. When the element
    /// is missing or the template does not apply to it, a copy of the input.
    pub definitions: BpmnDefinitions,
    /// Everything that stopped a write or left a value out.
    pub problems: Vec<Problem>,
}

fn to_element_type(name: &str) -> Option<BpmnElementType> {
    let local = name.strip_prefix("bpmn:").unwrap_or(name);
    let mut chars = local.chars();
    let first = chars.next()?;
    let ty: String = first.to_lowercase().chain(chars).collect();
    BpmnElementType::parse(&ty)
}

/// `appliesTo` matches by type, and `bpmn:Task` covers every task, as in the Modeler.
fn applies_to(template: &ElementTemplate, ty: BpmnElementType) -> bool {
    let own = bpmn_element_name(ty.as_str()).to_lowercase();
    let is_task = ty.as_str() == "task" || ty.as_str().ends_with("Task");
    template
        .applies_to
        .iter()
        .any(|e| e.to_lowercase() == own || (e == "bpmn:Task" && is_task))
}

/// A flow element's place: process index, then indices through nested containers.
type Path = Vec<usize>;

fn locate_in(elements: &[BpmnFlowElement], id: &str, path: &mut Path) -> bool {
    for (i, el) in elements.iter().enumerate() {
        path.push(i);
        if el.base().id == id {
            return true;
        }
        if let Some(c) = el.contents() {
            if locate_in(&c.flow_elements, id, path) {
                return true;
            }
        }
        path.pop();
    }
    false
}

fn locate(defs: &BpmnDefinitions, id: &str) -> Option<Path> {
    for (pi, process) in defs.processes.iter().enumerate() {
        let mut path = vec![pi];
        if locate_in(&process.contents.flow_elements, id, &mut path) {
            return Some(path);
        }
    }
    None
}

fn element_at<'a>(defs: &'a BpmnDefinitions, path: &[usize]) -> &'a BpmnFlowElement {
    let mut els = &defs.processes[path[0]].contents.flow_elements;
    for (n, &i) in path[1..].iter().enumerate() {
        if n + 2 == path.len() {
            return &els[i];
        }
        els = &els[i]
            .contents()
            .expect("path through a container")
            .flow_elements;
    }
    unreachable!("path has an element index")
}

fn element_at_mut<'a>(defs: &'a mut BpmnDefinitions, path: &[usize]) -> &'a mut BpmnFlowElement {
    let mut els = &mut defs.processes[path[0]].contents.flow_elements;
    let last = path.len() - 1;
    for &i in &path[1..last] {
        els = &mut els[i]
            .contents_mut()
            .expect("path through a container")
            .flow_elements;
    }
    &mut els[path[last]]
}

fn is_message(def: &BpmnEventDefinition) -> bool {
    matches!(def, BpmnEventDefinition::Message(_))
}

/// The id of the root message an element references, if any.
fn message_ref_of(el: &BpmnFlowElement) -> Option<String> {
    if let Some(r) = el.message_ref() {
        return Some(r.to_owned());
    }
    el.event_definitions()?.iter().find_map(|d| match d {
        BpmnEventDefinition::Message(m) => m.message_ref.clone(),
        _ => None,
    })
}

fn visit_elements(defs: &BpmnDefinitions, visit: &mut dyn FnMut(&BpmnFlowElement)) {
    fn walk(els: &[BpmnFlowElement], visit: &mut dyn FnMut(&BpmnFlowElement)) {
        for el in els {
            visit(el);
            if let Some(c) = el.contents() {
                walk(&c.flow_elements, visit);
            }
        }
    }
    for p in &defs.processes {
        walk(&p.contents.flow_elements, visit);
    }
}

/// How many elements and message flows reference a root message.
fn message_uses(defs: &BpmnDefinitions, message_id: &str) -> usize {
    let mut uses = 0;
    visit_elements(defs, &mut |el| {
        if message_ref_of(el).as_deref() == Some(message_id) {
            uses += 1;
        }
    });
    for c in &defs.collaborations {
        uses += c
            .message_flows
            .iter()
            .filter(|f| f.message_ref.as_deref() == Some(message_id))
            .count();
    }
    uses
}

/// A message id derived from its name, like the builder's, deduped against every id in the model.
fn new_message_id(defs: &BpmnDefinitions, name: &str) -> String {
    let mut taken: HashSet<String> = HashSet::new();
    taken.extend(defs.messages.iter().map(|m| m.id.clone()));
    taken.extend(defs.errors.iter().map(|m| m.id.clone()));
    taken.extend(defs.signals.iter().map(|m| m.id.clone()));
    taken.extend(defs.escalations.iter().map(|m| m.id.clone()));
    visit_elements(defs, &mut |el| {
        taken.insert(el.base().id.clone());
    });
    // `/[^A-Za-z0-9_.-]/g`: one underscore per UTF-16 code unit.
    let safe: String = name
        .chars()
        .flat_map(|c| {
            if c.is_ascii_alphanumeric() || matches!(c, '_' | '.' | '-') {
                vec![c]
            } else {
                vec!['_'; c.len_utf16()]
            }
        })
        .collect();
    let base = format!("Message_{safe}");
    let mut id = base.clone();
    let mut n = 2;
    while taken.contains(&id) {
        id = format!("{base}_{n}");
        n += 1;
    }
    id
}

/// The message an element should reference: one already named `name`, else the element's own
/// message renamed when nothing else uses it, else a new one. Returns its index.
fn resolve_message(defs: &mut BpmnDefinitions, name: &str, current_id: Option<&str>) -> usize {
    if let Some(i) = defs
        .messages
        .iter()
        .position(|m| m.name.as_deref() == Some(name))
    {
        return i;
    }
    if let Some(i) = current_id.and_then(|id| defs.messages.iter().position(|m| m.id == id)) {
        if message_uses(defs, &defs.messages[i].id) <= 1 {
            defs.messages[i].name = Some(name.to_owned());
            return i;
        }
    }
    let id = new_message_id(defs, name);
    defs.messages.push(BpmnMessage {
        id,
        name: Some(name.to_owned()),
        ..Default::default()
    });
    defs.messages.len() - 1
}

/// A UUID-shaped value (version 8, custom) from a SHA-256: stable for the same seed.
fn derived_uuid(seed: &str) -> String {
    let hex = bpmnkit_diff::sha256::sha256_hex(seed.as_bytes());
    let variant = (u32::from_str_radix(&hex[16..17], 16).unwrap_or(0) & 0x3) | 0x8;
    format!(
        "{}-{}-8{}-{variant:x}{}-{}",
        &hex[0..8],
        &hex[8..12],
        &hex[13..16],
        &hex[17..20],
        &hex[20..32]
    )
}

/// Puts `replacement` where the first `name` extension sat, dropping any others; appends it when
/// there was none, and removes it when `replacement` is `None`.
fn replace_extension(
    extensions: &[XmlElement],
    name: &str,
    replacement: Option<XmlElement>,
) -> Vec<XmlElement> {
    let at = extensions.iter().position(|e| e.name == name);
    let mut rest: Vec<XmlElement> = extensions
        .iter()
        .filter(|e| e.name != name)
        .cloned()
        .collect();
    let Some(r) = replacement else { return rest };
    match at {
        None => rest.push(r),
        Some(at) => rest.insert(at.min(rest.len()), r),
    }
    rest
}

fn zeebe_element(x: ZeebeExtensions) -> Option<XmlElement> {
    zeebe_extensions_to_xml_elements(&x).into_iter().next()
}

fn binding_type(s: &str) -> Option<BindingType> {
    match s {
        "latest" => Some(BindingType::Latest),
        "deployment" => Some(BindingType::Deployment),
        "versionTag" => Some(BindingType::VersionTag),
        _ => None,
    }
}

type Owned = Vec<(&'static str, Option<XmlElement>)>;

fn owned_task_extensions(declared: &HashSet<&str>, accum: &Accumulator) -> Owned {
    let mut owned: Owned = vec![];
    let empty = IndexMap::new();
    let props = |t: &str| accum.task_extensions.get(t).unwrap_or(&empty);
    let get = |t: &str, k: &str| props(t).get(k).cloned();

    if declared.contains("zeebe:userTask") {
        owned.push((
            "zeebe:userTask",
            accum
                .user_task
                .then(|| {
                    zeebe_element(ZeebeExtensions {
                        user_task: true,
                        ..Default::default()
                    })
                })
                .flatten(),
        ));
    }
    if declared.contains("zeebe:calledElement") {
        let c = "zeebe:calledElement";
        let is_true = |k: &str| get(c, k).map(|v| v == "true");
        owned.push((
            "zeebe:calledElement",
            get(c, "processId").and_then(|process_id| {
                zeebe_element(ZeebeExtensions {
                    called_element: Some(ZeebeCalledElement {
                        process_id,
                        binding_type: get(c, "bindingType").as_deref().and_then(binding_type),
                        version_tag: get(c, "versionTag"),
                        propagate_all_parent_variables: is_true("propagateAllParentVariables"),
                        propagate_all_child_variables: is_true("propagateAllChildVariables"),
                    }),
                    ..Default::default()
                })
            }),
        ));
    }
    if declared.contains("zeebe:calledDecision") {
        let c = "zeebe:calledDecision";
        let base = match (get(c, "decisionId"), get(c, "resultVariable")) {
            (Some(decision_id), Some(result_variable)) => zeebe_element(ZeebeExtensions {
                called_decision: Some(ZeebeCalledDecision {
                    decision_id,
                    result_variable,
                }),
                ..Default::default()
            }),
            _ => None,
        };
        // The writer's type has no resource-binding fields; they belong on the same element.
        owned.push((
            "zeebe:calledDecision",
            base.map(|mut e| {
                for k in ["bindingType", "versionTag"] {
                    if let Some(v) = get(c, k) {
                        e.attributes.insert(k.to_owned(), v);
                    }
                }
                e
            }),
        ));
    }
    if declared.contains("zeebe:formDefinition") {
        let c = "zeebe:formDefinition";
        let form = if let Some(external_reference) = get(c, "externalReference") {
            Some(ZeebeFormDefinition::ExternalReference { external_reference })
        } else {
            get(c, "formId").map(|form_id| ZeebeFormDefinition::FormId {
                form_id,
                binding_type: get(c, "bindingType").as_deref().and_then(binding_type),
                version_tag: get(c, "versionTag"),
            })
        };
        owned.push((
            "zeebe:formDefinition",
            form.and_then(|f| {
                zeebe_element(ZeebeExtensions {
                    form_definition: Some(f),
                    ..Default::default()
                })
            }),
        ));
    }
    if declared.contains("zeebe:assignmentDefinition") {
        let c = "zeebe:assignmentDefinition";
        owned.push((
            "zeebe:assignmentDefinition",
            zeebe_element(ZeebeExtensions {
                assignment_definition: Some(ZeebeAssignmentDefinition {
                    assignee: get(c, "assignee"),
                    candidate_groups: get(c, "candidateGroups"),
                    candidate_users: get(c, "candidateUsers"),
                }),
                ..Default::default()
            }),
        ));
    }
    if declared.contains("zeebe:taskSchedule") {
        let c = "zeebe:taskSchedule";
        owned.push((
            "zeebe:taskSchedule",
            zeebe_element(ZeebeExtensions {
                task_schedule: Some(ZeebeTaskSchedule {
                    due_date: get(c, "dueDate"),
                    follow_up_date: get(c, "followUpDate"),
                }),
                ..Default::default()
            }),
        ));
    }
    if declared.contains("zeebe:priorityDefinition") {
        owned.push((
            "zeebe:priorityDefinition",
            get("zeebe:priorityDefinition", "priority").and_then(|priority| {
                zeebe_element(ZeebeExtensions {
                    priority_definition: Some(ZeebePriorityDefinition { priority }),
                    ..Default::default()
                })
            }),
        ));
    }
    if declared.contains("zeebe:script") {
        let p = props("zeebe:script");
        owned.push((
            "zeebe:script",
            p.contains_key("expression").then(|| XmlElement {
                name: "zeebe:script".into(),
                attributes: object_entries(p)
                    .into_iter()
                    .map(|(k, v)| (k.clone(), v.clone()))
                    .collect(),
                children: vec![],
                ..Default::default()
            }),
        ));
    }
    owned
}

/// The element-level extensions a template owns, each with what it now holds. Ownership follows
/// the bindings the template declares, not the ones active for these values, so switching a
/// dropdown off removes what it had written and applying twice gives the same element.
fn owned_extensions(declared: &HashSet<&str>, accum: &Accumulator) -> Owned {
    let mut owned: Owned = vec![];
    if declared.contains("zeebe:taskDefinition") || declared.contains("zeebe:taskDefinition:type") {
        owned.push((
            "zeebe:taskDefinition",
            accum.task_type.clone().and_then(|type_| {
                zeebe_element(ZeebeExtensions {
                    task_definition: Some(ZeebeTaskDefinition {
                        type_,
                        retries: accum.retries.clone(),
                    }),
                    ..Default::default()
                })
            }),
        ));
    }
    if declared.contains("zeebe:input") || declared.contains("zeebe:output") {
        let entry = |(source, target): &(String, String)| ZeebeIoMappingEntry {
            source: source.clone(),
            target: target.clone(),
        };
        owned.push((
            "zeebe:ioMapping",
            if accum.inputs.len() + accum.outputs.len() == 0 {
                None
            } else {
                zeebe_element(ZeebeExtensions {
                    io_mapping: Some(ZeebeIoMapping {
                        inputs: accum.inputs.iter().map(entry).collect(),
                        outputs: accum.outputs.iter().map(entry).collect(),
                    }),
                    ..Default::default()
                })
            },
        ));
    }
    if declared.contains("zeebe:taskHeader") {
        let headers: Vec<ZeebeTaskHeaderEntry> = object_entries(&accum.task_headers)
            .into_iter()
            .map(|(k, v)| ZeebeTaskHeaderEntry {
                key: k.clone(),
                value: v.clone(),
            })
            .collect();
        owned.push((
            "zeebe:taskHeaders",
            if headers.is_empty() {
                None
            } else {
                zeebe_element(ZeebeExtensions {
                    task_headers: Some(ZeebeTaskHeaders { headers }),
                    ..Default::default()
                })
            },
        ));
    }
    if declared.contains("zeebe:property") {
        let properties: Vec<ZeebePropertyEntry> = accum
            .zeebe_properties
            .iter()
            .map(|(name, value)| ZeebePropertyEntry {
                name: name.clone(),
                value: value.clone(),
            })
            .collect();
        owned.push((
            "zeebe:properties",
            if properties.is_empty() {
                None
            } else {
                zeebe_element(ZeebeExtensions {
                    properties: Some(ZeebeProperties { properties }),
                    ..Default::default()
                })
            },
        ));
    }
    if declared.contains("zeebe:adHoc") {
        let a = &accum.ad_hoc;
        owned.push((
            "zeebe:adHoc",
            if a.is_empty() {
                None
            } else {
                zeebe_element(ZeebeExtensions {
                    ad_hoc: Some(ZeebeAdHoc {
                        output_collection: a.get("outputCollection").cloned(),
                        output_element: a.get("outputElement").cloned(),
                        active_elements_collection: a.get("activeElementsCollection").cloned(),
                    }),
                    ..Default::default()
                })
            },
        ));
    }
    if declared.contains("zeebe:agentDefinition") {
        owned.push((
            "zeebe:agentDefinition",
            accum.agent_type.clone().and_then(|agent_type| {
                zeebe_element(ZeebeExtensions {
                    agent_definition: Some(ZeebeAgentDefinition { agent_type }),
                    ..Default::default()
                })
            }),
        ));
    }
    owned.extend(owned_task_extensions(declared, accum));
    if declared.contains("zeebe:linkedResource") {
        let children: Vec<XmlElement> = accum
            .linked_resources
            .iter()
            .map(|(link_name, attrs)| {
                let mut attributes = IndexMap::new();
                attributes.insert("linkName".to_owned(), link_name.clone());
                for (k, v) in object_entries(attrs) {
                    attributes.insert(k.clone(), v.clone());
                }
                XmlElement {
                    name: "zeebe:linkedResource".into(),
                    attributes,
                    children: vec![],
                    ..Default::default()
                }
            })
            .collect();
        owned.push((
            "zeebe:linkedResources",
            (!children.is_empty()).then(|| XmlElement {
                name: "zeebe:linkedResources".into(),
                attributes: IndexMap::new(),
                children,
                ..Default::default()
            }),
        ));
    }
    owned
}

const TASK_EXTENSION_TYPES: [&str; 8] = [
    "zeebe:userTask",
    "zeebe:calledElement",
    "zeebe:calledDecision",
    "zeebe:formDefinition",
    "zeebe:assignmentDefinition",
    "zeebe:taskSchedule",
    "zeebe:priorityDefinition",
    "zeebe:script",
];

/// Zeebe's deploy errors on the applied element, as `not-deployable` problems:
/// `Not deployable on Camunda <version>: <id>: <zeebe message> (<rule>)`.
fn applied_deploy_problems(
    defs: &BpmnDefinitions,
    element_id: &str,
    options: &ApplyToModelOptions,
) -> Vec<Problem> {
    if !options.validate {
        return vec![];
    }
    let declared = options.camunda_version.clone().or_else(|| {
        defs.unknown_attributes
            .get("modeler:executionPlatformVersion")
            .cloned()
    });
    let version =
        normalize_camunda_version(declared.as_deref()).map_or(ZEEBE_LATEST_VERSION, |v| v.as_str());
    // An error on the message an inbound template writes belongs to the element that uses it.
    let mut owner: HashMap<String, &str> = HashMap::new();
    owner.insert(element_id.to_owned(), element_id);
    if let Some(path) = locate(defs, element_id) {
        if let Some(m) = message_ref_of(element_at(defs, &path)) {
            owner.entry(m).or_insert(element_id);
        }
    }
    let options = ValidateOptions {
        camunda_version: Some(version.to_owned()),
        ..Default::default()
    };
    validate_deployable_xml(&serialize_bpmn(defs), &options)
        .into_iter()
        .filter(|f| f.data.severity == Severity::Error)
        .filter_map(|f| {
            let id = f.data.element_ids.first()?;
            owner.get(id.as_str())?;
            Some(Problem {
                key: None,
                kind: Some(ProblemKind::NotDeployable),
                message: format!(
                    "Not deployable on Camunda {version}: {id}: {} ({})",
                    f.data.message, f.data.id
                ),
            })
        })
        .collect()
}

/// Applies an element template to one element of a parsed model, every binding kind included
/// (the inbound ones builder options cannot carry).
///
/// - **Element type.** `elementType` converts the element (keeping its id and wiring), and
///   `elementType.eventDefinition` makes an event a message event. A template whose `appliesTo`
///   does not cover the element is refused (`problems` says why, the model is returned
///   unchanged).
/// - **Messages.** `bpmn:Message#property` names the root `bpmn:message` the event definition or
///   receive task references: reusing one already carrying that name, renaming the element's own
///   when nothing else uses it, creating one otherwise. `bpmn:Message#zeebe:subscription#property`
///   writes that message's `zeebe:subscription`; one left on the element itself is removed.
/// - **Generated values.** A property with `generatedValue` and no value keeps the name of the
///   message the element already references, else is derived from the template and element ids
///   (SHA-256), never from a clock or random source.
/// - **Extensions.** `zeebe:taskDefinition`, `ioMapping`, `taskHeaders`, `properties`, `adHoc`,
///   `linkedResources` and the task-level ones are replaced wholesale when the template declares
///   a binding of that kind, in place, and left alone otherwise. `zeebe:modelerTemplate`,
///   `...Version` and `...Icon` are stamped.
///
/// Deterministic and idempotent. `values` is keyed as in the TS `applyElementTemplate`; `name`
/// sets the element's name.
pub fn apply_template_to_element(
    definitions: &BpmnDefinitions,
    element_id: &str,
    template: &ElementTemplate,
    values: &IndexMap<String, String>,
    options: &ApplyToModelOptions,
) -> ApplyToElementResult {
    let refuse = |message: String| ApplyToElementResult {
        definitions: definitions.clone(),
        problems: vec![Problem::msg(message)],
    };

    let Some(path) = locate(definitions, element_id) else {
        return refuse(format!("No flow element \"{element_id}\" in this model"));
    };
    let original = element_at(definitions, &path).clone();

    let target_type = template
        .element_type
        .as_ref()
        .and_then(|t| to_element_type(&t.value));
    if let (Some(et), None) = (&template.element_type, target_type) {
        return refuse(format!(
            "Template \"{}\" converts to \"{}\", which is not a flow element type",
            template.id, et.value
        ));
    }
    if Some(original.element_type()) != target_type
        && !applies_to(template, original.element_type())
    {
        return refuse(format!(
            "Template \"{}\" applies to {}, not {} \"{element_id}\"",
            template.id,
            template.applies_to.join(", "),
            bpmn_element_name(original.type_name())
        ));
    }

    let mut next = definitions.clone();
    let current_message_id = message_ref_of(&original);
    let current_message_name = current_message_id
        .as_deref()
        .and_then(|id| next.messages.iter().find(|m| m.id == id))
        .and_then(|m| m.name.clone());

    let mut generate = |key: &str, prop: &crate::template::TemplateProperty| {
        if prop.binding.kind == "bpmn:Message#property"
            && prop.binding.name.as_deref() == Some("name")
            && current_message_name.is_some()
        {
            current_message_name.clone()
        } else {
            Some(derived_uuid(&format!(
                "{}\n{element_id}\n{key}",
                template.id
            )))
        }
    };
    let (accum, mut problems) = resolve_bindings(
        template,
        values,
        &mut generate,
        ApplyOptions {
            omit_defaults: options.omit_defaults,
        },
    );

    let mut element = original.clone();
    if let Some(t) = target_type {
        element = retype_element(&element, t);
    }
    if let Some(name) = values.get("name") {
        element.base_mut().name = Some(name.clone());
    }

    // Rebuilt rather than patched so a previous template's version or icon cannot survive.
    let mut stamps: Vec<(String, String)> =
        vec![("zeebe:modelerTemplate".into(), template.id.clone())];
    if let Some(v) = &template.version {
        stamps.push(("zeebe:modelerTemplateVersion".into(), js_string(Some(v))));
    }
    if let Some(icon) = &template.icon {
        stamps.push(("zeebe:modelerTemplateIcon".into(), icon.contents.clone()));
    }
    {
        let base = element.base_mut();
        base.unknown_attributes
            .retain(|k, _| !k.starts_with("zeebe:modelerTemplate"));
        base.unknown_attributes.extend(stamps);
    }

    let mut declared: HashSet<&str> = template
        .properties
        .iter()
        .map(|p| p.binding.kind.as_str())
        .collect();
    // Re-applying the template this element already carries (a new version, say) owns every
    // task-level extension: the old version's bindings are not in hand, and one the new version
    // dropped must not survive.
    if original
        .base()
        .unknown_attributes
        .get("zeebe:modelerTemplate")
        == Some(&template.id)
    {
        declared.extend(TASK_EXTENSION_TYPES);
    }
    let owner = bpmn_element_name(element.type_name());
    for (name, extension) in owned_extensions(&declared, &accum) {
        let base = element.base_mut();
        if extension.is_some() && !is_zeebe_placement_allowed(&owner, name) {
            problems.push(Problem::msg(format!(
                "<{name}> is not allowed on <{owner}>; it was not written"
            )));
            base.extension_elements = replace_extension(&base.extension_elements, name, None);
            continue;
        }
        base.extension_elements = replace_extension(&base.extension_elements, name, extension);
    }

    let uses_message = declared.contains("bpmn:Message#property")
        || declared.contains("bpmn:Message#zeebe:subscription#property");
    let event_definition = template
        .element_type
        .as_ref()
        .and_then(|t| t.event_definition.as_deref());

    let mut has_message_def = false;
    let is_event = element.element_type().is_event();
    if let Some(defs) = element.event_definitions_mut() {
        match event_definition {
            Some(ed) if ed != APPLIED_EVENT_DEFINITION => problems.push(Problem::msg(format!(
                "Event definition \"{ed}\" is not applied by this toolkit; the event's definitions were left as they were"
            ))),
            ed if ed.is_some() || uses_message => {
                let def = defs.iter().find(|d| is_message(d)).cloned().unwrap_or_else(|| {
                    BpmnEventDefinition::Message(BpmnMessageEventDefinition::default())
                });
                *defs = vec![def];
                has_message_def = true;
            }
            _ if template.element_type.is_some() && is_event => defs.clear(),
            _ => {}
        }
    }

    let is_message_task = matches!(
        element,
        BpmnFlowElement::ReceiveTask(_) | BpmnFlowElement::SendTask(_)
    );
    if uses_message {
        let name = accum.message.get("name").cloned().or(current_message_name);
        if let Some(name) = name {
            if !has_message_def && !is_message_task {
                problems.push(Problem::msg(format!(
                    "{owner} \"{element_id}\" cannot reference a message; the message bindings were not written"
                )));
            } else {
                let idx = resolve_message(&mut next, &name, current_message_id.as_deref());
                let message_id = next.messages[idx].id.clone();
                let message = &mut next.messages[idx];
                for (attribute, value) in object_entries(&accum.message) {
                    if attribute != "name" {
                        message
                            .unknown_attributes
                            .insert(attribute.clone(), value.clone());
                    }
                }
                if declared.contains("bpmn:Message#zeebe:subscription#property") {
                    let subscription = (!accum.subscription.is_empty()).then(|| XmlElement {
                        name: "zeebe:subscription".into(),
                        attributes: object_entries(&accum.subscription)
                            .into_iter()
                            .map(|(k, v)| (k.clone(), v.clone()))
                            .collect(),
                        children: vec![],
                        ..Default::default()
                    });
                    let exts = replace_extension(
                        message.extension_elements.as_deref().unwrap_or(&[]),
                        "zeebe:subscription",
                        subscription,
                    );
                    message.extension_elements = (!exts.is_empty()).then_some(exts);
                }
                if has_message_def {
                    if let Some(BpmnEventDefinition::Message(m)) =
                        element.event_definitions_mut().and_then(|d| d.first_mut())
                    {
                        m.message_ref = Some(message_id);
                    }
                } else if let BpmnFlowElement::ReceiveTask(t) | BpmnFlowElement::SendTask(t) =
                    &mut element
                {
                    t.message_ref = Some(message_id);
                }
                let base = element.base_mut();
                base.extension_elements =
                    replace_extension(&base.extension_elements, "zeebe:subscription", None);
            }
        } else {
            problems.push(Problem::msg(format!(
                "Template \"{}\" binds message properties but resolved no message name; the message was not written",
                template.id
            )));
        }
    }

    *element_at_mut(&mut next, &path) = element;
    problems.extend(applied_deploy_problems(&next, element_id, options));
    ApplyToElementResult {
        definitions: next,
        problems,
    }
}

fn parse_templates() -> Vec<ElementTemplate> {
    let values: Vec<serde_json::Value> =
        serde_json::from_str(bpmnkit_spec::templates::CONNECTOR_TEMPLATES_JSON)
            .expect("connectors.json is a JSON array");
    values
        .iter()
        .map(|v| ElementTemplate::from_value(v).expect("bundled template reads"))
        .collect()
}

/// The bundled Camunda 8 connector templates (parsed once).
pub fn catalog_templates() -> &'static [ElementTemplate] {
    static TEMPLATES: OnceLock<Vec<ElementTemplate>> = OnceLock::new();
    TEMPLATES.get_or_init(parse_templates)
}

/// A bundled template by id.
pub fn get_template(id: &str) -> Option<&'static ElementTemplate> {
    catalog_templates().iter().find(|t| t.id == id)
}

/// Parses `xml`, applies the template to the element and serializes the result. The problems are
/// the same as [`apply_template_to_element`]'s; a refused apply returns the input re-serialized.
pub fn bind_xml(
    xml: &str,
    element_id: &str,
    template: &ElementTemplate,
    values: &IndexMap<String, String>,
    options: &ApplyToModelOptions,
) -> Result<(String, Vec<Problem>), Error> {
    let defs = parse_bpmn(xml).map_err(|e| Error::Bpmn(e.to_string()))?;
    let result = apply_template_to_element(&defs, element_id, template, values, options);
    Ok((serialize_bpmn(&result.definitions), result.problems))
}

#[cfg(test)]
mod tests {
    use super::*;

    const XML: &str = r#"<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:zeebe="http://camunda.org/schema/zeebe/1.0" id="D" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="P" isExecutable="true">
    <bpmn:task id="T" name="Do" />
  </bpmn:process>
</bpmn:definitions>"#;

    fn http() -> &'static ElementTemplate {
        get_template("io.camunda.connectors.HttpJson.v2").expect("bundled")
    }

    #[test]
    fn derived_uuid_is_stable_and_uuid_shaped() {
        let id = derived_uuid("t\nE\nk");
        assert_eq!(id, derived_uuid("t\nE\nk"));
        let parts: Vec<usize> = id.split('-').map(str::len).collect();
        assert_eq!(parts, [8, 4, 4, 4, 12]);
        assert!(id.split('-').nth(2).unwrap().starts_with('8'));
        assert!("89ab".contains(id.split('-').nth(3).unwrap().chars().next().unwrap()));
        assert_ne!(id, derived_uuid("t\nE\nj"));
    }

    #[test]
    fn message_ids_are_sanitised_per_utf16_unit_and_deduped() {
        let mut defs = parse_bpmn(XML).unwrap();
        assert_eq!(new_message_id(&defs, "a b/\u{1F600}"), "Message_a_b___");
        defs.messages.push(BpmnMessage {
            id: "Message_x".into(),
            ..Default::default()
        });
        assert_eq!(new_message_id(&defs, "x"), "Message_x_2");
    }

    #[test]
    fn binding_stamps_the_template_and_leaves_the_input_alone() {
        let defs = parse_bpmn(XML).unwrap();
        let before = defs.clone();
        let r = apply_template_to_element(
            &defs,
            "T",
            http(),
            &IndexMap::new(),
            &ApplyToModelOptions {
                validate: false,
                ..Default::default()
            },
        );
        assert_eq!(defs, before);
        let xml = serialize_bpmn(&r.definitions);
        assert!(xml.contains("<bpmn:serviceTask"), "retyped: {xml}");
        assert!(xml.contains("zeebe:modelerTemplate=\"io.camunda.connectors.HttpJson.v2\""));
        assert!(xml.contains("<zeebe:taskDefinition type=\"io.camunda:http-json:1\""));
    }

    #[test]
    fn refusals_return_the_model_unchanged_with_a_reason() {
        let defs = parse_bpmn(XML).unwrap();
        let none = IndexMap::new();
        let opts = ApplyToModelOptions::default();
        let missing = apply_template_to_element(&defs, "Nope", http(), &none, &opts);
        assert_eq!(missing.definitions, defs);
        assert_eq!(
            missing.problems[0].message,
            "No flow element \"Nope\" in this model"
        );
        let start = get_template("io.camunda.connectors.webhook.WebhookConnector.v1").unwrap();
        let wrong = apply_template_to_element(&defs, "T", start, &none, &opts);
        assert_eq!(wrong.definitions, defs);
        assert!(wrong.problems[0]
            .message
            .ends_with("applies to bpmn:StartEvent, not bpmn:task \"T\""));
    }

    #[test]
    fn bind_xml_round_trips_and_is_idempotent() {
        let values: IndexMap<String, String> =
            [("url".to_owned(), "https://x.test".to_owned())].into();
        let opts = ApplyToModelOptions::default();
        let (once, problems) = bind_xml(XML, "T", http(), &values, &opts).unwrap();
        assert!(
            problems
                .iter()
                .all(|p| p.kind != Some(ProblemKind::MissingRequired)),
            "{problems:?}"
        );
        let (twice, _) = bind_xml(&once, "T", http(), &values, &opts).unwrap();
        assert_eq!(once, twice);
        assert!(matches!(
            bind_xml("<nope", "T", http(), &values, &opts),
            Err(Error::Bpmn(_))
        ));
    }

    #[test]
    fn deploy_findings_become_not_deployable_problems_unless_switched_off() {
        let defs = parse_bpmn(XML).unwrap();
        let template = ElementTemplate::from_json(
            r#"{"id":"c","appliesTo":["bpmn:Task"],"elementType":{"value":"bpmn:CallActivity"},"properties":[]}"#,
        )
        .unwrap();
        let on =
            apply_template_to_element(&defs, "T", &template, &IndexMap::new(), &Default::default());
        assert!(on
            .problems
            .iter()
            .any(|p| p.kind == Some(ProblemKind::NotDeployable)
                && p.message.starts_with("Not deployable on Camunda 8.")));
        let off = apply_template_to_element(
            &defs,
            "T",
            &template,
            &IndexMap::new(),
            &ApplyToModelOptions {
                validate: false,
                ..Default::default()
            },
        );
        assert!(off.problems.is_empty());
    }
}
