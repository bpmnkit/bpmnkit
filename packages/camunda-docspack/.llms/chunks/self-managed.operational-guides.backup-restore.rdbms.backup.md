# Camunda backup creation (RDBMS)

Learn how to back up your Camunda 8 Self-Managed components when a relational database is used for secondary storage, including continuous backups, backup ranges, and monitoring backup state.

Back up your Camunda 8 Self-Managed Orchestration cluster components (Zeebe, Operate, Tasklist, and Admin) when using a relational database management system (RDBMS) as secondary storage.

**Tip**
For cross-region recovery using these RDBMS backups, see [Cold Recovery](https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/cold-recovery).

**Note**
This procedure is part of the **first phase of Decoupled Continuous Backups** and covers **Zeebe**, **Operate**, **Tasklist**, and **Admin**. It does **not** cover **Management Identity** or **Optimize**.

Optimize always stores its data in Elasticsearch or OpenSearch, independently of the Orchestration Cluster's secondary storage. If you deploy Optimize alongside an RDBMS-backed Orchestration Cluster, back up Optimize independently using the [standalone Optimize backup procedure](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/optimize-backup-and-restore). You do not need to switch the Orchestration Cluster backup to the Elasticsearch / OpenSearch path.

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/rdbms/backup
