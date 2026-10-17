# Get started with human task orchestration — Step 1: Create a new process — sm

1. A **start event** is automatically added to the canvas. Click it to display configuration and append options.
2. Click the rectangular **Append Task** icon to append a task.
3. In the right properties panel, enter a descriptive name for the task, such as `Decide what's for dinner`. If the properties panel for your task doesn't open automatically, navigate to **Window > Toggle Properties Panel** to open it manually.
4. Change the task type by clicking on the element and selecting the **Change element** menu icon. Select **User Task**.
5. Select the user task and click on the diamond-shaped icon to append an exclusive gateway. The gateway allows you to route the process flow differently, depending on conditions.
6. Select the gateway and append a task by clicking the task icon. Repeat it to create a second process flow. Name the tasks based on what the user decides to eat: in this case, we've named ours `Prepare chicken` and `Prepare salad`.
7. To route the user to the right task, add [expressions](https://docs.camunda.io/docs/next/components/concepts/expressions) to the **sequence flows**. Sequence flows are represented by arrows connecting the gateway to the tasks. To add an expression, click on a sequence flow to view the **properties panel**, and open the **Condition** section.
8. Verify the sequence flows have the following expressions: `meal="Chicken"` on one side, and `meal="Salad"` on the other. You will define the variable `meal` later when designing a form for the user task.

   

9. Connect the split process flows again. Append another exclusive gateway to one of the tasks. Select the other task and drag the arrow-shaped sequence flow tool to connect it to the gateway.
10. Select the gateway and add an **end event** to your process, denoted by the circle with the thick outline.

---
Source: https://docs.camunda.io/docs/next/guides/getting-started-orchestrate-human-tasks
