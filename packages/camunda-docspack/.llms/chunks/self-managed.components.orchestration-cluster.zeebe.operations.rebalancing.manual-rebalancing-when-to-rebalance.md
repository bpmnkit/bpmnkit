# Rebalancing — Manual rebalancing — When to rebalance

The `GET /cluster/v2/rebalance` endpoint exposes a live balance status for the cluster, indicating which (if any) partitions are not currently led by the desired leader. If you are using the Zeebe Grafana dashboard, this information is also visible in the `Rebalancing` section.

**Warning**

Generally, you should rebalance when your cluster is under low load to avoid disruptions to throughput and latency, and to maximize the percentage of unbalanced partitions that are successfully transferred.

If it is necessary to rebalance while under load, you can use the available parameters to manage the trade-off between disruption and effectiveness of the rebalance: tuning `replicationLagThreshold` and `replicationTimeout` higher will increase effectiveness at the cost of greater temporary disruption, while lowering them will decrease disruption at the cost of potentially transferring fewer partitions.

As described in [Limitations](#limitations), rebalancing only works if the desired leader for each partition is not lagging too far behind the current leader. You can verify this using the `zeebe_raft_replication_lag_bytes` metric, filtering by the `partition` and `follower` labels to determine how far a replica lags behind, in bytes. This is the same value the coordinated rebalancing API checks against `replicationLagThreshold` before accepting a transfer. The closer this value is to `0`, the more likely rebalancing is to succeed. If the desired leader has a significant lag, triggering a rebalance will likely cause a temporary performance drop without achieving a better distribution.

**Note**

If you are using Prometheus, you can query the replication lag for a given partition and desired leader with:

```promql
sum(zeebe_raft_replication_lag_bytes{partition=~"$partition", follower=~"$follower"}) by (partition, follower)
```

Replace `$partition` and `$follower` by the desired combination.

The Zeebe Grafana dashboard visualizes this information in the `Raft` section (in a graph named `Follower replication lag`).

Once you have confirmed that rebalancing is likely to succeed, consider the trade-off: rebalancing can improve long-term cluster performance by achieving an optimal leader distribution, but it causes a temporary performance impact and potential unavailability window. Decide whether the long-term benefit outweighs the short-term disruption.

**Note**

If you are using Prometheus, you can query the total replication rate across all partitions with:

```promql
sum(rate(atomix_append_entries_data_rate_total[1m]))
```

This returns the cluster replication rate in bytes per second.

You can find this in the Zeebe Grafana dashboard under the `Raft` section, visualized as a graph named `Leader append data rate`.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/rebalancing
