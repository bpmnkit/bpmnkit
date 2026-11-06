//! Typed view of Zeebe extension elements: port of `zeebe-extensions.ts` plus the
//! `getZeebeExtensions` reader from `utils.ts`. The model keeps `extensionElements`
//! verbatim; this module reads and writes them without losing unrecognised ones.
//!
//! Not ported: placement checks (`ensureZeebeExtension`, spec data will drive them)
//! and `makeConditionalDefinition` (needs the model's conditional event type).

use bpmnkit_xml::{local_name, Attrs, XmlElement};
use serde::{Deserialize, Serialize};

/// `bindingType` of a form, linked resource or called element.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum BindingType {
    Latest,
    Deployment,
    VersionTag,
}

impl BindingType {
    fn parse(s: &str) -> Option<Self> {
        match s {
            "latest" => Some(Self::Latest),
            "deployment" => Some(Self::Deployment),
            "versionTag" => Some(Self::VersionTag),
            _ => None,
        }
    }

    fn as_str(self) -> &'static str {
        match self {
            Self::Latest => "latest",
            Self::Deployment => "deployment",
            Self::VersionTag => "versionTag",
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ZeebeTaskDefinition {
    #[serde(rename = "type")]
    pub type_: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub retries: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ZeebeIoMappingEntry {
    pub source: String,
    pub target: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ZeebeIoMapping {
    pub inputs: Vec<ZeebeIoMappingEntry>,
    pub outputs: Vec<ZeebeIoMappingEntry>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ZeebeTaskHeaderEntry {
    pub key: String,
    pub value: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ZeebeTaskHeaders {
    pub headers: Vec<ZeebeTaskHeaderEntry>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ZeebePropertyEntry {
    pub name: String,
    pub value: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ZeebeProperties {
    pub properties: Vec<ZeebePropertyEntry>,
}

#[derive(Debug, Clone, Default, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ZeebeAdHoc {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub output_collection: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub output_element: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub active_elements_collection: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ZeebeAgentDefinition {
    pub agent_type: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ZeebeLinkedResource {
    pub resource_type: String,
    pub resource_id: String,
    pub link_name: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub binding_type: Option<BindingType>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub version_tag: Option<String>,
}

/// Untagged like TS's union: the JSON carries whichever of `formId` / `formKey` /
/// `externalReference` is present, tried in that order on deserialization.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(untagged)]
pub enum ZeebeFormDefinition {
    #[serde(rename_all = "camelCase")]
    FormId {
        form_id: String,
        #[serde(default, skip_serializing_if = "Option::is_none")]
        binding_type: Option<BindingType>,
        #[serde(default, skip_serializing_if = "Option::is_none")]
        version_tag: Option<String>,
    },
    #[serde(rename_all = "camelCase")]
    FormKey { form_key: String },
    #[serde(rename_all = "camelCase")]
    ExternalReference { external_reference: String },
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ZeebeCalledDecision {
    pub decision_id: String,
    pub result_variable: String,
}

#[derive(Debug, Clone, Default, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ZeebeAssignmentDefinition {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub assignee: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub candidate_groups: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub candidate_users: Option<String>,
}

#[derive(Debug, Clone, Default, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ZeebeTaskSchedule {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub due_date: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub follow_up_date: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ZeebePriorityDefinition {
    pub priority: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ZeebeSubscription {
    pub correlation_key: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ZeebeCalledElement {
    pub process_id: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub propagate_all_child_variables: Option<bool>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub propagate_all_parent_variables: Option<bool>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub binding_type: Option<BindingType>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub version_tag: Option<String>,
}

/// A job-worker listener (`zeebe:executionListener` / `zeebe:taskListener`).
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ZeebeListener {
    pub event_type: String,
    #[serde(rename = "type")]
    pub type_: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub retries: Option<String>,
    /// Read and written back so a read-modify-write does not drop them.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub headers: Option<Vec<ZeebeTaskHeaderEntry>>,
}

/// Collected Zeebe extensions of one flow element.
#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ZeebeExtensions {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub task_definition: Option<ZeebeTaskDefinition>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub io_mapping: Option<ZeebeIoMapping>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub task_headers: Option<ZeebeTaskHeaders>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub properties: Option<ZeebeProperties>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub ad_hoc: Option<ZeebeAdHoc>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub agent_definition: Option<ZeebeAgentDefinition>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub linked_resources: Option<Vec<ZeebeLinkedResource>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub form_definition: Option<ZeebeFormDefinition>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub called_decision: Option<ZeebeCalledDecision>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub called_element: Option<ZeebeCalledElement>,
    /// TS's `userTask?: true`: only ever absent or true, so a plain flag.
    #[serde(default, skip_serializing_if = "std::ops::Not::not")]
    pub user_task: bool,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub assignment_definition: Option<ZeebeAssignmentDefinition>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub task_schedule: Option<ZeebeTaskSchedule>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub priority_definition: Option<ZeebePriorityDefinition>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub subscription: Option<ZeebeSubscription>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub execution_listeners: Option<Vec<ZeebeListener>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub task_listeners: Option<Vec<ZeebeListener>>,
    /// Unrecognised extension elements preserved for round trip.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub unknown_elements: Option<Vec<XmlElement>>,
}

// ── reader ──────────────────────────────────────────────────────────────────

/// Matches on local name only, so any prefix counts as Zeebe (as in TS).
fn find_child<'a>(elements: &'a [XmlElement], tag: &str) -> Option<&'a XmlElement> {
    elements.iter().find(|c| local_name(&c.name) == tag)
}

fn find_children<'a>(
    elements: &'a [XmlElement],
    tag: &'a str,
) -> impl Iterator<Item = &'a XmlElement> {
    elements.iter().filter(move |c| local_name(&c.name) == tag)
}

fn attr(el: &XmlElement, name: &str) -> String {
    el.attr(name).unwrap_or_default().to_owned()
}

fn opt_attr(el: &XmlElement, name: &str) -> Option<String> {
    el.attr(name).map(str::to_owned)
}

fn binding(el: &XmlElement) -> Option<BindingType> {
    el.attr("bindingType").and_then(BindingType::parse)
}

fn read_headers(container: &XmlElement) -> Vec<ZeebeTaskHeaderEntry> {
    find_children(&container.children, "header")
        .map(|h| ZeebeTaskHeaderEntry {
            key: attr(h, "key"),
            value: attr(h, "value"),
        })
        .collect()
}

fn read_listeners(container: &XmlElement, tag: &str) -> Vec<ZeebeListener> {
    find_children(&container.children, tag)
        .map(|c| ZeebeListener {
            event_type: attr(c, "eventType"),
            type_: attr(c, "type"),
            retries: opt_attr(c, "retries"),
            headers: find_child(&c.children, "taskHeaders").map(read_headers),
        })
        .collect()
}

fn read_io(container: &XmlElement, tag: &str) -> Vec<ZeebeIoMappingEntry> {
    find_children(&container.children, tag)
        .map(|c| ZeebeIoMappingEntry {
            source: attr(c, "source"),
            target: attr(c, "target"),
        })
        .collect()
}

const KNOWN_ZEEBE_ELEMENTS: [&str; 17] = [
    "taskDefinition",
    "ioMapping",
    "taskHeaders",
    "properties",
    "adHoc",
    "agentDefinition",
    "linkedResources",
    "formDefinition",
    "calledDecision",
    "calledElement",
    "userTask",
    "assignmentDefinition",
    "taskSchedule",
    "priorityDefinition",
    "subscription",
    "executionListeners",
    "taskListeners",
];

/// Extracts the Zeebe extension data from a flow element's raw `extensionElements`.
/// Inverse of [`zeebe_extensions_to_xml_elements`]; only what is present is returned.
pub fn get_zeebe_extensions(extension_elements: &[XmlElement]) -> ZeebeExtensions {
    let ee = extension_elements;
    let mut ext = ZeebeExtensions {
        task_definition: find_child(ee, "taskDefinition").map(|el| ZeebeTaskDefinition {
            type_: attr(el, "type"),
            retries: opt_attr(el, "retries"),
        }),
        io_mapping: find_child(ee, "ioMapping").map(|el| ZeebeIoMapping {
            inputs: read_io(el, "input"),
            outputs: read_io(el, "output"),
        }),
        task_headers: find_child(ee, "taskHeaders").map(|el| ZeebeTaskHeaders {
            headers: read_headers(el),
        }),
        properties: find_child(ee, "properties").map(|el| ZeebeProperties {
            properties: find_children(&el.children, "property")
                .map(|c| ZeebePropertyEntry {
                    name: attr(c, "name"),
                    value: attr(c, "value"),
                })
                .collect(),
        }),
        form_definition: find_child(ee, "formDefinition").map(|el| {
            let form_id = el.attr("formId");
            // formId wins when present alongside formKey / externalReference, as in TS.
            match (form_id, el.attr("formKey"), el.attr("externalReference")) {
                (None, Some(key), _) => ZeebeFormDefinition::FormKey {
                    form_key: key.to_owned(),
                },
                (None, None, Some(reference)) => ZeebeFormDefinition::ExternalReference {
                    external_reference: reference.to_owned(),
                },
                _ => ZeebeFormDefinition::FormId {
                    form_id: form_id.unwrap_or_default().to_owned(),
                    binding_type: binding(el),
                    version_tag: opt_attr(el, "versionTag"),
                },
            }
        }),
        agent_definition: find_child(ee, "agentDefinition").map(|el| ZeebeAgentDefinition {
            agent_type: attr(el, "agentType"),
        }),
        called_decision: find_child(ee, "calledDecision").map(|el| ZeebeCalledDecision {
            decision_id: attr(el, "decisionId"),
            result_variable: attr(el, "resultVariable"),
        }),
        called_element: find_child(ee, "calledElement").map(|el| ZeebeCalledElement {
            process_id: attr(el, "processId"),
            propagate_all_child_variables: el
                .attr("propagateAllChildVariables")
                .map(|v| v == "true"),
            propagate_all_parent_variables: el
                .attr("propagateAllParentVariables")
                .map(|v| v == "true"),
            binding_type: binding(el),
            version_tag: opt_attr(el, "versionTag"),
        }),
        ad_hoc: find_child(ee, "adHoc").map(|el| ZeebeAdHoc {
            output_collection: opt_attr(el, "outputCollection"),
            output_element: opt_attr(el, "outputElement"),
            active_elements_collection: opt_attr(el, "activeElementsCollection"),
        }),
        user_task: find_child(ee, "userTask").is_some(),
        assignment_definition: find_child(ee, "assignmentDefinition").map(|el| {
            ZeebeAssignmentDefinition {
                assignee: opt_attr(el, "assignee"),
                candidate_groups: opt_attr(el, "candidateGroups"),
                candidate_users: opt_attr(el, "candidateUsers"),
            }
        }),
        task_schedule: find_child(ee, "taskSchedule").map(|el| ZeebeTaskSchedule {
            due_date: opt_attr(el, "dueDate"),
            follow_up_date: opt_attr(el, "followUpDate"),
        }),
        priority_definition: find_child(ee, "priorityDefinition").map(|el| {
            ZeebePriorityDefinition {
                priority: attr(el, "priority"),
            }
        }),
        subscription: find_child(ee, "subscription").map(|el| ZeebeSubscription {
            correlation_key: attr(el, "correlationKey"),
        }),
        execution_listeners: find_child(ee, "executionListeners")
            .map(|el| read_listeners(el, "executionListener")),
        task_listeners: find_child(ee, "taskListeners")
            .map(|el| read_listeners(el, "taskListener")),
        ..ZeebeExtensions::default()
    };

    if let Some(el) = find_child(ee, "linkedResources") {
        let linked: Vec<_> = find_children(&el.children, "linkedResource")
            .map(|c| ZeebeLinkedResource {
                resource_type: attr(c, "resourceType"),
                resource_id: attr(c, "resourceId"),
                link_name: attr(c, "linkName"),
                binding_type: binding(c),
                version_tag: opt_attr(c, "versionTag"),
            })
            .collect();
        // TS leaves the field unset for an empty container.
        if !linked.is_empty() {
            ext.linked_resources = Some(linked);
        }
    }

    // Anything without a typed field must survive a read-modify-write.
    let unknown: Vec<XmlElement> = ee
        .iter()
        .filter(|c| !KNOWN_ZEEBE_ELEMENTS.contains(&local_name(&c.name)))
        .cloned()
        .collect();
    if !unknown.is_empty() {
        ext.unknown_elements = Some(unknown);
    }
    ext
}

// ── writer ──────────────────────────────────────────────────────────────────

fn el(name: &str, attrs: &[(&str, &str)], children: Vec<XmlElement>) -> XmlElement {
    let mut e = XmlElement::new(name);
    for (k, v) in attrs {
        e.attributes.insert((*k).to_owned(), (*v).to_owned());
    }
    e.children = children;
    e
}

fn header_elements(headers: &[ZeebeTaskHeaderEntry]) -> Vec<XmlElement> {
    headers
        .iter()
        .map(|h| {
            el(
                "zeebe:header",
                &[("key", &h.key), ("value", &h.value)],
                vec![],
            )
        })
        .collect()
}

fn listeners_to_xml(container: &str, child: &str, listeners: &[ZeebeListener]) -> XmlElement {
    let children = listeners
        .iter()
        .map(|l| {
            let mut attrs = Attrs::new();
            attrs.insert("eventType".into(), l.event_type.clone());
            attrs.insert("type".into(), l.type_.clone());
            if let Some(r) = &l.retries {
                attrs.insert("retries".into(), r.clone());
            }
            let mut e = XmlElement::new(format!("zeebe:{child}"));
            e.attributes = attrs;
            // An empty header list writes no `zeebe:taskHeaders` at all (TS `?.length`).
            if let Some(h) = l.headers.as_deref().filter(|h| !h.is_empty()) {
                e.children = vec![el("zeebe:taskHeaders", &[], header_elements(h))];
            }
            e
        })
        .collect();
    el(&format!("zeebe:{container}"), &[], children)
}

/// Pushes `key` only for a non-empty value: TS tests these with truthiness.
fn push_truthy<'a>(attrs: &mut Vec<(&'a str, &'a str)>, key: &'a str, v: &'a Option<String>) {
    if let Some(v) = v.as_deref().filter(|v| !v.is_empty()) {
        attrs.push((key, v));
    }
}

/// Converts Zeebe extensions to the raw element list the BPMN model stores.
/// Element order, attribute order and omission rules mirror the TS writer.
pub fn zeebe_extensions_to_xml_elements(x: &ZeebeExtensions) -> Vec<XmlElement> {
    let mut out = Vec::new();

    if let Some(t) = &x.task_definition {
        let mut a = vec![("type", t.type_.as_str())];
        if let Some(r) = &t.retries {
            a.push(("retries", r));
        }
        out.push(el("zeebe:taskDefinition", &a, vec![]));
    }

    if let Some(io) = &x.io_mapping {
        let mut children = Vec::new();
        for (tag, entries) in [("zeebe:input", &io.inputs), ("zeebe:output", &io.outputs)] {
            for e in entries {
                children.push(el(
                    tag,
                    &[("source", &e.source), ("target", &e.target)],
                    vec![],
                ));
            }
        }
        out.push(el("zeebe:ioMapping", &[], children));
    }

    if let Some(h) = &x.task_headers {
        out.push(el("zeebe:taskHeaders", &[], header_elements(&h.headers)));
    }

    if let Some(p) = &x.properties {
        let children = p
            .properties
            .iter()
            .map(|p| {
                el(
                    "zeebe:property",
                    &[("name", &p.name), ("value", &p.value)],
                    vec![],
                )
            })
            .collect();
        out.push(el("zeebe:properties", &[], children));
    }

    if let Some(h) = &x.ad_hoc {
        let mut a = Vec::new();
        push_truthy(&mut a, "outputCollection", &h.output_collection);
        push_truthy(&mut a, "outputElement", &h.output_element);
        push_truthy(
            &mut a,
            "activeElementsCollection",
            &h.active_elements_collection,
        );
        out.push(el("zeebe:adHoc", &a, vec![]));
    }

    if let Some(d) = &x.agent_definition {
        out.push(el(
            "zeebe:agentDefinition",
            &[("agentType", &d.agent_type)],
            vec![],
        ));
    }

    if let Some(res) = x.linked_resources.as_deref().filter(|r| !r.is_empty()) {
        let children = res
            .iter()
            .map(|r| {
                let mut a = vec![
                    ("resourceType", r.resource_type.as_str()),
                    ("resourceId", &r.resource_id),
                    ("linkName", &r.link_name),
                ];
                if let Some(b) = r.binding_type {
                    a.push(("bindingType", b.as_str()));
                }
                if let Some(v) = &r.version_tag {
                    a.push(("versionTag", v));
                }
                el("zeebe:linkedResource", &a, vec![])
            })
            .collect();
        out.push(el("zeebe:linkedResources", &[], children));
    }

    if x.user_task {
        out.push(el("zeebe:userTask", &[], vec![]));
    }

    if let Some(f) = &x.form_definition {
        let mut a = Vec::new();
        match f {
            ZeebeFormDefinition::FormId {
                form_id,
                binding_type,
                version_tag,
            } => {
                a.push(("formId", form_id.as_str()));
                if let Some(b) = binding_type {
                    a.push(("bindingType", b.as_str()));
                }
                if let Some(v) = version_tag {
                    a.push(("versionTag", v));
                }
            }
            ZeebeFormDefinition::FormKey { form_key } => a.push(("formKey", form_key)),
            ZeebeFormDefinition::ExternalReference { external_reference } => {
                a.push(("externalReference", external_reference));
            }
        }
        out.push(el("zeebe:formDefinition", &a, vec![]));
    }

    if let Some(d) = &x.called_decision {
        out.push(el(
            "zeebe:calledDecision",
            &[
                ("decisionId", &d.decision_id),
                ("resultVariable", &d.result_variable),
            ],
            vec![],
        ));
    }

    if let Some(c) = &x.called_element {
        let mut a = vec![("processId", c.process_id.as_str())];
        let bool_str = |b: bool| if b { "true" } else { "false" };
        if let Some(b) = c.propagate_all_child_variables {
            a.push(("propagateAllChildVariables", bool_str(b)));
        }
        if let Some(b) = c.propagate_all_parent_variables {
            a.push(("propagateAllParentVariables", bool_str(b)));
        }
        if let Some(b) = c.binding_type {
            a.push(("bindingType", b.as_str()));
        }
        if let Some(v) = &c.version_tag {
            a.push(("versionTag", v));
        }
        out.push(el("zeebe:calledElement", &a, vec![]));
    }

    if let Some(d) = &x.assignment_definition {
        let mut a = Vec::new();
        push_truthy(&mut a, "assignee", &d.assignee);
        push_truthy(&mut a, "candidateGroups", &d.candidate_groups);
        push_truthy(&mut a, "candidateUsers", &d.candidate_users);
        if !a.is_empty() {
            out.push(el("zeebe:assignmentDefinition", &a, vec![]));
        }
    }

    if let Some(s) = &x.task_schedule {
        let mut a = Vec::new();
        push_truthy(&mut a, "dueDate", &s.due_date);
        push_truthy(&mut a, "followUpDate", &s.follow_up_date);
        if !a.is_empty() {
            out.push(el("zeebe:taskSchedule", &a, vec![]));
        }
    }

    if let Some(p) = &x.priority_definition {
        out.push(el(
            "zeebe:priorityDefinition",
            &[("priority", &p.priority)],
            vec![],
        ));
    }

    if let Some(s) = &x.subscription {
        out.push(el(
            "zeebe:subscription",
            &[("correlationKey", &s.correlation_key)],
            vec![],
        ));
    }

    if let Some(l) = x.execution_listeners.as_deref().filter(|l| !l.is_empty()) {
        out.push(listeners_to_xml(
            "executionListeners",
            "executionListener",
            l,
        ));
    }
    if let Some(l) = x.task_listeners.as_deref().filter(|l| !l.is_empty()) {
        out.push(listeners_to_xml("taskListeners", "taskListener", l));
    }

    if let Some(u) = &x.unknown_elements {
        out.extend(u.iter().cloned());
    }
    out
}

/// The BPMN element name a flow element's model `type` is written as: TS's
/// `eventSubProcess` is a `bpmn:subProcess` carrying `triggeredByEvent`.
pub fn bpmn_element_name(flow_element_type: &str) -> String {
    let local = if flow_element_type == "eventSubProcess" {
        "subProcess"
    } else {
        flow_element_type
    };
    format!("bpmn:{local}")
}

// ── optimizer readers (optimize/utils.ts) ───────────────────────────────────
// Unlike `get_zeebe_extensions` these match the literal `zeebe:` prefix.

pub fn read_zeebe_task_type(ext: &[XmlElement]) -> Option<String> {
    let el = ext.iter().find(|e| e.name == "zeebe:taskDefinition")?;
    el.attr("type").map(str::to_owned)
}

pub fn read_zeebe_io_mapping(ext: &[XmlElement]) -> Option<ZeebeIoMapping> {
    let el = ext.iter().find(|e| e.name == "zeebe:ioMapping")?;
    let entries = |tag: &str| -> Vec<ZeebeIoMappingEntry> {
        el.children
            .iter()
            .filter(|c| c.name == tag)
            .map(|c| ZeebeIoMappingEntry {
                source: attr(c, "source"),
                target: attr(c, "target"),
            })
            .collect()
    };
    Some(ZeebeIoMapping {
        inputs: entries("zeebe:input"),
        outputs: entries("zeebe:output"),
    })
}

pub fn read_zeebe_task_headers(ext: &[XmlElement]) -> Option<ZeebeTaskHeaders> {
    let el = ext.iter().find(|e| e.name == "zeebe:taskHeaders")?;
    let headers = el
        .children
        .iter()
        .filter(|c| c.name == "zeebe:header")
        .map(|c| ZeebeTaskHeaderEntry {
            key: attr(c, "key"),
            value: attr(c, "value"),
        })
        .collect();
    Some(ZeebeTaskHeaders { headers })
}

/// Whether the Zeebe schema lets `extension` (`zeebe:name`) sit on `owner` (`bpmn:serviceTask`,
/// or `zeebe:…` for nested extensions). An extension the schema says nothing about is allowed.
pub fn is_zeebe_placement_allowed(owner: &str, extension: &str) -> bool {
    let owners = bpmnkit_spec::elements::zeebe_allowed_in(extension);
    owners.is_empty() || owners.contains(&owner)
}

/// TS's `assertZeebePlacement`: the error message is `ZeebePlacementError`'s.
pub fn assert_zeebe_placement(owner: &str, extension: &str) -> Result<(), String> {
    if is_zeebe_placement_allowed(owner, extension) {
        return Ok(());
    }
    Err(format!(
        "<{extension}> is not allowed on <{owner}>. The Zeebe schema allows it on: {}.",
        bpmnkit_spec::elements::zeebe_allowed_in(extension).join(", ")
    ))
}

#[cfg(test)]
mod tests {
    #[test]
    fn placement_follows_the_spec() {
        use super::{assert_zeebe_placement, is_zeebe_placement_allowed};
        assert!(is_zeebe_placement_allowed(
            "bpmn:serviceTask",
            "zeebe:taskDefinition"
        ));
        assert!(!is_zeebe_placement_allowed(
            "bpmn:serviceTask",
            "zeebe:calledDecision"
        ));
        assert!(is_zeebe_placement_allowed(
            "bpmn:task",
            "zeebe:somethingNew"
        ));
        assert_eq!(
            assert_zeebe_placement("bpmn:serviceTask", "zeebe:calledDecision").unwrap_err(),
            "<zeebe:calledDecision> is not allowed on <bpmn:serviceTask>. The Zeebe schema allows it on: bpmn:businessRuleTask."
        );
    }

    use super::*;
    use bpmnkit_xml::parse_xml;
    use serde_json::json;

    fn rich() -> ZeebeExtensions {
        let hdr = |k: &str, v: &str| ZeebeTaskHeaderEntry {
            key: k.into(),
            value: v.into(),
        };
        ZeebeExtensions {
            task_definition: Some(ZeebeTaskDefinition {
                type_: "work".into(),
                retries: Some("3".into()),
            }),
            io_mapping: Some(ZeebeIoMapping {
                inputs: vec![ZeebeIoMappingEntry {
                    source: "=a".into(),
                    target: "b".into(),
                }],
                outputs: vec![ZeebeIoMappingEntry {
                    source: "=c".into(),
                    target: "d".into(),
                }],
            }),
            task_headers: Some(ZeebeTaskHeaders {
                headers: vec![hdr("k", "v")],
            }),
            properties: Some(ZeebeProperties {
                properties: vec![ZeebePropertyEntry {
                    name: "n".into(),
                    value: "v".into(),
                }],
            }),
            ad_hoc: Some(ZeebeAdHoc {
                output_collection: Some("res".into()),
                output_element: Some("=x".into()),
                active_elements_collection: Some("=ids".into()),
            }),
            agent_definition: Some(ZeebeAgentDefinition {
                agent_type: "aiAgentTask".into(),
            }),
            linked_resources: Some(vec![
                ZeebeLinkedResource {
                    resource_type: "RPA".into(),
                    resource_id: "rpa-1".into(),
                    link_name: "script".into(),
                    binding_type: Some(BindingType::VersionTag),
                    version_tag: Some("v1".into()),
                },
                ZeebeLinkedResource {
                    resource_type: "RPA".into(),
                    resource_id: "rpa-2".into(),
                    link_name: "other".into(),
                    binding_type: None,
                    version_tag: None,
                },
            ]),
            form_definition: Some(ZeebeFormDefinition::FormId {
                form_id: "form1".into(),
                binding_type: Some(BindingType::Deployment),
                version_tag: None,
            }),
            called_decision: Some(ZeebeCalledDecision {
                decision_id: "dec".into(),
                result_variable: "out".into(),
            }),
            called_element: Some(ZeebeCalledElement {
                process_id: "child".into(),
                propagate_all_child_variables: Some(false),
                propagate_all_parent_variables: Some(true),
                binding_type: Some(BindingType::VersionTag),
                version_tag: Some("v1".into()),
            }),
            user_task: true,
            assignment_definition: Some(ZeebeAssignmentDefinition {
                assignee: Some("me".into()),
                candidate_groups: Some("g".into()),
                candidate_users: Some("u".into()),
            }),
            task_schedule: Some(ZeebeTaskSchedule {
                due_date: Some("2030-01-01".into()),
                follow_up_date: Some("2030-02-01".into()),
            }),
            priority_definition: Some(ZeebePriorityDefinition {
                priority: "75".into(),
            }),
            subscription: Some(ZeebeSubscription {
                correlation_key: "=key".into(),
            }),
            execution_listeners: Some(vec![ZeebeListener {
                event_type: "start".into(),
                type_: "l1".into(),
                retries: Some("2".into()),
                headers: Some(vec![hdr("a", "b")]),
            }]),
            task_listeners: Some(vec![ZeebeListener {
                event_type: "completing".into(),
                type_: "l2".into(),
                retries: None,
                headers: None,
            }]),
            unknown_elements: Some(vec![el("zeebe:future", &[("a", "1")], vec![])]),
        }
    }

    fn roundtrip(x: &ZeebeExtensions) -> ZeebeExtensions {
        get_zeebe_extensions(&zeebe_extensions_to_xml_elements(x))
    }

    #[test]
    fn roundtrips_every_field_at_once() {
        let x = rich();
        assert_eq!(roundtrip(&x), x);
        // Writer output is a fixed point of reader -> writer.
        let els = zeebe_extensions_to_xml_elements(&x);
        assert_eq!(
            zeebe_extensions_to_xml_elements(&get_zeebe_extensions(&els)),
            els
        );
    }

    #[test]
    fn roundtrips_each_form_variant() {
        for f in [
            ZeebeFormDefinition::FormId {
                form_id: "f".into(),
                binding_type: Some(BindingType::VersionTag),
                version_tag: Some("v2".into()),
            },
            ZeebeFormDefinition::FormKey {
                form_key: "camunda-forms:bpmn:emb".into(),
            },
            ZeebeFormDefinition::ExternalReference {
                external_reference: "https://example.com/form".into(),
            },
        ] {
            let x = ZeebeExtensions {
                form_definition: Some(f),
                ..Default::default()
            };
            assert_eq!(roundtrip(&x), x);
        }
    }

    #[test]
    fn json_shape_matches_ts() {
        let x = ZeebeExtensions {
            task_definition: Some(ZeebeTaskDefinition {
                type_: "w".into(),
                retries: None,
            }),
            user_task: true,
            form_definition: Some(ZeebeFormDefinition::FormKey {
                form_key: "k".into(),
            }),
            called_element: Some(ZeebeCalledElement {
                process_id: "p".into(),
                propagate_all_child_variables: Some(true),
                propagate_all_parent_variables: None,
                binding_type: Some(BindingType::VersionTag),
                version_tag: None,
            }),
            ..Default::default()
        };
        assert_eq!(
            serde_json::to_value(&x).unwrap(),
            json!({
                "taskDefinition": {"type": "w"},
                "formDefinition": {"formKey": "k"},
                "calledElement": {
                    "processId": "p",
                    "propagateAllChildVariables": true,
                    "bindingType": "versionTag"
                },
                "userTask": true
            })
        );
        assert_eq!(
            serde_json::to_value(ZeebeExtensions::default()).unwrap(),
            json!({})
        );
        let back: ZeebeExtensions =
            serde_json::from_value(serde_json::to_value(rich()).unwrap()).unwrap();
        assert_eq!(back, rich());
    }

    #[test]
    fn writes_only_defined_called_element_attributes() {
        let els = zeebe_extensions_to_xml_elements(&ZeebeExtensions {
            called_element: Some(ZeebeCalledElement {
                process_id: "p".into(),
                propagate_all_child_variables: None,
                propagate_all_parent_variables: None,
                binding_type: None,
                version_tag: None,
            }),
            ..Default::default()
        });
        assert_eq!(
            els,
            vec![el("zeebe:calledElement", &[("processId", "p")], vec![])]
        );
    }

    #[test]
    fn tolerates_missing_attributes() {
        let bare = |n: &str| vec![XmlElement::new(n)];
        let c = get_zeebe_extensions(&bare("zeebe:calledElement"))
            .called_element
            .unwrap();
        assert_eq!(c.process_id, "");
        assert_eq!(c.binding_type, None);
        assert_eq!(
            get_zeebe_extensions(&bare("zeebe:adHoc")).ad_hoc,
            Some(ZeebeAdHoc::default())
        );
        assert_eq!(
            get_zeebe_extensions(&bare("zeebe:priorityDefinition"))
                .priority_definition
                .unwrap()
                .priority,
            ""
        );
    }

    #[test]
    fn writer_skips_empty_values_where_ts_tests_truthiness() {
        let x = ZeebeExtensions {
            ad_hoc: Some(ZeebeAdHoc {
                output_collection: Some(String::new()),
                ..Default::default()
            }),
            assignment_definition: Some(ZeebeAssignmentDefinition {
                assignee: Some(String::new()),
                ..Default::default()
            }),
            task_schedule: Some(ZeebeTaskSchedule::default()),
            linked_resources: Some(vec![]),
            execution_listeners: Some(vec![]),
            ..Default::default()
        };
        // adHoc is always written (possibly bare); the other containers are omitted.
        assert_eq!(
            zeebe_extensions_to_xml_elements(&x),
            vec![el("zeebe:adHoc", &[], vec![])]
        );
    }

    #[test]
    fn reader_matches_any_prefix_and_keeps_unknowns_in_order() {
        let xml = r#"<bpmn:extensionElements xmlns:bpmn="b" xmlns:z="z" xmlns:o="o">
            <z:taskDefinition type="t" retries="5"/>
            <o:vendor a="1"/>
            <z:linkedResources/>
            <o:other/>
        </bpmn:extensionElements>"#;
        let root = parse_xml(xml).unwrap();
        let x = get_zeebe_extensions(&root.children);
        assert_eq!(x.task_definition.unwrap().retries.as_deref(), Some("5"));
        assert_eq!(x.linked_resources, None);
        let names: Vec<_> = x
            .unknown_elements
            .unwrap()
            .iter()
            .map(|e| e.name.clone())
            .collect();
        assert_eq!(names, ["o:vendor", "o:other"]);
    }

    #[test]
    fn form_id_wins_over_form_key() {
        let e = el(
            "zeebe:formDefinition",
            &[("formKey", "k"), ("formId", "id")],
            vec![],
        );
        assert_eq!(
            get_zeebe_extensions(&[e]).form_definition,
            Some(ZeebeFormDefinition::FormId {
                form_id: "id".into(),
                binding_type: None,
                version_tag: None
            })
        );
    }

    #[test]
    fn writes_element_and_attribute_order() {
        let els = zeebe_extensions_to_xml_elements(&rich());
        let names: Vec<_> = els.iter().map(|e| e.name.as_str()).collect();
        assert_eq!(
            names,
            [
                "zeebe:taskDefinition",
                "zeebe:ioMapping",
                "zeebe:taskHeaders",
                "zeebe:properties",
                "zeebe:adHoc",
                "zeebe:agentDefinition",
                "zeebe:linkedResources",
                "zeebe:userTask",
                "zeebe:formDefinition",
                "zeebe:calledDecision",
                "zeebe:calledElement",
                "zeebe:assignmentDefinition",
                "zeebe:taskSchedule",
                "zeebe:priorityDefinition",
                "zeebe:subscription",
                "zeebe:executionListeners",
                "zeebe:taskListeners",
                "zeebe:future",
            ]
        );
        let keys: Vec<_> = els[10].attributes.keys().map(String::as_str).collect();
        assert_eq!(
            keys,
            [
                "processId",
                "propagateAllChildVariables",
                "propagateAllParentVariables",
                "bindingType",
                "versionTag"
            ]
        );
        let listener = &els[15].children[0];
        assert_eq!(listener.children[0].name, "zeebe:taskHeaders");
    }

    #[test]
    fn element_name_and_optimizer_readers() {
        assert_eq!(bpmn_element_name("eventSubProcess"), "bpmn:subProcess");
        assert_eq!(bpmn_element_name("serviceTask"), "bpmn:serviceTask");
        let els = zeebe_extensions_to_xml_elements(&rich());
        assert_eq!(read_zeebe_task_type(&els).as_deref(), Some("work"));
        assert_eq!(read_zeebe_io_mapping(&els), rich().io_mapping);
        assert_eq!(read_zeebe_task_headers(&els), rich().task_headers);
        assert_eq!(read_zeebe_task_type(&[]), None);
    }
}
