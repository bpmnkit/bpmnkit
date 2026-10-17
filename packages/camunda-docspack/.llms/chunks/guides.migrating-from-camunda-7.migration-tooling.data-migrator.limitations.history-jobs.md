# Limitations — History — Jobs

The History Data Migrator migrates only jobs of type [asynchronous continuation](https://docs.camunda.org/manual/7.24/user-guide/process-engine/transactions-in-processes/#configure-asynchronous-continuations).

- Jobs associated with multi-instance activities are skipped. (https://github.com/camunda/camunda-7-to-8-migration-tooling/issues/1103)
- Jobs whose corresponding Camunda 7 historic activity instance was never persisted are skipped. This happens for async-before activities that fail on all available retries before the activity is entered, so no `elementInstanceKey` can be resolved. Camunda 8.10 enforces non-nullability on `elementInstanceKey`; previously these jobs were migrated with a null value. The skip is recorded in the skip log with a reason.

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/limitations
