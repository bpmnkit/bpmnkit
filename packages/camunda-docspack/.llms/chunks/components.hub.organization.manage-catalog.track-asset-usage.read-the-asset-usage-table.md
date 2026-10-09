# Track catalog asset usage — Read the asset usage table

Each row in the **Asset usage** table represents one catalog asset.

| Column           | Description                                                                                                  |
| ---------------- | ------------------------------------------------------------------------------------------------------------ |
| **Asset name**   | The name of the catalog asset.                                                                               |
| **Status**       | The asset status described in [Asset status values](#asset-status-values).                                   |
| **Workspaces**   | The number of distinct workspaces that use the asset.                                                        |
| **Projects**     | The number of distinct projects that use the asset.                                                          |
| **On latest**    | The ratio of projects using the latest version compared to projects using any version. For example, `3 / 7`. |
| **Last updated** | When the asset was last updated in the catalog.                                                              |

A project counts toward **On latest** only when _every_ usage of the asset within that project is on the latest version. A project with one outdated diagram is not counted, even if its other diagrams are current.

### Filter, search, and sort the table

Use the toolbar above the table to narrow the list:

- **Search catalog assets** matches against the asset name only.
- **Status** opens a checkbox list. Select any combination of **Up to date**, **Update available**, **Deprecated**, and **Unused**. Matching assets for any selected status are shown, and the trigger displays a count badge while a filter is active.
- **Sort by** offers sorting options:

| Sort option | Description                                                                                               |
| :---------- | :-------------------------------------------------------------------------------------------------------- |
| Name (A-Z)  | **(Default)** Order assets by name in ascending order (A-Z)                                               |
| Name (Z-A)  | Order assets by name in descending order (Z-A)                                                            |
| Newest      | Order assets by last updated date, newest first                                                           |
| Status      | Order assets by urgency: **Deprecated**, then **Update available**, then **Up to date**, then **Unused**. |

Changing the search, status filter, sort, or page size returns you to page 1. Table headers aren't sortable, and you can page through results with a page size of 20, 50, or 100.

---
Source: https://docs.camunda.io/docs/next/components/hub/organization/manage-catalog/track-asset-usage
