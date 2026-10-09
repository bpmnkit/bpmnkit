# Create a cluster — View the created cluster

After creating the cluster, click **Environments** in the left navigation, and then click **Clusters** to view the new entry.

The cluster is now being set up. During this phase, its state is **Creating**. After one or two minutes, the cluster is ready for use and changes its state to **Healthy**.

After the cluster is created, click the cluster name to open the cluster details.


## Tag your cluster

A cluster tag represents the lifecycle phase of the cluster. Tag your cluster as `dev`, `test`, `stage`, or `prod`:

1. In the left navigation, click **Environments**, click **Clusters**, and then select your cluster.
1. On the **Overview** tab under **Cluster Details**, click **Modify tag**.

Assigning a tag:

- Makes it easier for team members to distinguish between the lifecycle phases of your clusters.
- Shows the tag on each [environment](https://docs.camunda.io/docs/next/components/concepts/environments#environment-tags) of the cluster.
- Has no impact on performance and can be changed later in the cluster details section of the cluster overview page.
- Disables [authorization-based access control](https://docs.camunda.io/docs/next/components/concepts/access-control/authorizations) by default for `dev` and `test` clusters, and enables it for `stage` and `prod` clusters. You can change this setting during and after cluster creation.

See [clusters](https://docs.camunda.io/docs/next/components/concepts/clusters) for more details.

---
Source: https://docs.camunda.io/docs/next/components/saas/clusters/create-cluster
