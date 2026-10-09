# Restore a backup with the Restore API (RDBMS) — Restoring an RDBMS-backed cluster — cluster-api

You can use the [topology API](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/get-topology.api) to verify the state for all partitions and brokers:

```bash
curl "${ORCHESTRATION_CLUSTER_API}/topology"
```

The response shows the current state of all brokers and partitions. In recovery mode, every partition should have the state `recovering`.

Example response

```json
{
  "brokers": [
    {
      "nodeId": 0,
      "brokerId": "0",
      "host": "192.168.1.51",
      "port": 26501,
      "partitions": [
        {
          "partitionId": 1,
          "role": "inactive",
          "health": "healthy",
          "state": "recovering"
        },
        {
          "partitionId": 2,
          "role": "inactive",
          "health": "healthy",
          "state": "recovering"
        }
      ]
    }
  ]
}
```

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/rdbms/restore-api
