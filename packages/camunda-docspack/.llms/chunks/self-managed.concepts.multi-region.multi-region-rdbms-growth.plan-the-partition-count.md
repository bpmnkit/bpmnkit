# Grow a Multi-Region RDBMS cluster — Plan the partition count

Adding a zone doesn't change the partition count. To raise it, use [partition scaling](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/cluster-scaling#2c-scaling-only-partitions), before or after you add the zone but not during the same change. The reference implementation sizes the partition count on the provisioned region slots, so it already fits the largest topology it can grow into.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/multi-region-rdbms-growth
