//! The polling loop: bounded concurrency, batch activation, backoff, graceful drain.

use std::collections::BTreeSet;
use std::fmt;
use std::future::Future;
use std::sync::{Arc, Mutex};
use std::time::Duration;

use serde::Serialize;
use serde_json::{Map, Value};
use tokio::sync::{Notify, OwnedSemaphorePermit, Semaphore};
use tokio::time::Instant;

use crate::backoff::{parse_iso8601_duration, Backoff, Rng, SplitMix64};
use crate::client::JobClient;
use crate::config::{millis, WorkerConfig};
use crate::metrics::{Metrics, NoopMetrics};
use crate::stream::{JobStreamSource, StreamRequest};
use crate::types::{
    ActivateJobsRequest, ActivatedJob, CompleteJobRequest, FailJobRequest, JobResult,
    ThrowErrorRequest,
};

/// What a handler returns on success: the variables to merge and an optional result for
/// user-task listeners and ad-hoc sub-processes.
#[derive(Clone, Debug, Default, PartialEq)]
pub struct Complete {
    pub variables: Option<Map<String, Value>>,
    pub result: Option<JobResult>,
}

impl Complete {
    /// Completes with no variables.
    pub fn new() -> Self {
        Self::default()
    }

    /// Completes with `output` serialized as the variables; it must serialize to an object.
    pub fn output<T: Serialize>(output: &T) -> Result<Self, JobError> {
        match serde_json::to_value(output) {
            Ok(Value::Object(m)) => Ok(Self {
                variables: Some(m),
                result: None,
            }),
            Ok(Value::Null) => Ok(Self::default()),
            Ok(other) => Err(JobError::fail(format!(
                "job output must be an object, got {}",
                kind_of(&other)
            ))),
            Err(e) => Err(JobError::fail(format!(
                "job output does not serialize: {e}"
            ))),
        }
    }

    /// Adds one variable.
    pub fn var(mut self, name: impl Into<String>, value: impl Into<Value>) -> Self {
        self.variables
            .get_or_insert_with(Map::new)
            .insert(name.into(), value.into());
        self
    }

    pub fn result(mut self, result: JobResult) -> Self {
        self.result = Some(result);
        self
    }
}

impl From<Map<String, Value>> for Complete {
    fn from(variables: Map<String, Value>) -> Self {
        Self {
            variables: Some(variables),
            result: None,
        }
    }
}

/// Why a handler did not complete its job.
#[derive(Clone, Debug, PartialEq)]
pub enum JobError {
    /// Throw a BPMN error the model can catch (`errorCode` matches an error boundary event).
    Bpmn {
        code: String,
        message: Option<String>,
        variables: Option<Map<String, Value>>,
    },
    /// Fail the job. `retries` defaults to the job's retries − 1; `retry_backoff` to the
    /// `retryBackoff` custom header (ISO-8601), else none.
    Fail {
        message: String,
        retries: Option<i32>,
        retry_backoff: Option<Duration>,
        variables: Option<Map<String, Value>>,
    },
}

impl JobError {
    pub fn bpmn(code: impl Into<String>, message: impl Into<String>) -> Self {
        JobError::Bpmn {
            code: code.into(),
            message: Some(message.into()),
            variables: None,
        }
    }

    pub fn fail(message: impl Into<String>) -> Self {
        JobError::Fail {
            message: message.into(),
            retries: None,
            retry_backoff: None,
            variables: None,
        }
    }

    /// Sets the retries left (only for [`JobError::Fail`]).
    pub fn retries(mut self, n: i32) -> Self {
        if let JobError::Fail { retries, .. } = &mut self {
            *retries = Some(n);
        }
        self
    }

    /// Sets the backoff before the next attempt (only for [`JobError::Fail`]).
    pub fn retry_backoff(mut self, d: Duration) -> Self {
        if let JobError::Fail { retry_backoff, .. } = &mut self {
            *retry_backoff = Some(d);
        }
        self
    }

    pub fn variables(mut self, vars: Map<String, Value>) -> Self {
        match &mut self {
            JobError::Bpmn { variables, .. } | JobError::Fail { variables, .. } => {
                *variables = Some(vars)
            }
        }
        self
    }
}

impl fmt::Display for JobError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            JobError::Bpmn { code, message, .. } => match message {
                Some(m) => write!(f, "BPMN error {code}: {m}"),
                None => write!(f, "BPMN error {code}"),
            },
            JobError::Fail { message, .. } => f.write_str(message),
        }
    }
}

