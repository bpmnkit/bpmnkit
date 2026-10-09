# Restore a backup with the Restore API (RDBMS) — Restoring an RDBMS-backed cluster — backup-ids

Provide a single backup ID in `backupIds` to restore the selected backup for every partition.

```bash
curl -X POST "${ORCHESTRATION_CLUSTER_API}/restore" \
  -H 'Content-Type: application/json' \
  -d '{ "backupIds": [1748937221] }'
```

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/rdbms/restore-api
