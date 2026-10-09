# Restore a backup with the Restore API (RDBMS) — Restoring an RDBMS-backed cluster — 5. Confirm the cluster state after Restore API recovery

The cluster leaves recovery mode as part of the restore, so no further action is required. Use either the [topology API](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/get-topology.api) or the [cluster monitoring API](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/cluster-scaling#monitoring-api) to verify that the state of all partitions and brokers has returned to normal operational status after the restore.

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/rdbms/restore-api
