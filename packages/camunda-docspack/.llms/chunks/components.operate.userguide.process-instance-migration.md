# Migrate process instances

Migrate process instances from one process version to another using the process instance migration feature.

Learn how to migrate process instances from one process definition version to another in Camunda 8 Operate.


## Before you begin

Before you try to migrate process instances, learn about the [limitations](https://docs.camunda.io/docs/next/components/concepts/process-instance-migration#limitations) of process instance migration.


## Select process instances

1. From the **Processes** page, select a specific process and version from the **Filter** panel. For detailed guidance on filtering, see [filter process instances](https://docs.camunda.io/docs/next/components/operate/userguide/filter-process-instances). This will be the source process version where instances are migrated from.
2. Select all instances from the **Process Instances** table that should be migrated to another process version.
3. Click **Migrate** to enter the migration view.
4. In the modal, click **Continue**.

The migration view features three areas: the source process diagram (top left), the target process diagram (top right) and the element mapping (bottom panel).

![The migration view showing the source and target process diagrams at the top, and the source-to-target element mapping table below.](./img/process-instance-migration.png)

---
Source: https://docs.camunda.io/docs/next/components/operate/userguide/process-instance-migration
