# Region loss and recovery in Multi-Region RDBMS — Processing during secondary-storage recovery {#processing-during-secondary-storage-recovery}

Pausing the exporter stops secondary-storage updates but doesn't directly throttle processing.

If [write flow control with dynamic throttling](https://docs.camunda.io/docs/next/self-managed/operational-guides/configure-flow-control/configure-flow-control#enable-flow-control) is enabled, it adjusts the write rate based on the exporting rate and backlog. During secondary-storage recovery, a growing backlog can reduce processing throughput and increase client backpressure. Write flow control is disabled by default in Self-Managed.

For log-retention behavior, see [LSN replication monitoring](https://docs.camunda.io/docs/next/self-managed/concepts/databases/relational-db/configuration#lsn-replication-monitoring), [time-based replication monitoring](https://docs.camunda.io/docs/next/self-managed/concepts/databases/relational-db/configuration#time-based-replication-monitoring), and [delay backoff replication monitoring](https://docs.camunda.io/docs/next/self-managed/concepts/databases/relational-db/configuration#delay-backoff-replication-monitoring). The operational procedure covers [capacity planning](https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/multi-region-rdbms-ops#prerequisites) and [monitoring during recovery](https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/multi-region-rdbms-ops#monitor-secondary-storage-recovery).

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/multi-region-rdbms-region-loss
