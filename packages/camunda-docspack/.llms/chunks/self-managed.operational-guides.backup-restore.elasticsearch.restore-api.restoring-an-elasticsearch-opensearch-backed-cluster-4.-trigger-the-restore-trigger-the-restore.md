# Restore a backup with the Restore API — Restoring an Elasticsearch/OpenSearch-backed cluster — 4. Trigger the restore {#trigger-the-restore}

[Provide the restore parameters](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/restore.api). Camunda validates the request, resolves the backups for every partition, and acknowledges the request with `202` before the restore itself runs:

```bash
curl -X POST "${ORCHESTRATION_CLUSTER_API}/restore" \
  -H 'Content-Type: application/json' \
  -d '{ "backupIds": [1748937221] }'
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
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/elasticsearch/restore-api
