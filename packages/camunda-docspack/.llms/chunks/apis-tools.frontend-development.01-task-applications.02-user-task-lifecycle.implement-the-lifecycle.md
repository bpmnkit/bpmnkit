# User task lifecycle — Implement the lifecycle

Use the Orchestration Cluster REST API to implement task lifecycle operations in your application.  
See the [full API reference](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/orchestration-cluster-api-rest-overview).

### Perform lifecycle operations

You interact with user tasks through the following endpoints:

- Assign or unassign a task:
  - [`POST /user-tasks/:userTaskKey/assignment`](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/assign-user-task.api)
  - [`DELETE /user-tasks/:userTaskKey/assignee`](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/unassign-user-task.api)

- Update a task:
  - [`PATCH /user-tasks/:userTaskKey`](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/update-user-task.api)

- Complete a task:
  - [`POST /user-tasks/:userTaskKey/completion`](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/complete-user-task.api)

These operations trigger lifecycle events such as `assigning`, `updating`, and `completing`.

### Assign a task

Use the assignment endpoint to assign, reassign, or unassign a task.

- `POST /user-tasks/:userTaskKey/assignment` assigns or reassigns a task.
- `DELETE /user-tasks/:userTaskKey/assignee` removes the current assignee.

Use the `action` attribute to describe the reason for the change, such as `claim`, `assign`, or `reassign`.

### Update a task

Use the update endpoint to modify task data or provide an application-specific `action` value.

You can:

- Update fields such as candidate users, candidate groups, due date, or follow-up date using a `changeset`.
- Add application-specific meaning to the resulting event by providing an `action` value, such as `start`, `pause`, or `resume`.

You can also send custom actions for audit or business logic purposes, such as `escalate`, `requestFurtherInformation`, `uploadDocument`, or `openExternalApp`.

Example request:

```json
{
  "changeset": {
    "dueDate": "2024-03-18T20:47:20.340Z"
  },
  "action": "escalate"
}
```

### Complete a task

Use `POST /user-tasks/:userTaskKey/completion` to complete a task. You can include an `action` to indicate the outcome, such as `approve` or `reject`.

---
Source: https://docs.camunda.io/docs/next/apis-tools/frontend-development/01-task-applications/02-user-task-lifecycle
