# Restore a backup with the Restore API (RDBMS) — Restoring an RDBMS-backed cluster — 1. Switch the cluster into recovery mode

[Change the cluster mode](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/change-cluster-mode.api) to `RECOVERING`:

```bash
curl -X PATCH "${ORCHESTRATION_CLUSTER_API}/mode?mode=RECOVERING"
```

The response returns the ID of the cluster change and the operations it will apply. The plan contains one `ModeChangeOperation` and one `AwaitModeChangeOperation` per broker:

Example response

```json
{
  "changeId": "7",
  "plannedChanges": [
    {
      "physicalTenantId": "default",
      "operations": [
        { "operation": "ModeChangeOperation", "mode": "RECOVERING" },
        { "operation": "AwaitModeChangeOperation", "mode": "RECOVERING" }
      ]
    }
  ]
}
```

Wait until this change has completed before you trigger the restore. A restore request is only accepted while every broker of the cluster is in recovery mode. Requests sent earlier are rejected with `409`. Verify that all brokers are in recovery mode using either the Cluster API or the Management API.

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/rdbms/restore-api
