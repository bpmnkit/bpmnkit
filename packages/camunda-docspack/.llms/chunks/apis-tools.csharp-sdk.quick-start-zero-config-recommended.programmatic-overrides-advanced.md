# Quick Start (Zero-Config — Recommended) — Programmatic Overrides (Advanced)

Use only when you must supply or mutate configuration dynamically (e.g. multi-tenant routing, tests, ephemeral preview environments). Keys mirror their `CAMUNDA_*` env names:

<!-- snippet-source: docs/examples/ReadmeExamples.cs | regions: UsingDirective+ProgrammaticOverrides -->

```csharp
using Camunda.Orchestration.Sdk;

using var client = CamundaClient.Create(new CamundaOptions
{
    Config = new Dictionary<string, string>
    {
        ["CAMUNDA_REST_ADDRESS"] = "https://my-cluster.camunda.io",
        ["CAMUNDA_AUTH_STRATEGY"] = "OAUTH",
        ["CAMUNDA_CLIENT_ID"] = "my-client-id",
        ["CAMUNDA_CLIENT_SECRET"] = "my-secret",
        ["CAMUNDA_OAUTH_URL"] = "https://login.cloud.camunda.io/oauth/token",
        ["CAMUNDA_TOKEN_AUDIENCE"] = "zeebe.camunda.io",
    },
});
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/csharp-sdk/quick-start-zero-config-recommended
