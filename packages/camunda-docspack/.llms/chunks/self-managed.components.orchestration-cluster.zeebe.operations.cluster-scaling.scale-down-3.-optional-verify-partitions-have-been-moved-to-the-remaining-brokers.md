# Cluster scaling — Scale down — 3. (Optional) Verify partitions have been moved to the remaining brokers

This step is optional, but it is useful when you are testing to see if scaling worked as expected.

Run the following command to see the current status of the cluster.

If security is enabled, first obtain an access token from your identity provider and export it as `ACCESS_TOKEN`, then include it as a Bearer token in the request header.

```
curl -L 'http://localhost:8080/orchestration/v2/topology' \
-H 'Accept: application/json'
```

The response would show that the partitions are moved away from brokers `3`, `4`, and `5`:

  Example response

```json
{
   "brokers": [{
         "nodeId": 0,
         "host": "camunda-zeebe-0.camunda-zeebe.camunda",
         "port": 26501,
         "partitions": [{
               "partitionId": 1,
               "role": "leader",
               "health": "healthy"
            },
            {
               "partitionId": 2,
               "role": "follower",
               "health": "healthy"
            },
            {
               "partitionId": 3,
               "role": "follower",
               "health": "healthy"
            },
            {
               "partitionId": 4,
               "role": "leader",
               "health": "healthy"
            } {
               "partitionId": 5,
               "role": "follower",
               "health": "healthy"
            },
            {
               "partitionId": 6,
               "role": "follower",
               "health": "healthy"
            }
         ],
         "version": "8.8.0"
      },
      {
         "nodeId": 1,
         "host": "camunda-zeebe-1.camunda-zeebe.camunda",
         "port": 26501,
         "partitions": [{
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
               "partitionId": 4,
               "role": "follower",
               "health": "healthy"
            },
            {
               "partitionId": 5,
               "role": "leader",
               "health": "healthy"
            },
            {
               "partitionId": 6,
               "role": "leader",
               "health": "healthy"
            }
         ],
         "version": "8.8.0"
      },
      {
         "nodeId": 2,
         "host": "camunda-zeebe-2.camunda-zeebe",
         "port": 26501,
         "partitions": [{
               "partitionId": 1,
               "role": "follower",
               "health": "healthy"
            },
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
            },
            {
               "partitionId": 6,
               "role": "follower",
               "health": "healthy"
            }
         ],
         "version": "8.8.0"
      },
      {
         "nodeId": 3,
         "host": "camunda-zeebe-3.camunda-zeebe",
         "port": 26501,
         "partitions": [],
         "version": "8.8.0"
      },
      {
         "nodeId": 4,
         "host": "camunda-zeebe-4.camunda-zeebe",
         "port": 26501,
         "partitions": [],
         "version": "8.8.0"
      },
      {
         "nodeId": 5,
         "host": "camunda-zeebe-5.camunda-zeebe",
         "port": 26501,
         "partitions": [],
         "version": "8.8.0"
      }
   ],
   "clusterSize": 3,
   "partitionsCount": 6,
   "replicationFactor": 3,
   "gatewayVersion": "8.8.0",
   "clusterId": "clusterId"
}
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/cluster-scaling
