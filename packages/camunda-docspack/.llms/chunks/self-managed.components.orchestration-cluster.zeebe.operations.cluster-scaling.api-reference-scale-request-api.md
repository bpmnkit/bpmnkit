# Cluster scaling — API reference — Scale request API

**Note**
See also the [Reconfiguration API](#reconfiguration-api).

Use this endpoint to scale a cluster up or down by changing the cluster size and redistributing partitions.

**Note**
This endpoint does not support clusters configured with the `FIXED` partitioning scheme. Scaling requests for these clusters are rejected.

#### Request

```
POST actuator/cluster/brokers/
[
  <brokerId1>, <brokerId2>,..
]
```

The input is a list of _all_ broker ids that will be in the final cluster after scaling.

On zone-aware clusters, broker ids follow the [broker id naming scheme](#broker-id-naming-scheme).

  Example request

```
curl --request POST 'http://localhost:9600/orchestration/actuator/cluster/brokers' \
-H 'Content-Type: application/json' \
-d '[0, 1, 2, 3]'
```

##### Dry run

You can also do a dry run without actually executing the scaling by specifying the request parameter `dryRun` to `true` as follows. By default, `dryRun` is set to false:

```
curl --request POST 'http://localhost:9600/orchestration/actuator/cluster/brokers?dryRun=true' \
-H 'Content-Type: application/json' \
-d '[0, 1, 2, 3]'
```

##### Replication factor

The replication factor for all partitions can be changed with the `replicationFactor` request parameter. If not specified, the replication factor remains unchanged.

The new replicas are assigned to the brokers based on the round robin partition distribution strategy.

```
curl --request POST 'http://localhost:9600/orchestration/actuator/cluster/brokers?replicationFactor=4' \
-H 'Content-Type: application/json' \
-d '[0, 1, 2, 3]'
```

##### Force remove brokers

**Caution**
This is a dangerous operation and must be used with caution. When not used correctly, split-brain scenarios or unhealthy, unrecoverable clusters may result.

Usually, changes can only be made to a cluster when all brokers are up. When some brokers are unreachable, you may want to remove them from the cluster. You can force remove a set of brokers by setting the request parameter `force` to `true`.

This operation is mainly useful for [dual-region setups](https://docs.camunda.io/docs/next/self-managed//concepts/multi-region/dual-region), and additional information can be found in the [dual-region operational procedure](https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/dual-region-ops). Any deviations from the described process can result in the cluster being unusable.

**Note**
Do not send more than one force request at a time.

The following request force removes all brokers that are _not_ provided in the request body:

```
curl --request POST 'http://localhost:9600/orchestration/actuator/cluster/brokers?force=true' \
-H 'Content-Type: application/json' \
-d '[0, 1, 2]'
```

This operation does not re-distribute the partitions that were in the removed brokers. As a result, the resulting cluster will have a reduced number of replicas for the affected partitions.

#### Response

The response is a JSON object. See detailed specs [here](https://github.com/camunda/camunda/blob/main/dist/src/main/resources/api/cluster/cluster-api.yaml):

```
{
  changeId: <changeId>
  currentTopology: [...]
  plannedChanges: [...]
  expectedTopology: [...]
}
```

- `changeId`: The ID of the changes initiated to scale the cluster. This can be used to monitor the progress of the scaling operation. The ID typically increases so new requests get a higher ID than the previous one.
- `currentTopology`: A list of current brokers and the partition distribution.
- `plannedChanges`: A sequence of operations that has to be executed to achieve scaling.
- `expectedToplogy`: The expected list of brokers and the partition distribution once the scaling is completed.

  Example response

```
{
  "changeId": 2,
  "currentTopology": [
    {
      "id": 1,
      "state": "ACTIVE",
      "version": 0,
      "lastUpdatedAt": "-999999999-01-01T00:00:00+18:00",
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
      "version": 0,
      "lastUpdatedAt": "-999999999-01-01T00:00:00+18:00",
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
      "version": 0,
      "lastUpdatedAt": "-999999999-01-01T00:00:00+18:00",
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
  "plannedChanges": [
    {
      "operation": "BROKER_ADD",
      "brokerId": 3
    },
    {
      "operation": "BROKER_ADD",
      "brokerId": 4
    },
    {
      "operation": "BROKER_ADD",
      "brokerId": 5
    },
    {
      "operation": "PARTITION_JOIN",
      "brokerId": 4,
      "partitionId": 5,
      "priority": 3
    },
    {
      "operation": "PARTITION_JOIN",
      "brokerId": 5,
      "partitionId": 5,
      "priority": 2
    },
    {
      "operation": "PARTITION_LEAVE",
      "brokerId": 1,
      "partitionId": 5
    },
    {
      "operation": "PARTITION_LEAVE",
      "brokerId": 2,
      "partitionId": 5
    },
    {
      "operation": "PARTITION_RECONFIGURE_PRIORITY",
      "brokerId": 0,
      "partitionId": 5,
      "priority": 1
    },
    {
      "operation": "PARTITION_JOIN",
      "brokerId": 3,
      "partitionId": 4,
      "priority": 3
    },
    {
      "operation": "PARTITION_JOIN",
      "brokerId": 4,
      "partitionId": 4,
      "priority": 2
    },
    {
      "operation": "PARTITION_JOIN",
      "brokerId": 5,
      "partitionId": 4,
      "priority": 1
    },
    {
      "operation": "PARTITION_LEAVE",
      "brokerId": 1,
      "partitionId": 4
    },
    {
      "operation": "PARTITION_LEAVE",
      "brokerId": 2,
      "partitionId": 4
    },
    {
      "operation": "PARTITION_LEAVE",
      "brokerId": 0,
      "partitionId": 4
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
      "partitionId": 3,
      "priority": 2
    },
    {
      "operation": "PARTITION_JOIN",
      "brokerId": 4,
      "partitionId": 3,
      "priority": 1
    },
    {
      "operation": "PARTITION_LEAVE",
      "brokerId": 1,
      "partitionId": 3
    },
    {
      "operation": "PARTITION_LEAVE",
      "brokerId": 0,
      "partitionId": 3
    },
    {
      "operation": "PARTITION_JOIN",
      "brokerId": 5,
      "partitionId": 6,
      "priority": 3
    },
    {
      "operation": "PARTITION_LEAVE",
      "brokerId": 2,
      "partitionId": 6
    },
    {
      "operation": "PARTITION_RECONFIGURE_PRIORITY",
      "brokerId": 1,
      "partitionId": 6,
      "priority": 1
    },
    {
      "operation": "PARTITION_RECONFIGURE_PRIORITY",
      "brokerId": 0,
      "partitionId": 6,
      "priority": 2
    }
  ],
  "expectedTopology": [
    {
      "id": 1,
      "state": "ACTIVE",
      "version": 7,
      "lastUpdatedAt": "2023-12-22T13:37:43.403615966Z",
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
          "id": 6,
          "state": "ACTIVE",
          "priority": 1
        }
      ]
    },
    {
      "id": 2,
      "state": "ACTIVE",
      "version": 6,
      "lastUpdatedAt": "2023-12-22T13:37:43.403558726Z",
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
        }
      ]
    },
    {
      "id": 3,
      "state": "ACTIVE",
      "version": 8,
      "lastUpdatedAt": "2023-12-22T13:37:43.401971149Z",
      "partitions": [
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
        }
      ]
    },
    {
      "id": 4,
      "state": "ACTIVE",
      "version": 8,
      "lastUpdatedAt": "2023-12-22T13:37:43.40214448Z",
      "partitions": [
        {
          "id": 3,
          "state": "ACTIVE",
          "priority": 1
        },
        {
          "id": 4,
          "state": "ACTIVE",
          "priority": 2
        },
        {
          "id": 5,
          "state": "ACTIVE",
          "priority": 3
        }
      ]
    },
    {
      "id": 5,
      "state": "ACTIVE",
      "version": 8,
      "lastUpdatedAt": "2023-12-22T13:37:43.40345971Z",
      "partitions": [
        {
          "id": 4,
          "state": "ACTIVE",
          "priority": 1
        },
        {
          "id": 5,
          "state": "ACTIVE",
          "priority": 2
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
      "version": 8,
      "lastUpdatedAt": "2023-12-22T13:37:43.403675185Z",
      "partitions": [
        {
          "id": 1,
          "state": "ACTIVE",
          "priority": 3
        },
        {
          "id": 5,
          "state": "ACTIVE",
          "priority": 1
        },
        {
          "id": 6,
          "state": "ACTIVE",
          "priority": 2
        }
      ]
    }
  ]
}
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/cluster-scaling
