# Cluster admin — How cluster admin differs from tenant-scoped access

- Cluster admin is authenticated and authorized separately from Orchestration Cluster user sessions. It does not share credentials, roles, or mapping rules with tenant-scoped users.
- Cluster admin credentials are verified against an isolated user store bound to `/cluster/v2/**`. A cluster admin has no route to `/physical-tenants/{physicalTenantId}/v2/...` endpoints, and no existing tenant role grants cluster admin implicitly. Configure it explicitly, as described in [Configure cluster admin access](#configure-cluster-admin-access).
- Authorization is coarse-grained by design. Cluster admin grants access to all cluster-level operations. There are no sub-roles or partial cluster admin grants.

---
Source: https://docs.camunda.io/docs/next/components/admin/cluster-admin
