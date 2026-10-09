# Database — Transaction isolation level

The required isolation level to run the Data Migrator with is `READ COMMITTED`.
Other transaction isolation levels are not supported and might lead to unexpected behavior.


## History migration atomicity

Read more about [history migration atomicity](https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/history#atomicity).


## Compatibility

The migrator supports the following SQL databases:

| Database                 | Version        | JDBC Driver                                    | Notes                      |
| ------------------------ | -------------- | ---------------------------------------------- | -------------------------- |
| **PostgreSQL**           | 15, 16, 17, 18 | `org.postgresql.Driver`                        | Recommended for production |
| **Oracle**               | 19c, 23ai      | `oracle.jdbc.OracleDriver`                     | Recommended for production |
| **Microsoft SQL Server** | 2022           | `com.microsoft.sqlserver.jdbc.SQLServerDriver` | Recommended for production |
| **MariaDB**              | 11.8           | `org.mariadb.jdbc.Driver`                      | Recommended for production |

**Note**
JDBC drivers are not bundled with the Data Migrator distribution, except for H2, which is included for development and testing. Download the driver JAR for your database vendor and place it in `configuration/userlib` before starting the migrator.

The migrator supports migration only within the same database vendor:

| Migration Path          | Status           |
| ----------------------- | ---------------- |
| PostgreSQL → PostgreSQL | ✅ Supported     |
| PostgreSQL → Oracle     | ❌ Not supported |

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/database
