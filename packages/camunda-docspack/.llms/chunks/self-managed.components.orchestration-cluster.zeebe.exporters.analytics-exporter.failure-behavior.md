# Analytics Exporter — Failure behavior

The exporter is designed so that failures do not affect broker throughput. Records may be dropped without notice. Records are lost when:

- **The in-memory queue is full**, typically because the endpoint is slow or unreachable. New records are dropped without retry.
- **A broker crashes or restarts.** The queue is not persisted.
- **The endpoint returns an error.** For transient errors, the exporter makes up to `http-max-retry-attempts` attempts per request, then drops the batch. It does not buffer to disk.

Because every record carries `camunda.cluster.id`, `camunda.partition.id`, and `camunda.log.position`, Camunda deduplicates redelivered records downstream.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/exporters/analytics-exporter
