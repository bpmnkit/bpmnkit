# Manage clusters — Update a cluster {#update-a-cluster-self-managed}

Updates to clusters happen outside Camunda Hub:

- To change how a cluster appears in Camunda Hub, for example its name, tags, [components](https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/properties#components), or Physical Tenants, update the [Camunda Hub configuration](https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/properties#clusters), and perform a rolling restart.
- To upgrade or scale the cluster and its components, use your platform tooling. See the [upgrade guides](https://docs.camunda.io/docs/next/self-managed/upgrade/index).

If you remove a cluster from the [Camunda Hub configuration](https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/properties#clusters) but a workspace still uses its environments, they stay in the workspace with the status **Not reported**.

---
Source: https://docs.camunda.io/docs/next/components/hub/organization/manage-clusters/index
