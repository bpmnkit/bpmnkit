# Camunda components metrics — Secret resolution and cache metrics — Secret resolution metrics (2)

`result` values on `camunda.secret.resolution.cycle.delay` (why the cycle chose its delay, not a per-reference outcome):

| Value            | Description                                                                                               |
| ---------------- | --------------------------------------------------------------------------------------------------------- |
| `DRAINING`       | More pending references remained than the batch cap allowed this cycle to take. The delay is always zero. |
| `WAKE`           | This cycle resolved something, or a reference was requested since the last cycle ran.                     |
| `IDLE_BACKOFF`   | Neither of the above, and no store is in retry cooldown.                                                  |
| `RETRY_COOLDOWN` | Neither of the above, and a store's retry cooldown deadline set the delay instead.                        |

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/monitoring/metrics
