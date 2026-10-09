# Multi-region resilience — Get started: choose your strategy

Choosing the right recovery strategy is determined by how critical your process automation is to your business. How much downtime and data loss can you tolerate, and what compliance obligations do you have?

First, determine how critical your workload is:

| If your business can accept the following outcome:                                 | Choose this option                            |
| :--------------------------------------------------------------------------------- | :-------------------------------------------- |
| Recovery measured in **hours**, and **minutes to hours of data loss**.             | [Cold Recovery](https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/cold-recovery)           |
| Recovery in **~15 minutes**, with **no data loss**, and audit-ready posture.       | [Dual-Region](https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/dual-region)               |
| Processing continues after a single region loss, and you can run without Optimize. | [Multi-Region RDBMS](https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/multi-region-rdbms) |

What each strategy asks of you:

- **Cold Recovery** is a manual procedure built on the [backup and restore](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/backup-and-restore) guide. There is no reference architecture. Validate the procedure in your own environment.
- **Dual-Region** includes a reference architecture and an operational runbook, with documented [Recovery Time Objective (RTO)](https://docs.camunda.io/docs/next/reference/glossary#recovery-time-objective-rto) and [Recovery Point Objective (RPO)](https://docs.camunda.io/docs/next/reference/glossary#recovery-point-objective-rpo) targets. A region loss stops processing until an operator runs the failover.
- **Multi-Region RDBMS**, with three or more regions, keeps processing through a region loss with no Zeebe operator step. The database handles secondary-storage replication. In exchange, it costs a third region of capacity. Optimize is unavailable, because Optimize requires Elasticsearch or OpenSearch instead of a relational secondary storage.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/resilience-tiers
