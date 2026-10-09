# Property reference — Security — `camunda.security.initialization.authorizations`

| Property                                                          | Description                                                                                                                        | Default value | Overridable per Physical Tenant |
| ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------- | :------------------------------ |
| `camunda.security.initialization.authorizations.[0].ownerType`    | The owner type to assign to this authorization.                                                                                    |               | Yes                             |
| `camunda.security.initialization.authorizations.[0].ownerId`      | The owner ID to assign to this authorization.                                                                                      |               | Yes                             |
| `camunda.security.initialization.authorizations.[0].resourceType` | The [resource type](https://docs.camunda.io/docs/next/components/concepts/access-control/authorizations#available-resources) that this authorization applies to. |               | Yes                             |
| `camunda.security.initialization.authorizations.[0].resourceId`   | The resource ID that this authorization applies to.                                                                                |               | Yes                             |
| `camunda.security.initialization.authorizations.[0].permissions`  | Permissions to assign to this authorization. The available permissions vary by resource type.                                      |               | Yes                             |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties
