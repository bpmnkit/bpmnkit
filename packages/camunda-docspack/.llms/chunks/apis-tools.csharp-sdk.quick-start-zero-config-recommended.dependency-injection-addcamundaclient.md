# Quick Start (Zero-Config — Recommended) — Dependency Injection (`AddCamundaClient`)

For ASP.NET Core and other DI-based applications, use the `AddCamundaClient()` extension method on `IServiceCollection`. The client is registered as a singleton and automatically picks up `ILoggerFactory` from the container.

**Zero-config** (environment variables only):

<!-- snippet-source: docs/examples/ReadmeExamples.cs | regions: UsingDirective+DIZeroConfig -->

```csharp
using Camunda.Orchestration.Sdk;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddCamundaClient();
```

**With `appsettings.json`**:

<!-- snippet-source: docs/examples/ReadmeExamples.cs | regions: UsingDirective+DIAppSettings -->

```csharp
using Camunda.Orchestration.Sdk;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddCamundaClient(builder.Configuration.GetSection("Camunda"));
```

**With options callback** (full control):

<!-- snippet-source: docs/examples/ReadmeExamples.cs | regions: UsingDirective+DIOptionsCallback -->

```csharp
using Camunda.Orchestration.Sdk;

builder.Services.AddCamundaClient(options =>
{
    options.Configuration = builder.Configuration.GetSection("Camunda");
    // or: options.Config = new Dictionary<string, string> { ... };
});
```

Inject the client anywhere via constructor injection:

<!-- snippet-source: docs/examples/ReadmeExamples.cs | regions: DIControllerInjection -->

```csharp
public class OrderController(CamundaClient camunda) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> StartProcess()
    {
        var result = await camunda.CreateProcessInstanceAsync(
            new ProcessInstanceCreationInstructionById
            {
                ProcessDefinitionId = ProcessDefinitionId.AssumeExists("order-process"),
            });
        return Ok(result);
    }
}
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/csharp-sdk/quick-start-zero-config-recommended
