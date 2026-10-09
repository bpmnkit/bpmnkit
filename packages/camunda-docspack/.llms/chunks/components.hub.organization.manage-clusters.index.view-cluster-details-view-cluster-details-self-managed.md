# Manage clusters — View cluster details {#view-cluster-details-self-managed}

Select a cluster to open its details. The header shows the status of the cluster and the number of environments it hosts.

### Overview {#overview-self-managed}

The overview summarizes the cluster in the following sections:

| Section         | Description                                                                                                                                                                                                                                              |
| :-------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Environments    | The environments the cluster hosts. Select an environment to open its details and its applications: Operate, Tasklist, and Admin. Optimize is shown if it's configured.                                                                                  |
| Cluster details | The status, namespace, version, cluster ID, license, and the time Camunda Hub last synced with the cluster. It also shows any custom properties from the [Camunda Hub configuration](https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/properties#clusters). |
| Components      | The health and version of the components of the cluster, such as Zeebe, Operate, Tasklist, and Optimize.                                                                                                                                                 |
| Jobs            | The jobs of all environments of the cluster for the last 24 hours: the number of jobs that were created, completed, and not completed. See the [job dashboard](https://docs.camunda.io/docs/next/components/hub/organization/analyze-operations/job-dashboard).                                                  |
| Connectors      | The health and version of the connector runtime. Click **Manage** to open [Connector Management](https://docs.camunda.io/docs/next/components/hub/organization/manage-clusters/manage-connectors).                                                                                                                                |

To monitor and manage the connectors that run on a cluster, see [manage your connectors](https://docs.camunda.io/docs/next/components/hub/organization/manage-clusters/manage-connectors).

---
Source: https://docs.camunda.io/docs/next/components/hub/organization/manage-clusters/index
