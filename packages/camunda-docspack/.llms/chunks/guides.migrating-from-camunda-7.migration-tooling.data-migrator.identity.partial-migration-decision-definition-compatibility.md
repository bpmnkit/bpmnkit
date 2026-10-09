# Identity — Partial migration — `Decision Definition` compatibility

As historic definitions are migrated with a prefixed ID to Camunda 8 to avoid collisions between native and migrated definitions ([ref](https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/limitations#history)), authorizations for `Decision Definition` resources are migrated twice: once for the original ID and once for the prefixed ID. This guarantees that authorizations remain effective after migration.

| C7 Permission     | Migration supported | C8 Permission equivalent                                                                                     |
| ----------------- | ------------------- | ------------------------------------------------------------------------------------------------------------ |
| `READ`            | Yes                 | `READ_DECISION_DEFINITION`, `READ_DECISION_INSTANCE`                                                         |
| `UPDATE`          | No                  | -                                                                                                            |
| `CREATE_INSTANCE` | Yes                 | `CREATE_DECISION_INSTANCE`                                                                                   |
| `READ_HISTORY`    | No                  | -                                                                                                            |
| `ALL`             | Yes                 | `CREATE_DECISION_INSTANCE`, `READ_DECISION_DEFINITION`, `READ_DECISION_INSTANCE`, `DELETE_DECISION_INSTANCE` |

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/identity
