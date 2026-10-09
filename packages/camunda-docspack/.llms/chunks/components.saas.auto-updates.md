# Auto-updates

Some updates are applied to SaaS clusters automatically.

Camunda 8 SaaS customers can enable auto-updates. When enabled, the cluster is updated once a new patch release is available.

You can enable auto-updates when you [create a cluster](https://docs.camunda.io/docs/next/components/hub/organization/manage-clusters/create-cluster) or in the **Settings** tab:

1. In Camunda Hub, in the left navigation under **Clusters**, select your cluster.
2. In the **Settings** tab, enable **Automatic cluster patch updates**.

Depending on your [role](https://docs.camunda.io/docs/next/components/hub/organization/manage-users/index), this option may be disabled.

For Camunda 8 SaaS, auto-updates are only for patch releases (x.y.**z**, where **z** is a patch release).

Auto-updates are only applied when a cluster is running. If a cluster is sleeping during the update cadence, the auto-update is not applied automatically. However, the update is still available for a manual update in Camunda Hub.

Minor updates (x.**y**.z, where **y** is a minor release) are not eligible for auto-updates and require manual steps to initiate. Depending on your [role](https://docs.camunda.io/docs/next/components/hub/organization/manage-users/index), you may see that an update is available, but no **Update cluster** button. Contact your organization owner or admin to update your cluster.

---
Source: https://docs.camunda.io/docs/next/components/saas/auto-updates
