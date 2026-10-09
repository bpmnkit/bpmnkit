# Restore a backup with the Restore API (RDBMS) — Restoring an RDBMS-backed cluster — management-api

Query the [cluster monitoring API](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/cluster-scaling#monitoring-api) and check that `lastChange.id` matches the returned `changeId` and that no `pendingChange` is reported. Additionally, you can verify that partitions of all brokers are in `recovering` state.

```bash
curl "${ORCHESTRATION_CLUSTER_MANAGEMENT_API}/actuator/cluster"
```

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/rdbms/restore-api
