# Manage clusters — View clusters

To view your clusters, click **Environments** in the left navigation, and then click **Clusters** next to the page title.

The page lists your clusters. Each cluster shows the following details:

| Detail  | Description                                                     |
| :------ | :-------------------------------------------------------------- |
| Name    | The name of the cluster. Select it to open the cluster details. |
| Status  | The [status](#cluster-statuses) of the cluster.                 |
| Version | The Camunda version of the cluster.                             |
| Region  | The region where the cluster runs.                              |

### Cluster statuses

The status of a cluster reflects its state. It updates automatically while the cluster changes state, and settles on the health of the cluster when the change completes.

| Status      | Description                                                                                               |
| :---------- | :-------------------------------------------------------------------------------------------------------- |
| Healthy     | The cluster is running.                                                                                   |
| Unhealthy   | The cluster reports a problem.                                                                            |
| Creating    | The cluster is being created.                                                                             |
| Updating    | The cluster is being updated.                                                                             |
| Restoring   | The cluster is being restored from a backup.                                                              |
| Maintenance | The cluster is under maintenance.                                                                         |
| Waiting     | The cluster is waiting for input.                                                                         |
| Paused      | The cluster is paused. You can [resume](https://docs.camunda.io/docs/next/components/saas/clusters/manage-cluster#resume-a-cluster) it. |
| Resuming    | The cluster is starting after being resumed.                                                              |

---
Source: https://docs.camunda.io/docs/next/components/hub/organization/manage-clusters/index
