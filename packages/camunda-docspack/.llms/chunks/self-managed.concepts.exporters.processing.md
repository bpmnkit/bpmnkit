# Camunda exporters — Processing

At any given time, there is exactly one leader node for each partition.

When a node becomes the leader for a partition, it starts an instance of the [exporter stream processor](https://github.com/camunda/camunda/tree/main/zeebe/broker/src/main/java/io/camunda/zeebe/broker/exporter/stream/ExporterDirector.java).

This stream processor creates exactly one instance of each configured exporter and forwards every record on the stream to each exporter in sequence.

**Note**
This means there is exactly one instance of each exporter per partition. For example, if you have four partitions and four processing threads, potentially four instances of your exporter may run simultaneously.

Zeebe guarantees at-least-once delivery semantics. This means that each record will be seen by an exporter at least once, but possibly more. Duplicate delivery can occur in scenarios such as:

- Reprocessing after Raft failover (i.e., leader re-election)
- Errors occurring before the exporter updates its position

To reduce duplicates, the stream processor tracks the position of the last successfully exported record for each exporter. Because the stream is an ordered sequence of records with monotonically increasing positions, tracking the position is sufficient. Exporters set this position once they can ensure the corresponding record was exported successfully.

**Note**
Although Zeebe minimizes duplicate record delivery, exporters must be designed to handle duplicates. Export operations must be idempotent. This can be implemented within the exporter, but if exporting to an external system, it's recommended to handle deduplication there to minimize load on Zeebe. Refer to the exporter-specific documentation for implementation details.

### Error handling

If an error occurs during the `Exporter#open(Context)` phase, the stream processor fails and is restarted. This may resolve transient issues automatically. In the worst case, no exporters will run until the errors are resolved.

If an error occurs during the `Exporter#close` phase, it is logged, but other exporters are still allowed to finish their work and shut down gracefully.

If an error occurs during record processing, the same record is retried continuously until the error no longer occurs. In the worst case, a single failing exporter can block all exporters for that partition. Currently, exporters are expected to implement their own retry and error-handling strategies—though this behavior may evolve in future Zeebe versions.

### Performance impact

Each loaded exporter introduces some performance overhead. A slow exporter will slow down all other exporters for the same partition and, in extreme cases, may block a processing thread entirely.

To avoid performance bottlenecks, exporters should be kept as simple and lightweight as possible. Any heavy data transformation or enrichment should be delegated to external systems.

**Warning**
When you enable or change exporter-side filters on an existing cluster, the exported record stream can change shape.
If another component (such as Optimize) relies on a previously unfiltered sequence, this may lead to gaps or inconsistencies unless you follow the recommended upgrade flow.
For Optimize‑specific guidance and examples, see the [Camunda 8 system configuration](https://docs.camunda.io/docs/next/self-managed/components/optimize/configuration/system-configuration-platform-8) documentation.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/exporters
