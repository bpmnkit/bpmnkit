//! Request and response bodies of the `/v2/jobs` endpoints (Camunda 8.8 `rest-api.yaml`).
//!
//! Keys are strings: the 8.8 API serializes Java longs as strings (`LongKey`).

use serde::{Deserialize, Serialize};
use serde_json::{Map, Value};

/// `JobActivationRequest`.
#[derive(Clone, Debug, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ActivateJobsRequest {
    #[serde(rename = "type")]
    pub job_type: String,
    pub worker: String,
    /// Milliseconds a job stays locked to this worker.
    pub timeout: i64,
    pub max_jobs_to_activate: i32,
    #[serde(skip_serializing_if = "Vec::is_empty")]
    pub fetch_variable: Vec<String>,
    /// Long-poll duration in milliseconds; `< 0` disables long polling.
    pub request_timeout: i64,
    #[serde(skip_serializing_if = "Vec::is_empty")]
    pub tenant_ids: Vec<String>,
}

/// `JobKindEnum`; values added after 8.8 deserialize to `Other`.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, Deserialize, Serialize)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum JobKind {
    #[default]
    BpmnElement,
    ExecutionListener,
    TaskListener,
    AdHocSubProcess,
    #[serde(other)]
    Other,
}

/// `ActivatedJobResult`. Fields the 8.8 spec marks required but older or embedded engines (reebe)
/// leave out or send as `null` default instead of failing the whole batch.
#[derive(Clone, Debug, Default, PartialEq, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ActivatedJob {
    pub job_key: String,
    #[serde(rename = "type")]
    pub job_type: String,
    #[serde(default, deserialize_with = "null_as_default")]
    pub process_definition_id: String,
    #[serde(default, deserialize_with = "null_as_default")]
    pub process_definition_version: i32,
    #[serde(default, deserialize_with = "null_as_default")]
    pub process_definition_key: String,
    #[serde(default, deserialize_with = "null_as_default")]
    pub process_instance_key: String,
    #[serde(default, deserialize_with = "null_as_default")]
    pub element_id: String,
    #[serde(default, deserialize_with = "null_as_default")]
    pub element_instance_key: String,
    #[serde(default, deserialize_with = "null_as_default")]
    pub custom_headers: Map<String, Value>,
    #[serde(default, deserialize_with = "null_as_default")]
    pub worker: String,
    #[serde(default, deserialize_with = "null_as_default")]
    pub retries: i32,
    /// Epoch milliseconds after which the job may be activated by another worker.
    #[serde(default, deserialize_with = "null_as_default")]
    pub deadline: i64,
    #[serde(default, deserialize_with = "null_as_default")]
    pub variables: Map<String, Value>,
    #[serde(default, deserialize_with = "null_as_default")]
    pub tenant_id: String,
    #[serde(default, deserialize_with = "null_as_default")]
    pub kind: JobKind,
    #[serde(default, deserialize_with = "null_as_default")]
    pub listener_event_type: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub user_task: Option<Value>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub tags: Option<Vec<String>>,
}

impl ActivatedJob {
    /// The job variables as `T` (missing optional fields default per `T`'s serde rules).
    pub fn variables_as<T: serde::de::DeserializeOwned>(&self) -> Result<T, serde_json::Error> {
        serde_json::from_value(Value::Object(self.variables.clone()))
    }

    /// A custom header as text; non-string header values are not text.
    pub fn header(&self, name: &str) -> Option<&str> {
        self.custom_headers.get(name).and_then(Value::as_str)
    }
}

/// `JobActivationResult`.
#[derive(Clone, Debug, Default, Deserialize, Serialize)]
pub struct ActivateJobsResponse {
    pub jobs: Vec<ActivatedJob>,
}

/// `JobResult`: how a user-task listener or an ad-hoc sub-process job steers the engine.
#[derive(Clone, Debug, PartialEq, Serialize)]
#[serde(tag = "type", rename_all = "camelCase")]
pub enum JobResult {
    #[serde(rename_all = "camelCase")]
    UserTask {
        #[serde(skip_serializing_if = "Option::is_none")]
        denied: Option<bool>,
        #[serde(skip_serializing_if = "Option::is_none")]
        denied_reason: Option<String>,
        /// `JobResultCorrections` (assignee, dueDate, …) as given.
        #[serde(skip_serializing_if = "Option::is_none")]
        corrections: Option<Map<String, Value>>,
    },
    #[serde(rename_all = "camelCase")]
    AdHocSubProcess {
        /// `JobResultActivateElement`s: `{ elementId, variables? }`.
        #[serde(skip_serializing_if = "Vec::is_empty")]
        activate_elements: Vec<ActivateElement>,
        is_completion_condition_fulfilled: bool,
        is_cancel_remaining_instances: bool,
    },
}

/// `JobResultActivateElement`.
#[derive(Clone, Debug, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ActivateElement {
    pub element_id: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub variables: Option<Map<String, Value>>,
}

/// `JobCompletionRequest`.
#[derive(Clone, Debug, Default, PartialEq, Serialize)]
pub struct CompleteJobRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub variables: Option<Map<String, Value>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub result: Option<JobResult>,
}

/// `JobFailRequest`.
#[derive(Clone, Debug, Default, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FailJobRequest {
    pub retries: i32,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error_message: Option<String>,
    /// Milliseconds before the job can be activated again.
    pub retry_back_off: i64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub variables: Option<Map<String, Value>>,
}

/// `JobErrorRequest`: throws a BPMN error at the job's element.
#[derive(Clone, Debug, Default, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ThrowErrorRequest {
    pub error_code: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error_message: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub variables: Option<Map<String, Value>>,
}

/// `JobChangeset`.
#[derive(Clone, Debug, Default, PartialEq, Serialize)]
pub struct JobChangeset {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub retries: Option<i32>,
    /// New timeout in milliseconds, counted from now.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub timeout: Option<i64>,
}

/// `JobUpdateRequest`.
#[derive(Clone, Debug, Default, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateJobRequest {
    pub changeset: JobChangeset,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub operation_reference: Option<i64>,
}

fn null_as_default<'de, D, T>(d: D) -> Result<T, D::Error>
where
    D: serde::Deserializer<'de>,
    T: Default + Deserialize<'de>,
{
    Option::<T>::deserialize(d).map(Option::unwrap_or_default)
}
