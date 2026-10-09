# Identity — Authorizations

Not all authorizations can be migrated from Camunda 7 to Camunda 8 due to differences in the authorization models of both systems.

When identity migration is executed, authorizations that are not supported are skipped and the reason for incompatibility is logged by the migrator. If an authorization contains at least one unsupported permission, the whole authorization is skipped.

The following tables provide an overview of the supported authorizations.

#### By Authorization Type

Camunda 8 only supports `GRANT` authorizations. `REVOKE` and `GLOBAL` authorizations from Camunda 7 are not supported for migration.

Because in Camunda 7 `GRANT` authorizations take precedence over `REVOKE` authorizations, skipping (and therefore ignoring) `REVOKE` authorizations does not lead to a loss of effective permissions when migrating to Camunda 8.

| Authorization Type | Migration supported |
| ------------------ | ------------------- |
| `GRANT`            | Yes                 |
| `REVOKE`           | No                  |
| `GLOBAL`           | No                  |

#### By Resource Type

| C7 Resource Type                   | Migration supported                             | C8 Resource Type equivalent        |
| ---------------------------------- | ----------------------------------------------- | ---------------------------------- |
| `Application`                      | Yes                                             | `Component`                        |
| `Authorization`                    | [Partial\*](#authorization-compatibility)       | `Authorization`                    |
| `Batch`                            | [Partial\*](#batch-compatibility)               | `Batch`                            |
| `Dashboard`                        | No                                              | -                                  |
| `Decision Definition`              | [Partial\*](#decision-definition-compatibility) | `Decision Definition`              |
| `Decision Requirements Definition` | Yes                                             | `Decision Requirements Definition` |
| `Deployment`                       | [Yes\*](#deployment-compatibility)              | -                                  |
| `Filter`                           | No                                              | -                                  |
| `Group`                            | Yes                                             | `Group`                            |
| `Group Membership`                 | [Partial\*](#group-membership-compatibility)    | `Group`                            |
| `Historic Process Instance`        | No                                              | -                                  |
| `Historic Process Instance`        | No                                              | -                                  |
| `Historic Task`                    | No                                              | -                                  |
| `Process Definition`               | [Partial\*](#process-definition-compatibility)  | `Process Definition`               |
| `Process Instance`                 | No                                              | -                                  |
| `Report`                           | No                                              | -                                  |
| `System`                           | [Partial\*](#system-compatibility)              | `System`                           |
| `Task`                             | No                                              | -                                  |
| `Tenant`                           | Yes                                             | `Tenant`                           |
| `Tenant Membership`                | [Partial\*](#tenant-membership-compatibility)   | `Tenant`                           |
| `User`                             | Yes                                             | `User`                             |
| `User Operation Log Category`      | No                                              | -                                  |

Details for partial migration can be found below.

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/identity
