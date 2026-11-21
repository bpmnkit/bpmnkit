//! BPMN → jobs. The job list (types, elements, headers, catchable errors) follows
//! `extractProcessContract` in `@bpmnkit/core` (`process-types.ts`), the source of `casen gen
//! types`; `conformance/jobspec/jobs.json` pins it. On top of that the IR keeps what the
//! classifier and the emitters need: io mappings, retries, templates, properties, URLs.

use std::collections::{BTreeMap, BTreeSet};

use bpmnkit_bpmn::zeebe::{read_zeebe_io_mapping, read_zeebe_task_headers, read_zeebe_task_type};
use bpmnkit_bpmn::{
    BpmnDefinitions, BpmnEventDefinition, BpmnFlowElement, BpmnProcessContents, XmlElement,
};

use crate::ir::{ElementRef, Header, JobKind, JobSpec, Mapping, WorkerProject};

/// `zeebe:property` names that bind OpenAPI operations to a task.
pub const OPERATION_PROPERTY: &str = "bpmnkit:operation";
pub const OPERATIONS_PROPERTY: &str = "bpmnkit:operations";

#[derive(Default)]
struct Acc {
    elements: Vec<ElementRef>,
    kinds: BTreeSet<JobKind>,
    inputs: BTreeSet<Mapping>,
    outputs: BTreeSet<Mapping>,
    headers: Vec<BTreeMap<String, String>>,
    errors: BTreeSet<String>,
    catch_all: bool,
    retries: BTreeSet<String>,
    templates: BTreeSet<String>,
    properties: BTreeMap<String, BTreeSet<String>>,
    operations: BTreeSet<String>,
    urls: BTreeSet<String>,
}

/// Job types written as FEEL (`=…`) are resolved at runtime, so they are reported, not typed.
#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct Extracted {
    pub project: WorkerProject,
    /// `processId#elementId` of elements whose job type is a FEEL expression.
    pub dynamic: Vec<String>,
}

fn is_dynamic(value: &str) -> bool {
    value.trim_start().starts_with('=')
}

fn is_container(el: &BpmnFlowElement) -> bool {
    matches!(
        el,
        BpmnFlowElement::SubProcess(_)
            | BpmnFlowElement::AdHocSubProcess(_)
            | BpmnFlowElement::EventSubProcess(_)
            | BpmnFlowElement::Transaction(_)
    )
}

fn is_event_sub_process(el: &BpmnFlowElement) -> bool {
    match el {
        BpmnFlowElement::EventSubProcess(_) => true,
        BpmnFlowElement::SubProcess(s) => s.triggered_by_event == Some(true),
        _ => false,
    }
}

struct Codes<'a> {
    by_id: BTreeMap<&'a str, Option<&'a str>>,
}

impl Codes<'_> {
    /// Adds the codes of error definitions; a definition without a resolvable code catches all.
    fn collect(&self, defs: &[BpmnEventDefinition], acc: &mut Acc) {
        for def in defs {
            let BpmnEventDefinition::Error(e) = def else {
                continue;
            };
            let code = e
                .error_ref
                .as_deref()
                .and_then(|r| self.by_id.get(r).copied().flatten());
            match code {
                Some(c) if !c.trim().is_empty() => {
                    acc.errors.insert(c.to_owned());
                }
                _ => acc.catch_all = true,
            }
        }
    }

    fn boundary(&self, element_id: &str, container: &BpmnProcessContents, acc: &mut Acc) {
        for el in &container.flow_elements {
            if let BpmnFlowElement::BoundaryEvent(b) = el {
                if b.attached_to_ref == element_id {
                    self.collect(&b.event_definitions, acc);
                }
            }
        }
    }

    fn event_sub_processes(&self, container: &BpmnProcessContents, acc: &mut Acc) {
        for el in &container.flow_elements {
            if !is_event_sub_process(el) {
                continue;
            }
            for start in el.contents().map_or(&[][..], |c| &c.flow_elements[..]) {
                if let BpmnFlowElement::StartEvent(s) = start {
                    self.collect(&s.event_definitions, acc);
                }
            }
        }
    }
}

