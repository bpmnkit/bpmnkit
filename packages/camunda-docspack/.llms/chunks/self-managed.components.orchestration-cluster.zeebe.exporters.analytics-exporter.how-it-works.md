# Analytics Exporter — How it works

The exporter reads records from the Zeebe log stream, keeps a fixed set of event types, converts each one into an OpenTelemetry log record, and pushes it to the configured endpoint in batches.

Three properties are worth understanding before you enable it:

- **It is designed not to slow down your brokers.** The exporter is fire-and-forget. Records are handed to a background thread and the broker acknowledges the log position immediately. If the queue fills or the endpoint is unreachable, records are dropped rather than back-pressuring the engine.
- **Delivery is best effort.** Records can be dropped if the endpoint is unreachable or a broker restarts, so the data is not guaranteed to be complete. Camunda uses the contractual signals to verify usage against your agreement, not to calculate charges: billing and overage charges are based on [usage metrics](https://docs.camunda.io/docs/next/reference/data-collection/usage-metrics). Do not rely on the exporter for audit or anything that depends on a complete record.
- **It runs on the partition leader only.** No additional high-availability setup is required.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/exporters/analytics-exporter
