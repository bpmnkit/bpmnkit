# Health — Cluster

The health of a cluster depends on the deployment topology. More specifically, the health of a cluster is based on the expected number of brokers, gateways, partitions, and the replication factor.

**Note**
If using the single application, or embedded gateways - that is, where brokers act as gateways - then you can ignore the gateway part.

**Note**
Starting with 8.8, we consider a `gateway` to be anything which exposes the Camunda 8 REST API, and optionally, the Camunda 8 gRPC API. While this is often the Zeebe Gateway, it can be a single application combining Operate, Tasklist, and the Zeebe Gateway.

Informally, a healthy cluster is one where:

- The expected number of [brokers and gateways](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/health) report a healthy status.
- Every partition has exactly one leader.
- There are `N-1` followers per partition (where `N` is the replication factor).

More formally, given `G` the number of expected gateways, `B` the number of expected brokers, `P` the partition count, and `R` the replication factor, we can define the health of a cluster as:

- There are `G` gateway nodes that report a healthy status via their health check.
- There are `B` broker nodes that report a healthy status via their health check.
- For every partition from `1..P`:
  - There is exactly one leader broker.
  - There are `R-1` follower brokers.

For example, given we expect 3 brokers, 3 partitions, and a replication factor of 3, a healthy cluster would show the following topology:

```
Cluster size: 3
Partitions count: 3
Replication factor: 3
Gateway version: 8.7.1
Brokers:
  Broker 0 - zeebe-0.internal.local
    Version: 8.7.1
    Partition 1 : Leader, Healthy
    Partition 2 : Follower, Healthy
    Partition 3 : Follower, Healthy
  Broker 1 - zeebe-1.internal.local
    Version: 8.7.1
    Partition 1 : Follower, Healthy
    Partition 2 : Leader, Healthy
    Partition 3 : Follower, Healthy
  Broker 2 - zeebe-2.internal.local
    Version: 8.7.1
    Partition 1 : Follower, Healthy
    Partition 2 : Follower, Healthy
    Partition 3 : Leader, Healthy
```

We can see that the topology reports the expected number of brokers, and that for every partition there is exactly one leader, two followers, and all partitions are healthy.

---
Source: https://docs.camunda.io/docs/next/components/zeebe/technical-concepts/health
