# Access SQL and Liquibase scripts — How to download

- **From a GitHub release (ZIP):** Download the schema scripts from `https://github.com/camunda/camunda/releases/tag/<release version>/camunda-db-rdbms-schema-<release version>.zip`.
- **From a C8Run distribution:** Retrieve the schema scripts from the `rdbms-schema/` folder included in the distribution.


## Usage guidance

- **Version matching:** Always use scripts corresponding to your Camunda 8 version.
- **Database selection:** Use the folder for your target database (PostgreSQL, Oracle, MariaDB, MySQL, SQL Server, or H2).
- **Automatic schema management:** Camunda will manage the schema by default. Manual management requires disabling auto-DDL:

```yaml
camunda:
  data:
    secondary-storage:
      rdbms:
        auto-ddl: false
```

- **SQL vs. Liquibase:** Liquibase changelogs are **forward-only**. Rollbacks are not supported.

**Warning**
Do not mix SQL upgrade scripts with Liquibase-managed schema. Applying SQL scripts to a Liquibase-managed schema causes checksum mismatches and schema inconsistencies.

- **Liquibase lock recovery:** If a pod is interrupted during Liquibase execution, Camunda waits for stale DDL locks using `camunda.data.secondary-storage.rdbms.ddl-lock-wait-timeout` (default: `PT15M`). Increase this timeout for long-running migrations and only release `databasechangeloglock` manually after confirming no migration is running. See [RDBMS troubleshooting](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/rdbms-troubleshooting#liquibase-lock-after-pod-crash-or-restart).
- **Backup first:** Always [back up](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/backup-and-restore) your database before applying scripts manually.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/access-sql-liquibase-scripts
