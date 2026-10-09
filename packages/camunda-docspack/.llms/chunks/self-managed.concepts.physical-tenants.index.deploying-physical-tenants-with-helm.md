# Physical Tenant isolation model — Deploying Physical Tenants with Helm

The Helm chart passes tenant configuration through rather than modeling it: there's no `orchestration.physicalTenants` values key, and tenants are declared as `camunda.physical-tenants.*` application configuration through `orchestration.extraConfiguration`. See [Helm and application configuration responsibilities](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/configuration-responsibilities).

What the chart does own is the release shape around your tenants. Each tenant needs its own Optimize release, its own index prefixes, and its own OIDC client, and adding or removing a tenant is an ordered operation across several releases.

For the release-level view, see [configure Physical Tenants across releases](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/physical-tenants). For the delivery mechanics alone, see [configure Physical Tenants in Helm chart](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/configure-physical-tenants).

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/index
