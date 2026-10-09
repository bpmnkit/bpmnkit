# Configure zone-aware multi-region deployments — Choose a partitioning scheme

`orchestration.partitioning.scheme` selects how the chart distributes partitions and how it identifies brokers. It mirrors the engine property `camunda.cluster.partitioning.scheme`, so the values are the engine's own enum, lower-cased and hyphenated. It does not set the number of partitions, which is `orchestration.partitionCount`. It sets how the chart places the replicas of those partitions.

| Scheme        | Behavior                                                                                           |
| :------------ | :------------------------------------------------------------------------------------------------- |
| `round-robin` | Default. Brokers get numeric node IDs and the region is inferred from parity. Two regions at most. |
| `zone-aware`  | Brokers belong to named zones and are identified as `<zone>_<index>`. Any number of zones.         |

These are the two schemes the chart renders, not the whole engine enum. `camunda.cluster.partitioning.scheme` also accepts `FIXED`, which pins each partition to an explicit broker list. The chart has no value that produces it. Use it only through `orchestration.configuration`, which replaces the generated configuration outright.

Existing deployments keep their behavior. When you don't set `scheme`, the chart renders as it did before zone awareness existed.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/multi-region-zone-awareness
