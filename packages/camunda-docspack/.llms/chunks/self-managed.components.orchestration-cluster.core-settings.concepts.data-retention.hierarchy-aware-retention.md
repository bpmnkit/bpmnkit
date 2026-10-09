# Data retention — Hierarchy-aware retention

Starting with Camunda 8.9, retention in Elasticsearch/OpenSearch secondary storage becomes hierarchy-aware for process instance data.

This means child process instances (for example, started via Call Activities) are retained as long as their root process instance is retained, instead of being cleaned up independently based on their own end time.

### Retention modes

The following retention modes determine how process instance hierarchies are retained.

When using Elasticsearch or OpenSearch, you can control how process instance hierarchies and legacy process instance hierarchies (where the root process instance was started before upgrading to 8.9) are handled by configuring the following properties:

- `camunda.data.secondary-storage.elasticsearch.history.process-instance-retention-mode`
- `camunda.data.secondary-storage.opensearch.history.process-instance-retention-mode`

See the [property reference](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties) for details and all available secondary storage settings.

The following values are available:

- `PI_HIERARCHY` (default starting with 8.9)
  - For process instance hierarchies started on 8.9 and later, the archiver treats the entire hierarchy (root + descendants + related records) as one retention unit.
  - For legacy process instance hierarchies (where the root process instance was started before upgrading to 8.9), the archiver keeps the pre-8.9 per-process-instance behavior. This also applies to any process instances started after the upgrade that belong to such legacy hierarchies.
- `PI_HIERARCHY_IGNORE_LEGACY`
  - Applies hierarchy-based retention only to process instance hierarchies started on 8.9 and later.
  - Ignores legacy process instance hierarchies (no automated per-instance archiving/deletion), intended when legacy cleanup is handled separately.
- `PI` (legacy per-process-instance behavior)
  - Preserves the pre-8.9 behavior and performs retention per process instance (as in 8.8 and earlier).
  - Child process instances can be archived/deleted independently of the root instance.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/concepts/data-retention
