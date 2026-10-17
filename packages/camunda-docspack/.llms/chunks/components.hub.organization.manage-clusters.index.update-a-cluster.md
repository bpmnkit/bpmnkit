# Manage clusters — Update a cluster

In SaaS, you update clusters in Camunda Hub. You can rename, resume, update, resize, and delete a cluster, and configure its settings. See [manage your cluster](https://docs.camunda.io/docs/next/components/saas/clusters/manage-cluster) and [manage cluster settings](https://docs.camunda.io/docs/next/components/saas/clusters/settings).


## Permissions {#permissions-self-managed}

Only organization admins and DevOps users see the **Clusters** page. Other users work with the environments assigned to their [workspace](https://docs.camunda.io/docs/next/components/concepts/workspaces), and they don't see clusters.


## View clusters {#view-clusters-self-managed}

To view your clusters, click **Environments** in the left navigation, and then click **Clusters** next to the page title.

Use the search box to find a cluster by name, and filter the list by status, version, and tag. Each cluster shows the following details:

| Detail       | Description                                                                           |
| :----------- | :------------------------------------------------------------------------------------ |
| Name         | The name of the cluster. Select it to open the cluster details.                       |
| Namespace    | The Kubernetes namespace of the cluster, if it's configured.                          |
| Version      | The Camunda version of the cluster.                                                   |
| Status       | The health of the cluster. See [cluster statuses](#cluster-statuses-self-managed).    |
| License      | The license of the cluster, if the cluster reports it.                                |
| Environments | The number of [environments](https://docs.camunda.io/docs/next/components/concepts/environments) the cluster hosts. |

### Cluster statuses {#cluster-statuses-self-managed}

Camunda Hub monitors the health of the components of a cluster to determine its status. For details on how the status is determined, see the [Camunda Hub configuration](https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/environments#environment-status).

| Status    | Description                                                                              |
| :-------- | :--------------------------------------------------------------------------------------- |
| Healthy   | The components of the cluster are healthy.                                               |
| Unhealthy | A component of the cluster reports a problem.                                            |
| Unknown   | Camunda Hub can't determine the status, for example because a component doesn't respond. |

---
Source: https://docs.camunda.io/docs/next/components/hub/organization/manage-clusters/index
