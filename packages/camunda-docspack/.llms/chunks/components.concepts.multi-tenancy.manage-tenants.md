# Multi-tenancy — Manage tenants

Administrators can manage all tenants centrally in [Admin](https://docs.camunda.io/docs/next/components/admin/tenant). This unified management interface simplifies monitoring, configuration, and maintenance tasks across tenant environments.

The **Tenants** tab in Admin is available to organization admins on SaaS clusters running generation 8.8 and later, even before multi-tenancy checks are enabled. This allows admins to set up tenants and assignments before enforcing checks.


## Multi-tenancy in Camunda Hub

In Camunda Hub, you deploy to an [environment](https://docs.camunda.io/docs/next/components/concepts/environments), which is a Physical Tenant or a cluster. If multi-tenancy is enabled for that environment, you select a tenant separately when you deploy. The tenant you select owns the deployed resources.

If the environment has more than one tenant, choose the tenant to deploy to. If it has exactly one, Camunda Hub selects it automatically.

Learn more about [deploying to a tenant](https://docs.camunda.io/docs/next/components/hub/workspace/manage-projects/deploy-project#logical-tenants).

---
Source: https://docs.camunda.io/docs/next/components/concepts/multi-tenancy
