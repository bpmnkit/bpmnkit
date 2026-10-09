# Cluster Metrics endpoint — Monitoring endpoint constraints

The Cluster Metrics endpoint exposes the application-level metrics produced by the Camunda version running in your cluster.

The following constraints apply:

- The Cluster Metrics endpoint uses Basic authentication only.
- Metric names and labels depend on the Camunda version running in your cluster.
- Metric and dashboard compatibility between Camunda versions is not guaranteed.

If your monitoring system does not support Prometheus scraping, you can adapt the metrics using a self-managed OpenTelemetry Collector. For more information, see [Integrate non-Prometheus monitoring systems](https://docs.camunda.io/docs/next/components/saas/monitoring/cluster-metrics-endpoint/configure-monitoring-systems-to-scrape-metrics#integrate-non-prometheus-monitoring-systems).

---
Source: https://docs.camunda.io/docs/next/components/saas/monitoring/cluster-metrics-endpoint/index
