# Delete resources

Let's delete process and decision definitions.

Learn how to delete a specific process or decision definition version in Camunda 8 Operate.


## Delete process definition

**Warning**
Deleting a process definition permanently removes it and has the following effects:

- All the deleted process definition's finished process instances will be deleted from the application.
- All decision and process instances referenced by the deleted process instances will be deleted.
- If a process definition contains user tasks, they will be deleted from [Tasklist](https://docs.camunda.io/docs/next/components/tasklist/introduction-to-tasklist).

To delete a process definition from the **Processes** page, take the following steps:

1. In the **Filter** panel, select a specific process version by filtering by process name and version. For detailed guidance on using filters, see [filter process instances](https://docs.camunda.io/docs/next/components/operate/userguide/filter-process-instances). Make sure the selected process definition version has no running instances, otherwise it is not possible to delete a process definition. You can [cancel or resolve running process instances](https://docs.camunda.io/docs/next/components/operate/userguide/basic-operate-navigation) from the process instances list or from the process instance detail page.

![The Processes page filter panel, with arrows pointing at the Process Name and Process Version fields.](./img/delete-resources-process-filters.png)

2. Click the **Delete** button at the top right.

![The Processes page for a selected process, with an arrow pointing at the Delete link next to the Process ID.](./img/delete-resources-process-button.png)

3. Confirm the delete operation by checking the checkbox and clicking **Delete**.

![A confirmation modal for deleting a process definition, with a warning about the impact of deletion and a checkbox to confirm the deletion.](./img/delete-resources-process-modal.png)
**Note**
A process definition that was deleted while it still had running instances (for example, using the [delete resource command](https://docs.camunda.io/docs/next/apis-tools/zeebe-api/gateway-service#deleteresource-rpc)) is [draining](https://docs.camunda.io/docs/next/components/concepts/resource-deletion#draining). Operate marks it with a **Draining** tag and removes it automatically once its last instance finishes. To see which instances are keeping it alive, open the definition and view its running instances.

---
Source: https://docs.camunda.io/docs/next/components/operate/userguide/delete-resources
