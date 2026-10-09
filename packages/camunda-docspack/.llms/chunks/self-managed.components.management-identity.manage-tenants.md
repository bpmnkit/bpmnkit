# Tenants for Optimize

Manage tenants within Management Identity to support data isolation in Optimize.

Multi-tenancy in Camunda 8 allows a single installation to host multiple tenants (such as departments, teams, or external clients) while maintaining per-tenant isolation of data and processes in a shared environment.

**Info**
To learn more, see [multi-tenancy](https://docs.camunda.io/docs/next/components/concepts/multi-tenancy).


## About Optimize tenants

Tenants managed within Management Identity **apply only to [Optimize](https://docs.camunda.io/docs/next/self-managed/components/optimize/overview)**, allowing you to isolate data access for reports and dashboards. This is effective only if you have [multi-tenancy checks enabled for your Orchestration Cluster](https://docs.camunda.io/docs/next/components/admin/tenant).

If you enable multi-tenancy for Optimize, you must create tenants with the same identifiers as those configured for your Orchestration Cluster. This alignment is important for correct data isolation and association in Optimize.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/management-identity/manage-tenants
