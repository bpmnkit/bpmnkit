# Introduction to task applications — Task assignment

Every task can be assigned to either a group of people, or a specific individual. An individual can **claim** a task, indicating that they are picking the task from the pool (to avoid multiple people working on the same task).

As a general rule, you should assign user tasks in your business process to groups of people instead of specific individuals. This avoids bottlenecks (such as high workloads on single individuals or employees being on sick leave) and can greatly improve your process performance.

In the [XML of a user task](https://docs.camunda.io/docs/next/components/modeler/bpmn/user-tasks/user-tasks#xml-representations), this is represented as follows:

```xml
<bpmn:userTask id="task_review_loan">
  <bpmn:extensionElements>
    <zeebe:assignmentDefinition candidateGroups="Loan team" />
  </bpmn:extensionElements>
```

Then, require individual members of that group to explicitly claim tasks before working on them. This way, you avoid different people trying to work on the same task at the same time, which can cause a race condition.

---
Source: https://docs.camunda.io/docs/next/apis-tools/frontend-development/01-task-applications/01-introduction-to-task-applications
