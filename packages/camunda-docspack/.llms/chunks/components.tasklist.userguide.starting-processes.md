# Starting processes

How to start a process from Tasklist.

You can start processes on demand using Tasklist. To do this, click **Processes** in the navigation menu. All the processes you have access to start are listed on the **Processes** page.

![tasklist-processes](img/tasklist-processes.png)

In the **Search** box, search for the process definition ID of the process you want to start.

![tasklist-processes-search](img/tasklist-processes-search.png)

Tasklist no longer supports the legacy V1 process filters that were available during the migration period before 8.10.

To start a process, click **Start process** on the process you want to start.

![tasklist-processes-start](img/tasklist-processes-start.png)

If the start event of this process contains a [linked or embedded Camunda Form](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/modeling/advanced-modeling/form-linking), a modal window containing that form will automatically open.

![tasklist-processes-start-with-form](img/tasklist-processes-start-with-form.png)

Tasklist will then wait for the process to be executed. If the process generates a task, you will be redirected to the generated task.

**Info**

To share a process that has a start form with users inside your organization, but not with external users, click **Copy link** ![Copy link button](img/tasklist-processes-share-button.png) in the start process dialog to copy a link to the process. This link will only be accessible to users that already have access to Tasklist.

---
Source: https://docs.camunda.io/docs/next/components/tasklist/userguide/starting-processes
