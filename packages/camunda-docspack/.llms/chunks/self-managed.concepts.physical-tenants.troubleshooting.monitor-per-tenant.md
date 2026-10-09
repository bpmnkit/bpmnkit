# Troubleshoot Physical Tenants — Monitor per tenant

Camunda tags tenant-scoped metrics with a `physicalTenant` label. Filter by this label, and by `partition`, to isolate one tenant's behavior.

| Metric or label                                   | Use for                                                            |
| :------------------------------------------------ | :----------------------------------------------------------------- |
| `physicalTenant` label                            | Scoping any tenant-aware metric to a single tenant.                |
| `camunda.physical.tenant.secondary.storage.ready` | Detecting a degraded tenant. Reports `0` when storage is unusable. |
| `camunda.schema.init.time`                        | Diagnosing slow or stuck schema initialization per tenant.         |
| Hikari connection pool metrics                    | Spotting per-tenant connection pool exhaustion on RDBMS backends.  |

The Zeebe dashboard aggregates over `(physicalTenant, partition)`, so you can filter it to one tenant without changing the queries.

Metric names above are given in their Micrometer form. When scraping through the Prometheus endpoint, dots become underscores, so `camunda.physical.tenant.secondary.storage.ready` is scraped as `camunda_physical_tenant_secondary_storage_ready`.

Recommended alerts:

- `camunda.physical.tenant.secondary.storage.ready` at `0` for longer than your expected recovery window.
- Sustained `503` responses on a single tenant's REST endpoints.
- Connection pool saturation for one tenant while others are idle.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/troubleshooting
