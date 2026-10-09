# Property reference — Security — `camunda.security.session`

| Property                                         | Description                                                                                                                                                                                                                   | Default value | Overridable per Physical Tenant |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | :------------------------------ |
| `camunda.security.session.persistent.enabled`    | Stores session data in secondary storage so users stay logged in across cluster nodes.                                                                                                                                        | `false`       | No                              |
| `camunda.security.session.max-inactive-interval` | How long a session can go without activity before it is treated as expired. Format: ISO 8601 duration (`PnDTnHnMn.nS`).                                                                                                       | `PT30M`       | No                              |
| `camunda.security.session.heartbeat.enabled`     | When disabled, any non-polling request extends the session. When enabled, only a call to the `POST {basePath}/session/heartbeat` endpoint extends the session, and ordinary application requests no longer count as activity. | `false`       | No                              |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties
