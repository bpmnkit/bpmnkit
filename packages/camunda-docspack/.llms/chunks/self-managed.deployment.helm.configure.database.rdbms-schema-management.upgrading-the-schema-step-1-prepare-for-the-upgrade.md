# Schema creation and management — Upgrading the schema — Step 1: Prepare for the upgrade

Before upgrading the production cluster, perform the following steps:

#### Back up your database

Back up your database before upgrading. Use your database vendor's native tools:

- **PostgreSQL**: [pg_dump documentation](https://www.postgresql.org/docs/current/app-pgdump.html)
- **Oracle**: [EXPDP documentation](https://docs.oracle.com/en/database/oracle/oracle-database/sutil/oracle-data-pump-export-utility.html)
- **MySQL**: [mysqldump documentation](https://dev.mysql.com/doc/refman/en/mysqldump.html)
- **MariaDB**: [mariadb-dump documentation](https://mariadb.com/kb/en/mariadb-dump/)
- **SQL Server**: [SQL Server backup documentation](https://learn.microsoft.com/en-us/sql/relational-databases/backup-restore/back-up-and-restore-of-sql-server-databases)

#### Test the upgrade in staging

Deploy the new Camunda version in a staging environment first to validate schema migrations.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/rdbms-schema-management
