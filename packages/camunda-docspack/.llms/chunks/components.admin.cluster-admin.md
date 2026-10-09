# Cluster admin

Cluster admin is a coarse-grained role for cluster-wide operations that span all Physical Tenants in an Orchestration Cluster.

Self-Managed only

Cluster admin is a role for operations that apply to an entire [Orchestration Cluster](https://docs.camunda.io/docs/next/components/orchestration-cluster), rather than a single Physical Tenant. It is separate from the [tenant-scoped roles and authorizations](https://docs.camunda.io/docs/next/components/admin/authorization) managed elsewhere in Admin, and uses its own credentials.

**Note**
Cluster admin was added in 8.10 alongside [Physical Tenants](https://docs.camunda.io/docs/next/self-managed/concepts/multi-tenancy/physical-tenants). It is most relevant in clusters running multiple Physical Tenants, where cluster-wide visibility and recovery operations span Physical Tenant boundaries.

---
Source: https://docs.camunda.io/docs/next/components/admin/cluster-admin
