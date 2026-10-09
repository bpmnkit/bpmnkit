# Helm chart dual-region operational procedure — Procedure — step7

#### Add new brokers to the Zeebe cluster

| **Details**   | **Current state**                                                                                                                          | **Desired state**                                                                                      |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| **Camunda 8** | Running in two regions, but not yet utilizing all Zeebe brokers. Operate and Tasklist remain unavailable, Elasticsearch exporters enabled. | Fully functional Zeebe cluster setup utilizing both regions, recovering the main dual-region benefits. |

#### How to get there

1.  From the base Helm values file (`camunda-values.yml`) in `aws/kubernetes/eks-dual-region/helm-values`, extract the `clusterSize` and `replicationFactor` values. You’ll need these when re-adding the brokers to the Zeebe cluster.

2.  Port-forward the Zeebe Gateway to access the [management REST API](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/gateway#managementserver). This allows you to send a Cluster API call to add the new brokers to the Zeebe cluster using the previously extracted `clusterSize` and `replicationFactor`.

    In this example, the `clusterSize` is `8` and the `replicationFactor` is `4`. Because the uneven brokers were lost, re-add them (brokers with IDs `1, 3, 5, 7`) and set the appropriate `replicationFactor` in the request.

    ```bash
    kubectl --context $CLUSTER_SURVIVING port-forward services/$CAMUNDA_RELEASE_NAME-zeebe-gateway 9600:9600 -n $CAMUNDA_NAMESPACE_SURVIVING
    ```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/dual-region-ops
