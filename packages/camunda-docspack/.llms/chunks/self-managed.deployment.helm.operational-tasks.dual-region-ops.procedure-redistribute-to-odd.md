# Helm chart dual-region operational procedure — Procedure — redistribute-to-odd

```bash
curl -XPATCH 'http://localhost:9600/actuator/cluster?force=true' \
  -H 'Content-Type: application/json' \
  -d '{
    "brokers": {
      "remove": [0,2,4,6]
      }
    }'
```

  

  

Using the `force=true` parameter reduces the replication factor accordingly.

#### Verification

Port-forwarding the Zeebe Gateway via `kubectl` and printing the topology should reveal that the cluster size has decreased to 4, partitions have been redistributed over the remaining brokers, and new leaders have been elected.

```bash
kubectl --context $CLUSTER_SURVIVING port-forward services/$CAMUNDA_RELEASE_NAME-zeebe-gateway 8080:8080 -n $CAMUNDA_NAMESPACE_SURVIVING

curl -L -X GET 'http://localhost:8080/v2/topology' \
  -H 'Accept: application/json'
```

  Example output
  

```bash
{
  "brokers": [
    {
      "nodeId": 0,
      "host": "camunda-zeebe-0.camunda-zeebe.camunda-london",
      "port": 26501,
      "partitions": [
        {
          "partitionId": 1,
          "role": "leader",
          "health": "healthy"
        },
        {
          "partitionId": 6,
          "role": "leader",
          "health": "healthy"
        },
        {
          "partitionId": 7,
          "role": "follower",
          "health": "healthy"
        },
        {
          "partitionId": 8,
          "role": "follower",
          "health": "healthy"
        }
      ],
      "version": "8.8.0"
    },
    {
      "nodeId": 2,
      "host": "camunda-zeebe-1.camunda-zeebe.camunda-london",
      "port": 26501,
      "partitions": [
        {
          "partitionId": 1,
          "role": "follower",
          "health": "healthy"
        },
        {
          "partitionId": 2,
          "role": "leader",
          "health": "healthy"
        },
        {
          "partitionId": 3,
          "role": "follower",
          "health": "healthy"
        },
        {
          "partitionId": 8,
          "role": "leader",
          "health": "healthy"
        }
      ],
      "version": "8.8.0"
    },
    {
      "nodeId": 4,
      "host": "camunda-zeebe-2.camunda-zeebe.camunda-london",
      "port": 26501,
      "partitions": [
        {
          "partitionId": 2,
          "role": "follower",
          "health": "healthy"
        },
        {
          "partitionId": 3,
          "role": "leader",
          "health": "healthy"
        },
        {
          "partitionId": 4,
          "role": "follower",
          "health": "healthy"
        },
        {
          "partitionId": 5,
          "role": "follower",
          "health": "healthy"
        }
      ],
      "version": "8.8.0"
    },
    {
      "nodeId": 6,
      "host": "camunda-zeebe-3.camunda-zeebe.camunda-london",
      "port": 26501,
      "partitions": [
        {
          "partitionId": 4,
          "role": "leader",
          "health": "healthy"
        },
        {
          "partitionId": 5,
          "role": "leader",
          "health": "healthy"
        },
        {
          "partitionId": 6,
          "role": "follower",
          "health": "healthy"
        },
        {
          "partitionId": 7,
          "role": "leader",
          "health": "healthy"
        }
      ],
      "version": "8.8.0"
    }
  ],
  "clusterSize": 4,
  "partitionsCount": 8,
  "replicationFactor": 2,
  "gatewayVersion": "8.8.0"
}
```

  

You can also use the Zeebe Gateway's REST API to ensure the scaling progress has been completed. For better output readability, we use [jq](https://jqlang.github.io/jq/).

```bash
kubectl --context $CLUSTER_SURVIVING port-forward services/$CAMUNDA_RELEASE_NAME-zeebe-gateway 9600:9600 -n $CAMUNDA_NAMESPACE_SURVIVING
curl -XGET 'http://localhost:9600/actuator/cluster' | jq .lastChange
```

  Example output
  

```bash
{
  "id": 2,
  "status": "COMPLETED",
  "startedAt": "2024-08-23T11:33:08.355681311Z",
  "completedAt": "2024-08-23T11:33:09.170531963Z"
}
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/dual-region-ops
