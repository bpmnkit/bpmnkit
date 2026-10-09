# Schema creation and management — Manual schema management

If your database is managed by a dedicated DBA, disable autoDDL and manage schema updates manually:

```yaml
orchestration:
  extraConfiguration:
    - file: "manual-schema-management.yaml"
      content: |
        camunda:
          data:
            secondary-storage:
              rdbms:
                auto-ddl: false
```

With `autoDDL: false`, you must apply SQL scripts to the database before deploying Camunda. Scripts are available in the Camunda release bundle or from the [Liquibase scripts page](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/access-sql-liquibase-scripts).

### When to use manual schema management

- Your organization requires a separate schema deployment phase.
- A dedicated DBA manages the database and DDL changes.
- You need to validate schema changes before applying them to production.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/rdbms-schema-management
