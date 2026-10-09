# Configure RDBMS for manual installations

Configure drivers, connection parameters, and schema initialization for manual RDBMS installations.

Configure RDBMS secondary storage drivers, connections, and initial schema for **manual** Camunda 8 installations (VM, bare metal, or standalone Java).


## Prerequisites

- **Supported RDBMS**: See the [RDBMS support policy](https://docs.camunda.io/docs/next/self-managed/concepts/databases/relational-db/rdbms-support-policy).
- **JDBC drivers**: PostgreSQL, MariaDB, SQL Server, and H2 are bundled. Oracle and MySQL must be user-supplied.
- **Java 21+**: Required for Orchestration Cluster components (Zeebe, Operate, Tasklist, Identity). Management Identity remains Java 17+. See [supported environments](https://docs.camunda.io/docs/next/reference/supported-environments).
- **Database user**: Needs DDL permissions (CREATE TABLE, ALTER TABLE, DROP TABLE) for schema initialization.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/manual/rdbms/configuration
