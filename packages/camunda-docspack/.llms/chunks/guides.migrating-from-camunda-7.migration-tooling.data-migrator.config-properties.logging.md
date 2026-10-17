# Configuration property reference — `logging`

Prefix: `logging`

| Property                           | Type     | Description                                                                                                           |
| :--------------------------------- | :------- | :-------------------------------------------------------------------------------------------------------------------- |
| `.level.root`                      | `string` | Root logger level. Default: `INFO`                                                                                    |
| `.level.io.camunda.migration.data` | `string` | Migrator logging level. Default: `INFO`                                                                               |
| `.file.name`                       | `string` | Log file location. Set to: `logs/camunda-7-to-8-data-migrator.log`. If not specified, logs are output to the console. |

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/config-properties
