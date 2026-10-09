# Rebalancing — Manual rebalancing — Rebalancing impact

**Note**

Rebalancing transfers partitions one at a time, so at most one partition is affected at any moment.

If the desired leader for a partition (the node with the highest priority) is _already_ the leader, rebalancing is a no-op for this partition. If a cluster is already perfectly balanced, a rebalancing call is a no-op.

While a partition is paused for transfer, it cannot process, export, or accept new commands, and it briefly has no leader during the handoff itself. Because partitions transfer one at a time, this affects only the partition currently being rebalanced, not the whole cluster.

This is typically observed externally as:

- Increased error rates from clients, for requests routed to the paused partition
- Increased processing latency, as service tasks on that partition complete later and process instances on it progress more slowly
- Increased exporting latency, as new data from that partition appears in Operate later than expected

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/rebalancing
