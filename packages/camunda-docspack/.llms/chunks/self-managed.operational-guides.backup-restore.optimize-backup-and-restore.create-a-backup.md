# Back up and restore Optimize independently — Create a backup

### 1. Trigger the backup

Use the following API to initiate a backup:

```bash
curl -XPOST "$OPTIMIZE_MANAGEMENT_API/actuator/backups" \
  -H 'Content-Type: application/json' \
  -d "{\"backupId\": $BACKUP_ID}"
```

A successful response confirms the backup has been scheduled:

```json
{
  "message": "Backup creation for ID 1748937221 has been scheduled. Use the GET API to monitor completion of backup process"
}
```

For the full API reference including response codes, see the [Optimize backup management API](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/optimize-backup#create-backup-api).

### 2. Wait for the backup to complete

Backup creation is asynchronous. Poll the following endpoint until the state is `COMPLETE`:

```bash
curl -s "$OPTIMIZE_MANAGEMENT_API/actuator/backups/$BACKUP_ID"
```

  Example response

```json
{
  "backupId": 1748937221,
  "failureReason": null,
  "state": "COMPLETE",
  "details": [
    {
      "snapshotName": "camunda_optimize_1748937221_<optimize-version>_part_1_of_2",
      "state": "SUCCESS",
      "startTime": "2025-06-03T07:53:54.389+0000",
      "failures": []
    },
    {
      "snapshotName": "camunda_optimize_1748937221_<optimize-version>_part_2_of_2",
      "state": "SUCCESS",
      "startTime": "2025-06-03T07:53:54.389+0000",
      "failures": []
    }
  ]
}
```

Alternatively, use a loop to wait until completion:

```bash
while [[ "$(curl -s "$OPTIMIZE_MANAGEMENT_API/actuator/backups/$BACKUP_ID" | jq -r .state)" != "COMPLETE" ]]; do
  echo "Waiting..."
  sleep 5
done
echo "Backup $BACKUP_ID complete"
```

Possible backup states:

- `COMPLETE`: The backup can be used to restore data.
- `IN_PROGRESS`: Backup creation is still in progress. Wait before using for restore.
- `FAILED`: Something went wrong. Use the [Elasticsearch](https://www.elastic.co/guide/en/elasticsearch/reference/current/get-snapshot-status-api.html) or [OpenSearch](https://opensearch.org/docs/latest/api-reference/snapshots/get-snapshot-status/) get snapshot status API for each snapshot to investigate.
- `INCOMPATIBLE`: The backup is incompatible with the current Elasticsearch/OpenSearch version.
- `INCOMPLETE`: The backup is incomplete, for example if backup creation was interrupted or individual snapshots were deleted.

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/optimize-backup-and-restore
