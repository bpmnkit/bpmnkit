# Job Workers — Multi-Tenant Workers

A worker activates jobs for a fixed tenant set (`TenantIds` / `TenantId`), or delegates the choice to the server with `TenantFilter`:

| `TenantFilter`      | Behavior                                                                                                                        |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `null` / `PROVIDED` | Activate jobs for the tenants named in `TenantIds` / `TenantId`, falling back to `CAMUNDA_TENANT_IDS`, then the default tenant. |
| `ASSIGNED`          | Activate jobs for whichever tenants are currently assigned to the authenticated client. No tenant IDs are sent.                 |

The fixed tenant set can also come from configuration, so a fleet of workers shares one tenant list:

```bash
export CAMUNDA_TENANT_IDS=acme,globex
```

```json
// appsettings.json — array or comma-separated string
{
  "Camunda": {
    "TenantIds": ["acme", "globex"]
  }
}
```

**Tenant precedence** (highest wins): `JobWorkerConfig.TenantIds` / `TenantId` > `CAMUNDA_TENANT_IDS` > `[CAMUNDA_DEFAULT_TENANT_ID]`. An empty `TenantIds` list counts as unset. `TenantFilter = ASSIGNED` opts out of the chain entirely — the configured tenant IDs are ignored, not sent.

<!-- snippet-source: docs/examples/ReadmeExamples.cs | regions: MultiTenantWorker -->

```csharp
// Fixed tenant set — activate jobs for these tenants only
client.CreateJobWorker(
    new JobWorkerConfig
    {
        JobType = "process-order",
        JobTimeoutMs = 30_000,
        TenantIds = new[] { "acme", "globex" },
    },
    async (job, ct) => null);

// Dynamic tenant set — activate jobs for whichever tenants are currently
// assigned to the authenticated client. The server re-evaluates the
// assignment on every activation request, so tenants added or removed in
// Camunda take effect without restarting the worker.
client.CreateJobWorker(
    new JobWorkerConfig
    {
        JobType = "process-order",
        JobTimeoutMs = 30_000,
        TenantFilter = TenantFilterEnum.ASSIGNED,
    },
    async (job, ct) => null);
```

`ASSIGNED` re-reads the assignment on every activation request, so the worker picks up newly assigned tenants and drops removed ones without restarting and without the application querying or caching the tenant list. Notes:

- `ASSIGNED` cannot be combined with `TenantIds` or `TenantId` — the server would ignore them, so `CreateJobWorker` throws `ArgumentException` instead.
- `ASSIGNED` requires multi-tenancy to be enabled on the cluster; otherwise the activation request is rejected with HTTP 400.

---
Source: https://docs.camunda.io/docs/next/apis-tools/csharp-sdk/job-workers
