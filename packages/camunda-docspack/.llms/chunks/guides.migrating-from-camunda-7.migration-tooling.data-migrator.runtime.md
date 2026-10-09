# Runtime

Migrate running Camunda 7 process instances to Camunda 8 while preserving state.

Migrate currently running process instances.


## About runtime migration

Running refers to process instances in Camunda 7 that are not yet ended and are currently waiting in a [wait-state](https://docs.camunda.org/manual/latest/user-guide/process-engine/transactions-in-processes/#wait-states). This state is persisted in the database, and a corresponding data entry must be created in Camunda 8 so the process instance can continue from that state in the new solution.

During runtime migration, the Data Migrator maps the Camunda 7 process instance `businessKey` to Camunda 8 `businessId`.
If no business key is present, the process instance is migrated without a business ID. If the business key is blank, it is migrated as a blank business ID.

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/runtime
