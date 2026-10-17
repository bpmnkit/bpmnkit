# Data Migrator — Key features

- Preserves the execution state of running process instances during migration.
- Maps Camunda 7 process instance `businessKey` to Camunda 8 `businessId`. This mapping is supported for both runtime and history migration.
- Converts and migrates process variables, decision inputs, and decision outputs with proper type handling.
- Supports customizable variable interceptors for both runtime and history migration contexts.
- Validates data before migration to help ensure a successful run.
- Allows you to skip or retry problematic instances during migration.
- Provides detailed logging and reporting to monitor migration progress.
- Supports multiple database vendors, including H2, PostgreSQL, and Oracle.

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/index
