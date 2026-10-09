# Logging

# Logging

The SDK uses `Microsoft.Extensions.Logging` — the standard .NET logging abstraction. This means it integrates with any logging framework that supports `ILoggerFactory` (Serilog, NLog, the built-in console logger, etc.).


## Default Behavior

When no logger is injected, the SDK uses a built-in console logger filtered by `CAMUNDA_SDK_LOG_LEVEL`:

| `CAMUNDA_SDK_LOG_LEVEL` | What is logged                                                   |
| ----------------------- | ---------------------------------------------------------------- |
| `error` (default)       | Errors only                                                      |
| `warn`                  | Errors + warnings                                                |
| `info`                  | + OAuth token events, worker start/stop                          |
| `debug`                 | + HTTP requests/responses, retry decisions, backpressure changes |
| `trace`                 | + tenant injection, internal diagnostics                         |
| `silent`                | Nothing (same as `NullLoggerFactory`)                            |

Output uses a tagged format matching the JS SDK:

```
[camunda-sdk][info][CamundaClient] CamundaClient constructed with auth strategy OAuth
[camunda-sdk][debug][CamundaClient] HTTP POST process-instances/search -> 200
[camunda-sdk][info][JobWorker.worker-process-order-1] JobWorker 'worker-process-order-1' started for type 'process-order'
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/csharp-sdk/logging
