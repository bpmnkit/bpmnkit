# User task authorization — How Tasklist evaluates permissions

Tasklist relies on the Orchestration Cluster authorization model to control access to user tasks.

Permissions are evaluated in two layers:

1. Process-level permissions on the `Process Definition` resource (`READ_USER_TASK`, `CLAIM_USER_TASK`, `COMPLETE_USER_TASK`, and `UPDATE_USER_TASK`).
2. Task-level permissions on the `USER_TASK` resource (`READ`, `UPDATE`, `CLAIM`, and `COMPLETE`), often combined with property-based access control on `assignee`, `candidateUsers`, and `candidateGroups`.

When both layers are configured, process-level permissions take precedence:

- If a user already has the required process-level permission on `Process Definition` for an operation (for example, `READ_USER_TASK`, `CLAIM_USER_TASK`, `COMPLETE_USER_TASK`, or `UPDATE_USER_TASK`), Tasklist does not require or evaluate additional `USER_TASK` permissions for that operation.
- If the user does not have sufficient process-level permissions, Tasklist evaluates `USER_TASK` permissions instead, including property‑based authorizations based on task properties.

---
Source: https://docs.camunda.io/docs/next/components/tasklist/user-task-authorization
