# Camunda components metrics — Grafana

### Zeebe

Zeebe comes with a pre-built dashboard, available in the repository:
[monitor/grafana/zeebe.json](https://github.com/camunda/camunda/blob/main/monitor/grafana/zeebe.json).

- [Import](https://grafana.com/docs/grafana/latest/reference/export_import/#importing-a-dashboard) the dashboard into your Grafana instance and select the correct Prometheus data source (if you have more than one).
- The dashboard displays a healthy cluster topology, general throughput metrics, handled requests, exported events per second, disk and memory usage, and more.

The following image shows an example of the Zeebe Grafana dashboard after import.

![Example Zeebe Grafana dashboard](assets/grafana-preview.png)

#### Physical Tenant filtering

Partition-scoped Zeebe metrics include a `physicalTenant` label. Most node-level metrics that are not partition-scoped do not carry this label. Per-tenant Hikari connection-pool metrics are an exception. The Zeebe dashboard supports filtering and aggregating metrics by `physicalTenant` and `partition`, and exposes `physicalTenant` as a variable selector, so you can monitor throughput, latency, and resource usage for each Physical Tenant independently.

To compare across tenants in Prometheus queries, use the `physicalTenant` label directly. For example:

```promql
sum by (physicalTenant) (zeebe_stream_processor_latency_seconds_count)
```

**Note**
Other Grafana dashboards (API panels, gateway panels) are being updated to include `physicalTenant` filtering, tracked in [camunda/camunda#56250](https://github.com/camunda/camunda/issues/56250).

### Data layer

A pre-built Grafana dashboard is available for the data layer in the repository:

[monitor/grafana/data_layer.json](https://github.com/camunda/camunda/blob/main/monitor/grafana/dashboards/data_layer.json)

To use it:

1. [Import](https://grafana.com/docs/grafana/latest/reference/export_import/#importing-a-dashboard) the dashboard into your Grafana instance.
2. When prompted, select the appropriate Prometheus data source (especially if multiple are configured).

The dashboard provides insights into key data layer components for Camunda versions `>= 8.8`, with a focus on the Camunda exporter through which all data flows.

![Example panels](assets/example-panels-data-layer.png)

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/monitoring/metrics
