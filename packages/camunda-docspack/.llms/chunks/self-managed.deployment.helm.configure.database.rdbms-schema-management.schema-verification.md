# Schema creation and management — Schema verification

After initial deployment or upgrade, verify the schema:

```sql
-- PostgreSQL: Check tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public';

-- MySQL/MariaDB: Check tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = DATABASE();

-- Oracle: Check tables
SELECT table_name FROM user_tables;

-- SQL Server: Check tables
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'dbo';
```

Expected tables include workflow and history tables (for example, `process_instance`, `variable`, and `job`) and Liquibase metadata tables like `databasechangelog` and `databasechangeloglock`.

You can also verify by checking logs:

```bash
kubectl logs <pod-name> | grep -i liquibase
```

Success indicators:

```
INFO  io.camunda.application.commons.rdbms.MyBatisConfiguration - Initializing Liquibase for RDBMS
INFO  org.springframework.web.servlet.DispatcherServlet - Completed initialization in X ms
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/rdbms-schema-management
