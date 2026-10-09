# Cluster scaling — Scale up brokers — 3. Query the Zeebe Gateway to monitor progress of scaling

The scaling operation can take a while because data needs to be moved to the newly-added brokers. Therefore, you have to monitor the status by querying Zeebe and sending the following GET request to the Zeebe Gateway:

```
curl --request GET 'http://localhost:9600/orchestration/actuator/cluster'
```

When the scaling has completed, the `changeId` from the previous response will be marked as completed:

```
{
  "version": 3,
  "brokers": [
    ...
  ],
  "lastChange": {
    "id": 2,
    "status": "COMPLETED",
    "startedAt": "2023-12-22T13:37:43.405094261Z",
    "completedAt": "2023-12-22T13:40:06.90159187Z"
  }
}
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/cluster-scaling
