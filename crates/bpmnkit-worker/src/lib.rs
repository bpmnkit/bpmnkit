#![doc = include_str!("../README.md")]

mod auth;
mod backoff;
mod client;
mod config;
mod error;
mod metrics;
mod runtime;
#[cfg(any(test, feature = "testing"))]
pub mod testing;
mod types;
mod worker;

pub use auth::Credentials;
#[cfg(feature = "oauth")]
pub use auth::OAuthConfig;
pub use backoff::{parse_iso8601_duration, Backoff, Rng, SplitMix64};
pub use client::{JobClient, RestClient};
pub use config::{defaults, BackoffConfig, ClientConfig, WorkerConfig};
pub use error::Error;
pub use metrics::{CounterMetrics, Counts, Metrics, NoopMetrics};
pub use runtime::Runtime;
pub use types::{
    ActivateElement, ActivateJobsRequest, ActivateJobsResponse, ActivatedJob, CompleteJobRequest,
    FailJobRequest, JobChangeset, JobKind, JobResult, ThrowErrorRequest, UpdateJobRequest,
};
pub use worker::{to_command, Command, Complete, Handler, JobError, ShutdownReport, Worker};
