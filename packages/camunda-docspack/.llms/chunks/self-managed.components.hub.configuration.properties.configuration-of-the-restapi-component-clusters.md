# Property reference — Configuration of the `restapi` component — Clusters

To show your Orchestration Clusters in Camunda Hub, use the following configuration options available from Camunda 8.10. If you're migrating from an older version of Camunda Self-Managed, refer to the deprecated [legacy configurations](https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/legacy-cluster-config) and the [migration guide](https://docs.camunda.io/docs/next/self-managed/upgrade/components/890-to-8100#camunda-hub).

The Camunda 8.10 Helm chart can deploy one Hub release with orchestration releases from supported chart versions:

| Hub chart | Orchestration chart | Topology mode   |
| :-------- | :------------------ | :-------------- |
| 8.10      | 8.10                | `orchestration` |
| 8.10      | 8.9                 | `orchestration` |
| 8.10      | 8.8                 | `orchestration` |
| 8.10      | 8.7                 | `orchestration` |

Set `global.topology.mode: orchestration` in each orchestration release. The 8.7, 8.8, and 8.9 charts don't support Hub mode or `global.topology.clusters`; configure the Hub release and cluster inventory with the 8.10 chart.

An orchestration release must disable its local Management Identity and set `global.identity.service.url` to the Management Identity service in the Hub release. Chart 8.7 uses separate Zeebe, Operate, and Tasklist components, so its Hub inventory must use the legacy component endpoints rather than the unified Orchestration Cluster endpoints.

#### Management Identity cluster

If `identity.enabled` is `true` for a Hub release, the Helm chart automatically adds a `management-cluster` entry named **Management Identity** to `camunda.hub.clusters`, containing only the Hub's own Management Identity component. This entry appears in the Clusters pages alongside your Orchestration Cluster registrations so Console and DevOps role holders can manage the Hub's Management Identity instance. You don't need to configure this entry manually, and it isn't affected by [dynamic cluster management](#dynamic-cluster-management).

**Note**
Access to the cluster pages in Camunda Hub depends on the user's role: `Console` and `DevOps` role holders (users with the [`admin:clusters` permission](https://docs.camunda.io/docs/next/self-managed/components/management-identity/access-management/access-management-overview#permissions)) get management access to the cluster pages, Hub admins (users with the [`admin:*` permission](https://docs.camunda.io/docs/next/self-managed/components/management-identity/access-management/access-management-overview#permissions)) get full access, and other Hub members get read-only access.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/properties
