# Restore a backup with the Restore API (RDBMS) — Restoring an RDBMS-backed cluster — range

With an RDBMS as secondary storage and [continuous backups](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/rdbms/backup#continuous-backups) enabled, restore to the closest available checkpoint within an ISO 8601 time range:

```bash
curl -X POST "${ORCHESTRATION_CLUSTER_API}/restore" \
  -H 'Content-Type: application/json' \
  -d '{ "from": "2026-01-01T10:00:00Z", "to": "2026-01-01T12:00:00Z" }'
```

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/rdbms/restore-api
