# Property reference — Security — `orchestration.security.initialization`

| Property                                               | Description                                                                                                                                                                                                                  | Default value                            |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| `orchestration.security.initialization.users`          | List of users to initialize (each with username, password, name, email). The chart ships two demo users, `demo` (password `demo`) and `connectors` (password `connector`). Replace or remove them before exposing a cluster. | `demo`, `connectors` (two user entries)  |
| `orchestration.security.initialization.defaultRoles`   | Dictionary of role names assigning initial users, clients, or mapping rules to default roles. By default the chart assigns the `demo` user to `admin`, and the `connectors` user and client to `connectors`.                 | `admin`, `connectors` (two role entries) |
| `orchestration.security.initialization.mappingRules`   | **Deprecated in chart 15.x.** List of mapping rules to initialize when using OIDC (each with mappingRuleId, claimName, claimValue).                                                                                          |                                          |
| `orchestration.security.initialization.authorizations` | **Deprecated in chart 15.x.** List of authorizations to initialize.                                                                                                                                                          |                                          |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties
