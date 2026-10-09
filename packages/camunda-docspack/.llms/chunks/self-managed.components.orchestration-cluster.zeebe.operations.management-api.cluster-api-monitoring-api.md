# Management API — Cluster API — Monitoring API

If you just submitted an operation, use the `changeId` returned in the response with the [configuration change endpoint](#monitor-a-configuration-change) to monitor it. Use `GET actuator/cluster` to retrieve the current cluster topology. For clusters with multiple Physical Tenants, always use the configuration change endpoint instead of relying on the pending change reported by `GET actuator/cluster`.

#### Request

```
GET actuator/cluster
```

#### Response

The response is a JSON object. See the [OpenAPI spec](https://github.com/camunda/camunda/blob/main/dist/src/main/resources/api/cluster/cluster-api.yaml) for details:

```
{
  "version": <version>,
  "brokers": [
    {
      "id": <brokerId>,
      "state": "ACTIVE",
      "version": <brokerVersion>,
      "lastUpdatedAt": "<timestamp>",
      "partitions": [
        {
          "id": <partitionId>,
          "state": "ACTIVE",
          "priority": <priority>
        }
      ]
    }
  ],
  "lastChange": {
    "id": <changeId>,
    "status": "COMPLETED",
    "startedAt": "<timestamp>",
    "completedAt": "<timestamp>"
  },
  "pendingChange": {
    "id": <changeId>,
    "status": "IN_PROGRESS",
    "completed": [],
    "pending": [
      {
        "operation": "BROKER_ADD",
        "brokerId": <brokerId>
      }
    ]
  },
  "partitioning": {
    ...
  },
  "routingState": {
    ...
  }
}
```

- `version`: The version of the current cluster topology. The version is updated when the cluster is scaled up or down.
- `brokers`: A list of current brokers. Each broker includes its ID, state, version, last update timestamp, and partition distribution.
- `partitions`: A list of partitions assigned to a broker, including each partition's ID, state, and priority.
- `lastChange`: Details about the last completed scaling operation, including its ID, status, and start and completion timestamps.
- `pendingChange`: Details about the ongoing scaling operation, including completed and pending operations. Pending operations can include broker additions, partition joins, partition leaves, and partition priority reconfigurations.
- `partitioning`: The cluster's partitioning configuration.
- `routingState`: The current routing state of the cluster.

#### Monitor a configuration change

Use this endpoint to retrieve the status and operations of one configuration change. Use the `changeId` from an asynchronous operation's response to poll the change every five seconds until it reaches a terminal status.

##### Request

```
GET actuator/cluster/changes/{changeId}
```

Poll the change every five seconds until it reaches a terminal status. Set `CHANGE_ID` to the `changeId` returned by the operation:

```bash
CHANGE_ID="{changeId}"

while true; do
  curl -s "http://{zeebe-gateway}:9600/actuator/cluster/changes/${CHANGE_ID}"
  echo
  sleep 5
done
```

##### Response

The response is a JSON object with the following properties:

```json
{
  "id": <changeId>,
  "status": "IN_PROGRESS",
  "startedAt": "<timestamp>",
  "completedAt": "<timestamp>",
  "completed": [...],
  "pending": [...]
}
```

- `id`: The ID of the configuration change.
- `status`: The status of the change. Possible values are `IN_PROGRESS`, `COMPLETED`, `FAILED`, and `CANCELLED`.
- `startedAt`: The time when the change started.
- `completedAt`: The time when the change completed, if it has completed.
- `completed`: The operations completed so far.
- `pending`: The operations that are still pending.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/management-api
