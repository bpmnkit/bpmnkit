# Validate RDBMS connectivity — Verify the RDBMS exporter is running and flushing

### Exporter log indicators

Search Orchestration Cluster logs for exporter startup:

```bash
kubectl -n camunda logs deploy/orchestration | grep -E "RdbmsExporter|RDBMS Exporter"
```

Successful startup includes lines similar to:

```pgsql
[TIMESTAMP] INFO io.camunda.exporter.rdbms.RdbmsExporter - [RDBMS Exporter] RdbmsExporter created with Configuration: flushInterval=PT0.5S, queueSize=1000
[TIMESTAMP] INFO io.camunda.exporter.rdbms.RdbmsExporter - [RDBMS Exporter] Exporter opened with last exported position 126
```

### Confirm exporter progress in the database

Query the exporter position table and confirm values update over time.

PostgreSQL:

```sql
SELECT partition_id, exporter, last_exported_position
FROM exporter_position
ORDER BY partition_id;
```

MySQL/MariaDB:

```sql
SELECT PARTITION_ID, EXPORTER, LAST_EXPORTED_POSITION
FROM EXPORTER_POSITION
ORDER BY PARTITION_ID;
```

Oracle:

```sql
SELECT partition_id, exporter, last_exported_position
FROM exporter_position
ORDER BY partition_id;
```

Exporter progress is the most reliable “is it working” signal. If `last_exported_position` never advances after you generate workload, inspect exporter logs and database permissions.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/validate-rdbms
