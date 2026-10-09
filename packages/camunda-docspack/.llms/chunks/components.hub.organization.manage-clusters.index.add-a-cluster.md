# Manage clusters — Add a cluster

In SaaS, you create clusters in Camunda Hub. Every cluster you create gets one environment automatically. You choose the [cluster type and size](https://docs.camunda.io/docs/next/components/saas/clusters), the region, the version, and a tag, such as `prod`, that appears on the environment of the cluster. Then an organization admin [assigns the environment to a workspace](https://docs.camunda.io/docs/next/components/hub/organization/manage-environments/assign-environments) so teams can deploy to it.

See [create a cluster](https://docs.camunda.io/docs/next/components/saas/clusters/create-cluster).


## View cluster details

Select a cluster to open its details. The header shows the name and status of the cluster.

### Overview

The overview summarizes the cluster in the following sections:

| Section         | Description                                                                                                                                                                                            |
| :-------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Environments    | The environment the cluster hosts. Select the environment to open its details and its applications: Operate, Tasklist, Admin, and Optimize.                                                            |
| Cluster details | The status, type, size, generation, and tag of the cluster. From here you can resize the cluster, modify its tag, review an available update, and resume a paused cluster.                             |
| Components      | The health of the components of the cluster, such as the connector runtime. Click **Manage** on the **Connectors** tile to open [Connector Management](https://docs.camunda.io/docs/next/components/hub/organization/manage-clusters/manage-connectors).                        |
| Jobs            | The jobs of the environment of the cluster for the last 24 hours: the number of jobs that were created, completed, and not completed. See the [job dashboard](https://docs.camunda.io/docs/next/components/hub/organization/analyze-operations/job-dashboard). |

### Cluster management actions

You can manage a cluster with the following actions:

| Task                                                   | Where to find it                                                            |
| :----------------------------------------------------- | :-------------------------------------------------------------------------- |
| Rename, resume, update, resize, or delete a cluster    | [Manage your cluster](https://docs.camunda.io/docs/next/components/saas/clusters/manage-cluster)          |
| Create and manage API clients                          | [Manage API clients](https://docs.camunda.io/docs/next/components/saas/clusters/manage-api-clients)       |
| Create secrets for your connectors                     | [Manage connector secrets](https://docs.camunda.io/docs/next/components/saas/clusters/manage-secrets)     |
| Get notified when process instances stop with an error | [Create an alert](https://docs.camunda.io/docs/next/components/saas/clusters/manage-alerts)               |
| Restrict access to the cluster                         | [Manage IP allowlists](https://docs.camunda.io/docs/next/components/saas/clusters/manage-ip-allowlists)   |
| Back up the cluster                                    | [Create cluster backups](https://docs.camunda.io/docs/next/components/saas/clusters/cluster-backups)      |
| Enable authorizations and other cluster settings       | [Manage cluster settings](https://docs.camunda.io/docs/next/components/saas/clusters/settings)            |
| Record user and client operations                      | [Configure the audit log](https://docs.camunda.io/docs/next/components/saas/clusters/configure-audit-log) |
| Check how well the cluster copes with its workload     | [Monitor cluster load](https://docs.camunda.io/docs/next/components/saas/clusters/cluster-capacity)       |
| Fix common problems                                    | [Troubleshoot clusters](https://docs.camunda.io/docs/next/components/saas/clusters/troubleshoot-clusters) |

To monitor and manage the connectors that run on a cluster, see [manage your connectors](https://docs.camunda.io/docs/next/components/hub/organization/manage-clusters/manage-connectors).

---
Source: https://docs.camunda.io/docs/next/components/hub/organization/manage-clusters/index
