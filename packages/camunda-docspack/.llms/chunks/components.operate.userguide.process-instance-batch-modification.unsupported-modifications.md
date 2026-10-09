# Move a batch of process instances — Unsupported modifications

Some elements do not support specific modifications:

- **Move** modifications are not possible for the following types of elements:
  - Start events
  - Boundary events
  - Events attached to event-based gateways
- **Move** modification is not possible for a subprocess itself.


## Enter batch modification mode

1. On the **Processes** page, in the **Filter** panel, select the **Name** and **Version** of the process you want to modify. For detailed guidance on filtering, see [filter process instances](https://docs.camunda.io/docs/next/components/operate/userguide/filter-process-instances).
2. Select the element containing the process instances you intend to move.
3. In the **Process Instances** table, start selecting which instances you want to move. As you select instances, the process instance toolbar will appear and you will now see the **Move** action become available.
4. Once you are ready to continue, click **Move**. An information modal will appear indicating that you are switching to process instance batch move mode.
5. Click **Continue** and the UI will change to indicate that you entered batch modification mode. This is represented by a blue border, including a blue banner at the top and two buttons for applying or exiting modifications at the bottom.
6. You can now continue to select or deselect instances as needed. You can also discard all current selected instances by either clicking the **Discard** option in the process instance toolbar, or by clearing the current selection.

Exit the modification mode at any time by clicking **Exit** in the footer.

---
Source: https://docs.camunda.io/docs/next/components/operate/userguide/process-instance-batch-modification
