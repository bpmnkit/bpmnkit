# Get started with human task orchestration — Step 5: Complete a user task

When the process instance arrives at the user task, a new user task instance is created at Zeebe. The process instance stops at this point and waits until the user task is completed. Applications like [Tasklist](https://docs.camunda.io/docs/next/components/tasklist/introduction-to-tasklist) can be used by humans to complete these tasks. In this last step, you will open Tasklist to run the user task you created.

**Tip**
While it may originally seem like the goal of automating a process is to remove humans entirely, efficiently allocating work through user tasks can be even more beneficial. Within this example, we've included a form to demonstrate the completion of a user task.

Using the Zeebe or Tasklist API, many other ways to complete a user task are possible, such as redirecting to another application to complete the task, or even listening to IoT devices to capture human interaction with the real world via job workers.

### saas

1. In the top navigation, on the far left side next to **Operate**, click the **Camunda components** menu icon.
1. Click **Tasklist**.

### sm

1. Open Tasklist at `http://localhost:8080/tasklist`.

In Tasklist:

1. On the left, you will notice a list of **tasks**. There should be one open task `Decide what's for dinner`. Click this task to open it in the detail view.
1. In the detail view, the form you created in **[Step 2](#step-2-design-a-form)** appears. It is read only since this task is currently unassigned. You have to claim the task to work on it. Click **Assign to me** to claim the task.
1. Select one of the radio options.
1. Click **Complete Task** to submit the form.

   ![complete a human task in Tasklist](./img/user-task-tasklist.png)

1. To verify your task completion, you can filter by **Completed** tasks in the left task list panel.

You can now navigate back to Operate and notice the process instance has continued as the token has moved forward to the selected option.

The token moves through the exclusive gateway (also called the XOR gateway), and is used to model the decision in the process. When the execution arrives at this gateway, all outgoing sequence flows are evaluated in the order in which they have been defined. The sequence flow which condition evaluates to ‘true’ is selected for continuing the process.

In this case, the token will move through the gateway and (according to the conditional expressions we outlined earlier) to the selected dinner based on the **Decide what's for dinner** user task we completed. If we select **Chicken**, the token moves forward to **Prepare chicken**. If we select **Salad**, the token moves forward to **Prepare salad**.

![Operate showing the completed process instance](./img/completed-task.png)

---
Source: https://docs.camunda.io/docs/next/guides/getting-started-orchestrate-human-tasks
