# Restore a backup with the Restore API — Validating a Restore API request without applying it

The Restore API accepts the `dryRun` query parameter. With `dryRun=true`, the request is validated and the resulting plan is returned, but nothing is applied to the cluster. Use this to check a backup selection before the downtime window starts:

```bash
curl -X POST "${ORCHESTRATION_CLUSTER_API}/restore?dryRun=true" \
  -H 'Content-Type: application/json' \
  -d '{ "backupIds": [1748937221] }'
```

A dry run rejects requests without a backup ID, with multiple backup IDs, or with a time range. It also checks that a completed backup exists for every partition. A request that passes the dry run is accepted as a real request as long as the cluster and the backup store do not change in between.

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/elasticsearch/restore-api
