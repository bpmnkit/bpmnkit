# Operation data structure — Details

Some audit log entries contain extra details about the operation in the **details** field:

| Operation type | Entity type   | Details                            |
| :------------- | :------------ | :--------------------------------- |
| Create         | Batch         | Batch operation type               |
| Assign         | User task     | Assignee                           |
| Unassign       | User task     | Assignee                           |
| Create         | Authorization | Owner(entity type, entity name)    |
| Assign         | Tenant        | Assignee(entity type, entity name) |
| Unassign       | Tenant        | Assignee(entity type, entity name) |
| Assign         | Role          | Assignee(entity type, entity name) |
| Unassign       | Role          | Assignee(entity type, entity name) |
| Assign         | Group         | Assignee(entity type, entity name) |
| Unassign       | Group         | Assignee(entity type, entity name) |

---
Source: https://docs.camunda.io/docs/next/components/audit-log/overview/operation-structure
