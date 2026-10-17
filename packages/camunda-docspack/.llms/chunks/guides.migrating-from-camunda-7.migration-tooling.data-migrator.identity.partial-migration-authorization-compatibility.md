# Identity — Partial migration — `Authorization` compatibility

In Camunda 7, authorizations for `Authorization` resources can be fine-grained to specific resource IDs (`authorizationId`). Camunda 8 only supports the wildcard (`*`) resource ID for the `Authorization` type. Therefore, only authorizations with the wildcard resource ID are migrated.

Migration support for individual permissions:

| C7 Permission | Migration supported | C8 Permission equivalent             |
| ------------- | ------------------- | ------------------------------------ |
| `READ`        | Yes                 | `READ`                               |
| `UPDATE`      | Yes                 | `UPDATE`                             |
| `CREATE`      | Yes                 | `CREATE`                             |
| `DELETE`      | Yes                 | `DELETE`                             |
| `ALL`         | Yes                 | `READ`, `UPDATE`, `CREATE`, `DELETE` |

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/identity
