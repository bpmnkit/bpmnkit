# Physical Tenants — API and access patterns

Tenant-scoped APIs are accessible at `/physical-tenants/{physicalTenantId}/v2/`:

- REST API: `POST /physical-tenants/mytenant/v2/process-definitions`
- Webapps: `https://your-cluster/physical-tenants/mytenant/operate`

Cluster-wide APIs use a dedicated `/cluster/v2/...` path prefix. Cluster-wide management endpoints require the cluster-admin role, except `GET /cluster/v2/status`, which is deliberately unauthenticated so load balancers can use it as a health check. Endpoints at the standard `/v2/...` paths, including `/v2/topology`, are scoped to a Physical Tenant, not the cluster.

gRPC clients specify the Physical Tenant using the `Camunda-Physical-Tenant` custom header.


## Logical and Physical Tenants together

Logical Tenants remain available within each Physical Tenant as a lightweight subdivision mechanism. You can use Logical Tenants for cost-efficient sub-division (for example, multiple departments within a team) while relying on Physical Tenants for strong isolation (for example, separate teams within an organization).

See [Logical Tenants](https://docs.camunda.io/docs/next/self-managed/concepts/multi-tenancy/logical-tenants) for details on the lightweight tenant-ID based model.

**Warning**
There is no migration path from Logical Tenants to Physical Tenants. Logical Tenants created in a Physical Tenant remain associated with that tenant and cannot be migrated to another Physical Tenant.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/multi-tenancy/physical-tenants
