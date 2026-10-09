# Job Workers — Void Handler (No Output Variables)

For handlers that don't return output variables, use the void overload:

<!-- snippet-source: docs/examples/ReadmeExamples.cs | regions: VoidHandler+VoidHandlerBody -->

```csharp
public record NotificationInput(string Message);

client.CreateJobWorker(config, async (job, ct) =>
{
    await SendNotification(job.GetVariables<NotificationInput>()!, ct);
    // Auto-completes with no variables
});
```


## Configuration

| Property                  | Default            | Description                                                                                                                                  |
| ------------------------- | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `JobType`                 | _(required)_       | BPMN task type to subscribe to                                                                                                               |
| `JobTimeoutMs`            | _(env / required)_ | Job lock duration (ms). Falls back to `CAMUNDA_WORKER_TIMEOUT` env var.                                                                      |
| `MaxConcurrentJobs`       | `10`               | Max in-flight jobs per worker. Falls back to `CAMUNDA_WORKER_MAX_CONCURRENT_JOBS` env var, then `10`.                                        |
| `PollIntervalMs`          | `500`              | Delay between polls when idle                                                                                                                |
| `PollTimeoutMs`           | `null`             | Long-poll timeout (null = broker default). Falls back to `CAMUNDA_WORKER_REQUEST_TIMEOUT` env var.                                           |
| `FetchVariables`          | `null`             | Variable names to fetch (null = all)                                                                                                         |
| `WorkerName`              | auto               | Worker name for logging. Falls back to `CAMUNDA_WORKER_NAME` env var.                                                                        |
| `AutoStart`               | `true`             | Start polling on creation                                                                                                                    |
| `StartupJitterMaxSeconds` | `0`                | Max random delay (seconds) before first poll. Falls back to `CAMUNDA_WORKER_STARTUP_JITTER_MAX_SECONDS` env var.                             |
| `TenantIds`               | `null`             | Tenant IDs to activate jobs for. Falls back to `CAMUNDA_TENANT_IDS`, then `[CAMUNDA_DEFAULT_TENANT_ID]`. Mutually exclusive with `TenantId`. |
| `TenantId`                | `null`             | Single-tenant convenience for `TenantIds`. Mutually exclusive with `TenantIds`.                                                              |
| `TenantFilter`            | `null`             | Tenant filtering strategy (`PROVIDED` / `ASSIGNED`). See [Multi-Tenant Workers](#multi-tenant-workers). Requires Camunda 8.9+.               |

---
Source: https://docs.camunda.io/docs/next/apis-tools/csharp-sdk/job-workers
