# Restore a cluster from backup

Restore a Camunda 8 SaaS cluster from a selected backup in Hub.

Camunda Enterprise

Use this guide to restore a SaaS cluster from an existing backup.

**Note: Related pages**

- [Backup and restore overview](https://docs.camunda.io/docs/next/components/saas/backup-restore-overview)
- [Restore scenarios](https://docs.camunda.io/docs/next/components/saas/restore-scenarios)
- [Restore troubleshooting](https://docs.camunda.io/docs/next/components/saas/restore-troubleshooting)


## Before you start

- You need organization admin permissions for the target cluster.
- The backup must be in `Completed` state.
- Backups created before the restore feature was introduced are not eligible for restore.
- Only one restore can be in progress per cluster at a time.

Restore is destructive for current cluster data and causes cluster unavailability during execution.

<!-- TODO(restore-from-backup): Add concrete user-facing downtime guidance once validated restore timing guidance is published. -->

---
Source: https://docs.camunda.io/docs/next/components/saas/how-to-restore
