# Backup and restore overview

Understand what Camunda 8 SaaS backups include, how same-cluster restore works, and which limits apply.

Camunda Enterprise

Camunda 8 SaaS lets you create backups and restore a cluster from a selected backup in Camunda Hub, without opening a support ticket.

Backups are designed for disaster recovery, not long-term archival.

**Note: Related pages**

- [How to restore a cluster](https://docs.camunda.io/docs/next/components/saas/how-to-restore)
- [Restore scenarios](https://docs.camunda.io/docs/next/components/saas/restore-scenarios)
- [Restore troubleshooting](https://docs.camunda.io/docs/next/components/saas/restore-troubleshooting)
- [Backups](https://docs.camunda.io/docs/next/components/saas/backups)


## What is included in a backup

A backup captures a consistent cluster snapshot across Camunda components:

- Zeebe data
- Operate data
- Tasklist data
- Optimize data
- Exported Zeebe records stored in Elasticsearch

---
Source: https://docs.camunda.io/docs/next/components/saas/backup-restore-overview
