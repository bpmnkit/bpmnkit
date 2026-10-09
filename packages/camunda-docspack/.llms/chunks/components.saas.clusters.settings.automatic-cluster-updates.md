# Manage cluster settings — Automatic cluster updates

You can set the cluster to automatically update to newer versions of Camunda 8 when they are released.

- Enable this setting to automatically update the cluster when a new patch release is available. During an update, the cluster may be unavailable for a short time. You can still manually update the cluster.
- Disable this setting if you do not want the cluster to automatically update. You must manually update the cluster.

**Tip**
For more information on updating clusters, see [update your cluster](https://docs.camunda.io/docs/next/components/saas/clusters/manage-cluster#update-a-cluster).


## Enforce user task restrictions

Starting with Camunda 8.10, this cluster setting is no longer available because user task access restrictions were removed together with Tasklist V1.

**Note**
Use [authorization-based access control](https://docs.camunda.io/docs/next/components/concepts/access-control/authorizations) and [user task authorization](https://docs.camunda.io/docs/next/components/tasklist/user-task-authorization) to control task visibility and operations in current Tasklist deployments.

---
Source: https://docs.camunda.io/docs/next/components/saas/clusters/settings
