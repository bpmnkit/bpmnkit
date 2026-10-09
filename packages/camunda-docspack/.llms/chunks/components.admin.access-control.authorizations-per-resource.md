# Access control — Authorizations per resource

The following authorizations are required to manage each User, Group, Role, Authorization, Mapping Rule, and Tenant resource:

| Authorization type                 | Resource type                                                     | Resource ID                                                                     | Permission                                  |
| :--------------------------------- | :---------------------------------------------------------------- | :------------------------------------------------------------------------------ | :------------------------------------------ |
| Create/Read/Update/Delete resource | One of `User`, `Group`, `Authorization`, `Mapping Rule`, `Tenant` | ID of the resource or `*` (for access to all resources and to create resources) | Any of `CREATE`, `READ`, `UPDATE`, `DELETE` |

---
Source: https://docs.camunda.io/docs/next/components/admin/access-control
