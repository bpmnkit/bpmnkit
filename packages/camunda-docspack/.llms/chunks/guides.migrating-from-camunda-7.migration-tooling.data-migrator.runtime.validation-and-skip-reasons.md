# Runtime — Validation and skip reasons

The migrator validates each process instance before migration and will skip instances that fail validation for the following reasons:

| Skip reason                           | Condition (why it is skipped)                                                                                    |
| :------------------------------------ | :--------------------------------------------------------------------------------------------------------------- |
| Missing Camunda 8 process definition  | No corresponding Camunda 8 process definition is found for the Camunda 7 process ID.                             |
| Multi-instance activities             | The process instance has active multi-instance activities.                                                       |
| Missing flow node elements            | The Camunda 7 instance is at a flow node that does not exist in the deployed Camunda 8 model.                    |
| Missing None Start Event              | The Camunda 8 process definition does not have a process-level None Start Event.                                 |
| Missing `migrator` execution listener | The Camunda 8 process definition does not have an execution listener of type `migrator` on the None Start Event. |
| Multi-tenancy                         | The tenant ids are not configured in the Data Migrator.                                                          |

When a process instance is skipped:

- The skipped process instance is logged.
- The instance is marked as skipped in the migration database.
- You can list skipped instances.
- You can retry migration of skipped instances after fixing the underlying issues.

### Common resolution steps

1. Deploy the missing Camunda 8 process definition
1. Wait for multi-instance activities to complete
1. Ensure all active flow nodes in the Camunda 7 process have corresponding elements in the Camunda 8 process
1. Modify process instance to a supported state

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/runtime
