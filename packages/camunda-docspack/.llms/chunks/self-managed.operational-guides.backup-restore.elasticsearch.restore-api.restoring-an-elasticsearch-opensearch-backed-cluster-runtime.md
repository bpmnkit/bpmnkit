# Restore a backup with the Restore API — Restoring an Elasticsearch/OpenSearch-backed cluster — runtime

Use [list runtime backups](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/list-runtime-backups.api) to list available Zeebe primary storage backups. Omit `prefix` to list all backups, or use a numeric prefix followed by `*` to narrow the results.

```bash
curl "${ORCHESTRATION_CLUSTER_API}/backups/runtime"
```

To list backups matching a prefix:

```bash
curl "${ORCHESTRATION_CLUSTER_API}/backups/runtime?prefix=1748937*"
```

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/elasticsearch/restore-api
