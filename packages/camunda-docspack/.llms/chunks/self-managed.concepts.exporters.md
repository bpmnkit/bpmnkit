# Camunda exporters

As Zeebe processes jobs and processes, or performs internal maintenance, it generates an ordered stream of records.

As Zeebe processes jobs and workflows, or performs internal maintenance (for example, Raft failover), it produces an ordered stream of records.

**Note**
Exporters are not available in Camunda 8 Software-as-a-Service (SaaS).

![record-stream](img/exporters-stream.png)

Although clients cannot directly inspect this stream, Zeebe can load user-defined code, known as an exporter, to process each record. An exporter provides a single entry point to handle every record written to the stream.

Exporters can be used for various purposes:

- Persist historical data by pushing it to an external data warehouse
- Export records to visualization tools (for example, [zeebe-simple-monitor](https://github.com/camunda-community-hub/zeebe-simple-monitor))

Zeebe loads exporters only if they are configured in the main Zeebe YAML configuration file. Exporters are initialized when Zeebe starts.

Exporters receive only records produced after they are configured.

Camunda 8 Self-Managed ships several built-in exporters, including the [Camunda exporter](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/exporters/camunda-exporter), [Elasticsearch](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/exporters/elasticsearch-exporter), [OpenSearch](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/exporters/opensearch-exporter), and the RDBMS exporter (see [RDBMS configuration](https://docs.camunda.io/docs/next/self-managed/concepts/databases/relational-db/configuration)). Use a custom exporter only when you need a different target system or behavior.

Zeebe manages data deletion through two distinct mechanisms to reduce disk usage:

1. Internal state deletion: Zeebe automatically deletes data from its internal state (RocksDB) when it's no longer operationally required, such as when a process instance completes. This deletion is independent of exporters.

2. Log stream compaction: The event log stream (which stores all runtime and historical records) is compacted based on positions acknowledged by exporters. Each exporter acknowledges the position of the last record it has successfully processed. The stream processor also marks the position it has processed. Log compaction then occurs up to the lowest acknowledged position across all exporters and the stream processor, ensuring the log can be safely truncated without losing data that exporters haven't yet consumed.

**Note**

If no exporters are configured, Zeebe automatically deletes data when it's no longer needed. To retain historical data, you must configure an exporter to stream records to an external system.

**Warning**
A custom exporter that does not acknowledge record positions prevents log compaction and can take down the broker.

Because compaction only advances up to the **lowest** acknowledged position across all exporters, a single exporter that never advances its position pins the log indefinitely. The event log then grows without bound until it fills the disk, which stops the broker.

When implementing or activating a custom exporter:

- **Verify that record acknowledgment is done.** Confirm the exporter calls `controller.updateLastExportedRecordPosition(record.getPosition())` after it has successfully processed each record (see [Custom exporter to filter specific records](#custom-exporter-to-filter-specific-records)), and that the acknowledged position keeps advancing during normal operation.
- **Check disk (PVC) sizing before activating a new exporter.** A newly configured exporter starts from the current log position and temporarily becomes the lowest acknowledged position. Until it catches up, the log cannot be compacted past that point, so ensure the broker has enough disk headroom and that the exporter keeps pace with the record stream.

To detect this early, monitor the broker's disk usage and the exporter throughput metric (`zeebe_exporter_events_total`). See [metrics](https://docs.camunda.io/docs/next/self-managed/operational-guides/monitoring/metrics) for details.

All exporters—whether loaded from an external JAR or not—interact with the broker through the [exporter interface](https://github.com/camunda/camunda/blob/main/zeebe/exporter-api/src/main/java/io/camunda/zeebe/exporter/api/Exporter.java).

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/exporters
