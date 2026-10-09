# Data Migrator — Typical choreography of runtime and history migration

As described in [the roll-out phase of the migration journey](https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-journey), you will typically use the following sequence of tasks when applying both data migrations (while keeping downtimes to a minimum):

**Warning: Configure the Camunda 8 datasource before your first migration**

If you plan to migrate both runtime and history data, configure the Camunda 8 datasource before running your first migration.

If the Camunda 8 datasource is not configured, the migrator creates the migration schema on the Camunda 7 datasource as a fallback. If you add the Camunda 8 datasource later, the migrator creates a new migration schema on Camunda 8, which resets migration tracking and can result in duplicate migrations.

```yaml
# Configure this before your first migration
camunda.migrator.c8.data-source:
  jdbc-url: jdbc:postgresql://localhost:5432/camunda8
  username: camunda
  password: camunda
```

1. Stop the Camunda 7 solution (normally shut down your application).
2. Start the Data Migrator in "running instance migration mode".
3. Wait until running instance migration is completed.
4. Start the new Camunda 8 solution immediately so migrated process instances can continue right away.
5. Start the Data Migrator in "history migration mode".
6. The migrator runs until all history data is migrated while Camunda 8 process execution continues in parallel.

With this approach, the duration of history migration doesn't block big bang migrations.

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/index
