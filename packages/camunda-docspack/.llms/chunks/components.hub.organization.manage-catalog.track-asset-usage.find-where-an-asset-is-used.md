# Track catalog asset usage — Find where an asset is used

Select any row in the **Asset usage** table to open a drawer on the right showing where that asset is used.

The drawer header repeats the asset name as a link to its catalog detail page, shows the asset status, and summarizes the reach of the asset, for example `Used in 7 projects across 3 workspaces.`

Below the header, usage is grouped by the asset version in use. Each version group shows:

- The version number, for example `v3`.
- Either a **Latest** marker or an **Update available** badge. A group for any version other than the latest always means those projects have an update available.
- The number of projects using that version.

Each entry in a group lists the **Project** and the **Workspace** it belongs to, both linking to the corresponding page in Camunda Hub. Select **Load more** to fetch additional entries.

If an asset has no usage, the drawer shows **Unused**.

### How permissions affect the results

Because the **Asset usage** tab is limited to organization administrators and owners, the drawer shows every project in your organization that uses the asset, across all workspaces, including workspaces you aren't a member of.

---
Source: https://docs.camunda.io/docs/next/components/hub/organization/manage-catalog/track-asset-usage
