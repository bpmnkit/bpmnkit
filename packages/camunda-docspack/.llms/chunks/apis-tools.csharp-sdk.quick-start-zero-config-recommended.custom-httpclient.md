# Quick Start (Zero-Config — Recommended) — Custom HttpClient

<!-- snippet-source: docs/examples/ReadmeExamples.cs | regions: UsingDirective+CustomHttpClient -->

```csharp
using Camunda.Orchestration.Sdk;

var httpClient = new HttpClient { BaseAddress = new Uri("https://my-cluster/v2/") };
using var client = CamundaClient.Create(new CamundaOptions
{
    HttpClient = httpClient,
});
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/csharp-sdk/quick-start-zero-config-recommended
