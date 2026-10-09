# Troubleshoot Physical Tenants — Degraded tenants

A Physical Tenant most often becomes **degraded** because its secondary storage is unusable, for example because its schema could not be initialized or its database is unreachable. Secondary storage is not the only cause of a degraded tenant, but it's the one this section covers.

### What you observe

- Storage-dependent `/v2/...` REST endpoints for that tenant return `503 Service Unavailable` with a `Retry-After` header and a problem-detail body.
- Other Physical Tenants continue serving requests normally.
- On Elasticsearch and OpenSearch deployments where the secondary-storage readiness check is enabled, the check is `UP` as long as at least one tenant is serviceable. The overall readiness group can still be `DOWN` because of other readiness contributors. In the current implementation, a degraded `default` tenant can also keep node readiness `DOWN` even when another tenant is ready; this known limitation is tracked in [camunda/camunda#63674](https://github.com/camunda/camunda/issues/63674).
- The per-tenant readiness gauge `camunda.physical.tenant.secondary.storage.ready` reports `0` for the affected tenant.
- Per-tenant transition logs name the tenant and state whether an operator needs to act.

### How recovery works

Camunda retries initialization for each degraded tenant in the background, with exponential backoff starting at 500 ms and climbing to 10 seconds. By default the retries are effectively unbounded.

When you repair the underlying cause, such as restoring network access to the database, the tenant recovers on its own. **No restart is required.**

If you have capped the retry count in your retry configuration, a tenant that exhausts the cap stays degraded until you restart the node, rather than recovering on its own.

**Note**
Request rejection for degraded tenants applies to REST endpoints. gRPC and MCP requests are not rejected on this basis.

If a tenant's JDBC URL uses a prefix Camunda does not recognize, such as jTDS or a driver proxy, Camunda falls back to opening one connection at startup to identify the vendor. That tenant is no longer isolated from an unreachable database, and the startup log warns and names the property that removes the fallback. Set `database-vendor-id` explicitly for these tenants.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/troubleshooting
