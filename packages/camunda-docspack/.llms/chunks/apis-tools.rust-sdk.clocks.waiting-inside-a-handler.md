# Clocks — Waiting inside a handler

A `Job` carries its worker's clock, so a handler that needs to wait can do it on the same
clock as everything else:

```rust
use camunda_orchestration_sdk::{CamundaClient, JobAction, JobWorkerConfig};
use std::time::Duration;

let client = CamundaClient::from_env()?;
client
    .create_job_worker(JobWorkerConfig::new("payment"))
    .run(|job| async move {
        // Short coordination only -- a business wait belongs in the process
        // as a BPMN timer event.
        job.clock().sleep(Duration::from_millis(500)).await;
        JobAction::complete()
    })
    .await?;
```

Keep those waits short -- spacing a retry, letting a resource settle. **A long or business
wait belongs in the process as a BPMN timer event, not in a handler.** A handler that sleeps
for minutes holds a worker slot for the duration, risks the job timeout expiring underneath
it, and hides the delay from the process model, where it would otherwise be visible and
changeable without a redeploy.

---
Source: https://docs.camunda.io/docs/next/apis-tools/rust-sdk/clocks
