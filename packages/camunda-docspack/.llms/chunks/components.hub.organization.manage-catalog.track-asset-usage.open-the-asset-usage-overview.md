# Track catalog asset usage — Open the asset usage overview

To review adoption across your organization:

1. In Camunda Hub, in the left navigation, select **Catalog**.
2. On the **Organization catalog** page, select the **Asset usage** tab.

The **Browse assets** tab shows the same catalog your delivery teams see. The **Asset usage** tab is visible to organization administrators and owners only and adds the governance view described here.


## Asset status values

Camunda Hub derives a status for every catalog asset from the versions currently referenced in diagrams:

| Status               | Meaning                                                                                                                                                                                          |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Unused**           | The asset is not used in any diagram.                                                                                                                                                            |
| **Deprecated**       | The asset is used in at least one diagram, and it's [unpublished](https://docs.camunda.io/docs/next/components/hub/organization/manage-catalog/manage-asset-lifecycle#unpublish-an-asset) or its latest version is deprecated. |
| **Update available** | The asset is used in at least one diagram, and at least one diagram references a version older than the latest version.                                                                          |
| **Up to date**       | The asset is used in at least one diagram, and every diagram that references it uses the latest version.                                                                                         |

The same four values are used in the usage table, the usage drawer, and the project tile.

**Note**
**Deprecated** takes priority over the version comparison. An unpublished asset that is still in use is reported as **Deprecated**, even if some diagrams already use its latest version.

Unpublished assets remain in the usage table even though delivery teams can no longer discover them while browsing, so you keep visibility into the remaining usage you need to migrate away.

---
Source: https://docs.camunda.io/docs/next/components/hub/organization/manage-catalog/track-asset-usage
