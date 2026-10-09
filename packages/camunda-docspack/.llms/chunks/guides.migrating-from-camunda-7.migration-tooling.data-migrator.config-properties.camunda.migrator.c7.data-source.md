# Configuration property reference — `camunda.migrator.c7.data-source`

Prefix: `camunda.migrator.c7.data-source`

| Property             | Type      | Description                                                                                                                                  |
| :------------------- | :-------- | :------------------------------------------------------------------------------------------------------------------------------------------- |
| `.table-prefix`      | `string`  | Optional prefix for Camunda 7 database tables. Default: _(empty)_                                                                            |
| `.auto-ddl`          | `boolean` | Automatically create/update Camunda 7 database schema. Default: `false`                                                                      |
| `.database-vendor`   | `string`  | The database vendor is automatically detected and can currently not be overridden.                                                           |
| `.*`                 |           | You can apply all [`HikariConfig` properties](https://github.com/brettwooldridge/HikariCP?tab=readme-ov-file#gear-configuration-knobs-baby). |
| `.jdbc-url`          | `string`  | JDBC connection URL for the source Camunda 7 database. Default: `jdbc:h2:mem:migrator`                                                       |
| `.username`          | `string`  | Username for Camunda 7 database connection. Default: `sa`                                                                                    |
| `.password`          | `string`  | Password for Camunda 7 database connection. Default: `sa`                                                                                    |
| `.driver-class-name` | `string`  | JDBC driver class for Camunda 7 database. Default: `org.h2.Driver`                                                                           |

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/config-properties
