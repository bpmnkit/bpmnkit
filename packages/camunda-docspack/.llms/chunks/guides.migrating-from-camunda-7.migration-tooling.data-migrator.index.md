# Data Migrator

Overview of migrating Camunda 7 process data to Camunda 8 using the Data Migrator.

Use the Data Migrator to copy runtime and audit data from Camunda 7 to Camunda 8.

![data-migration](../../../img/data-migration.png)


## Modes of operation

The Data Migrator offers three modes of operation:

- [Runtime migration](https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/runtime): Migrate running process instances and continue execution in C8. Production-ready with Camunda 8.8.
- [History migration](https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/history): Copy audit (history) data to Camunda 8.
- [Identity migration](https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/identity): Migrate identity data to Camunda 8.

Migration details are summarized as follows:

| What is migrated                                                                                                                                                            | What is NOT migrated                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Running process instances (state-preserving).Process variables and their values.Execution history.Identity data. | BPMN process models (use the [Diagram Converter](https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/diagram-converter)).Custom code or integrations (use [Code Conversion Utilities](https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/code-conversion)).Users, groups (use IdP), and authorizations (use [Identity Migration](https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/identity)).Runtime task assignments and states (due date, priority, etc.). |

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/index
