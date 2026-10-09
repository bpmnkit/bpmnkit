# Configure RDBMS in Helm chart — Verifying connectivity

After deployment, verify the Orchestration Cluster is writing to the database:

1. Confirm tables were created:

```sql
-- PostgreSQL example
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public';
```

2. Deploy a process and start an instance using Camunda Hub or the REST API.

3. Query the database to confirm the instance was recorded:

```sql
SELECT * FROM process_instances;
```

4. Review logs for successful initialization:

```
INFO  io.camunda.exporter.rdbms.RdbmsExporter - RdbmsExporter created with Configuration: flushInterval=PT0.5S
INFO  io.camunda.exporter.rdbms.RdbmsExporter - Exporter opened with last exported position
```

For a complete post-deployment checklist, see [validate RDBMS connectivity (Helm)](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/validate-rdbms).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/rdbms
