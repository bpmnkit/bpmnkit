# Restore a backup with the Restore API (RDBMS) — Restoring an RDBMS-backed cluster — point-in-time

With an RDBMS as secondary storage and [continuous backups](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/rdbms/backup#continuous-backups) enabled, restore to the closest available checkpoint before a specific ISO 8601 timestamp by providing only the `to` parameter:

```bash
curl -X POST "${ORCHESTRATION_CLUSTER_API}/restore" \
  -H 'Content-Type: application/json' \
  -d '{ "to": "2026-01-01T12:00:00Z" }'
```

  

The response returns the `changeId` of the restore, along with the planned operations. The plan drops and restores every partition of every broker, switches all brokers back to `PROCESSING`, and ends with an incarnation number update:

Example response

```json
{
  "changeId": "8",
  "plannedChanges": [
    {
      "physicalTenantId": "default",
      "operations": [
        {
          "operation": "SchemaInitializationOperation",
          "brokerId": "0"
        },
        {
          "operation": "PartitionPreRestoreOperation",
          "brokerId": "0",
          "partitionId": 1
        },
        {
          "operation": "PartitionRestoreOperation",
          "brokerId": "0",
          "partitionId": 1,
          "backupIds": [1748937221]
        },
        {
          "operation": "ModeChangeOperation",
          "brokerId": "0",
          "mode": "PROCESSING"
        },
        {
          "operation": "AwaitModeChangeOperation",
          "brokerId": "0",
          "mode": "PROCESSING"
        },
        { "operation": "UpdateIncarnationNumberOperation", "brokerId": "0" }
      ]
    }
  ]
}
```

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/rdbms/restore-api
