# Physical Tenant isolation model — Readiness

When configuring Kubernetes readiness probes, point the probe at `/actuator/health/readiness` for node-level readiness. To check whether a specific Physical Tenant can accept work independently of the node probe, poll `/physical-tenants/{id}/v2/topology` from your own health-check logic.

For Elasticsearch and OpenSearch deployments, the secondary-storage readiness check uses schema-initialization state. The check is `UP` while at least one Physical Tenant is serviceable and `DOWN` when none are serviceable, but the overall readiness group can still be `DOWN` because of other readiness contributors. In the current implementation, a degraded `default` tenant can also keep node readiness `DOWN` even when another tenant is ready; this known limitation is tracked in [camunda/camunda#63674](https://github.com/camunda/camunda/issues/63674). If one tenant's secondary storage is unusable, that tenant is degraded on its own: its storage-dependent REST endpoints return `503` with a `Retry-After` header while every other serviceable tenant continues to serve traffic. Camunda retries the degraded tenant in the background, so it recovers without a restart once you repair the underlying cause.

For diagnosis steps, see [troubleshooting](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/troubleshooting).

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/index
