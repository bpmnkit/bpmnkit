# Troubleshoot database connection issues

You try to start Camunda Hub, and encounter issues with the database connection.


## Using a non-empty schema

As Camunda Hub uses [Flyway](https://www.red-gate.com/products/flyway/community/) to manage schema updates, the schema should not be shared.

Before the first initialization, ensure no tables or functions are present in your schema.

If your database setup requires mandatory tables or functions, Flyway may throw an exception like `Found non-empty schema(s) "<schema name>" without schema history table!`

To overcome this issue, add the property `spring.flyway.baselineOnMigrate: true` to your Camunda Hub configuration and remove it after the schema has been initialized.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/troubleshooting/troubleshoot-database-connection
