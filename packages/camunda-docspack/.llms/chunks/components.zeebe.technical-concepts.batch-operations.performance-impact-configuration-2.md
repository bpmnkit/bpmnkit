# Batch operations — Performance impact — Configuration (2)

#### Configuration example

```yaml
# In your broker configuration file (for example, broker.yaml)
camunda:
  processing:
    engine:
      batch-operations:
        # Scheduler
        scheduler-interval: PT1S

        # Chunking and pagination
        chunk-size: 100
        query-page-size: 10000
        query-in-clause-size: 1000

        # Retry and error handling
        query-retry-max: 0
        query-retry-initial-delay: PT1S
        query-retry-max-delay: PT60S
        query-retry-backoff-factor: 2.0
```

#### Tuning recommendations

**For large batch operations (100,000+ instances):**

- Consider reducing `chunkSize` to `500` or lower to reduce memory pressure
- Reduce `queryPageSize` if you encounter Elasticsearch/OpenSearch query timeouts

**For high-throughput environments:**

- Increase `schedulerInterval` to `PT5S` or `PT10S` to reduce scheduler overhead
- Monitor partition CPU usage and adjust accordingly

**For unreliable network connections:**

- Increase `queryRetryMax` to `5` or higher
- Increase `queryRetryMaxDelay` to `PT120S` for longer retry windows

**Warning**
The engine enforces a 4MB per-record limit. If initialization queries return very large result sets, the scheduler automatically splits them across multiple chunk records. Prefer tuning `chunkSize` and `queryPageSize` rather than increasing global message size limits.

**Tip**
For backward compatibility, the legacy configuration path `zeebe.broker.experimental.engine.batchOperations.*` is still supported. However, the unified configuration format shown above (`camunda.processing.engine.batch-operations.*`) is recommended for new deployments.

#### Exporter configuration

If you use the Camunda Exporter (Self-Managed with Elasticsearch/OpenSearch), you can control whether pending batch items are exported immediately at batch creation.

##### Camunda exporter exportItemsOnCreation

| Parameter                              | Type    | Default    | Description                                                                                                                                                                                                                       |
| -------------------------------------- | ------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `batchOperation.exportItemsOnCreation` | boolean | **`true`** | Controls whether pending batch items are exported to Elasticsearch/OpenSearch immediately when batch initialization starts.**When enabled:** Operate can display a loading spinner indicating pending batch operations. |

**When to disable:**

For very large batches (100,000+ items), enabling this option causes a temporary spike in write load due to the high volume of document insertions into the secondary database. If you experience performance issues during batch creation, consider setting this to `false`.

**Trade-offs:**

- **Enabled (`true`)**: Operate UI shows real-time progress indicators, but may cause indexing pressure
- **Disabled (`false`)**: Reduces initial indexing load, but Operate UI won't show the progress spinner. Use the REST API batch status endpoints and Grafana metrics for monitoring instead.

**Configuration example:**

```yaml
# In your broker configuration file (for example, broker.yaml)
zeebe:
  broker:
    ...
    exporters:
      camundaexporter:
        args:
          batchOperation:
            exportItemsOnCreation: false
```

---
Source: https://docs.camunda.io/docs/next/components/zeebe/technical-concepts/batch-operations
