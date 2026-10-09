# RDBMS configuration overview — Schema management

Camunda uses Liquibase to automatically create and update the database schema on startup.

Liquibase creates two internal management tables:

- `DATABASECHANGELOG`
- `DATABASECHANGELOGLOCK`

These tables must not be modified or deleted.

For Helm deployments requiring manual schema control or access to vendor-specific SQL, see [access SQL and Liquibase scripts](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/access-sql-liquibase-scripts).

### Configure table prefix

To add a prefix to all Camunda-managed database tables:

```yaml
camunda.data.secondary-storage.rdbms.prefix: c8_
```


## Disable automatic schema creation

If your organization manages schema manually:

```yaml
camunda.data.secondary-storage.rdbms.auto-ddl: false
```

SQL scripts for manual schema creation are documented in the Liquibase/SQL access guide linked above.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/databases/relational-db/configuration
