# Operations and maintenance for RDBMS manual installations — Security

### TLS/SSL

All RDBMS connections must use TLS in production:

```bash
# PostgreSQL
export CAMUNDA_DATA_SECONDARY_STORAGE_RDBMS_URL="jdbc:postgresql://localhost:5432/camunda?sslmode=require"

# See [RDBMS Helm configuration](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/rdbms) for other databases
```

### Secrets

Never hardcode passwords. Use environment variable injection:

```bash
export CAMUNDA_DATA_SECONDARY_STORAGE_RDBMS_PASSWORD=$(cat /run/secrets/db_password)
```

### Database permissions

Create user with minimum required privileges:

```sql
-- PostgreSQL example
CREATE ROLE camunda LOGIN PASSWORD 'secure-password';
GRANT CONNECT ON DATABASE camunda TO camunda;
GRANT USAGE ON SCHEMA public TO camunda;
GRANT CREATE ON SCHEMA public TO camunda;
```

Avoid DROP, TRUNCATE, SUPERUSER, or other unnecessary privileges.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/manual/rdbms/operations
