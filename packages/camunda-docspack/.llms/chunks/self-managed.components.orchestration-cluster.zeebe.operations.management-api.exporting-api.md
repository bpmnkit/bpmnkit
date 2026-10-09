# Management API — Exporting API

Use the Exporting API for the followings:

- As a debugging tool.
- When taking a backup of Camunda 8 (see [backup and restore](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/backup-and-restore)).

**Warning**
This endpoint always returns HTTP `200`. Check the `status` field in the response body to determine whether the operation succeeded: `204` indicates success and `500` indicates failure.

If the request fails, verify that all brokers are running and retry.

The operation requires a complete cluster topology. If a broker is unavailable, the request fails entirely — no partitions are paused or resumed. Retry when all brokers are available.

**Success response:**

```json
{
  "body": null,
  "status": 204,
  "contentType": null
}
```

**Failure response:**

```json
{
  "body": {
    "message": "Expected 3 members of partition 1 but found 2, current topology: ..."
  },
  "status": 500,
  "contentType": null
}
```

### Pause exports

To pause exporting on all partitions, send the following request to the gateway's management endpoint.

```
POST actuator/exporting/pause
```

When all partitions pause exporting, the response contains `"status": 204`. If the request fails, some partitions may have paused exporting. Therefore, it is important to either retry until success or revert the partial pause by resuming exporting.

### Resume exports

After exporting is paused, it must eventually be resumed. Otherwise, the cluster could become unavailable. To resume exporting, send the following request to the gateway's management endpoint:

```
POST actuator/exporting/resume
```

When all partitions have resumed exporting, the response contains `"status": 204`. If the request fails, only some partitions may have resumed exporting. Therefore, it is important to retry until successful.

### Soft pause exports

The soft pause feature can be used when you want to continue exporting records, but don't want to delete those records (log compaction) from Zeebe. This is particularly useful during hot backups. Learn more about [using this feature for hot backups](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/backup-and-restore).

```
POST actuator/exporting/pause?soft=true
```

When all partitions soft pause exporting, the response contains `"status": 204`. If the request fails, some partitions may have soft paused exporting. Therefore, either retry until success or revert the partial soft pause by resuming the export.

**Warning**
Broker disk usage grows throughout the soft-pause window because log compaction is blocked. Keep the window as short as possible and resume exporting promptly once the backup completes.

Avoid restarting brokers while soft pause is active. After a restart, exporters resume from the last persisted position (before soft-pausing started) and re-export all records from the soft-pause window. Recovery time is proportional to how long soft pause was active.

For a real-world example of disk growth and recovery, see the [full-disk chaos day report](https://camunda.github.io/zeebe-chaos/2026/06/18/Full-disk-due-to-soft-pause-exporters).

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/management-api
