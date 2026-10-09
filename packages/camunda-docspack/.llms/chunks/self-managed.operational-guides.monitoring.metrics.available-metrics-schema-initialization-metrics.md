# Camunda components metrics — Available metrics — Schema initialization metrics

Use these metrics to monitor secondary-storage readiness and schema initialization:

| Metric name                                       | Type  | Description                                                                       | Labels           |
| ------------------------------------------------- | ----- | --------------------------------------------------------------------------------- | ---------------- |
| `camunda.physical.tenant.secondary.storage.ready` | Gauge | Whether the Physical Tenant's secondary storage is ready (`1`) or degraded (`0`). | `physicalTenant` |
| `camunda.schema.init.time`                        | Timer | Duration of secondary-storage schema initialization for the tenant.               | `physicalTenant` |

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/monitoring/metrics
