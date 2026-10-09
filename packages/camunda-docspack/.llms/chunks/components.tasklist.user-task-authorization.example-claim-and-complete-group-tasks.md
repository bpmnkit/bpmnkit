# User task authorization — Example: claim and complete group tasks

To allow users to work on tasks that are assigned to their group:

1. Grant the `READ_USER_TASK` permission on the `PROCESS_DEFINITION` resource for the relevant process.
2. Grant the `CLAIM` and `COMPLETE` permissions on the `USER_TASK` resource using the `candidateGroups` property.

This configuration allows users to see tasks for the process and claim or complete only those tasks for which they are listed as a candidate group member.


## Learn more

- [Authorization concepts](https://docs.camunda.io/docs/next/components/concepts/access-control/authorizations)

---
Source: https://docs.camunda.io/docs/next/components/tasklist/user-task-authorization
