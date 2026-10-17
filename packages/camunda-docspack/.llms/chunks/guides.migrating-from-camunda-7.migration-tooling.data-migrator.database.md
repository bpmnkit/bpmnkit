# Database

Database configuration for the Data Migrator.

Database configuration is required for both Camunda 7 and Camunda 8 (RDBMS history) data sources. The Data Migrator uses JDBC to connect to these databases.


## Setup

1. Download the JDBC driver JAR for your database and place it in `configuration/userlib`. The H2 driver is bundled for development and testing. All other database drivers must be provided by you.
2. Configure connection details in `configuration/application.yml`.
3. Set table prefixes if your installation uses them.
4. Verify connectivity before starting migration.
5. Ensure sufficient disk space for migration data.

**Info**
The database vendor is automatically detected but can be overridden using the `database-vendor` property.

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/database
