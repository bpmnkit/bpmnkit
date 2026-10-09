# Camunda components metrics — Secret resolution and cache metrics — Metric names in Prometheus

The tables above name meters by their Micrometer meter ID. When Prometheus scrapes them, dots
become underscores, and Micrometer appends a type suffix: `_total` for a counter, the base unit for
a timer (plus `_count` and `_sum`; both timers here also declare fixed histogram buckets, so
`_bucket` is always emitted for them too), and no suffix for a gauge:

| Metric name                             | Prometheus metric name                          |
| --------------------------------------- | ----------------------------------------------- |
| `camunda.secret.resolution.duration`    | `camunda_secret_resolution_duration_seconds`    |
| `camunda.secret.resolution.cycle.delay` | `camunda_secret_resolution_cycle_delay_seconds` |
| `camunda.secret.resolution.outcome`     | `camunda_secret_resolution_outcome_total`       |
| `camunda.secret.resolution.cycle.error` | `camunda_secret_resolution_cycle_error_total`   |
| `camunda.secret.cache.result`           | `camunda_secret_cache_result_total`             |
| `camunda.secret.cache.evictions`        | `camunda_secret_cache_evictions_total`          |
| `camunda.secret.cache.size`             | `camunda_secret_cache_size`                     |

`camunda.secret.cache.size` is the one exception with no unit suffix at all, so it stays exactly
`camunda_secret_cache_size`. For example, the cache hit rate described above becomes:

```promql
camunda_secret_cache_result_total{result="HIT"} / ignoring(result) sum without (result) (camunda_secret_cache_result_total)
```

For how the broker resolves secret references before job activation, see
[Secret resolution and job activation](https://docs.camunda.io/docs/next/components/concepts/secret-resolution-and-job-activation).

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/monitoring/metrics
