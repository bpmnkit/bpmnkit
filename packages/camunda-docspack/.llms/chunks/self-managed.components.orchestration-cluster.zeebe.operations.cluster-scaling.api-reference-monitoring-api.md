# Cluster scaling — API reference — Monitoring API

The current cluster topology and any ongoing scaling operations can be monitored via this endpoint.

#### Request

```
GET actuator/cluster
```

#### Response

The response is a JSON object. See detailed specs [here](https://github.com/camunda/camunda/blob/main/dist/src/main/resources/api/cluster/cluster-api.yaml):

```
{
  version: <version>
  brokers: [...]
  lastChange:  {}
  pendingChange: {}
}
```

- `version`: The version of current cluster topology. The version is updated when the cluster is scaled up or down.
- `brokers`: A list of current brokers and the partition distribution.
- `lastChange`: The details about the last completed scaling operation.
- `pendingChange`: The details about the ongoing scaling operation.

  Example response

```
{
  "version": 6,
  "brokers": [
    {
      "id": 1,
      "state": "ACTIVE",
      "version": 14,
      "lastUpdatedAt": "2023-12-22T13:43:29.718491365Z",
      "partitions": [
        {
          "id": 1,
          "state": "ACTIVE",
          "priority": 2
        },
        {
          "id": 2,
          "state": "ACTIVE",
          "priority": 3
        },
        {
          "id": 3,
          "state": "ACTIVE",
          "priority": 1
        },
        {
          "id": 4,
          "state": "ACTIVE",
          "priority": 1
        },
        {
          "id": 5,
          "state": "ACTIVE",
          "priority": 3
        },
        {
          "id": 6,
          "state": "ACTIVE",
          "priority": 2
        }
      ]
    },
    {
      "id": 2,
      "state": "ACTIVE",
      "version": 12,
      "lastUpdatedAt": "2023-12-22T13:43:30.951499449Z",
      "partitions": [
        {
          "id": 1,
          "state": "ACTIVE",
          "priority": 1
        },
        {
          "id": 2,
          "state": "ACTIVE",
          "priority": 2
        },
        {
          "id": 3,
          "state": "ACTIVE",
          "priority": 3
        },
        {
          "id": 4,
          "state": "ACTIVE",
          "priority": 2
        },
        {
          "id": 5,
          "state": "ACTIVE",
          "priority": 1
        },
        {
          "id": 6,
          "state": "ACTIVE",
          "priority": 3
        }
      ]
    },
    {
      "id": 0,
      "state": "ACTIVE",
      "version": 16,
      "lastUpdatedAt": "2023-12-22T13:43:28.482560705Z",
      "partitions": [
        {
          "id": 1,
          "state": "ACTIVE",
          "priority": 3
        },
        {
          "id": 2,
          "state": "ACTIVE",
          "priority": 1
        },
        {
          "id": 3,
          "state": "ACTIVE",
          "priority": 2
        },
        {
          "id": 4,
          "state": "ACTIVE",
          "priority": 3
        },
        {
          "id": 5,
          "state": "ACTIVE",
          "priority": 2
        },
        {
          "id": 6,
          "state": "ACTIVE",
          "priority": 1
        }
      ]
    }
  ],
  "lastChange": {
    "id": 4,
    "status": "COMPLETED",
    "startedAt": "2023-12-22T13:43:05.936882692Z",
    "completedAt": "2023-12-22T13:43:41.138424552Z"
  },
  "pendingChange": {
    "id": 6,
    "status": "IN_PROGRESS",
    "completed": [],
    "pending": [
      {
        "operation": "BROKER_ADD",
        "brokerId": 3
      },
      {
        "operation": "PARTITION_JOIN",
        "brokerId": 3,
        "partitionId": 3,
        "priority": 2
      },
      {
        "operation": "PARTITION_LEAVE",
        "brokerId": 1,
        "partitionId": 3
      },
      {
        "operation": "PARTITION_RECONFIGURE_PRIORITY",
        "brokerId": 0,
        "partitionId": 3,
        "priority": 1
      },
      {
        "operation": "PARTITION_JOIN",
        "brokerId": 3,
        "partitionId": 6,
        "priority": 2
      },
      {
        "operation": "PARTITION_LEAVE",
        "brokerId": 0,
        "partitionId": 6
      },
      {
        "operation": "PARTITION_RECONFIGURE_PRIORITY",
        "brokerId": 1,
        "partitionId": 6,
        "priority": 3
      },
      {
        "operation": "PARTITION_RECONFIGURE_PRIORITY",
        "brokerId": 2,
        "partitionId": 6,
        "priority": 1
      },
      {
        "operation": "PARTITION_RECONFIGURE_PRIORITY",
        "brokerId": 1,
        "partitionId": 5,
        "priority": 1
      },
      {
        "operation": "PARTITION_RECONFIGURE_PRIORITY",
        "brokerId": 2,
        "partitionId": 5,
        "priority": 2
      },
      {
        "operation": "PARTITION_RECONFIGURE_PRIORITY",
        "brokerId": 0,
        "partitionId": 5,
        "priority": 3
      },
      {
        "operation": "PARTITION_JOIN",
        "brokerId": 3,
        "partitionId": 2,
        "priority": 1
      },
      {
        "operation": "PARTITION_LEAVE",
        "brokerId": 0,
        "partitionId": 2
      },
      {
        "operation": "PARTITION_JOIN",
        "brokerId": 3,
        "partitionId": 4,
        "priority": 3
      },
      {
        "operation": "PARTITION_LEAVE",
        "brokerId": 2,
        "partitionId": 4
      },
      {
        "operation": "PARTITION_RECONFIGURE_PRIORITY",
        "brokerId": 0,
        "partitionId": 4,
        "priority": 2
      }
    ]
  }
}

```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/cluster-scaling
