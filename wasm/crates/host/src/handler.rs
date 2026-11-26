//! A loaded worker as a `bpmnkit_worker::Handler`.

use std::sync::{Arc, RwLock};
use std::time::Duration;

use bpmnkit_worker::{ActivatedJob, Complete, Handler, JobError};
use serde_json::{Map, Value};
use tokio::sync::Semaphore;

use crate::engine::Loaded;
use crate::runner::run_job;
use crate::secrets::SecretSource;
use crate::{Job, Outcome};

/// Serves every job type of one worker; at most `limits.max_concurrent` jobs run at once,
/// across job types (the first version's limit: the permits are not resized on a swap).
#[derive(Clone)]
pub struct WasmHandler {
    // Each job takes the `Arc` current when it starts, so a swap never interrupts a running job.
    loaded: Arc<RwLock<Arc<Loaded>>>,
    secrets: Arc<dyn SecretSource>,
    permits: Arc<Semaphore>,
}

impl WasmHandler {
    pub fn new(loaded: Loaded, secrets: Arc<dyn SecretSource>) -> Self {
        let n = loaded.manifest.limits.max_concurrent as usize;
        Self {
            loaded: Arc::new(RwLock::new(Arc::new(loaded))),
            secrets,
            permits: Arc::new(Semaphore::new(n.max(1))),
        }
    }

    pub fn loaded(&self) -> Arc<Loaded> {
        Arc::clone(&self.loaded.read().unwrap_or_else(|e| e.into_inner()))
    }

    /// Serves later jobs with `next`; returns the version it replaced.
    pub fn swap(&self, next: Loaded) -> Arc<Loaded> {
        let mut g = self.loaded.write().unwrap_or_else(|e| e.into_inner());
        std::mem::replace(&mut *g, Arc::new(next))
    }
}

impl Handler for WasmHandler {
    async fn handle(&self, job: ActivatedJob) -> Result<Complete, JobError> {
        let _permit = self
            .permits
            .acquire()
            .await
            .map_err(|_| JobError::fail("worker host is shutting down"))?;
        let loaded = self.loaded();
        to_result(run_job(&loaded, to_wit(&job), self.secrets.as_ref()).await)
    }
}

pub fn to_wit(j: &ActivatedJob) -> Job {
    Job {
        key: j.job_key.clone(),
        job_type: j.job_type.clone(),
        process_instance_key: j.process_instance_key.clone(),
        element_id: j.element_id.clone(),
        retries: j.retries.max(0) as u32,
        variables: Value::Object(j.variables.clone()).to_string(),
        custom_headers: j
            .custom_headers
            .iter()
            .map(|(k, v)| {
                let v = match v {
                    Value::String(s) => s.clone(),
                    other => other.to_string(),
                };
                (k.clone(), v)
            })
            .collect(),
    }
}

pub fn to_result(o: Outcome) -> Result<Complete, JobError> {
    match o {
        Outcome::Complete(vars) => object(&vars).map(Complete::from).map_err(JobError::fail),
        Outcome::Fail(f) => {
            let mut e = JobError::fail(f.message);
            if let Some(r) = f.retries {
                e = e.retries(i32::try_from(r).unwrap_or(i32::MAX));
            }
            if let Some(ms) = f.retry_backoff_ms {
                e = e.retry_backoff(Duration::from_millis(ms));
            }
            Err(e)
        }
        Outcome::ThrowError(b) => {
            let variables = match b.variables.as_deref().map(object).transpose() {
                Ok(v) => v,
                Err(msg) => return Err(JobError::fail(msg)),
            };
            Err(JobError::Bpmn {
                code: b.code,
                message: Some(b.message),
                variables,
            })
        }
    }
}

fn object(json: &str) -> Result<Map<String, Value>, String> {
    match serde_json::from_str(json) {
        Ok(Value::Object(m)) => Ok(m),
        _ => Err("worker returned variables that are not a JSON object".into()),
    }
}
