# Quick Start (Zero-Config — Recommended) — Configuration via `appsettings.json`

The SDK can read configuration from any `IConfiguration` source (appsettings.json, user secrets, Azure Key Vault, etc.) using idiomatic .NET PascalCase section keys:

```json
{
  "Camunda": {
    "RestAddress": "https://cluster.example.com",
    "Auth": {
      "Strategy": "OAUTH",
      "ClientId": "my-client-id",
      "ClientSecret": "my-secret"
    },
    "OAuth": {
      "Url": "https://login.cloud.camunda.io/oauth/token"
    },
    "Backpressure": {
      "Profile": "CONSERVATIVE"
    }
  }
}
```

Pass the section to the client:

<!-- snippet-source: docs/examples/ReadmeExamples.cs | regions: UsingDirective+AppSettingsConfig -->

```csharp
using Camunda.Orchestration.Sdk;

var builder = WebApplication.CreateBuilder(args);

using var client = CamundaClient.Create(new CamundaOptions
{
    Configuration = builder.Configuration.GetSection("Camunda"),
});
```

Precedence (highest wins): `Config` dictionary > `IConfiguration` section > environment variables > defaults.

This means you can set secrets via environment variables (or a vault) and non-sensitive settings via `appsettings.json` — they layer naturally:

```json
// appsettings.json — non-sensitive, checked into source control
{
  "Camunda": {
    "RestAddress": "https://cluster.example.com",
    "Backpressure": { "Profile": "CONSERVATIVE" }
  }
}
```

```bash
# Secrets injected via environment (vault, CI, container orchestrator)
CAMUNDA_CLIENT_ID=***
CAMUNDA_CLIENT_SECRET=***
CAMUNDA_OAUTH_URL=https://login.cloud.camunda.io/oauth/token
```

appsettings.json key reference

| appsettings.json key              | Maps to env var                                             |
| --------------------------------- | ----------------------------------------------------------- |
| `RestAddress`                     | `CAMUNDA_REST_ADDRESS`                                      |
| `TokenAudience`                   | `CAMUNDA_TOKEN_AUDIENCE`                                    |
| `DefaultTenantId`                 | `CAMUNDA_DEFAULT_TENANT_ID`                                 |
| `TenantIds`                       | `CAMUNDA_TENANT_IDS` (JSON array or comma-separated string) |
| `LogLevel`                        | `CAMUNDA_SDK_LOG_LEVEL`                                     |
| `Validation`                      | `CAMUNDA_SDK_VALIDATION`                                    |
| `Auth:Strategy`                   | `CAMUNDA_AUTH_STRATEGY`                                     |
| `Auth:ClientId`                   | `CAMUNDA_CLIENT_ID`                                         |
| `Auth:ClientSecret`               | `CAMUNDA_CLIENT_SECRET`                                     |
| `Auth:BasicUsername`              | `CAMUNDA_BASIC_AUTH_USERNAME`                               |
| `Auth:BasicPassword`              | `CAMUNDA_BASIC_AUTH_PASSWORD`                               |
| `OAuth:Url`                       | `CAMUNDA_OAUTH_URL`                                         |
| `OAuth:ClientId`                  | `CAMUNDA_CLIENT_ID`                                         |
| `OAuth:ClientSecret`              | `CAMUNDA_CLIENT_SECRET`                                     |
| `OAuth:GrantType`                 | `CAMUNDA_OAUTH_GRANT_TYPE`                                  |
| `OAuth:Scope`                     | `CAMUNDA_OAUTH_SCOPE`                                       |
| `OAuth:TimeoutMs`                 | `CAMUNDA_OAUTH_TIMEOUT_MS`                                  |
| `OAuth:RetryMax`                  | `CAMUNDA_OAUTH_RETRY_MAX`                                   |
| `OAuth:RetryBaseDelayMs`          | `CAMUNDA_OAUTH_RETRY_BASE_DELAY_MS`                         |
| `HttpRetry:MaxAttempts`           | `CAMUNDA_SDK_HTTP_RETRY_MAX_ATTEMPTS`                       |
| `HttpRetry:BaseDelayMs`           | `CAMUNDA_SDK_HTTP_RETRY_BASE_DELAY_MS`                      |
| `HttpRetry:MaxDelayMs`            | `CAMUNDA_SDK_HTTP_RETRY_MAX_DELAY_MS`                       |
| `Backpressure:Profile`            | `CAMUNDA_SDK_BACKPRESSURE_PROFILE`                          |
| `Backpressure:InitialMax`         | `CAMUNDA_SDK_BACKPRESSURE_INITIAL_MAX`                      |
| `Backpressure:SoftFactor`         | `CAMUNDA_SDK_BACKPRESSURE_SOFT_FACTOR`                      |
| `Backpressure:SevereFactor`       | `CAMUNDA_SDK_BACKPRESSURE_SEVERE_FACTOR`                    |
| `Backpressure:RecoveryIntervalMs` | `CAMUNDA_SDK_BACKPRESSURE_RECOVERY_INTERVAL_MS`             |
| `Backpressure:RecoveryStep`       | `CAMUNDA_SDK_BACKPRESSURE_RECOVERY_STEP`                    |
| `Backpressure:DecayQuietMs`       | `CAMUNDA_SDK_BACKPRESSURE_DECAY_QUIET_MS`                   |
| `Backpressure:Floor`              | `CAMUNDA_SDK_BACKPRESSURE_FLOOR`                            |
| `Backpressure:SevereThreshold`    | `CAMUNDA_SDK_BACKPRESSURE_SEVERE_THRESHOLD`                 |
| `Eventual:PollDefaultMs`          | `CAMUNDA_SDK_EVENTUAL_POLL_DEFAULT_MS`                      |

---
Source: https://docs.camunda.io/docs/next/apis-tools/csharp-sdk/quick-start-zero-config-recommended
