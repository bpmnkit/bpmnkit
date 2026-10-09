# RDBMS version support policy — Supported RDBMS

The following relational databases are officially supported when used as an RDBMS backend (including as secondary storage where applicable):

| Database                 | Supported versions      |
| ------------------------ | ----------------------- |
| PostgreSQL               | 15, 16, 17, 18          |
| Amazon Aurora PostgreSQL | 15, 16, 17, 18          |
| MariaDB                  | 10.11, 11.4, 11.8, 12.3 |
| MySQL                    | 8.4, 9.7                |
| Microsoft SQL Server     | 2022, 2025              |
| Oracle                   | 19c, 26ai               |
| H2                       | 2.4                     |

**Info**
Changes to supported versions are announced in the [release notes](https://docs.camunda.io/docs/next/reference/announcements-release-notes/8100/8100-announcements).

### Recommended database versions

For **new deployments**, standardize on **one of the latest two supported versions** of a given database whenever possible. Older supported versions remain valid for existing deployments but are not recommended for new deployments.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/databases/relational-db/rdbms-support-policy
