# RDBMS configuration overview — History cleanup

The RDBMS exporter provides automatic history cleanup, which works in two stages:

1. **TTL marking**  
   When a root process instance finishes, the entire process instance hierarchy (the root and any child process instances started via Call Activities), and all related data are marked for deletion once the root instance's time-to-live expires.

2. **Periodic cleanup job**  
   A scheduled cleanup job deletes marked records in batches and adjusts future intervals dynamically:

- If no records are deleted → interval doubles (up to `max-history-cleanup-interval`)
- If the batch size is fully used → interval halves (down to `min-history-cleanup-interval`)
- Otherwise → interval remains unchanged
- Additionally, cleanup execution is capped by `max-history-cleanup-usage`. The current cleanup run is not interrupted, but the next interval is adjusted.

### History cleanup configuration

RDBMS history configuration properties are defined under:

```yaml
camunda.data.secondary-storage.rdbms.history.*
```

| Property name                                  | Description                                                                                     | Default    |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------- | ---------- |
| `default-history-ttl`                          | TTL for finished process instances and related data (ISO-8601 duration)                         | P30D       |
| `default-batch-operation-ttl`                  | TTL for batch operation history                                                                 | P5D        |
| `batch-operation-cancel-process-instance-ttl`  | TTL for cancel-process-instance batch operations                                                | P5D        |
| `batch-operation-migrate-process-instance-ttl` | TTL for migrate-process-instance batch operations                                               | P5D        |
| `batch-operation-modify-process-instance-ttl`  | TTL for modify-process-instance batch operations                                                | P5D        |
| `batch-operation-resolve-incident-ttl`         | TTL for resolve-incident batch operations                                                       | P5D        |
| `historyCleanupBatchSize`                      | Maximum number of entries deleted per cleanup run                                               | 1000       |
| `min-history-cleanup-interval`                 | Minimum duration between cleanup runs (ISO-8601 duration)                                       | PT1M       |
| `max-history-cleanup-interval`                 | Maximum duration between cleanup runs (ISO-8601 duration)                                       | PT60M      |
| `max-history-cleanup-usage`                    | Maximum percentage of usage time the history cleanup is allowed to use (values between 0 and 1) | 0.25 (25%) |
| `history-cleanup-process-instance-batch-size`  | Number of process instances to be cleaned per cleanup run                                       | 500        |
| `history-cleanup-batch-size`                   | Number of rows to be cleaned per cleanup run in each table                                      | 10000      |
| `usage-metrics-ttl`                            | TTL for usage metrics                                                                           | P730D      |
| `usage-metrics-cleanup`                        | Interval between usage metrics cleanup runs (ISO-8601 duration)                                 | PT24H      |

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/databases/relational-db/configuration
