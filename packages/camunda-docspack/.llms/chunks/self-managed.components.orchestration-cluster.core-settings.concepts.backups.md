# Backups

Learn more about backups with the Orchestration Cluster.

When running an orchestration cluster with [secondary storage](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties#secondary-storage), you must configure a snapshot repository in your chosen database:

- [Elasticsearch snapshot repository](https://www.elastic.co/guide/en/elasticsearch/reference/current/snapshot-restore.html)
- [OpenSearch snapshot repository](https://docs.opensearch.org/docs/latest/tuning-your-cluster/availability-and-recovery/snapshots/snapshot-restore/)

The Orchestration Cluster is configured with the snapshot repository name to trigger database snapshots. This ensures coherent backups.

**Info**
Learn more about the backup procedure and why it must be triggered in the [backup guide](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/backup-and-restore). For disaster recovery using these backups, see [Cold Recovery](https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/cold-recovery).

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/concepts/backups
