# Physical Tenant isolation model — API routing

Use tenant-scoped routes for tenant-specific requests:

- REST: `/physical-tenants/{physicalTenantId}/v2/...`
- gRPC: `Camunda-Physical-Tenant` header (routes to `default` when omitted)
- Default tenant compatibility: plain `/v2/...` requests route to the default Physical Tenant

Cluster-wide management endpoints use a dedicated `/cluster/v2/...` path prefix and require the cluster-admin role, except `GET /cluster/v2/status`, which is deliberately unauthenticated so load balancers can use it as a health check. Tenant-scoped endpoints use `/physical-tenants/{physicalTenantId}/v2/...`; endpoints at the standard `/v2/...` paths, including `/v2/topology`, are scoped to the default Physical Tenant. See [cluster admin](https://docs.camunda.io/docs/next/components/admin/cluster-admin) for the operations served under this prefix.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/index
