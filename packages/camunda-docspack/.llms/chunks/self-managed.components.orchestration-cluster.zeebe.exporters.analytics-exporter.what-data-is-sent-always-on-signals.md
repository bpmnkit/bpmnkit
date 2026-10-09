# Analytics Exporter — What data is sent — Always-on signals

Together with the resource attributes attached to every record, these signals make up the environment data described on the [data collection](https://docs.camunda.io/docs/next/reference/data-collection/data-collection) page.

**`camunda.telemetry.heartbeat`**: periodic liveness signal from the partition leader.

| Attribute                                      | Type   | Description                           |
| ---------------------------------------------- | ------ | ------------------------------------- |
| `event.name`                                   | string | Always `camunda.telemetry.heartbeat`. |
| `camunda.telemetry.heartbeat.broker_version`   | string | Broker version.                       |
| `camunda.telemetry.heartbeat.exporter_version` | string | Analytics Exporter version.           |

**`camunda.metric.export_window`** (gauge metric): accompanies every metrics export, carrying the window total and log position range. Camunda uses it for deduplication and gap detection.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/exporters/analytics-exporter
