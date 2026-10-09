# Schema creation and management — Upgrading the schema — Step 3: Verify schema initialization

Verify that Liquibase completed the schema migration successfully by checking logs:

```bash
kubectl logs <pod-name> | grep -i liquibase
```

Look for "Liquibase: Update successful" or similar completion messages. If the migration fails, Liquibase will log the
specific error.

You can also verify schema initialization by checking the `databasechangelog` table:

```sql
-- Verify Liquibase changelog table exists and contains entries
SELECT COUNT(*)
FROM databasechangelog;
```

This table should exist and contain entries for a fresh Camunda installation. On upgrades, this number increases as
new changesets are applied.

For troubleshooting, see [schema troubleshooting](#schema-troubleshooting).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/rdbms-schema-management
