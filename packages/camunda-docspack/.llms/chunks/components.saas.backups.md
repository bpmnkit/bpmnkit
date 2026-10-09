# Backups

Learn more about Backups in Camunda 8 SaaS.

Camunda Enterprise

You can use the backup feature of Camunda 8 SaaS to regularly back up the state of all of its components (Zeebe, Operate, Tasklist, and Optimize) with _zero downtime_. In case of failures that lead to data loss, you can restore a cluster from a backup.

A Camunda 8 SaaS backup consists of a data backup of Zeebe, Operate, Tasklist, Optimize, and the backup of exported Zeebe records in Elasticsearch. Since the data of these applications depend on each other, the backup must be consistent across all components. Therefore, the backup of a Camunda 8 cluster is taken as a whole.

With backups, you can capture snapshots of your data and applications while they are actively in use, resulting in zero downtime or disruption to your operations. Backups are designed specifically for disaster recovery purposes, and should not be used for archival of process data.

**Caution**
Backups are created and managed on a per-cluster basis. It is important to be aware that deleting a cluster will also delete all associated backups.

Exercise caution when deleting clusters to avoid unintended loss of backups.

> Your cluster generation needs to be greater or equal to `8.2.4` to support backups.

---
Source: https://docs.camunda.io/docs/next/components/saas/backups
