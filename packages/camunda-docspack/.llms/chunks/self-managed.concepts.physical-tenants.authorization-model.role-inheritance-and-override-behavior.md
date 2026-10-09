# Authorization model for Physical Tenants — Role inheritance and override behavior

There is **no automatic role inheritance** from the cluster level to individual Physical Tenants, or across Physical Tenants. Each tenant's role and permission configuration is independent.

A user with cluster-admin access does not automatically have admin rights within any specific Physical Tenant. Cluster-admin is limited to cluster-wide operations only.


## Audit implications

Audit log queries follow the same Physical Tenant scope as other tenant-local API requests. Records from one Physical Tenant are not returned by another tenant's audit-log query. See [audit logs and Physical Tenants](https://docs.camunda.io/docs/next/self-managed/concepts/audit-log/index#audit-logs-and-physical-tenants) for storage scope and query paths.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/authorization-model
