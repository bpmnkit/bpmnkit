# Cluster scaling — Scale up brokers

The following shows how to scale up a Zeebe cluster using an example of scaling from cluster size 3 to cluster size 6. The target partition count is 6.

This example assumes the cluster was deployed with the following configurations, depending on what we want to scale:

#### Initial State

- scale brokers only:
  - clusterSize 3
  - partitionCount 6
- scale brokers and partitions:
  - clusterSize 3
  - partitionCount 3

#### Target state

- clusterSize 6
- partitionCount 6

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/cluster-scaling
