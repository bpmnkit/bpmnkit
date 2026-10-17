# Identity — Partial migration — `Deployment` compatibility

As `Deployment` maps to `Resource` in Camunda 8, when migrating a `Deployment` authorization to Camunda 8, one authorization per resource contained in the deployment is created in Camunda 8, with the same permissions as the original `Deployment` authorization.
This operates in combination with the prefix principle described for [Process Definition](#process-definition-compatibility) and [Decision Definition](#decision-definition-compatibility), which also applies for forms.

In practice, this means that, if a deployment contains process definitions, decision definitions, and forms, for each of these resources two authorizations are created in Camunda 8: one for the original ID and one for the prefixed ID.

| C7 Permission | Migration supported | C8 Permission equivalent                                                           |
| ------------- | ------------------- | ---------------------------------------------------------------------------------- |
| `READ`        | Yes                 | `READ`                                                                             |
| `CREATE`      | Yes                 | `CREATE`                                                                           |
| `DELETE`      | Yes                 | `DELETE_RESOURCE`, `DELETE_FORM`, `DELETE_PROCESS`, `DELETE_DRD`                   |
| `ALL`         | Yes                 | `CREATE`, `READ`, `DELETE_DRD`, `DELETE_FORM`, `DELETE_PROCESS`, `DELETE_RESOURCE` |

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/identity
