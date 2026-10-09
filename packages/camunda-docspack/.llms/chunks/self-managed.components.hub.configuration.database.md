# Database

Learn how to configure Camunda Hub to connect securely to supported databases, including PostgreSQL, H2, MariaDB, MSSQL, MySQL, and Oracle.

This page describes advanced database connection configuration for Camunda Hub. For a general setup guide, visit the [configuration overview](https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/properties#database).

**Tip: Need end-to-end guidance?**
For a unified setup guide covering provisioning, topology decisions, driver management, and backup strategies across both Orchestration Cluster and Camunda Hub, see the [end-to-end RDBMS setup guide](https://docs.camunda.io/docs/next/self-managed/concepts/databases/relational-db/rdbms-setup-guide). This guide is useful both when starting a new setup and when harmonizing existing component configurations.

Camunda Hub supports multiple database vendors such as PostgreSQL, MySQL, MariaDB, and Microsoft SQL Server. You can choose the one that best fits your environment.

| Database   | Default driver included | Notes                                                                  |
| ---------- | ----------------------- | ---------------------------------------------------------------------- |
| PostgreSQL | ✅ Yes                  |                                                                        |
| H2         | ✅ Yes                  | For development, testing, or evaluation only.                          |
| MariaDB    | ✅ Yes                  | Must use a case-sensitive collation.                                   |
| MySQL      | ❌ No                   | Driver must be provided manually; must use a case-sensitive collation. |
| MSSQL      | ✅ Yes                  | Must use a case-sensitive collation.                                   |
| Oracle     | ❌ No                   | Driver must be provided manually.                                      |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/database
