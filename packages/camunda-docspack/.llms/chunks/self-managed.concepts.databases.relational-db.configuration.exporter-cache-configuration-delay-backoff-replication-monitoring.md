# RDBMS configuration overview — Exporter cache configuration — Delay backoff replication monitoring

The exporter always waits for a configured amount of time until an exported record is acknowledged to the broker as exported. This is supported for all databases.

This is a fallback strategy for databases that do not support any other direct replication monitoring — prefer [LSN replication monitoring](#lsn-replication-monitoring) whenever your database vendor supports it. Delay backoff does not
directly monitor any replication state, but instead adds a static delay to the acknowledgement of records to the broker.
This can be used as a safety net to ensure that the Zeebe logstream segments are not compacted too early, even if the database
replication is not fully in sync. This strategy requires external monitoring of the actual replication lag to ensure
that the configured delay is sufficient for the database replication to catch up in case of a failover.

**Warning**
The disk space used by the logstream is heavily influenced by the `delay` parameter: records accumulate on disk for the entire delay interval before they can be compacted. The exporter never acknowledges records before the configured delay period has elapsed, but may acknowledge them after this period has elapsed.
Size the persistent volume to hold all records produced during the delay interval. If the volume is too small, Zeebe will run out of disk space and stop processing.

```yaml
camunda.data.secondary-storage.rdbms.async-replication.enabled: true
camunda.data.secondary-storage.rdbms.async-replication.type: DELAY
```

| Property name                           | Description                                                                       | Default |
| --------------------------------------- | --------------------------------------------------------------------------------- | ------- |
| `async-replication.enabled`             | If the async replication monitoring should be enabled                             | false   |
| `async-replication.delay`               | The delay to wait until a flushed record is acknowledged to the broker            | --      |
| `async-replication.queue-capacity`      | Size of the internal queue of record positions to acknowledge                     | 8192    |
| `async-replication.queue-debounce-time` | A debounce time to not add every record to the queue but only one every X seconds | PT5S    |

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/databases/relational-db/configuration
