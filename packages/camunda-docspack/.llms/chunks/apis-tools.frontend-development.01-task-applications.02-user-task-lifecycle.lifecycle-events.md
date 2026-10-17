# User task lifecycle — Lifecycle events

Camunda emits lifecycle events that can be triggered by REST API operations. User task listeners react to them to execute custom logic. For details, see [user task listeners](https://docs.camunda.io/docs/next/components/concepts/user-task-listeners).

Supported events:

- `creating`
- `assigning`
- `updating`
- `completing`
- `canceling`

Lifecycle events represent engine-level transitions. Supported API calls can include an `action` value to add application-specific meaning to the resulting user task listener event. For example, your application can use actions such as `start`, `pause`, or `resume` to represent application-level work progress.

### `creating`

The `creating` event is emitted when a task instance is created. If the `creating` event already contains an assignee, no additional `assigning` event is fired.

### `assigning`

The engine emits the `assigning` event when a task assignment changes. The resulting event can include an `action` value, such as `claim`, `assign`, `return`, or `unassign`.

### `updating`

The engine emits the `updating` event when task data changes, except assignment changes. This can include changes to variables, candidate users, candidate groups, or other supported task fields.

The update API can also include an `action` value. Use this value to add application-specific meaning to the resulting event, such as `start`, `pause`, or `resume`.

### `completing`

The engine emits the `completing` event when a task is being completed. It can contain a custom action to indicate the outcome, such as `approved` or `rejected`.

### `canceling`

The engine emits the `canceling` event when a user task is terminated by the process. This happens when the process instance is canceled or an interrupting catch event ends the user task.

---
Source: https://docs.camunda.io/docs/next/apis-tools/frontend-development/01-task-applications/02-user-task-lifecycle
