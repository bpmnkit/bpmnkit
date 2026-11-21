//! Settings and their defaults. Defaults equal camunda-client-java 8.8 (decision D5); the
//! contract test `tests/java_defaults.rs` compares them with the pinned Java source.

use std::time::Duration;

use crate::auth::Credentials;
use crate::error::Error;

/// Defaults of camunda-client-java 8.8 `CamundaClientBuilderImpl` / `ExponentialBackoffBuilderImpl`.
pub mod defaults {
    use std::time::Duration;

    pub const REST_ADDRESS: &str = "http://0.0.0.0:8080";
    pub const WORKER_NAME: &str = "default";
    pub const PREFER_REST_OVER_GRPC: bool = true;
    pub const STREAM_ENABLED: bool = false;
    pub const MAX_JOBS_ACTIVE: usize = 32;
    pub const JOB_TIMEOUT: Duration = Duration::from_secs(5 * 60);
    pub const POLL_INTERVAL: Duration = Duration::from_millis(100);
    pub const REQUEST_TIMEOUT: Duration = Duration::from_secs(10);
    /// Added to the long-poll duration for the HTTP deadline, so the server answers first.
    pub const REQUEST_TIMEOUT_OFFSET: Duration = Duration::from_secs(1);
    pub const BACKOFF_MIN: Duration = Duration::from_millis(50);
    pub const BACKOFF_MAX: Duration = Duration::from_secs(5);
    pub const BACKOFF_MULTIPLIER: f64 = 1.6;
    pub const BACKOFF_JITTER: f64 = 0.1;
    /// The tenant every job belongs to when multi-tenancy is off.
    pub const TENANT_ID: &str = "<default>";
    /// Not a Java setting: how long shutdown waits for running handlers.
    pub const DRAIN_TIMEOUT: Duration = Duration::from_secs(30);
}

/// Where the cluster is and how to authenticate.
#[derive(Clone, Debug)]
pub struct ClientConfig {
    /// Base URL of the Orchestration Cluster REST API, with or without the `/v2` suffix.
    pub rest_address: String,
    pub credentials: Credentials,
    /// Deadline of every non-activation request.
    pub request_timeout: Duration,
    pub request_timeout_offset: Duration,
    /// Default tenant ids for workers that set none.
    pub tenant_ids: Vec<String>,
}

impl Default for ClientConfig {
    fn default() -> Self {
        Self {
            rest_address: defaults::REST_ADDRESS.into(),
            credentials: Credentials::None,
            request_timeout: defaults::REQUEST_TIMEOUT,
            request_timeout_offset: defaults::REQUEST_TIMEOUT_OFFSET,
            tenant_ids: vec![defaults::TENANT_ID.into()],
        }
    }
}

impl ClientConfig {
    /// Reads `CAMUNDA_REST_ADDRESS`, `CAMUNDA_TENANT_ID` and the credential variables
    /// (see [`Credentials::from_lookup`]).
    pub fn from_env() -> Result<Self, Error> {
        Self::from_lookup(|k| std::env::var(k).ok().filter(|v| !v.is_empty()))
    }

    /// [`ClientConfig::from_env`] over any variable source, so tests need not touch the process env.
    pub fn from_lookup(get: impl Fn(&str) -> Option<String>) -> Result<Self, Error> {
        let mut c = Self::default();
        if let Some(a) = get("CAMUNDA_REST_ADDRESS") {
            c.rest_address = a;
        }
        if let Some(t) = get("CAMUNDA_TENANT_ID") {
            c.tenant_ids = vec![t];
        }
        c.credentials = Credentials::from_lookup(&get)?;
        Ok(c)
    }
}

/// Exponential backoff after a failed activation: `clamp(prev × multiplier, min, max) ± jitter`,
/// the camunda-client-java formula.
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct BackoffConfig {
    pub min: Duration,
    pub max: Duration,
    pub multiplier: f64,
    /// Fraction of the delay added or removed at random.
    pub jitter: f64,
}

