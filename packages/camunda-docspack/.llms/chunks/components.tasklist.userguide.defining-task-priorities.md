# Defining task priorities

Organize and order your tasks with clear prioritization.

You can add prioritization to [user task elements](https://docs.camunda.io/docs/next/components/modeler/bpmn/user-tasks/user-tasks) by specifying a priority value for a user task. This determines the task's importance in relation to other tasks within processes.

- The task priority is an **integer** value ranging from 0 to 100, with a default value of 50.
- A higher priority value indicates higher importance.

When displayed in Tasklist, priority values are mapped to the following default labels:

| Priority value | Default label |
| :------------- | :------------ |
| 0-25           | Low           |
| 26-50          | Medium        |
| 51-75          | High          |
| 76-100         | Critical      |

These labels give Tasklist users a clear view of task priority, making it easier to assess a task's urgency. This also makes sorting and filtering simple, helping users prioritize the most important tasks.

---
Source: https://docs.camunda.io/docs/next/components/tasklist/userguide/defining-task-priorities
