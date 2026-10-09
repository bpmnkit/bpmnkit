# Backups — Backup location

When you create a cluster in Camunda 8 SaaS, you must specify a region for that cluster.

You also need to specify where the backups for that cluster will be located:

- By default, the backups will be located in the same region as the cluster.
- For disaster recovery reasons, you can select a "dual-region" backup location. Backups will be automatically replicated in the secondary region to give you better protection in case the primary region experiences disruption. Dual-region backup is offered at no additional cost.


## Manual backup

Manual backups refer to the user-initiated process of creating a consistent snapshot of the state of all system components, including Zeebe, Operate, Tasklist, and Optimize. These backups are managed on a per-cluster basis and are primarily designed for disaster recovery purposes.

### Retention and rate limits

To ensure system stability, backup operations are subject to rate limits. Specifically, you can perform a backup operation every 15 minutes.
However, users can delete an existing backup to create a new one before the rate limit period ends.

The system retains the five most recent completed manual backups per cluster. Manual and scheduled backups are counted separately, so manual backups do not evict scheduled ones. See [scheduled backups](#scheduled-backups) for scheduled backup retention. Failed backup attempts do not count toward the retention count. When a new backup is successful and the retention count is reached, the oldest backup is automatically deleted.

---
Source: https://docs.camunda.io/docs/next/components/saas/backups