// Lets handlers use `?` on any error; it becomes a failure with the error's message. JobError
// itself deliberately does not implement std::error::Error, or this impl would overlap.
impl<E: std::error::Error> From<E> for JobError {
    fn from(e: E) -> Self {
        JobError::fail(e.to_string())
    }
}

/// Handles one job. Implemented for `Fn(ActivatedJob) -> impl Future<Output = Result<Complete, JobError>>`.
pub trait Handler: Send + Sync + 'static {
    fn handle(&self, job: ActivatedJob) -> impl Future<Output = Result<Complete, JobError>> + Send;
}

impl<F, Fut> Handler for F
where
    F: Fn(ActivatedJob) -> Fut + Send + Sync + 'static,
    Fut: Future<Output = Result<Complete, JobError>> + Send,
{
    fn handle(&self, job: ActivatedJob) -> impl Future<Output = Result<Complete, JobError>> + Send {
        self(job)
    }
}

/// The request a handler's result turns into.
#[derive(Clone, Debug, PartialEq)]
pub enum Command {
    Complete(CompleteJobRequest),
    Fail(FailJobRequest),
    ThrowError(ThrowErrorRequest),
}

/// Maps a handler result to the command sent for `job` (pure; also used by `testing`).
pub fn to_command(job: &ActivatedJob, result: Result<Complete, JobError>) -> Command {
    match result {
        Ok(c) => Command::Complete(CompleteJobRequest {
            variables: c.variables,
            result: c.result,
        }),
        Err(JobError::Bpmn {
            code,
            message,
            variables,
        }) => Command::ThrowError(ThrowErrorRequest {
            error_code: code,
            error_message: message,
            variables,
        }),
        Err(JobError::Fail {
            message,
            retries,
            retry_backoff,
            variables,
        }) => {
            let backoff = retry_backoff
                .or_else(|| job.header("retryBackoff").and_then(parse_iso8601_duration))
                .unwrap_or_default();
            Command::Fail(FailJobRequest {
                retries: retries.unwrap_or(job.retries - 1).max(0),
                error_message: Some(message),
                retry_back_off: millis(backoff),
                variables,
            })
        }
    }
}

/// What shutdown left behind.
#[derive(Clone, Debug, Default, PartialEq, Eq)]
pub struct ShutdownReport {
    pub job_type: String,
    /// Jobs whose handlers had not finished by the drain deadline; the engine re-activates them
    /// once their job timeout passes.
    pub abandoned: Vec<String>,
}

/// One job type's polling loop.
pub struct Worker<C: JobClient, H: Handler> {
    client: Arc<C>,
    handler: Arc<H>,
    config: WorkerConfig,
    tenant_ids: Vec<String>,
    metrics: Arc<dyn Metrics>,
    rng: Box<dyn Rng>,
    stream: Option<Arc<dyn JobStreamSource>>,
}

impl<C: JobClient, H: Handler> Worker<C, H> {
    pub fn new(client: Arc<C>, config: WorkerConfig, handler: H) -> Self {
        Self {
            client,
            handler: Arc::new(handler),
            tenant_ids: config.tenant_ids.clone(),
            config,
            metrics: Arc::new(NoopMetrics),
            rng: Box::new(SplitMix64::from_entropy()),
            stream: None,
        }
    }

    pub fn metrics(mut self, metrics: Arc<dyn Metrics>) -> Self {
        self.metrics = metrics;
        self
    }

    /// The jitter source (seed it in tests).
    pub fn rng(mut self, rng: Box<dyn Rng>) -> Self {
        self.rng = rng;
        self
    }

    /// Where pushed jobs come from; used when `config.stream_enabled` is set. Polling keeps
    /// running beside it, so jobs still arrive while the stream is down or reconnecting.
    pub fn stream(mut self, source: Arc<dyn JobStreamSource>) -> Self {
        self.stream = Some(source);
        self
    }

    /// Tenant ids used when the config names none.
    pub fn default_tenant_ids(mut self, ids: &[String]) -> Self {
        if self.config.tenant_ids.is_empty() {
            self.tenant_ids = ids.to_vec();
        }
        self
    }

