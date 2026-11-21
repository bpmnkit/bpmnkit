//! The worker IR (plan §4). Every collection is a `BTreeMap` or a sorted, de-duplicated `Vec`, so
//! the canonical JSON (and its hash) depends on the inputs only, never on their order.

use std::collections::BTreeMap;

use serde::{Deserialize, Serialize};

use crate::rules::Classified;

/// Everything generated for one worker project.
#[derive(Debug, Clone, Default, PartialEq, Eq, Serialize, Deserialize)]
pub struct WorkerProject {
    pub name: String,
    /// Keyed by job type.
    pub jobs: BTreeMap<String, JobSpec>,
}

/// How a job completes: a plain task, or an ad-hoc sub-process (AI agent job worker), whose
/// completion carries the elements to activate.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum JobKind {
    Task,
    AdHocSubProcess,
}

/// Where a job type is used.
#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ElementRef {
    pub process_id: String,
    pub element_id: String,
    /// The BPMN element's local name (`serviceTask`, `sendTask`, …).
    pub element_type: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
}

/// A `zeebe:input` / `zeebe:output` mapping.
#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize)]
pub struct Mapping {
    pub target: String,
    pub source: String,
}

/// A task header key with the literal values it takes across the elements sharing a job type.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Header {
    pub key: String,
    pub values: Vec<String>,
    /// False when some element sharing the job type lacks the key.
    pub required: bool,
}

/// The facts about a bound OpenAPI operation that the rules read (resolved from the
/// connector-gen API index, see [`crate::openapi`]).
#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BoundOperation {
    /// `<service>#<operationId>` or `<service>#<METHOD> <path>`, as written in the BPMN.
    pub reference: String,
    pub method: String,
    pub path: String,
    /// The auth type of the operation (or its service): `noAuth`, `apiKey`, `basic`, `bearer`,
    /// `oauth-client-credentials-flow`, or anything else (SigV4, HMAC, …).
    pub auth: String,
    pub request_media_types: Vec<String>,
    pub response_media_types: Vec<String>,
    /// Response body property paths (`next`, `links.next`, …).
    pub response_keys: Vec<String>,
    pub response_list: bool,
    pub link_header: bool,
    pub paginate: bool,
    /// Required header names besides authentication.
    pub required_headers: Vec<String>,
}

/// Everything a worker (or connector binding) for one job type can rely on.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct JobSpec {
    pub job_type: String,
    pub kind: JobKind,
    pub elements: Vec<ElementRef>,
    pub inputs: Vec<Mapping>,
    pub outputs: Vec<Mapping>,
    pub headers: Vec<Header>,
    /// Error codes caught by boundary events or error event sub-processes around the elements.
    pub errors: Vec<String>,
    /// A catch-all error event (no code) is in scope: any code is caught.
    pub catch_all_errors: bool,
    /// Distinct `zeebe:taskDefinition retries` values.
    pub retries: Vec<String>,
    /// Distinct `zeebe:modelerTemplate` ids on the elements.
    pub modeler_templates: Vec<String>,
    /// `zeebe:properties`, each name with its distinct values.
    pub properties: BTreeMap<String, Vec<String>>,
    /// Operation references from the `bpmnkit:operation` / `bpmnkit:operations` properties.
    pub operations: Vec<String>,
    /// The operations of `operations` the API index resolved.
    pub bound_operations: Vec<BoundOperation>,
    /// Literal values of the `url` input (a REST connector call already bound to a URL).
    pub urls: Vec<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub classified: Option<Classified>,
}

impl JobSpec {
    pub fn new(job_type: impl Into<String>) -> Self {
        Self {
            job_type: job_type.into(),
            kind: JobKind::Task,
            elements: Vec::new(),
            inputs: Vec::new(),
            outputs: Vec::new(),
            headers: Vec::new(),
            errors: Vec::new(),
            catch_all_errors: false,
            retries: Vec::new(),
            modeler_templates: Vec::new(),
            properties: BTreeMap::new(),
            operations: Vec::new(),
            bound_operations: Vec::new(),
            urls: Vec::new(),
            classified: None,
        }
    }

    /// The first (sorted) value of a `zeebe:property`.
    pub fn property(&self, name: &str) -> Option<&str> {
        self.properties
            .get(name)
            .and_then(|v| v.first())
            .map(String::as_str)
    }

    /// The element names, in element order.
    pub fn names(&self) -> impl Iterator<Item = &str> {
        self.elements.iter().filter_map(|e| e.name.as_deref())
    }
}

/// Canonical JSON (plan I4): object keys sorted, no insignificant whitespace, LF-free. The IR has
/// no floats, so number formatting cannot differ between platforms.
pub fn canonical_json<T: Serialize>(value: &T) -> String {
    let value = serde_json::to_value(value).expect("the IR serializes");
    let mut out = String::new();
    write_canonical(&value, &mut out);
    out
}

fn write_canonical(value: &serde_json::Value, out: &mut String) {
    use serde_json::Value;
    match value {
        Value::Object(map) => {
            // `serde_json` may preserve insertion order (feature unification), so sort here.
            let mut entries: Vec<_> = map.iter().collect();
            entries.sort_by(|a, b| a.0.cmp(b.0));
            out.push('{');
            for (i, (k, v)) in entries.into_iter().enumerate() {
                if i > 0 {
                    out.push(',');
                }
                out.push_str(&Value::String(k.clone()).to_string());
                out.push(':');
                write_canonical(v, out);
            }
            out.push('}');
        }
        Value::Array(items) => {
            out.push('[');
            for (i, v) in items.iter().enumerate() {
                if i > 0 {
                    out.push(',');
                }
                write_canonical(v, out);
            }
            out.push(']');
        }
        other => out.push_str(&other.to_string()),
    }
}

/// `sha256` of the canonical JSON, lower-case hex.
pub fn ir_hash(project: &WorkerProject) -> String {
    use sha2::{Digest, Sha256};
    let digest = Sha256::digest(canonical_json(project).as_bytes());
    digest.iter().map(|b| format!("{b:02x}")).collect()
}
