# Operations and maintenance for RDBMS manual installations — Schema upgrades

1. Backup your database.
2. Download scripts for target version: [access SQL and Liquibase scripts](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/access-sql-liquibase-scripts).
3. **If using autoDDL (default)**: Liquibase runs on Zeebe startup.
4. **If using manual schema management**: Apply scripts manually, then start new Camunda version.


## Disabling automatic schema updates

For strict change control environments:

```bash
export CAMUNDA_DATA_SECONDARYSTORAGE_RDBMS_AUTODDL=false
```

DBA must apply schema changes manually using scripts. Camunda does not validate the schema in this mode. If the schema is missing or out of date, the RdbmsExporter fails with SQL errors (see [Auto-DDL behavior](#auto-ddl-behavior)).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/manual/rdbms/operations
