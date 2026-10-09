# API routing for Physical Tenants — Per-tenant endpoint reference

There is no separate API specification for Physical Tenants. All endpoints in the [Orchestration Cluster REST API](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/orchestration-cluster-api-rest-overview) are available per Physical Tenant. To target a specific tenant, prepend `/physical-tenants/{physicalTenantId}` to the standard `/v2/...` path.

For example, the standard `/v2/process-definitions/search` endpoint is available per tenant at `/physical-tenants/{physicalTenantId}/v2/process-definitions/search`. Replace `{physicalTenantId}` with the configured tenant ID (for example, `tenanta` or `default`).


## Cross-tenant queries

Each API call targets exactly one Physical Tenant via the path prefix. There is no cross-tenant query in a single request. If you need data from multiple tenants, you must make separate calls per tenant.

This is the core isolation guarantee of Physical Tenants: no operation can read or write across tenant boundaries in a single request.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/api-routing
