# End-to-end RDBMS setup guide — Step 4: JDBC driver management

Camunda bundles JDBC drivers for PostgreSQL, MariaDB, SQL Server, and H2. **You must provide a user-supplied driver for Oracle and MySQL.**

For detailed driver provisioning strategies (init containers, custom images, volume mounts), see:

- **Helm**: [JDBC driver management in Helm](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/rdbms-jdbc-drivers)
- **Manual**: [Manual installation driver setup](https://docs.camunda.io/docs/next/self-managed/deployment/manual/rdbms/configuration#jdbc-driver-management)
- **Camunda Hub**: [Camunda Hub database configuration](https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/database)


## Step 5: Schema management

**Orchestration Cluster uses Liquibase** → automatically creates and updates schema on startup (configurable via `autoDDL: true/false`).

**Camunda Hub uses Flyway** → migrations applied automatically on startup; **manual DBA execution not supported**.

This is the key difference: Orchestration Cluster schema can be managed manually by a DBA if preferred, while Camunda Hub schema is automatic only.

For access to SQL/Liquibase scripts or manual DBA procedures, see [Access SQL and Liquibase scripts](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/access-sql-liquibase-scripts).

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/databases/relational-db/rdbms-setup-guide
