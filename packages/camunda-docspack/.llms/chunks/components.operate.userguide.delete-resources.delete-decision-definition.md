# Delete resources — Delete decision definition

**Warning**
Deleting a decision definition will delete the DRD and will impact the following:

- Deleting a decision definition removes the DRD that contains it. All other decision tables and literal expressions that are part of the DRD will also be deleted.
- Deleting the only existing version of a decision definition could result in process incidents.

1. On the **Decisions** page, select a specific decision version by filtering by decision name and version. For detailed guidance on filtering, see [filter process instances](https://docs.camunda.io/docs/next/components/operate/userguide/filter-process-instances).

![The Decisions page filter panel, with arrows pointing at the Decision Name and Decision Version fields.](./img/delete-resources-decision-filters.png)

2. Click the **Delete** button at the top right.

![A selected decision definition's page, with an arrow pointing at the Delete link next to the Decision ID.](./img/delete-resources-decision-button.png)

3. Confirm the delete operation by checking the checkbox and clicking **Delete**.

![A confirmation modal for deleting a decision definition (DRD), with a warning about the impact of deletion and a checkbox to confirm the deletion.](./img/delete-resources-decision-modal.png)

---
Source: https://docs.camunda.io/docs/next/components/operate/userguide/delete-resources
