# Quick Start (Zero-Config — Recommended)

# Quick Start (Zero-Config — Recommended)

Keep configuration out of application code. Let the factory read `CAMUNDA_*` variables from the environment (12-factor style). This makes rotation, secret management, and environment promotion safer and simpler.

<!-- snippet-source: docs/examples/ReadmeExamples.cs | regions: UsingDirective+QuickStart -->

```csharp
using Camunda.Orchestration.Sdk;

// Zero-config construction: reads CAMUNDA_* from environment variables.
// If no configuration is present, defaults to Camunda 8 Run on localhost.
using var client = CamundaClient.Create();

var topology = await client.GetTopologyAsync();
Console.WriteLine($"Brokers: {topology.Brokers?.Count ?? 0}");
```

Typical environment (example):

```bash
CAMUNDA_REST_ADDRESS=https://cluster.example   # SDK appends /v2 automatically
CAMUNDA_REST_ADDRESS_EXACT=false                # optional: true = use address verbatim (no /v2), e.g. behind a gateway
CAMUNDA_AUTH_STRATEGY=OAUTH
CAMUNDA_CLIENT_ID=***
CAMUNDA_CLIENT_SECRET=***
CAMUNDA_OAUTH_URL=https://login.cloud.camunda.io/oauth/token
CAMUNDA_DEFAULT_TENANT_ID=<default>            # optional: override default tenant
```

> **Why zero-config?**
>
> - **Separation of concerns**: business code depends on an interface, not on secrets/constants wiring.
> - **12-Factor alignment**: config lives in the environment → simpler promotion (dev → staging → prod).
> - **Secret rotation**: rotate credentials without a code change or redeploy.
> - **Immutable start**: single hydration pass prevents drift / mid-request mutations.
> - **Test ergonomics**: swap env vars per test without touching source; create multiple clients for multi-tenant tests.
> - **Security review**: fewer code paths handling secrets; scanners & vault tooling work at the boundary.
> - **Deploy portability**: same artifact runs everywhere; only the environment differs.
> - **Cross-SDK consistency**: identical variable names across JavaScript, C#, and Python SDKs.

---
Source: https://docs.camunda.io/docs/next/apis-tools/csharp-sdk/quick-start-zero-config-recommended
