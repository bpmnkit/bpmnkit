# Configure secondary storage in Camunda 8 Run — External relational database options

Use an external relational database for secondary storage: PostgreSQL, MariaDB, MySQL, Oracle, or Microsoft SQL Server.

1. Set `camunda.data.secondary-storage` with the JDBC URL and credentials.
2. Ensure the database is reachable before starting Camunda 8 Run.
3. If you already run a database, reuse the same configuration and update the URL, host or port, and credentials.
4. If a separate JDBC driver is required, add it with `--extra-driver` or drop the JAR into `camunda-zeebe-<version>/lib`.

---
Source: https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/c8run/secondary-storage
