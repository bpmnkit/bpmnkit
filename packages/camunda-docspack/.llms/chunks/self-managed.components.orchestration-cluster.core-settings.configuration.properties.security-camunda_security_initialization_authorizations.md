# Property reference — Security — `CAMUNDA_SECURITY_INITIALIZATION_AUTHORIZATIONS`

| Property                                                         | Description                                                                                                                        | Default value | Overridable per Physical Tenant |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------- | :------------------------------ |
| `CAMUNDA_SECURITY_INITIALIZATION_AUTHORIZATIONS_0_OWNER_TYPE`    | The owner type to assign to this authorization.                                                                                    |               | Yes                             |
| `CAMUNDA_SECURITY_INITIALIZATION_AUTHORIZATIONS_0_OWNER_ID`      | The owner ID to assign to this authorization.                                                                                      |               | Yes                             |
| `CAMUNDA_SECURITY_INITIALIZATION_AUTHORIZATIONS_0_RESOURCE_TYPE` | The [resource type](https://docs.camunda.io/docs/next/components/concepts/access-control/authorizations#available-resources) that this authorization applies to. |               | Yes                             |
| `CAMUNDA_SECURITY_INITIALIZATION_AUTHORIZATIONS_0_RESOURCE_ID`   | The resource ID that this authorization applies to.                                                                                |               | Yes                             |
| `CAMUNDA_SECURITY_INITIALIZATION_AUTHORIZATIONS_0_PERMISSIONS`   | Permissions to assign to this authorization. The available permissions vary by resource type.                                      |               | Yes                             |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties
