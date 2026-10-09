# Restore a backup with the Restore API (RDBMS) — Restoring an RDBMS-backed cluster — auto

Camunda resolves the best available restore point automatically for each partition when you omit the request body.

```bash
curl -X POST "${ORCHESTRATION_CLUSTER_API}/restore"
```

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/rdbms/restore-api
