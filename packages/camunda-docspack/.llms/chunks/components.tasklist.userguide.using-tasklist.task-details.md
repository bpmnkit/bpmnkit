# Overview — Task details

Select a task from the list to view its details.

The task includes a form that has to be filled out and submitted to complete a task.

![tasklist-task-details-form](./img/tasklist-task-details-form.png "Task completion form")

If the task doesn’t have a form, it will display task variables.

![tasklist-with-variables-claimed-by-me](img/tasklist-with-variables-claimed-by-me_light.png "Task variables")

If the task captured a [business ID](https://docs.camunda.io/docs/next/components/concepts/process-instance-creation#business-id) from its process instance when it was created, it's also shown in the task details. A task created before its process instance had a business ID displays without one, even if the process instance is later assigned one.

### View process diagram

From the task detail page you can switch to the **Process** tab. This provides a visual representation of the BPMN diagram the task is part of, and may help you understand how an individual task fits into the larger workflow, what activities happened earlier, and what’s coming next.

![tasklist-process-diagram](./img/tasklist-task-details-process-diagram.png "Process diagram preview")

---
Source: https://docs.camunda.io/docs/next/components/tasklist/userguide/using-tasklist
