# Form linking

Use one of the following approaches to link a form to a user task or none start event.

You can use one of the following approaches to link a form to a [user task](https://docs.camunda.io/docs/next/components/modeler/bpmn/user-tasks/user-tasks) or a [none start event](https://docs.camunda.io/docs/next/components/modeler/bpmn/none-events/none-events#none-start-events).

**Tip**
By linking a Camunda Form to a start event, process instances can be started directly [in Tasklist](https://docs.camunda.io/docs/next/components/tasklist/userguide/starting-processes) or through your own application built on the [Orchestration Cluster REST API](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/orchestration-cluster-api-rest-overview).


## Using the link button

1. Select a user task or none start event from the canvas. A link icon appears in the floating menu.
2. Click the link icon, and choose any form from the same project.
3. Click **Link** to complete the linking process. In the properties panel on the right side of the screen, the value **Camunda Form (linked)** is chosen for the **Type** property, and the form ID of the form you chose to link is automatically copied to the **Form ID** section.

For user tasks/start events that are already linked, clicking the link button opens a dialog which shows a preview of the form the user task is linked to.
It is possible to navigate to the linked form by clicking on it. You can use the **Unlink** button to remove the link.

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/modeling/advanced-modeling/form-linking
