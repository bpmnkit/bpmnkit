# Camunda components metrics — Secret resolution and cache metrics — Secret resolution metrics

These meters cover resolving secret references against a secret store.

| Metric name                             | Type    | Description                                                                                                                                                                                                                                                                                                                                                          | Labels                                                       |
| --------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `camunda.secret.resolution.duration`    | Timer   | Latency of one batch resolution call against a secret store. Measures the store call only, not the follow-up commands the engine writes for its results. The `result` label separates calls by outcome so store timeouts don't distort the latency of successful calls.                                                                                              | `store`, `result` (see below), `physicalTenant`, `partition` |
| `camunda.secret.resolution.outcome`     | Counter | Number of secret reference resolutions that produced an outcome, per store. Every result value is terminal for the reference it counts, so the values can be summed or divided by one another to derive rates. A reference whose store is unavailable but still has retry attempts left is not counted at all, since it has not reached a terminal outcome.          | `store`, `result` (see below), `physicalTenant`, `partition` |
| `camunda.secret.resolution.cycle.error` | Counter | Number of resolution cycles in which a store encounters an unexpected exception that the engine does not model as a per-secret failure or unavailable store. Counted per store. A nonzero value indicates a bug in either the store implementation or the engine. Counts cycles, not references, so it is a separate meter from `camunda.secret.resolution.outcome`. | `store`, `physicalTenant`, `partition`                       |
| `camunda.secret.resolution.cycle.delay` | Timer   | Delay before the next resolution cycle, grouped by the reason for the delay. Monitor `IDLE_BACKOFF` to verify that the delay increases geometrically after consecutive misses. Its distribution shows the backoff behavior without requiring you to infer it from the cycle rate.                                                                                    | `result` (see below), `physicalTenant`, `partition`          |

The `store` label carries the ID of the secret store a reference belongs to. `camunda.secret.resolution.cycle.delay` carries no `store` label, since a resolution cycle isn't scoped to one store. Every resolution meter also carries the `physicalTenant` and `partition` labels applied to Zeebe metrics generally.

The `result` label uses different values depending on the meter:

`result` values on `camunda.secret.resolution.duration`:

| Value               | Description                                                                  |
| ------------------- | ---------------------------------------------------------------------------- |
| `RETURNED`          | The store returned, whatever the per-reference results were.                 |
| `STORE_UNAVAILABLE` | The store could not be reached for this call.                                |
| `ERROR`             | The store threw something the engine does not model. Always indicates a bug. |

`result` values on `camunda.secret.resolution.outcome`:

| Value               | Description                                                                                                                           |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `RESOLVED`          | The store returned a value for the reference.                                                                                         |
| `NOT_FOUND`         | The store does not hold the reference.                                                                                                |
| `ACCESS_DENIED`     | The store refused to read the reference.                                                                                              |
| `INVALID_REF`       | The reference is not valid for the store.                                                                                             |
| `UNREADABLE`        | The store holds the reference but could not read a value from it.                                                                     |
| `STORE_UNAVAILABLE` | The store could not serve the reference at all: either it is not configured, or it could not be reached and no retry attempt is left. |

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/monitoring/metrics
