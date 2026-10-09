# Restore a backup with the Restore API — Restoring an Elasticsearch/OpenSearch-backed cluster — 6. Confirm the cluster state after Restore API recovery

Check that every partition is active and healthy again using [the topology](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/get-topology.api):

```bash
curl "${ORCHESTRATION_CLUSTER_API}/topology"
```

The cluster leaves recovery mode as part of the restore, so no further action is required.

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/elasticsearch/restore-api