fn attr<'a>(ext: &'a [XmlElement], name: &str, key: &str) -> Option<&'a str> {
    ext.iter()
        .find(|e| e.name == name)
        .and_then(|e| e.attr(key))
}

fn properties(ext: &[XmlElement]) -> Vec<(String, String)> {
    ext.iter()
        .filter(|e| e.name == "zeebe:properties")
        .flat_map(|e| e.children.iter())
        .filter(|c| c.name == "zeebe:property")
        .filter_map(|c| Some((c.attr("name")?.to_owned(), c.attr("value")?.to_owned())))
        .collect()
}

/// Comma- or newline-separated (a reference itself may contain a space: `svc#GET /pets`).
fn split_list(value: &str) -> impl Iterator<Item = &str> {
    value
        .split([',', '\n'])
        .map(str::trim)
        .filter(|s| !s.is_empty())
}

/// Reads every executable process of `definitions` into one project (jobs merged by type).
pub fn extract(name: &str, definitions: &[BpmnDefinitions]) -> Extracted {
    let mut jobs: BTreeMap<String, Acc> = BTreeMap::new();
    let mut dynamic = BTreeSet::new();
    for defs in definitions {
        let codes = Codes {
            by_id: defs
                .errors
                .iter()
                .map(|e| (e.id.as_str(), e.error_code.as_deref()))
                .collect(),
        };
        for process in &defs.processes {
            if process.is_executable != Some(true) {
                continue;
            }
            let mut ctx = Visit {
                process_id: &process.id,
                root: &process.contents,
                codes: &codes,
                jobs: &mut jobs,
                dynamic: &mut dynamic,
            };
            ctx.visit(&process.contents, &mut Vec::new());
        }
    }
    let jobs = jobs
        .into_iter()
        .map(|(job_type, acc)| {
            let spec = finish(&job_type, acc);
            (job_type, spec)
        })
        .collect();
    Extracted {
        project: WorkerProject {
            name: name.to_owned(),
            jobs,
        },
        dynamic: dynamic.into_iter().collect(),
    }
}

struct Visit<'a, 'b> {
    process_id: &'a str,
    root: &'a BpmnProcessContents,
    codes: &'b Codes<'a>,
    jobs: &'b mut BTreeMap<String, Acc>,
    dynamic: &'b mut BTreeSet<String>,
}

