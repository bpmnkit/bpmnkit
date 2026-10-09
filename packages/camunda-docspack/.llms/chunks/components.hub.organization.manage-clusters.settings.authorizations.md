# Manage cluster settings — Authorizations

You can enable authorizations on a per-cluster basis to control the level of access users and clients have over Orchestration Cluster resources.

- Enable this setting to use [authorizations](https://docs.camunda.io/docs/next/components/concepts/access-control/authorizations) in the cluster.
- Disable this setting if you do not want to use authorizations in the cluster. You can still configure authorizations in the Orchestration Cluster Admin, but they are only applied to the cluster when you enable this setting.

**Tip**
Learn more about [resource-based authorizations](https://docs.camunda.io/docs/next/components/concepts/access-control/authorizations).


## Multi-tenancy

You can enable multi-tenancy checks on a per-cluster basis to enforce tenant-level authorization for Orchestration Cluster resources.

**Note**
This setting applies to Camunda 8 SaaS. In Self-Managed, multi-tenancy checks are not configured through this UI — set them using [configuration properties](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties#multi-tenancy) at startup.

- Enable this setting to enforce tenant-level authorization checks. Users, groups, and roles not assigned to a tenant lose access to any resources scoped to that tenant.
- Disable this setting to allow tenants to be created and principals assigned without enforcing checks. All data maps to the `<default>` tenant.

This setting is disabled by default. Only organization admins can change it, and it is available for clusters running generation 8.8 and later. The setting is reversible: disabling it restores the implicit `<default>`-tenant behavior.

For details on creating tenants and managing assignments, see [tenant management](https://docs.camunda.io/docs/next/components/admin/tenant).

**Warning**
Before you enable multi-tenancy checks, assign all users, groups, and roles that need access to their tenants and to the `<default>` tenant. Once checks are enforced, any principal not assigned to a tenant loses access to the resources scoped to that tenant.

---
Source: https://docs.camunda.io/docs/next/components/hub/organization/manage-clusters/settings
