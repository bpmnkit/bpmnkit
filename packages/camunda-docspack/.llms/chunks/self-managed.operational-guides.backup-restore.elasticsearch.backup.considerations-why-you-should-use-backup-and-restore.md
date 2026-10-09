# Camunda backup creation (Elasticsearch/OpenSearch) — Considerations — Why you should use backup and restore

**Note**
The Camunda 8.8 release introduces breaking changes for [Operate and Tasklist](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/webapps-backup).

**Note**
If the Camunda applications cannot access Elasticsearch with cluster-level privileges, run the backup of Operate and Tasklist indices (steps 2 and 4 from the [backup](#back-up-process) procedure) as a standalone application separate from the main application.
For details, see the **standalone backup application** for [Elasticsearch](https://docs.camunda.io/docs/next/self-managed/concepts/databases/elasticsearch/elasticsearch-without-cluster-privileges#standalone-backup-application) or [OpenSearch](https://docs.camunda.io/docs/next/self-managed/concepts/databases/elasticsearch/opensearch-without-cluster-privileges#standalone-backup-application).

The Camunda 8 components like the Orchestration Cluster and Optimize store data in various formats and across multiple indices in Elasticsearch or OpenSearch. Because of this distributed and interdependent architecture, creating a consistent and reliable backup requires coordination between the components.

For example, using Elasticsearch or OpenSearch's native snapshot capabilities directly does not produce a coherent backup. This is because Operate, Tasklist, and Optimize each manage their data across multiple indices, which cannot be reliably captured together without involvement from the components that understand their structure. For this reason, backups must be initiated through each component individually, using their built-in backup functionality.

The same principle applies to Zeebe. Backups must be scheduled through Zeebe to ensure a consistent snapshot of all partition data. Simply taking a disk-level snapshot of each Zeebe Broker is not enough, as the brokers operate independently and data may not be aligned across them at the time of the snapshot. Since disk-level backups are not synchronized, this can lead to inconsistencies and invalid recovery points.

A complete backup of a Camunda 8 cluster using Elasticsearch or OpenSearch includes:

- Backups of Web Applications (Operate, Tasklist), and Optimize (triggered through their APIs).
- Backup of indices from Elasticsearch/OpenSearch containing exported Zeebe records.
- A Zeebe Broker partition backup (triggered through its API).

Because the data across these systems is interdependent, all components must be backed up as part of the same backup window. Backups taken independently at different times may not align and could result in an unreliable restore point.

**Warning**
To ensure a consistent backup, you must follow the process outlined in this guide. Deviating from it can result in undetected data loss, as there is no reliable method to verify cross-component data integrity after backup.

Following the documented procedure results in a hot backup, meaning that:

- Zeebe continues to process and export data.
- Web Applications (Operate, Tasklist), and Optimize remain fully operational during the backup process.

This ensures high availability while preserving the integrity of the data snapshot.

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/elasticsearch/backup
