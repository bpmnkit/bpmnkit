# User task authorization — Recommended authorization model

For Tasklist, the recommended authorization model combines:

- Process-level permissions to grant broad access to user tasks that belong to a process
- Task-level permissions for fine-grained access control on individual user tasks
- The default task worker role for common user task operations

With this approach, you can grant general access where appropriate while restricting access to specific tasks based on task properties, such as assignee or candidate groups.


## Authorization resources used by Tasklist

Tasklist evaluates user task authorization using the following authorization resources:

- `PROCESS_DEFINITION`: Controls access to user tasks that belong to a specific process definition
  (for example: `READ_USER_TASK`, `UPDATE_USER_TASK`, `CLAIM_USER_TASK`, `COMPLETE_USER_TASK`).
- `USER_TASK`: Controls access to individual user tasks using property-based access control.

For details about authorization resources, permission evaluation, and configuration, see
[Authorization concepts](https://docs.camunda.io/docs/next/components/concepts/access-control/authorizations).

---
Source: https://docs.camunda.io/docs/next/components/tasklist/user-task-authorization
