# Property reference — System — `CAMUNDA_SYSTEM_ACTOR_IDLE`

| Property                                  | Description                                                                                                                         | Default value | Overridable per Physical Tenant |
| :---------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------- | :------------ | :------------------------------ |
| `CAMUNDA_SYSTEM_ACTOR_IDLE_MAXSPINS`      | The maximum number of busy-wait spins that an idle actor thread will perform before transitioning to a different idle state. | `null`        | No                              |
| `CAMUNDA_SYSTEM_ACTOR_IDLE_MAXYIELDS`     | The maximum number of yield operations that an idle actor thread will perform before transitioning to the next idle state.   | `null`        | No                              |
| `CAMUNDA_SYSTEM_ACTOR_IDLE_MAXPARKPERIOD` | The maximum duration that an idle actor thread will remain in the parked state.                                              | `null`        | No                              |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties
