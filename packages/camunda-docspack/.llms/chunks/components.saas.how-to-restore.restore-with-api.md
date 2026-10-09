# Restore a cluster from backup — Restore with API

You can trigger restore from the Administration API:

```http
POST /api/orgs/:orgId/clusters/:clusterId/backups/:backupId/restore
```

Expected response:

- `202 Accepted` with restore metadata

Common error responses:

- `400` for invalid backup state, legacy backup, or compatibility failure
- `404` for missing cluster or backup
- `409` when a restore is already in progress
- `501` when feature flag is disabled

---
Source: https://docs.camunda.io/docs/next/components/saas/how-to-restore
