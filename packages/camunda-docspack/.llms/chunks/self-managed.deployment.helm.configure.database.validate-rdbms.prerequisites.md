# Validate RDBMS connectivity — Prerequisites

- The database endpoint is reachable from the Kubernetes cluster (DNS, routing, firewall/security groups, NetworkPolicies).
- Your Helm values are configured for RDBMS secondary storage and the RDBMS exporter is enabled.
- For databases that require external JDBC drivers (for example Oracle), the driver JAR is available to the Orchestration Cluster at runtime.

**Note**
The pod should only become `Ready` when the application can connect to the database. Success of Liquibase and a running exporter are best confirmed via logs and direct database inspection.


## How to verify connectivity

Run a database client from within the cluster (either in an existing pod or in a temporary debug pod).

### PostgreSQL example (psql)

```bash
# Option A: run an ephemeral pod with psql (recommended)
kubectl run -i --rm --tty pg-client \
  --image=postgres:15 \
  --restart=Never \
  --namespace camunda \
  --command -- bash

# Inside the pod:
psql "host=POSTGRES_HOST port=5432 user=camunda dbname=camunda password=REDACTED" -c '\dt'
```

If you prefer `kubectl exec`, ensure the target container image includes `psql`.

### MySQL/MariaDB example (mysql)

```bash
kubectl run -i --rm --tty mysql-client \
  --image=mysql:8 \
  --restart=Never \
  --namespace camunda \
  --command -- bash

# Inside the pod:
mysql -h MYSQL_HOST -P 3306 -u camunda -pREDACTED camunda -e 'SHOW TABLES;'
```

### Oracle example (sqlplus)

Use an image that includes Oracle client tools (for example sqlplus) and list tables:

```sql
SELECT table_name FROM user_tables;
```

What to expect:

- Success: The client connects and can list tables (or list schemas).
- Failure: DNS/connection/authentication errors (the application typically fails fast and does not become `Ready`).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/validate-rdbms
