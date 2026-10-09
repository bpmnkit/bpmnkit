# Restore a backup (RDBMS)

Learn how to restore a Camunda 8 Self-Managed backup using a relational database, including all restore options and RDBMS-aware restore.

Restore a previous backup of your Camunda 8 Self-Managed Orchestration cluster components (Zeebe, Operate, Tasklist, and Admin) when using a relational database management system (RDBMS) as secondary storage.


## Choosing a restore approach

Restore the Zeebe partitions with one of two approaches. In both, you restore the RDBMS with your database vendor's native tools, and Camunda aligns the Zeebe restore point with it.

**Tip**
This procedure is the recovery step of [Cold Recovery](https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/cold-recovery) when restoring into a secondary region after primary-region loss.

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/rdbms/restore
