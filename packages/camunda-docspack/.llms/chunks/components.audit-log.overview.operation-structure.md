# Operation data structure

Learn how operation data from the audit log is presented in different contexts.

Learn more about how operation data from the audit log is presented in different contexts.


## Applications

Depending on the view you're using to access the audit log in [Operate](https://docs.camunda.io/docs/next/components/operate/userguide/audit-operations), [Admin](https://docs.camunda.io/docs/next/components/admin/audit-operations), or [Tasklist](https://docs.camunda.io/docs/next/components/tasklist/userguide/audit-task-history), you'll see a subset of the following operation details:

| Property       | Description                                                                 |
| :------------- | :-------------------------------------------------------------------------- |
| Status         | The status of the operation.                                                |
| Operation type | The type of operation applied.                                              |
| Entity type    | The type of entity the operation was applied to.                            |
| Entity key     | The key and name of the entity the operation was applied to, if applicable. |
| Parent entity  | The key and name of the parent entity, if applicable.                       |
| Related entity | The ID or name of the related entity, if applicable.                        |
| Details        | Details about the operation.                                                |
| Actor          | The user, client, agent, or MCP tool that applied the operation.            |
| Date           | The date and time at which the operation was applied.                       |

---
Source: https://docs.camunda.io/docs/next/components/audit-log/overview/operation-structure
