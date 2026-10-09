# Job Workers

# Job Workers

Job workers subscribe to a specific job type and process jobs as they become available. The worker handles polling, concurrent dispatch, auto-completion, and error handling.


## Basic Worker

<!-- snippet-source: docs/examples/ReadmeExamples.cs | regions: UsingDirective+BasicWorker+BasicWorkerBody -->

```csharp
using Camunda.Orchestration.Sdk;

// Define input/output DTOs
public record OrderOutput(bool Processed, string InvoiceNumber);

using var client = CamundaClient.Create();

client.CreateJobWorker(
    new JobWorkerConfig
    {
        JobType = "process-order",
        JobTimeoutMs = 30_000,
    },
    async (job, ct) =>
    {
        var input = job.GetVariables<OrderInput>();
        var invoice = await ProcessOrder(input!, ct);

        // Return value auto-completes the job with these output variables
        return new OrderOutput(true, invoice);
    });

// Block until Ctrl+C
using var cts = new CancellationTokenSource();
Console.CancelKeyPress += (_, e) => { e.Cancel = true; cts.Cancel(); };
await client.RunWorkersAsync(ct: cts.Token);
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/csharp-sdk/job-workers
