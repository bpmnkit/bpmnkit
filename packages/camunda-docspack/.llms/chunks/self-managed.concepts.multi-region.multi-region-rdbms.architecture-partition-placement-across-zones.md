# Multi-Region RDBMS — Architecture — Partition placement across zones

Multi-Region RDBMS relies on [zone-aware clusters](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/zone-aware-clusters). Each region is one zone, and every zone declares how many brokers it holds and how many replicas of each partition live in it.

A partition survives while a majority of its **replicas** answer. Zeebe counts replicas, not zones. A zone holds as many replicas as you give it. The replication factor is the sum across the zones rather than the number of zones.

The simplest case is one replica per zone, which is what the following illustration uses. The replication factor then equals the zone count, and a partition keeps its majority while `N - 1 > N / 2`.

| Zones | Replicas per zone | Replication factor | Zone losses tolerated |
| :---- | :---------------- | :----------------- | :-------------------- |
| 2     | 1                 | 2                  | 0                     |
| 3     | 1                 | 3                  | 1                     |
| 4     | 1                 | 4                  | 1                     |
| 5     | 1                 | 5                  | 2                     |

Three zones is the smallest topology in which losing one does not stop the engine. A fourth zone at one replica each does not change that. The replication factor becomes four, and a majority is still three. A second loss leaves two. Tolerating two losses takes five replicas.

#### Choosing an asymmetric layout

Zones do not have to be equal, and making them equal is rarely what you want. A common shape places more replicas in the regions that also host a database member. It places one replica in a region that exists to break ties:

| Zone | Database member | Replicas | Losing this zone leaves |
| :--- | :-------------- | :------- | :---------------------- |
| A    | yes             | 2        | 3 of 5, majority holds  |
| B    | yes             | 2        | 3 of 5, majority holds  |
| C    | no              | 1        | 4 of 5, majority holds  |

That is `replicationFactor: 5` across three zones. The third region carries a vote without carrying a database, and it is the zone that decides a quorum when the other two disagree.

It is still a full region: the brokers there hold data and process work like any others, and the region serves clients. Only the database member is absent. This is not a lightweight arbiter or a "2.5 region" topology.

The only rule is that **no single zone may hold half the replicas or more**, or losing that zone stops the engine. A `4-1-1` layout across three zones fails it: losing the first leaves two replicas of six.

Zone awareness also assigns a Raft election priority per zone. Give the zone that hosts the database writer the highest priority. Elections then favor leaders next to the writer, which reduces inter-region round trips on export flushes. The priority biases elections but does not pin leaders. Move existing leaders with the coordinated rebalancing API (`POST /cluster/v2/rebalance`), described in [rebalancing](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/rebalancing).

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/multi-region-rdbms
