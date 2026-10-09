# RDBMS troubleshooting and operations — Post-deployment operations

These operations are officially supported on running Camunda clusters:

### Database password rotation

Password rotations are safe:

1. Update the password in your RDBMS.
2. Update the Kubernetes secret:

```bash
kubectl patch secret camunda-db-secret \
  -p '{"data":{"db-password":"'$(echo -n 'new-password' | base64)'"}}' \
  -n camunda
```

3. Restart the Orchestration Cluster pods:

```bash
kubectl rollout restart deployment/camunda-orchestration -n camunda
```

### JDBC driver updates

Updating bundled drivers or replacing custom drivers:

1. For custom drivers via init container: Update the JAR source in your Helm values.
2. For bundled drivers: Update the Camunda version.
3. Redeploy:

```bash
helm upgrade camunda camunda/camunda-platform -f values.yaml -n camunda
```

See [JDBC driver management](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/rdbms-jdbc-drivers#jdbc-driver-updates).

### Schema validation

Verify schema integrity after upgrades or restores:

```sql
-- PostgreSQL: Count expected tables
SELECT COUNT(*) FROM information_schema.tables
 WHERE table_schema = 'public'
 AND (table_name LIKE 'zeebe_%' OR table_name LIKE 'process_%');

-- Oracle: Count expected tables
SELECT COUNT(*) FROM user_tables
 WHERE table_name LIKE 'ZEEBE_%' OR table_name LIKE 'PROCESS_%';
```

Expect roughly 20-30 tables depending on your Camunda version.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/rdbms-troubleshooting
