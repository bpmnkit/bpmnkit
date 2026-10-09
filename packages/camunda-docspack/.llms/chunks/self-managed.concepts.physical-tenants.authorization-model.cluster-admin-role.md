# Authorization model for Physical Tenants — Cluster-admin role

The cluster-admin role protects operations that span all Physical Tenants or affect the entire cluster, such as:

- Viewing cluster status and topology
- Triggering a cluster restore or a cluster mode change
- Running runtime and history backups across every tenant

Cluster-admin is resolved from JWT token claims using configurable mapping rules, a dedicated cluster-admin configuration, or explicit user assignment for Basic authentication. There is no separate persisted cluster-level role binding service. Authorization is coarse-grained. Cluster-admin grants access to all cluster-level operations, with no fine-grained sub-roles.

Cluster-admin credentials are verified against an isolated user store bound to `/cluster/v2/**`, so a cluster admin cannot reach tenant-scoped `/physical-tenants/{physicalTenantId}/v2/...` endpoints. See [cluster admin](https://docs.camunda.io/docs/next/components/admin/cluster-admin) for configuration examples.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/authorization-model
