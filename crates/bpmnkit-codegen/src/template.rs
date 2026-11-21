//! Template target (REST, zero code; plan §5): for every job type the rules sent to REST, an element
//! template for `io.camunda:http-json:1` (connector-gen shape) and a patch that binds the BPMN
//! elements to it (`zeebe:modelerTemplate`, `zeebe:taskDefinition type`, inputs and headers).
//! The patch is JSON data; applying it to the BPMN XML is `connector bind`'s job (plan P7).

use bpmnkit_jobspec::catalog::HTTP_JSON;
use bpmnkit_jobspec::{Decision, JobSpec, WorkerProject};
use serde_json::{json, Value};

use crate::{finish, EmitError, Emitter, GenFile};

const SCHEMA: &str =
    "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json";

#[derive(Debug, Clone, Default)]
pub struct TemplateEmitter {
    /// Bind every job type, not only those classified as REST.
    pub all: bool,
}

fn file_slug(job_type: &str) -> String {
    crate::java::slug(job_type)
}

fn input(id: &str, label: &str, name: &str, value: &str) -> Value {
    json!({"id": id, "label": label, "type": "Hidden", "value": value,
           "binding": {"type": "zeebe:input", "name": name}})
}

/// (method, url) from the bound operation, else the literal URL, else a placeholder the user edits.
fn endpoint(j: &JobSpec) -> (String, String) {
    if let Some(op) = j.bound_operations.first() {
        return (op.method.clone(), op.path.clone());
    }
    ("GET".into(), j.urls.first().cloned().unwrap_or_default())
}

fn template(j: &JobSpec, id: &str) -> Value {
    let (method, url) = endpoint(j);
    let mut props = vec![
        json!({"type": "Hidden", "value": HTTP_JSON,
               "binding": {"type": "zeebe:taskDefinition", "property": "type"}}),
        input("method", "Method", "method", &method),
        json!({"id": "url", "label": "URL", "type": "String", "value": url,
               "feel": "optional", "constraints": {"notEmpty": true},
               "binding": {"type": "zeebe:input", "name": "url"}}),
        json!({"id": "resultVariable", "label": "Result variable", "type": "String",
               "binding": {"type": "zeebe:taskHeader", "key": "resultVariable"}}),
    ];
    for m in &j.inputs {
        props.push(
            json!({"label": m.target, "type": "Hidden", "value": m.source,
                          "binding": {"type": "zeebe:input", "name": m.target}}),
        );
    }
    json!({
        "$schema": SCHEMA,
        "name": format!("REST: {}", j.job_type),
        "id": id,
        "version": 1,
        "description": format!("Calls the REST endpoint behind job type {}", j.job_type),
        "appliesTo": ["bpmn:Task"],
        "elementType": {"value": "bpmn:ServiceTask"},
        "properties": props,
    })
}

fn patch(j: &JobSpec, id: &str) -> Value {
    let elements: Vec<Value> = j
        .elements
        .iter()
        .map(|e| {
            json!({
                "processId": e.process_id,
                "elementId": e.element_id,
                "modelerTemplate": id,
                "modelerTemplateVersion": 1,
                "taskDefinitionType": HTTP_JSON,
                "inputs": j.inputs.iter().map(|m| json!({"target": m.target, "source": m.source})).collect::<Vec<_>>(),
                "outputs": j.outputs.iter().map(|m| json!({"target": m.target, "source": m.source})).collect::<Vec<_>>(),
                "headers": j.headers.iter().map(|h| json!({"key": h.key, "values": h.values})).collect::<Vec<_>>(),
            })
        })
        .collect();
    json!({"jobType": j.job_type, "template": id, "elements": elements})
}

impl Emitter for TemplateEmitter {
    fn target(&self) -> &'static str {
        "template"
    }

    fn emit(&self, project: &WorkerProject) -> Result<Vec<GenFile>, EmitError> {
        let selected: Vec<&JobSpec> = project
            .jobs
            .values()
            .filter(|j| {
                self.all
                    || matches!(
                        j.classified.as_ref().map(|c| &c.decision),
                        Some(Decision::Rest)
                    )
            })
            .collect();
        if selected.is_empty() {
            return Err(EmitError::NoJobs);
        }
        let mut files = Vec::new();
        // Slugs are lossy (`send-email`, `send_email`): suffix collisions in sorted job order.
        let slugs = crate::java::unique(selected.iter().map(|j| (file_slug(&j.job_type), "")));
        for (j, (slug, _)) in selected.into_iter().zip(slugs) {
            let id = format!("io.bpmnkit.rest.{slug}");
            files.push(GenFile::generated(
                format!("templates/{slug}.json"),
                crate::pretty_json(&template(j, &id)),
            ));
            files.push(GenFile::generated(
                format!("patches/{slug}.json"),
                crate::pretty_json(&patch(j, &id)),
            ));
        }
        finish(files)
    }
}
