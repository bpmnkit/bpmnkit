# Configure monitoring systems to scrape metrics — Integrate non-Prometheus monitoring systems

The Cluster Metrics endpoint exposes metrics in Prometheus-compatible formats. Some monitoring systems require additional components to ingest these metrics.

In these cases, you can deploy a self-managed OpenTelemetry Collector to adapt the metrics to your monitoring system. For more information, see the [OpenTelemetry Collector documentation](https://opentelemetry.io/docs/collector/).

![Integrate non-Prometheus monitoring systems](./img/cluster-metrics-endpoint-non-prometheus-architecture.png)

Using an OpenTelemetry Collector allows you to normalize, enrich, and control the flow of metrics scraped from the Cluster Metrics endpoint. For example, you can:

- Transform metrics to match internal naming conventions
- Filter metrics to reduce noise or control ingestion costs.
- Enrich metrics with standard labels such as environment or region.
- Forward metrics to one or more monitoring backends.
- Manage scrape behavior, buffering, retries, and backpressure without changing how Camunda exposes metrics.

### Push-only monitoring systems

If your monitoring system only supports push-based ingestion, use the following approach:

1. Deploy a self-managed OpenTelemetry Collector.
1. Configure the collector to scrape the Cluster Metrics endpoint.
1. Configure the collector to push metrics to your monitoring system.

Camunda provides the metrics endpoint only. You are responsible for deploying, configuring, and operating the collector.

### Non-Prometheus metric formats

If your monitoring system requires a format other than Prometheus, use an OpenTelemetry Collector with the appropriate exporter.

The OpenTelemetry Collector supports a wide range of exporters, allowing you to forward metrics to different monitoring backends.

For more information, see [OpenTelemetry Collector exporters](https://opentelemetry.io/docs/collector/components/exporter/).

---
Source: https://docs.camunda.io/docs/next/components/saas/monitoring/cluster-metrics-endpoint/configure-monitoring-systems-to-scrape-metrics
