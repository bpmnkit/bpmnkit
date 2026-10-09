# Logging — Injecting Your Own Logger

Pass an `ILoggerFactory` via `CamundaOptions` to integrate with your application's logging:

<!-- snippet-source: docs/examples/ReadmeExamples.cs | regions: UsingDirective+InjectLogger -->

```csharp
using Camunda.Orchestration.Sdk;

using var loggerFactory = LoggerFactory.Create(builder =>
{
    builder
        .AddConsole()
        .SetMinimumLevel(LogLevel.Debug);
});

using var client = CamundaClient.Create(new CamundaOptions
{
    LoggerFactory = loggerFactory,
});
```

When an `ILoggerFactory` is provided, `CAMUNDA_SDK_LOG_LEVEL` is ignored — filtering is controlled entirely by the injected factory.


## ASP.NET Core / Dependency Injection

When using `AddCamundaClient()`, the SDK automatically resolves `ILoggerFactory` from the DI container — no manual wiring needed:

<!-- snippet-source: docs/examples/ReadmeExamples.cs | regions: UsingDirective+DILogging -->

```csharp
using Camunda.Orchestration.Sdk;

var builder = WebApplication.CreateBuilder(args);

// Logging configuration
builder.Logging.SetMinimumLevel(LogLevel.Debug);

// SDK automatically uses the host's ILoggerFactory
builder.Services.AddCamundaClient(builder.Configuration.GetSection("Camunda"));
```

All SDK log entries appear alongside your application logs with proper category names (`Camunda.Orchestration.Sdk.CamundaClient`, `Camunda.Orchestration.Sdk.JobWorker.*`, etc.).

---
Source: https://docs.camunda.io/docs/next/apis-tools/csharp-sdk/logging
