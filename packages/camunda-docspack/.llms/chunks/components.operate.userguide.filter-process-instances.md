# Filter process instances

Learn how to filter process instances by variables and other properties using single and multi-variable filters.

Narrow down large lists of process instances using filters. Combine multiple variable filters with `AND` logic to find the exact instances you need.

**Note: Related pages**

- **[Delete finished instances](https://docs.camunda.io/docs/next/components/operate/userguide/delete-finished-instances)** — Use filters to select instances for deletion.
- **[Resolve incidents and update variables](https://docs.camunda.io/docs/next/components/operate/userguide/resolve-incidents-update-variables)** — Use filters to locate instances that need action.


## Filter panel

The **Filter** panel appears on the left side of the **Processes** page. Open it by clicking the **Filter** icon or expand existing filters to refine your instance list.

### Available filters

**Process filters**:

- **Finished Instances** — Completed or canceled instances
- **Process Name** — Filter by process definition name
- **Process Version** — Filter by process definition version
- **Parent Process Instance Key** — Filter by parent instance (for call activities)

**Instance filters**:

- **Batch Process Instance Key** — Filter by batch operation ID
- **Process Instance Key** — Filter by exact instance ID
- **Business ID** — Filter by domain-specific identifier (order number, case reference, etc.); see [business ID filter](#business-id-filter)

**Variable filters** (new in 8.10):

- **Variable Filters** — Filter by variable name, value, and comparison operators (see [multi-variable filters](#multi-variable-filters) below)

---
Source: https://docs.camunda.io/docs/next/components/operate/userguide/filter-process-instances
