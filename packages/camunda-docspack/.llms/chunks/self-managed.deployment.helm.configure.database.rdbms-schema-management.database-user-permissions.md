# Schema creation and management — Database user permissions

### postgresql

```sql
CREATE ROLE camunda WITH LOGIN PASSWORD 'password';
GRANT CONNECT ON DATABASE camunda TO camunda;
GRANT USAGE ON SCHEMA public TO camunda;
GRANT CREATE ON SCHEMA public TO camunda;
```

### oracle

```sql
CREATE USER camunda IDENTIFIED BY password;
GRANT CREATE TABLE TO camunda;
GRANT UNLIMITED TABLESPACE TO camunda;
```

### mariadb

```sql
CREATE USER camunda@'%' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON camunda.* TO camunda@'%';
FLUSH PRIVILEGES;
```

### mssql

```sql
CREATE LOGIN camunda WITH PASSWORD = 'password';
CREATE USER camunda FOR LOGIN camunda;
GRANT CREATE TABLE TO camunda;
GRANT ALTER ON SCHEMA::dbo TO camunda;
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/rdbms-schema-management
