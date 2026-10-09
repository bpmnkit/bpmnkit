# Camunda components metrics — Optimize report latency metrics

Optimize exposes a timer metric for tracking how long report evaluations take.

| Metric name                       | Type  | Description                    | Labels                     |
| --------------------------------- | ----- | ------------------------------ | -------------------------- |
| `optimize_report_reportLatency_*` | Timer | Duration of report evaluation. | `REPORT_NAME`, `REPORT_ID` |

The `REPORT_NAME` and `REPORT_ID` labels identify the evaluated report or dashboard.

Report latency metrics are controlled by the `optimize.metrics.report-latency.enabled=true` configuration property. Set the property to `false` to disable report latency metrics.

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/monitoring/metrics
