# bpmnkit-worker

Camunda 8 job workers in Rust over the Orchestration Cluster REST API (`/v2`, Camunda 8.8+).

- **Client**: activate, complete (with `userTask` / `adHocSubProcess` results), fail (retries, backoff), throw BPMN error, update retries/timeout. Bodies follow the vendored 8.8 `rest-api.yaml` and are validated against it in the tests.
- **Auth**: none, Basic, Bearer, OAuth2 client credentials (one token per client, refreshed at 80 % of its lifetime, concurrent requests share one fetch; a 401 fetches a fresh token once).
- **Loop**: at most `max_jobs_active` handlers; polls again when ≤ 30 % of them run; long polling; `poll_interval` after an empty answer; exponential backoff with jitter after errors (the camunda-client-java formula and numbers).
- **Results**: `Ok(Complete)` completes, `JobError::Bpmn` throws a BPMN error, `JobError::Fail` fails with retries − 1 and the `retryBackoff` header as backoff, a panic fails with its message.
- **Shutdown**: stop polling, wait for running handlers up to a deadline, report the job keys left to time out.
- **Metrics**: the `Metrics` trait, `CounterMetrics`, and Prometheus text with the `prometheus` feature.
- **Testing** (`testing` feature): `MockJob`, `run_handler`, `FakeClient`.

Defaults equal camunda-client-java 8.8: `max_jobs_active` 32, poll interval 100 ms, job timeout 5 min, request timeout 10 s, REST address `http://0.0.0.0:8080`, worker name `default`.

```rust,no_run
use bpmnkit_worker::{ActivatedJob, Complete, JobError, Runtime, WorkerConfig};

async fn charge(job: ActivatedJob) -> Result<Complete, JobError> {
    let amount = job.variables["amount"].as_i64().unwrap_or(0);
    if amount <= 0 {
        return Err(JobError::bpmn("INVALID_AMOUNT", "amount must be positive"));
    }
    Ok(Complete::new().var("charged", amount))
}

#[tokio::main]
async fn main() -> Result<(), bpmnkit_worker::Error> {
    // CAMUNDA_REST_ADDRESS, CAMUNDA_CLIENT_ID/SECRET, CAMUNDA_OAUTH_URL, CAMUNDA_TOKEN_AUDIENCE, …
    let reports = Runtime::from_env()?
        .register(WorkerConfig::new("charge").fetch_variables(["amount"]), charge)
        .run()
        .await;
    for r in reports.iter().filter(|r| !r.abandoned.is_empty()) {
        eprintln!("{}: left to time out: {:?}", r.job_type, r.abandoned);
    }
    Ok(())
}
```

Status: `0.x`, no stability promise until the Rust and Java worker generators both ship. gRPC job streaming is planned as a `grpc` feature.

Licensed under MIT or Apache-2.0.
