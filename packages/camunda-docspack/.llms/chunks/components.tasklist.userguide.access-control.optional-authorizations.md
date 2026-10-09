# Access control — Optional authorizations

The following optional authorizations can also be defined:

| Authorization type                                                                                                                                    | Resource type        | Resource ID                                                                        | Permission                                                     |
| :---------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------- | :--------------------------------------------------------------------------------- | :------------------------------------------------------------- |
| View task history records.                                                                                                                            | `AUDIT_LOG`          | `USER_TASKS` or `*` for all categories.                                            | `READ`                                                         |
| Assign and complete user tasks                                                                                                                        | Process Definition   | ID of the respective BPMN process definition or `*` (for all process definitions). | `CLAIM_USER_TASK`, `COMPLETE_USER_TASK`, or `UPDATE_USER_TASK` |
| View BPMN diagrams                                                                                                                                    | Process Definition   | ID of the respective BPMN process definition or `*` (for all process definitions). | `READ_PROCESS_DEFINITION`                                      |
| View [`USER_TASKS` operations](https://docs.camunda.io/docs/next/components/audit-log/overview/recorded-operations#user_tasks-operations) for instances of a specific process definition. | `PROCESS_DEFINITION` | A process definition ID or `*` for all process definitions.                        | `READ_USER_TASK`                                               |
| View task history records related to specific tasks the user has access to based on task properties.                                                  | `USER_TASK`          | A user task property (`assignee`, `candidateUsers`, `candidateGroups`).            | `READ`                                                         |
| Authorization type                                                                                                                                    | Resource type        | Resource ID                                                                        | Permission                                                     |

---
Source: https://docs.camunda.io/docs/next/components/tasklist/userguide/access-control
