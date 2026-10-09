# Camunda back up and restore

Learn how to back up and restore your Camunda 8 Self-Managed components.


## About this guide

This guide covers how to back up and restore your Camunda 8 Self-Managed components and cluster. Automate backup and restore procedures with tools that meet your organization's requirements. The procedure is influenced depending on the selection of the cluster's secondary storage.

**Tip: Disaster recovery context**
If you are using backups as the foundation of a cross-region recovery strategy, see [Cold Recovery](https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/cold-recovery) for the architecture, RTO/RPO targets, and recovery flow. Cold Recovery builds on the procedures in this guide.

### Elasticsearch / OpenSearch

Covers Zeebe, Operate, Tasklist, and Optimize. Back up and restore with no downtime using coordinated Elasticsearch or OpenSearch snapshots. All components in this backup flow must use the same backup ID to ensure consistency.

### Relational databases (RDBMS)

This is the **first phase of new backup capabilities** enabled by using an RDBMS as secondary storage. It covers Zeebe, Operate, Tasklist, and Admin. Management Identity and Optimize are not included. If you deploy Optimize alongside an RDBMS-backed Orchestration Cluster, back up Optimize independently using the [standalone Optimize backup procedure](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/optimize-backup-and-restore).

Using an RDBMS as secondary storage unlocks three new capabilities not available in the Elasticsearch / OpenSearch path:

- **Decoupled backups**: Zeebe (primary storage) and the RDBMS (secondary storage) can be backed up independently, on their own schedules. During restore, Camunda automatically aligns the two backups — there is no need to coordinate a shared backup ID or take snapshots at the same time.

- **Scheduled backups**: Because backups are decoupled, Zeebe can take backups automatically on a fixed schedule without requiring external backup API calls.

- **Point-in-time restore**: Zeebe continuously takes snapshots of its log stream. This creates a range of available restore points that you can restore to by timestamp, rather than being limited to a specific backup ID.

**Note**

- The examples in this guide are based on using the following tools: [curl](https://curl.se/), [jq](https://jqlang.org/), and [kubectl](https://kubernetes.io/de/docs/reference/kubectl/).

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/backup-and-restore
