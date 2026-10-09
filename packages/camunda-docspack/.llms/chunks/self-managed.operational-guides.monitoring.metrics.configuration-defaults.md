# Camunda components metrics — Configuration — Defaults

Camunda includes built-in support for [Prometheus](https://prometheus.io) and [OpenTelemetry](https://opentelemetry.io/). By default, the configuration only exports Prometheus metrics via [a scraping endpoint](https://docs.spring.io/spring-boot/reference/actuator/metrics.html#actuator.metrics.export.prometheus), with OpenTelemetry disabled.

#### Prometheus

The scraping endpoint for Prometheus is located under the management context (default `:9600/actuator/prometheus`).

Configure this via the following properties:

```yaml
management:
  endpoint.prometheus.access: unrestricted
  prometheus.metrics.export.enabled: true
```

To collect metrics, you must define the new scraping endpoint for Prometheus.

Add the following scraping job:

```
- job_name: camunda
  scrape_interval: 30s
  metrics_path: /actuator/prometheus
  scheme: http
  static_configs:
  - targets:
    - localhost: 9600
```

**Warning**
If you've configured your management context to use HTTPS, you must also update the `scheme` for the scraping job above. This also applies if you change the management port.

**Note**

The scraping interval is `30s` by default. This means you will get new data points in Prometheus every 30 seconds.

- This is a good default to minimize the storage requirements for Prometheus.
- To run alerts or auto-scaling based on the provided metrics, you can configure a shorter interval. As this results in more data
  being ingested, use at your own risk.

#### OpenTelemetry Protocol

Zeebe also comes built-in with support to export metrics via OpenTelemetry (using the `micrometer-registry-otlp`).

Configure this via the following properties:

```yaml
management:
  # Disable Prometheus
  promethus.metrics.export.enabled: false
  # Configure OpenTelemetry Metrics
  otlp:
    metrics:
      export:
        # Enable OTLP
        enabled: true
        # Since metrics are pushed, you will need to configure at least one endpoint
        url: "https://otlp.example.com:4318/v1/metrics"
```

For a complete list of configuration options for OTLP, refer to the [Micrometer](https://docs.micrometer.io/micrometer/reference/implementations/otlp.html#_configuring) documentation.

**Warning**
When using the OTLP exporter, check the requirements of your target endpoint, as it might require additional configuration. For example, you might need to pass a client secret and ID for authentication via the `otlp.metrics.export.headers` options, or your system might not support `cumulative` aggregation temporality and instead require `delta` (for example, Dynatrace).

**Tip**
A wide variety of existing monitoring systems also support ingesting OpenTelemetry data (for example, Dynatrace, Datadog, and so on). Camunda recommends using these instead of the specific Micrometer implementations.

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/monitoring/metrics
