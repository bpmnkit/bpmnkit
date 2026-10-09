# Cluster scaling — Scale down — 2. Query the Zeebe Gateway to monitor progress of scaling

```
curl --request GET 'http://localhost:9600/orchestration/actuator/cluster'
```

When the scaling has completed, the changeId from the previous response will be marked as completed:

```
{
  "version": 5,
  "brokers": [
    ...<truncated>
  ],
  "lastChange": {
    "id": 4,
    "status": "COMPLETED",
    "startedAt": "2023-12-22T13:43:05.936882692Z",
    "completedAt": "2023-12-22T13:43:41.138424552Z"
  }
}
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/cluster-scaling
