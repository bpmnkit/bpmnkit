# Introduction to task applications — Tasklist layout — Task page

The task page lists all tasks pending for a user or user group, and allows users to pick and claim a task from that queue to work on. On the same page, the details of a selected task are displayed including the form that the user must submit in order to execute and complete the task. The task page is optimized for efficient workflows, where the most important tasks should be worked on first.

The task page is divided into two main areas:

- Left side showing the tasks queue.
- Right side showing the details of the selected task.

#### Tasks queue

The **tasks queue side panel** lists all tasks pending for a user or user group. It comes with filter and sort options that allow users to identify the right task to work on next. The tasks can be sorted by the creation date, due date, follow-up date, or priority.

Learn more how to work with the task queue in the [Tasklist user guide](https://docs.camunda.io/docs/next/components/tasklist/userguide/using-tasklist).

#### Task details

Task details are shown when a task is selected from the queue. A [form](https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/utilize-forms) is displayed as the task content, which must be filled out to complete the task.

**Tip**
Typically, a task application utilizes forms to capture information from the user, to make a decision, to collect the results from a real-world task, or to provide task instructions to the user.

However, a [user task](https://docs.camunda.io/docs/next/components/modeler/bpmn/user-tasks/user-tasks#user-task-forms) is not limited to forms. A user task could also represent navigating to an external desktop or web application, where a task is to be performed, such as updating a record in a CRM. You can even use them to track physical work or actions using sensors, IoT devices, or any interface that can talk to the web, by using the [Orchestration Cluster REST API](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/orchestration-cluster-api-rest-overview).

For these cases, utilize the flexible [custom form key](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/modeling/advanced-modeling/form-linking#custom-form-key).

On the top of the form, a header shows the title of the task to work on, and the current assignee. Depending on the status of the assignment, a button allows you to assign the task to yourself or release it to the queue.

At the bottom of the form there is a button with which you can complete the task.

To the right of the task, you find additional information about the task, such as the [due date](https://docs.camunda.io/docs/next/components/modeler/bpmn/user-tasks/user-tasks#scheduling) of the task, or the authorization data that controls who can work on the task.

Potential extensions are dependent on your use case. You can consider adding more buttons to the bottom of the panel to indicate different task outcomes such as "approve" or "reject", or you could add a list of attachments to the right panel.

Learn more how to work with the task details panel in the [Tasklist user guide](https://docs.camunda.io/docs/next/components/tasklist/userguide/using-tasklist).

---
Source: https://docs.camunda.io/docs/next/apis-tools/frontend-development/01-task-applications/01-introduction-to-task-applications
