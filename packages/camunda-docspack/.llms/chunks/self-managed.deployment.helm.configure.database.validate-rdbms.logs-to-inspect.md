# Validate RDBMS connectivity — Logs to inspect

### Success patterns

- Liquibase initialization line in Orchestration Cluster logs (see above).
- RDBMS exporter created/opened lines in Orchestration Cluster logs (see above).

### Failure patterns

- Missing driver
  - Example: `Failed to load driver class oracle.jdbc.OracleDriver`
  - Result: Camunda fails to start.

- Invalid JDBC URL, host, or DNS resolution
  - Example messages:
    - `Factory method 'databaseProperties' threw exception... Error occurred when getting DB product name.`
    - Root cause stack traces including `UnknownHostException` or socket connection failures.
  - Result: Camunda fails to start.

- Invalid credentials
  - Example: `SQLInvalidAuthorizationSpecException: Access denied for user ... (using password: YES)`
  - Result: Camunda fails to start.

- `autoDDL=false` on an empty database
  - Example:
    - `SQLSyntaxErrorException: Table '...EXPORTER_POSITION' doesn't exist`
  - Result: Exporter fails because required tables are missing. This is expected behavior unless schema is pre-created.

Fetch logs:

```bash
kubectl -n camunda logs deploy/orchestration
kubectl -n camunda logs statefulset/zeebe-broker-0
```

If logs contain connection, driver, or authentication stack traces, the application typically fails fast and does not reach full readiness.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/validate-rdbms
