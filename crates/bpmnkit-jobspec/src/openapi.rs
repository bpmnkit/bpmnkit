//! OpenAPI operations, read from connector-gen's API index JSON (`ApiService` in
//! `packages/connector-gen/src/api-index.ts`: `{id, name, baseUrl?, auth, operations[]}`), not
//! from raw OpenAPI. The rules need a few facts the TS index does not carry yet; they are
//! optional fields on each operation (absent = JSON in and out, no pagination) until the native
//! connector-gen (plan P7) emits them:
//! `auth`, `requestMediaTypes`, `responseMediaTypes`, `responseKeys`, `responseList`,
//! `linkHeader`, `x-bpmnkit-paginate`.

use std::collections::BTreeMap;

use serde::Deserialize;

use crate::ir::{BoundOperation, WorkerProject};

#[derive(Debug, Clone, PartialEq, Eq, Deserialize)]
pub struct ApiAuth {
    #[serde(rename = "type")]
    pub kind: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ApiOperation {
    pub method: String,
    pub path: String,
    #[serde(default)]
    pub id: Option<String>,
    /// Required headers besides authentication, `Name` or `Name: value`.
    #[serde(default)]
    pub headers: Vec<String>,
    /// The body is sent form-encoded.
    #[serde(default)]
    pub form: bool,
    #[serde(default)]
    pub auth: Option<ApiAuth>,
    #[serde(default)]
    pub request_media_types: Vec<String>,
    #[serde(default)]
    pub response_media_types: Vec<String>,
    #[serde(default)]
    pub response_keys: Vec<String>,
    #[serde(default)]
    pub response_list: bool,
    #[serde(default)]
    pub link_header: bool,
    #[serde(default, rename = "x-bpmnkit-paginate")]
    pub paginate: bool,
}

#[derive(Debug, Clone, PartialEq, Eq, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ApiService {
    pub id: String,
    pub auth: ApiAuth,
    #[serde(default)]
    pub operations: Vec<ApiOperation>,
}

/// Operations by reference: `<service>#<operationId>` and `<service>#<METHOD> <path>`.
#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct ApiIndex {
    ops: BTreeMap<String, BoundOperation>,
}

fn sorted(mut v: Vec<String>) -> Vec<String> {
    v.sort();
    v.dedup();
    v
}

impl ApiIndex {
    /// Adds one connector-gen JSON document: an `ApiService` or an array of them.
    pub fn add_json(&mut self, json: &str) -> Result<(), serde_json::Error> {
        let value: serde_json::Value = serde_json::from_str(json)?;
        let services: Vec<ApiService> = if value.is_array() {
            serde_json::from_value(value)?
        } else {
            vec![serde_json::from_value(value)?]
        };
        for service in services {
            self.add(&service);
        }
        Ok(())
    }

    pub fn add(&mut self, service: &ApiService) {
        for op in &service.operations {
            let method = op.method.to_ascii_uppercase();
            let mut request = op.request_media_types.clone();
            if op.form {
                request.push("application/x-www-form-urlencoded".into());
            }
            let required_headers = op
                .headers
                .iter()
                .map(|h| {
                    h.split(':')
                        .next()
                        .unwrap_or_default()
                        .trim()
                        .trim_end_matches('*')
                        .to_owned()
                })
                .filter(|h| !h.is_empty());
            let facts = BoundOperation {
                reference: String::new(),
                method: method.clone(),
                path: op.path.clone(),
                auth: op.auth.as_ref().unwrap_or(&service.auth).kind.clone(),
                request_media_types: sorted(request),
                response_media_types: sorted(op.response_media_types.clone()),
                response_keys: sorted(op.response_keys.clone()),
                response_list: op.response_list,
                link_header: op.link_header,
                paginate: op.paginate,
                required_headers: sorted(required_headers.collect()),
            };
            let mut keys = vec![format!("{}#{method} {}", service.id, op.path)];
            if let Some(id) = &op.id {
                keys.push(format!("{}#{id}", service.id));
            }
            for key in keys {
                self.ops.insert(key, facts.clone());
            }
        }
    }

    pub fn get(&self, reference: &str) -> Option<BoundOperation> {
        let (service, rest) = reference.split_once('#')?;
        // `get /pets` and `GET /pets` name the same operation.
        let key = match rest.split_once(' ') {
            Some((m, p)) => format!("{service}#{} {}", m.to_ascii_uppercase(), p.trim()),
            None => reference.to_owned(),
        };
        let mut op = self.ops.get(&key)?.clone();
        op.reference = reference.to_owned();
        Some(op)
    }

    pub fn is_empty(&self) -> bool {
        self.ops.is_empty()
    }
}

/// Fills `bound_operations` of every job from the index; unresolved references stay unbound.
pub fn bind(project: &mut WorkerProject, index: &ApiIndex) {
    for job in project.jobs.values_mut() {
        let mut bound: Vec<_> = job.operations.iter().filter_map(|r| index.get(r)).collect();
        bound.sort();
        job.bound_operations = bound;
    }
}
