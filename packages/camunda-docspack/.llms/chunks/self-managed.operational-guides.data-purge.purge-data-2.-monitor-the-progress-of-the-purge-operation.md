# Camunda data purge — Purge data — 2. Monitor the progress of the purge operation

The purge operation can take some time to complete, depending on the amount of data and the type of exporter.

You can monitor the progress of the operation by sending a `GET` request to the `/actuator/cluster` endpoint:

```sh
curl --request GET 'http://localhost:9600/actuator/cluster'
```

When the scaling has completed, the `changeId` from the previous response will be marked as completed:

```json
{
  "version": 3,
  "brokers": [
    {
      "id": 0,
      "state": "ACTIVE",
      "version": 4,
      "lastUpdatedAt": "2025-03-04T09:50:15.534347Z",
      "partitions": [
        {
          "id": 1,
          "state": "ACTIVE",
          "priority": 1,
          "config": {
            "exporting": {
              "exporters": []
            }
          }
        }
      ]
    }
  ],
  "lastChange": {
    "id": 2,
    "status": "COMPLETED",
    "startedAt": "2025-03-04T09:50:14.980254Z",
    "completedAt": "2025-03-04T09:50:15.534398Z"
  }
}
```

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/data-purge
