# Defining task priorities — Step-by-step guide

This step-by-step guide shows you how to define task priorities for Tasklist users.

### 1. Model a BPMN process

Start by modeling your BPMN process in [Camunda Hub](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/index) or [Desktop Modeler](https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/index), ensuring that the required user tasks are defined within the process.

### 2. Set a priority for user tasks

During user task configuration you can specify a priority value. You can also define the value using an [expression](https://docs.camunda.io/docs/next/components/concepts/expressions).

The priority value determines the task's importance relative to other tasks.

![set-user-task-priority-in-modeler](img/modeler-user-task-priority.jpg)

### 3. Deploy and start the process

After the process is fully defined and all configurations are complete, the process can be deployed and started. The priority values are now associated with each user task within the process.

### 4. View task priority in Tasklist

Tasklist users can view the tasks assigned to them within their task list. Each task card displays the assigned priority label, ensuring users have a clear understanding of the task's importance and priority.

![Task cards showing priority labels in Tasklist](img/tasklist-tasks-with-priority.png)

### 5. Sort tasks by priority

Task users can sort tasks by priority. This helps users organize their workload by focusing on urgent items first.

![Sorting tasks by priority in Tasklist](img/tasklist-tasks-with-priority-sorting.png)

---
Source: https://docs.camunda.io/docs/next/components/tasklist/userguide/defining-task-priorities
