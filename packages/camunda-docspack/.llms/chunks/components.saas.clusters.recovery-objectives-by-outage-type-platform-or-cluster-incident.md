# SaaS clusters — Recovery objectives by outage type — Platform or cluster incident

Some incidents originate in Camunda's own platform or in a single cluster. Examples include platform configuration issues that affect network access, software defects, and cluster components in an inconsistent state.

**RTO/RPO assessment:** RTO depends on how quickly the incident is detected, escalated, diagnosed, and resolved, so Camunda doesn't set a fixed RTO. RPO is typically zero, because these incidents usually affect availability, not stored data.

---
Source: https://docs.camunda.io/docs/next/components/saas/clusters
