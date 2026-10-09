# Cluster scaling — Scale up brokers — 2. Send scale request to the Zeebe Gateway

Send a POST request to the Zeebe Gateway's management endpoint to add new brokers to the cluster or redistribute partitions. See the [API reference](#api-reference) for details.

If you are running on Kubernetes and haven’t set up Ingress, port-forward to access the Zeebe Gateway on your local machine:

```
kubectl port-forward svc/camunda-zeebe-gateway 9600:9600
```

Choose the appropriate request depending on whether you are adding new partitions (see section 2.a or 2.b).

Verify partition distribution after scaling by calling the endpoints in [dry run](#dry-run) mode.

#### 2.a Scale brokers only

Run the following to send the request to the Zeebe Gateway:

```
curl -X 'PATCH' \
   'http://localhost:9600/orchestration/actuator/cluster' \
   -H 'accept: application/json' \
   -H 'Content-Type: application/json' \
   -d '{
        "brokers": {
          "add": [3,4,5]
        }
      }'
```

Here `3`, `4`, and `5` are the newly-added brokers.

**Note: Zone aware clusters**
Make sure to use the correct [broker ids](#broker-id-naming-scheme), for example `["zone-a_3", "zone-a_4", "zone-a_5"]`

Brokers from different zones can be added with a single request. Make sure to scale each zone's statefulsets with the required replica count beforehand.

#### 2.b Scaling brokers and partitions

Run the following to send the request to the Zeebe Gateway to add 3 new brokers to the cluster and set the number of partition to 6.

```
curl -X 'PATCH' \
   'http://localhost:9600/orchestration/actuator/cluster' \
   -H 'accept: application/json' \
   -H 'Content-Type: application/json' \
   -d '{
        "brokers": {
          "add": [3,4,5]
        },
        "partitions": {
          "count": 6,
          "replicationFactor": 3
        }
      }'
```

For [zone-aware cluster](#broker-id-naming-scheme) you need to change the broker ids accordingly as outlined in [section 2.a](#2a-scale-brokers-only)

**Warning: Changing replication factor in a zone-aware cluster**
You cannot change replication factor in a zone-aware cluster with this API. You need to use `PUT /actuator/cluster/partitioning/` instead.

#### 2.c Scaling only partitions

If you don't intend to add new brokers to the cluster, you can skip the `"brokers"` section:

```
curl -X 'PATCH' \
   'http://localhost:9600/orchestration/actuator/cluster' \
   -H 'accept: application/json' \
   -H 'Content-Type: application/json' \
   -d '{
        "partitions": {
          "count": 6,
          "replicationFactor": 3
        }
      }'
```

You can omit `replicationFactor` if you don't want to change it.

The response includes a `changeId`, `currentTopology`, planned changes, and the expected topology, as shown below:

```
{
  "changeId": 2,
  "currentTopology": [
    ...<truncated>
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
      "operation": "PARTITION_LEAVE",
      "brokerId": 1,
      "partitionId": 5
    },
    ...<truncated>
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
    ...<truncated>
  ]
}

```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/cluster-scaling
