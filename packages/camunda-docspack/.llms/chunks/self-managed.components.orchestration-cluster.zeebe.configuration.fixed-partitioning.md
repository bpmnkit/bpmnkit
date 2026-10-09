# Fixed partitioning

Manually configure which partitions belong to which brokers.

Starting with 1.2.0, there is a new experimental configuration option which lets you specify a fixed partitioning scheme; this means you can manually configure which partitions belong to which brokers.

The partitioning scheme is controlled via a new configuration option under `zeebe.broker.experimental.partitioning`,
more specifically `zeebe.broker.experimental.partitioning.scheme`. This option currently takes the following values:

- `ROUND_ROBIN`: When set, this applies the round-robin partition distribution, which corresponds to the distribution explained above on this page. _This is the default option, and requires no extra configuration if you want to use it._
- `FIXED`: When set, this applies a manually configured partition distribution, configured separately.

To use the `FIXED` partitioning scheme, _you must provide an exhaustive map of all partitions to a set of brokers_. This is achieved via the `zeebe.broker.experimental.partitioning.fixed` configuration option. The example below outlines a cluster of `5` brokers, `3` partitions, and a replication factor of `3`.

```yaml
partitioning:
  scheme: FIXED
  fixed:
    - partitionId: 1
      nodes:
        - nodeId: 0
        - nodeId: 2
        - nodeId: 4
    - partitionId: 2
      nodes:
        - nodeId: 1
        - nodeId: 3
        - nodeId: 4
    - partitionId: 3
      nodes:
        - nodeId: 0
        - nodeId: 2
        - nodeId: 3
```

This configuration will produce the following distribution:

|             | Node 0 | Node 1 | Node 2 | Node 3 | Node 4 |
| ----------: | :----: | :----: | :----: | :----: | :----: |
| Partition 1 |   X    |        |   X    |        |   X    |
| Partition 2 |        |   X    |        |   X    |   X    |
| Partition 3 |   X    |        |   X    |   X    |        |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/fixed-partitioning
