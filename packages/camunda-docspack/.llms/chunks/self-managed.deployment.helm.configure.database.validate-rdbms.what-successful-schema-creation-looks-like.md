# Validate RDBMS connectivity — What successful schema creation looks like

### Liquibase log indicator

Check Orchestration Cluster logs for Liquibase initialization:

```bash
kubectl -n camunda logs deploy/orchestration | grep -E "Liquibase|MyBatisConfiguration"
```

A successful run includes a line similar to:

```pgsql
[TIMESTAMP] [main] INFO io.camunda.application.commons.rdbms.MyBatisConfiguration - Initializing Liquibase for RDBMS with global table trimmedPrefix ''.
```

When Liquibase runs without errors, schema creation is considered successful. If `autoDDL` is disabled on an empty database, the exporter will fail because required tables do not exist.

### Confirm tables exist (SQL)

PostgreSQL:

```sql
\dt
```

MySQL/MariaDB:

```sql
SHOW TABLES;
```

Oracle:

```sql
SELECT table_name FROM user_tables;
```

If tables exist (for example `EXPORTER_POSITION`, `AUTHORIZATIONS`, `BATCH_OPERATION`), schema initialization succeeded.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/validate-rdbms
