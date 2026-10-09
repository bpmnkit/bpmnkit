# RDBMS version support policy — Database-specific support notes

| Database             | LTS policy                                    | Production use | Notes                                                                                     |
| :------------------- | :-------------------------------------------- | :------------- | :---------------------------------------------------------------------------------------- |
| PostgreSQL           | All active major LTS versions                 | ✅             | —                                                                                         |
| MariaDB              | LTS releases only                             | ✅             | —                                                                                         |
| MySQL                | LTS releases only                             | ✅             | —                                                                                         |
| Microsoft SQL Server | Mainstream or extended vendor support         | ✅             | —                                                                                         |
| Oracle Database      | LTS releases                                  | ✅             | —                                                                                         |
| H2                   | Development, testing, and evaluation use only | ❌             | Not for multi-broker clusters. File-based H2 persists on disk; in-memory H2 is ephemeral. |

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/databases/relational-db/rdbms-support-policy
