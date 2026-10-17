# Manage environments — Add a new environment {#add-a-new-environment-self-managed}

In Self-Managed, you add an environment by adding a cluster or a [Physical Tenant](https://docs.camunda.io/docs/next/self-managed/concepts/multi-tenancy/physical-tenants) to the Camunda Hub configuration. You provision clusters outside Camunda Hub. A cluster has an environment for its `default` Physical Tenant, and, on Camunda 8.10 and later, one for each additional Physical Tenant you declare.

1. Provision the cluster with your platform tooling.
1. Add the cluster to the Camunda Hub configuration, and declare any additional Physical Tenants. See [Physical Tenants in the Camunda Hub configuration](https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/environments#physical-tenants).
1. Perform a rolling restart of Camunda Hub. Camunda Hub reads the configuration at startup. After the restart, the environments appear on the **Environments** page.
1. [Assign the environments to a workspace](https://docs.camunda.io/docs/next/components/hub/organization/manage-environments/assign-environments) so that teams can deploy to them.

---
Source: https://docs.camunda.io/docs/next/components/hub/organization/manage-environments/index