impl Default for BackoffConfig {
    fn default() -> Self {
        Self {
            min: defaults::BACKOFF_MIN,
            max: defaults::BACKOFF_MAX,
            multiplier: defaults::BACKOFF_MULTIPLIER,
            jitter: defaults::BACKOFF_JITTER,
        }
    }
}

/// One job worker.
#[derive(Clone, Debug)]
pub struct WorkerConfig {
    pub job_type: String,
    pub worker_name: String,
    /// Handlers running at once; also the most jobs one activation asks for.
    pub max_jobs_active: usize,
    /// Poll again only when at most this many handlers run. Default: 30 % of `max_jobs_active`
    /// (rounded), so a busy worker asks for batches instead of one job per finished handler.
    pub activation_threshold: usize,
    pub timeout: Duration,
    /// Wait after an empty activation.
    pub poll_interval: Duration,
    /// Long-poll duration sent as `requestTimeout`.
    pub request_timeout: Duration,
    /// Empty: all variables visible at the job's scope.
    pub fetch_variables: Vec<String>,
    /// Empty: the client's tenant ids.
    pub tenant_ids: Vec<String>,
    pub backoff: BackoffConfig,
    /// How long shutdown waits for running handlers before giving up on them.
    pub drain_timeout: Duration,
}

impl WorkerConfig {
    pub fn new(job_type: impl Into<String>) -> Self {
        Self {
            job_type: job_type.into(),
            worker_name: defaults::WORKER_NAME.into(),
            max_jobs_active: defaults::MAX_JOBS_ACTIVE,
            activation_threshold: threshold_for(defaults::MAX_JOBS_ACTIVE),
            timeout: defaults::JOB_TIMEOUT,
            poll_interval: defaults::POLL_INTERVAL,
            request_timeout: defaults::REQUEST_TIMEOUT,
            fetch_variables: Vec::new(),
            tenant_ids: Vec::new(),
            backoff: BackoffConfig::default(),
            drain_timeout: defaults::DRAIN_TIMEOUT,
        }
    }

    /// Sets `max_jobs_active` and moves the threshold with it.
    pub fn max_jobs_active(mut self, n: usize) -> Self {
        self.max_jobs_active = n.max(1);
        self.activation_threshold = threshold_for(self.max_jobs_active);
        self
    }

    pub fn worker_name(mut self, name: impl Into<String>) -> Self {
        self.worker_name = name.into();
        self
    }

    pub fn timeout(mut self, d: Duration) -> Self {
        self.timeout = d;
        self
    }

    pub fn poll_interval(mut self, d: Duration) -> Self {
        self.poll_interval = d;
        self
    }

    pub fn request_timeout(mut self, d: Duration) -> Self {
        self.request_timeout = d;
        self
    }

    pub fn fetch_variables<I, S>(mut self, names: I) -> Self
    where
        I: IntoIterator<Item = S>,
        S: Into<String>,
    {
        self.fetch_variables = names.into_iter().map(Into::into).collect();
        self
    }

    pub fn tenant_ids<I, S>(mut self, ids: I) -> Self
    where
        I: IntoIterator<Item = S>,
        S: Into<String>,
    {
        self.tenant_ids = ids.into_iter().map(Into::into).collect();
        self
    }

    pub fn backoff(mut self, b: BackoffConfig) -> Self {
        self.backoff = b;
        self
    }

    pub fn drain_timeout(mut self, d: Duration) -> Self {
        self.drain_timeout = d;
        self
    }
}

fn threshold_for(max: usize) -> usize {
    // Round half up, as Java's Math.round(max * 0.3f) did for the activation threshold.
    (max * 3 + 5) / 10
}

/// Milliseconds as the API's int64, saturating.
pub(crate) fn millis(d: Duration) -> i64 {
    i64::try_from(d.as_millis()).unwrap_or(i64::MAX)
}
