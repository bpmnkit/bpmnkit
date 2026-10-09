# Property reference — Data — `camunda.data.audit-log`

| Property                                   | Description                                                                                                      | Default value                             | Overridable per Physical Tenant |
| :----------------------------------------- | :--------------------------------------------------------------------------------------------------------------- | :---------------------------------------- | :------------------------------ |
| `camunda.data.audit-log.enabled`           | Enable or disable the audit log.                                                                                 | `true`                                    | Yes                             |
| `camunda.data.audit-log.user.categories`   | List of audit log categories to include for user-initiated actions.                                              | `[ADMIN, DEPLOYED_RESOURCES, USER_TASKS]` | Yes                             |
| `camunda.data.audit-log.user.excludes`     | List of [audit log entity types](#audit-log-entity-types) to exclude for user-initiated actions.                 | `[]`                                      | Yes                             |
| `camunda.data.audit-log.client.categories` | List of audit log categories to include for client-initiated actions (API clients).                              | `[]`                                      | Yes                             |
| `camunda.data.audit-log.client.excludes`   | List of [audit log entity types](#audit-log-entity-types) to exclude for client-initiated actions (API clients). | `[]`                                      | Yes                             |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties
