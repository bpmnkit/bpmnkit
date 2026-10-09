# RDBMS troubleshooting and operations

Troubleshoot common RDBMS connectivity issues, TLS configuration, and post-deployment operations.

This page covers troubleshooting common issues, TLS configuration, and post-deployment operations for RDBMS deployments. For configuration reference, see [configure RDBMS in Helm charts](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/rdbms).

**Note: Related pages**

- **[Validate RDBMS connectivity](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/validate-rdbms)** - Quick validation checklist with database client examples.
- **[Schema management](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/rdbms-schema-management)** - Schema creation and lifecycle.
- **[JDBC drivers](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/rdbms-jdbc-drivers)** - Managing database drivers.


## Connection failures

**Symptom:** Pod fails to connect to the database (connection timeout, connection refused).

**Diagnosis:**

1. Verify network connectivity from the pod to the database:

```bash
kubectl exec <pod-name> -- nc -zv database-hostname port
```

2. Check the JDBC URL in your configuration:

```bash
kubectl get secret camunda-db-secret -o jsonpath='{.data.<key>}' -n camunda | base64 -d
```

3. Verify the database is running and accepting connections.

**Fix:** Confirm the JDBC URL, hostname, port, and network policies allow traffic between pods and database.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/rdbms-troubleshooting
