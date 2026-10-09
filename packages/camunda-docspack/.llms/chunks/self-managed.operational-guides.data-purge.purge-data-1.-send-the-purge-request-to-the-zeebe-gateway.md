# Camunda data purge — Purge data — 1. Send the purge request to the Zeebe Gateway

To purge data from your cluster, send a `POST` request to the `/actuator/cluster/purge` endpoint:

```sh
curl -X POST 'http://localhost:9600/actuator/cluster/purge'
```

The response is a [JSON object](https://github.com/camunda/camunda/blob/main/dist/src/main/resources/api/cluster/cluster-api.yaml):

```json
{
  changeId: <changeId>
  currentTopology: [...]
  plannedChanges: [...]
  expectedTopology: [...]
}
```

- `changeId`: The ID of the changes initiated to scale the cluster. This can be used to monitor the progress of the scaling operation. The ID typically increases, so new requests have a higher ID than previous requests.
- `currentTopology`: A list of current brokers and the partition distribution.
- `plannedChanges`: A sequence of operations that has to be executed to achieve scaling.
- `expectedToplogy`: The expected list of brokers and the partition distribution once the scaling is completed. For the purge feature, the expected topology will be the same as the current topology.

  Example response

```json
{
  "changeId": 2,
  "currentTopology": [
    {
      "id": 0,
      "state": "ACTIVE",
      "version": 0,
      "lastUpdatedAt": "0000-01-01T00:00:00Z",
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
  "plannedChanges": [
    {
      "operation": "PARTITION_LEAVE",
      "brokerId": 0,
      "partitionId": 1,
      "brokers": []
    },
    {
      "operation": "DELETE_HISTORY",
      "brokers": []
    },
    {
      "operation": "PARTITION_BOOTSTRAP",
      "brokerId": 0,
      "partitionId": 1,
      "priority": 1,
      "brokers": []
    }
  ],
  "expectedTopology": [
    {
      "id": 0,
      "state": "ACTIVE",
      "version": 4,
      "lastUpdatedAt": "2025-03-04T09:50:14.979435Z",
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
  ]
}
```

The purging is done asynchronously.

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/data-purge
