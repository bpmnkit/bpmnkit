# Create a cluster

Learn how to create a cluster and view its details.

To deploy and run your process, you must create a [cluster](https://docs.camunda.io/docs/next/components/concepts/clusters) in Camunda 8.


## Create a cluster

To create a cluster in SaaS:

1. In Camunda Hub, in the left navigation under **Console**, click **Clusters**.
1. Click **Create cluster**.
1. Name your cluster.
1. Select your [region](https://docs.camunda.io/docs/next/components/saas/regions).
1. Select a [cluster type](https://docs.camunda.io/docs/next/components/concepts/clusters#cluster-type) and [cluster size](https://docs.camunda.io/docs/next/components/concepts/clusters#cluster-size).
1. Assign a cluster tag to indicate what type of cluster it is.
1. Select your [encryption at rest protection level](https://docs.camunda.io/docs/next/components/saas/encryption-at-rest) (enterprise only).
1. Select a channel and release. For the purpose of this guide, we recommend using the **Stable** channel and the latest generation.
1. If you are using a generation of version 8.8 or higher, select if you want to enable [authorization-based access control](https://docs.camunda.io/docs/next/components/concepts/access-control/authorizations).
1. Click **Create cluster**.
1. Your cluster will take a few moments to create. Check the status on the **Clusters** page or by clicking into the cluster itself and looking at the **Applications** section.

If you haven't created a cluster yet, the **Clusters** page will be empty. You can start modeling even if the cluster shows a **Creating** status.

![cluster-creating-modal](./img/cluster-creating-modal.png)

**Tip**
In Self-Managed, review the [cluster configuration properties](https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/properties#clusters).

---
Source: https://docs.camunda.io/docs/next/components/hub/organization/manage-clusters/create-cluster
