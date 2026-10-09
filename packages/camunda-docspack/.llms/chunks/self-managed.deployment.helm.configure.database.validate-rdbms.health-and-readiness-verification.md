# Validate RDBMS connectivity — Health and readiness verification

Pod readiness reflects database connectivity through a database health indicator. However, readiness alone does not confirm schema creation or exporter progress.

Use the following checks together:

Kubernetes readiness:

```bash
kubectl get pods -n camunda
```

Application health endpoint (if exposed):

```bash
kubectl -n camunda port-forward svc/orchestration 8080:8080
curl -sS http://localhost:8080/actuator/health
```

Look for an overall `UP` status and a healthy database component. Always confirm with logs and database queries.


## Common error patterns and troubleshooting

- DNS or network issues
  - Symptoms: `UnknownHostException`, socket connection errors.
  - Fix: Verify the JDBC host, service name, NetworkPolicies, firewall/security group rules, and routing from the cluster.

- Missing JDBC driver
  - Symptoms: `Failed to load driver class ...`.
  - Fix: Provide the driver using `extraVolumes`/`extraVolumeMounts`, an init container, or a custom image.

- Invalid credentials
  - Symptoms: `Access denied...`, `SQLInvalidAuthorizationSpecException`.
  - Fix: Confirm username, password, and required privileges. Test connectivity using a database client from inside the cluster.

- `autoDDL=false` on an empty database
  - Symptoms: missing table errors such as `EXPORTER_POSITION` not found.
  - Fix: Enable auto-DDL for initial schema creation or provision the schema manually before startup.

- Exporter position not advancing
  - Symptoms: `last_exported_position` remains unchanged after generating workload.
  - Fix: Inspect exporter logs for errors, confirm database write permissions, and review exporter settings (`flushInterval`, `queueSize`). Enable `DEBUG` logging if needed.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/validate-rdbms
