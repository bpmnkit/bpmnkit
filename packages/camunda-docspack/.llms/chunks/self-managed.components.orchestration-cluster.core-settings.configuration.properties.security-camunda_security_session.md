# Property reference — Security — `CAMUNDA_SECURITY_SESSION`

| Property                                       | Description                                                                                                                                                                                                                   | Default value | Overridable per Physical Tenant |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | :------------------------------ |
| `CAMUNDA_SECURITY_SESSION_PERSISTENT_ENABLED`  | Stores session data in secondary storage so users stay logged in across cluster nodes.                                                                                                                                        | `false`       | No                              |
| `CAMUNDA_SECURITY_SESSION_MAXINACTIVEINTERVAL` | How long a session can go without activity before it is treated as expired. Format: ISO 8601 duration (`PnDTnHnMn.nS`).                                                                                                       | `PT30M`       | No                              |
| `CAMUNDA_SECURITY_SESSION_HEARTBEAT_ENABLED`   | When disabled, any non-polling request extends the session. When enabled, only a call to the `POST {basePath}/session/heartbeat` endpoint extends the session, and ordinary application requests no longer count as activity. | `false`       | No                              |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties
