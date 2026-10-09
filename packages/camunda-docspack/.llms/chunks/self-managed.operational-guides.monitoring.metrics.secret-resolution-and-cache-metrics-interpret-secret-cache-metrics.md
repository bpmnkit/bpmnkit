# Camunda components metrics — Secret resolution and cache metrics — Interpret secret cache metrics

Each configured secret store uses an in-memory cache during resolution. Use these metrics to evaluate cache behavior and distinguish cache misses from store-level resolution failures.

| Metric name                      | Type    | Description                                                                                                                                                                                                                                                                                                                                   | Labels                                          |
| -------------------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| `camunda.secret.cache.result`    | Counter | Number of secret cache lookups, grouped by store and result. Use `HIT / (HIT + MISS)` to calculate the cache hit rate. Each lookup is counted once. References that result in permanent failures, such as not found, access denied, or invalid, are never cached and therefore produce a `MISS` on every lookup while they remain referenced. | `store`, `result` (see below), `physicalTenant` |
| `camunda.secret.cache.evictions` | Counter | Number of entries removed from a secret cache, grouped by store and cause.                                                                                                                                                                                                                                                                    | `store`, `cause` (see below), `physicalTenant`  |
| `camunda.secret.cache.size`      | Gauge   | Estimated number of entries currently held in a secret cache, per store. Because eviction is asynchronous, the value can briefly exceed the configured maximum. Use this metric to compare the current cache level with the configured maximum rather than as an exact count.                                                                 | `store`, `physicalTenant`                       |

The `store` label contains the ID of the secret store associated with the cache. Every cache metric also includes `physicalTenant` because the registry that publishes these metrics is scoped per tenant. Cache metrics don't include `partition` because a secret cache exists outside any partition.

#### `result` values for `camunda.secret.cache.result`

| Value  | Description                                                                                               |
| ------ | --------------------------------------------------------------------------------------------------------- |
| `HIT`  | The cache contains a value for the requested name.                                                        |
| `MISS` | The cache contains no value for the requested name, so resolution must continue against the secret store. |

#### `cause` values for `camunda.secret.cache.evictions`

| Value       | Description                                                                                                                                                                              |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SIZE`      | The cache reached its configured maximum and evicted an entry to make room for another.                                                                                                  |
| `EXPIRED`   | The entry's time-to-live expired.                                                                                                                                                        |
| `EXPLICIT`  | An entry was explicitly removed by name. In the current implementation, this occurs when a store reports a permanent failure, such as not found, access denied, or an invalid reference. |
| `COLLECTED` | The entry's key or value was garbage collected. The current cache configuration does not emit this value because it uses neither weak keys nor soft values.                              |

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/monitoring/metrics
