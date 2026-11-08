//! Port of `bpmn/compact.ts` lines 241–455: `compactify` (`findAttr`,
//! `compactifyElement`, `compactifyFlows`).
//!
//! Porter notes:
//! - `assertBpmnDefinitions` is a runtime type guard; the Rust type makes it moot.
//! - `compactifyElement` builds the object key by key; optional keys appear only when TS
//!   sets them (`if (x) result.x = …` uses JS truthiness: `""` is not set).
//! - `priority`: `/^\d+$/` → `Number(priority)` (a `NumberOrString::Number`), else the
//!   string. `modelerTemplate.version` is `Number.parseInt(v, 10)`: leading digits only
//!   (`"18abc"` → 18, `"abc"` → NaN → no version). Use JS `parseInt` semantics (leading
//!   whitespace, sign).
//! - Task headers, inputs, outputs and properties are built in XML order into a
//!   [`JsRecord`]; a repeated key keeps its first position and the last value.
//! - `findAttr` matches the literal `zeebe:` prefix (`ext.find(e => e.name === name)`).
//! - Container children recurse (`children: { elements, flows }`) for every element with
//!   `flowElements` and at least one child (`"flowElements" in el && length > 0`).
//! - `compactifyFlows`: `isDefault` from any element's `default` in the same scope.

use bpmnkit_bpmn::js::{is_js_space, js_number};
use bpmnkit_bpmn::{
    BpmnDefinitions, BpmnEventDefinition, BpmnFlowElement, BpmnSequenceFlow, XmlElement,
};
use indexmap::IndexSet;

use super::expand::is_connector_job_type;
use super::types::*;
use crate::js_record::JsRecord;

/// TS's `findAttr`: attribute `attr` of the first extension element named `name`.
fn find_attr<'a>(ext: &'a [XmlElement], name: &str, attr: &str) -> Option<&'a str> {
    ext.iter()
        .find(|e| e.name == name)
        .and_then(|e| e.attributes.get(attr))
        .map(String::as_str)
}

/// `findAttr` filtered by JS truthiness (`if (value)`): the empty string counts as unset.
fn truthy_attr(ext: &[XmlElement], name: &str, attr: &str) -> Option<String> {
    find_attr(ext, name, attr)
        .filter(|v| !v.is_empty())
        .map(str::to_owned)
}

/// `Number.parseInt(s, 10)`; `None` for NaN.
fn parse_int(s: &str) -> Option<f64> {
    let s = s.trim_start_matches(is_js_space);
    let (neg, rest) = match s.as_bytes().first() {
        Some(b'-') => (true, &s[1..]),
        Some(b'+') => (false, &s[1..]),
        _ => (false, s),
    };
    let end = rest
        .bytes()
        .position(|b| !b.is_ascii_digit())
        .unwrap_or(rest.len());
    if end == 0 {
        return None;
    }
    let n: f64 = rest[..end].parse().ok()?;
    Some(if neg { -n } else { n })
}

