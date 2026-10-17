# History — Atomicity

The History Data Migrator uses the configured Camunda 8 datasource for both the migration mapping schema and the migrated data. This ensures single-transaction atomicity for each entity migration.

### What is migrated atomically

Each entity migration writes multiple rows in a single transaction:

- Camunda 8 data: The migrated entity (for example, a user task, process instance, or variable)
- Child entities, when applicable (for example, decision instances and their related decisions, inputs, and outputs)
- Tracking information: A mapping from the Camunda 7 ID to the Camunda 8 key, used for resuming migrations and preventing duplicates

If an error occurs, the transaction is rolled back and no partial data is persisted. This prevents inconsistent states such as Camunda 8 data without tracking information (which can cause duplicates on retry) or orphaned child entities.

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/history
