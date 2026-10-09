# Camunda components metrics

For distributed system monitoring, Camunda uses the [Micrometer](https://micrometer.io/) library as a facade to export metrics to [supported implementations](https://docs.micrometer.io/micrometer/reference/implementations.html) such as Prometheus, OpenTelemetry, Datadog, and Dynatrace.


## Access metrics

You can access your metrics data using your chosen monitoring implementation. Metrics data is only stored in-memory in Camunda, so it needs to be consumed and aggregated by a monitoring system.

Monitoring typically uses either a polling (default) or pushing system.

### Polling

The system (for example, Prometheus) polls an endpoint exposed by Camunda at a regular interval.

- Each request constitutes a data point for each metric.
- When working with such systems, configure the polling interval to get information quickly but without overwhelming Camunda itself (which still has to serve this data) or having to store too much data in your monitoring system itself.
- Additionally, this means exposing the Camunda endpoint to your external monitoring system.

### Pushing

For a pushing system (for example, OpenTelemetry), Camunda is configured to asynchronously push metric updates to an external endpoint at a regular interval.

- This implies that the system is accessible to Camunda via the network, so you should ensure communication is secure.
- Similarly to the polling approach, balance how fast you are pushing (and getting updates/data points) without overwhelming your external system.

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/monitoring/metrics
