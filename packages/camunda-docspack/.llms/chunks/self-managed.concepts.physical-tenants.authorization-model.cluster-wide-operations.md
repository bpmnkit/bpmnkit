# Authorization model for Physical Tenants — Cluster-wide operations

Cluster-wide operations affect the entire orchestration cluster rather than a single Physical Tenant. Examples include viewing cluster topology, triggering cluster backups, and modifying Physical Tenant configuration at runtime. They are protected by the [cluster-admin role](#cluster-admin-role), exposed under the `/cluster/v2/...` path prefix, except `GET /cluster/v2/status`, which is deliberately unauthenticated so load balancers can use it as a health check.

Endpoints served at `/v2/...` without a `/physical-tenants/{physicalTenantId}` prefix, including `/v2/topology`, are scoped to the default Physical Tenant. They are not cluster-wide endpoints. Cluster-wide endpoints use the `/cluster/v2/...` prefix.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/authorization-model
