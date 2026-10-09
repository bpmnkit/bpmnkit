# End-to-end RDBMS setup guide — Step 2: Provision the database

### Prerequisites

- **Supported RDBMS**: PostgreSQL (recommended), MariaDB, MySQL, SQL Server, Oracle, or H2 (development only).
- **Versions**: See the [RDBMS version support policy](https://docs.camunda.io/docs/next/self-managed/concepts/databases/relational-db/rdbms-support-policy).
- **Network and credentials**: Ensure reachable database and user with DDL permissions (CREATE TABLE, ALTER TABLE) for schema initialization.
- **SSL/TLS**: Optional but recommended. See [Camunda Hub SSL configuration](https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/database#configuring-ssl-for-the-database-connection) for guidance on JDBC URL parameters.

### Create database and user

Choose your topology (shared or separate) and database vendor:

### postgres

```sql
-- Shared topology: single database for both OC and Hub
CREATE DATABASE camunda ENCODING 'UTF8';
CREATE USER camunda WITH PASSWORD 'your-secure-password';
GRANT CONNECT ON DATABASE camunda TO camunda;
GRANT USAGE ON SCHEMA public TO camunda;
GRANT CREATE ON DATABASE camunda TO camunda;

-- Separate topology: independent instances
-- CREATE DATABASE camunda_oc ENCODING 'UTF8';
-- CREATE USER camunda_oc WITH PASSWORD 'oc-password';
-- GRANT CONNECT ON DATABASE camunda_oc TO camunda_oc;
-- GRANT USAGE ON SCHEMA public TO camunda_oc;
-- GRANT CREATE ON DATABASE camunda_oc TO camunda_oc;
```

### mysql

```sql
-- Shared topology
CREATE DATABASE camunda CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER camunda@'%' IDENTIFIED BY 'your-secure-password';
GRANT ALL PRIVILEGES ON camunda.* TO camunda@'%';
FLUSH PRIVILEGES;

-- Separate topology: repeat with different database and user names
```

### other

For SQL Server and Oracle, follow your database vendor's user provisioning guidelines. The user must have CREATE TABLE and ALTER permissions. Consult your DBA and the detailed setup guides linked below.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/databases/relational-db/rdbms-setup-guide
