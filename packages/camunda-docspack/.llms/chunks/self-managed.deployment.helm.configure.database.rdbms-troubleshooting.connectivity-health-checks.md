# RDBMS troubleshooting and operations — Connectivity health checks

After deployment, verify the cluster is healthy:

1. **Check pod readiness:**

```bash
kubectl get pods -n camunda | grep orchestration
```

2. **Check exporter logs:**

```bash
kubectl logs <pod-name> | grep RdbmsExporter
```

3. **Verify table creation:**

```sql
SELECT COUNT(*) FROM zeebe_process;
```

4. **Deploy a test process** and verify it appears in the database.

For a complete post-deployment checklist, see [validate RDBMS connectivity](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/validate-rdbms).


## Transaction isolation levels

This section applies to:

- Microsoft SQL Server
- Azure SQL Database

SQL Server and Azure SQL Database use lock-based behavior for the `READ COMMITTED` isolation level by default. Under high concurrent load, this can increase deadlock frequency in Camunda workloads.

Example deadlock error:

> com.microsoft.sqlserver.jdbc.SQLServerException: An error occurred during the current command (Done status 0). Transaction (Process ID 83) was deadlocked on lock resources with another process and has been chosen as the deadlock victim. Rerun the transaction.

If you observe this deadlock pattern in your MSSQL installation, enable `READ_COMMITTED_SNAPSHOT` on the Camunda database:

```sql
ALTER DATABASE [database-name]
SET READ_COMMITTED_SNAPSHOT ON;
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/rdbms-troubleshooting