/// TS's `compactifyElement`.
fn compactify_element(el: &BpmnFlowElement) -> CompactElement {
    let base = el.base();
    let ext = &base.extension_elements;
    let mut result = CompactElement {
        id: base.id.clone(),
        type_: el.type_name().to_owned(),
        ..CompactElement::default()
    };
    result.name = base.name.clone().filter(|n| !n.is_empty());
    result.documentation = base.documentation.clone().filter(|n| !n.is_empty());

    let job_type = find_attr(ext, "zeebe:taskDefinition", "type");
    result.job_type = job_type.filter(|v| !v.is_empty()).map(str::to_owned);

    // A connector's result variable is a header; it is kept apart to round-trip as
    // `resultVariable`.
    let connector = job_type.is_some_and(is_connector_job_type);
    let mut header_result: Option<&str> = None;
    if let Some(headers_el) = ext.iter().find(|e| e.name == "zeebe:taskHeaders") {
        if !headers_el.children.is_empty() {
            let mut headers = JsRecord::new();
            for child in &headers_el.children {
                let (Some(key), Some(value)) =
                    (child.attributes.get("key"), child.attributes.get("value"))
                else {
                    continue;
                };
                if connector && key == "resultVariable" {
                    header_result = Some(value);
                } else {
                    headers.insert(key.as_str(), value.as_str());
                }
            }
            if !headers.is_empty() {
                result.task_headers = Some(headers);
            }
        }
    }

    result.called_process = truthy_attr(ext, "zeebe:calledElement", "processId");
    result.form_id = truthy_attr(ext, "zeebe:formDefinition", "formId");
    result.assignee = truthy_attr(ext, "zeebe:assignmentDefinition", "assignee");
    result.candidate_groups = truthy_attr(ext, "zeebe:assignmentDefinition", "candidateGroups");
    result.candidate_users = truthy_attr(ext, "zeebe:assignmentDefinition", "candidateUsers");
    result.due_date = truthy_attr(ext, "zeebe:taskSchedule", "dueDate");
    result.follow_up_date = truthy_attr(ext, "zeebe:taskSchedule", "followUpDate");
    if let Some(priority) = truthy_attr(ext, "zeebe:priorityDefinition", "priority") {
        result.priority = Some(if priority.bytes().all(|b| b.is_ascii_digit()) {
            NumberOrString::Number(js_number(&priority))
        } else {
            NumberOrString::String(priority)
        });
    }

    if let Some(properties_el) = ext.iter().find(|e| e.name == "zeebe:properties") {
        if !properties_el.children.is_empty() {
            let mut properties = JsRecord::new();
            for child in &properties_el.children {
                if let Some(name) = child.attributes.get("name") {
                    let value = child.attributes.get("value").map_or("", String::as_str);
                    properties.insert(name.as_str(), value);
                }
            }
            result.properties = Some(properties);
        }
    }

    let decision_id = truthy_attr(ext, "zeebe:calledDecision", "decisionId");
    let script = truthy_attr(ext, "zeebe:script", "expression");
    let io_mapping = ext.iter().find(|e| e.name == "zeebe:ioMapping");
    if let Some(decision_id) = decision_id {
        result.decision_id = Some(decision_id);
        result.result_variable = truthy_attr(ext, "zeebe:calledDecision", "resultVariable");
    } else if let Some(script) = script {
        result.script = Some(script);
        result.result_variable = truthy_attr(ext, "zeebe:script", "resultVariable");
    } else if connector {
        result.result_variable = header_result.map(str::to_owned);
    } else if let Some(io) = io_mapping {
        // For job workers: the primary output variable from ioMapping.
        let outputs: Vec<_> = io
            .children
            .iter()
            .filter(|c| c.name == "zeebe:output")
            .collect();
        if outputs.len() == 1 {
            result.result_variable = outputs[0]
                .attributes
                .get("target")
                .filter(|v| !v.is_empty())
                .cloned();
        }
    }

    let io_children: &[XmlElement] = io_mapping.map_or(&[], |io| &io.children);
    let mut inputs = JsRecord::new();
    for input in io_children {
        if let (true, Some(source), Some(target)) = (
            input.name == "zeebe:input",
            input.attributes.get("source"),
            input.attributes.get("target"),
        ) {
            inputs.insert(target.as_str(), source.as_str());
        }
    }
    if !inputs.is_empty() {
        result.inputs = Some(inputs);
    }

    // `source: "= response"` is the job worker's result, which expand writes back from
    // `resultVariable`.
    let mut outputs = JsRecord::new();
    for output in io_children {
        let (true, Some(source), Some(target)) = (
            output.name == "zeebe:output",
            output.attributes.get("source"),
            output.attributes.get("target"),
        ) else {
            continue;
        };
        if result.job_type.is_some() && source == "= response" {
            continue;
        }
        outputs.insert(target.as_str(), source.as_str());
    }
    if !outputs.is_empty() {
        result.outputs = Some(outputs);
    }

    if let Some(template) = base
        .unknown_attributes
        .get("zeebe:modelerTemplate")
        .filter(|v| !v.is_empty())
    {
        let version = parse_int(
            base.unknown_attributes
                .get("zeebe:modelerTemplateVersion")
                .map_or("", String::as_str),
        );
        result.modeler_template = Some(CompactModelerTemplate {
            id: template.clone(),
            version,
        });
    }

    if let Some(def) = el.event_definitions().and_then(<[_]>::first) {
        result.event_type = Some(def.type_name().to_owned());
        match def {
            BpmnEventDefinition::Timer(t) => {
                result.timer_duration = t.time_duration.clone().filter(|d| !d.is_empty());
            }
            BpmnEventDefinition::Conditional(c) => {
                result.condition = c.condition.clone();
            }
            BpmnEventDefinition::Link(l) => {
                result.link_name = l.name.clone();
            }
            _ => {}
        }
    }

    if let Some(loop_) = el.loop_characteristics() {
        let zeebe_loop = loop_
            .extension_elements
            .iter()
            .find(|x| x.name == "zeebe:loopCharacteristics");
        let attr = |name: &str| {
            zeebe_loop
                .and_then(|z| z.attributes.get(name))
                .filter(|v| !v.is_empty())
                .cloned()
        };
        if let Some(collection) = attr("inputCollection") {
            result.multi_instance = Some(CompactMultiInstance {
                collection,
                element: attr("inputElement"),
                sequential: (loop_.is_sequential == Some(true)).then_some(true),
                output_collection: attr("outputCollection"),
                output_element: attr("outputElement"),
                completion_condition: loop_
                    .completion_condition
                    .as_ref()
                    .map(|c| c.text.clone())
                    .filter(|t| !t.is_empty()),
            });
        }
    }

    if let BpmnFlowElement::BoundaryEvent(b) = el {
        result.attached_to = Some(b.attached_to_ref.clone());
        if b.cancel_activity == Some(false) {
            result.interrupting = Some(false);
        }
    }

    match el {
        BpmnFlowElement::DataObjectReference(d) => {
            result.data_object_ref = d.data_object_ref.clone();
            result.is_collection = (d.is_collection == Some(true)).then_some(true);
        }
        BpmnFlowElement::DataStoreReference(d) => {
            result.data_store_ref = d.data_store_ref.clone();
        }
        BpmnFlowElement::DataObject(d) => {
            result.is_collection = (d.is_collection == Some(true)).then_some(true);
        }
        _ => {}
    }

    // Recurse into sub-process container children.
    if let Some(contents) = el.contents() {
        if !contents.flow_elements.is_empty() {
            result.children = Some(CompactChildren {
                elements: contents
                    .flow_elements
                    .iter()
                    .map(compactify_element)
                    .collect(),
                flows: compactify_flows(&contents.flow_elements, &contents.sequence_flows),
            });
        }
    }

    result
}

