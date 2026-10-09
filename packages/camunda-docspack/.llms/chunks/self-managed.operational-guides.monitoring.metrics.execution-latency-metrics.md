# Camunda components metrics — Execution latency metrics

Brokers can export optional execution latency metrics.

To enable export of execution metrics, set the `CAMUNDA_MONITORING_METRICS_ENABLEEXPORTEREXECUTIONMETRICS` environment variable to `true` in your Zeebe [configuration file](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/configuration).


## Optimize error metrics

Optimize exposes a counter metric for tracking errors by type.

| Metric name            | Type    | Description                                              | Labels                   |
| ---------------------- | ------- | -------------------------------------------------------- | ------------------------ |
| `optimize_error_total` | Counter | Number of errors occurring in Optimize, grouped by type. | `ERROR_TYPE` (see below) |

The `ERROR_TYPE` label can have the following values:

| Value                    | Description                                                                 |
| ------------------------ | --------------------------------------------------------------------------- |
| `too_many_buckets`       | Aggregation bucket limit exceeded during report evaluation.                 |
| `version_conflict`       | Document version conflict on write, for example, during imports or updates. |
| `index_not_found`        | Required index is missing, for example, in metadata queries or scrollers.   |
| `search_context_missing` | Search context expired during pagination, for example, JSON export.         |
| `nested_limit_exceeded`  | Nested document limit exceeded in complex queries.                          |
| `elasticsearch_error`    | Generic Elasticsearch error that does not match a more specific type.       |
| `opensearch_error`       | Generic OpenSearch error that does not match a more specific type.          |

Each time series uses the same metric name and differs only by the `ERROR_TYPE` label value. For example:

```
optimize_error_total{ERROR_TYPE="too_many_buckets"} 5
optimize_error_total{ERROR_TYPE="version_conflict"} 12
```

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/monitoring/metrics
