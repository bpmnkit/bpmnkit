# Cluster Metrics endpoint — Before you begin

Before using the Cluster Metrics endpoint, ensure that:

- You have an external monitoring system capable of collecting prometheus metrics.
- You understand your organization’s network access and IP allowlisting requirements.


## Supported environments

- The Cluster Metrics endpoint is available for all Camunda 8 SaaS Orchestration clusters.
- The endpoint is configured per Orchestration cluster and can be enabled without requiring an upgrade or downtime.


## Metrics exposure model

The Cluster Metrics endpoint exposes metrics using a pull-based model and Prometheus-compatible format ([Prometheus](https://github.com/prometheus/docs/blob/main/docs/instrumenting/exposition_formats.md#text-based-format) and [OpenMetrics](https://github.com/prometheus/docs/blob/main/docs/instrumenting/exposition_formats.md#openmetrics-text-format) text exposition formats).

![Cluster Metrics endpoint architecture](./img/cluster-metrics-endpoint-prometheus-architecture.png)

When the Cluster Metrics endpoint is enabled for a cluster:

- Camunda exposes a cluster-scoped metrics endpoint that aggregates metrics from all Orchestration cluster components.
- Metrics are exposed in Prometheus-compatible format.
- Your monitoring system initiates metric collection by scraping the endpoint.

The Cluster Metrics endpoint does not push metrics to customer systems.

---
Source: https://docs.camunda.io/docs/next/components/saas/monitoring/cluster-metrics-endpoint/index
