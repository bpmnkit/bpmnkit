# Partitions — Partition distribution

If no other configuration is specified, partitions are distributed in a guaranteed round-robin fashion across all brokers in the cluster, considering the number of nodes, number of partitions, and the replication factor. For example, the first partition will always be hosted by the first node, plus the following nodes based on the replication factor. The second partition will be hosted on the second node and the following to fulfill the replication factor.

As an example, the following partition schemes are guaranteed:

### Example 1

#### Context

- Number of nodes: 4
- Number of partitions: 7
- Replication factor: 3

#### Partition layout

|             | Node 1 | Node 2 | Node 3 | Node 4 |
| ----------: | :----: | :----: | :----: | :----: |
| Partition 1 |   X    |   X    |   X    |        |
| Partition 2 |        |   X    |   X    |   X    |
| Partition 3 |   X    |        |   X    |   X    |
| Partition 4 |   X    |   X    |        |   X    |
| Partition 5 |   X    |   X    |   X    |        |
| Partition 6 |        |   X    |   X    |   X    |
| Partition 7 |   X    |        |   X    |   X    |

### Example 2

#### Context

- Number of nodes: 5
- Number of partitions: 3
- Replication factor: 3

#### Partition layout

|             | Node 1 | Node 2 | Node 3 | Node 4 | Node 5 |
| ----------: | :----: | :----: | :----: | :----: | :----: |
| Partition 1 |   X    |   X    |   X    |        |        |
| Partition 2 |        |   X    |   X    |   X    |        |
| Partition 3 |        |        |   X    |   X    |   X    |

---
Source: https://docs.camunda.io/docs/next/components/zeebe/technical-concepts/partitions
