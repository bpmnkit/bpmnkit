# Fixed partitioning — Validation

Each broker performs reasonableness checks on the `FIXED` configuration provided. Namely, the configuration must uphold the following conditions:

- All partitions _must be explicitly configured_.
- All partitions configured must have valid IDs, i.e. between 1 and `zeebe.broker.cluster.partitionsCount`.
- All partitions must configure exactly the replicas count, i.e. `zeebe.broker.cluster.replicationFactor`.
- All nodes configured for a partition have a valid node ID, i.e. between 0 and `zeebe.broker.cluster.clusterSize - 1`.
- If priority election is enabled, all priorities configured for a partition are different.

The broker will fail to start if any of these conditions are not met.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/fixed-partitioning
