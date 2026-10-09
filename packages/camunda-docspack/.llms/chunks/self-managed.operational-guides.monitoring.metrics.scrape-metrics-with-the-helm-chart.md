# Camunda components metrics — Scrape metrics with the Helm chart

The Camunda Helm chart can create a Prometheus Operator `ServiceMonitor` resource for each component that exposes metrics. Install the Prometheus Operator in your cluster before you set `prometheusServiceMonitor.enabled` to `true`.

### Configure the `ServiceMonitor` resources

Use the following Helm values to configure the `ServiceMonitor` resources:

| Value                                     | Default            | Description                                                                                                                                                                                                        |
| :---------------------------------------- | :----------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `prometheusServiceMonitor.enabled`        | `false`            | If `true`, the chart creates a `ServiceMonitor` resource for each deployed component listed in [Metrics endpoints by component](#metrics-endpoints-by-component).                                                  |
| `prometheusServiceMonitor.scrapeInterval` | `10s`              | The interval at which Prometheus scrapes each metrics endpoint.                                                                                                                                                    |
| `prometheusServiceMonitor.labels`         | `release: metrics` | Labels the chart adds to each `ServiceMonitor` resource. The Prometheus Operator selects `ServiceMonitor` resources by label, so set labels that match the `serviceMonitorSelector` of your `Prometheus` resource. |

The following example enables the `ServiceMonitor` resources, sets a 30-second scrape interval, and replaces the default `release` label:

```yaml
prometheusServiceMonitor:
  enabled: true
  scrapeInterval: 30s
  labels:
    release: my-prometheus
```

### Metrics endpoints by component

The following table lists the default metrics endpoint of each component that exposes metrics. The Service port is the port of the Kubernetes Service. The container port is the port the pod listens on.

| Component             | Default Service port | Default container port | Default path           | Helm value for the path                 |
| :-------------------- | :------------------- | :--------------------- | :--------------------- | :-------------------------------------- |
| Orchestration Cluster | `9600`               | `9600`                 | `/actuator/prometheus` | `orchestration.metrics.prometheus`      |
| Connectors            | `8080`               | `8080`                 | `/actuator/prometheus` | `connectors.metrics.prometheus`         |
| Management Identity   | `82`                 | `8082`                 | `/actuator/prometheus` | `identity.metrics.prometheus`           |
| Optimize              | `8092`               | `8092`                 | `/actuator/prometheus` | `optimize.metrics.prometheus`           |
| Camunda Hub REST API  | `8091`               | `8091`                 | `/metrics`             | `camundaHub.restapi.metrics.prometheus` |

The chart creates the Management Identity `ServiceMonitor` resource only if `global.identity.auth.enabled` is `true`. The chart configures no metrics port for Camunda Hub WebSockets, so no `ServiceMonitor` resource covers it.

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/monitoring/metrics
