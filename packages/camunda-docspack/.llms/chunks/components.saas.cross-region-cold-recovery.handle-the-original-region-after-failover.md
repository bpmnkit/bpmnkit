# Cross-region cold recovery — Handle the original region after failover

After failover, use only the recovered cluster. The original cluster may still exist while the original region is unavailable. Even after the original region becomes reachable again, you cannot resume the original cluster or route traffic to it.

Camunda SaaS automatically attempts to suspend the original cluster when the region is reachable. This is a best-effort operation, so suspension might not happen immediately if the region or cluster remains unavailable. Console deletes the original cluster after a 30-day retention period.

**Warning: Split-brain risk**
Do not run both clusters at the same time. The original cluster may contain stale data and does not include changes made in the recovered cluster. Using it after failover can cause conflicting writes and data loss.

---
Source: https://docs.camunda.io/docs/next/components/saas/cross-region-cold-recovery
