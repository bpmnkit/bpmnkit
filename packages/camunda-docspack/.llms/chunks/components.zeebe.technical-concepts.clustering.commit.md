# Clustering — Commit

Before a new record on a partition can be processed, it must be replicated to a quorum of brokers, and this majority of followers has to confirm the received record. When the leader received these confirmations from half or more of its followers, the leader **commits** the record. Committing ensures a record is durable, even in case of complete data loss on an individual broker. The exact semantics of committing are defined by the raft protocol.

![cluster](assets/commit.png)

A well-balanced replication ensures records can be committed even when one or more brokers will become unavailable, but the majority of brokers are still available. **Odd replication factors** [are recommended](https://docs.camunda.io/docs/next/components/zeebe/technical-concepts/partitions#replication).

Examples for common replication factors and their quorum:

| Replication factor | Description           | Quorum                                                      | Use case                                                                         |
| :----------------: | --------------------- | ----------------------------------------------------------- | -------------------------------------------------------------------------------- |
|         3          | 1 leader, 2 followers | Half or more of 2 followers is 1 follower that confirmed.   | Single region, 3 availability zones. One broker can go down without losing data. |
|         5          | 1 leader, 4 followers | Half or more of 4 followers are 2 followers that confirmed. | Allows a higher tolerance against the loss of 2 brokers.                         |

The only exception to have **even replication factors** is the [dual region setup](https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/dual-region). In this setup, an even replication factor ensures records are always replicated to both regions. In the case of losing a whole region, every new request will be denied, as no replication can get a quorum anymore. All partitions will become unhealthy, and operators start their [failover procedure](https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/dual-region-ops). No data is lost.

Using an odd replication factor in a dual region setup would favor some partitions, where the leader and the majority of followers live in the surviving region, against the partitions that have only a minority of followers survived. This may slow down to detect a region loss, as some process instances still continue while others are stuck.

Below is one example for replication and quorum used in the [dual region setup guide](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/dual-region#camunda-8-helm-chart-prerequisites):

| Replication factor | Description           | Quorum                                                      | Use case                                                                                                                                                                                                         |
| :----------------: | --------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|         4          | 1 leader, 3 followers | Half or more of 3 followers are 2 followers that confirmed. | Exception for dual-region with minimal replication, records always replicated to both regions [following the recommended setup](https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/dual-region#zeebe-cluster-configuration). |

---
Source: https://docs.camunda.io/docs/next/components/zeebe/technical-concepts/clustering
