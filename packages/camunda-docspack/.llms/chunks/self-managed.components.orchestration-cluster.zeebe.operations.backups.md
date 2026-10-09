# Backups

A guide to creating and installing Zeebe backups.

**Note**
Refer to our documentation on [backup and restore](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/backup-and-restore) to learn how to take backups without downtime. For disaster recovery context, see [Multi-region resilience tiers](https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/resilience-tiers).

As Zeebe fully manages the state of your process instances, consider taking backups of Zeebe data; this is crucial to prevent data loss, roll back application-level errors, and more.

Zeebe is fault-tolerant and replicates state internally. Backups are only necessary if you'd like to protect against the loss of entire replica sets or data corruption bugs.

State of other components, such as Operate and Tasklist, is not managed by Zeebe and must be backed up separately.

Taking backups is a manual process that is highly dependent on your infrastructure and deployment. Camunda does not provide an automated backup mechanism or tool. However, we do offer the following guidance to create and execute a successful backup.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/backups
