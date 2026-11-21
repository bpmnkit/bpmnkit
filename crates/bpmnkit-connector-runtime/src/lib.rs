//! Local runner for Camunda 8 REST connector jobs (`io.camunda:http-json:1`), on top of
//! [`bpmnkit_worker`] (plan `doc/plans/c8-workers-and-rust-cli.md` §7, P5).
//!
//! A job's variables (after the engine's input mappings) are the connector's properties:
//! `method`, `url`, `headers`, `queryParameters`, `body`, `authentication.*`,
//! `connectionTimeoutInSeconds`, `readTimeoutInSeconds`, `followRedirects`, `ignoreNullValues`.
//! Custom headers `resultVariable`, `resultExpression`, `errorExpression` and `retryBackoff`
//! steer the outcome.
//!
//! Steps: resolve `{{secrets.X}}` everywhere (value from the environment variable
//! `<CAMUNDA_CONNECTOR_SECRETPROVIDER_ENVIRONMENT_PREFIX>X`; never logged, redacted from every
//! message) → HTTP → `response = {status, headers, body}` → `errorExpression`
//! (`bpmnError(code, message[, variables])` throws, `jobError(message[, variables[, retries[,
//! retryBackoff]]])` fails, `ignoreError(variables)` completes) → `resultVariable` /
//! `resultExpression` → complete. A status ≥ 400 the error expression does not handle fails the
//! job (retries − 1, backoff from `retryBackoff`).
//!
//! ```no_run
//! use bpmnkit_connector_runtime::{HttpJsonConnector, Secrets, HTTP_JSON};
//! use bpmnkit_worker::{Runtime, WorkerConfig};
//!
//! # async fn demo() -> Result<(), bpmnkit_worker::Error> {
//! let connector = HttpJsonConnector::new(Secrets::from_env());
//! Runtime::from_env()?
//!     .register(WorkerConfig::new(HTTP_JSON), connector)
//!     .run()
//!     .await;
//! # Ok(()) }
//! ```
//!
//! # Deviations from the 8.8 connector runtime (until recorded fixtures say otherwise)
//! - Response header names are lower-case (HTTP/2-style, from `reqwest`); repeated headers are
//!   joined with `", "`.
//! - An HTTP error fails with the status's reason phrase (`Not Found`); the error expression sees
//!   `error = {code: "<status>", message, variables: {response: {headers, body}}}` and `job`.
//! - OAuth tokens are fetched per job (no cache), as the REST connector does.
//! - Not supported: `oauth-refresh-token`, client TLS, document storage / `documentReturnFormat`
//!   `DOCUMENT`, multipart bodies. Such jobs fail with a clear message.
//! - Bare `secrets.X` (deprecated) resolves only as a whole value, with a warning.

mod exec;
mod expr;
pub mod mapping;
mod request;
mod secrets;

pub use exec::{HttpJsonConnector, Options, Response, HTTP_JSON};
pub use expr::ErrorOutcome;
pub use request::{ApiKeyLocation, Auth, ClientAuthentication, HttpRequest, DEFAULT_TIMEOUT};
pub use secrets::{resolve as resolve_secrets, Redactor, Secrets, PREFIX_VAR, REDACTED};

use bpmnkit_worker::{to_command, ActivatedJob, Command, Runtime, WorkerConfig};

/// Executes one job and maps it to the command a worker would send.
pub async fn run_job(connector: &HttpJsonConnector, job: &ActivatedJob) -> Command {
    to_command(job, connector.execute(job).await)
}

/// [`run_job`] on a fresh current-thread runtime, for callers without one (the CLI).
pub fn run_job_blocking(connector: &HttpJsonConnector, job: &ActivatedJob) -> Command {
    tokio::runtime::Builder::new_current_thread()
        .enable_all()
        .build()
        .expect("tokio runtime")
        .block_on(run_job(connector, job))
}

/// Polls every `job_types` from the cluster in `CAMUNDA_*` env vars until Ctrl-C, blocking.
pub fn serve_blocking(
    connector: HttpJsonConnector,
    job_types: &[String],
) -> Result<(), bpmnkit_worker::Error> {
    let rt = tokio::runtime::Builder::new_multi_thread()
        .enable_all()
        .build()
        .map_err(|e| bpmnkit_worker::Error::Config(e.to_string()))?;
    rt.block_on(async {
        let mut runtime = Runtime::from_env()?;
        for t in job_types {
            runtime = runtime.register(WorkerConfig::new(t.clone()), connector.clone());
        }
        for report in runtime.run().await {
            if !report.abandoned.is_empty() {
                tracing::warn!(job_type = %report.job_type, left = report.abandoned.len(), "jobs left to time out");
            }
        }
        Ok(())
    })
}

/// A [`Command`] as JSON: `{"complete": …}`, `{"fail": …}` or `{"throwError": …}` with the
/// 8.8 request bodies (the conformance fixtures' `expected`).
pub fn command_json(c: &Command) -> serde_json::Value {
    let (k, v) = match c {
        Command::Complete(r) => ("complete", serde_json::to_value(r)),
        Command::Fail(r) => ("fail", serde_json::to_value(r)),
        Command::ThrowError(r) => ("throwError", serde_json::to_value(r)),
    };
    serde_json::json!({ k: v.unwrap_or_default() })
}
