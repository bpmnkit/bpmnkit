# Configure RDBMS in Helm chart — Schema creation and management

Camunda automatically creates your database schema using Liquibase (when `autoDDL: true`). You can also manage the schema manually if required.

**See:** [Schema management](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/rdbms-schema-management) for:

- Automatic schema creation with autoDDL
- Database user permissions for each RDBMS type
- Manual schema management and DBA workflows
- Schema upgrades and verification


## Troubleshooting and operations

For detailed troubleshooting of common issues and post-deployment operations, see [RDBMS troubleshooting and operations](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/rdbms-troubleshooting), which covers:

- Connection failures and authentication errors
- JDBC driver loading issues
- Schema creation failures
- Slow data export and performance tuning
- TLS/SSL configuration
- Post-deployment operations (password rotation, driver updates, schema validation)

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/rdbms
