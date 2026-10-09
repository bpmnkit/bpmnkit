# Helm chart dual-region operational procedure — Procedure — step1

#### Remove lost brokers from Zeebe cluster in the surviving region

| **Current state**                                                                                                                                                                                                                                                                                                                                                                                                                     | **Desired state**                                                                                                                                                                                     |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| You have ensured that you fully lost a region and want to start the temporary recovery.   One of the regions is lost, meaning Zeebe:  - No data has been lost thanks to Zeebe data replication.  - Is unable to process new requests due to losing the quorum  - Stops exporting new data to Elasticsearch in the lost region  - Stops exporting new data to Elasticsearch in the survived region | The lost brokers have been removed from the Zeebe cluster.   Continued processing is enabled, and new brokers in the failback procedure will only join the cluster with our intervention. |

#### Procedure

Start with creating a port-forward to the `Zeebe Gateway` in the surviving region to the local host so you can interact with the Zeebe Gateway.

The following alternatives to port-forwarding are possible:

- If the Zeebe Gateway is exposed to the outside of the Kubernetes cluster, you can skip port-forwarding and use the URL directly
- [`exec`](https://kubernetes.io/docs/reference/kubectl/generated/kubectl_exec/) into an existing pod (such as Elasticsearch), and execute `curl` commands from inside of the pod
- [`run`](https://kubernetes.io/docs/reference/kubectl/generated/kubectl_run/) an Ubuntu pod in the cluster to execute `curl` commands from inside the Kubernetes cluster

In our example, we went with port-forwarding to a localhost, but other alternatives can also be used.

1. Use the [Orchestration Cluster REST API](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/orchestration-cluster-api-rest-overview) to retrieve the list of the remaining brokers

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
         "role": "follower",
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
         "role": "follower",
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
"clusterSize": 8,
"partitionsCount": 8,
"replicationFactor": 4,
"gatewayVersion": "8.8.0"
}
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/dual-region-ops
