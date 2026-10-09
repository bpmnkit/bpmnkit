# Install Camunda for production with Helm — Operational configuration options — Scaling and performance

The following resources and configuration options are important to keep in mind regarding scaling:

- To scale the Orchestration Cluster, the following values can be modified:

  ```yaml
  orchestration:
    clusterSize: "3"
    partitionCount: "3"
    replicationFactor: "3"
  ```

  - `orchestration.clusterSize`: to the amount of brokers to configure
  - `orchestration.partitionCount`: how many [Orchestration Cluster partitions](https://docs.camunda.io/docs/next/components/zeebe/technical-concepts/partitions) are configured for each cluster
  - `orchestration.replicationFactor`: the [number of replicas](https://docs.camunda.io/docs/next/components/zeebe/technical-concepts/partitions#replication) that each partition replicates to

**Note**
  `orchestration.partitionCount` does not yet support dynamic scaling. You will not be able to modify this property. It is better to over-provision the partitions to allow potential growth as dynamic partitioning isn't possible yet.

- Ensure the resources (CPU and memory) are appropriate for your workload size. For example, the resource limits can be changed for the Orchestration Cluster by modifying the following values:

  ```yaml
  orchestration:
    resources:
      requests:
        cpu: 800m
        memory: 1200Mi
      limits:
        cpu: 2000m
        memory: 1920Mi
  ```

- It is possible to set a LimitRange on the namespace. Please refer to the [Kubernetes documentation](https://kubernetes.io/docs/tasks/administer-cluster/manage-resources/memory-default-namespace/) on setting a LimitRange.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/production/index
