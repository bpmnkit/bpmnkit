# Multi-region resilience — Comparison of multi-region resilience — Multi-Region RDBMS recovery conditions

#### Region-loss continuity

Region-loss continuity requires quorum-preserving replica placement, where no zone holds half the replicas or more, and enough surviving capacity to carry the load. In this reference layout, one zone maps to one region. A zone can also be an availability zone (AZ).

#### Recovery time

Multi-Region RDBMS removes the Zeebe recovery procedure, not the recovery window. Zeebe recovers affected partitions in seconds; other partitions continue processing. Client rerouting and database writer promotion can take minutes and depend on your configuration. Operate, Tasklist, and APIs that read secondary storage may show outdated data until the exporter catches up with process execution. See [recovery objectives](https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/multi-region-rdbms-region-loss#recovery-objectives).

#### Data loss and replay

Primary storage contains Zeebe's replicated log and runtime state. Secondary-storage RPO 0 depends on the replication-monitoring strategy, an eligible failover target, enough disk capacity to retain the unacknowledged log, and replay completion. See the strategy-specific conditions in [recovery objectives](https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/multi-region-rdbms-region-loss#recovery-objectives).

For Multi-Region RDBMS, measure the actual recovery window, including client reconnection, with a real failover test in your environment.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/resilience-tiers
