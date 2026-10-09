# Manage clusters — Add a cluster {#add-a-cluster-self-managed}

In Self-Managed, you provision and operate your clusters with your own platform tooling, outside Camunda Hub. Camunda Hub displays the clusters that are defined in its [configuration](https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/properties#clusters), and it is read-only for clusters, so you can't create, resize, update, or delete a cluster from it. To make a cluster you provision visible in Camunda Hub:

1. Provision the cluster with your platform tooling, as described in the [Self-Managed installation guide](https://docs.camunda.io/docs/next/self-managed/setup/overview).
1. Add the cluster to the [Camunda Hub configuration](https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/properties#clusters). Camunda Hub reads this configuration at startup, so perform a rolling restart of Camunda Hub to pick up the change.

Click **Register new cluster** on the **Clusters** page to see these steps in Camunda Hub. For the configuration options, see the [clusters](https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/properties#clusters) and [Physical Tenants](https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/environments#physical-tenants) sections of the Camunda Hub configuration.

After the restart, the cluster appears on the **Clusters** page, and each of its [Physical Tenants](https://docs.camunda.io/docs/next/self-managed/concepts/multi-tenancy/physical-tenants) appears as an environment. An organization admin can then [assign the environments to a workspace](https://docs.camunda.io/docs/next/components/hub/organization/manage-environments/assign-environments).

---
Source: https://docs.camunda.io/docs/next/components/hub/organization/manage-clusters/index
