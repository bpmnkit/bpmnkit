# Recorded operations — Recorded operations — `DEPLOYED_RESOURCES` operations

You can audit user and client actions that modified or influenced deployed resources and dependent entities, like process instances, batch operations, and variables. With this, you can identify manual corrections and confirm the sequence of actions that led to a process failure or escalation.

These operations belong to the category `DEPLOYED_RESOURCES`. The following operations are recorded in the audit log:

| Operation type | Entity           | Tracked rejections              |
| :------------- | :--------------- | :------------------------------ |
| Create         | Process instance | –                               |
| Cancel         | Process instance | –                               |
| Modify         | Process instance | –                               |
| Migrate        | Process instance | INVALID_STATE, PROCESSING_ERROR |
| Create         | Variable         | –                               |
| Update         | Variable         | –                               |
| Resolve        | Incident         | INVALID_STATE                   |
| Create         | Resource         | –                               |
| Delete         | Resource         | –                               |
| Create         | Batch            | –                               |
| Suspend        | Batch            | INVALID_STATE                   |
| Resume         | Batch            | INVALID_STATE                   |
| Cancel         | Batch            | INVALID_STATE                   |
| Create         | Decision         | –                               |
| Delete         | Decision         | –                               |
| Evaluate       | Decision         | –                               |

For tasks with output mappings, the audit log shows changes made by those mappings. Unchanged variables aren't included. Variable audit entries don't include variable values.

#### Batch operations

While the operations for creating and managing batch operations are recorded in the audit log, the batch operation state changes aren't. For more information, learn how to [monitor batch operations](https://docs.camunda.io/docs/next/components/operate/userguide/monitor-batch-operations).

---
Source: https://docs.camunda.io/docs/next/components/audit-log/overview/recorded-operations
