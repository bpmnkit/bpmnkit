# Tenants

Manage tenants within the Orchestration Cluster Admin to logically separate your infrastructure.

Use Admin to manage Orchestration Cluster tenants and isolate data within a single cluster. Tenant management is available on both Camunda 8 SaaS and Self-Managed.

**Note**
On SaaS, the **Tenants** tab is visible to organization admins on clusters running generation 8.8 and later, even before multi-tenancy checks are enabled. This allows admins to set up tenants and assignments before enforcing checks. Before enabling checks, confirm your tenant assignments so users retain the access they need.


## About tenants

A tenant is a logical boundary for data within a Camunda 8 installation.

This enables multiple teams, departments, or clients to share a single environment while keeping data isolated.

**Tip**
To learn more about tenants, see [multi-tenancy](https://docs.camunda.io/docs/next/components/concepts/multi-tenancy).

You can manage your Orchestration Cluster tenants directly in [Admin](https://docs.camunda.io/docs/next/components/admin/admin-introduction).

- **Multi-tenancy** is enabled by default.
- **Multi-tenancy checks** are disabled by default. All data maps to the `<default>` tenant.

This allows administrators to set up tenants and assignments before enforcing multi-tenancy checks.

How you enable multi-tenancy checks depends on your deployment model:

- **SaaS**: Enable the **Multi-tenancy** toggle per cluster in [Camunda Hub cluster settings](https://docs.camunda.io/docs/next/components/hub/organization/manage-clusters/settings#multi-tenancy).
- **Self-Managed**: Configure multi-tenancy through [Orchestration Cluster configuration properties](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties#multi-tenancy).

**Warning**
Before you enable multi-tenancy checks, assign all users, groups, and roles that need access to their tenants and to the `<default>` tenant. Once checks are enforced, any principal not assigned to a tenant loses access to the resources scoped to that tenant.

---
Source: https://docs.camunda.io/docs/next/components/admin/tenant
