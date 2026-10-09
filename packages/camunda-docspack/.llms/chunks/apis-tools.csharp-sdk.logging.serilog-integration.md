# Logging — Serilog Integration

<!-- snippet-source: docs/examples/ReadmeExamples.cs | regions: SerilogIntegration -->

```csharp
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Debug()
    .WriteTo.Console()
    .CreateLogger();

using var loggerFactory = new SerilogLoggerFactory();
using var client = CamundaClient.Create(new CamundaOptions
{
    LoggerFactory = loggerFactory,
});
```


## What Gets Logged

| Component             | Level   | Events                                            |
| --------------------- | ------- | ------------------------------------------------- |
| `CamundaClient`       | Debug   | HTTP request method + path, response status codes |
| `CamundaClient`       | Warning | HTTP request failures (non-2xx)                   |
| `CamundaClient`       | Trace   | Default tenant ID injection                       |
| `OAuthManager`        | Debug   | Token request attempts                            |
| `OAuthManager`        | Info    | Token acquired (with effective expiry)            |
| `BackpressureManager` | Debug   | Permit reduction/recovery                         |
| `HttpRetryExecutor`   | Debug   | Retry attempts with delay and reason              |
| `JobWorker.*`         | Info    | Worker started, worker stopped                    |
| `JobWorker.*`         | Debug   | Job completed                                     |
| `JobWorker.*`         | Error   | Handler exceptions, poll failures                 |
| `EventualPoller`      | Debug   | Consistency polling progress                      |

---
Source: https://docs.camunda.io/docs/next/apis-tools/csharp-sdk/logging
