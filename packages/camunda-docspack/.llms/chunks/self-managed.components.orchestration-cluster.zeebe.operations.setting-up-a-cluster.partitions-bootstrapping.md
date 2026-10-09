# Setting up a Zeebe cluster — Partitions bootstrapping

On bootstrap, each node will create a partition matrix.

This matrix depends on the partitions count, replication factor and the cluster size. If you completed the configuration correctly and used the same values for `partitionsCount`, `replicationFactor`, and `clusterSize` on each node, all nodes will generate the same partition matrix.

For the current example, the matrix will look like the following:

|             | Node 0   | Node 1   | Node 2   | Node 3   | Node 4   |
| ----------- | -------- | -------- | -------- | -------- | -------- |
| Partition 0 | Leader   | Follower | Follower | -        | -        |
| Partition 1 | -        | Leader   | Follower | Follower | -        |
| Partition 2 | -        | -        | Leader   | Follower | Follower |
| Partition 3 | Follower | -        | -        | Leader   | Follower |
| Partition 4 | Follower | Follower | -        | -        | Leader   |

The matrix ensures the partitions are well distributed between the different nodes. Furthermore, it guarantees each node knows exactly which partitions it has to bootstrap and for which it will become the leader at first (this could change later, if the node needs to step down for example.)

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/setting-up-a-cluster
