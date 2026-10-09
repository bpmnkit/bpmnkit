# Job Workers — Concurrency

Jobs are dispatched as concurrent `Task`s on the .NET thread pool. `MaxConcurrentJobs` controls how many jobs may be in-flight simultaneously.

- **I/O-bound handlers** (HTTP calls, database queries): higher values like 32–128 improve throughput because `async` handlers release threads during `await` points — many jobs, few OS threads.
- **CPU-bound handlers**: set `MaxConcurrentJobs` to `Environment.ProcessorCount` to match cores.
- **Sequential processing**: set `MaxConcurrentJobs = 1`.


## Lifecycle

<!-- snippet-source: docs/examples/ReadmeExamples.cs | regions: WorkerLifecycle -->

```csharp
// Manual start/stop
var worker = client.CreateJobWorker(new JobWorkerConfig { JobType = "example", JobTimeoutMs = 30_000, AutoStart = false }, handler);
worker.Start();

// Graceful stop — waits up to 10s for in-flight jobs to finish
var result = await worker.StopAsync(gracePeriod: TimeSpan.FromSeconds(10));
// result.RemainingJobs, result.TimedOut

// Or stop all workers at once
await client.StopAllWorkersAsync(TimeSpan.FromSeconds(10));

// DisposeAsync stops workers automatically
await using var disposableClient = CamundaClient.Create();
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/csharp-sdk/job-workers
