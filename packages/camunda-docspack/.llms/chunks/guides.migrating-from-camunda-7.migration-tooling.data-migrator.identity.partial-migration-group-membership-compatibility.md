# Identity — Partial migration — `Group Membership` compatibility

The `Group Membership` resource type does not exist in Camunda 8, but its functionality is covered by the `Group` resource type in combination with the `UPDATE` permission. However, only the `ALL` permission from Camunda 7 is supported for migration, as individual `CREATE` and `DELETE` permissions would result in a more permissive authorization.

| C7 Permission | Migration supported | C8 Resource Type equivalent | C8 Permission equivalent |
| ------------- | ------------------- | --------------------------- | ------------------------ |
| `CREATE`      | No                  | -                           | -                        |
| `DELETE`      | No                  | -                           | -                        |
| `ALL`         | Yes                 | `GROUP`                     | `UPDATE`                 |

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/identity
