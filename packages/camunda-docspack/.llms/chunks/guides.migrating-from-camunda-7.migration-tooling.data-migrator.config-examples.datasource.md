# Configuration examples — Datasource

Configure the Camunda 7 and Camunda 8 datasources. You can use the same or different databases for Camunda 7 and Camunda 8.

### Camunda 7 (runtime and history)

```yaml
camunda.migrator.c7.data-source:
  table-prefix: MY_PREFIX_ # Optional prefix for Camunda 7 database tables
  auto-ddl: true # Automatically create/update Camunda 7 database schema
  jdbc-url: jdbc:h2:./h2/data-migrator-source.db
  username: sa # Database username
  password: sa # Database password
  driver-class-name: org.h2.Driver
```

You can apply any HikariCP property (for example, pool size) under `camunda.migrator.c7.data-source`.

### Camunda 8 RDBMS (history)

```yaml
camunda.migrator.c8.data-source:
  table-prefix: MY_PREFIX_ # Optional prefix for Camunda 8 RDBMS database tables
  auto-ddl: true # Automatically create/update Camunda 8 RDBMS database schema
  jdbc-url: jdbc:h2:./h2/data-migrator-target.db
  username: sa # Database username
  password: sa # Database password
  driver-class-name: org.h2.Driver
```

You can apply any HikariCP property (for example, pool size) under `camunda.migrator.c8.data-source`.

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/config-examples
