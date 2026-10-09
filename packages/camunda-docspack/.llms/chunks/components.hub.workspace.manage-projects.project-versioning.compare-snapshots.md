# Manage and review project snapshots — Compare snapshots

You can compare any two project snapshots, including snapshots that are not next to each other in the timeline.

1. In your workspace, open a project.
2. On the right side of the project view, under **Project snapshots**, click **Show full list**.
3. On the right side of the **Snapshots** view, in the **Compare Snapshots** tab, select two snapshots you want to compare.

The comparison shows the older snapshot against the newer one, ordered by time regardless of the order you selected them. The selected pair is written to the URL, so you can share or bookmark a specific comparison.

The comparison lists every file present in either snapshot, with a status badge per file:

| Status        | Meaning                                                            |
| ------------- | ------------------------------------------------------------------ |
| **New**       | The file exists in the newer snapshot only.                        |
| **Removed**   | The file exists in the older snapshot only.                        |
| **Modified**  | The file content differs between the two snapshots.                |
| **Moved**     | The file changed location. A move summary is shown under its name. |
| **Unchanged** | The file content is identical in both snapshots.                   |

A file gets only one status badge, in this order of priority: **New**, then **Removed**, then **Modified**, then **Moved**, then **Unchanged**. For example, a file that was both moved and had its content changed shows as **Modified**, since the content change is the more significant one. Its move summary is still shown under its name.

For each file in the list, you can:

- Expand the row to view an inline diff of the file.
- Select the **Open file editor** icon to open the file.
- Select **Open version history** to open the [version history](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/modeling/versions) of the file.

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/manage-projects/project-versioning
