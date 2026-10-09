# Health — Partition

[Partitions](https://docs.camunda.io/docs/next/components/zeebe/technical-concepts/partitions) are distributed across multiple nodes. In a cluster, all partitions have the same replication factor, which defines on how many nodes a partition's data will live. For example, given a replication factor of three, exactly three brokers in the cluster will store the partition's data. In other words, that partition is a distributed system across those three nodes: it is made of discrete parts that exist on different nodes, separated by a network, but it is acts conceptually as a single system.

A partition can have the following health status: `HEALTHY`, `UNHEALTHY`, or `DEAD`.

A partition is considered healthy if:

- It has exactly one healthy leader in the cluster. A healthy leader is one who can:
  - Replicate to [a quorum of followers](https://docs.camunda.io/docs/next/components/zeebe/technical-concepts/clustering#raft-consensus-and-replication-protocol).
  - [Process data](https://docs.camunda.io/docs/next/components/zeebe/technical-concepts/internal-processing).
- It has at least `floor(N/2)` healthy followers in the cluster. With this amount of followers and the leader, data can be [committed](https://docs.camunda.io/docs/next/components/zeebe/technical-concepts/clustering#commit).

Anything short of this represents an unhealthy partition:

- Having multiple leaders in a cluster would prevent Zeebe from guaranteeing processing consistency.
- Having fewer than `floor(N/2)` healthy followers would prevent the leader from committing.
  - This would block processing, which would cause all requests to time out, and make the partition functionally unavailable.
- Having **no** leader would be similar: nothing would be committed, and as such, nothing processed.

A dead partition represents one that has failed in a non-recoverable way. This is exceptional and always requires human intervention. Examples of dead partitions are:

- Data corruption was detected. Since the engine is a stream processing application, we cannot skip any entries, meaning everything is stopped.
  - This can include detection of gaps or missing data.

---
Source: https://docs.camunda.io/docs/next/components/zeebe/technical-concepts/health
