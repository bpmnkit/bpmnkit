# Property reference — System — `camunda.system.actor.idle`

| Property                                    | Description                                                                                                                                                   | Default value | Overridable per Physical Tenant |
| :------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------ | :------------ | :------------------------------ |
| `camunda.system.actor.idle.max-spins`       | The maximum number of busy-wait spins that an idle actor thread will perform before transitioning to a different idle state in Camunda's actor system. | `null`        | No                              |
| `camunda.system.actor.idle.max-yields`      | The maximum number of yield operations that an idle actor thread will perform before transitioning to the next idle state in Camunda's actor system.   | `null`        | No                              |
| `camunda.system.actor.idle.max-park-period` | The maximum duration that an idle actor thread will remain in the parked state in Camunda's actor system.                                              | `null`        | No                              |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties
