# Operation data structure — Entity key

Some audit log entries contain extra details about the entity in the **entity key** field:

| Operation type | Entity type      | Entity key    |
| :------------- | :--------------- | :------------ |
| Create         | Process instance | Process name  |
| Delete         | Process instance | Process name  |
| Create         | Variable         | Variable name |
| Update         | Variable         | Variable name |
| Create         | Resource         | Resource name |
| Delete         | Resource         | Resource name |
| Create         | Decision         | Decision name |
| Delete         | Decision         | Decision name |

---
Source: https://docs.camunda.io/docs/next/components/audit-log/overview/operation-structure
