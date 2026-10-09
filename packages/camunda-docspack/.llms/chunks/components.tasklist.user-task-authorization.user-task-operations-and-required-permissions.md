# User task authorization — User task operations and required permissions

The following table shows which permissions are required to perform common user task operations in Tasklist.

The table reflects currently-implemented permissions that are enforced by Tasklist.

| Operation                                 | `USER_TASK` permission | `PROCESS_DEFINITION` permission            |
| ----------------------------------------- | ---------------------- | ------------------------------------------ |
| Get user task (by key)                    | `READ`                 | `READ_USER_TASK`                           |
| Search user tasks                         | `READ`                 | `READ_USER_TASK`                           |
| Get user task form                        | `READ`                 | `READ_USER_TASK`                           |
| Claim task                                | `CLAIM`                | `CLAIM_USER_TASK` or `UPDATE_USER_TASK`    |
| Unassign task                             | `UPDATE`               | `UPDATE_USER_TASK`                         |
| Assign task (override assignee)           | `UPDATE`               | `UPDATE_USER_TASK`                         |
| Complete task (with or without variables) | `COMPLETE`             | `COMPLETE_USER_TASK` or `UPDATE_USER_TASK` |
| Update user task                          | `UPDATE`               | `UPDATE_USER_TASK`                         |

**Note**
Some operations listed in the table (for example, task reassignment) may not yet be available in the Tasklist UI.

---
Source: https://docs.camunda.io/docs/next/components/tasklist/user-task-authorization
