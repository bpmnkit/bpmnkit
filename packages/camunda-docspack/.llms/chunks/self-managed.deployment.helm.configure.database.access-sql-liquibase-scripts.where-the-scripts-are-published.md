# Access SQL and Liquibase scripts — Where the scripts are published

The scripts are included in the **Camunda 8 Run distribution** and in each **Camunda GitHub release** as a versioned ZIP file:

- **GitHub release example:** [Camunda 8.9.0](https://github.com/camunda/camunda/releases/tag/8.9.0)
- **C8Run distribution:** top-level folder `rdbms-schema/`


## Distribution & ZIP contents

The ZIP contains SQL scripts and Liquibase change sets for all supported databases:

```
/ -
| liquibase
  - changelog-master.xml
  | changesets
    - 8.9.0.xml
    - 8.10.0.xml
| sql
  | create
    | h2
      - h2_create_8.9.0.sql
    | mariadb
      - mariadb_create_8.9.0.sql
    | mssql
      - mssql_create_8.9.0.sql
    | mysql
      - mysql_create_8.9.0.sql
    | oracle
      - oracle_create_8.9.0.sql
    | postgresql
      - postgres_create_8.9.0.sql
  | upgrade
    | h2
      - h2_upgrade_8.9.0_to_8.10.0.sql
    ...
```

**Note**
Drop scripts are not provided.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/access-sql-liquibase-scripts
