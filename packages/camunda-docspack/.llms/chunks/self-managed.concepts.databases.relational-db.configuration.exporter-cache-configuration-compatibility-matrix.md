# RDBMS configuration overview — Exporter cache configuration — Compatibility matrix

Use LSN-based monitoring when your database supports it. Otherwise, use time-based monitoring if available. Use delay backoff only when neither strategy is supported. Delay backoff doesn't monitor replication state directly and requires external monitoring of replication lag; see [delay backoff replication monitoring](#delay-backoff-replication-monitoring).

| Database Vendor   | LSN-based          | Time-based         | Delay backoff      |
| ----------------- | ------------------ | ------------------ | ------------------ |
| Aurora PostgreSQL | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| Aurora MySQL      | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| PostgreSQL        | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| MSSQL             | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| Oracle            | :white_check_mark: | :x:                | :white_check_mark: |
| MariaDB           | :x:                | :x:                | :white_check_mark: |
| MySQL             | :x:                | :x:                | :white_check_mark: |

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/databases/relational-db/configuration
