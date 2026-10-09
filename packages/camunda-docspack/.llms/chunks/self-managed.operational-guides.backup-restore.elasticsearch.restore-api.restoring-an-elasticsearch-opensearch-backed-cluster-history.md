# Restore a backup with the Restore API — Restoring an Elasticsearch/OpenSearch-backed cluster — history

Use [list history backups](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/list-history-backups.api) to list available Operate, Tasklist, and Optimize history backups. This endpoint is available because Elasticsearch/OpenSearch is the secondary storage. Use `verbose=false` when snapshot-level details are not needed.

```bash
curl "${ORCHESTRATION_CLUSTER_API}/backups/history"
```

To list backups matching a prefix without snapshot-level details:

```bash
curl "${ORCHESTRATION_CLUSTER_API}/backups/history?prefix=1748937*&verbose=false"
```

  

The runtime and history listings are scoped to the Physical Tenant associated with the caller's credentials. For other tenants or all tenants, use the cluster-admin endpoints described in [restoring a cluster with multiple Physical Tenants](#restoring-a-cluster-with-multiple-physical-tenants). Ensure that the runtime and history backups you select use the same backup ID before continuing.

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/elasticsearch/restore-api
