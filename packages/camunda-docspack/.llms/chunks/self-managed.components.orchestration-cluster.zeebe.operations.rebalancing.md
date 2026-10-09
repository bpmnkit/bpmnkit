# Rebalancing

Step through manual rebalancing, limitations, priority election with round-robin, fixed, and zone-aware distribution, and more.

Rebalancing re-elects partition leaders according to the configured partitioning and priority settings. In a round-robin cluster, rebalancing can distribute leadership more evenly across brokers. In a zone-aware cluster, rebalancing can move leadership toward the zone with the highest priority.

Zeebe prefers an even leader distribution in round-robin clusters when electing new leaders, but it doesn't trigger a re-election unless a leader becomes unavailable or you request a rebalance.

When a Zeebe cluster uses an uneven leader distribution, for example because it lost a leader and elected a suboptimal broker, manually requesting a rebalance can restore a more suitable distribution.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/rebalancing
