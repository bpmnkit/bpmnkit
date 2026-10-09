# Multi-region resilience — Comparison of multi-region resilience (2)

With three or more regions, Multi-Region RDBMS removes the recovery procedure, not the recovery window. A published RTO figure would not be meaningful here. Most of the elapsed time comes from your client timeouts, your traffic routing, and your database failover, not from the architecture. Measure the actual recovery window, including client reconnection, with a real failover test in your environment.

Multi-Region RDBMS reaches RPO 0 for engine state, and for secondary storage only under the replication conditions you configure. See [recovery objectives](https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/multi-region-rdbms-region-loss#recovery-objectives).

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/resilience-tiers
