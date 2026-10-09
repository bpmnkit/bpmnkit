# RDBMS configuration overview — Exporter configuration

The RDBMS exporter is automatically enabled when:

```yaml
camunda.data.secondary-storage.type: rdbms
```

The following additional configuration options are available under `camunda.data.secondary-storage.rdbms`:

### Exporter performance settings

| Property name                                     | Description                                                                                       | Default |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------- |
| `flush-interval`                                  | Maximum time a record waits in the flush queue before being flushed and committed to the database | PT0.5S  |
| `max-queue-size`                                  | Maximum number of records allowed in the flush queue before a forced flush                        | 1000    |
| `queue-memory-limit`                              | Maximum memory usage (MB) allowed for queued records before a forced flush                        | 20      |
| `export-batch-operation-items-on-creation`        | If due items should be exported at the beginning of a batch operation or only after processing    | true    |
| `insert-batching.max-audit-log-insert-batch-size` | Maximum number of rows to batch into a single insert statement into the AUDIT_LOG table           | 50      |
| `insert-batching.max-flow-node-insert-batch-size` | Maximum number of rows to batch into a single insert statement into the FLOW_NODE table           | 25      |
| `insert-batching.max-job-insert-batch-size`       | Maximum number of rows to batch into a single insert statement into the JOB table                 | 25      |
| `insert-batching.max-variable-insert-batch-size`  | Maximum number of rows to batch into a single insert statement into the VARIABLE table            | 25      |

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/databases/relational-db/configuration
