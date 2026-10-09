# Restore a backup with the Restore API (RDBMS) — Validating a Restore API request without applying it

Both endpoints accept the `dryRun` query parameter. With `dryRun=true`, the request is validated and the resulting plan is returned, but nothing is applied to the cluster. Use this to check a backup selection before the downtime window starts:

```bash
curl -X POST "${ORCHESTRATION_CLUSTER_API}/restore?dryRun=true" \
  -H 'Content-Type: application/json' \
  -d '{ "backupIds": [1748937221] }'
```

A dry run of a restore covers the same validation as the real request. It rejects invalid parameter combinations, checks that a completed backup exists for every partition, and, for an RDBMS time range or an empty request body, resolves the restore point from the backup metadata. A request that passes the dry run is accepted as a real request as long as the cluster and the backup store do not change in between.

The dry run does not report which backups it resolved. The response only contains the `changeId` and the planned operations, in the same shape as a real request, so the concrete backup ID per partition is not part of it. To confirm the selection, list the available backups with the [Zeebe backup management API](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/zeebe-backup-and-restore#list-backups-api) before the restore, or pass explicit `backupIds` instead of relying on automatic resolution.

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/rdbms/restore-api
