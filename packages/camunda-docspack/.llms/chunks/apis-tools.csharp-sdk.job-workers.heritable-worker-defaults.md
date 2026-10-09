# Job Workers — Heritable Worker Defaults

When running many workers with the same base configuration, you can set global defaults via environment variables. These apply to every worker created by the client unless the individual `JobWorkerConfig` explicitly overrides them.

| Environment Variable                        | Config Property           | Type   |
| ------------------------------------------- | ------------------------- | ------ |
| `CAMUNDA_WORKER_TIMEOUT`                    | `JobTimeoutMs`            | long   |
| `CAMUNDA_WORKER_MAX_CONCURRENT_JOBS`        | `MaxConcurrentJobs`       | int    |
| `CAMUNDA_WORKER_REQUEST_TIMEOUT`            | `PollTimeoutMs`           | long   |
| `CAMUNDA_WORKER_NAME`                       | `WorkerName`              | string |
| `CAMUNDA_WORKER_STARTUP_JITTER_MAX_SECONDS` | `StartupJitterMaxSeconds` | int    |

**Precedence:** explicit `JobWorkerConfig` value > environment variable > hardcoded default.

```bash
export CAMUNDA_WORKER_TIMEOUT=30000
export CAMUNDA_WORKER_MAX_CONCURRENT_JOBS=8
export CAMUNDA_WORKER_NAME=order-service
```

<!-- snippet-source: docs/examples/ReadmeExamples.cs | regions: WorkerDefaultsEnv -->

```csharp
// Workers inherit timeout, concurrency, and name from environment
client.CreateJobWorker(
    new JobWorkerConfig { JobType = "validate-order" },
    async (job, ct) => null);

client.CreateJobWorker(
    new JobWorkerConfig { JobType = "ship-order" },
    async (job, ct) => null);

// Per-worker override: this worker uses 32 concurrent jobs instead of the global 8
client.CreateJobWorker(
    new JobWorkerConfig { JobType = "bulk-import", MaxConcurrentJobs = 32 },
    async (job, ct) => null);
```

You can also pass defaults programmatically via the client constructor:

<!-- snippet-source: docs/examples/ReadmeExamples.cs | regions: WorkerDefaultsClient -->

```csharp
var client = CamundaClient.Create(new CamundaOptions
{
    Config = new Dictionary<string, string>
    {
        ["CAMUNDA_WORKER_TIMEOUT"] = "30000",
        ["CAMUNDA_WORKER_MAX_CONCURRENT_JOBS"] = "8",
    },
});
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/csharp-sdk/job-workers
