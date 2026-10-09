# API routing for Physical Tenants

Learn how REST API requests are routed to Physical Tenants, including tenant-scoped paths, default tenant routing, and gRPC routing.


## Tenant-scoped REST API routing

To target a specific Physical Tenant, use the tenant-prefixed path format:

```
/physical-tenants/{physicalTenantId}/v2/{resource}
```

For example:

```
GET  /physical-tenants/riskproduction/v2/process-definitions/search
POST /physical-tenants/riskproduction/v2/process-instances
```

The `physicalTenantId` in the path must match a configured Physical Tenant. The tenant segment comes **before** `/v2/`. Tenant-facing endpoints available at the standard `/v2/...` paths are also available at their tenant-prefixed equivalents.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/api-routing
