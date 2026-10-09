# Authorization model for Physical Tenants — How to determine who can access a tenant

Access to a Physical Tenant is determined by two independent checks:

1. **Authentication:** The requesting user's JWT token must be issued by a provider that is in the tenant's `providers.assigned` list. If the provider is not assigned to that tenant, the request fails with `401 Unauthorized`.

2. **Authorization:** The user's roles and permissions (derived from token claims via the tenant's local mapping rules) must allow the requested operation. If the user is authenticated but lacks permission, the request fails with `403 Forbidden`.

An unknown tenant ID returns `404 Not Found` on the tenant-prefixed REST paths. The equivalent gRPC error code is not yet documented.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/authorization-model
