# Clustering — Raft consensus and replication protocol

To ensure fault tolerance, Zeebe replicates data across servers using the [raft protocol](https://docs.camunda.io/docs/next/components/zeebe/technical-concepts/clustering/<https:/en.wikipedia.org/wiki/Raft_(computer_science)>).

Data is divided into partitions (shards). Each partition has a number of replicas. Among the replica set, a **leader** is determined by the Raft protocol, which takes in requests and performs all the processing. All other brokers are passive **followers**. When the leader becomes unavailable, the followers transparently select a new leader.

Each broker in the cluster may be both leader and follower at the same time for different partitions. In an ideal world, this leads to client traffic distributed evenly across all brokers.

![cluster](assets/data-distribution.png)

**Note**
There is no active load balancing across partitions. Each leader election for any partition is autonomous and independent of leader elections for other partitions.

This may lead to one node becoming the leader for all partitions. This is not a problem for fault tolerance as the guarantees of replication remain. However, this may negatively impact throughput as all traffic hits one node.

To reach a well-distributed leadership again, the [Rebalancing API](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/rebalancing) can be used in Self-Managed environments. Be aware that this is on a best-effort basis.

---
Source: https://docs.camunda.io/docs/next/components/zeebe/technical-concepts/clustering
