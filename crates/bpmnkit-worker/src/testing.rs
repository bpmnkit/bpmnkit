//! Test doubles: build jobs, run a handler without a cluster, or drive a whole worker against
//! an in-memory client.
//!
//! ```
//! use bpmnkit_worker::testing::{run_handler, MockJob};
//! use bpmnkit_worker::{Command, Complete, JobError, ActivatedJob};
//!
//! async fn charge(job: ActivatedJob) -> Result<Complete, JobError> {
//!     let amount = job.variables["amount"].as_i64().unwrap_or(0);
//!     if amount <= 0 {
//!         return Err(JobError::bpmn("INVALID_AMOUNT", "amount must be positive"));
//!     }
//!     Ok(Complete::new().var("charged", amount))
//! }
//!
//! # tokio::runtime::Builder::new_current_thread().build().unwrap().block_on(async {
//! let cmd = run_handler(&charge, MockJob::new("charge").var("amount", 5).build()).await;
//! assert!(matches!(cmd, Command::Complete(_)));
//! # });
//! ```

use std::collections::VecDeque;
use std::sync::Mutex;
use std::time::Duration;

use serde_json::{Map, Value};

use crate::client::JobClient;
use crate::error::Error;
use crate::types::{
    ActivateJobsRequest, ActivatedJob, CompleteJobRequest, FailJobRequest, JobKind,
    ThrowErrorRequest, UpdateJobRequest,
};
use crate::worker::{to_command, Command, Handler};

/// Builds an [`ActivatedJob`] with plausible defaults (key `1`, 3 retries, `<default>` tenant).
#[derive(Clone, Debug)]
pub struct MockJob(ActivatedJob);

impl MockJob {
    pub fn new(job_type: impl Into<String>) -> Self {
        Self(ActivatedJob {
            job_key: "1".into(),
            job_type: job_type.into(),
            process_definition_id: "process".into(),
            process_definition_version: 1,
            process_definition_key: "2".into(),
            process_instance_key: "3".into(),
            element_id: "task".into(),
            element_instance_key: "4".into(),
            worker: "test".into(),
            retries: 3,
            tenant_id: "<default>".into(),
            ..ActivatedJob::default()
        })
    }

    pub fn key(mut self, key: impl Into<String>) -> Self {
        self.0.job_key = key.into();
        self
    }

    pub fn retries(mut self, n: i32) -> Self {
        self.0.retries = n;
        self
    }

    pub fn kind(mut self, kind: JobKind) -> Self {
        self.0.kind = kind;
        self
    }

    pub fn element_id(mut self, id: impl Into<String>) -> Self {
        self.0.element_id = id.into();
        self
    }

    pub fn var(mut self, name: impl Into<String>, value: impl Into<Value>) -> Self {
        self.0.variables.insert(name.into(), value.into());
        self
    }

    /// Replaces the variables; `value` must serialize to an object.
    pub fn variables(mut self, value: impl serde::Serialize) -> Self {
        self.0.variables = match serde_json::to_value(value) {
            Ok(Value::Object(m)) => m,
            _ => panic!("MockJob::variables needs something that serializes to a JSON object"),
        };
        self
    }

    pub fn header(mut self, name: impl Into<String>, value: impl Into<String>) -> Self {
        self.0
            .custom_headers
            .insert(name.into(), Value::String(value.into()));
        self
    }

    pub fn build(self) -> ActivatedJob {
        self.0
    }
}

/// Runs `handler` on `job` and returns the command the worker would send. A panic propagates.
pub async fn run_handler<H: Handler>(handler: &H, job: ActivatedJob) -> Command {
    let result = handler.handle(job.clone()).await;
    to_command(&job, result)
}

/// One call [`FakeClient`] received.
#[derive(Clone, Debug, PartialEq)]
pub enum Call {
    Activate(ActivateJobsRequest),
    Complete(String, CompleteJobRequest),
    Fail(String, FailJobRequest),
    ThrowError(String, ThrowErrorRequest),
    Update(String, UpdateJobRequest),
}

/// An in-memory [`JobClient`]: activations answer from a queue (an empty queue long-polls for
/// the request's `requestTimeout`, then returns no jobs); every call is recorded.
#[derive(Default)]
pub struct FakeClient {
    activations: Mutex<VecDeque<Result<Vec<ActivatedJob>, Error>>>,
    calls: Mutex<Vec<Call>>,
}

impl FakeClient {
    pub fn new() -> Self {
        Self::default()
    }

    /// Queues one activation answer.
    pub fn push_jobs(&self, jobs: Vec<ActivatedJob>) -> &Self {
        lock(&self.activations).push_back(Ok(jobs));
        self
    }

    /// Queues one failed activation.
    pub fn push_error(&self, e: Error) -> &Self {
        lock(&self.activations).push_back(Err(e));
        self
    }

    pub fn calls(&self) -> Vec<Call> {
        lock(&self.calls).clone()
    }

    /// The activation requests received so far.
    pub fn activations(&self) -> Vec<ActivateJobsRequest> {
        self.calls()
            .into_iter()
            .filter_map(|c| match c {
                Call::Activate(r) => Some(r),
                _ => None,
            })
            .collect()
    }

    /// Calls other than activations, in arrival order.
    pub fn commands(&self) -> Vec<Call> {
        self.calls()
            .into_iter()
            .filter(|c| !matches!(c, Call::Activate(_)))
            .collect()
    }

    fn record(&self, c: Call) {
        lock(&self.calls).push(c);
    }
}

fn lock<T>(m: &Mutex<T>) -> std::sync::MutexGuard<'_, T> {
    m.lock().unwrap_or_else(|e| e.into_inner())
}

impl JobClient for FakeClient {
    async fn activate(&self, req: &ActivateJobsRequest) -> Result<Vec<ActivatedJob>, Error> {
        self.record(Call::Activate(req.clone()));
        let next = lock(&self.activations).pop_front();
        match next {
            Some(r) => r,
            None => {
                tokio::time::sleep(Duration::from_millis(req.request_timeout.max(0) as u64)).await;
                Ok(Vec::new())
            }
        }
    }

    async fn complete(&self, key: &str, req: &CompleteJobRequest) -> Result<(), Error> {
        self.record(Call::Complete(key.into(), req.clone()));
        Ok(())
    }

    async fn fail(&self, key: &str, req: &FailJobRequest) -> Result<(), Error> {
        self.record(Call::Fail(key.into(), req.clone()));
        Ok(())
    }

    async fn throw_error(&self, key: &str, req: &ThrowErrorRequest) -> Result<(), Error> {
        self.record(Call::ThrowError(key.into(), req.clone()));
        Ok(())
    }

    async fn update(&self, key: &str, req: &UpdateJobRequest) -> Result<(), Error> {
        self.record(Call::Update(key.into(), req.clone()));
        Ok(())
    }
}

/// `Map` from `json!({...})` for terse assertions.
pub fn map(v: Value) -> Map<String, Value> {
    match v {
        Value::Object(m) => m,
        _ => panic!("map() needs a JSON object"),
    }
}
