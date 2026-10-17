# Wait states — Impact on secondary storage

When wait state tracking is active, Camunda writes a record to [secondary storage](https://docs.camunda.io/docs/next/self-managed/concepts/secondary-storage/index) for every applicable element instance.

Wait state tracking does not measurably increase secondary storage usage. You can [configure wait state tracking](https://docs.camunda.io/docs/next/self-managed/concepts/wait-states/configure) in Camunda 8 Self-Managed to disable it.


## Access control

To view wait states, you must have the relevant authorization:

| Authorization type                                     | Resource type        | Resource ID                                                 | Permission              |
| :----------------------------------------------------- | :------------------- | :---------------------------------------------------------- | :---------------------- |
| View wait states for instances of a process definition | `PROCESS_DEFINITION` | A process definition ID or `*` for all process definitions. | `READ_PROCESS_INSTANCE` |

Wait state data is isolated by tenant. You can only view wait states for [tenants](https://docs.camunda.io/docs/next/self-managed/concepts/multi-tenancy/index) you are authorized to access.

---
Source: https://docs.camunda.io/docs/next/components/wait-states/overview
