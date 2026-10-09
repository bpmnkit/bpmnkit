# API routing for Physical Tenants — Backward compatibility and migration

Physical Tenants are designed to be backward-compatible for single-tenant and existing multi-tenant deployments:

- All existing `/v2/...` calls continue to work without modification. They route to the `default` Physical Tenant.
- There is no breaking change for single-tenant users upgrading to 8.10.
- To access a non-default Physical Tenant, update your clients to use the tenant-prefixed path.

For users migrating from Logical Tenants, the `tenantId` parameter in existing API calls remains unchanged and continues to refer to Logical Tenants within a Physical Tenant.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/api-routing
