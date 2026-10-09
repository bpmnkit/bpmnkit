# Back up and restore Optimize independently

Learn how to back up and restore Optimize independently of the Orchestration Cluster, including when the Orchestration Cluster uses RDBMS as secondary storage.

Back up and restore Optimize independently of the Orchestration Cluster.


## About this guide

Optimize always stores its data in Elasticsearch or OpenSearch, regardless of what the Orchestration Cluster uses as secondary storage. Which backup procedure to follow depends on what secondary storage the Orchestration Cluster uses:

- **Elasticsearch / OpenSearch**: Optimize shares the same ES/OS instance with the Orchestration Cluster. Backup must be **coordinated**: all components use a single shared backup ID within the same backup window. Optimize cannot be backed up independently in this configuration. Use the [Elasticsearch / OpenSearch backup guide](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/elasticsearch/backup).
- **RDBMS**: Optimize stores its data in Elasticsearch or OpenSearch independently of the Orchestration Cluster's RDBMS storage. There is no shared backup boundary to keep consistent. Optimize can be backed up on its own schedule with its own backup IDs. Use this guide.

**Warning**
When the Orchestration Cluster uses Elasticsearch or OpenSearch, backing up Optimize with a different backup ID or at a different time than the other components produces an **inconsistent restore point**: Optimize analytics data will describe a state that no longer matches the underlying process data in Operate and Zeebe.

This guide covers:

- **Optimize alongside an RDBMS-backed Orchestration Cluster**: Optimize must be backed up and restored separately from the Orchestration Cluster. The backup and restore procedures are independent.
- **Optimize as a fully standalone application**: Optimize deployed without other Camunda components.

Optimize stores its data across multiple indices in Elasticsearch or OpenSearch. A backup consists of two snapshots that must be taken through the Backup Management API to ensure consistency across indices. For example, a backup with ID `123456` produces:

```text
camunda_optimize_123456_<optimize-version>_part_1_of_2
camunda_optimize_123456_<optimize-version>_part_2_of_2
```

Backups are created asynchronously while Optimize continues running, and are restored using the standard Elasticsearch/OpenSearch snapshot restore API.

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/optimize-backup-and-restore
