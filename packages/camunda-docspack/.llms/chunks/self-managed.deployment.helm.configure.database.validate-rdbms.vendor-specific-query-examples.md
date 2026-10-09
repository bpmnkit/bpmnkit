# Validate RDBMS connectivity — Vendor-specific query examples

### PostgreSQL

```sql
\dt
SELECT partition_id, exporter, last_exported_position FROM exporter_position;
```

### MySQL/MariaDB

```sql
SHOW TABLES;
SELECT PARTITION_ID, EXPORTER, LAST_EXPORTED_POSITION FROM EXPORTER_POSITION;
```

### Oracle

```sql
SELECT table_name FROM user_tables;
SELECT partition_id, exporter, last_exported_position FROM exporter_position;
```


## What success looks like

- Orchestration Cluster pods reach `Ready` state.
- Logs show Liquibase initialization without errors.
- Logs show the RDBMS exporter created and opened with a last exported position.
- The database contains expected Camunda tables (for example `EXPORTER_POSITION`, `AUTHORIZATIONS`, `BATCH_OPERATION`).
- `last_exported_position` advances after generating workload.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/validate-rdbms
