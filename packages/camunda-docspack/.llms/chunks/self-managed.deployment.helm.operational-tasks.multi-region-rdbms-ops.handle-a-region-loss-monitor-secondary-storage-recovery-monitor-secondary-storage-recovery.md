# Multi-Region RDBMS operational procedure — Handle a region loss — Monitor secondary-storage recovery {#monitor-secondary-storage-recovery}

Monitor export backlog, replication lag, broker disk usage, and processing throughput throughout the recovery procedure until secondary storage has caught up. For the backlog, use the [exporting backlog](https://docs.camunda.io/docs/next/self-managed/operational-guides/configure-flow-control/configure-flow-control#exporting-backlog) dashboard panel. See [processing during secondary-storage recovery](https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/multi-region-rdbms-region-loss#processing-during-secondary-storage-recovery) for how throttling affects processing.

If retained logs exhaust the available broker disk capacity, processing can stop. See the [capacity planning prerequisites](#prerequisites) for sizing and failover-test guidance.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/multi-region-rdbms-ops
