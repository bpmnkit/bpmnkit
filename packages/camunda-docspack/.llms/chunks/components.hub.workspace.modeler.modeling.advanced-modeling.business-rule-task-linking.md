# Business rule task linking

Use one of the following approaches to link the DMN decision to be called by a business rule task.

You can use either of the following approaches to link the DMN decision to be called by a [business rule task](https://docs.camunda.io/docs/next/components/modeler/bpmn/business-rule-tasks/business-rule-tasks).


## Using the link button

1. Select a business rule task from the canvas. A link icon appears in the floating menu.
2. Click the link icon, and choose any decision from the same project.
3. Click **Link** to complete the linking process. In the properties panel on the right side of the screen, the value **DMN decision** is chosen for the **Implementation** property, and the Decision ID of the decision you chose to link is automatically copied to the **Called decision** section.

**Note**
For business rule tasks that are already linked, clicking on the link icon opens a dialog which shows the name of the decision the business rule task is linked to. It is possible to navigate to the linked decision by clicking on it, or you can use the **Unlink** button to remove the link.

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/modeling/advanced-modeling/business-rule-task-linking
