# Database — Running Camunda Hub on Amazon Aurora PostgreSQL

Camunda Hub supports connecting to **Amazon Aurora PostgreSQL**.  
To connect, update the following environment variables:

1. Set the JDBC URL:
   ```bash
   SPRING_DATASOURCE_URL="jdbc:aws-wrapper:postgresql://[DB_HOST]:[DB_PORT]/[DB_NAME]"
   ```
2. Set the driver class:
   ```bash
   SPRING_DATASOURCE_DRIVERCLASSNAME="software.amazon.jdbc.Driver"
   ```

For all available driver parameters, see the [AWS Advanced JDBC Driver documentation](https://github.com/awslabs/aws-advanced-jdbc-wrapper/wiki/UsingTheJdbcDriver#aws-advanced-jdbc-driver-parameters).

### AWS IAM authentication

To enable IAM database authentication for Aurora PostgreSQL:

1. Modify the JDBC URL:
   ```bash
   SPRING_DATASOURCE_URL="jdbc:aws-wrapper:postgresql://[DB_HOST]:[DB_PORT]/[DB_NAME]?wrapperPlugins=iam"
   ```
2. Set the username:
   ```bash
   SPRING_DATASOURCE_USERNAME="[IAM_DB_USER]"
   ```
   The username must match a database user configured for IAM authentication as described in the [Amazon Aurora documentation](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/UsingWithRDS.IAMDBAuth.DBAccounts.html#UsingWithRDS.IAMDBAuth.DBAccounts.PostgreSQL).
3. Remove the password variable:
   ```bash
   unset SPRING_DATASOURCE_PASSWORD
   ```

When using IAM authentication, ensure Camunda Hub has permission to generate IAM authentication tokens (for example, through an attached IAM role or access key).

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/database
