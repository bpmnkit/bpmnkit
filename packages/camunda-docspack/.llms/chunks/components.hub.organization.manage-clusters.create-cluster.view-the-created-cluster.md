# Create a cluster — View the created cluster

After creating the cluster, you can view the new entry:

1. In the left navigation under **Console**, click **Clusters**.
1. The cluster is now being set up. During this phase, its state is **Creating**. After one or two minutes, the cluster is ready for use and changes its state to **Healthy**.

   ![cluster-creating](./img/cluster-overview-new-cluster-creating.png)

   ![cluster-healthy](./img/cluster-overview-new-cluster-healthy.png)

1. After the cluster is created, click the cluster name to visit the cluster detail page.


## Tag your cluster

You can tag your cluster for `dev`, `test`, `stage`, or `prod`:

1. In the left navigation under **Clusters**, select your cluster.
1. On the **Overview** tab under **Cluster Details**, click **Modify tag**.

Assigning a tag:

- Makes it easier for team members to clearly distinguish between different stages of the software development lifecycle.
- Has no impact on performance and can be changed later in the cluster details section of the cluster overview page.
- Disables [authorization-based access control](https://docs.camunda.io/docs/next/components/concepts/access-control/authorizations) by default for `dev` and `test` clusters, and enables it for `stage` and `prod` clusters. You can change this setting during and after cluster creation.

See [clusters](https://docs.camunda.io/docs/next/components/concepts/clusters) for more details.

---
Source: https://docs.camunda.io/docs/next/components/hub/organization/manage-clusters/create-cluster
