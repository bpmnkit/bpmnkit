# Configuration property reference — `camunda.migrator.c8.data-source`

Prefix: `camunda.migrator.c8.data-source`

If the `c8.data-source` configuration is absent, the RDBMS history data migrator is disabled.

| Property             | Type      | Description                                                                                                                                               |
| :------------------- | :-------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.table-prefix`      | `string`  | Optional prefix for Camunda 8 RDBMS database tables. Default: _(empty)_                                                                                   |
| `.auto-ddl`          | `boolean` | Automatically create/update Camunda 8 RDBMS database schema. Default: `false`                                                                             |
| `.database-vendor`   | `string`  | Database vendor for Camunda 8 schema. Options: `h2`, `postgresql`, `oracle`. Default: Automatically detected.                                             |
| `.*`                 |           | You can apply all [`HikariConfig` properties](https://github.com/brettwooldridge/HikariCP?tab=readme-ov-file#gear-configuration-knobs-baby). For example: |
| `.jdbc-url`          | `string`  | JDBC connection URL for the target Camunda 8 RDBMS database. Default: `jdbc:h2:mem:migrator`                                                              |
| `.username`          | `string`  | Username for Camunda 8 database connection. Default: `sa`                                                                                                 |
| `.password`          | `string`  | Password for Camunda 8 database connection. Default: `sa`                                                                                                 |
| `.driver-class-name` | `string`  | JDBC driver class for Camunda 8 database. Default: `org.h2.Driver`                                                                                        |

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/config-properties
