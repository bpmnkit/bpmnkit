# Backup and restore overview — Restore model

Restore operates within the same cluster, organization, and region only. The operation is in-place and overwrites current cluster data.

When a restore starts, the cluster enters a restoring state and is unavailable until restore completes.


## Recovery objectives and timing

- RPO depends on your backup cadence and the selected backup point.
- RTO depends mainly on cluster data volume and backend restore duration.


## Backup retention policy

Camunda SaaS retains backups as count-based retention:

- Manual backups: up to five recent backups per cluster category
- Scheduled backups: up to five backups per schedule category

---
Source: https://docs.camunda.io/docs/next/components/saas/backup-restore-overview
