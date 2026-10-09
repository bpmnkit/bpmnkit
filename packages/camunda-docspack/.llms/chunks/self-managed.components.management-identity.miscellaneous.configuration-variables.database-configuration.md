# Configuration variables — Database configuration

Identity requires a database in the following cases:

- Connecting to either a generic OIDC provider or Microsoft Entra ID requires a database, regardless of feature flags. Identity stores roles, permissions, mapping rules, and groups in the database, and resolves authorization against the database on every request. See [connect Management Identity to an identity provider](https://docs.camunda.io/docs/next/self-managed/components/management-identity/configuration/connect-to-an-oidc-provider).
- With the default Keycloak-based setup, Identity requires a database when you enable the `resource-permissions` or `multi-tenancy` [feature flags](#feature-flags).

With the default Keycloak-based setup and no feature flags enabled, Identity does not require a database, as Keycloak stores this data separately.

| Environment variable         | Description                                         |
| :--------------------------- | :-------------------------------------------------- |
| `IDENTITY_DATABASE_HOST`     | The host of the database.                           |
| `IDENTITY_DATABASE_PORT`     | The port of the database.                           |
| `IDENTITY_DATABASE_NAME`     | The name of the database to connect to.             |
| `IDENTITY_DATABASE_USERNAME` | The username of a user with access to the database. |
| `IDENTITY_DATABASE_PASSWORD` | The password of a user with access to the database. |

**Note**
There are no default values for the variables above. See
[supported environments](https://docs.camunda.io/docs/next/reference/supported-environments#camunda-platform-8-self-managed) for a list of
supported databases. You may also review the [RDBMS support policy](https://docs.camunda.io/docs/next/self-managed/concepts/databases/relational-db/rdbms-support-policy).

### Running Identity on Amazon Aurora PostgreSQL

Identity supports running on Amazon Aurora PostgreSQL.
To connect Identity with your Amazon Aurora PostgreSQL instance, make the following configuration adjustments:

1. Modify the `SPRING_DATASOURCE_URL` environment
   variable: `jdbc:aws-wrapper:postgresql://[DB_HOST]:[DB_PORT]/[DB_NAME]`.
2. Add the environment variable `SPRING_DATASOURCE_DRIVER_CLASS_NAME` with the value `software.amazon.jdbc.Driver`.

For a full list of available driver parameters visit
the [AWS JDBC Driver documentation](https://github.com/awslabs/aws-advanced-jdbc-wrapper/wiki/UsingTheJdbcDriver#aws-advanced-jdbc-driver-parameters).

#### AWS IAM authentication

To use AWS Identity and Access Management (IAM) database authentication with your Amazon Aurora PostgreSQL
instance, in addition to the adjustments described [above](#running-identity-on-amazon-aurora-postgresql), follow these
steps:

1. Modify the `SPRING_DATASOURCE_URL` environment variable as
   follows: `jdbc:aws-wrapper:postgresql://[DB_HOST]:[DB_PORT]/[DB_NAME]?wrapperPlugins=iam`.
2. Modify the `SPRING_DATASOURCE_USERNAME` environment variable to match the database user you configured for AWS IAM
   authentication as described in
   the [Amazon Aurora documentation](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/UsingWithRDS.IAMDBAuth.DBAccounts.html#UsingWithRDS.IAMDBAuth.DBAccounts.PostgreSQL).
3. Remove the `SPRING_DATASOURCE_PASSWORD` environment variable.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/management-identity/miscellaneous/configuration-variables
