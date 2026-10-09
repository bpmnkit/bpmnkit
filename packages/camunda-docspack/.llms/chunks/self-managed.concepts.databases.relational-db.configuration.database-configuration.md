# RDBMS configuration overview — Database configuration

RDBMS configuration properties are defined under:

```yaml
camunda.data.secondary-storage.rdbms.*
```

| Property                | Description                                                      | Default |
| ----------------------- | ---------------------------------------------------------------- | ------- |
| `url`                   | JDBC connection URL                                              | _empty_ |
| `user`                  | Username for the connection                                      | _empty_ |
| `password`              | Password for the connection                                      | _empty_ |
| `auto-ddl`              | Enables Liquibase schema management                              | `true`  |
| `prefix`                | Optional table name prefix                                       | `""`    |
| `database-vendor-id`    | Manually override vendor detection (`postgres`, `mariadb`, etc.) | _empty_ |
| `ddl-lock-wait-timeout` | Max time Liquibase can hold a lock on the database               | PT15M   |

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/databases/relational-db/configuration
