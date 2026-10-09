# Create a cluster

Learn how to create a cluster and view its details.

To deploy and run your process, you must create a [cluster](https://docs.camunda.io/docs/next/components/concepts/clusters) in Camunda 8. Every cluster you create in SaaS gets one [environment](https://docs.camunda.io/docs/next/components/concepts/environments) automatically, and you [assign it to a workspace](https://docs.camunda.io/docs/next/components/hub/organization/manage-environments/assign-environments) so teams can deploy to it.

**Note**
This page applies to Camunda 8 SaaS. For clusters in Self-Managed, see [clusters in Self-Managed](https://docs.camunda.io/docs/next/components/hub/organization/manage-clusters/index).


## Create a cluster

To create a cluster, click **Environments** in the left navigation of Camunda Hub, click **Clusters**, and then click **Create cluster**. Then complete the following steps:

1. Name your cluster.
1. Select your [region](https://docs.camunda.io/docs/next/components/saas/regions).
1. Select a [cluster type](https://docs.camunda.io/docs/next/components/saas/clusters#cluster-type) and [cluster size](https://docs.camunda.io/docs/next/components/saas/clusters#cluster-size).
1. Assign a cluster tag that represents the lifecycle phase of the cluster: `dev`, `test`, `stage`, or `prod`. See [tag your cluster](#tag-your-cluster).
1. Select your [encryption at rest protection level](https://docs.camunda.io/docs/next/components/saas/encryption-at-rest) (enterprise only).
1. Select a channel and a release. The channel decides which releases you can choose from:
   - The **Stable** channel provides generally available releases that are ready for most users. See the [stable channel](https://docs.camunda.io/docs/next/reference/announcements-release-notes/release-policy#stable-channel).
   - The **Alpha** channel provides alpha releases, which let you try the upcoming minor release and give feedback before it reaches the stable channel. See the [alpha channel](https://docs.camunda.io/docs/next/reference/announcements-release-notes/release-policy#alpha-channel).

   A release is identified by its [generation](https://docs.camunda.io/docs/next/reference/glossary#generation), the set of component versions that the cluster runs. See [generation names](https://docs.camunda.io/docs/next/reference/announcements-release-notes/release-policy#generation-names). For the purpose of this guide, we recommend using the **Stable** channel and the latest generation.

1. If you are using a generation of version 8.8 or higher, select if you want to enable [authorization-based access control](https://docs.camunda.io/docs/next/components/concepts/access-control/authorizations).
1. Click **Create cluster**.
1. Your cluster will take a few moments to create. Check the status on the **Clusters** page or by clicking into the cluster itself.

If you haven't created a cluster yet, the **Clusters** page will be empty. You can start modeling even if the cluster shows a **Creating** status.

![cluster-creating-modal](./img/cluster-creating-modal.png)

---
Source: https://docs.camunda.io/docs/next/components/saas/clusters/create-cluster