/// TS's `compactifyFlows`.
fn compactify_flows(
    elements: &[BpmnFlowElement],
    sequence_flows: &[BpmnSequenceFlow],
) -> Vec<CompactFlow> {
    let marked: IndexSet<&str> = elements
        .iter()
        .filter_map(BpmnFlowElement::default_flow)
        .collect();
    sequence_flows
        .iter()
        .map(|sf| CompactFlow {
            id: sf.id.clone(),
            from: sf.source_ref.clone(),
            to: sf.target_ref.clone(),
            name: sf.name.clone().filter(|n| !n.is_empty()),
            condition: sf.condition_expression.as_ref().map(|c| c.text.clone()),
            is_default: marked.contains(sf.id.as_str()).then_some(true),
        })
        .collect()
}

/// TS's `compactify`: every process, as `{ id, name, documentation, elements, flows }`
/// (no `notes`, no `executionPlatformVersion`).
pub fn compactify(defs: &BpmnDefinitions) -> CompactDiagram {
    CompactDiagram {
        id: defs.id.clone(),
        execution_platform_version: None,
        processes: defs
            .processes
            .iter()
            .map(|process| CompactProcess {
                id: process.id.clone(),
                name: process.name.clone(),
                documentation: process.documentation.clone(),
                elements: process
                    .contents
                    .flow_elements
                    .iter()
                    .map(compactify_element)
                    .collect(),
                flows: compactify_flows(
                    &process.contents.flow_elements,
                    &process.contents.sequence_flows,
                ),
                notes: None,
            })
            .collect(),
    }
}
