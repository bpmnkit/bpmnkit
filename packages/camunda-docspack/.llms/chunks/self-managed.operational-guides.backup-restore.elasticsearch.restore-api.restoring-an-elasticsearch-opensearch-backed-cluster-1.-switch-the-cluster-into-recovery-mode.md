# Restore a backup with the Restore API — Restoring an Elasticsearch/OpenSearch-backed cluster — 1. Switch the cluster into recovery mode

[Change the cluster mode](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/change-cluster-mode.api) to `RECOVERING`:

```bash
curl -X PATCH "${ORCHESTRATION_CLUSTER_API}/mode?mode=RECOVERING"
```

Wait until the mode change has completed. Query the [cluster monitoring API](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/cluster-scaling#monitoring-api) and check that `lastChange.id` matches the returned `changeId` and that no `pendingChange` is reported:

```bash
curl "${ORCHESTRATION_CLUSTER_MANAGEMENT_API}/actuator/cluster"
```

A Restore API request is only accepted while every broker of the cluster is in recovery mode. Requests sent earlier are rejected with `409`.

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/elasticsearch/restore-api