impl<'a> Visit<'a, '_> {
    /// `ancestors`: enclosing containers, outermost first.
    fn visit(
        &mut self,
        container: &'a BpmnProcessContents,
        ancestors: &mut Vec<&'a BpmnFlowElement>,
    ) {
        for el in &container.flow_elements {
            let base = el.base();
            let job_type = match el {
                BpmnFlowElement::UserTask(_) => None,
                _ => read_zeebe_task_type(&base.extension_elements),
            };
            if let Some(t) = job_type.filter(|t| !t.trim().is_empty()) {
                if is_dynamic(&t) {
                    self.dynamic
                        .insert(format!("{}#{}", self.process_id, base.id));
                } else {
                    self.add_job(t, el, container, ancestors);
                }
            }
            if is_container(el) {
                if let Some(c) = el.contents() {
                    ancestors.push(el);
                    self.visit(c, ancestors);
                    ancestors.pop();
                }
            }
        }
    }

    fn add_job(
        &mut self,
        job_type: String,
        el: &'a BpmnFlowElement,
        container: &'a BpmnProcessContents,
        ancestors: &[&'a BpmnFlowElement],
    ) {
        let base = el.base();
        let ext = &base.extension_elements;
        let acc = self.jobs.entry(job_type).or_default();
        acc.elements.push(ElementRef {
            process_id: self.process_id.to_owned(),
            element_id: base.id.clone(),
            element_type: el.type_name().to_owned(),
            name: base.name.clone().filter(|n| !n.trim().is_empty()),
        });
        acc.kinds.insert(match el {
            BpmnFlowElement::AdHocSubProcess(_) => JobKind::AdHocSubProcess,
            _ => JobKind::Task,
        });

        if let Some(io) = read_zeebe_io_mapping(ext) {
            for m in io.inputs.iter().filter(|m| !m.target.trim().is_empty()) {
                if m.target.trim() == "url" && !m.source.trim().is_empty() {
                    acc.urls.insert(m.source.trim().to_owned());
                }
                acc.inputs.insert(Mapping {
                    target: m.target.trim().to_owned(),
                    source: m.source.clone(),
                });
            }
            for m in io.outputs.iter().filter(|m| !m.target.trim().is_empty()) {
                acc.outputs.insert(Mapping {
                    target: m.target.trim().to_owned(),
                    source: m.source.clone(),
                });
            }
        }

        let mut headers = BTreeMap::new();
        for h in read_zeebe_task_headers(ext).map_or_else(Vec::new, |h| h.headers) {
            if !h.key.is_empty() {
                headers.insert(h.key, h.value);
            }
        }
        acc.headers.push(headers);

        if let Some(r) = attr(ext, "zeebe:taskDefinition", "retries") {
            acc.retries.insert(r.to_owned());
        }
        if let Some(t) = base.unknown_attributes.get("zeebe:modelerTemplate") {
            acc.templates.insert(t.clone());
        }
        for (name, value) in properties(ext) {
            if name == OPERATION_PROPERTY || name == OPERATIONS_PROPERTY {
                acc.operations.extend(split_list(&value).map(str::to_owned));
            }
            acc.properties.entry(name).or_default().insert(value);
        }

        // Error catches: the element's own boundary events, then each enclosing sub-process's
        // (in the container that holds it), then error event sub-processes of the process and
        // of every enclosing container.
        self.codes.boundary(&base.id, container, acc);
        let mut holder = self.root;
        for ancestor in ancestors {
            self.codes.boundary(&ancestor.base().id, holder, acc);
            if let Some(c) = ancestor.contents() {
                holder = c;
            }
        }
        self.codes.event_sub_processes(self.root, acc);
        for ancestor in ancestors {
            if let Some(c) = ancestor.contents() {
                self.codes.event_sub_processes(c, acc);
            }
        }
    }
}

fn finish(job_type: &str, acc: Acc) -> JobSpec {
    let mut elements = acc.elements;
    elements.sort_by(|a, b| (&a.process_id, &a.element_id).cmp(&(&b.process_id, &b.element_id)));
    elements.dedup_by(|a, b| a.process_id == b.process_id && a.element_id == b.element_id);

    let keys: BTreeSet<&String> = acc.headers.iter().flat_map(|m| m.keys()).collect();
    let headers = keys
        .into_iter()
        .map(|key| Header {
            key: key.clone(),
            values: acc
                .headers
                .iter()
                .filter_map(|m| m.get(key).cloned())
                .collect::<BTreeSet<_>>()
                .into_iter()
                .collect(),
            required: acc.headers.iter().all(|m| m.contains_key(key)),
        })
        .collect();

    let kind = if acc.kinds.iter().all(|k| *k == JobKind::AdHocSubProcess) {
        JobKind::AdHocSubProcess
    } else {
        JobKind::Task
    };

    let mut spec = JobSpec::new(job_type);
    spec.kind = kind;
    spec.elements = elements;
    spec.inputs = acc.inputs.into_iter().collect();
    spec.outputs = acc.outputs.into_iter().collect();
    spec.headers = headers;
    spec.errors = acc.errors.into_iter().collect();
    spec.catch_all_errors = acc.catch_all;
    spec.retries = acc.retries.into_iter().collect();
    spec.modeler_templates = acc.templates.into_iter().collect();
    spec.properties = acc
        .properties
        .into_iter()
        .map(|(k, v)| (k, v.into_iter().collect()))
        .collect();
    spec.operations = acc.operations.into_iter().collect();
    spec.urls = acc.urls.into_iter().collect();
    spec
}