    /// Polls until `shutdown` resolves, then stops polling and waits up to the drain timeout for
    /// running handlers.
    pub async fn run(self, shutdown: impl Future<Output = ()> + Send) -> ShutdownReport {
        let Worker {
            client,
            handler,
            config,
            tenant_ids,
            metrics,
            rng,
            stream,
        } = self;
        let max = config.max_jobs_active.max(1);
        let permits = Arc::new(Semaphore::new(max));
        let finished = Arc::new(Notify::new());
        let in_flight = Arc::new(Mutex::new(BTreeSet::<String>::new()));
        let mut backoff = Backoff::new(config.backoff, rng);
        let mut interval = config.poll_interval;
        let mut wait: Option<Duration> = None;
        tokio::pin!(shutdown);

        // Dropped (aborted) right after the loop, so pushing stops before the drain starts.
        let stream_task = match stream.filter(|_| config.stream_enabled) {
            Some(source) => {
                let req = StreamRequest {
                    job_type: config.job_type.clone(),
                    worker: config.worker_name.clone(),
                    timeout: millis(config.timeout),
                    fetch_variable: config.fetch_variables.clone(),
                    tenant_ids: tenant_ids.clone(),
                };
                let ctx = StreamCtx {
                    client: Arc::clone(&client),
                    handler: Arc::clone(&handler),
                    metrics: Arc::clone(&metrics),
                    in_flight: Arc::clone(&in_flight),
                    finished: Arc::clone(&finished),
                    permits: Arc::clone(&permits),
                    max,
                };
                let b = Backoff::new(config.backoff, Box::new(SplitMix64::from_entropy()));
                Some(AbortOnDrop(tokio::spawn(stream_loop(
                    source,
                    req,
                    config.backoff.min,
                    b,
                    ctx,
                ))))
            }
            None => None,
        };

        loop {
            if let Some(d) = wait.take() {
                tokio::select! {
                    _ = &mut shutdown => break,
                    _ = tokio::time::sleep(d) => {}
                }
            }
            let free = permits.available_permits();
            if max - free > config.activation_threshold {
                tokio::select! {
                    _ = &mut shutdown => break,
                    _ = finished.notified() => {}
                }
                continue;
            }
            let req = ActivateJobsRequest {
                job_type: config.job_type.clone(),
                worker: config.worker_name.clone(),
                timeout: millis(config.timeout),
                max_jobs_to_activate: i32::try_from(free).unwrap_or(i32::MAX),
                fetch_variable: config.fetch_variables.clone(),
                request_timeout: millis(config.request_timeout),
                tenant_ids: tenant_ids.clone(),
            };
            let result = tokio::select! {
                _ = &mut shutdown => break,
                r = client.activate(&req) => r,
            };
            match result {
                Ok(jobs) => {
                    interval = config.poll_interval;
                    if jobs.is_empty() {
                        wait = Some(config.poll_interval);
                        continue;
                    }
                    metrics.activated(&config.job_type, jobs.len());
                    for job in jobs {
                        // The stream may have taken slots since `free` was read, and the server
                        // has already locked these jobs: wait for a slot rather than drop one.
                        // `acquire_owned` only fails on a closed semaphore, which never happens.
                        let Ok(permit) = permits.clone().acquire_owned().await else {
                            break;
                        };
                        spawn_job(
                            Arc::clone(&client),
                            Arc::clone(&handler),
                            Arc::clone(&metrics),
                            Arc::clone(&in_flight),
                            Arc::clone(&finished),
                            permit,
                            max,
                            job,
                        );
                    }
                }
                Err(e) => {
                    interval = backoff.next_delay(interval);
                    tracing::warn!(job_type = %config.job_type, error = %e, retry_in_ms = interval.as_millis() as u64, "job activation failed");
                    wait = Some(interval);
                }
            }
        }

        drop(stream_task);
        let all = u32::try_from(max).unwrap_or(u32::MAX);
        let drained = tokio::time::timeout(config.drain_timeout, permits.acquire_many(all)).await;
        let abandoned: Vec<String> = if drained.is_ok() {
            Vec::new()
        } else {
            lock(&in_flight).iter().cloned().collect()
        };
        if !abandoned.is_empty() {
            tracing::warn!(job_type = %config.job_type, jobs = ?abandoned, "drain deadline passed; these jobs will time out and be retried");
        }
        ShutdownReport {
            job_type: config.job_type,
            abandoned,
        }
    }
}

struct AbortOnDrop(tokio::task::JoinHandle<()>);
impl Drop for AbortOnDrop {
    fn drop(&mut self) {
        self.0.abort();
    }
}

struct StreamCtx<C: JobClient, H: Handler> {
    client: Arc<C>,
    handler: Arc<H>,
    metrics: Arc<dyn Metrics>,
    in_flight: Arc<Mutex<BTreeSet<String>>>,
    finished: Arc<Notify>,
    permits: Arc<Semaphore>,
    max: usize,
}

