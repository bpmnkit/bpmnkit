# Migrate process instances — Select a target process version

Above the target process diagram, enter a target process into the **Target** box, and select a version from the dropdown. This will be the process version where all selected process instances are migrated to.


## Map source and target nodes

In the bottom panel, you can see a list of all service tasks from the source process.

1. Use the dropdowns to select a target element for each source element that should be part of the migration. It is currently only possible to map elements with migration [supported by Zeebe](https://docs.camunda.io/docs/next/components/concepts/process-instance-migration#supported-bpmn-elements).
2. (Optional) Click on an element in the diagram or on a source element row in the bottom panel to see how elements are mapped.
3. In the footer, click **Next** for a preview of the migration plan.

Now, you can see a preview of how elements are mapped and how many process instances are expected to be migrated.

---
Source: https://docs.camunda.io/docs/next/components/operate/userguide/process-instance-migration
