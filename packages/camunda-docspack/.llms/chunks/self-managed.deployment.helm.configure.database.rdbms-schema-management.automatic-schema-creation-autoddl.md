# Schema creation and management — Automatic schema creation (autoDDL)

By default, `autoDDL: true` enables automatic schema creation via Liquibase. This happens at pod startup:

1. Liquibase detects that the schema does not exist or is outdated.
2. Liquibase executes all SQL migrations to initialize the schema.
3. The exporter begins writing data.

**Prerequisites for autoDDL:**

For all databases, the database user must have `CREATE TABLE`, `ALTER TABLE`, and `DROP TABLE` permissions.

Additional database-specific requirements:

- **PostgreSQL**: `CREATE` permission on the database.
- **Oracle**: `CREATE TABLE` and `TABLESPACE` (if using non-default tablespaces).
- **SQL Server**: `CREATE TABLE`, `ALTER TABLE`, and `CONTROL` on the schema.
- **MariaDB/MySQL**: `ALL PRIVILEGES` on the target database.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/rdbms-schema-management