/// Keeps a stream open: each pushed job takes a slot (waiting for one if all are busy) and is
/// handled like a polled job. After a failure or a server-side close it reconnects with backoff.
async fn stream_loop<C: JobClient, H: Handler>(
    source: Arc<dyn JobStreamSource>,
    req: StreamRequest,
    first_delay: Duration,
    mut backoff: Backoff,
    ctx: StreamCtx<C, H>,
) {
    let mut delay = first_delay;
    loop {
        match source.open(req.clone()).await {
            Ok(mut stream) => {
                tracing::debug!(job_type = %req.job_type, "job stream open");
                loop {
                    match stream.next().await {
                        Ok(Some(job)) => {
                            // `acquire_owned` only fails on a closed semaphore, which never happens.
                            let Ok(permit) = ctx.permits.clone().acquire_owned().await else {
                                return;
                            };
                            delay = first_delay;
                            ctx.metrics.activated(&req.job_type, 1);
                            spawn_job(
                                Arc::clone(&ctx.client),
                                Arc::clone(&ctx.handler),
                                Arc::clone(&ctx.metrics),
                                Arc::clone(&ctx.in_flight),
                                Arc::clone(&ctx.finished),
                                permit,
                                ctx.max,
                                job,
                            );
                        }
                        Ok(None) => {
                            tracing::info!(job_type = %req.job_type, "job stream closed by the server; reconnecting");
                            break;
                        }
                        Err(e) => {
                            tracing::warn!(job_type = %req.job_type, error = %e, "job stream broke; reconnecting");
                            break;
                        }
                    }
                }
            }
            Err(e) => {
                tracing::warn!(job_type = %req.job_type, error = %e, "job stream did not open; polling continues");
            }
        }
        delay = backoff.next_delay(delay);
        tokio::time::sleep(delay).await;
    }
}

fn lock<T>(m: &Mutex<T>) -> std::sync::MutexGuard<'_, T> {
    m.lock().unwrap_or_else(|e| e.into_inner())
}

#[allow(clippy::too_many_arguments)]
fn spawn_job<C: JobClient, H: Handler>(
    client: Arc<C>,
    handler: Arc<H>,
    metrics: Arc<dyn Metrics>,
    in_flight: Arc<Mutex<BTreeSet<String>>>,
    finished: Arc<Notify>,
    permit: OwnedSemaphorePermit,
    max: usize,
    job: ActivatedJob,
) {
    lock(&in_flight).insert(job.job_key.clone());
    metrics.in_flight(&job.job_type, max - permit.semaphore().available_permits());
    tokio::spawn(async move {
        let start = Instant::now();
        let (h, j) = (Arc::clone(&handler), job.clone());
        // A second task so a panicking handler fails its job instead of killing this one.
        let result = match tokio::spawn(async move { h.handle(j).await }).await {
            Ok(r) => r,
            Err(e) => Err(JobError::fail(panic_message(e))),
        };
        let latency = start.elapsed();
        let key = job.job_key.as_str();
        let sent = match to_command(&job, result) {
            Command::Complete(r) => client
                .complete(key, &r)
                .await
                .map(|()| metrics.completed(&job.job_type, latency)),
            Command::Fail(r) => client
                .fail(key, &r)
                .await
                .map(|()| metrics.failed(&job.job_type, latency)),
            Command::ThrowError(r) => client
                .throw_error(key, &r)
                .await
                .map(|()| metrics.errored(&job.job_type, latency)),
        };
        if let Err(e) = sent {
            metrics.command_failed(&job.job_type);
            tracing::warn!(job_key = %key, error = %e, "could not report the job result; it will time out");
        }
        lock(&in_flight).remove(key);
        let sem = Arc::clone(permit.semaphore());
        drop(permit);
        metrics.in_flight(&job.job_type, max - sem.available_permits());
        finished.notify_one();
    });
}

fn panic_message(e: tokio::task::JoinError) -> String {
    if !e.is_panic() {
        return "handler was cancelled".into();
    }
    let p = e.into_panic();
    let msg = p
        .downcast_ref::<&str>()
        .map(|s| (*s).to_owned())
        .or_else(|| p.downcast_ref::<String>().cloned())
        .unwrap_or_else(|| "unknown panic payload".into());
    format!("handler panicked: {msg}")
}

fn kind_of(v: &Value) -> &'static str {
    match v {
        Value::Null => "null",
        Value::Bool(_) => "a boolean",
        Value::Number(_) => "a number",
        Value::String(_) => "a string",
        Value::Array(_) => "an array",
        Value::Object(_) => "an object",
    }
}

#[cfg(test)]
#[path = "worker_tests.rs"]
mod tests;
