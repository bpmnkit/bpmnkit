# Schema creation and management — Rolling upgrades

Rolling upgrades are available for RDBMS deployments that use Liquibase schema migration. For upgrade steps and optional
scaling guidance, see [automatic schema management](#step-2a-automatic-schema-management).

### Rollback

Camunda schema migrations are compatible with the previous version. This means that if you need to stop an upgrade and
roll back to a previous version, you can do so without any issues. The previous version will be able to read the schema
and continue processing.


## Schema troubleshooting

### Liquibase lock issues

If a previous schema migration failed, Liquibase may hold a lock.

Camunda waits for stale Liquibase DDL locks using `camunda.data.secondary-storage.rdbms.ddl-lock-wait-timeout` (default: `PT15M`).
For large schema changes, you can increase this timeout so a long-running migration is not treated as stale. See [RDBMS troubleshooting](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/rdbms-troubleshooting#liquibase-lock-after-pod-crash-or-restart).

Only release the lock manually after confirming no migration is currently running:

```sql
-- PostgreSQL/MariaDB: Release the lock
DELETE FROM databasechangeloglock WHERE locked = true;

-- Oracle: Connect as schema owner and release
DELETE FROM databasechangeloglock WHERE locked = 1;
```

Then redeploy.

### Permission errors during autoDDL

**Symptom:** Logs show "permission denied" or "cannot create table."

**Fix:** Verify database user has DDL permissions (see [database user permissions](#database-user-permissions) above).

### Out-of-sync schema

If your schema doesn't match the expected version:

1. Check Liquibase logs for failed migrations.
2. Restore from backup if necessary.
3. Manually apply missing SQL scripts from the [Liquibase scripts page](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/access-sql-liquibase-scripts).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/rdbms-schema-management
