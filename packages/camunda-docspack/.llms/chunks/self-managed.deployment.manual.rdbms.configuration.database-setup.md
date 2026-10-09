# Configure RDBMS for manual installations — Database setup

### Step 1: Create database and user

PostgreSQL example:

```sql
CREATE DATABASE camunda ENCODING 'UTF8';
CREATE USER camunda WITH PASSWORD 'your-secure-password';
GRANT CONNECT ON DATABASE camunda TO camunda;
GRANT USAGE ON SCHEMA public TO camunda;
GRANT CREATE ON DATABASE camunda TO camunda;
```

For other databases, see [RDBMS Helm configuration](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/rdbms).

### Step 2: Configure connection

Use the unified Camunda configuration properties:

```bash
export CAMUNDA_DATA_SECONDARY_STORAGE_TYPE=rdbms
export CAMUNDA_DATA_SECONDARY_STORAGE_RDBMS_URL="jdbc:postgresql://localhost:5432/camunda"
export CAMUNDA_DATA_SECONDARY_STORAGE_RDBMS_USERNAME="camunda"
export CAMUNDA_DATA_SECONDARY_STORAGE_RDBMS_PASSWORD="your-secure-password"
```

### Step 3: Schema initialization

By default, Liquibase automatically creates the schema on first startup. To manually manage schema:

```bash
export CAMUNDA_DATA_SECONDARY_STORAGE_RDBMS_AUTO_DDL=false
```

Then apply SQL/Liquibase scripts manually using your DBA tools. See [access SQL and Liquibase scripts](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/access-sql-liquibase-scripts).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/manual/rdbms/configuration
