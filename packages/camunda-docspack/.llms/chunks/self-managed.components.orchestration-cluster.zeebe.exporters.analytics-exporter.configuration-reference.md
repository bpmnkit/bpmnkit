# Analytics Exporter — Configuration reference

All options live under `args`. The defaults suit typical Self-Managed deployments and rarely need changing.

| Option                    | Type     | Description                                                                                                                              | Default                        |
| ------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| `endpoint`                | string   | OTLP/HTTP base URL for the analytics endpoint. The path `/v1/logs` is appended automatically.                                            | `https://telemetry.camunda.io` |
| `categories`              | list     | Signal categories to export: `contractual`, `optional`. Omitted enables both (the default); an explicit empty list (`[]`) disables both. | `[contractual, optional]`      |
| `push-interval`           | duration | Maximum time between batch pushes, as an [ISO 8601 duration](https://en.wikipedia.org/wiki/ISO_8601#Durations).                          | `PT5M`                         |
| `heartbeat-interval`      | duration | Interval between heartbeat events carrying the broker and exporter versions.                                                             | `PT10M`                        |
| `max-queue-size`          | int      | Maximum number of records buffered in memory before new records are dropped.                                                             | `2048`                         |
| `max-batch-size`          | int      | Maximum number of records per OTLP request. Must not exceed `max-queue-size`.                                                            | `512`                          |
| `sampling-rate`           | double   | Sampling rate applied to all signals, including contractual signals, between `0.0` and `1.0`.                                            | `1.0`                          |
| `http-connect-timeout`    | duration | Maximum time to establish a connection to the endpoint.                                                                                  | `PT3S`                         |
| `http-request-timeout`    | duration | Maximum time for a single export request to complete.                                                                                    | `PT3S`                         |
| `http-max-retry-attempts` | int      | Maximum number of attempts per export request, including the first attempt.                                                              | `3`                            |

**Warning**
A `sampling-rate` below `1.0` also samples contractual signals, so they undercount your actual usage. Keep the default of `1.0` unless Camunda asks you to change it.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/exporters/analytics-exporter
