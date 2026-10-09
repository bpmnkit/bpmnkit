# RDBMS version support policy — Supported JDBC driver versions

Camunda bundles JDBC drivers for databases where redistribution is permitted and expects you to provide drivers where licensing or distribution constraints apply (for example, Oracle).

Bundled driver versions are not pinned as a formal support guarantee. Each bundled driver is tested in CI against every supported version of the corresponding database listed above, and the exact version may change between Camunda patch releases as dependencies are updated. To inspect the precise driver version bundled in a given Camunda release, see the `lib/` directory of the distribution archive.

### Bundled drivers

The following JDBC drivers and wrappers are included in the Camunda application images. Each is known to be compatible with every supported version of the corresponding database listed above:

| Database / platform      | Driver artifact                                  | Notes                                                          |
| :----------------------- | :----------------------------------------------- | :------------------------------------------------------------- |
| PostgreSQL               | `org.postgresql:postgresql`                      | Bundled in Camunda images.                                     |
| MariaDB                  | `org.mariadb.jdbc:mariadb-java-client`           | Bundled in Camunda images.                                     |
| Microsoft SQL Server     | `com.microsoft.sqlserver:mssql-jdbc`             | Bundled in Camunda images (JRE 11).                            |
| H2                       | `com.h2database:h2`                              | Bundled in Camunda images.                                     |
| Amazon Aurora (AWS JDBC) | `software.amazon.jdbc:aws-advanced-jdbc-wrapper` | JDBC wrapper for AWS Aurora; requires a supported base driver. |

### User-supplied drivers

The following databases require you to provide a compatible JDBC driver at runtime:

| Database | Driver artifact                   | Tested version | Notes                                                                   |
| :------- | :-------------------------------- | :------------- | :---------------------------------------------------------------------- |
| Oracle   | `com.oracle.database.jdbc:ojdbc*` | 23.7.0.25.01   | Must be provided by you. May be OS/architecture-specific (amd64/arm64). |
| MySQL    | `com.mysql:mysql-connector-j`     | 9.7.0          | Must be provided by you.                                                |

**Info**
Camunda validates driver compatibility in CI by testing against the oldest and newest supported database versions. A single driver version is expected to work across the supported database versions listed on this page.

For deployment instructions, see [loading JDBC drivers into pods](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/rdbms#bundled-vs-custom-jdbc-drivers).

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/databases/relational-db/rdbms-support-policy
